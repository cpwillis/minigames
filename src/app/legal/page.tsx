import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Privacy',
  description:
    'The terms of use and privacy policy for minigames are published once, and shared across every personal project, at cpwillis.dev.',
  alternates: { canonical: 'https://cpwillis.dev/terms' },
  robots: { index: false, follow: true },
}

const TERMS = 'https://cpwillis.dev/terms'
const PRIVACY = 'https://cpwillis.dev/privacy'

export default function LegalPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-fg">Terms &amp; Privacy</h1>
        <p className="text-sm text-muted">
          These are published in one place and shared across every personal project, so there is a
          single version to keep current.
        </p>
      </header>

      <div className="space-y-3 text-sm leading-relaxed text-muted">
        <p>
          <a href={TERMS} className="underline underline-offset-2 hover:text-fg">
            Terms of Use
          </a>
          {' — '}
          what this is, what it is not, and the absence of any warranty, support or guarantee that it
          stays online.
        </p>
        <p>
          <a href={PRIVACY} className="underline underline-offset-2 hover:text-fg">
            Privacy Policy
          </a>
          {' — '}
          including what minigames stores if you save a display name: the name itself, a random
          identifier, a hashed secret, and your scores and attempt history. The display name is shown
          publicly on the leaderboard.
        </p>
      </div>
    </div>
  )
}
