import { useEffect, useState } from 'react'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { createCampaign, listCampaigns, updateCampaign } from '../lib/campaigns/api'
import type { Campaign } from '../lib/database.types'

export default function Campaigns() {
  const { activeBrand } = useBrandContext()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [name, setName] = useState('')
  const [strategy, setStrategy] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!activeBrand) return
    setCampaigns(await listCampaigns(activeBrand.id))
  }

  useEffect(() => {
    void load().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Failed to load campaigns'),
    )
  }, [activeBrand])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBrand || !name.trim()) return
    try {
      await createCampaign({
        brand_id: activeBrand.id,
        name: name.trim(),
        strategy: strategy.trim() || undefined,
      })
      setName('')
      setStrategy('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    }
  }

  if (!activeBrand) return null

  return (
    <AppShell
      title="Goals"
      subtitle="Strategy briefs tied to the brand — link content items later"
    >
      {error && (
        <p className="mb-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => void onCreate(e)}
        className="mb-8 max-w-xl space-y-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Goal name"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
        />
        <textarea
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          placeholder="Strategy brief"
          rows={4}
          className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500"
        >
          Create goal
        </button>
      </form>

      {campaigns.length === 0 ? (
        <EmptyState
          title="No goals"
          description="Define a strategy brief to guide planner items and AI suggestions."
        />
      ) : (
        <ul className="space-y-3">
          {campaigns.map((c) => (
            <li key={c.id}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-100">
                      {c.name}
                    </h3>
                    {c.strategy && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-400">
                        {c.strategy}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-3 flex gap-2">
                  {(['draft', 'active', 'completed', 'archived'] as const).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          void updateCampaign(c.id, { status }).then(load)
                        }
                        className="rounded-md bg-neutral-800 px-2 py-1 text-[10px] uppercase tracking-wide text-neutral-400 hover:bg-neutral-700"
                      >
                        {status}
                      </button>
                    ),
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
