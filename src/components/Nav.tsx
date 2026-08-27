'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProgress } from '@/hooks/useProgress'
import { GAMES } from '@/features/games/registry'
import ThemeToggle from './ThemeToggle'

const LINKS = [
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/settings', label: 'Settings' },
]

export default function Nav() {
  const { totalPoints, progress } = useProgress()
  const pathname = usePathname()
  const completed = Object.keys(progress).length

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-fg">
          <svg viewBox="0 0 64 64" width="20" height="20" aria-hidden="true" className="shrink-0">
            <rect width="64" height="64" rx="14" className="fill-fg" />
            <path
              d="M16 22 L26 32 L16 42"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-bg"
            />
            <rect x="32" y="38" width="18" height="6" rx="3" className="fill-bg" />
          </svg>
          minigames
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          {completed > 0 && (
            <span className="hidden rounded-full border border-line bg-sunken px-2.5 py-1 text-xs tabular-nums text-muted sm:inline">
              <span className="font-medium text-fg">{totalPoints.toLocaleString()}</span> pts &middot;{' '}
              {completed}/{GAMES.length}
            </span>
          )}
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? 'page' : undefined}
              className={`rounded-md px-2 py-1 text-xs transition-colors hover:text-fg ${
                pathname === link.href ? 'text-fg' : 'text-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
