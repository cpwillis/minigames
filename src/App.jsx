import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import Level1 from './levels/Level1'
import Level2 from './levels/Level2'
import Level3 from './levels/Level3'
import Level4 from './levels/Level4'
import Level5 from './levels/Level5'
import './App.css'

const LEVELS = [
  { id: 1, icon: '🔍', title: 'Word Search', desc: 'Find hidden dev terms in the grid' },
  { id: 2, icon: '🔐', title: 'Caesar Cipher', desc: 'Decrypt the encoded message' },
  { id: 3, icon: '💻', title: 'Code Trivia', desc: 'Answer 3 developer questions' },
  { id: 4, icon: '🧠', title: 'Memory Match', desc: 'Match all emoji pairs' },
  { id: 5, icon: '🎁', title: 'Riddle Box', desc: 'Solve the developer riddle' },
]

const COOKIE_KEY = 'minigames-progress'

function App() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = Cookies.get(COOKIE_KEY)
      return saved ? JSON.parse(saved) : [false, false, false, false, false]
    } catch {
      return [false, false, false, false, false]
    }
  })
  const [currentLevel, setCurrentLevel] = useState(0)

  useEffect(() => {
    Cookies.set(COOKIE_KEY, JSON.stringify(progress), { expires: 30 })
  }, [progress])

  const completeLevel = (index) => {
    setProgress(prev => {
      const next = [...prev]
      next[index] = true
      return next
    })
    setTimeout(() => setCurrentLevel(0), 400)
  }

  const completedCount = progress.filter(Boolean).length
  const allDone = completedCount === 5

  const renderLevel = () => {
    const props = { onComplete: () => completeLevel(currentLevel - 1) }
    switch (currentLevel) {
      case 1: return <Level1 {...props} />
      case 2: return <Level2 {...props} />
      case 3: return <Level3 {...props} />
      case 4: return <Level4 {...props} />
      case 5: return <Level5 {...props} />
      default: return null
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">minigames</h1>
        <div className="progress-wrap">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(completedCount / 5) * 100}%` }} />
          </div>
          <span className="progress-label">{completedCount}/5</span>
        </div>
      </header>

      {currentLevel === 0 ? (
        <main className="home">
          {allDone ? (
            <div className="victory">
              <div className="victory-icon">🏆</div>
              <h2>All challenges complete.</h2>
              <p>You are built different.</p>
            </div>
          ) : (
            <p className="subtitle">Complete all 5 challenges to unlock the final reveal.</p>
          )}
          <div className="level-grid">
            {LEVELS.map((level, i) => (
              <button
                key={level.id}
                className={`level-card${progress[i] ? ' done' : ''}`}
                onClick={() => setCurrentLevel(level.id)}
              >
                {progress[i] && <span className="check">✓</span>}
                <span className="level-icon">{level.icon}</span>
                <span className="level-title">{level.title}</span>
                <span className="level-desc">{level.desc}</span>
              </button>
            ))}
          </div>
        </main>
      ) : (
        <main className="level-view">
          <button className="back-btn" onClick={() => setCurrentLevel(0)}>← back</button>
          {renderLevel()}
        </main>
      )}
    </div>
  )
}

export default App
