import { supabase } from '../supabase'
import type {
  BrandConnector,
  ConnectorProvider,
  MetricSnapshot,
} from '../database.types'

export async function listConnectors(
  brandId: string,
): Promise<BrandConnector[]> {
  const { data, error } = await supabase
    .from('brand_connectors')
    .select('*')
    .eq('brand_id', brandId)
    .order('provider')

  if (error) throw error
  return data ?? []
}

export async function upsertConnector(input: {
  brand_id: string
  provider: ConnectorProvider
  external_account_id?: string
  credentials_ref?: string
  status?: BrandConnector['status']
}): Promise<BrandConnector> {
  const { data, error } = await supabase
    .from('brand_connectors')
    .upsert(
      {
        brand_id: input.brand_id,
        provider: input.provider,
        external_account_id: input.external_account_id ?? null,
        credentials_ref: input.credentials_ref ?? null,
        status: input.status ?? 'disconnected',
      },
      { onConflict: 'brand_id,provider' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listMetrics(
  brandId: string,
  limit = 200,
): Promise<MetricSnapshot[]> {
  const { data, error } = await supabase
    .from('metric_snapshots')
    .select('*')
    .eq('brand_id', brandId)
    .order('period_start', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function listMetricsAllBrands(
  limit = 500,
): Promise<MetricSnapshot[]> {
  const { data, error } = await supabase
    .from('metric_snapshots')
    .select('*')
    .order('period_start', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export function rollupByKey(
  metrics: MetricSnapshot[],
): { key: string; provider: string; total: number }[] {
  const map = new Map<string, { key: string; provider: string; total: number }>()
  for (const m of metrics) {
    const id = `${m.provider}:${m.metric_key}`
    const prev = map.get(id) ?? {
      key: m.metric_key,
      provider: m.provider,
      total: 0,
    }
    prev.total += m.value
    map.set(id, prev)
  }
  return [...map.values()].sort((a, b) => b.total - a.total)
}
