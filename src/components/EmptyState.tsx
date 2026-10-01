import type { ReactNode } from 'react'
import { HourglassGlyph } from './Icons'

export type EmptyStateProps = {
  title: string
  children?: ReactNode
  actions?: ReactNode
  /** `pending-source` is the honest default: content awaits the textbook. */
  tone?: 'pending-source' | 'not-found' | 'neutral'
  icon?: ReactNode
  className?: string
  /** Page-level empty states use `h1` so every route keeps a single top heading. */
  headingLevel?: 1 | 2
}

/**
 * Professional empty state.
 *
 * Used wherever curriculum content does not exist yet. It never implies that
 * lessons exist, never lists invented titles, and always explains why the area
 * is empty and what happens next.
 */
export function EmptyState({
  title,
  children,
  actions,
  tone = 'pending-source',
  icon,
  className,
  headingLevel = 2,
}: EmptyStateProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'

  return (
    <div className={['empty-state', `empty-state--${tone}`, className].filter(Boolean).join(' ')}>
      <span className="empty-state__icon" aria-hidden="true">
        {icon ?? <HourglassGlyph size={22} />}
      </span>
      <Heading className="empty-state__title">{title}</Heading>
      {children ? <div className="empty-state__body">{children}</div> : null}
      {actions ? <div className="empty-state__actions">{actions}</div> : null}
    </div>
  )
}
