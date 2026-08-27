'use client'
import { useState } from 'react'

export const meta = {
  id: 'regex-match' as const,
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
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Round {round + 1} / {rounds.length}</span>
        <span>{score} correct</span>
      </div>

      <div className="rounded-lg border border-line bg-sunken p-4">
        <p className="text-xs text-muted mb-1">Pattern</p>
        <p className="font-mono text-base text-fg">/{current.pattern}/</p>
      </div>

      <p className="text-sm text-muted">Select all strings that match:</p>

      <div className="space-y-2">
        {current.strings.map((s, i) => {
          const isMatch = current.regex.test(s)
          let cls = 'flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors'
          if (submitted) {
            if (isMatch) {
              cls += checked.has(i)
                ? ' border-accent bg-ok-soft'
                : ' border-accent bg-ok-soft opacity-60'
            } else {
              cls += checked.has(i)
                ? ' border-bad bg-bad-soft'
                : ' border-line bg-surface'
            }
          } else {
            cls += checked.has(i)
              ? ' border-accent bg-ok-soft'
              : ' border-line bg-surface hover:border-line-strong'
          }
          return (
            <label key={i} className={cls}>
              <input
                type="checkbox"
                checked={checked.has(i)}
                onChange={() => toggle(i)}
                disabled={submitted}
                className="accent-[var(--c-accent)]"
              />
              <span className="font-mono text-sm text-fg">{s}</span>
            </label>
          )
        })}
      </div>

      {!submitted ? (
        <button
          onClick={submit}
          className="btn"
        >
          Submit
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted">
            Matches: {[...correctSet].map(i => current.strings[i]).join(', ')}
          </p>
          <button
            onClick={next}
            className="btn"
          >
            {round + 1 >= rounds.length ? 'Finish' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
