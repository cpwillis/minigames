// English alphanumeric + internal spaces, 1–20 chars, no leading/trailing spaces
const RE = /^[a-zA-Z0-9][a-zA-Z0-9 ]{0,18}[a-zA-Z0-9]$|^[a-zA-Z0-9]{1,2}$/

// Basic client-side profanity list — server mirrors this with a fuller list
const BLOCKED = ['fuck', 'shit', 'cunt', 'bitch', 'asshole', 'nigger', 'faggot']

function containsProfanity(value: string): boolean {
  const lower = value.toLowerCase()
  return BLOCKED.some(w => lower.includes(w))
}

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string }

export function validateUsername(raw: string): ValidationResult {
  const trimmed = raw.trim().replace(/\s+/g, ' ')
  if (!RE.test(trimmed)) {
    return { ok: false, error: 'Letters, numbers, and spaces only (1–20 chars)' }
  }
  if (containsProfanity(trimmed)) {
    return { ok: false, error: 'Display name not allowed' }
  }
  return { ok: true, value: trimmed }
}
