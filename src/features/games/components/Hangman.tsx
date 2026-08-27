'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export const meta = {
  id: 'hangman' as const,
  title: 'Hangman',
  description: 'Guess the hidden tech term letter by letter.',
  icon: '🪝',
  difficulty: 'medium' as const,
  maxPoints: 750,
  order: 7,
}

const WORDS = [
  'RECURSION', 'DEPLOYMENT', 'COMPILER', 'REFACTOR', 'MIDDLEWARE',
  'ABSTRACTION', 'POLYMORPHISM', 'DEBUGGING', 'ALGORITHM', 'REPOSITORY',
  'INTERFACE', 'PROTOTYPE', 'ITERATION', 'DEPENDENCY', 'EXCEPTION',
]
const MAX_WRONG = 6
const GALLOWS = ['', '😟', '😟🦴', '😟🦴🦴', '😟🦴🦴🦵', '😟🦴🦴🦵🦵', '💀']

export default function Hangman({ onComplete }: { onComplete: () => void }) {
  const word = useRef(WORDS[Math.floor(Math.random() * WORDS.length)])
  const [guessed, setGuessed] = useState(new Set<string>())
  const [won, setWon] = useState(false)

  const wrong = [...guessed].filter(l => !word.current.includes(l))
  const wrongCount = wrong.length
  const lost = wrongCount >= MAX_WRONG
  const revealed = [...word.current].map(l => guessed.has(l) ? l : '_')
  const isWon = revealed.every(l => l !== '_')

  useEffect(() => {
    if (isWon && !won) {
      setWon(true)
      setTimeout(onComplete, 800)
    }
  }, [isWon, won, onComplete])

  const over = lost || isWon

  const guess = useCallback((letter: string) => {
    if (over) return
    setGuessed(prev => prev.has(letter) ? prev : new Set([...prev, letter]))
  }, [over])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const l = e.key.toUpperCase()
      if (/^[A-Z]$/.test(l)) guess(l)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [guess])

  return (
    <div className="space-y-5 max-w-md">
      <div className="flex items-center justify-between">
        <p className="text-4xl">{GALLOWS[wrongCount]}</p>
        <p className="text-sm text-muted">
          {MAX_WRONG - wrongCount} guesses left
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {revealed.map((l, i) => (
          <span
            key={i}
            className="w-8 h-10 border-b-2 border-line-strong flex items-end justify-center pb-1 font-mono text-lg font-bold text-fg"
          >
            {l !== '_' ? l : ''}
          </span>
        ))}
      </div>

      {wrong.length > 0 && (
        <p className="text-sm text-muted">
          Wrong: {wrong.map(l => (
            <span key={l} className="font-mono text-bad mr-1">{l}</span>
          ))}
        </p>
      )}

      {lost ? (
        <p className="text-bad font-medium">The word was: <span className="font-mono">{word.current}</span></p>
      ) : isWon ? (
        <p className="text-accent font-medium">Correct! 🎉</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
            <button
              key={l}
              onClick={() => guess(l)}
              disabled={guessed.has(l)}
              className={[
                'w-8 h-8 rounded text-sm font-mono font-medium transition-colors',
                guessed.has(l)
                  ? word.current.includes(l)
                    ? 'bg-accent-soft text-accent border border-accent'
                    : 'bg-sunken text-faint border border-line'
                  : 'bg-surface border border-line text-fg hover:border-accent',
              ].join(' ')}
            >
              {l}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
