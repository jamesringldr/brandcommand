import { cn } from '../../lib/cn'

type Tab = {
  id: string
  label: string
}

type TabsProps = {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

/** Segmented tabs — violet active, matching maiztro-ops filter chips. */
export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex rounded-lg border border-neutral-700 bg-neutral-900 p-1',
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs transition',
              active
                ? 'bg-violet-600 font-medium text-white'
                : 'text-neutral-400 hover:text-neutral-200',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
