'use client'
import { useState, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { useUser } from '@/hooks/useUser'
import { useProgress } from '@/hooks/useProgress'
import { GAMES } from '@/features/games/registry'
import ResetButton from '@/components/ResetButton'

function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-fg">{title}</h2>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, isRegistered, register, updateName } = useUser()
  const { progress, totalPoints } = useProgress()

  // useState only reads its initialiser once, and `user` is null on that first render because
  // localStorage has not been read yet, so a saved name never appeared in the field.
  const [name, setName] = useState('')
  const [edited, setEdited] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSaved, setNameSaved] = useState(false)
  const [nameLoading, setNameLoading] = useState(false)

  useEffect(() => {
    if (!edited && user) setName(user.displayName)
  }, [user, edited])

  const saveName = async () => {
    if (nameLoading) return
    setNameLoading(true)
    setNameError('')
    setNameSaved(false)
    const result = isRegistered ? await updateName(name) : await register(name)
    setNameLoading(false)
    if (result.ok) {
      setEdited(false)
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
    } else {
      setNameError(result.error ?? 'Failed to save')
    }
  }

  const completed = Object.keys(progress).length

  return (
    <div className="max-w-lg space-y-10">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Settings</h1>

      <Section title="Profile" description="Shown publicly on the leaderboard. Don't use anything personal.">
        <div className="space-y-2">
          <label htmlFor="display-name" className="block text-xs text-muted">
            Display name
          </label>
          <div className="flex gap-2">
            <input
              id="display-name"
              type="text"
              value={name}
              onChange={e => { setEdited(true); setName(e.target.value); setNameError(''); setNameSaved(false) }}
              onKeyDown={e => e.key === 'Enter' && saveName()}
              maxLength={20}
              placeholder="your name"
              aria-invalid={!!nameError}
              aria-describedby="display-name-help"
              className="field"
            />
            <button onClick={saveName} disabled={nameLoading || !name.trim()} className="btn shrink-0">
              {nameLoading ? 'Saving…' : nameSaved ? 'Saved' : 'Save'}
            </button>
          </div>
          {nameError && (
            <p role="alert" className="text-xs text-bad">{nameError}</p>
          )}
          <p id="display-name-help" className="text-xs text-faint">
            Letters, numbers and spaces only (1&ndash;20 characters).
          </p>
        </div>

        {user?.id && (
          <div className="space-y-1">
            <p className="text-xs text-muted">Player ID</p>
            <p className="break-all font-mono text-xs text-faint">{user.id}</p>
            <p className="text-xs text-faint">
              A random identifier held in this browser, alongside a secret that proves you own it.
              Clearing site data destroys both, and starts you over.
            </p>
          </div>
        )}
      </Section>

      <Section title="Appearance">
        <div role="group" aria-label="Theme" className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                theme === t
                  ? 'border-transparent bg-fg text-bg'
                  : 'border-line bg-surface text-fg hover:border-line-strong'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Progress" description="Stored in this browser only.">
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">{completed}</span> of {GAMES.length} games completed
          &middot; <span className="font-medium text-fg">{totalPoints.toLocaleString()}</span> points.
        </p>
        <ResetButton />
      </Section>

      <Section title="Data">
        <p className="text-sm leading-relaxed text-muted">
          No cookies and no advertising. Page views are counted by Cloudflare Web Analytics, which
          is cookieless and does not fingerprint you or follow you to other sites. If you saved a
          display name, it is stored on the server alongside your times, points and a record of each
          run, and nothing else.{' '}
          <a
            href="https://cpwillis.dev/privacy"
            className="underline underline-offset-2 hover:text-fg"
          >
            Privacy
          </a>
          .
        </p>
      </Section>
    </div>
  )
}
