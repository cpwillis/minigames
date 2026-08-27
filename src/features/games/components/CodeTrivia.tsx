'use client'
import { useState } from 'react'

export const meta = {
  id: 'code-trivia' as const,
  title: 'Code Trivia',
  description: 'Test your developer knowledge with trivia questions.',
  icon: '🧠',
  difficulty: 'easy' as const,
  maxPoints: 500,
  order: 3,
}

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

export default function CodeTrivia({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const pick = (i: number) => {
    if (selected !== null || done) return
    setSelected(i)
    if (i === QUESTIONS[current].answer) {
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
      <div className="text-accent text-xl py-8">All correct! 🎉</div>
    )
  }

  const q = QUESTIONS[current]

  return (
    <div className="space-y-4 max-w-lg">
      <p className="text-sm text-muted">
        Question {current + 1} of {QUESTIONS.length}
      </p>
      <div className="rounded-lg border border-line bg-sunken p-5 space-y-4">
        <p className="text-base font-medium text-fg">{q.q}</p>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            let cls = 'rounded-lg border px-4 py-2.5 text-sm text-left transition-colors'
            if (selected !== null) {
              if (i === q.answer) {
                cls += ' border-accent text-accent bg-ok-soft'
              } else if (i === selected) {
                cls += ' border-bad text-bad bg-bad-soft'
              } else {
                cls += ' border-line bg-sunken text-muted'
              }
            } else {
              cls += ' border-line bg-surface text-fg hover:border-line-strong'
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
