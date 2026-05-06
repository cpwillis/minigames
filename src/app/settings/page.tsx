'use client'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useUser } from '@/hooks/useUser'
import { useProgress } from '@/hooks/useProgress'
import ResetButton from '@/components/ResetButton'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, isRegistered, register, updateName } = useUser()
  const { progress } = useProgress()

  const [name, setName] = useState(user?.displayName ?? '')
  const [nameError, setNameError] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [nameLoading, setNameLoading] = useState(false)

  const saveName = async () => {
    setNameLoading(true)
    setNameError('')
    setNameSaved(false)
    const result = isRegistered ? await updateName(name) : await register(name)
    setNameLoading(false)
    if (result.ok) {
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
    } else {
      setNameError(result.error ?? 'Failed to save')
    }
  }

  const completed = Object.keys(progress).length

  return (
    <div className="space-y-10 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Profile</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Display name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setNameError(''); setNameSaved(false) }}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                maxLength={20}
                placeholder="your name"
                className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-green-500"
              />
              <button
                onClick={saveName}
                disabled={nameLoading || !name.trim()}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {nameLoading ? 'Saving...' : nameSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
            {nameError && <p className="text-xs text-red-500">{nameError}</p>}
            <p className="text-xs text-gray-400 dark:text-gray-600">Letters, numbers, and spaces only (1&ndash;20 chars)</p>
          </div>
          {user?.id && (
            <div className="space-y-1">
              <label className="text-xs text-gray-500 dark:text-gray-400">Player ID</label>
              <p className="font-mono text-xs text-gray-400 dark:text-gray-600 break-all">{user.id}</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Appearance</h2>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={[
                'flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors',
                theme === t
                  ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">Progress</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{completed} game{completed !== 1 ? 's' : ''} completed.</p>
        <ResetButton />
      </section>
    </div>
  )
}
