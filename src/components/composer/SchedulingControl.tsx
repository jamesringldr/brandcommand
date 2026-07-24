import { useState } from 'react'
import { cn } from '../../lib/cn'

export type ScheduleOption = 'now' | 'optimal_time' | 'set_date_time'

const SCHEDULE_OPTIONS: {
  id: ScheduleOption
  label: string
  description: string
}[] = [
  { id: 'now', label: 'Now', description: 'Publish your post right away.' },
  {
    id: 'optimal_time',
    label: 'Optimal Time',
    description:
      'Post schedule will be optimized to publish during highest traffic sessions per channel.',
  },
  {
    id: 'set_date_time',
    label: 'Set Date and Time',
    description: 'Choose a specific time to post, or use our recommendation.',
  },
]

export function defaultScheduleAt(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  return d.toISOString().slice(0, 16)
}

export function SchedulingControl({
  value,
  onChange,
  scheduleAt,
  onScheduleAtChange,
}: {
  value: ScheduleOption
  onChange: (option: ScheduleOption) => void
  scheduleAt: string
  onScheduleAtChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)

  const triggerLabel =
    value === 'now'
      ? 'Now'
      : value === 'optimal_time'
        ? 'Optimal Time'
        : scheduleAt
          ? new Date(scheduleAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : 'Set Date and Time'

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-neutral-100 hover:border-neutral-500"
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="absolute bottom-full right-0 z-10 mb-2 w-72 rounded-xl border border-neutral-700 bg-neutral-700 p-1.5 shadow-xl">
          {SCHEDULE_OPTIONS.map((opt) => {
            const active = value === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id)
                  if (opt.id === 'set_date_time' && !scheduleAt) {
                    onScheduleAtChange(defaultScheduleAt())
                  }
                  if (opt.id !== 'set_date_time') setOpen(false)
                }}
                className={cn(
                  'block w-full rounded-lg px-3 py-2.5 text-left transition',
                  active
                    ? 'bg-accent-600/15 ring-1 ring-accent-600/40'
                    : 'hover:bg-neutral-600/70',
                )}
              >
                <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-100">
                  {active && <span className="text-accent-400">✓</span>}
                  {opt.label}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500">
                  {opt.description}
                </span>
              </button>
            )
          })}

          {value === 'set_date_time' && (
            <div className="mt-1 border-t border-neutral-600 px-3 pb-1.5 pt-2">
              <input
                type="datetime-local"
                value={scheduleAt}
                onChange={(e) => onScheduleAtChange(e.target.value)}
                className="w-full rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1.5 text-xs text-neutral-100"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-2 w-full rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-500"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
