-- 0002_rls.sql — brand_id RLS invariant

-- Helper: caller is owner of any brand
create or replace function public.is_brand_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_brands ub
    where ub.user_id = auth.uid()
      and ub.role = 'owner'
  );
$$;

-- Helper: caller may access a given brand_id
create or replace function public.can_access_brand(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_brand_owner()
    or exists (
      select 1
      from public.user_brands ub
      where ub.user_id = auth.uid()
        and ub.brand_id = target
    );
$$;

alter table public.brands enable row level security;
alter table public.user_brands enable row level security;

create policy brands_select on public.brands
  for select to authenticated
  using (public.can_access_brand(id));

create policy brands_insert on public.brands
  for insert to authenticated
  with check (public.is_brand_owner());

create policy brands_update on public.brands
  for update to authenticated
  using (public.is_brand_owner())
  with check (public.is_brand_owner());

create policy user_brands_select on public.user_brands
  for select to authenticated
  using (
    public.is_brand_owner()
    or user_id = auth.uid()
  );

-- No client insert/update/delete on user_brands — provision via SQL / service role
