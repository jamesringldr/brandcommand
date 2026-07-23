import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * PKCE callback — Supabase detects the session from the URL hash/query
 * when detectSessionInUrl is true. We wait for the session then redirect.
 */
export default function AuthCallback() {
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setFailed(true)
      return
    }

    let active = true
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'SIGNED_IN' || session) setReady(true)
    })

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (data.session) setReady(true)
      else {
        // Give PKCE exchange a moment; then fail soft
        window.setTimeout(() => {
          void supabase.auth.getSession().then(({ data: again }) => {
            if (!active) return
            if (again.session) setReady(true)
            else setFailed(true)
          })
        }, 1500)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (failed) return <Navigate to="/login" replace />
  if (ready) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
      Completing sign-in…
    </div>
  )
}
