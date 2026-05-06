import { useState, useMemo, useCallback } from 'react'
import './Level1.css'

const SIZE = 12
const WORDS = ['CODE', 'HOST', 'DATABASE', 'SERVER', 'DOMAIN', 'HTML', 'NETWORK', 'WEB', 'JAVASCRIPT', 'DEVNOTES']
const DIRS = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]]
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function buildGrid() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  const placed = {}

  for (const word of [...WORDS].sort((a, b) => b.length - a.length)) {
    let ok = false
    for (let t = 0; t < 300 && !ok; t++) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)]
      const r = Math.floor(Math.random() * SIZE)
      const c = Math.floor(Math.random() * SIZE)
      const er = r + dr * (word.length - 1)
      const ec = c + dc * (word.length - 1)
      if (er < 0 || er >= SIZE || ec < 0 || ec >= SIZE) continue
      let fits = true
      for (let i = 0; i < word.length && fits; i++) {
        const g = grid[r + dr * i][c + dc * i]
        if (g && g !== word[i]) fits = false
      }
      if (fits) {
        const cells = []
        for (let i = 0; i < word.length; i++) {
          grid[r + dr * i][c + dc * i] = word[i]
          cells.push(`${r + dr * i},${c + dc * i}`)
        }
        placed[word] = cells
        ok = true
      }
    }
  }

  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!grid[r][c]) grid[r][c] = ALPHA[Math.floor(Math.random() * 26)]

  return { grid, placed }
}

function pathBetween(a, b) {
  const dr = b[0] - a[0], dc = b[1] - a[1]
  const adR = Math.abs(dr), adC = Math.abs(dc)
  if (dr !== 0 && dc !== 0 && adR !== adC) return null
  const steps = Math.max(adR, adC)
  const sr = steps ? dr / steps : 0
  const sc = steps ? dc / steps : 0
  return Array.from({ length: steps + 1 }, (_, i) => [a[0] + sr * i, a[1] + sc * i])
}

export default function Level1({ onComplete }) {
  const [{ grid, placed }] = useState(buildGrid)
  const [found, setFound] = useState(new Set())
  const [anchor, setAnchor] = useState(null)
  const [hover, setHover] = useState(null)
  const [flashInvalid, setFlashInvalid] = useState(false)

  const foundCells = useMemo(() => {
    const s = new Set()
    for (const w of found) for (const k of (placed[w] || [])) s.add(k)
    return s
  }, [found, placed])

  const previewPath = useMemo(() => {
    if (!anchor || !hover) return null
    return pathBetween(anchor, hover)
  }, [anchor, hover])

  const previewSet = useMemo(() => {
    if (!previewPath) return new Set()
    return new Set(previewPath.map(([r, c]) => `${r},${c}`))
  }, [previewPath])

  const handleClick = useCallback((r, c) => {
    if (!anchor) {
      setAnchor([r, c])
      return
    }
    if (anchor[0] === r && anchor[1] === c) {
      setAnchor(null)
      setHover(null)
      return
    }
    const path = pathBetween(anchor, [r, c])
    if (!path) {
      setAnchor([r, c])
      setHover(null)
      return
    }
    const word = path.map(([pr, pc]) => grid[pr][pc]).join('')
    const rev = word.split('').reverse().join('')
    const match = WORDS.find(w => !found.has(w) && (w === word || w === rev))
    if (match) {
      const next = new Set(found)
      next.add(match)
      setFound(next)
      setAnchor(null)
      setHover(null)
      if (next.size === WORDS.length) setTimeout(onComplete, 600)
    } else {
      setFlashInvalid(true)
      setTimeout(() => { setFlashInvalid(false); setAnchor(null); setHover(null) }, 500)
    }
  }, [anchor, found, grid, onComplete])

  const cellClass = (r, c) => {
    const key = `${r},${c}`
    if (foundCells.has(key)) return 'ws-cell found'
    if (flashInvalid && previewSet.has(key)) return 'ws-cell invalid'
    if (previewSet.has(key)) return 'ws-cell preview'
    if (anchor && anchor[0] === r && anchor[1] === c) return 'ws-cell anchor'
    return 'ws-cell'
  }

  return (
    <div className="level1">
      <h2>Word Search</h2>
      <p className="hint">Click a start letter, then click an end letter to select a word.</p>
      <div className="ws-layout">
        <div className="ws-grid" onMouseLeave={() => anchor && setHover(null)}>
          {grid.map((row, r) =>
            row.map((letter, c) => (
              <div
                key={`${r}-${c}`}
                className={cellClass(r, c)}
                onClick={() => handleClick(r, c)}
                onMouseEnter={() => anchor && setHover([r, c])}
              >
                {letter}
              </div>
            ))
          )}
        </div>
        <ul className="ws-word-list">
          {WORDS.map(w => (
            <li key={w} className={found.has(w) ? 'ws-word found-word' : 'ws-word'}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
