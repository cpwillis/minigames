'use client'
import { useState, useEffect } from 'react'
import { useProgress } from '@/hooks/useProgress'
import { useUser } from '@/hooks/useUser'
import { GAMES } from '@/features/games/registry'
import { formatTime } from '@/lib/utils'
import { api, type LeaderboardEntry } from '@/lib/api'
import Link from 'next/link'

export default function LeaderboardPage() {
  const { progress, totalPoints } = useProgress()
  const { user } = useUser()
  const [tab, setTab] = useState<'global' | 'mine'>('global')
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.getLeaderboard()
      .then(data => setRows(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const completed = Object.keys(progress).length
  const totalGames = GAMES.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Leaderboard</h1>
      </div>

      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
        {(['global', 'mine'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px',
              tab === t
                ? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'global' && (
        <div>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Could not load leaderboard.{' '}
              <button
                onClick={() => { setError(false); setLoading(true); api.getLeaderboard().then(setRows).catch(() => setError(true)).finally(() => setLoading(false)) }}
                className="underline hover:no-underline"
              >
                Retry
              </button>
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No scores yet. Be the first!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    <th className="pb-2 font-medium w-8">#</th>
                    <th className="pb-2 font-medium">Player</th>
                    <th className="pb-2 font-medium text-right">Games</th>
                    <th className="pb-2 font-medium text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const isYou = user?.id === row.user_id
                    return (
                      <tr
                        key={row.user_id}
                        className={[
                          'border-b border-gray-100 dark:border-gray-800/50',
                          isYou ? 'bg-green-50 dark:bg-green-900/10' : '',
                        ].join(' ')}
                      >
                        <td className="py-2.5 text-gray-400 dark:text-gray-600 tabular-nums">{i + 1}</td>
                        <td className="py-2.5 text-gray-900 dark:text-gray-100">
                          {row.display_name}
                          {isYou && <span className="ml-2 text-xs text-green-600 dark:text-green-400">you</span>}
                        </td>
                        <td className="py-2.5 text-right text-gray-500 dark:text-gray-400 tabular-nums">{row.games_completed}/{totalGames}</td>
                        <td className="py-2.5 text-right font-mono text-gray-900 dark:text-gray-100 tabular-nums">{row.total_points.toLocaleString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'mine' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalPoints.toLocaleString()} pts total &bull; {completed}/{totalGames} completed
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="pb-2 font-medium">Game</th>
                  <th className="pb-2 font-medium">Difficulty</th>
                  <th className="pb-2 font-medium text-right">Best time</th>
                  <th className="pb-2 font-medium text-right">Points</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {GAMES.map(game => {
                  const record = progress[game.id]
                  return (
                    <tr key={game.id} className="border-b border-gray-100 dark:border-gray-800/50">
                      <td className="py-2.5 text-gray-900 dark:text-gray-100">
                        {record && <span className="text-green-500 mr-1.5">&#10003;</span>}
                        {game.title}
                      </td>
                      <td className="py-2.5 text-gray-500 dark:text-gray-400 capitalize">{game.difficulty}</td>
                      <td className="py-2.5 text-right font-mono text-gray-500 dark:text-gray-400 tabular-nums">
                        {record ? formatTime(record.bestTime) : '—'}
                      </td>
                      <td className="py-2.5 text-right font-mono text-gray-900 dark:text-gray-100 tabular-nums">
                        {record ? record.bestPoints.toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link href={`/${game.id}`} className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
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
      )}
    </div>
  )
}
