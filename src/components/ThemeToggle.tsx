'use client'
import { useTheme } from './ThemeProvider'

const ICON = 'h-[15px] w-[15px]'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  // Two states, not three. New visitors follow their OS because nothing is stored yet; the first
  // click writes an explicit side and it is respected from then on. "System" lives in Settings.
  //
  // Both icons and both labels are rendered and picked by CSS off the class THEME_SCRIPT sets
  // before paint. Gating on mount instead left a blank square that popped in after hydration.
  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-sunken hover:text-fg"
    >
      <svg className={`theme-icon-sun ${ICON}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg className={`theme-icon-moon ${ICON}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      {/* The accessible name comes from whichever span CSS leaves displayed. */}
      <span className="theme-when-dark sr-only">Switch to light theme</span>
      <span className="theme-when-light sr-only">Switch to dark theme</span>
    </button>
  )
}
