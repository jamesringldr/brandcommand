import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBrandContext } from '../BrandProvider'
import { TreeItem } from './SidebarTree'

type AppShellProps = {
  children: ReactNode
  title?: string
  subtitle?: string
  headerAction?: ReactNode
}

const MAIN_LINKS = [
  { id: 'dashboard', label: 'Home', path: 'dashboard' },
  { id: 'create', label: 'Generate', path: 'create' },
  { id: 'planner', label: 'Planner', path: 'planner' },
  { id: 'schedule', label: 'Schedule', path: 'schedule' },
  { id: 'campaigns', label: 'Goals', path: 'campaigns' },
  { id: 'suggestions', label: 'Insights', path: 'suggestions' },
] as const

export function AppShell({
  children,
  title,
  subtitle,
  headerAction,
}: AppShellProps) {
  const location = useLocation()
  const { brands, logout, loading, activeBrand } = useBrandContext()
  const brand = activeBrand ?? brands[0] ?? null
  const base = brand ? `/${brand.slug}` : '/'
  const isGenerateView =
    Boolean(brand) &&
    (location.pathname === `${base}/create` ||
      location.pathname.startsWith(`${base}/create/`))

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-100">
      <aside className="flex w-56 shrink-0 flex-col border-r border-neutral-800 bg-neutral-900">
        <div className="border-b border-neutral-800 px-4 py-5">
          <Link
            to={brand ? `${base}/dashboard` : '/'}
            className="text-base font-semibold tracking-tight text-neutral-100 hover:text-white"
          >
            BrandCommand
          </Link>
          <p className="mt-0.5 text-xs text-neutral-500">
            {brand?.name ?? 'Command Center'}
          </p>
        </div>
        <nav
          className="flex-1 overflow-y-auto px-2 py-3 text-[13px]"
          aria-label="Main"
        >
          {loading && (
            <p className="px-2 py-1 text-xs text-neutral-500">Loading…</p>
          )}
          {!loading && brand && (
            <div className="space-y-2">
              <Link
                to={`${base}/create`}
                className="flex items-center justify-center rounded-md bg-accent-600 px-2 py-2 text-sm font-medium text-neutral-950 transition hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
              >
                + New
              </Link>
              <ul className="space-y-0.5">
                {MAIN_LINKS.map((link) => {
                  const href = `${base}/${link.path}`
                  const isActive =
                    location.pathname === href ||
                    location.pathname.startsWith(`${href}/`)
                  return (
                    <TreeItem
                      key={link.id}
                      label={link.label}
                      href={href}
                      isActive={isActive}
                      depth={0}
                    />
                  )
                })}
              </ul>
            </div>
          )}
        </nav>
        <div className="space-y-0.5 border-t border-neutral-800 p-3">
          {brand && (
            <ul className="space-y-0.5">
              <TreeItem
                label="Settings"
                href={`${base}/settings`}
                isActive={location.pathname.startsWith(`${base}/settings`)}
                depth={0}
              />
            </ul>
          )}
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full rounded-md px-2 py-1.5 text-left text-sm text-neutral-400 transition hover:bg-neutral-800/60 hover:text-neutral-200"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-neutral-800 bg-neutral-900/80 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {(title || subtitle) && (
                <div>
                  {title && (
                    <h1 className="text-xl font-semibold tracking-tight text-neutral-50">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3 pt-0.5">
              {headerAction}
              {brand &&
                (isGenerateView ? (
                  <Link
                    to={`${base}/planner`}
                    className="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-medium text-neutral-950 transition hover:bg-accent-400"
                  >
                    Planner
                  </Link>
                ) : (
                  <Link
                    to={`${base}/create`}
                    className="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-medium text-neutral-950 transition hover:bg-accent-400"
                  >
                    Generate
                  </Link>
                ))}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
