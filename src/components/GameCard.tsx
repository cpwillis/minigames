import Link from 'next/link'
import type { GameMeta, GameRecord } from '@/features/games/types'
import { formatTime } from '@/lib/utils'

const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-green-600 dark:text-green-400',
  medium: 'text-amber-600 dark:text-amber-400',
  hard: 'text-red-500 dark:text-red-400',
}

export default function GameCard({ game, record }: { game: GameMeta; record?: GameRecord }) {
  const done = !!record

  return (
    <Link
      href={`/${game.id}`}
      className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-2xl">{game.icon}</span>
        {done && (
          <span className="text-green-500 text-xs font-medium">&#10003; done</span>
        )}
      </div>
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{game.title}</h2>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">{game.description}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium capitalize ${DIFFICULTY_COLOR[game.difficulty]}`}>
          {game.difficulty}
        </span>
        {record ? (
          <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            {formatTime(record.bestTime)} &bull; {record.bestPoints.toLocaleString()} pts
          </span>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-600">{game.maxPoints.toLocaleString()} pts max</span>
        )}
      </div>
    </Link>
  )
}
