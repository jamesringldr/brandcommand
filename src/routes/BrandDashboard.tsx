import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { listMetrics, rollupByKey } from '../lib/analytics/api'
import { listItems } from '../lib/planner/api'
import type { ContentItem, MetricSnapshot } from '../lib/database.types'

export default function BrandDashboard() {
  const { activeBrand } = useBrandContext()
  const [metrics, setMetrics] = useState<MetricSnapshot[]>([])
  const [items, setItems] = useState<ContentItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeBrand) return
    void (async () => {
      try {
        setError(null)
        const [m, i] = await Promise.all([
          listMetrics(activeBrand.id),
          listItems(activeBrand.id),
        ])
        setMetrics(m)
        setItems(i)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      }
    })()
  }, [activeBrand])

  const rolled = useMemo(() => rollupByKey(metrics).slice(0, 12), [metrics])
  const pipeline = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      counts[item.status] = (counts[item.status] ?? 0) + 1
    }
    return counts
  }, [items])

  if (!activeBrand) return null

  return (
    <AppShell
      title={activeBrand.name}
      subtitle="Centralized analytics + pipeline snapshot"
    >
      {error && (
        <p className="mb-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      <section className="mb-10 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Pipeline
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Content items by status — open Planner to work the queue.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(pipeline).map(([status, count]) => (
            <Card key={status}>
              <p className="text-[10px] uppercase tracking-wider text-neutral-500">
                {status}
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-neutral-50">
                {count}
              </p>
            </Card>
          ))}
          {Object.keys(pipeline).length === 0 && (
            <EmptyState
              title="No pipeline yet"
              description="Create Planned items in the Planner."
              action={
                <Link
                  to={`/${activeBrand.slug}/planner`}
                  className="text-sm text-accent-400 hover:text-accent-300"
                >
                  Open Planner
                </Link>
              }
            />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Metrics
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Ingested snapshots (GA4 / GSC / Meta / calls) — not live GA UI.
          </p>
        </div>
        {rolled.length === 0 ? (
          <EmptyState
            title="No metric snapshots yet"
            description="Connect channels and run brandcommand-ingest on serv02. Numbers appear here after the first daily pull."
            action={
              <Link
                to={`/${activeBrand.slug}/channels`}
                className="text-sm text-accent-400 hover:text-accent-300"
              >
                Manage channels
              </Link>
            }
          />
        ) : (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Metric</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rolled.map((row) => (
                  <tr
                    key={`${row.provider}:${row.key}`}
                    className="border-b border-neutral-800/60 hover:bg-neutral-800/40"
                  >
                    <td className="px-4 py-3 capitalize text-neutral-300">
                      {row.provider}
                    </td>
                    <td className="px-4 py-3 text-neutral-200">{row.key}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-neutral-100">
                      {row.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </AppShell>
  )
}
