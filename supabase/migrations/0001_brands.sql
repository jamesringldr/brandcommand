-- 0001_brands.sql — Brand registry + access join

create extension if not exists "pgcrypto";

create type public.brand_role as enum ('owner', 'brand_user');

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  drive_folder_id text,
  created_at timestamptz not null default now()
);

create table public.user_brands (
  user_id uuid not null references auth.users (id) on delete cascade,
  brand_id uuid not null references public.brands (id) on delete cascade,
  role public.brand_role not null,
  primary key (user_id, brand_id)
);

create index user_brands_brand_id_idx on public.user_brands (brand_id);
create index user_brands_user_id_idx on public.user_brands (user_id);

comment on table public.brands is 'Root entity. Every scoped table carries brand_id.';
comment on table public.user_brands is 'Manual provisioning only — no invite UI (ADR 0003).';
