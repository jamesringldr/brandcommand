import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBrandContext } from '../BrandProvider'
import { TreeItem, TreeSection } from './SidebarTree'
import { listConnectors } from '../../lib/analytics/api'
import { useDemoConnectorsFallback } from '../../lib/demoData'
import type { BrandConnector } from '../../lib/database.types'

const PRIMARY_LINKS = [
  { id: 'dashboard', label: 'Home', path: 'dashboard' },
  { id: 'inbox', label: 'Inbox', path: 'inbox' },
  { id: 'create', label: 'Generate', path: 'create' },
  { id: 'planner', label: 'Planner', path: 'planner' },
  { id: 'schedule', label: 'Schedule', path: 'schedule' },
  { id: 'campaigns', label: 'Goals', path: 'campaigns' },
  { id: 'suggestions', label: 'Insights', path: 'suggestions' },
] as const

type NavChannel = {
  id: string
  label: string
  href: string
}

/** Expand connected providers into platform rows (Facebook, Instagram, …). */
function socialChannels(connectors: BrandConnector[], base: string): NavChannel[] {
  const channels: NavChannel[] = []
  const meta = connectors.find(
    (c) => c.provider === 'meta' && c.status !== 'disconnected',
  )
  if (meta) {
    channels.push({
      id: 'facebook',
      label: 'Facebook',
      href: `${base}/channels/socials/facebook`,
    })
    channels.push({
      id: 'instagram',
      label: 'Instagram',
      href: `${base}/channels/socials/instagram`,
    })
  }
  return channels
}

function reviewChannels(connectors: BrandConnector[], base: string): NavChannel[] {
  return connectors
    .filter((c) => c.provider === 'calls' && c.status !== 'disconnected')
    .map((c) => ({
      id: c.id,
      label: c.external_account_id ?? 'Reviews',
      href: `${base}/channels/reviews/${encodeURIComponent(
        (c.external_account_id ?? c.id).toLowerCase().replace(/\s+/g, '-'),
      )}`,
    }))
}

export function SidebarNav({ base }: { base: string }) {
  const location = useLocation()
  const { activeBrand } = useBrandContext()
  const [connectors, setConnectors] = useState<BrandConnector[]>([])

  useEffect(() => {
    if (!activeBrand) return
    void listConnectors(activeBrand.id)
      .then((rows) => setConnectors(useDemoConnectorsFallback(rows)))
      .catch(() => setConnectors(useDemoConnectorsFallback([])))
  }, [activeBrand])

  const socials = useMemo(
    () => socialChannels(connectors, base),
    [connectors, base],
  )
  const reviews = useMemo(
    () => reviewChannels(connectors, base),
    [connectors, base],
  )

  const channelsActive = location.pathname.includes('/channels')
  const connectionsActive = location.pathname.includes('/connections')

  return (
    <div className="space-y-3">
      <ul className="space-y-0.5">
        {PRIMARY_LINKS.map((link) => {
          const href = `${base}/${link.path}`
          const isActive =
            location.pathname === href ||
            location.pathname.startsWith(`${href}/`)
          return (
            <TreeItem
              key={link.id}
              label={link.label}
              href={href}
              isActive={isActive}
              depth={0}
            />
          )
        })}
      </ul>

      <div className="space-y-1 border-t border-neutral-800 pt-3">
        <TreeSection
          label="Channels"
          isSectionActive={channelsActive}
          autoExpandOnMatch={channelsActive}
          expandOnly
        >
          <li className="select-none">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              Socials
            </p>
            <ul className="space-y-0.5">
              {socials.map((ch) => (
                <TreeItem
                  key={ch.id}
                  label={ch.label}
                  href={ch.href}
                  isActive={location.pathname === ch.href}
                  depth={1}
                  nested
                />
              ))}
              <li>
                <Link
                  to={`${base}/settings/socials`}
                  style={{ paddingLeft: 32 }}
                  className="block rounded-md py-1.5 pr-2 text-xs text-accent-400 transition hover:bg-neutral-800/60 hover:text-accent-300"
                >
                  + Add Channel
                </Link>
              </li>
            </ul>
          </li>

          <li className="mt-1 select-none">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
              Reviews
            </p>
            <ul className="space-y-0.5">
              {reviews.map((ch) => (
                <TreeItem
                  key={ch.id}
                  label={ch.label}
                  href={ch.href}
                  isActive={location.pathname === ch.href}
                  depth={1}
                  nested
                />
              ))}
              <li>
                <Link
                  to={`${base}/settings/socials`}
                  style={{ paddingLeft: 32 }}
                  className="block rounded-md py-1.5 pr-2 text-xs text-accent-400 transition hover:bg-neutral-800/60 hover:text-accent-300"
                >
                  + Add Channel
                </Link>
              </li>
            </ul>
          </li>
        </TreeSection>

        <ul className="space-y-0.5">
          <TreeItem
            label="Connections"
            href={`${base}/connections`}
            isActive={connectionsActive}
            depth={0}
          />
        </ul>
      </div>
    </div>
  )
}
