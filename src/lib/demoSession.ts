import type { User } from '@supabase/supabase-js'
import type { Brand } from './database.types'
import type { SessionContext } from './session'

/** Single demo brand for SKIP_AUTH local builds. */
export const DEMO_BRAND: Brand = {
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'demo',
  name: 'Demo Brand',
  drive_folder_id: null,
  created_at: new Date().toISOString(),
}

export function demoSessionContext(): SessionContext {
  const user = {
    id: 'dev-user',
    email: 'dev@localhost',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User

  return {
    user,
    role: 'owner',
    brands: [DEMO_BRAND],
    isOwner: true,
  }
}
