'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { formatTime } from '@/lib/utils'
import type { GameRecord } from '@/features/games/types'

interface CompletionOverlayProps {
  elapsed: number
  points: number
  previous: GameRecord | null
  onPlayAgain: () => void
}

export default function CompletionOverlay({ elapsed, points, previous, onPlayAgain }: CompletionOverlayProps) {
  const isNewBest = !previous || elapsed < previous.bestTime

  useEffect(() => {
    const id = setTimeout(() => { window.location.href = '/' }, 8000)
    return () => clearTimeout(id)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 w-full max-w-sm space-y-5">
        <div className="text-center">
          <p className="text-2xl mb-1">&#10003;</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complete!</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Time</span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Points</span>
            <span className="font-mono font-medium text-gray-900 dark:text-gray-100">{points.toLocaleString()}</span>
          </div>
          {isNewBest && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-amber-600 dark:text-amber-400 font-medium">New best!</span>
              {previous && (
                <span className="text-xs text-gray-400 dark:text-gray-600">prev {formatTime(previous.bestTime)}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Play again
          </button>
          <Link
            href="/"
            className="flex-1 rounded-lg border border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:opacity-90 transition-opacity text-center"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
