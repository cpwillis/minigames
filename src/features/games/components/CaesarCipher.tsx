'use client'
import { useState } from 'react'

export const meta = {
  id: 'caesar-cipher',
  title: 'Caesar Cipher',
  description: 'Decrypt the encoded message by cracking the cipher.',
  icon: '🔐',
  difficulty: 'easy' as const,
  maxPoints: 500,
  order: 2,
}

const ORIGINAL = 'Talk is cheap. Show me the code.'
const CIPHER = 'Wdon lv fkhds. Vkrz ph wkh frgh.'

export default function CaesarCipher({ onComplete }: { onComplete: () => void }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'correct' | 'wrong' | null>(null)

  const check = () => {
    if (status === 'correct') return
    if (input.trim().toLowerCase() === ORIGINAL.toLowerCase()) {
      setStatus('correct')
      setTimeout(onComplete, 800)
    } else {
      setStatus('wrong')
      setTimeout(() => setStatus(null), 900)
    }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Decrypt the message below. It was encoded with a Caesar cipher.
      </p>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-5 py-4">
        <code className="font-mono text-base text-green-600 dark:text-green-400 tracking-wide">
          {CIPHER}
        </code>
      </div>
      <div className="flex gap-3">
        <input
          className={[
            'flex-1 rounded-lg border px-3 py-2 text-sm outline-none transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100',
            status === 'wrong'
              ? 'border-red-500 animate-[shake_0.4s_ease]'
              : 'border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-500',
          ].join(' ')}
          type="text"
          placeholder="Type the decoded message…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          disabled={status === 'correct'}
          spellCheck={false}
        />
        <button
          onClick={check}
          disabled={status === 'correct'}
          className={[
            'rounded-lg border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
            status === 'correct'
              ? 'border-green-500 text-green-600 dark:text-green-400'
              : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100',
          ].join(' ')}
        >
          {status === 'correct' ? '✓ Correct' : 'Decrypt'}
        </button>
      </div>
      {status === 'wrong' && (
        <p className="text-sm text-red-500">Incorrect. Try again.</p>
      )}
    </div>
  )
}
