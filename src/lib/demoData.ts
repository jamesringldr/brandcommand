import type { BrandConnector } from './database.types'
import { SKIP_AUTH } from './devFlags'

/** Demo social / analytics connectors when auth is skipped. */
export const DEMO_CONNECTORS: BrandConnector[] = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    brand_id: '00000000-0000-4000-8000-000000000001',
    provider: 'meta',
    external_account_id: '@demobrand',
    credentials_ref: 'bws://demo/meta',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    brand_id: '00000000-0000-4000-8000-000000000001',
    provider: 'ga4',
    external_account_id: 'GA4-DEMO',
    credentials_ref: 'bws://demo/ga4',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    brand_id: '00000000-0000-4000-8000-000000000001',
    provider: 'gsc',
    external_account_id: 'demobrand.com',
    credentials_ref: 'bws://demo/gsc',
    status: 'error',
    created_at: new Date().toISOString(),
  },
  {
    id: '00000000-0000-4000-8000-000000000104',
    brand_id: '00000000-0000-4000-8000-000000000001',
    provider: 'calls',
    external_account_id: 'Google Reviews',
    credentials_ref: 'bws://demo/reviews',
    status: 'active',
    created_at: new Date().toISOString(),
  },
]

export type DriveFolder = {
  id: string
  name: string
  drive_folder_id: string
}

export const DEMO_DRIVE_FOLDERS: DriveFolder[] = [
  {
    id: 'folder-assets',
    name: 'Brand Assets',
    drive_folder_id: 'demo-drive-assets',
  },
  {
    id: 'folder-campaigns',
    name: 'Campaign Creative',
    drive_folder_id: 'demo-drive-campaigns',
  },
]

export type InboxItemKind = 'dm' | 'comment' | 'review'

export type InboxItem = {
  id: string
  kind: InboxItemKind
  channel: string
  from: string
  preview: string
  received_at: string
  unread: boolean
}

export const DEMO_INBOX: InboxItem[] = [
  {
    id: 'in-1',
    kind: 'dm',
    channel: 'Instagram',
    from: '@jordan.lee',
    preview: 'Loved the new drop — when’s restock?',
    received_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unread: true,
  },
  {
    id: 'in-2',
    kind: 'comment',
    channel: 'Facebook',
    from: 'Sam Rivera',
    preview: 'This is exactly what we needed. Tagging my team.',
    received_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    unread: true,
  },
  {
    id: 'in-3',
    kind: 'review',
    channel: 'Google',
    from: 'Alex Chen',
    preview: '★★★★★ Fast response and clear results.',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    unread: false,
  },
  {
    id: 'in-4',
    kind: 'comment',
    channel: 'Instagram',
    from: '@studio.north',
    preview: 'Can you share the template you used here?',
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    unread: false,
  },
]

export function useDemoConnectorsFallback(
  connectors: BrandConnector[],
): BrandConnector[] {
  if (connectors.length > 0) return connectors
  return SKIP_AUTH ? DEMO_CONNECTORS : connectors
}
