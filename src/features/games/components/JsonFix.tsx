'use client'
import { useState } from 'react'

export const meta = {
  id: 'json-fix',
  title: 'JSON Fix',
  description: 'Spot the syntax error in each JSON blob.',
  icon: '{}',
  difficulty: 'medium' as const,
  maxPoints: 750,
  order: 13,
}

interface Round {
  lines: string[]
  bugLine: number
  fixes: string[]
  correctFix: number
  explanation: string
}

const ROUNDS: Round[] = [
  {
    lines: [
      '{',
      '  "name": "Alice",',
      '  "age": 30',
      '  "city": "London"',
      '}',
    ],
    bugLine: 3,
    fixes: ['Add comma after line 3', 'Add comma after line 2 ("age": 30)', 'Remove the "city" line'],
    correctFix: 1,
    explanation: 'Missing comma after "age": 30 — each property except the last needs a trailing comma.',
  },
  {
    lines: [
      '{',
      '  "items": [1, 2, 3,],',
      '  "count": 3',
      '}',
    ],
    bugLine: 1,
    fixes: ['Remove the trailing comma inside the array', 'Add "count" inside the array', 'Wrap array in quotes'],
    correctFix: 0,
    explanation: 'Trailing commas are not valid in JSON arrays or objects.',
  },
  {
    lines: [
      '{',
      '  "active": True,',
      '  "score": 99',
      '}',
    ],
    bugLine: 1,
    fixes: ['Change True to true', 'Wrap True in quotes', 'Change True to 1'],
    correctFix: 0,
    explanation: 'JSON booleans are lowercase: true and false, not True and False.',
  },
  {
    lines: [
      '{',
      "  'username': 'bob',",
      '  "role": "admin"',
      '}',
    ],
    bugLine: 1,
    fixes: ['Replace single quotes with double quotes', 'Remove the username key', 'Wrap the line in backticks'],
    correctFix: 0,
    explanation: 'JSON requires double quotes for strings — single quotes are not valid.',
  },
  {
    lines: [
      '{',
      '  "data": {',
      '    "value": 42',
      '  }',
      '',
    ],
    bugLine: 4,
    fixes: ['Add closing } brace', 'Remove the nested object', 'Add a comma after line 4'],
    correctFix: 0,
    explanation: 'The outer object is never closed — missing final }.',
  },
  {
    lines: [
      '{',
      '  "ratio": 1/3,',
      '  "label": "third"',
      '}',
    ],
    bugLine: 1,
    fixes: ['Replace 1/3 with 0.333', 'Wrap 1/3 in quotes', 'Remove the ratio key'],
    correctFix: 0,
    explanation: 'JSON does not support expressions — use a numeric literal like 0.333.',
  },
]

function pickRounds(): Round[] {
  return [...ROUNDS].sort(() => Math.random() - 0.5).slice(0, 3)
}

export default function JsonFix({ onComplete }: { onComplete: () => void }) {
  const [rounds] = useState(pickRounds)
  const [round, setRound] = useState(0)
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [selectedFix, setSelectedFix] = useState<number | null>(null)

  const current = rounds[round]
  const lineChosen = selectedLine !== null
  const fixChosen = selectedFix !== null
  const lineCorrect = selectedLine === current.bugLine
  const fixCorrect = selectedFix === current.correctFix
  const bothCorrect = lineCorrect && fixCorrect

  const pickLine = (i: number) => { if (!lineChosen) setSelectedLine(i) }

  const pickFix = (i: number) => {
    if (!lineChosen || fixChosen) return
    setSelectedFix(i)
  }

  const next = () => {
    if (round + 1 >= rounds.length) {
      setTimeout(onComplete, 300)
    } else {
      setRound(r => r + 1)
      setSelectedLine(null)
      setSelectedFix(null)
    }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>Round {round + 1} / {rounds.length}</span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">Step 1: Click the line with the syntax error.</p>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden font-mono text-sm">
        {current.lines.map((line, i) => {
          let cls = 'flex gap-3 px-3 py-1 transition-colors'
          if (lineChosen) {
            if (i === current.bugLine) cls += ' bg-[var(--game-correct-bg)]'
            else if (i === selectedLine) cls += ' bg-[var(--game-wrong-bg)]'
            else cls += ' bg-white dark:bg-gray-900'
          } else {
            cls += ' bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
          }
          return (
            <div key={i} className={cls} onClick={() => pickLine(i)}>
              <span className="select-none w-4 text-right text-gray-400 dark:text-gray-600 shrink-0">{i + 1}</span>
              <span className="text-gray-900 dark:text-gray-100 whitespace-pre">{line || ' '}</span>
            </div>
          )
        })}
      </div>

      {lineChosen && (
        <>
          <p className="text-sm text-gray-600 dark:text-gray-400">Step 2: Pick the correct fix.</p>
          <div className="space-y-2">
            {current.fixes.map((fix, i) => {
              let cls = 'w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-colors'
              if (fixChosen) {
                if (i === current.correctFix) cls += ' border-green-500 bg-[var(--game-correct-bg)] text-green-700 dark:text-green-400'
                else if (i === selectedFix) cls += ' border-red-400 bg-[var(--game-wrong-bg)] text-red-600 dark:text-red-400'
                else cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-600'
              } else {
                cls += ' border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:border-green-500 cursor-pointer'
              }
              return (
                <button key={i} className={cls} onClick={() => pickFix(i)} disabled={fixChosen}>
                  {fix}
                </button>
              )
            })}
          </div>
        </>
      )}

      {fixChosen && (
        <div className="space-y-2">
          <p className={`text-sm font-medium ${bothCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
            {bothCorrect ? 'Correct!' : 'Not quite.'}
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
