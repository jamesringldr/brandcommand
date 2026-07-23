import { Link } from 'react-router-dom'
import type { ContentItem } from '../../lib/database.types'
import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'

type ContentItemCardProps = {
  item: ContentItem
  brandSlug: string
}

export function ContentItemCard({ item, brandSlug }: ContentItemCardProps) {
  return (
    <Link
      to={`/${brandSlug}/planner/${item.id}`}
      className="group block"
    >
      <Card className="transition group-hover:border-neutral-600 group-hover:bg-neutral-900">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-neutral-100 line-clamp-2">
            {item.title}
          </h3>
          <StatusBadge status={item.status} />
        </div>
        <p className="mt-2 text-xs text-neutral-500 capitalize">{item.type}</p>
        {item.body && (
          <p className="mt-2 line-clamp-2 text-xs text-neutral-400">{item.body}</p>
        )}
      </Card>
    </Link>
  )
}
