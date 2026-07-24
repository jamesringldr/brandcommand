import { Navigate, Outlet, useParams } from 'react-router-dom'
import { BrandProvider, useBrandContext } from '../components/BrandProvider'
import { CreatePostModalProvider } from '../components/composer/CreatePostModalContext'
import { detectBrandFromSubdomain } from '../lib/subdomain'

function ShellInner() {
  const { brandSlug } = useParams<{ brandSlug?: string }>()
  const { loading, brands, activeBrand } = useBrandContext()
  const subdomainBrand = detectBrandFromSubdomain()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading…
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-950 px-6 text-center text-neutral-300">
        <h1 className="text-lg font-semibold text-neutral-50">No brand yet</h1>
        <p className="max-w-md text-sm text-neutral-500">
          Provision a brand and user_brands row in Supabase (SQL).
        </p>
      </div>
    )
  }

  const brand = subdomainBrand
    ? brands.find((b) => b.slug === subdomainBrand) ?? brands[0]!
    : brands[0]!

  if (!brandSlug) {
    return <Navigate to={`/${brand.slug}/dashboard`} replace />
  }

  // Single-brand app — any other slug redirects to the primary brand
  if (brandSlug === 'all' || (!activeBrand && brandSlug !== brand.slug)) {
    return <Navigate to={`/${brand.slug}/dashboard`} replace />
  }

  if (!activeBrand) {
    return <Navigate to={`/${brand.slug}/dashboard`} replace />
  }

  return (
    <CreatePostModalProvider>
      <Outlet />
    </CreatePostModalProvider>
  )
}

export default function Shell() {
  return (
    <BrandProvider>
      <ShellInner />
    </BrandProvider>
  )
}
