import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  resolveSessionContext,
  signOut,
  type SessionContext,
} from '../lib/session'
import type { Brand } from '../lib/database.types'
import { isSupabaseConfigured } from '../lib/supabase'
import { SKIP_AUTH } from '../lib/devFlags'
import { demoSessionContext } from '../lib/demoSession'

type BrandContextValue = SessionContext & {
  loading: boolean
  activeBrand: Brand | null
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const BrandContext = createContext<BrandContextValue | null>(null)

/** Single-brand mode: only the first accessible brand is used. */
function primaryBrand(brands: Brand[]): Brand[] {
  return brands.slice(0, 1)
}

export function BrandProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { brandSlug } = useParams<{ brandSlug?: string }>()
  const [ctx, setCtx] = useState<SessionContext | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (SKIP_AUTH) {
      setCtx(demoSessionContext())
      setLoading(false)
      return
    }
    if (!isSupabaseConfigured()) {
      setCtx(null)
      setLoading(false)
      return
    }
    const next = await resolveSessionContext()
    if (next) {
      setCtx({ ...next, brands: primaryBrand(next.brands) })
    } else {
      setCtx(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const brands = ctx?.brands ?? []

  const activeBrand = useMemo(() => {
    if (!ctx || brands.length === 0) return null
    if (!brandSlug || brandSlug === 'all') return brands[0] ?? null
    return brands.find((b) => b.slug === brandSlug) ?? brands[0] ?? null
  }, [ctx, brandSlug, brands])

  const logout = useCallback(async () => {
    if (SKIP_AUTH) {
      void navigate('/')
      return
    }
    await signOut()
    void navigate('/login')
  }, [navigate])

  const value: BrandContextValue = {
    user: ctx?.user ?? ({ id: '', email: '' } as SessionContext['user']),
    role: ctx?.role ?? null,
    brands,
    isOwner: ctx?.isOwner ?? false,
    loading,
    activeBrand,
    refresh,
    logout,
  }

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
}

export function useBrandContext(): BrandContextValue {
  const value = useContext(BrandContext)
  if (!value) {
    throw new Error('useBrandContext must be used within BrandProvider')
  }
  return value
}
