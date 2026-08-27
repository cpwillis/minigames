// Single source of truth for game ids: drives static routes and, via GameId, the registry.
// Keep api/src/lib/validate.ts in sync (separate deployable, cannot import from here).
export const GAME_IDS = [
  'word-search', 'caesar-cipher', 'code-trivia', 'memory-match', 'riddle-box',
  'number-guess', 'hangman', 'http-status', 'bug-finder', 'typing-speed',
  'regex-match', 'color-hex', 'json-fix', 'git-scenario', 'big-o',
] as const

export type GameId = typeof GAME_IDS[number]
