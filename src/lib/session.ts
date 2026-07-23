import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Brand, BrandRole } from './database.types'

export type SessionContext = {
  user: User
  role: BrandRole | null
  brands: Brand[]
  isOwner: boolean
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/**
 * Resolve current user → role + accessible brands.
 * Owners see every brand they own; brand_users see only assigned brands.
 */
export async function resolveSessionContext(): Promise<SessionContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: memberships, error: membershipError } = await supabase
    .from('user_brands')
    .select('brand_id, role')

  if (membershipError) {
    console.error('user_brands query failed', membershipError)
    return { user, role: null, brands: [], isOwner: false }
  }

  const isOwner = (memberships ?? []).some((m) => m.role === 'owner')
  const role: BrandRole | null = isOwner
    ? 'owner'
    : ((memberships?.[0]?.role as BrandRole | undefined) ?? null)

  const brandIds = [...new Set((memberships ?? []).map((m) => m.brand_id))]
  if (brandIds.length === 0) {
    return { user, role, brands: [], isOwner }
  }

  const { data: brands, error: brandsError } = await supabase
    .from('brands')
    .select('*')
    .in('id', brandIds)
    .order('name')

  if (brandsError) {
    console.error('brands query failed', brandsError)
    return { user, role, brands: [], isOwner }
  }

  return { user, role, brands: brands ?? [], isOwner }
}

export async function signInWithGoogle(): Promise<void> {
  const redirectTo = `${window.location.origin}/auth/callback`
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { access_type: 'offline', prompt: 'consent' },
      scopes: 'openid email profile',
    },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
