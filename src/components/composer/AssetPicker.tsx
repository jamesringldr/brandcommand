import { useState } from 'react'
import type { Brand } from '../../lib/database.types'
import type { ContentItem } from '../../lib/database.types'
import { supabase } from '../../lib/supabase'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'

/**
 * Drive picker shell. Real listing uses the signed-in Google token
 * (read-only Drive scope) once OAuth scopes are expanded — no app server.
 */
export function AssetPicker({
  item,
  brand,
  onChanged,
}: {
  item: ContentItem
  brand: Brand
  onChanged: () => void
}) {
  const [fileId, setFileId] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function attach(e: React.FormEvent) {
    e.preventDefault()
    if (!fileId.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { error: insertError } = await supabase
        .from('content_item_assets')
        .insert({
          brand_id: brand.id,
          content_item_id: item.id,
          drive_file_id: fileId.trim(),
          name: name.trim() || null,
          url: `https://drive.google.com/file/d/${fileId.trim()}/view`,
        })
      if (insertError) throw insertError
      setFileId('')
      setName('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Attach failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-100">Assets</h3>
      <p className="text-xs text-neutral-500">
        Paste a Drive file id to attach. Full folder browse lands when Drive
        read-only scope is added to Google OAuth.
        {brand.drive_folder_id
          ? ` Folder: ${brand.drive_folder_id}`
          : ' Set brands.drive_folder_id in SQL when ready.'}
      </p>
      {!brand.drive_folder_id && (
        <EmptyState
          title="No Drive folder configured"
          description="Operators set drive_folder_id on the brand row via SQL."
        />
      )}
      <form onSubmit={(e) => void attach(e)} className="space-y-2">
        <input
          value={fileId}
          onChange={(e) => setFileId(e.target.value)}
          placeholder="Drive file id"
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-200"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Label (optional)"
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-xs text-neutral-200"
        />
        <button
          type="submit"
          disabled={busy || !fileId.trim()}
          className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700 disabled:opacity-50"
        >
          Attach
        </button>
      </form>
      {error && <p className="text-xs text-rose-300">{error}</p>}
    </Card>
  )
}
