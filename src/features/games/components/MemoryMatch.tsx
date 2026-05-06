'use client'
import { useState, useEffect } from 'react'
import './MemoryMatch.css'

export const meta = {
  id: 'memory-match',
  title: 'Memory Match',
  description: 'Flip cards to find all matching emoji pairs.',
  icon: '🃏',
  difficulty: 'medium' as const,
  maxPoints: 750,
  order: 4,
}

const EMOJIS = ['🐶', '🐱', '🐻', '🦊', '🐸', '🐧', '🦁', '🐯']

interface Card {
  id: number
  emoji: string
  flipped: boolean
  matched: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function initCards(): Card[] {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i, emoji, flipped: false, matched: false,
  }))
}

export default function MemoryMatch({ onComplete }: { onComplete: () => void }) {
  const [cards, setCards] = useState<Card[]>(initCards)
  const [flipped, setFlipped] = useState<number[]>([])
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    if (cards[a].emoji === cards[b].emoji) {
      setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, matched: true } : c))
      setFlipped([])
    } else {
      setLocked(true)
      setTimeout(() => {
        setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c))
        setFlipped([])
        setLocked(false)
      }, 900)
    }
  }, [flipped]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) setTimeout(onComplete, 600)
  }, [cards, onComplete])

  const flip = (i: number) => {
    if (locked || cards[i].flipped || cards[i].matched || flipped.length >= 2) return
    setCards(prev => prev.map((c, j) => j === i ? { ...c, flipped: true } : c))
    setFlipped(prev => [...prev, i])
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">Flip cards to find all matching pairs.</p>
      <div className="card-grid">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`card${card.flipped || card.matched ? ' face-up' : ''}${card.matched ? ' matched' : ''}`}
            onClick={() => flip(i)}
          >
            <div className="card-inner">
              <div className="card-front border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">{card.emoji}</div>
              <div className="card-back border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 select-none">?</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
