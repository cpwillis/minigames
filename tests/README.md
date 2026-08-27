# Tests

`node --test` with `node:assert` throughout. Requires Node 24 or newer.

```bash
npm test                # everything, cheapest layer first
npm run test:unit       # ~0.2s, no wrangler, no DOM: the loop to use while editing
npm run test:types      # tsc across both packages
npm run test:components
npm run test:migrations
npm run test:api
```

Four of the five layers have no test dependencies at all: Node's native TypeScript stripping
imports the `.ts` sources directly. The component layer is the exception, because the components
are `.tsx` and the native stripper does not handle JSX. It costs five devDependencies:
`tsx` (esbuild, for the JSX transform), `happy-dom` and `@happy-dom/global-registrator` (the DOM),
and `@testing-library/react` with `@testing-library/dom`. None of them ship.

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

## What the important ones are actually guarding

- **`api.test.mjs` → impersonation.** The leaderboard used to return every player's id while the
  id *was* the credential, so anyone could rename anyone. Those cases are the regression guard.
- **`migrations.test.mjs` → the production-shaped database.** The live database predates
  migrations, so `0001_baseline.sql` has to be a no-op against it while still building a fresh
  one. Both directions are tested, along with the backfills and re-running being safe.
- **`contract.test.mjs` → adding a game.** Touching a component but forgetting
  `shared/game-ids.ts`, `registry.ts` or `public/sitemap.xml` is the obvious mistake.
- **The DOM layer → the bugs that actually shipped.** Regex Match toggling twice per click, the
  Settings field never showing a saved name, the theme toggle cycling through a third state, the
  completion overlay never saying "New best!", four games being unplayable by keyboard. Each has
  a test that fails if the fix is undone.

## Isolation

Anything touching D1 runs against its own `--persist-to` directory under `tests/.tmp`, never
`api/.wrangler`. Running the suite cannot damage your local dev database, and each run starts
from a clean one. The worker is started on an OS-assigned free port, so a dev server already
running does not collide.

## Writing component tests

Tests use `createElement` (exported as `h` from `helpers/render.ts`) rather than JSX, so the test
files stay plain `.ts`. The root `tsconfig.json` has to keep `jsx: preserve` for Next, so tsx is
pointed at `tests/tsconfig.tsx.json` instead, where JSX compiles to the automatic runtime.
`helpers/css-hook.mjs` stubs the two games that import their own stylesheet.

`useCleanDom()` at the top of a file resets `localStorage`, the store's in-memory cache and the
theme class between tests.

## Not covered

Visual appearance and layout. The DOM layer asserts structure, behaviour and accessible names,
not how anything looks; nothing here would catch a broken stylesheet.

## CI

`.github/workflows/test.yml` runs the same commands, and is **manual only** (`workflow_dispatch`).
Actions tab → Tests → Run workflow, optionally picking a single layer (`types`, `unit`,
`components`, `migrations`, `api`) or a ref. It needs no
Cloudflare account and no secrets, because wrangler runs in local mode throughout.
