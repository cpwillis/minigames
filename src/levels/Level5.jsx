import { useState } from 'react'
import './Level5.css'

const RIDDLE = `The more you code, the more of me there is.
You try to squash me, but I always come back.
What am I?`

const CHOICES = ['🔥', '💾', '🐛', '⚙️', '💥']
const ANSWER = 2

export default function Level5({ onComplete }) {
  const [selected, setSelected] = useState(null)
  const [won, setWon] = useState(false)

  const pick = (i) => {
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
    <div className="level5">
      <h2>Riddle Box</h2>
      <div className="riddle-box">
        <p className="riddle-text">{RIDDLE}</p>
      </div>
      <div className="choices">
        {CHOICES.map((emoji, i) => (
          <button
            key={i}
            className={`choice${selected === i ? (won ? ' correct' : ' wrong') : ''}`}
            onClick={() => pick(i)}
          >
            {emoji}
          </button>
        ))}
      </div>
      {won && <p className="win-msg">It&apos;s a Bug! 🏆</p>}
    </div>
  )
}
