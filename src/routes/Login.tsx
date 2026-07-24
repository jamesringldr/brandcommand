import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { signInWithEmail, signUpWithEmail } from '../lib/session'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setChecking(false)
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      if (data.session) navigate('/', { replace: true })
      else setChecking(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session) navigate('/', { replace: true })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (!isSupabaseConfigured()) {
        throw new Error(
          'Supabase is not configured. Copy .env.example to .env.local and add your project keys.',
        )
      }
      if (!email || !password) {
        throw new Error('Email and password are required.')
      }
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      let message = 'Sign-in failed'
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        message = (err as { message: string }).message
      }
      setError(message)
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
          {isSignUp ? 'Create an account' : 'Sign in to your account'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 transition focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-2 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 transition focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-md bg-accent-600 px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:bg-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500 disabled:opacity-60"
          >
            {loading
              ? 'Loading…'
              : isSignUp
                ? 'Create Account'
                : 'Sign In'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError(null)
          }}
          disabled={loading}
          className="mt-4 w-full text-sm text-neutral-400 transition hover:text-neutral-300 disabled:opacity-60"
        >
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
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
