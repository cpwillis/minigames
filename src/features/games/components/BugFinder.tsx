'use client'
import { useState } from 'react'

export const meta = {
  id: 'bug-finder',
  title: 'Bug Finder',
  description: 'Click the line containing the bug in each code snippet.',
  icon: '🐞',
  difficulty: 'hard' as const,
  maxPoints: 1000,
  order: 9,
}

interface Round {
  language: string
  lines: string[]
  bugLine: number // 0-indexed
  explanation: string
}

const ROUNDS: Round[] = [
  {
    language: 'JavaScript',
    lines: [
      'function sum(arr) {',
      '  let total = 0;',
      '  for (let i = 0; i <= arr.length; i++) {',
      '    total += arr[i];',
      '  }',
      '  return total;',
      '}',
    ],
    bugLine: 2,
    explanation: 'Off-by-one: should be i < arr.length, not i <= arr.length',
  },
  {
    language: 'Python',
    lines: [
      'def factorial(n):',
      '  if n == 0:',
      '    return 1',
      '  return n * factorial(n)',
      '',
    ],
    bugLine: 3,
    explanation: 'Infinite recursion: should be factorial(n - 1), not factorial(n)',
  },
  {
    language: 'TypeScript',
    lines: [
      'function isEven(n: number): boolean {',
      '  if (n % 2 = 0) {',
      '    return true;',
      '  }',
      '  return false;',
      '}',
    ],
    bugLine: 1,
    explanation: 'Assignment instead of comparison: should be n % 2 === 0',
  },
  {
    language: 'JavaScript',
    lines: [
      'async function fetchData(url) {',
      '  try {',
      '    const res = await fetch(url);',
      '    const data = res.json();',
      '    return data;',
      '  } catch (e) {',
      '    console.error(e);',
      '  }',
      '}',
    ],
    bugLine: 3,
    explanation: 'Missing await: should be await res.json()',
  },
  {
    language: 'Python',
    lines: [
      'def find_max(lst):',
      '  max_val = lst[0]',
      '  for i in range(len(lst)):',
      '    if lst[i] > max_val:',
      '      max_val = lst[1]',
      '  return max_val',
    ],
    bugLine: 4,
    explanation: 'Wrong index: should be lst[i], not lst[1]',
  },
  {
    language: 'JavaScript',
    lines: [
      'function reverseString(s) {',
      '  return s.split("").reverse().join("");',
      '}',
      '',
      'const result = reverseString(123);',
      'console.log(result);',
    ],
    bugLine: 4,
    explanation: 'Wrong type: passing a number 123 but split() is a string method',
  },
]

function pickRounds(): Round[] {
  const shuffled = [...ROUNDS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

export default function BugFinder({ onComplete }: { onComplete: () => void }) {
  const [rounds] = useState(pickRounds)
  const [round, setRound] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const current = rounds[round]
  const isCorrect = selected === current.bugLine
  const answered = selected !== null

  const pick = (lineIdx: number) => {
    if (answered) return
    setSelected(lineIdx)
    if (lineIdx === current.bugLine) setScore(s => s + 1)
  }

  const next = () => {
    if (round + 1 >= rounds.length) {
      setTimeout(onComplete, 300)
    } else {
      setRound(r => r + 1)
      setSelected(null)
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Round {round + 1} / {rounds.length}</span>
        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{current.language}</span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">Click the line containing the bug:</p>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden font-mono text-sm">
        {current.lines.map((line, i) => {
          let cls = 'flex gap-3 px-3 py-1 cursor-pointer transition-colors'
          if (answered) {
            if (i === current.bugLine) {
              cls += ' bg-[var(--game-correct-bg)]'
            } else if (i === selected) {
              cls += ' bg-[var(--game-wrong-bg)]'
            } else {
              cls += ' bg-white dark:bg-gray-900'
            }
          } else {
            cls += ' bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          return (
            <div key={i} className={cls} onClick={() => pick(i)}>
              <span className="select-none w-5 text-right text-gray-400 dark:text-gray-600 shrink-0">{i + 1}</span>
              <span className="text-gray-900 dark:text-gray-100 whitespace-pre">{line || ' '}</span>
            </div>
          )
        })}
      </div>

      {answered && (
        <div className="space-y-3">
          <p className={`text-sm font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {isCorrect ? 'Correct!' : `Wrong — bug was on line ${current.bugLine + 1}.`}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{current.explanation}</p>
          <button
            onClick={next}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {round + 1 >= rounds.length ? 'Finish' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
