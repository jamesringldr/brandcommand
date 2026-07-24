import type { BrandConnector, ContentItem } from '../database.types'

export type PlannerFilterState = {
  channel: string
  goal: string
  tag: string
  postType: string
}

export const STUB_TAGS = [
  { value: 'promo', label: 'Promo' },
  { value: 'evergreen', label: 'Evergreen' },
  { value: 'launch', label: 'Launch' },
  { value: 'community', label: 'Community' },
] as const

export const STUB_POST_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'thread', label: 'Thread' },
  { value: 'carousel', label: 'Carousel' },
] as const

export const EMPTY_FILTERS: PlannerFilterState = {
  channel: '',
  goal: '',
  tag: '',
  postType: '',
}

/** Expand connected providers into social channel options (same idea as sidebar). */
export function connectedSocialChannels(
  connectors: BrandConnector[],
): { value: string; label: string }[] {
  const channels: { value: string; label: string }[] = []
  const meta = connectors.find(
    (c) => c.provider === 'meta' && c.status !== 'disconnected',
  )
  if (meta) {
    channels.push({ value: 'facebook', label: 'Facebook' })
    channels.push({ value: 'instagram', label: 'Instagram' })
  }
  return channels
}

export function itemMatchesFilters(
  item: ContentItem,
  filters: PlannerFilterState,
): boolean {
  if (filters.goal && item.campaign_id !== filters.goal) return false

  // Tags / post type: UI stubs only — no-op until fields exist
  void filters.tag
  void filters.postType

  if (filters.channel) {
    const platforms = item.platforms ?? []
    // Best-effort: if platforms set, require match; otherwise show until channel lives on items
    if (platforms.length > 0 && !platforms.includes(filters.channel)) {
      return false
    }
  }

  return true
}
