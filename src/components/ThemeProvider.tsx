'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Resolved = 'light' | 'dark'

interface ThemeCtx {
  /** Stored preference. 'system' until the user picks a side, which is the default for new visitors. */
  theme: Theme
  setTheme: (t: Theme) => void
  /** What is actually on screen. The nav toggle flips against this, not against `theme`. */
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
  const [resolvedTheme, setResolved] = useState<Resolved>('light')

  const apply = useCallback((t: Theme) => {
    const r = resolve(t)
    applyClass(r)
    setResolved(r)
  }, [])

  useEffect(() => {
    let saved: Theme = 'system'
    try { saved = (localStorage.getItem('theme') as Theme) || 'system' } catch {}
    setThemeState(saved)
    apply(saved)

    // Nothing is stored until the user picks a side, so an untouched visitor keeps following
    // their OS setting live, including when it flips at sunset.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      let current: Theme = 'system'
      try { current = (localStorage.getItem('theme') as Theme) || 'system' } catch {}
      if (current === 'system') apply('system')
    }
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [apply])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try { localStorage.setItem('theme', t) } catch {}
    apply(t)
  }, [apply])

  return <Ctx.Provider value={{ theme, setTheme, resolvedTheme }}>{children}</Ctx.Provider>
}

export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme')||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.add(r)}catch(e){}})()`
