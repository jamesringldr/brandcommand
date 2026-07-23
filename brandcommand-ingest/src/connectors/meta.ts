import type { ConnectorAdapter } from './types.js'

/** Meta Graph API — Facebook Page + Instagram insights (one adapter). */
export const meta: ConnectorAdapter = {
  provider: 'meta',
  async fetchMetrics(brandId, _externalAccountId, range) {
    return [
      {
        brand_id: brandId,
        provider: 'meta',
        metric_key: 'reach',
        dimension: null,
        value: 0,
        period_start: range.start,
        period_end: range.end,
      },
    ]
  },
}
