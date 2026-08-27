import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="font-mono text-6xl font-bold text-line">404</span>
      <h1 className="text-xl font-semibold text-fg">Page not found</h1>
      <p className="text-sm text-muted">That game doesn&apos;t exist. Yet.</p>
      <Link href="/" className="btn mt-2">
        Back to games
      </Link>
    </div>
  )
}
