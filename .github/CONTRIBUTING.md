# Contributing

No support and no maintenance commitment: issues and pull requests may be read, ignored, or closed
without reply, and the site can go offline at any time. Contribute only on those terms.

Setup, tests and deployment: [README](../README.md).

## Adding a game

1. Create `src/features/games/components/YourGame.tsx`:

```tsx
'use client'

export const meta = {
  id: 'your-game',                // kebab-case, unique
  title: 'Your Game',
  description: 'One sentence describing the game.',
  icon: '🎮',
  difficulty: 'medium' as const,  // easy | medium | hard
  maxPoints: 750,                 // easy=500, medium=750, hard=1000
  order: 16,                      // grid position
}

export default function YourGame({ onComplete }: { onComplete: () => void }) {
  // Call onComplete() exactly once, and only when the player has actually won.
  // No timer of your own: the route wrapper owns timing and scoring.
  return <div>...</div>
}
```

2. Add the id to `shared/game-ids.ts`. That list types `GameMeta.id`, generates the static route and
   is what the worker validates scores against, so there is nowhere else to register it.
3. Import the component and add one entry to `GAMES` in `src/features/games/registry.ts`.
4. Add the game URL to `public/sitemap.xml`.
5. `npm test`.

## Requirements

`tests/contract.test.mjs` covers the first four, so a half-finished addition fails there rather than
in review:

- calls `onComplete()`, and runs no clock of its own
- `maxPoints` matches the difficulty tier (easy=500, medium=750, hard=1000)
- no network calls from a game component: all data stays client-side
- semantic colour tokens only (`bg-surface`, `text-muted`, `border-line`, `text-accent` and friends,
  defined in `src/app/globals.css`). No `dark:` variants, no raw palette colours: the tokens already
  swap per theme
- playable from a keyboard: interactive elements are `<button>`, not `<div onClick>`, and every
  control has an accessible name (`aria-label` where the visible content is only an emoji)
- no third-party content: no quotes, lyrics, logos, brand marks, images or question banks copied
  from elsewhere. Write original text, or use plain factual material
- no new npm dependencies, in game files or anywhere else

Schema changes are migrations: see [Deploying](../README.md#deploying).
