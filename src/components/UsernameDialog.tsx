'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'

export default function UsernameDialog({ onClose }: { onClose: () => void }) {
  const { register, registerAnonymous } = useUser()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    const result = await register(name)
    setLoading(false)
    if (result.ok) onClose()
    else setError(result.error ?? 'Invalid name')
  }

  const skip = () => {
    registerAnonymous()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-title"
        className="card w-full max-w-sm space-y-5 p-8 shadow-xl"
      >
        <div className="space-y-1">
          <h2 id="name-title" className="text-base font-semibold text-fg">
            Choose a display name
          </h2>
          <p className="text-sm text-muted">
            This shows publicly on the leaderboard. Don&apos;t use anything personal.
          </p>
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
              aria-label="Display name"
              aria-invalid={!!error}
              aria-describedby="name-help"
              className="field"
              autoFocus
            />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-faint">
              {name.length}/20
            </span>
          </div>
          {error && (
            <p role="alert" className="text-xs text-bad">{error}</p>
          )}
          <p id="name-help" className="text-xs text-faint">
            Letters, numbers and spaces only (1&ndash;20 characters).
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={skip} className="btn flex-1 text-muted">
            Skip
          </button>
          <button onClick={save} disabled={loading || !name.trim()} className="btn-primary flex-1">
            {loading ? 'Saving…' : 'Save name'}
          </button>
        </div>

        <p className="text-xs text-faint">
          Saving a name stores it with your scores.{' '}
          <Link href="/legal" className="underline underline-offset-2 hover:text-muted">
            What gets stored
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
