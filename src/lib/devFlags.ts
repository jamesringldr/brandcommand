/**
 * Flip off when auth is ready.
 * Also set VITE_SKIP_AUTH=true in .env.local (already the default for local build).
 */
export const SKIP_AUTH =
  import.meta.env.VITE_SKIP_AUTH === 'true' ||
  import.meta.env.VITE_SKIP_AUTH === '1' ||
  // Default on while scaffolding — set VITE_SKIP_AUTH=false to enforce login
  import.meta.env.VITE_SKIP_AUTH !== 'false'
