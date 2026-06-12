import { containsProfanity } from './profanity'

// English alphanumeric + internal spaces, 1–20 chars, no leading/trailing spaces
const RE = /^[a-zA-Z0-9][a-zA-Z0-9 ]{0,18}[a-zA-Z0-9]$|^[a-zA-Z0-9]{1,2}$/

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
