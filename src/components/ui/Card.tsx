import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type CardProps = {
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'section'
}

export function Card({ children, className, as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-lg border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
