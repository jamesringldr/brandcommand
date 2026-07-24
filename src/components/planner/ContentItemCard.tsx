import { useDraggable } from '@dnd-kit/core'
import { Link } from 'react-router-dom'
import type { ContentItem } from '../../lib/database.types'
import { cn } from '../../lib/cn'
import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'

type CardFaceProps = {
  item: ContentItem
  className?: string
}

function CardFace({ item, className }: CardFaceProps) {
  return (
    <Card
      className={cn(
        'transition group-hover:border-neutral-600 group-hover:bg-neutral-900',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-100">
          {item.title}
        </h3>
        <StatusBadge status={item.status} />
      </div>
      <p className="mt-2 text-xs capitalize text-neutral-500">{item.type}</p>
      {item.body && (
        <p className="mt-2 line-clamp-2 text-xs text-neutral-400">{item.body}</p>
      )}
    </Card>
  )
}

type ContentItemCardProps = {
  item: ContentItem
  brandSlug: string
}

export function ContentItemCard({ item, brandSlug }: ContentItemCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn('touch-none', isDragging && 'opacity-40')}
      {...listeners}
      {...attributes}
    >
      <Link
        to={`/${brandSlug}/planner/${item.id}`}
        className="group block"
        draggable={false}
        onClick={(e) => {
          if (isDragging) e.preventDefault()
        }}
      >
        <CardFace item={item} />
      </Link>
    </div>
  )
}

/** DragOverlay preview — slight tilt + lift. */
export function ContentItemCardOverlay({ item }: { item: ContentItem }) {
  return (
    <div className="w-64 cursor-grabbing">
      <CardFace item={item} className="planner-card-dragging" />
    </div>
  )
}
