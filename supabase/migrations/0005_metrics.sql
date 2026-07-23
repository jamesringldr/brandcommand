-- 0005_metrics.sql — ingested snapshots (not live read-through)

create table public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands (id) on delete cascade,
  provider public.connector_provider not null,
  metric_key text not null,
  dimension text,
  value double precision not null,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now(),
  unique (brand_id, provider, metric_key, dimension, period_start, period_end)
);

create index metric_snapshots_brand_period_idx
  on public.metric_snapshots (brand_id, period_start desc);

alter table public.metric_snapshots enable row level security;

create policy metric_snapshots_select on public.metric_snapshots
  for select to authenticated
  using (public.can_access_brand(brand_id));

-- Writes via service role only (ingest on serv02)
create policy metric_snapshots_service_write on public.metric_snapshots
  for all to service_role
  using (true)
  with check (true);
