# Contributing

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

2. Open `src/features/games/registry.ts` and add your import + one entry to the `GAMES` array.

3. Add your game URL to `public/sitemap.xml`.

4. Run `npm run build` — zero TypeScript errors required.

## Game requirements

- Must call `onComplete()` exactly once on win, never before
- Must not make external API calls — all data stays client-side
- `maxPoints` must match difficulty tier (easy=500, medium=750, hard=1000)
- Must work in both light and dark mode (use Tailwind `dark:` classes or CSS vars)
- No new npm dependencies in game files

## Submitting a PR

Fork the repo, create a branch, and open a PR against `main`. The PR template will give you a checklist. Include a short description of what the game does and why it fits the dev theme.

## Reporting bugs

Open an issue using the **Bug report** template.

## Suggesting games

Open an issue using the **Game idea** template.
