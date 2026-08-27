# Contributing

This project has **no support and no maintenance commitment**. Issues and pull requests may be
read, ignored, or closed without reply, and the whole thing can be taken offline at any time
without notice. Contribute only if you are happy on those terms. See
[/legal](https://minigames.cpwillis.dev/legal).

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API is optional for local play — progress is stored in localStorage.

## Adding a game

1. Create `src/features/games/components/YourGame.tsx`:

```tsx
'use client'

export const meta = {
  id: 'your-game',           // kebab-case, unique
  title: 'Your Game',
  description: 'One sentence describing the game.',
  icon: '🎮',
  difficulty: 'medium' as const,  // easy | medium | hard
  maxPoints: 750,            // easy=500, medium=750, hard=1000
  order: 16,                 // determines grid position
}

export default function YourGame({ onComplete }: { onComplete: () => void }) {
  // Call onComplete() exactly once when the player wins.
  // Never call it before the game is actually finished.
  // Do not manage your own timer — the route wrapper handles it.
  return <div>...</div>
}
```

2. Add the id to `src/features/games/game-ids.ts` (the single source of truth for ids and static
   routes) and to the `GAME_IDS` set in `api/src/lib/validate.ts`. The worker rejects scores for
   unknown ids.

3. Open `src/features/games/registry.ts` and add your import + one entry to the `GAMES` array.

4. Add your game URL to `public/sitemap.xml`.

5. Run `npm test`. The contract tests check the points tier, unique ids and orders, registry
   wiring and sitemap coverage, so a half-finished addition fails there rather than in review.

## Tests

`npm test` runs everything; `npm run test:unit` is the sub-second loop to use while editing.
See [tests/README.md](../tests/README.md). There is a manual GitHub Actions workflow if you want
a clean-machine run.

## Database changes

Schema changes go in `api/migrations/` as a new numbered file. Never edit a migration that has
already been applied, and rehearse against local D1 (`cd api && npm run db:migrate:local`) with
representative data before anything touches production. Both new tables and new columns need
`created_at` and `updated_at`.

## Game requirements

- Must call `onComplete()` exactly once on win, never before
- Must not make external API calls — all data stays client-side
- `maxPoints` must match difficulty tier (easy=500, medium=750, hard=1000)
- Must use the semantic colour tokens (`bg-surface`, `text-muted`, `border-line`, `text-accent`
  and friends, defined in `src/app/globals.css`). Do not write `dark:` variants or raw palette
  colours: the tokens already swap per theme.
- Must be playable from a keyboard: interactive elements are `<button>`, not `<div onClick>`
- Every control needs an accessible name (`aria-label` where the visible content is only an emoji)
- Must not embed third-party content: no quotes, lyrics, logos, brand marks, images or question
  banks copied from elsewhere. Write original text, or use plain factual material.
- No new npm dependencies, in game files or anywhere else

## Submitting a PR

Fork the repo, create a branch, and open a PR against `main`. The PR template will give you a checklist. Include a short description of what the game does and why it fits the dev theme.

## Reporting bugs

Open an issue using the **Bug report** template. No response is promised: see the note at the
top of this file.

## Suggesting games

Open an issue using the **Game idea** template.
