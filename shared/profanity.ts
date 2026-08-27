// Display-name filtering. The word data comes from a public list (see profanity-words.ts and
// NOTICE.md); this file is only the matching policy.
//
// Names are already restricted to [a-zA-Z0-9 ] by validateUsername, so normalisation only has to
// undo case, digit leetspeak ("sh1t") and spacing tricks ("F u C k").
import { PROFANITY, PROFANITY_SUBSTRINGS } from './profanity-words.ts'

const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
}

/**
 * The Scunthorpe problem: place names that contain a blocked term and would otherwise be
 * rejected. They are removed before the substring pass, so "Scunthorpe" is fine while
 * "Scunthorpe <slur>" is still caught. Only needed for terms the generator force-promoted;
 * the automatically derived ones are already checked against the dictionary, which has no
 * proper nouns.
 */
const ALLOW = ['scunthorpe', 'penistone', 'clitheroe', 'lightwater']

const WORDS = new Set(PROFANITY.filter(w => !w.includes(' ')))
const PHRASES = PROFANITY.filter(w => w.includes(' '))

function normalise(s: string): string {
  return s.toLowerCase().replace(/[0-9]/g, d => LEET[d] ?? d).replace(/\s+/g, ' ').trim()
}

export function containsProfanity(raw: string): boolean {
  const norm = normalise(raw)
  if (!norm) return false

  // Whole words. Matching the full list as substrings would be absurd: "advertisement" contains
  // "semen" and "Ashkenazi" contains "nazi".
  const tokens = norm.split(' ')
  if (tokens.some(t => WORDS.has(t))) return true

  // Multi-word entries, against the whole normalised name.
  if (PHRASES.some(p => norm.includes(p))) return true

  // Spacing evasion, plus embedding, but only for entries the generator proved cannot appear
  // inside an innocent English word.
  let collapsed = norm.replace(/ /g, '')
  for (const allowed of ALLOW) collapsed = collapsed.split(allowed).join('')
  return PROFANITY_SUBSTRINGS.some(w => collapsed.includes(w))
}
