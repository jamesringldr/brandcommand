import { supabase } from '../supabase'
import { transitionItem } from '../planner/api'
import type { ContentItem } from '../database.types'

const PLATFORMS = ['instagram', 'facebook', 'linkedin', 'x'] as const
export type SchedulePlatform = (typeof PLATFORMS)[number]
export { PLATFORMS }

/**
 * Schedule path: SPA → Edge Function `schedule-item` → social-scheduler on serv02.
 * Browser cannot reach Tailscale/serv02 directly.
 */
export async function scheduleItem(input: {
  content_item_id: string
  brand_id: string
  platforms: string[]
  scheduled_at: string
}): Promise<ContentItem> {
  const { data, error } = await supabase.functions.invoke('schedule-item', {
    body: input,
  })

  if (!error && data?.item) {
    return data.item as ContentItem
  }

  // Dev fallback when Edge Function is not deployed yet:
  // transition to Scheduled locally so the UI can be exercised.
  if (error) {
    console.warn('schedule-item Edge Function unavailable; local fallback', error)
  }

  return transitionItem(input.content_item_id, 'Scheduled', {
    scheduled_at: input.scheduled_at,
    platforms: input.platforms,
    schedule_error: data?.error
      ? String(data.error)
      : 'Scheduled locally — deploy schedule-item Edge Function for real publish',
  })
}
