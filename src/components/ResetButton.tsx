'use client'
import { useState } from 'react'
import { useProgress } from '@/hooks/useProgress'

export default function ResetButton() {
  const { resetProgress } = useProgress()
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button onClick={() => setConfirming(true)} className="btn text-muted hover:text-bad">
        Reset progress
      </button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-bad/30 bg-bad-soft/40 p-3">
      <span className="text-sm text-fg">Erase all local progress? This cannot be undone.</span>
      <button
        onClick={() => { resetProgress(); setConfirming(false) }}
        className="text-sm font-medium text-bad transition-opacity hover:opacity-80"
      >
        Reset
      </button>
      <button onClick={() => setConfirming(false)} className="text-sm text-muted transition-colors hover:text-fg">
        Cancel
      </button>
    </div>
  )
}
