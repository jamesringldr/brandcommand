import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import {
  acceptSuggestion,
  listSuggestions,
  rejectSuggestion,
  requestSuggestions,
} from '../lib/ai/api'
import type { AiSuggestion } from '../lib/database.types'

export default function Suggestions() {
  const { activeBrand } = useBrandContext()
  const navigate = useNavigate()
  const [items, setItems] = useState<AiSuggestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    if (!activeBrand) return
    setItems(await listSuggestions(activeBrand.id))
  }

  useEffect(() => {
    void load().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : 'Failed to load'),
    )
  }, [activeBrand])

  async function generate() {
    if (!activeBrand) return
    setBusy(true)
    setError(null)
    try {
      await requestSuggestions(activeBrand.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generate failed')
    } finally {
      setBusy(false)
    }
  }

  if (!activeBrand) return null

  return (
    <AppShell
      breadcrumbs={[
        { label: activeBrand.name, href: `/${activeBrand.slug}/dashboard` },
        { label: 'AI suggestions' },
      ]}
      title="AI suggestions"
      subtitle="Accept creates a Planned content item"
      headerAction={
        <button
          type="button"
          disabled={busy}
          onClick={() => void generate()}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {busy ? 'Generating…' : 'Generate'}
        </button>
      }
    >
      {error && (
        <p className="mb-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No pending suggestions"
          description="Generate suggestions from brand voice + metrics (Edge Function when deployed)."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((s) => (
            <li key={s.id}>
              <Card>
                <h3 className="text-sm font-medium text-neutral-100">
                  {s.title}
                </h3>
                {s.body && (
                  <p className="mt-2 text-sm text-neutral-400">{s.body}</p>
                )}
                {s.rationale && (
                  <p className="mt-2 text-xs text-neutral-500">{s.rationale}</p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void acceptSuggestion(s).then((item) =>
                        navigate(`/${activeBrand.slug}/planner/${item.id}`),
                      )
                    }
                    className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Accept → Planned
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void rejectSuggestion(s.id).then(load)
                    }
                    className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300"
                  >
                    Reject
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
