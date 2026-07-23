import type { ContentStatus, ContentType } from '../database.types'

/**
 * UI mirror of the Postgres trigger in 0003b_transitions.sql.
 * The trigger is authoritative — this only disables invalid options in the UI.
 */
const FORWARD: Record<ContentStatus, ContentStatus[]> = {
  Planned: ['Editing', 'Killed'],
  Editing: ['Reviewing', 'Planned', 'Killed'],
  Reviewing: ['Ready', 'Editing', 'Killed'],
  Ready: ['Scheduled', 'Published', 'Editing', 'Reviewing', 'Killed'],
  Scheduled: ['Ready', 'Killed'], // Posted is service-only; Ready = publish failure
  Posted: [],
  Published: [],
  Killed: [],
}

export function allowedTransitions(
  status: ContentStatus,
  type: ContentType,
): ContentStatus[] {
  return (FORWARD[status] ?? []).filter((next) => {
    if (type === 'blog' && (next === 'Scheduled' || next === 'Posted')) {
      return false
    }
    if (type === 'social' && next === 'Published') return false
    if (next === 'Posted') return false // never offered in UI
    return true
  })
}

export const BOARD_COLUMNS: ContentStatus[] = [
  'Planned',
  'Editing',
  'Reviewing',
  'Ready',
  'Scheduled',
  'Posted',
  'Published',
  'Killed',
]
