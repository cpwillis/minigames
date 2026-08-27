// Boots `wrangler dev` for the integration tests and tears it down again.
//
// Local mode only: no Cloudflare account, no login, no network. That is what lets the same
// suite run on a developer's laptop and in CI without secrets.
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { API_DIR } from './d1.mjs'

const READY_TIMEOUT_MS = 90_000

/** Ask the OS for a port nobody is using, so a stray dev server never collides with the suite. */
export function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer()
    srv.once('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolve(port))
    })
  })
}

export async function startWorker(persistTo) {
  const port = await freePort()
  const child = spawn('npx', [
    'wrangler', 'dev', '--local', '--port', String(port), '--persist-to', persistTo,
  ], {
    cwd: API_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
  })

  let log = ''
  child.stdout.on('data', d => { log += d })
  child.stderr.on('data', d => { log += d })

  const baseUrl = `http://127.0.0.1:${port}`
  const deadline = Date.now() + READY_TIMEOUT_MS
  let exited = false
  child.on('exit', () => { exited = true })

  while (Date.now() < deadline) {
    if (exited) throw new Error(`wrangler dev exited before becoming ready:\n${log}`)
    try {
      const res = await fetch(`${baseUrl}/`, { signal: AbortSignal.timeout(2000) })
      if (res.ok) return { baseUrl, stop: () => stop(child), log: () => log }
    } catch {
      // not listening yet
    }
    await new Promise(r => setTimeout(r, 400))
  }
  stop(child)
  throw new Error(`wrangler dev did not become ready in ${READY_TIMEOUT_MS}ms:\n${log}`)
}

function stop(child) {
  if (!child.killed) child.kill('SIGTERM')
  // workerd occasionally ignores SIGTERM; make sure CI never hangs on a stuck child.
  const t = setTimeout(() => { try { child.kill('SIGKILL') } catch {} }, 3000)
  t.unref?.()
}
