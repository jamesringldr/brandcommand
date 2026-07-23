import { useEffect, useState } from 'react'
import { useBrandContext } from '../BrandProvider'
import { Card } from '../ui/Card'
import { StatusBadge } from '../ui/StatusBadge'
import { EmptyState } from '../ui/EmptyState'
import { listConnectors, upsertConnector } from '../../lib/analytics/api'
import type { BrandConnector, ConnectorProvider } from '../../lib/database.types'

export type ProviderDef = {
  id: ConnectorProvider
  label: string
  blurb: string
}

export function ConnectorGrid({
  providers,
  emptyTitle,
  emptyDescription,
}: {
  providers: ProviderDef[]
  emptyTitle: string
  emptyDescription: string
}) {
  const { activeBrand } = useBrandContext()
  const [connectors, setConnectors] = useState<BrandConnector[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refs, setRefs] = useState<Record<string, string>>({})

  const providerIds = providers.map((p) => p.id).join(',')

  useEffect(() => {
    if (!activeBrand) return
    const ids = new Set(providers.map((p) => p.id))
    void (async () => {
      try {
        const all = await listConnectors(activeBrand.id)
        setConnectors(all.filter((c) => ids.has(c.provider)))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      }
    })()
  }, [activeBrand, providerIds])

  async function save(provider: ConnectorProvider) {
    if (!activeBrand) return
    try {
      const next = await upsertConnector({
        brand_id: activeBrand.id,
        provider,
        credentials_ref:
          refs[provider] || `bws://${activeBrand.slug}/${provider}`,
        status: 'disconnected',
      })
      setConnectors((prev) => {
        const others = prev.filter((c) => c.provider !== provider)
        return [...others, next]
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  if (!activeBrand) return null

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {providers.map((p) => {
          const existing = connectors.find((c) => c.provider === p.id)
          return (
            <Card key={p.id} className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-neutral-100">
                    {p.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">{p.blurb}</p>
                </div>
                {existing && <StatusBadge status={existing.status} />}
              </div>
              <label className="block text-xs text-neutral-400">
                credentials_ref (bws)
                <input
                  defaultValue={existing?.credentials_ref ?? ''}
                  onChange={(e) =>
                    setRefs((r) => ({ ...r, [p.id]: e.target.value }))
                  }
                  placeholder={`bws://${activeBrand.slug}/${p.id}`}
                  className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-200"
                />
              </label>
              <button
                type="button"
                onClick={() => void save(p.id)}
                className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700"
              >
                Save connection
              </button>
            </Card>
          )
        })}
      </div>
      {connectors.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  )
}
