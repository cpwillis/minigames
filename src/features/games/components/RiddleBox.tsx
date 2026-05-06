'use client'
import { useState } from 'react'

export const meta = {
  id: 'riddle-box',
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

const CHOICES = ['🔥', '💾', '🐛', '⚙️', '💥']
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
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5">
        <p className="text-base leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">{RIDDLE}</p>
      </div>
      <div className="flex gap-3 flex-wrap">
        {CHOICES.map((emoji, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className={[
              'w-16 h-16 text-3xl rounded-xl border transition-all',
              selected === i
                ? won
                  ? 'border-green-500 bg-[var(--game-correct-bg)] scale-110'
                  : 'border-red-500 bg-[var(--game-wrong-bg)] animate-[shake_0.4s_ease]'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 hover:-translate-y-0.5',
            ].join(' ')}
          >
            {emoji}
          </button>
        ))}
      </div>
      {won && <p className="text-amber-600 dark:text-amber-400 font-medium">It&apos;s a Bug! 🏆</p>}
    </div>
  )
}
