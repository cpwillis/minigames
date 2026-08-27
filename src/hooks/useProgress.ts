'use client'
import { useCallback } from 'react'
import { api, ApiError } from '@/lib/api'
import { reregister, type User } from '@/hooks/useUser'
import { useStored, readStored, writeStored, clearStored } from '@/lib/store'
import type { GameRecord } from '@/features/games/types'

const KEY = 'minigames-progress'
type Progress = Record<string, GameRecord>
const EMPTY: Progress = {}

export function useProgress() {
  const progress = useStored<Progress>(KEY, EMPTY)

  const submitResult = useCallback((
    id: string,
    elapsedSeconds: number,
    points: number,
    user?: User,
  ) => {
    const current = readStored<Progress>(KEY, EMPTY)
    const existing = current[id]
    if (!existing || existing.bestTime > elapsedSeconds) {
      writeStored<Progress>(KEY, { ...current, [id]: { bestTime: elapsedSeconds, bestPoints: points } })
    }
    // Fire and forget: the leaderboard is a nicety, a failed submit must not break the game.
    if (user) {
      api.submitScore(user.id, id, elapsedSeconds, points, user.secret).catch(err => {
        // 404 means the server has no row for this id, so the player had silently stopped
        // appearing on the leaderboard while still playing happily. Rebuild the row; the
        // backfill includes the run written to localStorage just above.
        if (err instanceof ApiError && err.status === 404) reregister(user).catch(() => {})
      })
    }
  }, [])

  const resetProgress = useCallback(() => clearStored(KEY), [])

  const totalPoints = Object.values(progress).reduce((s, r) => s + r.bestPoints, 0)

  return { progress, submitResult, resetProgress, totalPoints }
}
