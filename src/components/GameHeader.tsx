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
    <div className="border-b border-line bg-sunken/60">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <Link href="/" className="shrink-0 text-muted transition-colors hover:text-fg">
            &larr; Games
          </Link>
          <span aria-hidden="true" className="text-faint">/</span>
          <span className="truncate font-medium text-fg">{game.title}</span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-xs tabular-nums text-muted" aria-label="Elapsed time">
            {formatTime(elapsed)}
          </span>
          <button onClick={onRestart} className="text-xs text-muted transition-colors hover:text-fg">
            Restart
          </button>
        </div>
      </div>
    </div>
  )
}
