/**
 * Manual leak-test checklist (M1 gate).
 *
 * 1. Seed two brands; assign user A as brand_user on brand 1 only.
 * 2. Sign in as A with the SPA (anon key).
 * 3. In browser console:
 *
 *    const { data } = await window.__bc.supabase.from('brands').select('*')
 *    // expect only brand 1
 *
 *    await window.__bc.supabase.from('content_items').select('*')
 *    // expect zero rows from brand 2
 *
 * 4. Repeat for metric_snapshots, campaigns, brand_connectors.
 * 5. Fail loudly if any cross-brand row appears — RLS is broken.
 */

export {}
