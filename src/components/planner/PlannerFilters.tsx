import type { ReactNode } from 'react'
import type { Campaign } from '../../lib/database.types'
import {
  STUB_POST_TYPES,
  STUB_TAGS,
  type PlannerFilterState,
} from '../../lib/planner/filters'

export type { PlannerFilterState }

type PlannerFiltersProps = {
  value: PlannerFilterState
  onChange: (next: PlannerFilterState) => void
  channels: { value: string; label: string }[]
  goals: Campaign[]
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: ReactNode
}) {
  return (
    <label className="flex min-w-[9rem] flex-col gap-1 text-xs text-neutral-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-2 text-sm text-neutral-100 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
      >
        {children}
      </select>
    </label>
  )
}

export function PlannerFilters({
  value,
  onChange,
  channels,
  goals,
}: PlannerFiltersProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <FilterSelect
        label="Channel"
        value={value.channel}
        onChange={(channel) => onChange({ ...value, channel })}
      >
        <option value="">All</option>
        {channels.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Goal"
        value={value.goal}
        onChange={(goal) => onChange({ ...value, goal })}
      >
        <option value="">All</option>
        {goals.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Tags"
        value={value.tag}
        onChange={(tag) => onChange({ ...value, tag })}
      >
        <option value="">All</option>
        {STUB_TAGS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        label="Post Type"
        value={value.postType}
        onChange={(postType) => onChange({ ...value, postType })}
      >
        <option value="">All</option>
        {STUB_POST_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </FilterSelect>
    </div>
  )
}
