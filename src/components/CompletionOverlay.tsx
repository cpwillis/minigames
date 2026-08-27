'use client'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-title"
        className="card w-full max-w-sm space-y-6 p-8 shadow-xl"
      >
        <div className="space-y-2 text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-lg text-accent"
          >
            &#10003;
          </span>
          <p id="complete-title" className="text-lg font-semibold text-fg">
            {isNewBest ? 'New best!' : 'Complete'}
          </p>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted">Time</dt>
            <dd className="font-mono font-medium tabular-nums text-fg">{formatTime(elapsed)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted">Points</dt>
            <dd className="font-mono font-medium tabular-nums text-fg">{points.toLocaleString()}</dd>
          </div>
          {previous && (
            <div className="flex items-center justify-between">
              <dt className="text-muted">Previous best</dt>
              <dd className="font-mono tabular-nums text-faint">{formatTime(previous.bestTime)}</dd>
            </div>
          )}
        </dl>

        <div className="flex gap-3">
          <button onClick={onPlayAgain} className="btn flex-1" autoFocus>
            Play again
          </button>
          <Link href="/" className="btn-primary flex-1">
            Back home
          </Link>
        </div>
      </div>
    </div>
  )
}
