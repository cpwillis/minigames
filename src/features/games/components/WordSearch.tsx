'use client'
import { useState, useMemo, useCallback } from 'react'
import './WordSearch.css'

export const meta = {
  id: 'word-search',
  title: 'Word Search',
  description: 'Find all the hidden dev terms in the grid.',
  icon: '🔍',
  difficulty: 'hard' as const,
  maxPoints: 1000,
  order: 1,
}

const SIZE = 12
const WORDS = ['CODE', 'HOST', 'DATABASE', 'SERVER', 'DOMAIN', 'HTML', 'NETWORK', 'WEB', 'JAVASCRIPT', 'DEVNOTES']
const DIRS = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]]
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function buildGrid() {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  const placed: Record<string, string[]> = {}
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
        const cells: string[] = []
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

function pathBetween(a: [number, number], b: [number, number]) {
  const dr = b[0] - a[0], dc = b[1] - a[1]
  const adR = Math.abs(dr), adC = Math.abs(dc)
  if (dr !== 0 && dc !== 0 && adR !== adC) return null
  const steps = Math.max(adR, adC)
  const sr = steps ? dr / steps : 0
  const sc = steps ? dc / steps : 0
  return Array.from({ length: steps + 1 }, (_, i) => [a[0] + sr * i, a[1] + sc * i] as [number, number])
}

export default function WordSearch({ onComplete }: { onComplete: () => void }) {
  const [{ grid, placed }] = useState(buildGrid)
  const [found, setFound] = useState(new Set<string>())
  const [anchor, setAnchor] = useState<[number, number] | null>(null)
  const [hover, setHover] = useState<[number, number] | null>(null)
  const [flashInvalid, setFlashInvalid] = useState(false)

  const foundCells = useMemo(() => {
    const s = new Set<string>()
    for (const w of found) for (const k of (placed[w] || [])) s.add(k)
    return s
  }, [found, placed])

  const previewPath = useMemo(() => {
    if (!anchor || !hover) return null
    return pathBetween(anchor, hover)
  }, [anchor, hover])

  const previewSet = useMemo(() => {
    if (!previewPath) return new Set<string>()
    return new Set(previewPath.map(([r, c]) => `${r},${c}`))
  }, [previewPath])

  const handleClick = useCallback((r: number, c: number) => {
    if (!anchor) { setAnchor([r, c]); return }
    if (anchor[0] === r && anchor[1] === c) { setAnchor(null); setHover(null); return }
    const path = pathBetween(anchor, [r, c])
    if (!path) { setAnchor([r, c]); setHover(null); return }
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

  const cellClass = (r: number, c: number) => {
    const key = `${r},${c}`
    if (foundCells.has(key)) return 'ws-cell found'
    if (flashInvalid && previewSet.has(key)) return 'ws-cell invalid'
    if (previewSet.has(key)) return 'ws-cell preview'
    if (anchor && anchor[0] === r && anchor[1] === c) return 'ws-cell anchor'
    return 'ws-cell bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100'
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Click a start letter, then an end letter to select a word.
      </p>
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
        <ul className="ws-word-list text-gray-900 dark:text-gray-100">
          {WORDS.map(w => (
            <li key={w} className={`ws-word${found.has(w) ? ' found-word text-amber-600 dark:text-amber-400' : ''}`}>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
