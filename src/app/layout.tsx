import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider, THEME_SCRIPT } from '@/components/ThemeProvider'
import Nav from '@/components/Nav'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'minigames', template: '%s | minigames' },
  description: 'Browser-based developer mini games. Test your CS knowledge, typing speed, memory, and more. Free to play.',
  keywords: ['developer games', 'coding games', 'programming trivia', 'cs games', 'browser games'],
  authors: [{ name: 'cpwillis', url: 'https://cpwillis.dev' }],
  creator: 'cpwillis',
  openGraph: {
    type: 'website',
    siteName: 'minigames',
    title: 'minigames',
    description: 'Browser-based developer mini games. Free to play.',
    url: 'https://minigames.cpwillis.dev',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'minigames' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'minigames',
    description: 'Browser-based developer mini games. Free to play.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'minigames',
  url: 'https://minigames.cpwillis.dev',
  description: 'Browser-based developer mini games',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: { '@type': 'Person', name: 'cpwillis', url: 'https://cpwillis.dev' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Flash-free theme: sets class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <Nav />
          <main className="max-w-4xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
            <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
              <span>minigames &copy; {new Date().getFullYear()}</span>
              <a
                href={process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com/cpwillis/minigames'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Open source &rarr;
              </a>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
