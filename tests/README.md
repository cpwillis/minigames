# Tests

`node --test` with `node:assert`.

```bash
npm test                # everything, cheapest layer first
npm run test:types      # tsc across both packages
npm run test:unit       # ~0.1s, no wrangler, no DOM: the loop to use while editing
npm run test:components
npm run test:migrations
npm run test:api
```

Four of the five layers have no test dependencies: Node's native type stripping imports the `.ts`
sources directly. The component layer is the exception, because components are `.tsx` and the
stripper does not handle JSX. It costs five devDependencies (`tsx`, `happy-dom`,
`@happy-dom/global-registrator`, `@testing-library/react`, `@testing-library/dom`), none of which
ship.

## Layers

| File | What it covers | Needs wrangler |
|---|---|---|
| `unit.test.ts` | Scoring, time formatting, display-name validation, the profanity matcher | no |
| `secret.test.ts` | Credential format, SHA-256 hashing, constant-time compare | no |
| `contract.test.mjs` | Game metas against the rules in CONTRIBUTING, and sitemap coverage | no |
| `components.test.ts` | GameCard, CompletionOverlay, ResetButton | no (DOM) |
| `games.test.ts` | All 15 games: keyboard reachability, accessible names, interaction | no (DOM) |
| `state.test.ts` | Theme, progress, user store, Nav, Settings, UsernameDialog | no (DOM) |
| `migrations.test.mjs` | Migrating a fresh database and one shaped like production | yes |
| `api.test.mjs` | The worker end to end: auth, impersonation, validation, cooldown, history, CORS | yes |

## What the important ones guard

- **`api.test.mjs`, impersonation.** The leaderboard used to return every player's id while the id
  *was* the credential, so anyone could rename anyone. Those cases are the regression guard.
- **`migrations.test.mjs`, the production-shaped database.** The live database predates migrations,
  so `0001_baseline.sql` has to be a no-op against it while still building a fresh one. Both
  directions are tested, along with the backfills and re-running being safe.
- **`contract.test.mjs`, adding a game.** Touching a component but forgetting `shared/game-ids.ts`,
  `registry.ts` or `public/sitemap.xml` is the obvious mistake.
- **The DOM layer, bugs that actually shipped.** Regex Match toggling twice per click, Settings
  never showing a saved name, the theme toggle cycling through a third state, the completion overlay
  never saying "New best!", four games unplayable by keyboard. Each has a test that fails if the fix
  is undone.

Not covered: visual appearance and layout. Nothing here catches a broken stylesheet.

## Isolation

D1 layers run against their own `--persist-to` directory under `tests/.tmp`, never `api/.wrangler`,
and each run starts clean. The worker binds an OS-assigned free port, so a running dev server does
not collide.

## Writing component tests

Tests use `createElement` (exported as `h` from `helpers/render.ts`) rather than JSX, so the files
stay plain `.ts`. The root `tsconfig.json` has to keep `jsx: preserve` for Next, so tsx is pointed at
`tests/tsconfig.tsx.json` instead, where JSX compiles to the automatic runtime.
`helpers/css-hook.mjs` stubs the two games that import their own stylesheet. `useCleanDom()` at the
top of a file resets `localStorage`, the store's in-memory cache and the theme class between tests.

## CI

`.github/workflows/test.yml` runs the same commands plus a production build and a wrangler bundle
check, and is **manual only** (`workflow_dispatch`): Actions → Tests → Run workflow, optionally
picking one layer (`types`, `unit`, `components`, `migrations`, `api`) or a ref. It needs no
Cloudflare account and no secrets, because wrangler runs in local mode throughout.
