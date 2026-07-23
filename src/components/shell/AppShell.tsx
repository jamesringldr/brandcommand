import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { useBrandContext } from '../BrandProvider'
import { Breadcrumbs, type Crumb } from './Breadcrumbs'
import { TreeItem } from './SidebarTree'

type AppShellProps = {
  children: ReactNode
  breadcrumbs?: Crumb[]
  title?: string
  subtitle?: string
  headerAction?: ReactNode
}

const MAIN_LINKS = [
  { id: 'dashboard', label: 'Dashboard', path: 'dashboard' },
  { id: 'planner', label: 'Planner', path: 'planner' },
  { id: 'schedule', label: 'Schedule', path: 'schedule' },
  { id: 'campaigns', label: 'Campaigns', path: 'campaigns' },
  { id: 'suggestions', label: 'AI suggestions', path: 'suggestions' },
] as const

export function AppShell({
  children,
  breadcrumbs = [],
  title,
  subtitle,
  headerAction,
}: AppShellProps) {
  const location = useLocation()
  const { brands, logout, loading, activeBrand } = useBrandContext()
  const brand = activeBrand ?? brands[0] ?? null
  const base = brand ? `/${brand.slug}` : '/'

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
              {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
              {(title || subtitle) && (
                <div className={cn(breadcrumbs.length > 0 && 'mt-3')}>
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
            {headerAction && (
              <div className="flex shrink-0 items-center gap-3 pt-0.5">
                {headerAction}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
