import { useEffect, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { SKIP_AUTH } from '../lib/devFlags'

type RequireAuthProps = {
  children: ReactNode
}

/**
 * Client-side route guard — UX only.
 * RLS on brand_id is the real security boundary (ADR 0005).
 *
 * When SKIP_AUTH is true (default while building), this is a no-op.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const [session, setSession] = useState<Session | null | undefined>(
    SKIP_AUTH ? null : undefined,
  )

  useEffect(() => {
    if (SKIP_AUTH) return

    if (!isSupabaseConfigured()) {
      setSession(null)
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (SKIP_AUTH) return children

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
