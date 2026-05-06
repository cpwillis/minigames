'use client'
import { useState, useRef, useEffect } from 'react'

export const meta = {
  id: 'typing-speed',
  title: 'Typing Speed',
  description: 'Type the code snippet exactly as shown.',
  icon: '⌨️',
  difficulty: 'medium' as const,
  maxPoints: 750,
  order: 10,
}

const SNIPPETS = [
  'const x = arr.filter(n => n > 0)',
  'import { useState } from "react"',
  'git commit -m "fix: null check"',
  'SELECT * FROM users WHERE id = 1',
  'console.log(JSON.stringify(obj))',
  'npm install --save-dev typescript',
  'Object.keys(obj).forEach(k => {})',
  'return Promise.resolve(data)',
]

function pick() {
  return SNIPPETS[Math.floor(Math.random() * SNIPPETS.length)]
}

export default function TypingSpeed({ onComplete }: { onComplete: () => void }) {
  const target = useRef(pick())
  const [typed, setTyped] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.length > target.current.length) return
    setTyped(val)
    if (val === target.current) setTimeout(onComplete, 400)
  }

  const chars = target.current.split('')

  return (
    <div className="space-y-5 max-w-lg">
      <p className="text-sm text-gray-500 dark:text-gray-400">Type the snippet exactly:</p>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 font-mono text-base leading-relaxed tracking-wide flex flex-wrap">
        {chars.map((ch, i) => {
          let cls = ''
          if (i < typed.length) {
            cls = typed[i] === ch
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-500 bg-red-100 dark:bg-red-900/30 rounded'
          } else if (i === typed.length) {
            cls = 'border-b-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
          } else {
            cls = 'text-gray-400 dark:text-gray-600'
          }
          return <span key={i} className={cls}>{ch}</span>
        })}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 outline-none focus:border-green-500"
        placeholder="Start typing here..."
        spellCheck={false}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
      />

      <p className="text-xs text-gray-400 dark:text-gray-600">
        {typed.length} / {target.current.length} characters
      </p>
    </div>
  )
}
