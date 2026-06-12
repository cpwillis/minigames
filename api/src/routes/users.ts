import { Hono } from 'hono'
import { validateUsername } from '../lib/username'
import { isUuid, readJson } from '../lib/validate'

type Env = { DB: D1Database }

const users = new Hono<{ Bindings: Env }>()

users.post('/', async c => {
  const body = await readJson<{ id?: unknown; display_name?: unknown }>(c)
  if (!body) return c.json({ error: 'Invalid JSON' }, 400)
  if (!isUuid(body.id)) return c.json({ error: 'Invalid id' }, 400)

  const validation = validateUsername(typeof body.display_name === 'string' ? body.display_name : '')
  if (!validation.ok) return c.json({ error: validation.error }, 400)

  await c.env.DB.prepare(
    'INSERT INTO users (id, display_name, created_at) VALUES (?, ?, ?) ON CONFLICT(id) DO NOTHING'
  ).bind(body.id, validation.value, Date.now()).run()

  return c.json({ ok: true })
})

users.put('/:uuid/name', async c => {
  const uuid = c.req.param('uuid')
  if (!isUuid(uuid)) return c.json({ error: 'Invalid id' }, 400)

  const body = await readJson<{ display_name?: unknown }>(c)
  if (!body) return c.json({ error: 'Invalid JSON' }, 400)

  const validation = validateUsername(typeof body.display_name === 'string' ? body.display_name : '')
  if (!validation.ok) return c.json({ error: validation.error }, 400)

  const result = await c.env.DB.prepare(
    'UPDATE users SET display_name = ? WHERE id = ?'
  ).bind(validation.value, uuid).run()

  if (result.meta.changes === 0) return c.json({ error: 'User not found' }, 404)
  return c.json({ ok: true })
})

export default users
