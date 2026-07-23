import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export type Crumb = {
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: Crumb[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex list-none flex-wrap items-center gap-1.5 text-neutral-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-neutral-600" aria-hidden>
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-neutral-400 transition hover:text-neutral-100"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast && 'font-medium text-neutral-200')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
