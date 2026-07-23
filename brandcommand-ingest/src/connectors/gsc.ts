import type { ConnectorAdapter } from './types.js'

export const gsc: ConnectorAdapter = {
  provider: 'gsc',
  async fetchMetrics(brandId, _externalAccountId, range) {
    return [
      {
        brand_id: brandId,
        provider: 'gsc',
        metric_key: 'clicks',
        dimension: null,
        value: 0,
        period_start: range.start,
        period_end: range.end,
      },
    ]
  },
}
