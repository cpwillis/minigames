const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  games_completed: number
  total_points: number
}

export interface UserScore {
  game_id: string
  best_time: number
  points: number
}

// HTTP error (server responded non-2xx). Network/DNS failures throw plain TypeError from fetch.
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init)
  if (!res.ok) {
    let message = `${init?.method ?? 'GET'} ${path} failed: ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body?.error) message = body.error
    } catch {}
    throw new ApiError(res.status, message)
  }
  return res.json()
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const api = {
  registerUser: (id: string, displayName: string) =>
    request('/users', json('POST', { id, display_name: displayName })),

  updateName: (uuid: string, displayName: string) =>
    request(`/users/${uuid}/name`, json('PUT', { display_name: displayName })),

  submitScore: (userId: string, gameId: string, bestTime: number, points: number) =>
    request('/scores', json('POST', { user_id: userId, game_id: gameId, best_time: bestTime, points })),

  getLeaderboard: () => request<LeaderboardEntry[]>('/scores/leaderboard'),

  getLeaderboardForGame: (gameId: string) =>
    request<LeaderboardEntry[]>(`/scores/leaderboard/${gameId}`),

  getUserScores: (uuid: string) => request<UserScore[]>(`/scores/user/${uuid}`),
}
