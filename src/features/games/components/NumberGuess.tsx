'use client'
import { useState, useRef } from 'react'

export const meta = {
  id: 'number-guess' as const,
  title: 'Number Guess',
  description: 'Guess the secret number between 1 and 100.',
  icon: '🎲',
  difficulty: 'easy' as const,
  maxPoints: 500,
  order: 6,
}

function hint(guess: number, target: number): string {
  const diff = Math.abs(guess - target)
  if (diff === 0) return ''
  if (diff <= 5) return guess < target ? '🔥 Getting hot! Go higher.' : '🔥 Getting hot! Go lower.'
  if (diff <= 15) return guess < target ? '↑ Too low.' : '↓ Too high.'
  return guess < target ? '↑ Way too low.' : '↓ Way too high.'
}

export default function NumberGuess({ onComplete }: { onComplete: () => void }) {
  const target = useRef(Math.floor(Math.random() * 100) + 1)
  const [input, setInput] = useState('')
  const [guesses, setGuesses] = useState<{ value: number; hint: string }[]>([])
  const [won, setWon] = useState(false)

  const submit = () => {
    const n = parseInt(input)
    if (isNaN(n) || n < 1 || n > 100) return
    const h = hint(n, target.current)
    setGuesses(prev => [{ value: n, hint: h }, ...prev])
    setInput('')
    if (n === target.current) {
      setWon(true)
      setTimeout(onComplete, 800)
    }
  }

  return (
    <div className="space-y-5 max-w-sm">
      <p className="text-sm text-muted">
        I&apos;m thinking of a number between <strong className="text-fg">1</strong> and <strong className="text-fg">100</strong>.
      </p>
      {!won && (
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={100}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            className="field w-28"
            placeholder="1–100"
          />
          <button
            onClick={submit}
            className="btn"
          >
            Guess
          </button>
        </div>
      )}
      <ul className="space-y-1.5">
        {guesses.map((g, i) => (
          <li key={i} className={[
            'flex items-center gap-3 text-sm rounded-md px-3 py-1.5',
            g.hint === ''
              ? 'bg-ok-soft text-accent font-medium'
              : 'bg-sunken text-muted',
          ].join(' ')}>
            <span className="font-mono font-bold w-8 text-right">{g.value}</span>
            <span>{g.hint === '' ? '✓ Correct!' : g.hint}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
