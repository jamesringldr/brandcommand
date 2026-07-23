import { supabase } from '../supabase'
import type {
  ContentItem,
  ContentStatus,
  ContentType,
} from '../database.types'

export async function listItems(brandId: string): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('brand_id', brandId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getItem(id: string): Promise<ContentItem | null> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createItem(input: {
  brand_id: string
  title: string
  type?: ContentType
  body?: string
  campaign_id?: string | null
  derived_from?: string | null
}): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('content_items')
    .insert({
      brand_id: input.brand_id,
      title: input.title,
      type: input.type ?? 'social',
      body: input.body ?? null,
      status: 'Planned',
      campaign_id: input.campaign_id ?? null,
      derived_from: input.derived_from ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateItem(
  id: string,
  patch: Partial<
    Pick<
      ContentItem,
      'title' | 'body' | 'type' | 'campaign_id' | 'platforms' | 'ai_critique'
    >
  >,
): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('content_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function transitionItem(
  id: string,
  status: ContentStatus,
  extras?: Partial<
    Pick<ContentItem, 'scheduled_at' | 'platforms' | 'schedule_error'>
  >,
): Promise<ContentItem> {
  const { data, error } = await supabase
    .from('content_items')
    .update({ status, ...extras })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(error.message || 'Transition rejected by status machine')
  }
  return data
}

export async function killItem(id: string): Promise<ContentItem> {
  return transitionItem(id, 'Killed')
}

export async function listReadySocial(brandId: string): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('brand_id', brandId)
    .eq('type', 'social')
    .eq('status', 'Ready')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
