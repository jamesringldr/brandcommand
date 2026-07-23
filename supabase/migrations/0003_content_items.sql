-- 0003_content_items.sql

create type public.content_type as enum ('social', 'blog');

create type public.content_status as enum (
  'Planned',
  'Editing',
  'Reviewing',
  'Ready',
  'Scheduled',
  'Posted',
  'Published',
  'Killed'
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  type public.content_type not null default 'social',
  status public.content_status not null default 'Planned',
  title text not null,
  body text,
  platforms text[] default '{}',
  scheduled_at timestamptz,
  posted_at timestamptz,
  external_job_id text,
  schedule_error text,
  ai_critique text,
  campaign_id uuid,
  derived_from uuid references public.content_items (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_items_brand_status_idx
  on public.content_items (brand_id, status);

create index content_items_brand_created_idx
  on public.content_items (brand_id, created_at desc);

alter table public.content_items enable row level security;

create policy content_items_select on public.content_items
  for select to authenticated
  using (public.can_access_brand(brand_id));

create policy content_items_insert on public.content_items
  for insert to authenticated
  with check (public.can_access_brand(brand_id));

create policy content_items_update on public.content_items
  for update to authenticated
  using (public.can_access_brand(brand_id))
  with check (public.can_access_brand(brand_id));

create policy content_items_delete on public.content_items
  for delete to authenticated
  using (public.can_access_brand(brand_id));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger content_items_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();
