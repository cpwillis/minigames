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

export default app
