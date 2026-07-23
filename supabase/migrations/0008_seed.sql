-- 0008_seed.sql — replace UUIDs with real auth.users ids after first Google login
--
-- Example (run in SQL editor after you know your user id):
--
--   insert into public.brands (slug, name) values
--     ('acme', 'Acme Co'),
--     ('northstar', 'Northstar')
--   on conflict (slug) do nothing;
--
--   insert into public.user_brands (user_id, brand_id, role)
--   select 'YOUR_AUTH_USER_UUID', id, 'owner' from public.brands
--   on conflict do nothing;

select 1;
