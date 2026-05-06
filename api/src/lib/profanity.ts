const BLOCKED = [
  'fuck', 'shit', 'ass', 'bitch', 'cunt', 'dick', 'cock', 'pussy',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'whore', 'slut',
]

export function containsProfanity(s: string): boolean {
  const lower = s.toLowerCase()
  return BLOCKED.some(w => lower.includes(w))
}
