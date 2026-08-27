// End-to-end against a real worker and a real (local) D1, started once for the whole file.
// These are the checks that matter most: the leaderboard used to hand out credentials, so the
// impersonation cases here are the regression guard for that.
import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { resetState, applyMigrations, sql, API_DIR, DB, PRE_MIGRATION_SCHEMA, LEGACY_ROWS, LEGACY_USER_ID } from './helpers/d1.mjs'
import { startWorker } from './helpers/worker.mjs'
import { get, post, put, register, newCredentials } from './helpers/http.mjs'

let base, stop, dir

before(async () => {
  dir = resetState('api')
  // Start from a production-shaped database so the pre-auth rows are exercised too.
  const run = command => execFileSync('npx',
    ['wrangler', 'd1', 'execute', DB, '--local', '--command', command, '--persist-to', dir],
    { cwd: API_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  run(PRE_MIGRATION_SCHEMA)
  run(LEGACY_ROWS)
  applyMigrations(dir)
  const worker = await startWorker(dir)
  base = worker.baseUrl
  stop = worker.stop
}, { timeout: 300_000 })

after(() => stop?.())

describe('registration', () => {
  test('a new player can register', async () => {
    const c = newCredentials()
    const res = await post(base, '/users', { secret: c.secret, body: { id: c.id, display_name: 'Ada', secret: c.secret } })
    assert.equal(res.status, 200)
  })

  test('a secret is required', async () => {
    const c = newCredentials()
    const res = await post(base, '/users', { body: { id: c.id, display_name: 'NoSecret' } })
    assert.equal(res.status, 400)
  })

  test('a malformed secret is rejected', async () => {
    const c = newCredentials()
    const res = await post(base, '/users', { secret: c.secret, body: { id: c.id, display_name: 'Short', secret: 'tooshort' } })
    assert.equal(res.status, 400)
  })

  test('the id must be a v4 uuid', async () => {
    const c = newCredentials()
    const res = await post(base, '/users', { secret: c.secret, body: { id: 'not-a-uuid', display_name: 'Bad', secret: c.secret } })
    assert.equal(res.status, 400)
  })

  test('re-registering an id you do not hold is refused', async () => {
    const alice = await register(base, 'Alice')
    const mallory = newCredentials()
    const res = await post(base, '/users', {
      secret: mallory.secret,
      body: { id: alice.id, display_name: 'Stolen', secret: mallory.secret },
    })
    assert.equal(res.status, 403)
  })
})

describe('display names', () => {
  const bad = ['', '   ', 'a'.repeat(21), 'under_score', 'emoji 🎮', 'sh1t', 'xXfuckXx', 'a55hole', 'alabama hot pocket']
  for (const name of bad) {
    test(`rejects ${JSON.stringify(name)}`, async () => {
      const c = newCredentials()
      const res = await post(base, '/users', { secret: c.secret, body: { id: c.id, display_name: name, secret: c.secret } })
      assert.equal(res.status, 400)
    })
  }

  // The whole point of the substring-safe list: ordinary names must get through.
  for (const name of ['Scunthorpe', 'Cassandra', 'Grace Hopper', 'Swanky', 'Assam', 'Titan', 'Middlesex']) {
    test(`accepts ${JSON.stringify(name)}`, async () => {
      const c = newCredentials()
      const res = await post(base, '/users', { secret: c.secret, body: { id: c.id, display_name: name, secret: c.secret } })
      assert.equal(res.status, 200, res.text)
    })
  }
})

describe('impersonation', () => {
  let alice, mallory
  before(async () => {
    alice = await register(base, 'AliceTarget')
    mallory = await register(base, 'Mallory')
  })

  test('another player cannot rename you', async () => {
    const res = await put(base, `/users/${alice.id}/name`, { secret: mallory.secret, body: { display_name: 'Pwned' } })
    assert.equal(res.status, 403)
  })

  test('another player cannot submit scores as you', async () => {
    const res = await post(base, '/scores', {
      secret: mallory.secret,
      body: { user_id: alice.id, game_id: 'big-o', best_time: 1, points: 1000 },
    })
    assert.equal(res.status, 403)
  })

  test('another player cannot read your history', async () => {
    const res = await get(base, `/scores/history/${alice.id}`, { secret: mallory.secret })
    assert.equal(res.status, 403)
  })

  test('another player cannot read your scores', async () => {
    const res = await get(base, `/scores/user/${alice.id}`, { secret: mallory.secret })
    assert.equal(res.status, 403)
  })

  test('no credentials at all is unauthorised, not forbidden', async () => {
    assert.equal((await put(base, `/users/${alice.id}/name`, { body: { display_name: 'X' } })).status, 401)
    assert.equal((await post(base, '/scores', { body: { user_id: alice.id, game_id: 'big-o', best_time: 1, points: 10 } })).status, 401)
  })

  test('a malformed bearer token is rejected before any lookup', async () => {
    const res = await put(base, `/users/${alice.id}/name`, { secret: 'short', body: { display_name: 'X' } })
    assert.equal(res.status, 401)
  })

  test('an unknown user is 404, not a credential oracle', async () => {
    const ghost = newCredentials()
    const res = await put(base, `/users/${ghost.id}/name`, { secret: ghost.secret, body: { display_name: 'Ghost' } })
    assert.equal(res.status, 404)
  })

  test('the leaderboard never exposes a secret', async () => {
    const res = await get(base, '/scores/leaderboard')
    assert.equal(res.status, 200)
    assert.ok(!res.text.includes('secret'), 'leaderboard payload mentions a secret')
    assert.ok(!res.text.includes(alice.secret), 'leaderboard leaked a secret')
  })

  test('the stored secret is a hash, not the secret itself', () => {
    const rows = sql(dir, "SELECT secret_hash FROM users WHERE secret_hash IS NOT NULL LIMIT 5")
    assert.ok(rows.length > 0)
    for (const r of rows) assert.match(r.secret_hash, /^[0-9a-f]{64}$/)
  })
})

describe('score submission', () => {
  let player
  before(async () => { player = await register(base, 'Scorer') })

  test('a valid run is accepted', async () => {
    const res = await post(base, '/scores', {
      secret: player.secret,
      body: { user_id: player.id, game_id: 'big-o', best_time: 20, points: 800 },
    })
    assert.equal(res.status, 200)
  })

  test('a worse run does not replace the best, but is still recorded', async () => {
    await post(base, '/scores', { secret: player.secret, body: { user_id: player.id, game_id: 'big-o', best_time: 50, points: 500 } })
    const best = await get(base, `/scores/user/${player.id}`, { secret: player.secret })
    assert.equal(best.body.find(r => r.game_id === 'big-o').points, 800)

    const history = await get(base, `/scores/history/${player.id}`, { secret: player.secret })
    assert.equal(history.body.filter(r => r.game_id === 'big-o').length, 2)
  })

  test('a better run does replace the best', async () => {
    await post(base, '/scores', { secret: player.secret, body: { user_id: player.id, game_id: 'big-o', best_time: 6, points: 950 } })
    const best = await get(base, `/scores/user/${player.id}`, { secret: player.secret })
    const row = best.body.find(r => r.game_id === 'big-o')
    assert.equal(row.points, 950)
    assert.equal(row.best_time, 6)
    assert.ok(row.updated_at > row.created_at, 'updated_at should move, created_at should not')
  })

  test('history is newest first', async () => {
    const res = await get(base, `/scores/history/${player.id}`, { secret: player.secret })
    const times = res.body.map(r => r.created_at)
    assert.deepEqual(times, [...times].sort((a, b) => b - a))
  })

  const invalid = [
    ['points above the cap', { best_time: 5, points: 9999 }],
    ['negative points', { best_time: 5, points: -1 }],
    ['fractional points', { best_time: 5, points: 1.5 }],
    ['zero time', { best_time: 0, points: 100 }],
    ['negative time', { best_time: -5, points: 100 }],
    ['absurd time', { best_time: 90000, points: 100 }],
    ['NaN time', { best_time: null, points: 100 }],
  ]
  for (const [label, patch] of invalid) {
    test(`rejects ${label}`, async () => {
      const res = await post(base, '/scores', {
        secret: player.secret,
        body: { user_id: player.id, game_id: 'big-o', ...patch },
      })
      assert.equal(res.status, 400, res.text)
    })
  }

  test('rejects an unknown game id', async () => {
    const res = await post(base, '/scores', {
      secret: player.secret,
      body: { user_id: player.id, game_id: 'not-a-game', best_time: 5, points: 100 },
    })
    assert.equal(res.status, 400)
  })

  test('rejects malformed JSON', async () => {
    const res = await fetch(`${base}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${player.secret}` },
      body: '{oops',
    })
    assert.equal(res.status, 400)
  })
})

describe('rename cooldown', () => {
  test('the first rename is free, so a typo is fixable', async () => {
    const p = await register(base, 'Typoo')
    const res = await put(base, `/users/${p.id}/name`, { secret: p.secret, body: { display_name: 'Typo Fixed' } })
    assert.equal(res.status, 200, res.text)
  })

  test('a second rename straight after is refused', async () => {
    const p = await register(base, 'Flipper')
    assert.equal((await put(base, `/users/${p.id}/name`, { secret: p.secret, body: { display_name: 'FlipperTwo' } })).status, 200)
    const res = await put(base, `/users/${p.id}/name`, { secret: p.secret, body: { display_name: 'FlipperThree' } })
    assert.equal(res.status, 429)
    assert.match(res.body.error, /try again/i)
  })

  test('re-saving the name you already have is not a change', async () => {
    const p = await register(base, 'Steady')
    await put(base, `/users/${p.id}/name`, { secret: p.secret, body: { display_name: 'Steady Two' } })
    const res = await put(base, `/users/${p.id}/name`, { secret: p.secret, body: { display_name: 'Steady Two' } })
    assert.equal(res.status, 200)
  })

  test('the cooldown does not let a profane name through', async () => {
    const p = await register(base, 'Rude')
    const res = await put(base, `/users/${p.id}/name`, { secret: p.secret, body: { display_name: 'xXfuckXx' } })
    assert.equal(res.status, 400)
  })
})

describe('rows migrated in from before auth existed', () => {
  test('the first secret presented claims the row', async () => {
    const claimer = newCredentials()
    const res = await put(base, `/users/${LEGACY_USER_ID}/name`, {
      secret: claimer.secret, body: { display_name: 'Claimed' },
    })
    assert.equal(res.status, 200, res.text)

    // And can then act as that user.
    const scores = await get(base, `/scores/user/${LEGACY_USER_ID}`, { secret: claimer.secret })
    assert.equal(scores.status, 200)
    assert.equal(scores.body.length, 2, 'their existing scores should still be there')
  })

  test('a different secret is refused once claimed', async () => {
    const other = newCredentials()
    const res = await put(base, `/users/${LEGACY_USER_ID}/name`, {
      secret: other.secret, body: { display_name: 'Stolen' },
    })
    assert.equal(res.status, 403)
  })
})

describe('public endpoints', () => {
  test('the leaderboard needs no credentials', async () => {
    const res = await get(base, '/scores/leaderboard')
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.body))
  })

  test('per-game leaderboards work and validate the id', async () => {
    assert.equal((await get(base, '/scores/leaderboard/big-o')).status, 200)
    assert.equal((await get(base, '/scores/leaderboard/not-a-game')).status, 400)
  })

  test('unknown routes are a clean 404', async () => {
    const res = await get(base, '/nope')
    assert.equal(res.status, 404)
    assert.equal(res.body.error, 'Not found')
  })

  test('errors never leak internals', async () => {
    const res = await get(base, '/scores/user/not-a-uuid')
    assert.equal(res.status, 400)
    assert.ok(!res.text.includes('at '), 'response looks like it contains a stack trace')
  })
})

describe('cors and security headers', () => {
  test('the production origin is allowed', async () => {
    const res = await fetch(`${base}/scores/leaderboard`, {
      headers: { Origin: 'https://minigames.cpwillis.dev' },
    })
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://minigames.cpwillis.dev')
  })

  test('an unknown origin is not echoed back', async () => {
    const res = await fetch(`${base}/scores/leaderboard`, {
      headers: { Origin: 'https://evil.example' },
    })
    assert.notEqual(res.headers.get('access-control-allow-origin'), 'https://evil.example')
  })

  test('preflight permits the Authorization header', async () => {
    const res = await fetch(`${base}/scores`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://minigames.cpwillis.dev' },
    })
    assert.equal(res.status, 204)
    assert.match(res.headers.get('access-control-allow-headers') ?? '', /authorization/i)
  })

  test('nosniff is set', async () => {
    const res = await fetch(`${base}/`)
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
  })
})
