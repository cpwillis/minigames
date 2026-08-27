// Thin request helpers so the assertions read as HTTP, not as fetch boilerplate.
import { randomUUID, randomBytes } from 'node:crypto'

export function newCredentials() {
  return { id: randomUUID(), secret: randomBytes(32).toString('base64url') }
}

export async function call(baseUrl, method, path, { secret, body } = {}) {
  const headers = {}
  if (secret) headers.Authorization = `Bearer ${secret}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = null }
  return { status: res.status, body: json, text, headers: res.headers }
}

export const get = (b, p, o) => call(b, 'GET', p, o)
export const post = (b, p, o) => call(b, 'POST', p, o)
export const put = (b, p, o) => call(b, 'PUT', p, o)

/** Register a brand new player and return their credentials. */
export async function register(baseUrl, displayName) {
  const cred = newCredentials()
  const res = await post(baseUrl, '/users', {
    secret: cred.secret,
    body: { id: cred.id, display_name: displayName, secret: cred.secret },
  })
  if (res.status !== 200) throw new Error(`register(${displayName}) failed: ${res.status} ${res.text}`)
  return cred
}
