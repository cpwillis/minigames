'use client'
import { useState } from 'react'

export const meta = {
  id: 'caesar-cipher' as const,
  title: 'Caesar Cipher',
  description: 'Decrypt the encoded message by cracking the cipher.',
  icon: '🔐',
  difficulty: 'easy' as const,
  maxPoints: 500,
  order: 2,
}

const ORIGINAL = 'Ship small changes and read the logs.'
const CIPHER = 'Vkls vpdoo fkdqjhv dqg uhdg wkh orjv.'

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
      <p className="text-sm text-muted">
        Decrypt the message below. It was encoded with a Caesar cipher.
      </p>
      <div className="rounded-lg border border-line bg-sunken px-5 py-4">
        <code className="font-mono text-base text-accent tracking-wide">
          {CIPHER}
        </code>
      </div>
      <div className="flex gap-3">
        <input
          className={[
            'field flex-1',
            status === 'wrong' ? 'border-bad animate-[shake_0.4s_ease]' : '',
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
              ? 'border-accent text-accent'
              : 'border-line bg-sunken hover:bg-line/40 text-fg',
          ].join(' ')}
        >
          {status === 'correct' ? '✓ Correct' : 'Decrypt'}
        </button>
      </div>
      {status === 'wrong' && (
        <p className="text-sm text-bad">Incorrect. Try again.</p>
      )}
    </div>
  )
}
