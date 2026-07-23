import type { ConnectorAdapter } from './types.js'

/** GA4 Data API — sessions, users, conversions. Credentials from bws at runtime. */
export const ga4: ConnectorAdapter = {
  provider: 'ga4',
  async fetchMetrics(brandId, _externalAccountId, range) {
    // Placeholder until GA4 credentials are wired via bws.
    return [
      {
        brand_id: brandId,
        provider: 'ga4',
        metric_key: 'sessions',
        dimension: null,
        value: 0,
        period_start: range.start,
        period_end: range.end,
      },
    ]
  },
}
