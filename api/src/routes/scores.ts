import { Hono } from 'hono'
import { isUuid, isGameId, readJson, MAX_POINTS, MAX_TIME_SECONDS } from '../lib/validate'
import { authenticate, type Env } from '../lib/auth'

const scores = new Hono<{ Bindings: Env }>()

const HISTORY_LIMIT = 100

scores.post('/', async c => {
  const body = await readJson<{
    user_id?: unknown; game_id?: unknown; best_time?: unknown; points?: unknown
  }>(c)
  if (!body) return c.json({ error: 'Invalid JSON' }, 400)

  const { user_id, game_id, best_time, points } = body
  if (!isUuid(user_id)) return c.json({ error: 'Invalid user id' }, 400)
  if (!isGameId(game_id)) return c.json({ error: 'Unknown game' }, 400)
  if (typeof best_time !== 'number' || !Number.isFinite(best_time) || best_time <= 0 || best_time > MAX_TIME_SECONDS) {
    return c.json({ error: 'Invalid time' }, 400)
  }
  if (typeof points !== 'number' || !Number.isInteger(points) || points < 0 || points > MAX_POINTS) {
    return c.json({ error: 'Invalid points' }, 400)
  }

  // Proves the caller holds this user's secret. Also covers "does this user exist" (404).
  const auth = await authenticate(c, user_id)
  if (!auth.ok) return c.json({ error: auth.error }, auth.status)

  const now = Date.now()

  await c.env.DB.batch([
    // Every attempt is kept, so a personal best that is later beaten is not lost.
    c.env.DB.prepare(`
      INSERT INTO score_history (user_id, game_id, elapsed_time, points, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(user_id, game_id, best_time, points, now, now),
    // scores holds only the personal best, replaced when a run scores strictly higher.
    c.env.DB.prepare(`
      INSERT INTO scores (user_id, game_id, best_time, points, achieved_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, game_id) DO UPDATE SET
        best_time = excluded.best_time,
        points = excluded.points,
        achieved_at = excluded.achieved_at,
        updated_at = excluded.updated_at
      WHERE excluded.points > scores.points
    `).bind(user_id, game_id, best_time, points, now, now, now),
  ])

  return c.json({ ok: true })
})

scores.get('/leaderboard', async c => {
  const { results } = await c.env.DB.prepare(`
    SELECT u.id as user_id, u.display_name, SUM(s.points) as total_points, COUNT(s.id) as games_completed
    FROM users u
    JOIN scores s ON s.user_id = u.id
    GROUP BY u.id
    ORDER BY total_points DESC
    LIMIT 50
  `).all()
  return c.json(results)
})

scores.get('/leaderboard/:gameId', async c => {
  const gameId = c.req.param('gameId')
  if (!isGameId(gameId)) return c.json({ error: 'Unknown game' }, 400)
  const { results } = await c.env.DB.prepare(`
    SELECT u.id as user_id, u.display_name, s.best_time, s.points
    FROM scores s
    JOIN users u ON u.id = s.user_id
    WHERE s.game_id = ?
    ORDER BY s.points DESC
    LIMIT 50
  `).bind(gameId).all()
  return c.json(results)
})

// A player's own records. Authenticated so one id cannot be used to read another's activity.
scores.get('/user/:uuid', async c => {
  const uuid = c.req.param('uuid')
  if (!isUuid(uuid)) return c.json({ error: 'Invalid id' }, 400)
  const auth = await authenticate(c, uuid)
  if (!auth.ok) return c.json({ error: auth.error }, auth.status)

  const { results } = await c.env.DB.prepare(
    'SELECT game_id, best_time, points, achieved_at, created_at, updated_at FROM scores WHERE user_id = ?'
  ).bind(uuid).all()
  return c.json(results)
})

scores.get('/history/:uuid', async c => {
  const uuid = c.req.param('uuid')
  if (!isUuid(uuid)) return c.json({ error: 'Invalid id' }, 400)
  const auth = await authenticate(c, uuid)
  if (!auth.ok) return c.json({ error: auth.error }, auth.status)

  const { results } = await c.env.DB.prepare(`
    SELECT game_id, elapsed_time, points, created_at
    FROM score_history
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).bind(uuid, HISTORY_LIMIT).all()
  return c.json(results)
})

export default scores
