// Credential primitives. Deliberately free of Workers types so the shared test suite can import
// this without pulling @cloudflare/workers-types into the browser typecheck (the two type
// packages redeclare the same globals and cannot both be loaded).

/** Base64url, 43 chars, as produced by the client's 32 random bytes. */
const SECRET_RE = /^[A-Za-z0-9_-]{43}$/

export function isSecret(value: unknown): value is string {
  return typeof value === 'string' && SECRET_RE.test(value)
}

/** Only the hash is stored, so a database dump yields no working credentials. */
export async function hashSecret(secret: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}

/** Length-independent compare so a mismatch tells an attacker nothing from timing alone. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
