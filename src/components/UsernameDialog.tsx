'use client'
import { useState } from 'react'
import { useUser } from '@/hooks/useUser'

interface UsernameDialogProps {
  onClose: () => void
}

export default function UsernameDialog({ onClose }: UsernameDialogProps) {
  const { register, registerAnonymous } = useUser()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const save = async () => {
    setLoading(true)
    setError('')
    const result = await register(name)
    setLoading(false)
    if (result.ok) {
      onClose()
    } else {
      setError(result.error ?? 'Invalid name')
    }
  }

  const skip = () => {
    registerAnonymous()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl p-8 w-full max-w-sm space-y-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Choose a display name</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">This appears on the leaderboard.</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && save()}
              maxLength={20}
              placeholder="your name"
              className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-green-500"
              autoFocus
            />
            <span className="text-xs text-gray-400 dark:text-gray-600 tabular-nums w-8 text-right">{name.length}/20</span>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <p className="text-xs text-gray-400 dark:text-gray-600">Letters, numbers, and spaces only (1&ndash;20 chars)</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={skip}
            className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={save}
            disabled={loading || !name.trim()}
            className="flex-1 rounded-lg border border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 px-4 py-2 text-sm font-medium text-white dark:text-gray-900 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Saving...' : 'Save name'}
          </button>
        </div>
      </div>
    </div>
  )
}
