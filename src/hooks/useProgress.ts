'use client'
import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export interface GameRecord {
  bestTime: number
  bestPoints: number
}

const KEY = 'minigames-progress'

export function useProgress() {
  const [progress, setProgress] = useState<Record<string, GameRecord>>({})

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (stored) setProgress(JSON.parse(stored))
    } catch {}
  }, [])

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
