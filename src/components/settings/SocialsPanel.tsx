import { ConnectorGrid } from './ConnectorGrid'

export function SocialsPanel() {
  return (
    <ConnectorGrid
      providers={[
        {
          id: 'meta',
          label: 'Meta (FB + IG)',
          blurb: 'Facebook Page & Instagram publishing + insights',
        },
      ]}
      emptyTitle="No social accounts connected"
      emptyDescription="Save a credentials_ref for Meta (and later other networks). Tokens stay in bws."
    />
  )
}
