# BrandCommand — Claude Code Instructions

## Operation Context

This repo belongs to the **BrandCommand** Operation under the **Internal Tools** Command Center.

- **Operation folder:** `~/.claude/operations/` (symlink → `/Users/jameso/DevWork/Maiztro/Maiztro-Library/operations/brand-command/`)
- **Missions:** brand-command (the app), social-scheduler (publishing service on serv02)
- **Status & decisions:** Check `~/.claude/operations/README.md` + `missions-index.md`
- **Key docs:** See mission `/Maiztro-Library/missions/brand-command/` for PRD, architecture, roadmap
- **For harness questions:** Open Maiztro in Claude Code and invoke `/op-god brand-command` or `/maiztro`
- **For BrandCommand app work:** Stay here in Cursor; this file + `.claude/` has the context you need

When working in Cursor with this file open, all operation-level agents and context are available through the symlink.

## Stack

- **Frontend:** React 18 + Vite (TS) + TailwindCSS
- **Database:** Supabase (PostgreSQL with RLS on `brand_id`)
- **Hosting:** Cloudflare Pages (static SPA)
- **Auth:** Supabase Auth + Google OAuth
- **State:** Supabase + React Query / TanStack Query

## Key Constraints

- **Static host only** — no application server. Persistent services (scheduler, ingestion) run elsewhere (serv02).
- **Multi-brand.** Brand is the root entity. `brand_id` scopes everything (RLS policy, data retrieval, access control).
- **Data model:** Content items (Planner), publish events (from scheduler), analytics rollup per brand.
- **Supabase Edge Functions** — the scheduler publishes to a public Edge Function endpoint for callback.

## Conventions

- All tables carry `brand_id` and RLS policy: `brand_id = auth.jwt() ->> 'brand_id'`
- No multi-tenancy proper — growth past ~4 brands / ~3 users triggers a rebuild, not expansion.
- Env vars: `.env.local` for Supabase URL and anon key

## Reference

- PRD: `/Maiztro-Library/missions/brand-command/PRD.md`
- Decisions: `/Maiztro-Library/missions/brand-command/decisions/`
- Architecture: `/Maiztro-Library/missions/brand-command/architecture.md` (SUPERSEDED — rewrite at M7)
- Roadmap: `/Maiztro-Library/missions/brand-command/roadmap.md`
- Current status: See `~/.claude/operations/missions-index.md` and op-god memory at `~/.claude/op-god/brand-command/CONTEXT.md`
