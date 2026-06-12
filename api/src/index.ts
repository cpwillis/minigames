import { Hono } from 'hono'
import { cors } from './middleware/cors'
import users from './routes/users'
import scores from './routes/scores'

type Env = { DB: D1Database }

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors)
app.route('/users', users)
app.route('/scores', scores)

app.get('/', c => c.json({ status: 'ok' }))
app.notFound(c => c.json({ error: 'Not found' }, 404))
// Never leak stack traces or internals to the client; full error goes to wrangler tail / observability
app.onError((err, c) => {
  console.error(`${c.req.method} ${c.req.path}:`, err)
  return c.json({ error: 'Internal error' }, 500)
})

export default app
