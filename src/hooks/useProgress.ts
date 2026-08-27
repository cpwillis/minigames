'use client'
import { useCallback } from 'react'
import { api } from '@/lib/api'
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
    userId?: string,
  ) => {
    const current = readStored<Progress>(KEY, EMPTY)
    const existing = current[id]
    if (!existing || existing.bestTime > elapsedSeconds) {
      writeStored<Progress>(KEY, { ...current, [id]: { bestTime: elapsedSeconds, bestPoints: points } })
    }
    // Fire and forget: the leaderboard is a nicety, a failed submit must not break the game.
    if (userId) api.submitScore(userId, id, elapsedSeconds, points).catch(() => {})
  }, [])

  const resetProgress = useCallback(() => clearStored(KEY), [])

  const totalPoints = Object.values(progress).reduce((s, r) => s + r.bestPoints, 0)

  return { progress, submitResult, resetProgress, totalPoints }
}
