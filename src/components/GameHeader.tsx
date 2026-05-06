'use client'
import Link from 'next/link'
import { formatTime } from '@/lib/utils'
import type { GameMeta } from '@/features/games/types'

interface GameHeaderProps {
  game: GameMeta
  elapsed: number
  onRestart: () => void
}

export default function GameHeader({ game, elapsed, onRestart }: GameHeaderProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            &larr; Games
          </Link>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{game.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {formatTime(elapsed)}
          </span>
          <button
            onClick={onRestart}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  )
}
