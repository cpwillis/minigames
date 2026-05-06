import { useState } from 'react'
import './Level2.css'

const ORIGINAL = 'Talk is cheap. Show me the code.'
const CIPHER = 'Wdon lv fkhds. Vkrz ph wkh frgh.'

export default function Level2({ onComplete }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState(null) // 'correct' | 'wrong'

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
    <div className="level2">
      <h2>Caesar Cipher</h2>
      <p className="hint">Decrypt the message below. It was encoded with a Caesar cipher.</p>
      <div className="cipher-display">
        <code className="cipher-text">{CIPHER}</code>
      </div>
      <div className="cipher-input-row">
        <input
          className={`cipher-input${status === 'wrong' ? ' shake' : ''}`}
          type="text"
          placeholder="Type the decoded message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && check()}
          disabled={status === 'correct'}
          spellCheck={false}
        />
        <button
          className={`cipher-btn${status === 'correct' ? ' correct' : ''}`}
          onClick={check}
          disabled={status === 'correct'}
        >
          {status === 'correct' ? '✓ Correct' : 'Decrypt'}
        </button>
      </div>
      {status === 'wrong' && <p className="cipher-error">Incorrect. Try again.</p>}
    </div>
  )
}
