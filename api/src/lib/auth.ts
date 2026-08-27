import type { Context } from 'hono'

// Per-user bearer secret.
//
// Before this, the user's id WAS the credential, and GET /scores/leaderboard returned every
// user's id in plain JSON. Anyone could read an id off the leaderboard and rename that player or
// submit scores as them. The id is now just an identifier; the secret is what proves you hold it.
//
// The client generates the secret, keeps it in localStorage and never displays it. Only its
// SHA-256 reaches the server, so a database dump does not yield working credentials.

export type Env = { DB: D1Database }

/** Base64url, 43 chars, as produced by the client's 32 random bytes. */
const SECRET_RE = /^[A-Za-z0-9_-]{43}$/

export function isSecret(value: unknown): value is string {
  return typeof value === 'string' && SECRET_RE.test(value)
}

export async function hashSecret(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Length-independent compare so a mismatch tells an attacker nothing from timing alone. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export function bearer(c: Context): string | null {
  const header = c.req.header('authorization') ?? ''
  const [scheme, value] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !isSecret(value)) return null
  return value
}

export type AuthResult =
  | { ok: true; claimed: boolean }
  | { ok: false; status: 401 | 403 | 404; error: string }

/**
 * Verify the request holds `userId`'s secret.
 *
 * Rows created before auth existed have secret_hash NULL. Their ids were public, so those accounts
 * were never protected in the first place; the first caller to present a secret claims the row
 * (trust on first use) rather than locking the real owner out of their own scores forever.
 */
export async function authenticate(c: Context<{ Bindings: Env }>, userId: string): Promise<AuthResult> {
  const secret = bearer(c)
  if (!secret) return { ok: false, status: 401, error: 'Missing or malformed credentials' }

  const row = await c.env.DB.prepare('SELECT secret_hash FROM users WHERE id = ?')
    .bind(userId)
    .first<{ secret_hash: string | null }>()
  if (!row) return { ok: false, status: 404, error: 'User not found' }

  const hash = await hashSecret(secret)

  if (row.secret_hash === null) {
    await c.env.DB.prepare('UPDATE users SET secret_hash = ?, updated_at = ? WHERE id = ? AND secret_hash IS NULL')
      .bind(hash, Date.now(), userId)
      .run()
    return { ok: true, claimed: true }
  }

  if (!timingSafeEqual(row.secret_hash, hash)) {
    return { ok: false, status: 403, error: 'Invalid credentials' }
  }
  return { ok: true, claimed: false }
}
