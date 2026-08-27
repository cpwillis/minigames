import type { Metadata, Viewport } from 'next'
import { ThemeProvider, THEME_SCRIPT } from '@/components/ThemeProvider'
import Nav from '@/components/Nav'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com/cpwillis/minigames'
// Static export bakes the build date in, so a live year would silently go stale.
const COPYRIGHT_YEAR = 2026

const DESCRIPTION =
  'Fifteen browser games for developers: complexity, regex, git, HTTP, typing and more. Free, no account, no tracking.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'minigames', template: '%s | minigames' },
  description: DESCRIPTION,
  keywords: ['developer games', 'coding games', 'programming trivia', 'cs games', 'browser games'],
  authors: [{ name: 'cpwillis', url: 'https://cpwillis.dev' }],
  creator: 'cpwillis',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'minigames',
    title: 'minigames',
    description: DESCRIPTION,
    url: SITE_URL,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'minigames' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'minigames',
    description: DESCRIPTION,
    images: ['/og.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#08090b' },
  ],
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'minigames',
  url: SITE_URL,
  description: DESCRIPTION,
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'cpwillis', url: 'https://cpwillis.dev' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Flash-free theme: sets the class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-bg"
          >
            Skip to content
          </a>
          <Nav />
          <main id="main" className="mx-auto max-w-4xl px-4 py-10">
            {children}
          </main>
          <footer className="mt-20 border-t border-line">
            <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
              <p>
                minigames &copy; {COPYRIGHT_YEAR}. A hobby project, provided as is, with no support
                and no guarantee it stays online.
              </p>
              <nav aria-label="Footer" className="flex shrink-0 items-center gap-4">
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-fg"
                >
                  Source &rarr;
                </a>
              </nav>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
