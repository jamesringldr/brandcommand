# RLS policy invariant

**Every new table carries `brand_id` and gets the same access policy. No exceptions.**

## Policy shape

A row is visible / writable for `authenticated` when:

1. The caller has an `owner` row in `user_brands` for **any** brand (owners see all brands), **or**
2. The caller has a `user_brands` row matching that row’s `brand_id`.

Helpers (migration `0002_rls.sql`):

- `public.is_brand_owner()`
- `public.can_access_brand(target uuid)`

## Provisioning

`user_brands` is **not** writable from the SPA. Seed users and brands via SQL / service role.

## Leak test

Sign in as a `brand_user`, query every table with the anon client, assert zero rows from brands they are not assigned to. This gate blocks later milestones.
