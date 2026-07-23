# BrandCommand

Internal multi-brand marketing console — Planner (Buffer-style queue) + centralized analytics rollups.

## Stack

- React + Vite (TS) + Tailwind v4
- Supabase Auth (Google) + Postgres RLS on `brand_id`
- Cloudflare Pages (`public/_redirects`)

## Local run

```bash
cd /Users/jameso/DevWork/BrandCommand
cp .env.example .env.local
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Then apply SQL under `supabase/migrations/` in the Supabase SQL editor (in order), enable Google OAuth, and seed `brands` + `user_brands` (see `0008_seed.sql`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview `dist/` |

## Docs

- [docs/rls-policy.md](docs/rls-policy.md)
- [docs/connectors.md](docs/connectors.md)
- [docs/scheduling.md](docs/scheduling.md)
