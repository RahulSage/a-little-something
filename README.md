# A Little Something

A small static site: a countdown that turns into a celebration at midnight (IST) on the configured date, every year.

## Personalise

All text, the date, and the photo list live in [`src/config.ts`](src/config.ts).
Photos go in `public/photos/` (WebP, ~1000px is plenty).

## Develop

```bash
npm install
npm run dev
```

Preview any moment by adding `?now=` to the URL (the clock runs forward from there):

- `?now=2026-10-05T23:59:55%2B05:30` – watch the midnight reveal
- `?now=2026-10-06T15:00:00%2B05:30` – birthday mode
- `?now=2026-10-07T00:00:00%2B05:30` – countdown to next year

```bash
npm test        # date/timezone boundary tests
npm run build   # static output in dist/
```

## Deploy

**GitHub Pages** (already wired up): every push to `main` runs `.github/workflows/deploy.yml`, which tests, builds and publishes `dist/`. In the repo settings, *Pages → Source* must be **GitHub Actions**.

**Netlify / Vercel / Cloudflare Pages**: build command `npm run build`, output directory `dist`. No server or env vars needed.
