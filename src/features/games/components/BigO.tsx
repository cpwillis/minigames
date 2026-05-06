'use client'
import { useState } from 'react'

export const meta = {
  id: 'big-o',
  title: 'Big-O',
  description: 'Identify the time complexity of each code snippet.',
  icon: '📈',
  difficulty: 'hard' as const,
  maxPoints: 1000,
  order: 15,
}

interface Question {
  language: string
  lines: string[]
  answer: string
  explanation: string
}

const ALL_QUESTIONS: Question[] = [
  {
    language: 'Python',
    lines: [
      'def search(arr, target):',
      '  for item in arr:',
      '    if item == target:',
      '      return True',
      '  return False',
    ],
    answer: 'O(n)',
    explanation: 'Single loop over n elements — linear time.',
  },
  {
    language: 'Python',
    lines: [
      'def get(d, key):',
      '  return d[key]',
    ],
    answer: 'O(1)',
    explanation: 'Dictionary lookup is constant time on average.',
  },
  {
    language: 'JavaScript',
    lines: [
      'function pairs(arr) {',
      '  for (let i = 0; i < arr.length; i++)',
      '    for (let j = 0; j < arr.length; j++)',
      '      console.log(arr[i], arr[j]);',
      '}',
    ],
    answer: 'O(n²)',
    explanation: 'Two nested loops each running n times — quadratic.',
  },
  {
    language: 'Python',
    lines: [
      'def binary_search(arr, target):',
      '  lo, hi = 0, len(arr) - 1',
      '  while lo <= hi:',
      '    mid = (lo + hi) // 2',
      '    if arr[mid] == target: return mid',
      '    elif arr[mid] < target: lo = mid + 1',
      '    else: hi = mid - 1',
    ],
    answer: 'O(log n)',
    explanation: 'Halves the search space each iteration — logarithmic.',
  },
  {
    language: 'JavaScript',
    lines: [
      'function fib(n) {',
      '  if (n <= 1) return n;',
      '  return fib(n - 1) + fib(n - 2);',
      '}',
    ],
    answer: 'O(2ⁿ)',
    explanation: 'Each call branches into two recursive calls — exponential.',
  },
  {
    language: 'Python',
    lines: [
      'def triple_loop(arr):',
      '  for a in arr:',
      '    for b in arr:',
      '      for c in arr:',
      '        print(a, b, c)',
    ],
    answer: 'O(n³)',
    explanation: 'Three nested loops each running n times — cubic.',
  },
  {
    language: 'JavaScript',
    lines: [
      'function mergeSort(arr) {',
      '  if (arr.length <= 1) return arr;',
      '  const mid = Math.floor(arr.length / 2);',
      '  return merge(mergeSort(arr.slice(0, mid)),',
      '               mergeSort(arr.slice(mid)));',
      '}',
    ],
    answer: 'O(n log n)',
    explanation: 'Divides array log n times and does O(n) merge work at each level.',
  },
  {
    language: 'Python',
    lines: [
      'def sum_matrix(matrix):',
      '  total = 0',
      '  for row in matrix:',
      '    for val in row:',
      '      total += val',
      '  return total',
    ],
    answer: 'O(n²)',
    explanation: 'Iterates over every cell in an n×n matrix — quadratic in n.',
  },
]

const OPTIONS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)']
const TOTAL_ROUNDS = 4

function pickQuestions(): Question[] {
  return [...ALL_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, TOTAL_ROUNDS)
}

export default function BigO({ onComplete }: { onComplete: () => void }) {
  const [questions] = useState(pickQuestions)
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)

  const q = questions[round]

  const pick = (opt: string) => {
    if (selected !== null) return
    setSelected(opt)
    if (opt === q.answer) setCorrect(c => c + 1)
    setTimeout(() => {
      if (round + 1 >= TOTAL_ROUNDS) {
        setTimeout(onComplete, 300)
      } else {
        setRound(r => r + 1)
        setSelected(null)
      }
    }, 1000)
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Round {round + 1} / {TOTAL_ROUNDS}</span>
        <span>{correct} correct</span>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">What is the time complexity?</p>
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">{q.language}</span>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden font-mono text-sm">
        {q.lines.map((line, i) => (
          <div key={i} className="flex gap-3 px-3 py-1 bg-white dark:bg-gray-900">
            <span className="select-none w-4 text-right text-gray-400 dark:text-gray-600 shrink-0">{i + 1}</span>
            <span className="text-gray-900 dark:text-gray-100 whitespace-pre">{line}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {OPTIONS.map(opt => {
          let cls = 'rounded-lg border px-3 py-2 font-mono text-sm transition-colors'
          if (selected === null) {
            cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-green-500 cursor-pointer'
          } else if (opt === q.answer) {
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

      {selected && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{q.explanation}</p>
      )}
    </div>
  )
}
