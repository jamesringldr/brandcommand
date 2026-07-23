import { supabase } from '../supabase'
import type { AiSuggestion, BrandVoiceProfile, ContentItem } from '../database.types'
import { createItem } from '../planner/api'
import { updateItem } from '../planner/api'

export async function getVoiceProfile(
  brandId: string,
): Promise<BrandVoiceProfile | null> {
  const { data, error } = await supabase
    .from('brand_voice_profiles')
    .select('*')
    .eq('brand_id', brandId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertVoiceProfile(
  profile: Omit<BrandVoiceProfile, 'updated_at'> & { updated_at?: string },
): Promise<BrandVoiceProfile> {
  const { data, error } = await supabase
    .from('brand_voice_profiles')
    .upsert({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listSuggestions(
  brandId: string,
): Promise<AiSuggestion[]> {
  const { data, error } = await supabase
    .from('ai_suggestions')
    .select('*')
    .eq('brand_id', brandId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/** Calls Edge Function ai-assist; falls back to local heuristic if unavailable. */
export async function requestSuggestions(brandId: string): Promise<AiSuggestion[]> {
  const { data, error } = await supabase.functions.invoke('ai-assist', {
    body: { action: 'suggest', brand_id: brandId },
  })

  if (!error && data?.suggestions) {
    return data.suggestions as AiSuggestion[]
  }

  // Local fallback so UI works before Edge Function is deployed
  const voice = await getVoiceProfile(brandId)
  const seed: AiSuggestion[] = [
    {
      id: crypto.randomUUID(),
      brand_id: brandId,
      title: 'Behind the scenes of our latest launch',
      body: `Share a candid moment that matches our ${voice?.tone ?? 'brand'} voice for ${voice?.audience ?? 'customers'}.`,
      rationale: 'Fallback suggestion — wire ai-assist Edge Function for live generation.',
      status: 'pending',
      derived_from: null,
      created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      brand_id: brandId,
      title: 'Customer win of the week',
      body: 'Highlight a concrete outcome. Keep it specific and short.',
      rationale: 'Social proof pattern; cite recent metrics when ingest is live.',
      status: 'pending',
      derived_from: null,
      created_at: new Date().toISOString(),
    },
  ]

  const { data: inserted, error: insertError } = await supabase
    .from('ai_suggestions')
    .insert(
      seed.map(({ title, body, rationale, brand_id, derived_from, status }) => ({
        title,
        body,
        rationale,
        brand_id,
        derived_from,
        status,
      })),
    )
    .select()

  if (insertError) throw insertError
  return inserted ?? []
}

export async function acceptSuggestion(
  suggestion: AiSuggestion,
): Promise<ContentItem> {
  const item = await createItem({
    brand_id: suggestion.brand_id,
    title: suggestion.title,
    body: suggestion.body ?? undefined,
    derived_from: suggestion.derived_from,
  })
  await supabase
    .from('ai_suggestions')
    .update({ status: 'accepted' })
    .eq('id', suggestion.id)
  return item
}

export async function rejectSuggestion(id: string): Promise<void> {
  const { error } = await supabase
    .from('ai_suggestions')
    .update({ status: 'rejected' })
    .eq('id', id)
  if (error) throw error
}

export async function improveCopy(
  item: ContentItem,
  instruction: string,
): Promise<ContentItem> {
  const { data, error } = await supabase.functions.invoke('ai-assist', {
    body: {
      action: 'improve',
      brand_id: item.brand_id,
      content_item_id: item.id,
      body: item.body,
      instruction,
    },
  })

  if (!error && data?.body) {
    return updateItem(item.id, { body: data.body as string })
  }

  // Fallback: light local rewrite note
  const improved = `${item.body ?? ''}\n\n— Revised for clarity (${instruction})`
  return updateItem(item.id, { body: improved.trim() })
}

export async function critiqueItem(item: ContentItem): Promise<ContentItem> {
  const { data, error } = await supabase.functions.invoke('ai-assist', {
    body: {
      action: 'critique',
      brand_id: item.brand_id,
      content_item_id: item.id,
      body: item.body,
      title: item.title,
    },
  })

  const critique =
    (!error && (data?.critique as string | undefined)) ||
    'Advisory critique (fallback): check hook strength, brand voice alignment, and CTA clarity. AI must never set Ready.'

  return updateItem(item.id, { ai_critique: critique })
}
