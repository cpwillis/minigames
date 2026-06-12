import { Hono } from 'hono'
import { isUuid, isGameId, readJson, MAX_POINTS, MAX_TIME_SECONDS } from '../lib/validate'

type Env = { DB: D1Database }

const scores = new Hono<{ Bindings: Env }>()

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

  const user = await c.env.DB.prepare('SELECT 1 FROM users WHERE id = ?').bind(user_id).first()
  if (!user) return c.json({ error: 'User not found' }, 404)

  // Upsert: only replace if new score is strictly better (higher points)
  await c.env.DB.prepare(`
    INSERT INTO scores (user_id, game_id, best_time, points, achieved_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, game_id) DO UPDATE SET
      best_time = excluded.best_time,
      points = excluded.points,
      achieved_at = excluded.achieved_at
    WHERE excluded.points > scores.points
  `).bind(user_id, game_id, best_time, points, Date.now()).run()

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

scores.get('/user/:uuid', async c => {
  const uuid = c.req.param('uuid')
  if (!isUuid(uuid)) return c.json({ error: 'Invalid id' }, 400)
  const { results } = await c.env.DB.prepare(
    'SELECT game_id, best_time, points FROM scores WHERE user_id = ?'
  ).bind(uuid).all()
  return c.json(results)
})

export default scores
