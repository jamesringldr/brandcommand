import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { signInWithGoogle } from '../lib/session'

export default function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setChecking(false)
      return
    }
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/', { replace: true })
      else setChecking(false)
    })
  }, [navigate])

  async function handleGoogle() {
    setError(null)
    setLoading(true)
    try {
      if (!isSupabaseConfigured()) {
        throw new Error(
          'Supabase is not configured. Copy .env.example to .env.local and add your project keys.',
        )
      }
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading…
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-neutral-100">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-50">
          BrandCommand
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Sign in to manage brands, planner, and analytics.
        </p>
        <button
          type="button"
          onClick={() => void handleGoogle()}
          disabled={loading}
          className="mt-6 w-full rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 disabled:opacity-60"
        >
          {loading ? 'Redirecting…' : 'Sign in with Google'}
        </button>
        {error && (
          <p className="mt-4 text-sm text-rose-300" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  )
}
