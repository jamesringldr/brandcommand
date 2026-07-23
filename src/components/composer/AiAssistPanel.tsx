import { useState } from 'react'
import type { ContentItem } from '../../lib/database.types'
import { critiqueItem, improveCopy } from '../../lib/ai/api'
import { Card } from '../ui/Card'

export function AiAssistPanel({
  item,
  onUpdated,
}: {
  item: ContentItem
  onUpdated: (item: ContentItem) => void
}) {
  const [instruction, setInstruction] = useState('Make it sharper and shorter')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function improve() {
    setBusy(true)
    setError(null)
    try {
      onUpdated(await improveCopy(item, instruction))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Improve failed')
    } finally {
      setBusy(false)
    }
  }

  async function critique() {
    setBusy(true)
    setError(null)
    try {
      onUpdated(await critiqueItem(item))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Critique failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-100">AI assist</h3>
      <p className="text-xs text-neutral-500">
        Suggest / rewrite in-product. Critique is advisory only — it never sets
        Ready.
      </p>
      <input
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void improve()}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
        >
          Improve copy
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void critique()}
          className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50"
        >
          Critique (advisory)
        </button>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </Card>
  )
}
