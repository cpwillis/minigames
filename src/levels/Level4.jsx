import { useState, useEffect } from 'react'
import './Level4.css'

const EMOJIS = ['🐶', '🐱', '🐻', '🦊', '🐸', '🐧', '🦁', '🐯']

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function initCards() {
  return shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
    id: i, emoji, flipped: false, matched: false,
  }))
}

export default function Level4({ onComplete }) {
  const [cards, setCards] = useState(initCards)
  const [flipped, setFlipped] = useState([])
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    if (cards[a].emoji === cards[b].emoji) {
      setCards(prev => prev.map((c, i) =>
        i === a || i === b ? { ...c, matched: true } : c
      ))
      setFlipped([])
    } else {
      setLocked(true)
      setTimeout(() => {
        setCards(prev => prev.map((c, i) =>
          i === a || i === b ? { ...c, flipped: false } : c
        ))
        setFlipped([])
        setLocked(false)
      }, 900)
    }
  }, [flipped])

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.matched)) {
      setTimeout(onComplete, 600)
    }
  }, [cards, onComplete])

  const flip = (i) => {
    if (locked || cards[i].flipped || cards[i].matched || flipped.length >= 2) return
    setCards(prev => prev.map((c, j) => j === i ? { ...c, flipped: true } : c))
    setFlipped(prev => [...prev, i])
  }

  return (
    <div className="level4">
      <h2>Memory Match</h2>
      <p className="hint">Flip cards to find all matching pairs.</p>
      <div className="card-grid">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`card${card.flipped || card.matched ? ' face-up' : ''}${card.matched ? ' matched' : ''}`}
            onClick={() => flip(i)}
          >
            <div className="card-inner">
              <div className="card-front">{card.emoji}</div>
              <div className="card-back">?</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
