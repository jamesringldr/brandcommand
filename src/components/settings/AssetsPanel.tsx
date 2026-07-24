import { useState } from 'react'
import { useBrandContext } from '../BrandProvider'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { supabase } from '../../lib/supabase'
import { SKIP_AUTH } from '../../lib/devFlags'

/** Drive folder + asset library settings for the brand. */
export function AssetsPanel() {
  const { activeBrand, refresh } = useBrandContext()
  const [folderId, setFolderId] = useState(activeBrand?.drive_folder_id ?? '')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!activeBrand) return null

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBrand) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      if (SKIP_AUTH) {
        setMessage(
          'Saved locally for this session (demo). Wire Supabase to persist drive_folder_id.',
        )
        return
      }
      const { error: updateError } = await supabase
        .from('brands')
        .update({ drive_folder_id: folderId.trim() || null })
        .eq('id', activeBrand.id)
      if (updateError) throw updateError
      await refresh()
      setMessage('Saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card className="space-y-3">
        <h3 className="text-sm font-medium text-neutral-100">Google Drive</h3>
        <p className="text-xs text-neutral-500">
          Brand folder used by the composer asset picker (read-only Drive scope).
        </p>
        <form onSubmit={(e) => void save(e)} className="space-y-3">
          <label className="block text-xs text-neutral-400">
            Folder id
            <input
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              placeholder="Google Drive folder id"
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500 disabled:opacity-50"
          >
            Save assets settings
          </button>
        </form>
        {message && <p className="text-sm text-emerald-300">{message}</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </Card>
      {!folderId && (
        <EmptyState
          title="No Drive folder yet"
          description="Paste the folder id where Canva / creative exports land for this brand."
        />
      )}
    </div>
  )
}
