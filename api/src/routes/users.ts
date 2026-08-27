import { Hono } from 'hono'
import { validateUsername } from '../lib/username'
import { isUuid, readJson } from '../lib/validate'
import { authenticate, hashSecret, isSecret, type Env } from '../lib/auth'

const users = new Hono<{ Bindings: Env }>()

// Enough to stop someone cycling names on the leaderboard, short enough that a typo is
// fixable within the session. Applies to renames only, never to first registration.
export const NAME_CHANGE_COOLDOWN_MS = 60 * 60 * 1000

users.post('/', async c => {
  const body = await readJson<{ id?: unknown; display_name?: unknown; secret?: unknown }>(c)
  if (!body) return c.json({ error: 'Invalid JSON' }, 400)
  if (!isUuid(body.id)) return c.json({ error: 'Invalid id' }, 400)
  if (!isSecret(body.secret)) return c.json({ error: 'Invalid secret' }, 400)

  const validation = validateUsername(typeof body.display_name === 'string' ? body.display_name : '')
  if (!validation.ok) return c.json({ error: validation.error }, 400)

  const existing = await c.env.DB.prepare('SELECT 1 FROM users WHERE id = ?').bind(body.id).first()
  if (existing) {
    // Re-registering an id someone else already holds must not silently succeed.
    const auth = await authenticate(c, body.id)
    if (!auth.ok) return c.json({ error: auth.error }, auth.status)
    return c.json({ ok: true })
  }

  const now = Date.now()
  // name_updated_at stays NULL until they actually change the name, so the cooldown never
  // blocks a new player from fixing a typo in the name they just picked.
  await c.env.DB.prepare(`
    INSERT INTO users (id, display_name, secret_hash, created_at, updated_at, name_updated_at)
    VALUES (?, ?, ?, ?, ?, NULL)
    ON CONFLICT(id) DO NOTHING
  `).bind(body.id, validation.value, await hashSecret(body.secret), now, now).run()

  return c.json({ ok: true })
})

users.put('/:uuid/name', async c => {
  const uuid = c.req.param('uuid')
  if (!isUuid(uuid)) return c.json({ error: 'Invalid id' }, 400)

  const body = await readJson<{ display_name?: unknown }>(c)
  if (!body) return c.json({ error: 'Invalid JSON' }, 400)

  const validation = validateUsername(typeof body.display_name === 'string' ? body.display_name : '')
  if (!validation.ok) return c.json({ error: validation.error }, 400)

  const auth = await authenticate(c, uuid)
  if (!auth.ok) return c.json({ error: auth.error }, auth.status)

  const now = Date.now()
  const row = await c.env.DB.prepare('SELECT display_name, name_updated_at FROM users WHERE id = ?')
    .bind(uuid)
    .first<{ display_name: string; name_updated_at: number | null }>()
  if (!row) return c.json({ error: 'User not found' }, 404)

  // Re-saving the name you already have is a no-op, not something to rate limit.
  if (row.display_name === validation.value) return c.json({ ok: true })

  const since = now - (row.name_updated_at ?? 0)
  if (since < NAME_CHANGE_COOLDOWN_MS) {
    const minutes = Math.ceil((NAME_CHANGE_COOLDOWN_MS - since) / 60_000)
    return c.json({ error: `Name changed too recently. Try again in ${minutes} min.` }, 429)
  }

  await c.env.DB.prepare('UPDATE users SET display_name = ?, name_updated_at = ?, updated_at = ? WHERE id = ?')
    .bind(validation.value, now, now, uuid)
    .run()

  return c.json({ ok: true })
})

export default users
