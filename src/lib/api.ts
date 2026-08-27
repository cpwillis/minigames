const BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  games_completed: number
  total_points: number
}

export interface HistoryEntry {
  game_id: string
  elapsed_time: number
  points: number
  created_at: number
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

/** The secret proves the caller holds this user id. It goes to the API and nowhere else. */
const auth = (secret: string, method: string, body?: unknown): RequestInit => ({
  method,
  headers: {
    Authorization: `Bearer ${secret}`,
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
  },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
})

export const api = {
  registerUser: (id: string, displayName: string, secret: string) =>
    request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ id, display_name: displayName, secret }),
    }),

  updateName: (uuid: string, displayName: string, secret: string) =>
    request(`/users/${uuid}/name`, auth(secret, 'PUT', { display_name: displayName })),

  submitScore: (userId: string, gameId: string, bestTime: number, points: number, secret: string) =>
    request('/scores', auth(secret, 'POST', {
      user_id: userId, game_id: gameId, best_time: bestTime, points,
    })),

  getLeaderboard: () => request<LeaderboardEntry[]>('/scores/leaderboard'),

  getHistory: (uuid: string, secret: string) =>
    request<HistoryEntry[]>(`/scores/history/${uuid}`, auth(secret, 'GET')),
}
