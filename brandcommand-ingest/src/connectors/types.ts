export type MetricRow = {
  brand_id: string
  provider: 'ga4' | 'gsc' | 'meta' | 'calls'
  metric_key: string
  dimension: string | null
  value: number
  period_start: string
  period_end: string
}

export type ConnectorAdapter = {
  provider: MetricRow['provider']
  fetchMetrics: (
    brandId: string,
    externalAccountId: string | null,
    range: { start: string; end: string },
  ) => Promise<MetricRow[]>
}
