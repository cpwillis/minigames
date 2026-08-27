# minigames

Browser-based developer mini games. 15 games covering CS concepts, typing, memory, git, regex, and more. Hosted at [minigames.cpwillis.dev](https://minigames.cpwillis.dev).

## Status and support

This is an unpaid hobby project. **There is no support**: no help desk, no SLA, no uptime
commitment, and no undertaking to answer issues or fix anything. It is provided as is, with no
warranty, and the author accepts no liability for its use. It may be changed, taken offline or
deleted at any time, without notice, along with every score and display name stored on the server.
Do not depend on it. Full terms: [minigames.cpwillis.dev/legal](https://minigames.cpwillis.dev/legal)
(source: `src/app/legal/page.tsx`).

## Stack

- **Next.js 15** — App Router, TypeScript, static export (`output: 'export'`)
- **Tailwind CSS v4** — one semantic token palette in `src/app/globals.css`; components use
  role names (`bg-surface`, `text-muted`) rather than per-theme colour pairs
- **Cloudflare Pages** — hosts the static `out/` build
- **Cloudflare Workers + Hono + D1** — optional API for the shared leaderboard

Runtime dependencies: `next`, `react`, `react-dom` on the frontend, `hono` on the worker. Nothing
else. Theming, dialogs, tabs and the timer are hand-rolled because each is a few lines.

## Running locally

Local dev mirrors production exactly: the worker runs on `localhost:8787` against a local D1 (SQLite under `api/.wrangler/`), and the frontend on `localhost:3000` talks to it. No Cloudflare account or login needed.

```bash
# Terminal 1: API + local D1
cd api
npm install
npm run db:migrate:local   # applies api/migrations/*.sql to the local D1
npm run dev                # worker on http://localhost:8787

# Terminal 2: frontend
npm install
cp .env.example .env.local # points NEXT_PUBLIC_API_URL at localhost:8787
npm run dev                # app on http://localhost:3000
```

Tests are `node --test` over `src/**/*.test.ts` — no framework, no config:

```bash
npm test
```

Games are fully playable without the API. Progress is stored in localStorage; the worker only backs the shared leaderboard and display names.

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, used in metadata |
| `NEXT_PUBLIC_API_URL` | Workers API base URL |
| `NEXT_PUBLIC_GITHUB_URL` | GitHub repo link shown in footer |

## Deploying

### 1. Cloudflare Pages (frontend)

1. Push to GitHub and connect the repo in Cloudflare Pages.
2. Build settings: command `npm run build`, output directory `out`.
3. Add env vars (Production): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GITHUB_URL`.
4. Custom domain: `minigames.cpwillis.dev`.
5. Disable preview deployments: Settings → Builds & deployments → branch controls → main only.

### 2. Cloudflare D1 (database)

```bash
cd api
npm install
npx wrangler login
npm run db:create          # first time only: prints a database_id for api/wrangler.toml
npm run db:migrate:remote  # applies any unapplied migrations to the production D1
npm run db:migrations:list # what is applied and what is pending
```

Schema changes are migrations in `api/migrations/`, applied with the commands above. **Never edit
a migration that has been applied**: add a new numbered file. `0001_baseline.sql` is entirely
`IF NOT EXISTS`, so it is a no-op against the database that predates migrations, and builds a
fresh one from scratch. Rehearse against local D1 (`npm run db:migrate:local`) before running
anything against production.

### 3. Cloudflare Workers (API, git-automated)

The route in `api/wrangler.toml` uses `custom_domain = true`, so Cloudflare creates and manages the `api.minigames.cpwillis.dev` DNS record on first deploy. No manual CNAME.

Automated deploys via git (Workers Builds):

1. Cloudflare dashboard → Workers & Pages → Create → Workers → Import a repository.
2. Select this repo, set root directory to `api/`.
3. Build command: `npm install`, deploy command: `npx wrangler deploy`.
4. Every push to `main` that touches `api/` redeploys the worker.

One-off manual deploy instead: `cd api && npm run deploy`.

### 4. Google Search Console

1. Add property `https://minigames.cpwillis.dev` (URL prefix method).
2. Verify via HTML tag — copy the code into `src/app/layout.tsx` metadata: `verification: { google: 'YOUR_CODE' }`.
3. Submit sitemap: `https://minigames.cpwillis.dev/sitemap.xml`.

## Security

- Every account has a **secret**: 32 random bytes generated in the browser, held in localStorage,
  never displayed. Renaming, submitting scores and reading your own records require
  `Authorization: Bearer <secret>`; the server stores only its SHA-256 and compares in constant
  time. The user id is public and is just an identifier. Rows predating this have `secret_hash`
  NULL and are claimed by the first caller to present a secret, because their ids were public
  anyway (see `api/src/lib/auth.ts`).
- Display-name changes are rate limited to one per hour per account.
- All input is validated server-side (the client checks are UX only): display names are `[a-zA-Z0-9 ]`, 1 to 20 chars, profanity-filtered via `shared/profanity.ts` against a public word list; user ids must be v4 UUIDs; `game_id` must be in the whitelist in `api/src/lib/validate.ts` (update it when adding a game); points and times are bounds-checked.
- All DB access uses bound parameters (no string-built SQL).
- CORS is locked to the production origin and `localhost:3000`; the worker never returns stack traces (`app.onError`).
- `public/_headers` sets CSP, `X-Frame-Options`, `nosniff`, and referrer policy on the static site; display names render through React escaping, so stored XSS is blocked twice (charset whitelist + escaping).
- No cookies, no analytics and no third-party scripts are served. Progress and the theme live in
  `localStorage`; only a random id, a chosen display name and per-game times/points reach the server.
- Scores are still computed in the browser, so a determined player can submit a score they did not
  earn for **their own** account. They can no longer touch anyone else's. Treat the leaderboard as
  decorative. For volume abuse, add a Cloudflare WAF rate-limiting rule on
  `api.minigames.cpwillis.dev/*` (eg 20 req/min per IP on POST/PUT).

## Shared code

`shared/` holds what both deployables need: display-name validation and the profanity filter.
The word list is the English list from
[LDNOOBW](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words),
CC-BY-4.0, © Shutterstock, vendored with its licence and attributed in `shared/NOTICE.md`.
`shared/profanity-words.ts` is generated: run `node scripts/build-profanity.mjs` after changing
the list, never edit it by hand.

## Adding a game

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md). `src/features/games/game-ids.ts` is the
single source of truth for ids: `GameMeta.id` is typed from it, so registering a game without a
route (or the reverse) fails the build. The worker keeps its own copy in `api/src/lib/validate.ts`
because it is a separate deployable.

## License

MIT for the code, which carries its own warranty disclaimer. Game text and artwork are original.
See [/legal](https://minigames.cpwillis.dev/legal) for the terms that apply to using the site.
