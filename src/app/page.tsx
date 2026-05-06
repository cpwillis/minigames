'use client'
import { useProgress } from '@/hooks/useProgress'
import { GAMES } from '@/features/games/registry'
import GameCard from '@/components/GameCard'

export default function HomePage() {
  const { progress } = useProgress()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">minigames</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Developer-themed mini games. Pick one to start.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map(game => (
          <GameCard
            key={game.id}
            game={game}
            record={progress[game.id]}
          />
        ))}
      </div>
    </div>
  )
}
