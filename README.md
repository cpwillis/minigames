# minigames

Browser-based developer mini games. 15 games covering CS concepts, typing, memory, git, regex, and more. Hosted at [minigames.cpwillis.dev](https://minigames.cpwillis.dev).

## Stack

- **Next.js 15** — App Router, TypeScript, static export (`output: 'export'`)
- **Tailwind CSS v4** — utility styling
- **next-themes** — flash-free light/dark/system toggle
- **Cloudflare Pages** — hosts the static `out/` build
- **Cloudflare Workers + Hono + D1** — optional API for the shared leaderboard

## Running locally

```bash
npm install
cp .env.example .env.local   # optional: needed for leaderboard API
npm run dev
```

Games are fully playable without the API. Progress is stored in localStorage.

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
npm run db:create          # copy the database_id into api/wrangler.toml
npm run db:migrate         # applies schema.sql
```

### 3. Cloudflare Workers (API)

```bash
cd api
# edit api/wrangler.toml: replace REPLACE_WITH_DATABASE_ID
wrangler deploy
```

Add a Cloudflare DNS CNAME: name `api`, target `<your-worker>.workers.dev`, proxied.

### 4. Google Search Console

1. Add property `https://minigames.cpwillis.dev` (URL prefix method).
2. Verify via HTML tag — copy the code into `src/app/layout.tsx` metadata: `verification: { google: 'YOUR_CODE' }`.
3. Submit sitemap: `https://minigames.cpwillis.dev/sitemap.xml`.

## Adding a game

See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md).

## License

MIT
