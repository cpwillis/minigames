import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Privacy',
  description: 'Terms of use and privacy notice for minigames: no accounts, no tracking, no warranty, no support.',
  robots: { index: true, follow: true },
}

const UPDATED = '27 August 2026'

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-fg">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  )
}

export default function LegalPage() {
  return (
    <div className="max-w-2xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-fg">Terms &amp; Privacy</h1>
        <p className="text-sm text-muted">Last updated {UPDATED}.</p>
      </header>

      <div className="rounded-xl border border-warn/30 bg-warn/5 p-5 space-y-2">
        <p className="text-sm font-medium text-fg">The short version</p>
        <p className="text-sm leading-relaxed text-muted">
          minigames is a free hobby project run by one person. There is no support, no warranty and
          no guarantee it will still be here tomorrow. It can be changed, taken offline or deleted at
          any time, without notice, and any scores or names stored on the server can go with it. Play
          it for fun and do not rely on it for anything.
        </p>
      </div>

      <Section id="terms" title="1. Terms of use">
        <p>
          By using minigames (the &ldquo;site&rdquo;) you accept these terms. If you do not accept
          them, do not use the site. The site is operated by an individual (&ldquo;the
          operator&rdquo;) as an unpaid personal project.
        </p>
        <p>
          The site is free. There is no account, no subscription, no payment and nothing is sold to
          you. Nothing here is a contract for the supply of goods or services for a fee.
        </p>
      </Section>

      <Section id="no-support" title="2. No support">
        <p>
          <strong className="text-fg">There is no support of any kind.</strong> There is no help
          desk, no support email, no service level agreement, no uptime commitment and no undertaking
          to respond to any question, bug report or request. Issues raised on the public repository
          may be read, ignored, or closed without reply, entirely at the operator&rsquo;s discretion.
        </p>
        <p>
          Nothing on this site, and no response from the operator, creates any obligation to fix a
          defect, restore data, or keep any feature working.
        </p>
      </Section>

      <Section id="availability" title="3. Availability and discontinuation">
        <p>
          The site is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. It may
          be unavailable, slow, broken or wrong at any time.
        </p>
        <p>
          <strong className="text-fg">
            The operator may modify, suspend, restrict or permanently discontinue the site, the API,
            the leaderboard or any part of them at any time, for any reason or no reason, without
            notice and without liability.
          </strong>{' '}
          This includes permanently deleting all stored scores, display names and player identifiers.
          There is no obligation to give warning, to provide an export, or to preserve anything. Keep
          your own copy of anything you care about; realistically, there is nothing here worth
          keeping.
        </p>
      </Section>

      <Section id="warranty" title="4. No warranty">
        <p>
          To the maximum extent permitted by law, the site is provided without warranties, conditions
          or representations of any kind, whether express or implied, including any implied warranty
          of merchantability, fitness for a particular purpose, accuracy, or non-infringement.
        </p>
        <p>
          Game content (trivia questions, complexity answers, git commands, status codes and so on)
          is written for entertainment and may be incomplete, out of date or simply wrong. It is not
          instruction, certification or professional advice, and must not be relied on.
        </p>
      </Section>

      <Section id="liability" title="5. Limitation of liability">
        <p>
          To the maximum extent permitted by law, the operator is not liable for any loss or damage
          of any kind arising out of or in connection with the site or its unavailability, including
          direct, indirect, incidental, special, consequential or exemplary loss, loss of data, loss
          of profit, loss of goodwill, or business interruption, whether in contract, tort
          (including negligence), statute or otherwise, and whether or not the operator was advised
          of the possibility of that loss.
        </p>
        <p>
          Where liability cannot lawfully be excluded, it is limited to the greatest extent permitted
          by law, and in any event to the total amount you have paid to use the site, which is zero.
        </p>
        <p>
          Nothing in these terms excludes, restricts or modifies any right or remedy you have under
          applicable law that cannot lawfully be excluded, restricted or modified.
        </p>
      </Section>

      <Section id="conduct" title="6. Acceptable use">
        <p>
          Do not submit a display name that is offensive, impersonates someone, or infringes anyone
          else&rsquo;s rights. Do not attempt to disrupt the site, script or automate score
          submissions, or interfere with other players.
        </p>
        <p>
          Any display name or score may be edited or deleted at any time, without notice and without
          explanation. Scores are calculated in your browser, so the leaderboard is best understood
          as decorative rather than authoritative.
        </p>
      </Section>

      <Section id="privacy" title="7. Privacy">
        <p>
          <strong className="text-fg">No cookies, no analytics, no advertising, no tracking, no
          third-party scripts.</strong> Nothing on this site profiles you or follows you elsewhere.
        </p>
        <p>Stored in your own browser (never sent anywhere unless noted below):</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>your game progress: best time and points per game</li>
          <li>your light/dark theme preference</li>
          <li>a random identifier and the display name you chose, if you chose one</li>
        </ul>
        <p>
          Stored on the server, only if you enter a display name and complete a game: that random
          identifier, the display name you typed, and your per-game times and points. That is
          everything. No email address, no password, no IP log kept by the application, no
          fingerprinting.
        </p>
        <p>
          The display name is the only field you control, so do not put anything personal in it. It
          is shown publicly on the leaderboard.
        </p>
        <p>
          The site is hosted on Cloudflare, which processes requests and may log them for security
          and abuse prevention under its own terms.
        </p>
        <p>
          <strong className="text-fg">Deleting your data:</strong> &ldquo;Reset progress&rdquo; in
          Settings clears everything held in your browser. Server-side records can be removed on
          request via the public repository, but see section 2: there is no support, so no timeframe
          is promised. The server data may also be deleted wholesale at any time regardless.
        </p>
      </Section>

      <Section id="ip" title="8. Content and licensing">
        <p>
          The source code is published under the MIT licence, which carries its own warranty
          disclaimer. Game text and the site&rsquo;s artwork are original work by the operator.
          Emoji are Unicode characters rendered by your own device&rsquo;s fonts and are not
          distributed by this site.
        </p>
        <p>
          If you believe something here infringes your rights, raise an issue on the repository
          identifying the material and it will be removed.
        </p>
      </Section>

      <Section id="changes" title="9. Changes to these terms">
        <p>
          These terms may change at any time without notice. The version published here is the
          version that applies. Continued use after a change means you accept it.
        </p>
      </Section>

      <p className="border-t border-line pt-6 text-xs text-faint">
        This page is written in plain language for a free hobby project. It is not legal advice.
      </p>
    </div>
  )
}
