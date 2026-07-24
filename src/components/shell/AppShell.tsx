import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBrandContext } from '../BrandProvider'
import { cn } from '../../lib/cn'
import { TreeItem } from './SidebarTree'
import { SidebarNav } from './SidebarNav'
import { useCreatePostModal } from '../composer/CreatePostModalContext'

type AppShellProps = {
  children: ReactNode
  title?: string
  subtitle?: string
  headerAction?: ReactNode
  /** Lock shell to viewport height and let children fill (e.g. scrollable planner columns). */
  fillHeight?: boolean
}

export function AppShell({
  children,
  title,
  subtitle,
  headerAction,
  fillHeight = false,
}: AppShellProps) {
  const location = useLocation()
  const { brands, logout, loading, activeBrand } = useBrandContext()
  const { openCreatePost } = useCreatePostModal()
  const brand = activeBrand ?? brands[0] ?? null
  const base = brand ? `/${brand.slug}` : '/'
  const isGenerateView =
    Boolean(brand) &&
    (location.pathname === `${base}/create` ||
      location.pathname.startsWith(`${base}/create/`))

  return (
    <div
      className={cn(
        'flex bg-neutral-950 text-neutral-100',
        fillHeight ? 'h-dvh overflow-hidden' : 'min-h-screen',
      )}
    >
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
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={openCreatePost}
                  className="flex w-[80%] items-center justify-center rounded-md bg-accent-600 px-2 py-2 text-sm font-bold text-white transition hover:bg-accent-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
                >
                  + New
                </button>
              </div>
              <SidebarNav base={base} />
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

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          fillHeight && 'min-h-0',
        )}
      >
        <header className="shrink-0 border-b border-neutral-800 bg-neutral-900/80 px-6 py-4">
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
                    className="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-accent-400"
                  >
                    Planner
                  </Link>
                ) : (
                  <Link
                    to={`${base}/create`}
                    className="rounded-md bg-accent-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-accent-400"
                  >
                    Generate
                  </Link>
                ))}
            </div>
          </div>
        </header>
        <main
          className={cn(
            'min-h-0 flex-1 px-6',
            fillHeight
              ? 'flex flex-col overflow-hidden pt-6 pb-0'
              : 'overflow-y-auto py-6',
          )}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
