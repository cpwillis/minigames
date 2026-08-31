'use client'
import { useProgress } from '@/hooks/useProgress'
import { GAMES } from '@/features/games/registry'
import GameCard from '@/components/GameCard'

export default function HomePage() {
  const { progress, totalPoints } = useProgress()
  const completed = Object.keys(progress).length
  const pct = Math.round((completed / GAMES.length) * 100)

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-fg">
            Fifteen small games for developers.
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            Complexity, regex, git, HTTP, typing and a few for fun. Finish fast for more points.
            No account needed, no cookies.
          </p>
        </div>

        <div className="card space-y-2 p-4">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-muted">Your progress</span>
            <span className="tabular-nums text-fg">
              {completed}/{GAMES.length}
            </span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-sunken"
            role="progressbar"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={GAMES.length}
            aria-label="Games completed"
          >
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs tabular-nums text-faint">{totalPoints.toLocaleString()} points</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map(game => (
          <GameCard key={game.id} game={game} record={progress[game.id]} />
        ))}
      </section>
    </div>
  )
}
