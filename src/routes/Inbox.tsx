import { useMemo, useState } from 'react'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { DEMO_INBOX, type InboxItem } from '../lib/demoData'
import { cn } from '../lib/cn'

const KIND_LABEL: Record<InboxItem['kind'], string> = {
  dm: 'DM',
  comment: 'Comment',
  review: 'Review',
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function Inbox() {
  const { activeBrand } = useBrandContext()
  const [selectedId, setSelectedId] = useState<string | null>(
    DEMO_INBOX[0]?.id ?? null,
  )
  const [filter, setFilter] = useState<'all' | InboxItem['kind']>('all')

  const items = useMemo(() => {
    if (filter === 'all') return DEMO_INBOX
    return DEMO_INBOX.filter((i) => i.kind === filter)
  }, [filter])

  const selected = items.find((i) => i.id === selectedId) ?? items[0] ?? null

  if (!activeBrand) return null

  return (
    <AppShell
      title="Inbox"
      subtitle="DMs, comments, and reviews from connected channels"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['all', 'All'],
            ['dm', 'DMs'],
            ['comment', 'Comments'],
            ['review', 'Reviews'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition',
              filter === id
                ? 'bg-accent-600 text-neutral-950'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Inbox zero"
          description="When socials and review sources are connected, new messages land here."
        />
      ) : (
        <div className="grid min-h-[28rem] overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 lg:grid-cols-[22rem_1fr]">
          <ul className="divide-y divide-neutral-800 border-b border-neutral-800 lg:border-b-0 lg:border-r">
            {items.map((item) => {
              const active = selected?.id === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'flex w-full flex-col gap-1 px-4 py-3 text-left transition',
                      active
                        ? 'bg-neutral-800/80'
                        : 'hover:bg-neutral-800/40',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-neutral-100">
                        {item.from}
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums text-neutral-500">
                        {formatWhen(item.received_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={KIND_LABEL[item.kind]} />
                      <span className="text-[10px] uppercase tracking-wide text-neutral-500">
                        {item.channel}
                      </span>
                      {item.unread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                      )}
                    </div>
                    <p className="line-clamp-2 text-xs text-neutral-400">
                      {item.preview}
                    </p>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex flex-col p-6">
            {selected ? (
              <>
                <div className="border-b border-neutral-800 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-neutral-50">
                      {selected.from}
                    </h2>
                    <StatusBadge status={KIND_LABEL[selected.kind]} />
                    <span className="text-xs text-neutral-500">
                      via {selected.channel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(selected.received_at).toLocaleString()}
                  </p>
                </div>
                <p className="mt-6 flex-1 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">
                  {selected.preview}
                </p>
                <div className="mt-6 flex gap-2 border-t border-neutral-800 pt-4">
                  <input
                    placeholder="Reply…"
                    className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
                  />
                  <button
                    type="button"
                    className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-400"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <EmptyState title="Select a message" />
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
