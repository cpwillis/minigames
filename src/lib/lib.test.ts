// Run: npm test  (node's built-in runner, no framework)
// Covers the logic that silently produces wrong numbers or lets bad input through.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcPoints } from './scoring.ts'
import { formatTime } from './utils.ts'
import { validateUsername } from './username.ts'
import { containsProfanity } from './profanity.ts'

test('points decay with time and never fall below the 10% floor', () => {
  assert.equal(calcPoints(1000, 0), 1000)
  assert.ok(calcPoints(1000, 30) < calcPoints(1000, 10))
  assert.equal(calcPoints(1000, 99999), 100)
  assert.ok(Number.isInteger(calcPoints(750, 17.4)))
})

test('formatTime pads seconds and rolls over minutes', () => {
  assert.equal(formatTime(0), '0:00')
  assert.equal(formatTime(9.9), '0:09')
  assert.equal(formatTime(61), '1:01')
  assert.equal(formatTime(600), '10:00')
})

test('validateUsername accepts real names and normalises whitespace', () => {
  assert.deepEqual(validateUsername('  Ada   Lovelace '), { ok: true, value: 'Ada Lovelace' })
  assert.equal(validateUsername('x').ok, true)
  assert.equal(validateUsername('a'.repeat(20)).ok, true)
})

test('validateUsername rejects bad shapes', () => {
  for (const bad of ['', '   ', 'a'.repeat(21), 'no_underscores', 'emoji 🎮', 'sémi']) {
    assert.equal(validateUsername(bad).ok, false, `should reject ${JSON.stringify(bad)}`)
  }
})

test('profanity filter sees through spacing and leetspeak', () => {
  assert.equal(containsProfanity('sh1t'), true)
  assert.equal(containsProfanity('F u C k'), true)
  assert.equal(containsProfanity('ass'), true)
  // WORD entries only match standalone, or every Bass and Classic player gets blocked
  assert.equal(containsProfanity('Bass Player'), false)
  assert.equal(containsProfanity('Cassandra'), false)
  assert.equal(containsProfanity('Ada Lovelace'), false)
})

test('profanity is enforced through validateUsername, not just exported', () => {
  assert.equal(validateUsername('sh1t').ok, false)
})

// The worker keeps its own copy of the filter (separate deployable, cannot import from here) and
// it is the actual enforcement point. If the two ever disagree, the client's preview of what will
// be accepted stops matching what the server does.
test('the worker copy of the profanity filter agrees with this one', async () => {
  const { containsProfanity: server } = await import('../../api/src/lib/profanity.ts')
  const cases = [
    'sh1t', 'F u C k', 'ass', 'Bass Player', 'Cassandra', 'Ada Lovelace',
    'fag', 'Flagstaff', 'n1gg3r', 'Titan', 'tit', 'Grace Hopper', 'a55',
  ]
  for (const c of cases) {
    assert.equal(server(c), containsProfanity(c), `disagreement on ${JSON.stringify(c)}`)
  }
})
