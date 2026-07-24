import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { listReadySocial } from '../lib/planner/api'
import { PLATFORMS, scheduleItem } from '../lib/schedule/api'
import type { ContentItem } from '../lib/database.types'

export default function Scheduler() {
  const { activeBrand } = useBrandContext()
  const [params] = useSearchParams()
  const preselect = params.get('item')
  const [items, setItems] = useState<ContentItem[]>([])
  const [selected, setSelected] = useState<string>(preselect ?? '')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [when, setWhen] = useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000)
    d.setMinutes(0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!activeBrand) return
    void (async () => {
      try {
        const ready = await listReadySocial(activeBrand.id)
        setItems(ready)
        if (preselect && ready.some((i) => i.id === preselect)) {
          setSelected(preselect)
        } else if (ready[0]) {
          setSelected(ready[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Ready items')
      }
    })()
  }, [activeBrand, preselect])

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selected) ?? null,
    [items, selected],
  )

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBrand || !selectedItem || platforms.length === 0) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const scheduledAt = new Date(when).toISOString()
      const next = await scheduleItem({
        content_item_id: selectedItem.id,
        brand_id: activeBrand.id,
        platforms,
        scheduled_at: scheduledAt,
      })
      setMessage(
        `Moved to ${next.status}${next.schedule_error ? ` (${next.schedule_error})` : ''}`,
      )
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id))
      setSelected('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Schedule failed')
    } finally {
      setBusy(false)
    }
  }

  if (!activeBrand) return null

  return (
    <AppShell
      title="Schedule"
      subtitle="Only Ready social items — platforms chosen at schedule time"
    >
      {error && (
        <p className="mb-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 text-sm text-emerald-300" role="status">
          {message}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="Nothing Ready"
          description="Advance social items to Ready in the Planner before scheduling."
        />
      ) : (
        <Card className="max-w-xl space-y-4">
          <form onSubmit={(e) => void submit(e)} className="space-y-4">
            <label className="block text-xs text-neutral-400">
              Ready item
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="text-xs text-neutral-400">Platforms</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = platforms.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={
                        active
                          ? 'rounded-md bg-accent-600 px-2.5 py-1 text-xs font-medium text-neutral-950'
                          : 'rounded-md bg-neutral-800 px-2.5 py-1 text-xs text-neutral-400'
                      }
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <label className="block text-xs text-neutral-400">
              When
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              disabled={busy || !selected || platforms.length === 0}
              className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500 disabled:opacity-50"
            >
              {busy ? 'Scheduling…' : 'Schedule'}
            </button>
          </form>
        </Card>
      )}
    </AppShell>
  )
}
