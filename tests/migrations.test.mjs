// Migrations must be safe to run against the live database, which was created before migrations
// existed. Both directions are covered: a database built from nothing, and one that already
// holds production-shaped data.
import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import {
  resetState, applyMigrations, sql, API_DIR, DB,
  PRE_MIGRATION_SCHEMA, LEGACY_ROWS,
} from './helpers/d1.mjs'

const columns = (dir, table) =>
  sql(dir, `PRAGMA table_info(${table})`).map(c => c.name)

const tables = dir =>
  sql(dir, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").map(t => t.name)

describe('migrations on a fresh database', () => {
  let dir
  before(() => {
    dir = resetState('migrate-fresh')
    applyMigrations(dir)
  }, { timeout: 120_000 })

  test('creates every table', () => {
    const found = tables(dir)
    for (const t of ['users', 'scores', 'score_history']) assert.ok(found.includes(t), `missing ${t}`)
  })

  test('users has the auth and timestamp columns', () => {
    const cols = columns(dir, 'users')
    for (const c of ['id', 'display_name', 'created_at', 'updated_at', 'name_updated_at', 'secret_hash']) {
      assert.ok(cols.includes(c), `users.${c} missing`)
    }
  })

  test('scores and score_history both carry created_at and updated_at', () => {
    for (const t of ['scores', 'score_history']) {
      const cols = columns(dir, t)
      assert.ok(cols.includes('created_at'), `${t}.created_at missing`)
      assert.ok(cols.includes('updated_at'), `${t}.updated_at missing`)
    }
  })

  test('starts empty', () => {
    assert.equal(sql(dir, 'SELECT COUNT(*) n FROM users')[0].n, 0)
  })
})

describe('migrations on a database shaped like production', () => {
  let dir
  before(() => {
    dir = resetState('migrate-legacy')
    // Build the old schema and seed it, exactly as production stood before migrations.
    const run = command => execFileSync('npx',
      ['wrangler', 'd1', 'execute', DB, '--local', '--command', command, '--persist-to', dir],
      { cwd: API_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    run(PRE_MIGRATION_SCHEMA)
    run(LEGACY_ROWS)
    applyMigrations(dir)
  }, { timeout: 180_000 })

  test('no rows are lost', () => {
    assert.equal(sql(dir, 'SELECT COUNT(*) n FROM users')[0].n, 2)
    assert.equal(sql(dir, 'SELECT COUNT(*) n FROM scores')[0].n, 3)
  })

  test('timestamps are backfilled, never left NULL', () => {
    const bad = sql(dir, `
      SELECT
        (SELECT COUNT(*) FROM users  WHERE created_at IS NULL OR updated_at IS NULL) users,
        (SELECT COUNT(*) FROM scores WHERE created_at IS NULL OR updated_at IS NULL) scores,
        (SELECT COUNT(*) FROM score_history WHERE created_at IS NULL OR updated_at IS NULL) history`)[0]
    assert.deepEqual(bad, { users: 0, scores: 0, history: 0 })
  })

  test('backfilled timestamps come from the row, not from migration time', () => {
    const rows = sql(dir, 'SELECT created_at, updated_at FROM users')
    for (const r of rows) {
      assert.equal(r.updated_at, r.created_at)
      assert.ok(r.created_at < 1760000000000, 'should keep the original creation time')
    }
  })

  test('history is seeded from the bests already recorded', () => {
    assert.equal(sql(dir, 'SELECT COUNT(*) n FROM score_history')[0].n, 3)
    const matched = sql(dir, `
      SELECT COUNT(*) n FROM scores s
      JOIN score_history h ON h.user_id = s.user_id AND h.game_id = s.game_id
       AND h.points = s.points AND h.elapsed_time = s.best_time`)[0].n
    assert.equal(matched, 3)
  })

  test('pre-auth rows keep a NULL secret so they can be claimed', () => {
    const n = sql(dir, 'SELECT COUNT(*) n FROM users WHERE secret_hash IS NULL')[0].n
    assert.equal(n, 2)
  })

  test('nobody starts on a rename cooldown they never triggered', () => {
    const n = sql(dir, 'SELECT COUNT(*) n FROM users WHERE name_updated_at IS NOT NULL')[0].n
    assert.equal(n, 0)
  })

  test('re-running applies nothing and changes nothing', () => {
    const out = applyMigrations(dir)
    assert.match(out, /No migrations to apply/i)
    assert.equal(sql(dir, 'SELECT COUNT(*) n FROM users')[0].n, 2)
    assert.equal(sql(dir, 'SELECT COUNT(*) n FROM score_history')[0].n, 3)
  })
})
