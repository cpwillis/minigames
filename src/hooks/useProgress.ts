'use client'
import { useState, useCallback } from 'react'
import { api } from '@/lib/api'

export interface GameRecord {
  bestTime: number
  bestPoints: number
}

const KEY = 'minigames-progress'

function load(): Record<string, GameRecord> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Record<string, GameRecord>>(load)

  const submitResult = useCallback((
    id: string,
    elapsedSeconds: number,
    points: number,
    userId?: string,
  ) => {
    setProgress(prev => {
      const existing = prev[id]
      if (existing && existing.bestTime <= elapsedSeconds) return prev
      const next = { ...prev, [id]: { bestTime: elapsedSeconds, bestPoints: points } }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
    // Submit to API silently — failures are non-blocking
    if (userId) {
      api.submitScore(userId, id, elapsedSeconds, points).catch(() => {})
    }
  }, [])

  const resetProgress = useCallback(() => {
    localStorage.removeItem(KEY)
    setProgress({})
  }, [])

  const totalPoints = Object.values(progress).reduce((s, r) => s + r.bestPoints, 0)
  const completedCount = Object.keys(progress).length

  return { progress, submitResult, resetProgress, totalPoints, completedCount }
}
