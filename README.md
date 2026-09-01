# minigames

15 browser mini games on developer themes: CS concepts, typing, memory, git, regex. Static Next.js
site plus a Workers API for the shared leaderboard. Live at
[minigames.cpwillis.dev](https://minigames.cpwillis.dev).

Unpaid hobby project. No support, no SLA, no uptime commitment. It can be changed, taken offline or
deleted without notice, along with every score and display name on the server. Do not depend on it.
Terms: [cpwillis.dev/terms](https://cpwillis.dev/terms).

## Stack

Next.js 15 App Router, TypeScript, static export (`output: 'export'`), Tailwind v4. Cloudflare Pages
serves the `out/` build; Cloudflare Workers + Hono + D1 back the leaderboard. Runtime dependencies
are `next`, `react`, `react-dom`, and `hono` on the worker. Nothing else, and nothing new: theming,
dialogs, tabs and the timer are hand-rolled because each is a few lines.

Colours are one semantic token palette in `src/app/globals.css`; components use role names
(`bg-surface`, `text-muted`) rather than per-theme colour pairs.

## Running locally

Node 24+. No Cloudflare account or login. Local dev mirrors production: the worker on `:8787`
against a local D1 (SQLite under `api/.wrangler/`), the frontend on `:3000` talking to it.

```bash
# terminal 1: API + local D1
cd api
npm install
npm run db:migrate:local   # applies api/migrations/*.sql to the local D1
npm run dev                # http://localhost:8787

# terminal 2: frontend
npm install
cp .env.example .env.local # already points at the local worker
npm run dev                # http://localhost:3000
```

Games are fully playable without the API. Progress lives in localStorage; the worker only backs the
shared leaderboard and display names.

## Tests

`node --test`, no framework.

```bash
npm test            # types, unit, contract, components, migrations, API integration
npm run test:unit   # sub-second, no wrangler, no DOM: the loop to use while editing
```

Anything touching D1 starts a real worker against a throwaway database under `tests/.tmp`, never
your dev one. Layers, what each guards, and the manual CI workflow:
[tests/README.md](tests/README.md).

## Environment variables

`NEXT_PUBLIC_*` values are baked in at build time, so changing one needs a rebuild.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, used in metadata |
| `NEXT_PUBLIC_API_URL` | Workers API base URL |
| `NEXT_PUBLIC_GITHUB_URL` | Repo link in the footer |

## Deploying

**Frontend (Pages).** Connect the repo in Cloudflare Pages: build command `npm run build`, output
directory `out`, the three `NEXT_PUBLIC_*` vars set for Production, custom domain
`minigames.cpwillis.dev`, preview deployments off (branch controls, main only). Root `wrangler.toml`
mirrors the dashboard; a Pages config file cannot carry the build command, so that half stays there.

**Worker (API).** Dashboard → Workers & Pages → Import a repository, root directory `api/`, build
command `npm install`, deploy command `npx wrangler deploy`. Every push to `main` touching `api/`
redeploys. One-off instead: `cd api && npm run deploy`. The route in `api/wrangler.toml` sets
`custom_domain = true`, so Cloudflare creates and manages the DNS record; a plain zone route does
not, and the API host never resolves.

**Database (D1).**

```bash
cd api
npx wrangler@4 login
npm run db:create          # first time only: prints a database_id for api/wrangler.toml
npm run db:migrate:remote  # applies anything unapplied to the production D1
npm run db:migrations:list # applied vs pending
```

Schema changes are new numbered files in `api/migrations/`. Never edit a migration that has been
applied; rehearse with `npm run db:migrate:local` first. New tables and new columns carry
`created_at` and `updated_at`. `0001_baseline.sql` is entirely `IF NOT EXISTS` because the live
database predates migrations: a no-op against it, a full build on a fresh one.

## Security model

- Each account holds a secret: 32 random bytes generated in the browser, kept in localStorage, never
  displayed. Renaming, submitting scores and reading your own records require
  `Authorization: Bearer <secret>`. The server stores only its SHA-256 and compares in constant time.
  The user id is public and is just an identifier.
- Rows predating auth have `secret_hash` NULL and are claimed by the first caller to present a secret
  (`api/src/lib/auth.ts`). Their ids were public anyway, so there was nothing left to protect.
- Everything is validated server-side; the client checks are UX only. All SQL uses bound parameters.
  CORS is limited to the production origin and `localhost:3000`, and `app.onError` never returns a
  stack trace.
- Display names are `[a-zA-Z0-9 ]`, 1 to 20 chars, profanity-filtered, and changes are limited to one
  per hour per account.
- `public/_headers` carries CSP, HSTS, `X-Frame-Options`, nosniff and referrer policy. No cookies, no
  ads. The only third-party script is Cloudflare Web Analytics, which is cookieless and stores nothing
  in the browser; a contract test fails if the site copy denies analytics while the CSP allows the
  beacon.
- Scores are computed in the browser, so a determined player can still submit a score they did not
  earn for **their own** account. Not anyone else's. Treat the leaderboard as decorative.
- Volume abuse is a zone rate limiting rule, writes only, so a shared IP cannot lose read access:
  `(http.host eq "api.minigames.cpwillis.dev" and http.request.method in {"POST" "PUT"})`.
  `backfillScores` submits sequentially precisely so that threshold can be set low; keep it that way,
  or a returning player's re-sync looks like a flood.

## Shared code

`shared/` is what both deployables import: `game-ids.ts`, display-name validation, the profanity
filter. The word list is the English list from
[LDNOOBW](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words),
CC-BY-4.0, vendored with its licence and attributed in [shared/NOTICE.md](shared/NOTICE.md).
`shared/profanity-words.ts` is generated: run `node scripts/build-profanity.mjs` after changing the
list, never edit it by hand.

## Adding a game

[.github/CONTRIBUTING.md](.github/CONTRIBUTING.md). `shared/game-ids.ts` is the one list of ids: it
types `GameMeta.id`, drives `generateStaticParams`, and is what the worker validates submitted scores
against, so an id with no game behind it (or the reverse) fails the build.
