## What does this PR do?

## Checklist

- [ ] New game: `meta` export present with all required fields (`id`, `title`, `description`, `icon`, `difficulty`, `maxPoints`, `order`)
- [ ] `maxPoints` matches difficulty (easy=500, medium=750, hard=1000)
- [ ] Game calls `onComplete()` on win and never before
- [ ] No external API calls inside the game component
- [ ] Id added to `src/features/games/game-ids.ts` and to `GAME_IDS` in `api/src/lib/validate.ts`
- [ ] Added to `registry.ts`
- [ ] URL added to `public/sitemap.xml`
- [ ] Uses the semantic colour tokens, no `dark:` variants or raw palette colours
- [ ] Playable from a keyboard; every control has an accessible name
- [ ] No third-party content (quotes, lyrics, logos, images, copied question banks)
- [ ] Tested in both light and dark mode
- [ ] `npm run build` and `npm test` pass with no TypeScript errors
