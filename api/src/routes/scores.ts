import { Hono } from 'hono'

type Env = { DB: D1Database }

const scores = new Hono<{ Bindings: Env }>()

scores.post('/', async c => {
  const { user_id, game_id, best_time, points } = await c.req.json<{
    user_id: string; game_id: string; best_time: number; points: number
  }>()

  if (!user_id || !game_id || typeof best_time !== 'number' || typeof points !== 'number') {
    return c.json({ error: 'Invalid payload' }, 400)
  }

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
  const { results } = await c.env.DB.prepare(
    'SELECT game_id, best_time, points FROM scores WHERE user_id = ?'
  ).bind(uuid).all()
  return c.json(results)
})

export default scores
