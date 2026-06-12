# minigames

Browser-based developer mini games. 15 games covering CS concepts, typing, memory, git, regex, and more. Hosted at [minigames.cpwillis.dev](https://minigames.cpwillis.dev).

## Stack

- **Next.js 15** — App Router, TypeScript, static export (`output: 'export'`)
- **Tailwind CSS v4** — utility styling
- **next-themes** — flash-free light/dark/system toggle
- **Cloudflare Pages** — hosts the static `out/` build
- **Cloudflare Workers + Hono + D1** — optional API for the shared leaderboard

## Running locally

Local dev mirrors production exactly: the worker runs on `localhost:8787` against a local D1 (SQLite under `api/.wrangler/`), and the frontend on `localhost:3000` talks to it. No Cloudflare account or login needed.

```bash
# Terminal 1: API + local D1
cd api
npm install
npm run db:migrate:local   # applies schema.sql to the local D1 (run once, idempotent)
npm run dev                # worker on http://localhost:8787

# Terminal 2: frontend
npm install
cp .env.example .env.local # points NEXT_PUBLIC_API_URL at localhost:8787
npm run dev                # app on http://localhost:3000
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

### 2. Cloudflare D1 (database, one-time)

```bash
cd api
npm install
npx wrangler login
npm run db:create          # prints a database_id: paste it into api/wrangler.toml
npm run db:migrate:remote  # applies schema.sql to the production D1
git add wrangler.toml && git commit -m "chore: set D1 database id"
```

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

- All input is validated server-side (the client checks are UX only): display names are `[a-zA-Z0-9 ]`, 1 to 20 chars, profanity-filtered (`api/src/lib/profanity.ts`, keep in sync with `src/lib/profanity.ts`); user ids must be v4 UUIDs; `game_id` must be in the whitelist in `api/src/lib/validate.ts` (update it when adding a game); points and times are bounds-checked.
- All DB access uses bound parameters (no string-built SQL).
- CORS is locked to the production origin and `localhost:3000`; the worker never returns stack traces (`app.onError`).
- `public/_headers` sets CSP, `X-Frame-Options`, `nosniff`, and referrer policy on the static site; display names render through React escaping, so stored XSS is blocked twice (charset whitelist + escaping).
- A player's UUID is the only credential (no accounts): it is unguessable but anyone holding it can rename that player or submit their scores, and scores are client-computed, so the leaderboard is tamper-resistant, not tamper-proof. For abuse, add a Cloudflare WAF rate-limiting rule on `api.minigames.cpwillis.dev/*` (eg 20 req/min per IP on POST/PUT).

## Adding a game

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

MIT
