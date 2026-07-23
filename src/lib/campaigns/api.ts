import { supabase } from '../supabase'
import type { Campaign } from '../database.types'

export async function listCampaigns(brandId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', brandId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createCampaign(input: {
  brand_id: string
  name: string
  strategy?: string
}): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      brand_id: input.brand_id,
      name: input.name,
      strategy: input.strategy ?? null,
      status: 'draft',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCampaign(
  id: string,
  patch: Partial<
    Pick<Campaign, 'name' | 'strategy' | 'status' | 'starts_at' | 'ends_at'>
  >,
): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
