'use client'
import { useState } from 'react'

export const meta = {
  id: 'regex-match',
  title: 'Regex Match',
  description: 'Select all strings that match the given regex pattern.',
  icon: '🔤',
  difficulty: 'hard' as const,
  maxPoints: 1000,
  order: 11,
}

interface Round {
  pattern: string
  regex: RegExp
  strings: string[]
}

const ALL_ROUNDS: Round[] = [
  {
    pattern: '^\\d{3}-\\d{4}$',
    regex: /^\d{3}-\d{4}$/,
    strings: ['555-1234', '55-12345', '555-123', '123-4567', 'abc-defg', '999-0000'],
  },
  {
    pattern: '^[A-Z][a-z]+$',
    regex: /^[A-Z][a-z]+$/,
    strings: ['Hello', 'world', 'Alice', 'BOB', 'Carol', 'dave'],
  },
  {
    pattern: '^https?://',
    regex: /^https?:\/\//,
    strings: ['http://example.com', 'https://site.io', 'ftp://files.net', 'https://', 'http://a.b', '//cdn.com'],
  },
  {
    pattern: '\\b\\w{4}\\b',
    regex: /\b\w{4}\b/,
    strings: ['home', 'hi', 'code', 'go', 'blog', 'test'],
  },
  {
    pattern: '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
    regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
    strings: ['user@example.com', 'bad@', 'a@b.co', '@missing.com', 'test.email@mail.org', 'no-at-sign.com'],
  },
  {
    pattern: '^-?\\d+(\\.\\d+)?$',
    regex: /^-?\d+(\.\d+)?$/,
    strings: ['42', '-7', '3.14', '1.', '.5', '-0.9'],
  },
]

function pickRounds(): Round[] {
  const shuffled = [...ALL_ROUNDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 4)
}

export default function RegexMatch({ onComplete }: { onComplete: () => void }) {
  const [rounds] = useState(pickRounds)
  const [round, setRound] = useState(0)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const current = rounds[round]
  const correctSet = new Set(current.strings.map((s, i) => current.regex.test(s) ? i : -1).filter(i => i >= 0))

  const toggle = (i: number) => {
    if (submitted) return
    setChecked(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const submit = () => {
    if (submitted) return
    setSubmitted(true)
    const allCorrect = [...correctSet].every(i => checked.has(i)) && [...checked].every(i => correctSet.has(i))
    if (allCorrect) setScore(s => s + 1)
  }

  const next = () => {
    if (round + 1 >= rounds.length) {
      setTimeout(onComplete, 300)
    } else {
      setRound(r => r + 1)
      setChecked(new Set())
      setSubmitted(false)
    }
  }

  return (
    <div className="space-y-5 max-w-md">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Round {round + 1} / {rounds.length}</span>
        <span>{score} correct</span>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pattern</p>
        <p className="font-mono text-base text-gray-900 dark:text-gray-100">/{current.pattern}/</p>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">Select all strings that match:</p>

      <div className="space-y-2">
        {current.strings.map((s, i) => {
          const isMatch = current.regex.test(s)
          let cls = 'flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors'
          if (submitted) {
            if (isMatch) {
              cls += checked.has(i)
                ? ' border-green-500 bg-[var(--game-correct-bg)]'
                : ' border-green-400 bg-[var(--game-correct-bg)] opacity-60'
            } else {
              cls += checked.has(i)
                ? ' border-red-400 bg-[var(--game-wrong-bg)]'
                : ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
            }
          } else {
            cls += checked.has(i)
              ? ' border-green-500 bg-[var(--game-correct-bg)]'
              : ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-500'
          }
          return (
            <label key={i} className={cls} onClick={() => toggle(i)}>
              <input
                type="checkbox"
                checked={checked.has(i)}
                onChange={() => toggle(i)}
                className="accent-green-500"
              />
              <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{s}</span>
            </label>
          )
        })}
      </div>

      {!submitted ? (
        <button
          onClick={submit}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Submit
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Matches: {[...correctSet].map(i => current.strings[i]).join(', ')}
          </p>
          <button
            onClick={next}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {round + 1 >= rounds.length ? 'Finish' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
