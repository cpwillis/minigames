'use client'
import { useState } from 'react'

export const meta = {
  id: 'code-trivia',
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
      <div className="text-green-600 dark:text-green-400 text-xl py-8">All correct! 🎉</div>
    )
  }

  const q = QUESTIONS[current]

  return (
    <div className="space-y-4 max-w-lg">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Question {current + 1} of {QUESTIONS.length}
      </p>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-5 space-y-4">
        <p className="text-base font-medium text-gray-900 dark:text-gray-100">{q.q}</p>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => {
            let cls = 'rounded-lg border px-4 py-2.5 text-sm text-left transition-colors'
            if (selected !== null) {
              if (i === q.answer) {
                cls += ' border-green-500 text-green-700 dark:text-green-400 bg-[var(--game-correct-bg)]'
              } else if (i === selected) {
                cls += ' border-red-500 text-red-600 dark:text-red-400 bg-[var(--game-wrong-bg)]'
              } else {
                cls += ' border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }
            } else {
              cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500'
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
