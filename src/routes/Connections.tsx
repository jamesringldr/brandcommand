import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { listConnectors } from '../lib/analytics/api'
import { useDemoConnectorsFallback } from '../lib/demoData'
import type { BrandConnector } from '../lib/database.types'

function healthLabel(status: BrandConnector['status']): string {
  if (status === 'active') return 'Healthy'
  if (status === 'error') return 'Needs attention'
  return 'Disconnected'
}

export default function Connections() {
  const { activeBrand } = useBrandContext()
  const [connectors, setConnectors] = useState<BrandConnector[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeBrand) return
    void listConnectors(activeBrand.id)
      .then((rows) => setConnectors(useDemoConnectorsFallback(rows)))
      .catch((err: unknown) => {
        setConnectors(useDemoConnectorsFallback([]))
        setError(err instanceof Error ? err.message : 'Failed to load')
      })
  }, [activeBrand])

  if (!activeBrand) return null

  const healthy = connectors.filter((c) => c.status === 'active').length
  const issues = connectors.filter((c) => c.status === 'error').length

  return (
    <AppShell
      title="Connections"
      subtitle="Health dashboard for every connected source"
    >
      {error && (
        <p className="mb-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            Total
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {connectors.length}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            Healthy
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-300">
            {healthy}
          </p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500">
            Issues
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-rose-300">
            {issues}
          </p>
        </Card>
      </div>

      {connectors.length === 0 ? (
        <EmptyState
          title="No connections yet"
          description="Wire socials, analytics, and review sources from Settings."
          action={
            <Link
              to={`/${activeBrand.slug}/settings/socials`}
              className="text-sm text-accent-400 hover:text-accent-300"
            >
              Open Settings
            </Link>
          }
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Credentials</th>
              </tr>
            </thead>
            <tbody>
              {connectors.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-neutral-800/60 hover:bg-neutral-800/40"
                >
                  <td className="px-4 py-3 capitalize text-neutral-200">
                    {c.provider}
                  </td>
                  <td className="px-4 py-3 text-neutral-300">
                    {c.external_account_id ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {healthLabel(c.status)}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                    {c.credentials_ref ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AppShell>
  )
}
