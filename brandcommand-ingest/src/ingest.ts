import { createClient } from '@supabase/supabase-js'
import { ga4 } from './connectors/ga4.js'
import { gsc } from './connectors/gsc.js'
import { meta } from './connectors/meta.js'
import type { ConnectorAdapter, MetricRow } from './connectors/types.js'

/**
 * Pull connector credentials + service-role key from bws at container start.
 * Nothing secret in the image or git.
 */
const adapters: Record<string, ConnectorAdapter> = {
  ga4,
  gsc,
  meta,
}

function yesterdayRange() {
  const end = new Date()
  end.setUTCHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 1)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

async function main() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required')
  }

  const supabase = createClient(url, serviceKey)
  const range = yesterdayRange()

  const { data: connectors, error } = await supabase
    .from('brand_connectors')
    .select('*')
    .eq('status', 'active')

  if (error) throw error

  const rows: MetricRow[] = []
  for (const c of connectors ?? []) {
    const adapter = adapters[c.provider]
    if (!adapter) continue
    const metrics = await adapter.fetchMetrics(
      c.brand_id,
      c.external_account_id,
      range,
    )
    rows.push(...metrics)
  }

  if (rows.length === 0) {
    console.log('No metrics to upsert')
    return
  }

  const { error: upsertError } = await supabase
    .from('metric_snapshots')
    .upsert(rows, {
      onConflict:
        'brand_id,provider,metric_key,dimension,period_start,period_end',
    })

  if (upsertError) throw upsertError
  console.log(`Upserted ${rows.length} metric snapshots`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
