import { useDroppable } from '@dnd-kit/core'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ContentStatus } from '../../lib/database.types'
import { cn } from '../../lib/cn'

type BoardColumnProps = {
  status: ContentStatus
  count: number
  children: ReactNode
  /** Same destination as sidebar "+ New" (`/:brandSlug/create`). */
  newIdeaHref: string
  /** Posted is service-only — still shown but not a valid drop target. */
  acceptDrops?: boolean
}

export function BoardColumn({
  status,
  count,
  children,
  newIdeaHref,
  acceptDrops = true,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    disabled: !acceptDrops,
  })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex h-full w-72 shrink-0 flex-col overflow-hidden rounded-xl bg-neutral-900/90 ring-1 ring-neutral-800/80 transition-shadow',
        isOver &&
          acceptDrops &&
          'ring-accent-600/50 shadow-[0_0_0_1px_rgba(50,215,53,0.25)]',
      )}
    >
      <header className="flex shrink-0 items-center gap-2 px-3 pt-3 pb-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h2 className="truncate text-sm font-medium text-neutral-100">
            {status}
          </h2>
          <span
            className="inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-neutral-800 px-2 text-xs font-bold tabular-nums text-white"
            aria-label={`${count} items`}
          >
            {count}
          </span>
        </div>
        <Link
          to={newIdeaHref}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-lg leading-none text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
          aria-label={`New idea in ${status}`}
          title="New idea"
        >
          +
        </Link>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-0">
        <Link
          to={newIdeaHref}
          className="shrink-0 rounded-md px-1 py-1.5 text-left text-sm text-neutral-300 transition hover:bg-neutral-800/70 hover:text-neutral-100"
        >
          + New Idea
        </Link>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pt-0.5 pr-0.5">
          {children}
        </ul>
      </div>
    </section>
  )
}
