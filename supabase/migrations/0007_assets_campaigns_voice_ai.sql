-- 0007_assets_campaigns_voice_ai.sql

create table public.content_item_assets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  drive_file_id text not null,
  url text,
  name text,
  created_at timestamptz not null default now()
);

alter table public.content_item_assets enable row level security;

create policy content_item_assets_all on public.content_item_assets
  for all to authenticated
  using (public.can_access_brand(brand_id))
  with check (public.can_access_brand(brand_id));

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  name text not null,
  strategy text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'completed', 'archived')),
  starts_at date,
  ends_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy campaigns_all on public.campaigns
  for all to authenticated
  using (public.can_access_brand(brand_id))
  with check (public.can_access_brand(brand_id));

alter table public.content_items
  drop constraint if exists content_items_campaign_id_fkey;

alter table public.content_items
  add constraint content_items_campaign_id_fkey
  foreign key (campaign_id) references public.campaigns (id) on delete set null;

create table public.brand_voice_profiles (
  brand_id uuid primary key references public.brands (id) on delete cascade,
  tone text,
  audience text,
  dos text,
  donts text,
  examples text,
  updated_at timestamptz not null default now()
);

alter table public.brand_voice_profiles enable row level security;

create policy brand_voice_profiles_all on public.brand_voice_profiles
  for all to authenticated
  using (public.can_access_brand(brand_id))
  with check (public.can_access_brand(brand_id));

create table public.ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  title text not null,
  body text,
  rationale text,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected')),
  derived_from uuid references public.content_items (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.ai_suggestions enable row level security;

create policy ai_suggestions_all on public.ai_suggestions
  for all to authenticated
  using (public.can_access_brand(brand_id))
  with check (public.can_access_brand(brand_id));
