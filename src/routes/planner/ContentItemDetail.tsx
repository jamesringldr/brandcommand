import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../components/shell/AppShell'
import { useBrandContext } from '../../components/BrandProvider'
import { StatusSelect } from '../../components/planner/StatusSelect'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Card } from '../../components/ui/Card'
import {
  getItem,
  killItem,
  transitionItem,
  updateItem,
} from '../../lib/planner/api'
import type {
  ContentItem,
  ContentStatus,
  ContentType,
} from '../../lib/database.types'
import { AiAssistPanel } from '../../components/composer/AiAssistPanel'
import { AssetPicker } from '../../components/composer/AssetPicker'

export default function ContentItemDetail() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  const { activeBrand } = useBrandContext()
  const [item, setItem] = useState<ContentItem | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    if (!itemId) return
    try {
      setError(null)
      setItem(await getItem(itemId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item')
    }
  }, [itemId])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    if (!item) return
    setSaving(true)
    try {
      const next = await updateItem(item.id, {
        title: item.title,
        body: item.body,
        type: item.type,
      })
      setItem(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onTransition(status: ContentStatus) {
    if (!item) return
    try {
      const next = await transitionItem(item.id, status)
      setItem(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transition rejected')
    }
  }

  async function onKill() {
    if (!item) return
    if (!window.confirm('Kill this item?')) return
    try {
      await killItem(item.id)
      void navigate(`/${activeBrand?.slug}/planner`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kill failed')
    }
  }

  if (!activeBrand) return null
  if (!item && !error) {
    return (
      <AppShell title="Loading…">
        <p className="text-neutral-500">Loading item…</p>
      </AppShell>
    )
  }
  if (!item) {
    return (
      <AppShell title="Not found">
        <p className="text-rose-300">{error ?? 'Item not found'}</p>
      </AppShell>
    )
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: activeBrand.name, href: `/${activeBrand.slug}/dashboard` },
        { label: 'Planner', href: `/${activeBrand.slug}/planner` },
        { label: item.title },
      ]}
      title={item.title}
      subtitle={`${item.type} · ${item.status}`}
      headerAction={<StatusBadge status={item.status} />}
    >
      {error && (
        <p className="mb-4 text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <label className="block text-xs text-neutral-400">
              Title
              <input
                value={item.title}
                onChange={(e) => setItem({ ...item, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </label>
            <label className="block text-xs text-neutral-400">
              Type
              <select
                value={item.type}
                onChange={(e) =>
                  setItem({ ...item, type: e.target.value as ContentType })
                }
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
              >
                <option value="social">social</option>
                <option value="blog">blog</option>
              </select>
            </label>
            <label className="block text-xs text-neutral-400">
              Body
              <textarea
                value={item.body ?? ''}
                onChange={(e) => setItem({ ...item, body: e.target.value })}
                rows={10}
                className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </label>
            {item.derived_from && (
              <p className="text-xs text-neutral-500">
                Derived from{' '}
                <Link
                  to={`/${activeBrand.slug}/planner/${item.derived_from}`}
                  className="text-violet-400 hover:text-violet-300"
                >
                  {item.derived_from}
                </Link>
              </p>
            )}
            {item.ai_critique && (
              <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  AI critique
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-300">
                  {item.ai_critique}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <StatusSelect
                status={item.status}
                type={item.type}
                onChange={(s) => void onTransition(s)}
              />
              <button
                type="button"
                onClick={() => void onKill()}
                className="rounded-md bg-neutral-800 px-4 py-2 text-sm text-rose-300 hover:bg-neutral-700"
              >
                Kill
              </button>
            </div>
          </Card>

          <AiAssistPanel item={item} onUpdated={setItem} />
        </div>

        <div className="space-y-4">
          <AssetPicker item={item} brand={activeBrand} onChanged={() => void load()} />
          {item.status === 'Ready' && item.type === 'social' && (
            <Card>
              <p className="text-sm text-neutral-300">Ready to schedule</p>
              <Link
                to={`/${activeBrand.slug}/schedule?item=${item.id}`}
                className="mt-3 inline-block rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
              >
                Open scheduler
              </Link>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  )
}
