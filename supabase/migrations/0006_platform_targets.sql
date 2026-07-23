-- 0006_platform_targets.sql
-- Decision: platforms are selected at schedule time (Buffer-style), not at planning.
-- Stored on content_items.platforms (text[]) when scheduling from Ready.

alter table public.content_items
  add column if not exists platforms text[] default '{}';

comment on column public.content_items.platforms is
  'Platform targets chosen at schedule time (ADR 0004 open question resolved: schedule-time selection).';
