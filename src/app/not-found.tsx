import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <span className="text-6xl font-mono font-bold text-gray-200 dark:text-gray-800">404</span>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Page not found</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">That game doesn&apos;t exist. Yet.</p>
      <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 underline underline-offset-4 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
        Back to games
      </Link>
    </div>
  )
}
