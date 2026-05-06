# TODO

## Assets
- [ ] Replace placeholder images and icons
  - `public/og.png` — 1200×630 OG image (dark background, "minigames" wordmark)
  - `public/apple-touch-icon.png` — 180×180 for iOS home screen
  - `public/icon-192.png` — PWA manifest icon
  - `public/icon-512.png` — PWA manifest icon
  - `public/favicon.ico` — proper ICO (currently 1×1 placeholder)

## Deployment
- [ ] Push repo to GitHub
- [ ] Deploy Workers API
  - `wrangler d1 create minigames-db` → copy `database_id` into `api/wrangler.toml`
  - `wrangler d1 execute minigames-db --file=src/db/schema.sql`
  - `wrangler deploy`
  - Add DNS CNAME: `api` → `<worker>.workers.dev` (proxied)
- [ ] Deploy frontend to Cloudflare Pages
  - Connect GitHub repo, build command `npm run build`, output dir `out`
  - Add custom domain `minigames.cpwillis.dev`
  - Disable preview deployments (branch controls → main only)
- [ ] Set production env vars in Cloudflare Pages
  - `NEXT_PUBLIC_SITE_URL=https://minigames.cpwillis.dev`
  - `NEXT_PUBLIC_API_URL=https://api.minigames.cpwillis.dev`
  - `NEXT_PUBLIC_GITHUB_URL=https://github.com/cpwillis/minigames`

## SEO
- [ ] Verify domain in Google Search Console (HTML tag method → add to `layout.tsx` metadata)
- [ ] Submit sitemap: `https://minigames.cpwillis.dev/sitemap.xml`
