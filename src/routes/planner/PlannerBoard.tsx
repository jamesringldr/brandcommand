import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../components/shell/AppShell'
import { useBrandContext } from '../../components/BrandProvider'
import { ContentItemCard } from '../../components/planner/ContentItemCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { createItem, listItems } from '../../lib/planner/api'
import { BOARD_COLUMNS } from '../../lib/planner/transitions'
import type { ContentItem, ContentStatus } from '../../lib/database.types'

export default function PlannerBoard() {
  const { activeBrand } = useBrandContext()
  const [items, setItems] = useState<ContentItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')

  const load = useCallback(async () => {
    if (!activeBrand) return
    try {
      setError(null)
      setItems(await listItems(activeBrand.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load planner')
    }
  }, [activeBrand])

  useEffect(() => {
    void load()
  }, [load])

  const byStatus = useMemo(() => {
    const map = new Map<ContentStatus, ContentItem[]>()
    for (const col of BOARD_COLUMNS) map.set(col, [])
    for (const item of items) {
      const list = map.get(item.status) ?? []
      list.push(item)
      map.set(item.status, list)
    }
    return map
  }, [items])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBrand || !title.trim()) return
    setCreating(true)
    try {
      await createItem({ brand_id: activeBrand.id, title: title.trim() })
      setTitle('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  if (!activeBrand) return null

  return (
    <AppShell
      title="Planner"
      subtitle="Content pipeline — Buffer-style queue with status stages"
    >
      <form
        onSubmit={(e) => void handleCreate(e)}
        className="mb-6 flex flex-wrap items-end gap-3"
      >
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-xs text-neutral-400">
          New item
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title or idea"
            className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
          />
        </label>
        <button
          type="submit"
          disabled={creating || !title.trim()}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500 disabled:opacity-50"
        >
          Add Planned
        </button>
        <Link
          to={`/${activeBrand.slug}/create`}
          className="rounded-md bg-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
        >
          Generate
        </Link>
      </form>

      {error && (
        <p className="mb-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No content items yet"
          description="Add a Planned item to start the pipeline, or accept an AI suggestion."
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.filter((col) => (byStatus.get(col)?.length ?? 0) > 0 || ['Planned', 'Editing', 'Reviewing', 'Ready'].includes(col)).map(
            (col) => (
              <section key={col} className="w-64 shrink-0 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  {col}
                  <span className="ml-2 tabular-nums text-neutral-600">
                    {byStatus.get(col)?.length ?? 0}
                  </span>
                </h2>
                <ul className="space-y-3">
                  {(byStatus.get(col) ?? []).map((item) => (
                    <li key={item.id}>
                      <ContentItemCard
                        item={item}
                        brandSlug={activeBrand.slug}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
    </AppShell>
  )
}
