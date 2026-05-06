'use client'
import Link from 'next/link'
import { useProgress } from '@/hooks/useProgress'
import { GAMES } from '@/features/games/registry'
import ThemeToggle from './ThemeToggle'

export default function Nav() {
  const { totalPoints, progress } = useProgress()
  const completed = Object.keys(progress).length
  const total = GAMES.length

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-gray-900 dark:text-gray-100 text-sm tracking-tight">
          minigames
        </Link>

        <div className="flex items-center gap-4">
          {completed > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {totalPoints.toLocaleString()} pts &bull; {completed}/{total}
            </span>
          )}
          <Link
            href="/leaderboard"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/settings"
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Settings
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
