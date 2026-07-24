import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn'

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cn(
        'h-3.5 w-3.5 shrink-0 text-neutral-500 transition-transform',
        expanded && 'rotate-90',
      )}
    >
      <path
        fill="currentColor"
        d="M6.22 4.22a.75.75 0 0 1 1.06 0L10.5 7.44a.75.75 0 0 1 0 1.12L7.28 11.78a.75.75 0 0 1-1.06-1.06L8.44 8 6.22 5.78a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  )
}

type TreeSectionProps = {
  label: string
  href?: string
  isSectionActive: boolean
  autoExpandOnMatch?: boolean
  expandOnly?: boolean
  children: ReactNode
}

export function TreeSection({
  label,
  href,
  isSectionActive,
  autoExpandOnMatch = false,
  expandOnly = false,
  children,
}: TreeSectionProps) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(autoExpandOnMatch)

  useEffect(() => {
    if (autoExpandOnMatch) setExpanded(true)
  }, [autoExpandOnMatch])

  function handleLabelClick() {
    if (expandOnly) {
      setExpanded((v) => !v)
      return
    }
    setExpanded(true)
    if (href) void navigate(href)
  }

  function handleChevronClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setExpanded((v) => !v)
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-0.5 rounded-md pr-1 transition',
          isSectionActive && 'bg-neutral-800/80',
        )}
      >
        <button
          type="button"
          onClick={handleChevronClick}
          aria-expanded={expanded}
          aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
          className="flex h-7 w-6 shrink-0 items-center justify-center rounded hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-500"
        >
          <Chevron expanded={expanded} />
        </button>
        <button
          type="button"
          onClick={handleLabelClick}
          className={cn(
            'min-w-0 flex-1 truncate py-1.5 text-left text-sm transition',
            isSectionActive
              ? 'font-medium text-neutral-100'
              : 'text-neutral-300 hover:text-white',
          )}
        >
          {label}
        </button>
      </div>
      {expanded && <ul className="mt-0.5 space-y-0.5">{children}</ul>}
    </div>
  )
}

type TreeItemProps = {
  label: string
  href: string
  isActive: boolean
  depth?: number
  nested?: boolean
}

export function TreeItem({
  label,
  href,
  isActive,
  depth = 1,
  nested = false,
}: TreeItemProps) {
  const paddingLeft = nested ? 22 + depth * 10 : 6 + depth * 12

  return (
    <li>
      <Link
        to={href}
        style={{ paddingLeft }}
        className={cn(
          'block rounded-md py-1.5 pr-2 transition',
          nested ? 'text-xs' : 'text-sm',
          isActive
            ? 'bg-neutral-800 font-medium text-white'
            : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200',
        )}
      >
        {label}
      </Link>
    </li>
  )
}
