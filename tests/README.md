# Tests

No framework and no test dependencies: `node --test` with `node:assert`, and Node's native
TypeScript stripping so the `.ts` sources are imported directly. Requires Node 24 or newer.

```bash
npm test              # everything, cheapest layer first
npm run test:unit     # ~0.5s, no wrangler, run this while editing
npm run test:types    # tsc across both packages
npm run test:migrations
npm run test:api
```

## Layers

| File | What it covers | Needs wrangler |
|---|---|---|
| `unit.test.ts` | Scoring, time formatting, display-name validation, the profanity matcher | no |
| `secret.test.ts` | Credential format, SHA-256 hashing, constant-time compare | no |
| `contract.test.mjs` | Game metas against the rules in CONTRIBUTING, and sitemap coverage | no |
| `migrations.test.mjs` | Migrating a fresh database and one shaped like production | yes |
| `api.test.mjs` | The worker end to end: auth, impersonation, validation, cooldown, history, CORS | yes |

## What the important ones are actually guarding

- **`api.test.mjs` → impersonation.** The leaderboard used to return every player's id while the
  id *was* the credential, so anyone could rename anyone. Those cases are the regression guard.
- **`migrations.test.mjs` → the production-shaped database.** The live database predates
  migrations, so `0001_baseline.sql` has to be a no-op against it while still building a fresh
  one. Both directions are tested, along with the backfills and re-running being safe.
- **`contract.test.mjs` → adding a game.** Touching a component but forgetting
  `shared/game-ids.ts`, `registry.ts` or `public/sitemap.xml` is the obvious mistake.

## Isolation

Anything touching D1 runs against its own `--persist-to` directory under `tests/.tmp`, never
`api/.wrangler`. Running the suite cannot damage your local dev database, and each run starts
from a clean one. The worker is started on an OS-assigned free port, so a dev server already
running does not collide.

## Not covered

There are no DOM or component tests: that needs a browser environment and the dependencies that
come with it, and the games are largely visual. `contract.test.mjs` covers their structure
statically. Gameplay itself is checked by hand.

## CI

`.github/workflows/test.yml` runs the same commands, and is **manual only** (`workflow_dispatch`).
Actions tab → Tests → Run workflow, optionally picking a single layer or a ref. It needs no
Cloudflare account and no secrets, because wrangler runs in local mode throughout.
