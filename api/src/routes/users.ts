import { Hono } from 'hono'
import { validateUsername } from '../lib/username'

type Env = { DB: D1Database }

const users = new Hono<{ Bindings: Env }>()

users.post('/', async c => {
  const { id, display_name } = await c.req.json<{ id: string; display_name: string }>()
  if (!id || typeof id !== 'string' || id.length !== 36) {
    return c.json({ error: 'Invalid id' }, 400)
  }
  const validation = validateUsername(display_name ?? '')
  if (!validation.ok) return c.json({ error: validation.error }, 400)

  await c.env.DB.prepare(
    'INSERT INTO users (id, display_name, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING'
  ).bind(id, validation.value, Date.now()).run()

  return c.json({ ok: true })
})

users.put('/:uuid/name', async c => {
  const uuid = c.req.param('uuid')
  const { display_name } = await c.req.json<{ display_name: string }>()
  const validation = validateUsername(display_name ?? '')
  if (!validation.ok) return c.json({ error: validation.error }, 400)

  const result = await c.env.DB.prepare(
    'UPDATE users SET display_name = ? WHERE id = ?'
  ).bind(validation.value, uuid).run()

  if (result.meta.changes === 0) return c.json({ error: 'User not found' }, 404)
  return c.json({ ok: true })
})

export default users
