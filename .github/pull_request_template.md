## What does this PR do?

## Checklist

- [ ] New game: `meta` export present with all required fields (`id`, `title`, `description`, `icon`, `difficulty`, `maxPoints`, `order`)
- [ ] `maxPoints` matches difficulty (easy=500, medium=750, hard=1000)
- [ ] Game calls `onComplete()` on win and never before
- [ ] No external API calls inside the game component
- [ ] Added to `registry.ts`
- [ ] URL added to `public/sitemap.xml`
- [ ] Tested in both light and dark mode
- [ ] `npm run build` passes with no TypeScript errors
