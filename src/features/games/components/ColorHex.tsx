'use client'
import { useState } from 'react'

export const meta = {
  id: 'color-hex',
  title: 'Color Hex',
  description: 'Pick the color swatch matching the hex code.',
  icon: '🎨',
  difficulty: 'easy' as const,
  maxPoints: 500,
  order: 12,
}

const ALL_COLORS = [
  { hex: '#ef4444', name: 'Red' },
  { hex: '#f97316', name: 'Orange' },
  { hex: '#eab308', name: 'Yellow' },
  { hex: '#22c55e', name: 'Green' },
  { hex: '#14b8a6', name: 'Teal' },
  { hex: '#3b82f6', name: 'Blue' },
  { hex: '#8b5cf6', name: 'Purple' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#64748b', name: 'Slate' },
  { hex: '#78716c', name: 'Stone' },
  { hex: '#f43f5e', name: 'Rose' },
  { hex: '#06b6d4', name: 'Cyan' },
]

const TOTAL_ROUNDS = 6

interface Round {
  target: typeof ALL_COLORS[0]
  options: typeof ALL_COLORS
}

function pickRounds(): Round[] {
  const shuffled = [...ALL_COLORS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, TOTAL_ROUNDS).map((target, i) => {
    const others = shuffled.filter((_, j) => j !== i).sort(() => Math.random() - 0.5).slice(0, 3)
    const options = [...others, target].sort(() => Math.random() - 0.5)
    return { target, options }
  })
}

export default function ColorHex({ onComplete }: { onComplete: () => void }) {
  const [rounds] = useState(pickRounds)
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)

  const { target, options } = rounds[round]

  const pick = (hex: string) => {
    if (selected !== null) return
    setSelected(hex)
    if (hex === target.hex) setCorrect(c => c + 1)
    setTimeout(() => {
      if (round + 1 >= TOTAL_ROUNDS) {
        setTimeout(onComplete, 300)
      } else {
        setRound(r => r + 1)
        setSelected(null)
      }
    }, 700)
  }

  return (
    <div className="space-y-5 max-w-xs">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Round {round + 1} / {TOTAL_ROUNDS}</span>
        <span>{correct} correct</span>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 text-center">
        <p className="font-mono text-2xl font-bold text-gray-900 dark:text-gray-100">{target.hex}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map(opt => {
          let ringCls = ''
          if (selected !== null) {
            if (opt.hex === target.hex) ringCls = ' ring-2 ring-green-500'
            else if (opt.hex === selected) ringCls = ' ring-2 ring-red-500 opacity-60'
          }
          return (
            <button
              key={opt.hex}
              onClick={() => pick(opt.hex)}
              disabled={selected !== null}
              className={`h-20 rounded-xl transition-transform ${selected === null ? 'hover:scale-105 cursor-pointer' : ''}${ringCls}`}
              style={{ backgroundColor: opt.hex }}
              aria-label={opt.name}
            />
          )
        })}
      </div>
    </div>
  )
}
