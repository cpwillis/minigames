'use client'
import { useState } from 'react'

export const meta = {
  id: 'json-fix' as const,
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
    fixes: ['Add a comma after "city": "London"', 'Add a comma after "age": 30', 'Remove the "city" line'],
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
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Round {round + 1} / {rounds.length}</span>
      </div>

      <p className="text-sm text-muted">Step 1: Click the line with the syntax error.</p>

      <div className="rounded-lg border border-line overflow-hidden font-mono text-sm">
        {current.lines.map((line, i) => {
          let cls = 'flex w-full gap-3 px-3 py-1 text-left transition-colors'
          if (lineChosen) {
            if (i === current.bugLine) cls += ' bg-ok-soft'
            else if (i === selectedLine) cls += ' bg-bad-soft'
            else cls += ' bg-surface'
          } else {
            cls += ' bg-surface hover:bg-sunken'
          }
          return (
            <button
              key={i}
              type="button"
              className={cls}
              onClick={() => pickLine(i)}
              disabled={lineChosen}
              aria-label={`Line ${i + 1}: ${line || 'blank'}`}
            >
              <span className="select-none w-4 text-right text-faint shrink-0">{i + 1}</span>
              <span className="text-fg whitespace-pre">{line || ' '}</span>
            </button>
          )
        })}
      </div>

      {lineChosen && (
        <>
          <p className="text-sm text-muted">Step 2: Pick the correct fix.</p>
          <div className="space-y-2">
            {current.fixes.map((fix, i) => {
              let cls = 'w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-colors'
              if (fixChosen) {
                if (i === current.correctFix) cls += ' border-accent bg-ok-soft text-accent'
                else if (i === selectedFix) cls += ' border-bad bg-bad-soft text-bad'
                else cls += ' border-line bg-surface text-faint'
              } else {
                cls += ' border-line bg-surface text-fg hover:border-accent cursor-pointer'
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
          <p className={`text-sm font-medium ${bothCorrect ? 'text-accent' : 'text-bad'}`}>
            {bothCorrect ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="text-sm text-muted">{current.explanation}</p>
          <button
            onClick={next}
            className="btn"
          >
            {round + 1 >= rounds.length ? 'Finish' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
