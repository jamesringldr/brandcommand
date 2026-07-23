-- 0004_connectors.sql

create type public.connector_provider as enum ('ga4', 'gsc', 'meta', 'calls');
create type public.connector_status as enum ('active', 'error', 'disconnected');

create table public.brand_connectors (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  provider public.connector_provider not null,
  external_account_id text,
  credentials_ref text, -- bws secret name; never store tokens here
  status public.connector_status not null default 'disconnected',
  created_at timestamptz not null default now(),
  unique (brand_id, provider)
);

alter table public.brand_connectors enable row level security;

create policy brand_connectors_select on public.brand_connectors
  for select to authenticated
  using (public.can_access_brand(brand_id));

create policy brand_connectors_insert on public.brand_connectors
  for insert to authenticated
  with check (public.can_access_brand(brand_id));

create policy brand_connectors_update on public.brand_connectors
  for update to authenticated
  using (public.can_access_brand(brand_id))
  with check (public.can_access_brand(brand_id));

create policy brand_connectors_delete on public.brand_connectors
  for delete to authenticated
  using (public.can_access_brand(brand_id));
