'use client'
import { useState } from 'react'
import { notFound } from 'next/navigation'
import { GAMES } from '@/features/games/registry'
import { useProgress } from '@/hooks/useProgress'
import { useTimer } from '@/hooks/useTimer'
import { useUser } from '@/hooks/useUser'
import { calcPoints } from '@/lib/scoring'
import GameHeader from '@/components/GameHeader'
import CompletionOverlay from '@/components/CompletionOverlay'
import UsernameDialog from '@/components/UsernameDialog'

export default function GameClient({ id }: { id: string }) {
  const game = GAMES.find(g => g.id === id)
  if (!game) notFound()

  const { progress, submitResult } = useProgress()
  const { elapsed, stop } = useTimer()
  const { user, isRegistered } = useUser()
  const [restartKey, setRestartKey] = useState(0)
  const [result, setResult] = useState<{ elapsed: number; points: number } | null>(null)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)

  const handleComplete = () => {
    const finalTime = stop()
    const points = calcPoints(game.maxPoints, finalTime)
    submitResult(game.id, finalTime, points, user?.id)
    setResult({ elapsed: finalTime, points })
    if (!isRegistered) setShowUsernameDialog(true)
  }

  const handleRestart = () => {
    setResult(null)
    setShowUsernameDialog(false)
    setRestartKey(k => k + 1)
  }

  const GameComponent = game.component
  const previous = progress[game.id] ?? null

  return (
    <div className="-mx-4 -mt-8">
      <GameHeader game={game} elapsed={elapsed} onRestart={handleRestart} />
      <div className="px-4 py-8">
        <GameComponent key={restartKey} onComplete={handleComplete} />
      </div>
      {showUsernameDialog && (
        <UsernameDialog onClose={() => setShowUsernameDialog(false)} />
      )}
      {result && !showUsernameDialog && (
        <CompletionOverlay
          elapsed={result.elapsed}
          points={result.points}
          previous={previous}
          onPlayAgain={handleRestart}
        />
      )}
    </div>
  )
}
