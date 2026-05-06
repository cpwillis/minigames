'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Resolved = 'light' | 'dark'

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
  resolvedTheme: Resolved
}

const Ctx = createContext<ThemeCtx>({ theme: 'system', setTheme: () => {}, resolvedTheme: 'light' })

export const useTheme = () => useContext(Ctx)

function resolve(t: Theme): Resolved {
  if (t !== 'system') return t
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyClass(r: Resolved) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(r)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<Resolved>('light')

  useEffect(() => {
    let saved: Theme = 'system'
    try { saved = (localStorage.getItem('theme') as Theme) || 'system' } catch {}
    setThemeState(saved)
    const r = resolve(saved)
    applyClass(r)
    setResolved(r)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      let current: Theme = 'system'
      try { current = (localStorage.getItem('theme') as Theme) || 'system' } catch {}
      if (current === 'system') {
        const r2 = resolve('system')
        applyClass(r2)
        setResolved(r2)
      }
    }
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try { localStorage.setItem('theme', t) } catch {}
    const r = resolve(t)
    applyClass(r)
    setResolved(r)
  }, [])

  return <Ctx.Provider value={{ theme, setTheme, resolvedTheme: resolved }}>{children}</Ctx.Provider>
}

export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme')||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.add(r)}catch(e){}})()`
