'use client'
import { useState } from 'react'
import { useProgress } from '@/hooks/useProgress'

export default function ResetButton() {
  const { resetProgress } = useProgress()
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">Are you sure? This cannot be undone.</span>
        <button
          onClick={() => { resetProgress(); setConfirming(false) }}
          className="text-sm font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
    >
      Reset progress
    </button>
  )
}
