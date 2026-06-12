// Display-name censorship. Keep this file identical to api/src/lib/profanity.ts (server copy):
// the client gives instant feedback, the server is the actual enforcement point.
// Names are already restricted to [a-zA-Z0-9 ] by validateUsername, so normalization
// only needs to handle case, digit leetspeak, and spacing tricks (eg "F u C k", "sh1t").

// Blocked anywhere in the name, even embedded in longer words
const SUBSTRING = [
  'fuck', 'shit', 'cunt', 'bitch', 'bastard', 'dick', 'cock', 'pussy',
  'nigger', 'nigga', 'faggot', 'retard', 'whore', 'slut', 'kike', 'spic',
  'chink', 'tranny', 'wank', 'jizz', 'dildo', 'blowjob', 'handjob',
  'penis', 'vagina', 'rapist', 'hitler', 'nazi', 'pedo', 'molest',
]

// Blocked only as standalone words: too many innocent names contain them ("Bass", "Class", "Title")
const WORD = ['ass', 'fag', 'tit', 'tits', 'anal', 'hoe', 'cum', 'rape', 'porn', 'sex']

const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '6': 'g', '7': 't', '8': 'b', '9': 'g',
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[0-9]/g, d => LEET[d] ?? d)
}

export function containsProfanity(raw: string): boolean {
  const norm = normalize(raw)
  const collapsed = norm.replace(/ /g, '')
  if (SUBSTRING.some(w => collapsed.includes(w))) return true
  return norm.split(' ').some(w => WORD.includes(w))
}
