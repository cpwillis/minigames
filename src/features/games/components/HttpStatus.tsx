'use client'
import { useState } from 'react'

export const meta = {
  id: 'http-status',
  title: 'HTTP Status',
  description: 'Match the status code to its meaning.',
  icon: '🌐',
  difficulty: 'easy' as const,
  maxPoints: 500,
  order: 8,
}

const ALL_CARDS = [
  { code: 200, answer: 'OK', options: ['OK', 'Created', 'Accepted', 'No Content'] },
  { code: 201, answer: 'Created', options: ['OK', 'Created', 'Accepted', 'No Content'] },
  { code: 204, answer: 'No Content', options: ['OK', 'Accepted', 'No Content', 'Reset Content'] },
  { code: 301, answer: 'Moved Permanently', options: ['Moved Permanently', 'Found', 'Not Modified', 'Temporary Redirect'] },
  { code: 302, answer: 'Found', options: ['Moved Permanently', 'Found', 'Not Modified', 'Temporary Redirect'] },
  { code: 304, answer: 'Not Modified', options: ['Found', 'Not Modified', 'Temporary Redirect', 'Permanent Redirect'] },
  { code: 400, answer: 'Bad Request', options: ['Bad Request', 'Unauthorized', 'Forbidden', 'Not Found'] },
  { code: 401, answer: 'Unauthorized', options: ['Bad Request', 'Unauthorized', 'Forbidden', 'Payment Required'] },
  { code: 403, answer: 'Forbidden', options: ['Unauthorized', 'Forbidden', 'Not Found', 'Method Not Allowed'] },
  { code: 404, answer: 'Not Found', options: ['Forbidden', 'Not Found', 'Gone', 'Method Not Allowed'] },
  { code: 405, answer: 'Method Not Allowed', options: ['Not Found', 'Method Not Allowed', 'Conflict', 'Gone'] },
  { code: 409, answer: 'Conflict', options: ['Method Not Allowed', 'Gone', 'Conflict', 'Unprocessable Entity'] },
  { code: 418, answer: "I'm a Teapot", options: ["I'm a Teapot", 'Enhance Your Calm', 'Expectation Failed', 'Misdirected Request'] },
  { code: 422, answer: 'Unprocessable Entity', options: ['Conflict', 'Unprocessable Entity', 'Too Many Requests', 'Gone'] },
  { code: 429, answer: 'Too Many Requests', options: ['Unprocessable Entity', 'Too Many Requests', 'Internal Server Error', 'Service Unavailable'] },
  { code: 500, answer: 'Internal Server Error', options: ['Bad Gateway', 'Internal Server Error', 'Service Unavailable', 'Gateway Timeout'] },
  { code: 502, answer: 'Bad Gateway', options: ['Internal Server Error', 'Bad Gateway', 'Service Unavailable', 'Gateway Timeout'] },
  { code: 503, answer: 'Service Unavailable', options: ['Bad Gateway', 'Service Unavailable', 'Gateway Timeout', 'Internal Server Error'] },
]

const TOTAL_ROUNDS = 10

function pickCards() {
  const shuffled = [...ALL_CARDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, TOTAL_ROUNDS)
}

export default function HttpStatus({ onComplete }: { onComplete: () => void }) {
  const [cards] = useState(pickCards)
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  const card = cards[round]

  const pick = (option: string) => {
    if (selected !== null) return
    setSelected(option)
    const isCorrect = option === card.answer
    if (isCorrect) setCorrect(c => c + 1)

    setTimeout(() => {
      if (round + 1 >= TOTAL_ROUNDS) {
        setDone(true)
        setTimeout(onComplete, 800)
      } else {
        setRound(r => r + 1)
        setSelected(null)
      }
    }, 700)
  }

  if (done) {
    return (
      <div className="space-y-3 max-w-md">
        <p className="text-green-600 dark:text-green-400 font-medium">
          Done! {correct}/{TOTAL_ROUNDS} correct.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5 max-w-md">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Round {round + 1} / {TOTAL_ROUNDS}</span>
        <span>{correct} correct</span>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-6 text-center">
        <p className="text-5xl font-mono font-bold text-gray-900 dark:text-gray-100">{card.code}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {card.options.map(opt => {
          let cls = 'rounded-lg border px-3 py-2.5 text-sm text-left transition-colors'
          if (selected === null) {
            cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-green-500 dark:hover:border-green-500 cursor-pointer'
          } else if (opt === card.answer) {
            cls += ' border-green-500 bg-[var(--game-correct-bg)] text-green-700 dark:text-green-400'
          } else if (opt === selected) {
            cls += ' border-red-400 bg-[var(--game-wrong-bg)] text-red-600 dark:text-red-400'
          } else {
            cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600'
          }
          return (
            <button key={opt} className={cls} onClick={() => pick(opt)} disabled={selected !== null}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
