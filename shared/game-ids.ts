// The one list of game ids, used by both deployables: it drives the frontend's static routes
// and GameMeta.id, and the worker rejects scores for anything not on it. There used to be a
// second copy in api/src/lib/validate.ts kept in step by hand.
export const GAME_IDS = [
  'word-search', 'caesar-cipher', 'code-trivia', 'memory-match', 'riddle-box',
  'number-guess', 'hangman', 'http-status', 'bug-finder', 'typing-speed',
  'regex-match', 'color-hex', 'json-fix', 'git-scenario', 'big-o',
] as const

export type GameId = typeof GAME_IDS[number]
