'use client'
import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { GAMES } from '@/features/games/registry'
import { useProgress } from '@/hooks/useProgress'
import { useTimer } from '@/hooks/useTimer'
import { useUser } from '@/hooks/useUser'
import { calcPoints } from '@/lib/scoring'
import type { GameRecord } from '@/features/games/types'
import GameHeader from '@/components/GameHeader'
import CompletionOverlay from '@/components/CompletionOverlay'
import UsernameDialog from '@/components/UsernameDialog'

export default function GameClient({ id }: { id: string }) {
  const game = GAMES.find(g => g.id === id)
  if (!game) notFound()

  const { progress, submitResult } = useProgress()
  const [restartKey, setRestartKey] = useState(0)
  const { elapsed, stop } = useTimer(restartKey)
  const { syncUser, isRegistered } = useUser()
  const [result, setResult] = useState<{ elapsed: number; points: number; previous: GameRecord | null } | null>(null)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  // Every game seeds itself with Math.random() during render, so the prerendered HTML never
  // matched the client's first paint and React threw a hydration error on all fifteen. Gate
  // the render here, once, rather than reworking each game's state initialiser.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleComplete = () => {
    const finalTime = stop()
    const points = calcPoints(game.maxPoints, finalTime)
    // Snapshot before submitting: submitResult overwrites progress[game.id] straight away.
    const previous = progress[game.id] ?? null
    submitResult(game.id, finalTime, points, syncUser)
    setResult({ elapsed: finalTime, points, previous })
    if (!isRegistered) setShowUsernameDialog(true)
  }

  const handleRestart = () => {
    setResult(null)
    setShowUsernameDialog(false)
    setRestartKey(k => k + 1)
  }

  const GameComponent = game.component

  return (
    <div className="-mx-4 -mt-10">
      <GameHeader game={game} elapsed={elapsed} onRestart={handleRestart} />
      <div className="px-4 py-8">
        {mounted
          ? <GameComponent key={restartKey} onComplete={handleComplete} />
          : <div className="h-72" aria-busy="true" aria-label="Loading game" />}
      </div>
      {showUsernameDialog && (
        <UsernameDialog onClose={() => setShowUsernameDialog(false)} />
      )}
      {result && !showUsernameDialog && (
        <CompletionOverlay
          elapsed={result.elapsed}
          points={result.points}
          previous={result.previous}
          onPlayAgain={handleRestart}
        />
      )}
    </div>
  )
}
