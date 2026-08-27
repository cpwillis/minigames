// Run: npm test  (node's built-in runner, no framework)
// Covers the logic that silently produces wrong numbers or lets bad input through.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calcPoints } from '../src/lib/scoring.ts'
import { formatTime } from '../src/lib/utils.ts'
import { validateUsername } from '../shared/username.ts'
import { containsProfanity } from '../shared/profanity.ts'

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
  assert.equal(containsProfanity('xXfuckXx'), true)
  assert.equal(containsProfanity('a55hole'), true)
})

test('multi-word entries from the list are matched as phrases', () => {
  assert.equal(containsProfanity('alabama hot pocket'), true)
  assert.equal(containsProfanity('hot pocket'), false)
})

// The whole reason the generator computes a substring-safe subset instead of matching the
// full list anywhere: these are ordinary words and names that a naive filter destroys.
test('innocent names and words are not blocked', () => {
  for (const ok of [
    'Bass Player', 'Cassandra', 'Ada Lovelace', 'Grace Hopper', 'Classic',
    'Swanky', 'Ashkenazi', 'Sweetwater', 'Advertisement', 'Amusement',
    'Titan', 'Analyst', 'Scunthorpe', 'Penistone', 'Assam', 'Cockburn',
    'Sussex', 'Middlesex', 'Essex', 'Nigeria', 'Manuscript',
  ]) {
    assert.equal(containsProfanity(ok), false, `should allow ${JSON.stringify(ok)}`)
  }
})

// FORCE_SUBSTRING in the generator may only promote words already on the public list.
test('slurs are blocked even when embedded', () => {
  for (const bad of ['xxshitxx', 'n1gg3r', 'MyCuntName', 'sluttyname']) {
    assert.equal(containsProfanity(bad), true, `should block ${JSON.stringify(bad)}`)
  }
})

// An allowlisted place name must not become a way to smuggle the term it excuses.
test('allowlisted names do not launder a slur next to them', () => {
  assert.equal(containsProfanity('Scunthorpe cunt'), true)
  assert.equal(containsProfanity('Scunthorpe FC'), false)
})

test('profanity is enforced through validateUsername, not just exported', () => {
  assert.equal(validateUsername('sh1t').ok, false)
})

