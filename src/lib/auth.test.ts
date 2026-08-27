// Guards the credential format and hashing in the worker's auth layer. The request-level
// behaviour (impersonation, claim-on-first-use, rate limiting) needs a live D1 and is exercised
// against `wrangler dev`; these are the pure parts worth pinning down cheaply.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSecret, hashSecret } from '../../api/src/lib/auth.ts'

test('isSecret accepts exactly the shape the client generates', () => {
  const real = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
  assert.equal(real.length, 43)
  assert.equal(isSecret(real), true)
})

test('isSecret rejects anything else', () => {
  for (const bad of [
    '', 'short', 'a'.repeat(42), 'a'.repeat(44),
    'a'.repeat(42) + '+',            // base64, not base64url
    'a'.repeat(42) + '=',            // padding must already be stripped
    'a'.repeat(42) + ' ',
    null, undefined, 42, {},
  ]) {
    assert.equal(isSecret(bad), false, `should reject ${JSON.stringify(bad)}`)
  }
})

test('hashSecret is SHA-256 hex and does not leak the secret', async () => {
  // Known vector: SHA-256("abc")
  assert.equal(
    await hashSecret('abc'),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  )
  const secret = 'x'.repeat(43)
  const hash = await hashSecret(secret)
  assert.match(hash, /^[0-9a-f]{64}$/)
  assert.ok(!hash.includes(secret))
})

test('different secrets hash differently, same secret hashes stably', async () => {
  const a = await hashSecret('a'.repeat(43))
  const b = await hashSecret('b'.repeat(43))
  assert.notEqual(a, b)
  assert.equal(a, await hashSecret('a'.repeat(43)))
})
