import type { ContentStatus, ContentType } from '../../lib/database.types'
import { allowedTransitions } from '../../lib/planner/transitions'

type StatusSelectProps = {
  status: ContentStatus
  type: ContentType
  onChange: (next: ContentStatus) => void
  disabled?: boolean
}

export function StatusSelect({
  status,
  type,
  onChange,
  disabled,
}: StatusSelectProps) {
  const options = allowedTransitions(status, type)

  return (
    <select
      disabled={disabled || options.length === 0}
      value=""
      onChange={(e) => {
        const v = e.target.value as ContentStatus
        if (v) onChange(v)
      }}
      className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-200 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 disabled:opacity-50"
    >
      <option value="">Move to…</option>
      {options.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  )
}
