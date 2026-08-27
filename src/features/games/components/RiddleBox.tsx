'use client'
import { useState } from 'react'

export const meta = {
  id: 'riddle-box' as const,
  title: 'Riddle Box',
  description: 'Solve the developer-themed riddle with the right emoji.',
  icon: '🎭',
  difficulty: 'easy' as const,
  maxPoints: 500,
  order: 5,
}

const RIDDLE = `The more you code, the more of me there is.
You try to squash me, but I always come back.
What am I?`

const CHOICES = [
  { emoji: '\u{1F525}', label: 'Fire' },
  { emoji: '\u{1F4BE}', label: 'Floppy disk' },
  { emoji: '\u{1F41B}', label: 'Bug' },
  { emoji: '\u2699\uFE0F', label: 'Gear' },
  { emoji: '\u{1F4A5}', label: 'Explosion' },
]
const ANSWER = 2

export default function RiddleBox({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [won, setWon] = useState(false)

  const pick = (i: number) => {
    if (won) return
    setSelected(i)
    if (i === ANSWER) {
      setWon(true)
      setTimeout(onComplete, 1000)
    } else {
      setTimeout(() => setSelected(null), 800)
    }
  }

  return (
    <div className="space-y-6 max-w-md">
      <div className="rounded-lg border border-line bg-sunken p-5">
        <p className="text-base leading-relaxed whitespace-pre-line text-fg">{RIDDLE}</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        {CHOICES.map((choice, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            aria-label={choice.label}
            className={[
              'w-16 h-16 text-3xl rounded-xl border transition-all',
              selected === i
                ? won
                  ? 'border-accent bg-ok-soft scale-110'
                  : 'border-bad bg-bad-soft animate-[shake_0.4s_ease]'
                : 'border-line bg-surface hover:bg-sunken hover:-translate-y-0.5',
            ].join(' ')}
          >
            <span aria-hidden="true">{choice.emoji}</span>
          </button>
        ))}
      </div>
      {won && <p className="text-warn font-medium">It&apos;s a Bug! 🏆</p>}
    </div>
  )
}
