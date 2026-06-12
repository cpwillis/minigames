import type { Context, Next } from 'hono'

const ALLOWED = ['https://minigames.cpwillis.dev', 'http://localhost:3000']

export async function cors(c: Context, next: Next) {
  const origin = c.req.header('origin') ?? ''
  const allowed = ALLOWED.includes(origin) ? origin : ALLOWED[0]

  c.header('Access-Control-Allow-Origin', allowed)
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type')
  c.header('Access-Control-Max-Age', '86400')
  c.header('Vary', 'Origin')
  c.header('X-Content-Type-Options', 'nosniff')

  if (c.req.method === 'OPTIONS') return c.body(null, 204)
  return next()
}
