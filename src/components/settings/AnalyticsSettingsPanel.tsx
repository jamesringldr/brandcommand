import { ConnectorGrid } from './ConnectorGrid'

export function AnalyticsSettingsPanel() {
  return (
    <ConnectorGrid
      providers={[
        {
          id: 'ga4',
          label: 'Google Analytics 4',
          blurb: 'Sessions, users, conversions',
        },
        {
          id: 'gsc',
          label: 'Search Console',
          blurb: 'Clicks, impressions, queries',
        },
        {
          id: 'calls',
          label: 'Calls',
          blurb: 'Call tracking rollups',
        },
      ]}
      emptyTitle="No analytics sources connected"
      emptyDescription="Wire GA4 / GSC / calls via bws refs. Ingest writes metric_snapshots for the Dashboard."
    />
  )
}
