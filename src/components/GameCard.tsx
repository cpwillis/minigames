import Link from 'next/link'
import type { GameMeta, GameRecord } from '@/features/games/types'
import { formatTime } from '@/lib/utils'

const DIFFICULTY: Record<GameMeta['difficulty'], string> = {
  easy: 'border-accent/40 text-accent',
  medium: 'border-warn/40 text-warn',
  hard: 'border-bad/40 text-bad',
}

export default function GameCard({ game, record }: { game: GameMeta; record?: GameRecord }) {
  return (
    <Link
      href={`/${game.id}`}
      className="card group relative flex flex-col gap-3 p-5 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-sunken text-xl leading-none"
        >
          {game.icon}
        </span>
        {record && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
            Completed
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <h2 className="text-sm font-semibold text-fg">{game.title}</h2>
        <p className="text-xs leading-relaxed text-muted">{game.description}</p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${DIFFICULTY[game.difficulty]}`}
        >
          {game.difficulty}
        </span>
        <span className="text-xs tabular-nums text-faint">
          {record
            ? `${formatTime(record.bestTime)} · ${record.bestPoints.toLocaleString()} pts`
            : `${game.maxPoints.toLocaleString()} pts max`}
        </span>
      </div>
    </Link>
  )
}
