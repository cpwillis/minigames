// Local D1 lifecycle for tests.
//
// Everything runs against an isolated --persist-to directory under tests/.tmp, never the
// developer's own api/.wrangler state, so running the suite cannot destroy work in progress.
import { execFileSync } from 'node:child_process'
import { rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

export const API_DIR = 'api'
export const DB = 'minigames-db'

export function statePath(name) {
  return join(process.cwd(), 'tests', '.tmp', name)
}

/** Throw away any previous state so each run starts from a known point. */
export function resetState(name) {
  const dir = statePath(name)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  return dir
}

function wrangler(args, persistTo) {
  return execFileSync('npx', ['wrangler', ...args, '--persist-to', persistTo], {
    cwd: API_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, CLOUDFLARE_API_TOKEN: '', WRANGLER_SEND_METRICS: 'false' },
  })
}

export function applyMigrations(persistTo) {
  return wrangler(['d1', 'migrations', 'apply', DB, '--local'], persistTo)
}

export function sql(persistTo, command) {
  const out = wrangler(['d1', 'execute', DB, '--local', '--json', '--command', command], persistTo)
  // wrangler prints banner lines before the JSON payload.
  const start = out.indexOf('[')
  if (start === -1) throw new Error(`No JSON in wrangler output:\n${out}`)
  return JSON.parse(out.slice(start))[0].results
}

/** The schema exactly as production had it before migrations existed. */
export const PRE_MIGRATION_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, display_name TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL REFERENCES users(id),
  game_id TEXT NOT NULL, best_time REAL NOT NULL, points INTEGER NOT NULL,
  achieved_at INTEGER NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_user_game ON scores(user_id, game_id);`

/** Rows shaped like the ones already in production, including a pre-auth user. */
export const LEGACY_ROWS = `
INSERT INTO users (id, display_name, created_at) VALUES
 ('11111111-1111-4111-8111-111111111111','LegacyOne',1750000000000),
 ('22222222-2222-4222-8222-222222222222','LegacyTwo',1750000100000);
INSERT INTO scores (user_id, game_id, best_time, points, achieved_at) VALUES
 ('11111111-1111-4111-8111-111111111111','big-o',3.5,900,1750000300000),
 ('11111111-1111-4111-8111-111111111111','hangman',20.0,600,1750000320000),
 ('22222222-2222-4222-8222-222222222222','color-hex',12.0,450,1750000500000);`

export const LEGACY_USER_ID = '11111111-1111-4111-8111-111111111111'
