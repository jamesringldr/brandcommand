import { cn } from '../../lib/cn'

const statusStyles: Record<string, string> = {
  Planned: 'bg-neutral-800 text-neutral-300 ring-neutral-700',
  Editing: 'bg-sky-950 text-sky-300 ring-sky-800',
  Reviewing: 'bg-accent-950 text-accent-300 ring-accent-800',
  Ready: 'bg-emerald-950 text-emerald-300 ring-emerald-800',
  Scheduled: 'bg-amber-950 text-amber-300 ring-amber-800',
  Posted: 'bg-emerald-950 text-emerald-300 ring-emerald-800',
  Published: 'bg-emerald-950 text-emerald-300 ring-emerald-800',
  Killed: 'bg-rose-950 text-rose-300 ring-rose-800',
  active: 'bg-emerald-950 text-emerald-300 ring-emerald-800',
  draft: 'bg-neutral-800 text-neutral-300 ring-neutral-700',
  completed: 'bg-sky-950 text-sky-300 ring-sky-800',
  archived: 'bg-neutral-800 text-neutral-400 ring-neutral-700',
  error: 'bg-rose-950 text-rose-300 ring-rose-800',
  disconnected: 'bg-neutral-800 text-neutral-400 ring-neutral-700',
  pending: 'bg-amber-950 text-amber-300 ring-amber-800',
  accepted: 'bg-emerald-950 text-emerald-300 ring-emerald-800',
  rejected: 'bg-rose-950 text-rose-300 ring-rose-800',
}

type StatusBadgeProps = {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = status.replace(/[_-]/g, ' ')
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
        statusStyles[status] ?? 'bg-neutral-800 text-neutral-300 ring-neutral-700',
        className,
      )}
    >
      {label}
    </span>
  )
}
