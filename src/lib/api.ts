const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  games_completed: number
  total_points: number
}

export interface UserScore {
  gameId: string
  bestTime: number
  points: number
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`)
  return res.json()
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`)
  return res.json()
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
  return res.json()
}

export const api = {
  registerUser: (id: string, displayName: string) =>
    post('/users', { id, display_name: displayName }),

  updateName: (uuid: string, displayName: string) =>
    put(`/users/${uuid}/name`, { display_name: displayName }),

  submitScore: (userId: string, gameId: string, bestTime: number, points: number) =>
    post('/scores', { user_id: userId, game_id: gameId, best_time: bestTime, points }),

  getLeaderboard: () => get<LeaderboardEntry[]>('/leaderboard'),

  getLeaderboardForGame: (gameId: string) => get<LeaderboardEntry[]>(`/leaderboard/${gameId}`),

  getUserScores: (uuid: string) => get<UserScore[]>(`/users/${uuid}/scores`),
}
