import { useState } from 'react'
import './Level3.css'

const QUESTIONS = [
  {
    q: 'Who invented the World Wide Web?',
    options: ['Vint Cerf', 'Tim Berners-Lee', 'Linus Torvalds', 'Bill Gates'],
    answer: 1,
  },
  {
    q: "What does 'DOM' stand for?",
    options: ['Document Object Model', 'Data Object Management', 'Dynamic Object Module', 'Document Oriented Markup'],
    answer: 0,
  },
  {
    q: 'Which of these is NOT a primitive type in JavaScript?',
    options: ['string', 'boolean', 'array', 'undefined'],
    answer: 2,
  },
]

export default function Level3({ onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState(false)

  const pick = (i) => {
    if (selected !== null || done) return
    setSelected(i)
    const correct = QUESTIONS[current].answer
    if (i === correct) {
      setTimeout(() => {
        setSelected(null)
        if (current + 1 === QUESTIONS.length) {
          setDone(true)
          setTimeout(onComplete, 700)
        } else {
          setCurrent(c => c + 1)
        }
      }, 800)
    } else {
      setTimeout(() => setSelected(null), 900)
    }
  }

  if (done) {
    return (
      <div className="level3">
        <div className="trivia-done">All correct! 🎉</div>
      </div>
    )
  }

  const q = QUESTIONS[current]

  return (
    <div className="level3">
      <h2>Code Trivia</h2>
      <p className="hint">Question {current + 1} of {QUESTIONS.length}</p>
      <div className="question-card">
        <p className="question-text">{q.q}</p>
        <div className="options">
          {q.options.map((opt, i) => {
            let cls = 'option'
            if (selected !== null) {
              if (i === q.answer) cls += ' correct'
              else if (i === selected) cls += ' wrong'
            }
            return (
              <button key={i} className={cls} onClick={() => pick(i)}>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
