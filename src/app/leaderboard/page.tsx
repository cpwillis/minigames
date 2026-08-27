'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useProgress } from '@/hooks/useProgress'
import { useUser } from '@/hooks/useUser'
import { GAMES } from '@/features/games/registry'
import { formatTime } from '@/lib/utils'
import { api, type LeaderboardEntry, type HistoryEntry } from '@/lib/api'

const TABS = [
  { id: 'global', label: 'Global' },
  { id: 'mine', label: 'Mine' },
  { id: 'history', label: 'History' },
] as const

const TITLES: Record<string, string> = Object.fromEntries(GAMES.map(g => [g.id, g.title]))

function formatWhen(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

type Tab = typeof TABS[number]['id']

export default function LeaderboardPage() {
  const { progress, totalPoints } = useProgress()
  const { user } = useUser()
  const [tab, setTab] = useState<Tab>('global')
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[] | null>(null)
  const [historyError, setHistoryError] = useState(false)

  // One loader for the first fetch and the retry: they had drifted into two copies.
  const load = useCallback(() => {
    setError(false)
    setLoading(true)
    api.getLeaderboard()
      .then(setRows)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(load, [load])

  // Every attempt, not just the personal best that the Mine tab shows. Server-side and
  // authenticated, so it only exists once a name has been saved.
  useEffect(() => {
    if (tab !== 'history' || !user || user.anonymous || history) return
    api.getHistory(user.id, user.secret)
      .then(setHistory)
      .catch(() => setHistoryError(true))
  }, [tab, user, history])

  const completed = Object.keys(progress).length

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Leaderboard</h1>
        <p className="text-sm text-muted">
          Scores are worked out in your browser, so treat this as decoration rather than a record.
        </p>
      </div>

      <div role="tablist" aria-label="Leaderboard view" className="flex gap-1 border-b border-line">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? 'border-accent text-fg'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'global' ? (
        loading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-sunken" />
            ))}
          </div>
        ) : error ? (
          <div className="panel flex flex-wrap items-center gap-3 p-4">
            <p className="text-sm text-muted">Could not load the leaderboard.</p>
            <button onClick={load} className="btn">Retry</button>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted">No scores yet. Be the first.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Top players by total points</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="w-8 pb-2 font-medium">#</th>
                  <th scope="col" className="pb-2 font-medium">Player</th>
                  <th scope="col" className="pb-2 text-right font-medium">Games</th>
                  <th scope="col" className="pb-2 text-right font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isYou = user?.id === row.user_id
                  return (
                    <tr key={row.user_id} className={`border-b border-line ${isYou ? 'bg-accent-soft' : ''}`}>
                      <td className="py-2.5 tabular-nums text-faint">{i + 1}</td>
                      <td className="py-2.5 text-fg">
                        {row.display_name}
                        {isYou && <span className="ml-2 text-xs text-accent">you</span>}
                      </td>
                      <td className="py-2.5 text-right tabular-nums text-muted">
                        {row.games_completed}/{GAMES.length}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-fg">
                        {row.total_points.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : tab === 'mine' ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            <span className="font-medium text-fg">{totalPoints.toLocaleString()}</span> points
            &middot; {completed}/{GAMES.length} completed
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Your best result for each game</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="pb-2 font-medium">Game</th>
                  <th scope="col" className="pb-2 font-medium">Difficulty</th>
                  <th scope="col" className="pb-2 text-right font-medium">Best time</th>
                  <th scope="col" className="pb-2 text-right font-medium">Points</th>
                  <th scope="col" className="pb-2"><span className="sr-only">Play</span></th>
                </tr>
              </thead>
              <tbody>
                {GAMES.map(game => {
                  const record = progress[game.id]
                  return (
                    <tr key={game.id} className="border-b border-line">
                      <td className="py-2.5 text-fg">
                        {record && <span aria-hidden="true" className="mr-1.5 text-accent">&#10003;</span>}
                        {game.title}
                      </td>
                      <td className="py-2.5 capitalize text-muted">{game.difficulty}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-muted">
                        {record ? formatTime(record.bestTime) : '—'}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-fg">
                        {record ? record.bestPoints.toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/${game.id}`}
                          className="text-xs text-faint transition-colors hover:text-fg"
                        >
                          Play
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : !user || user.anonymous ? (
        <p className="text-sm text-muted">
          Save a display name in{' '}
          <Link href="/settings" className="underline underline-offset-2 hover:text-fg">Settings</Link>{' '}
          to keep a history of your runs.
        </p>
      ) : historyError ? (
        <div className="panel flex flex-wrap items-center gap-3 p-4">
          <p className="text-sm text-muted">Could not load your history.</p>
          <button onClick={() => { setHistoryError(false); setHistory(null) }} className="btn">Retry</button>
        </div>
      ) : history === null ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-sunken" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-sm text-muted">No runs recorded yet.</p>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Every run, newest first. The Mine tab shows only your best for each game.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Every run you have completed</caption>
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th scope="col" className="pb-2 font-medium">Game</th>
                  <th scope="col" className="pb-2 font-medium">When</th>
                  <th scope="col" className="pb-2 text-right font-medium">Time</th>
                  <th scope="col" className="pb-2 text-right font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {history.map((run, i) => (
                  <tr key={`${run.game_id}-${run.created_at}-${i}`} className="border-b border-line">
                    <td className="py-2.5 text-fg">{TITLES[run.game_id] ?? run.game_id}</td>
                    <td className="py-2.5 text-muted">{formatWhen(run.created_at)}</td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-muted">
                      {formatTime(run.elapsed_time)}
                    </td>
                    <td className="py-2.5 text-right font-mono tabular-nums text-fg">
                      {run.points.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}