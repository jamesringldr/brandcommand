import type { Brand } from '../../lib/database.types'
import { EmptyState } from '../ui/EmptyState'

/**
 * Same Drive-integration stage as AssetPicker.tsx: full folder browsing lands
 * once the read-only Drive OAuth scope is added. Until then this is a stub.
 */
export function ComposerDesignsPanel({ brand }: { brand: Brand }) {
  return (
    <div className="flex h-full flex-col gap-3 px-4 py-5">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100">Designs</h3>
        <p className="mt-1 text-xs text-neutral-500">
          Finalized designs from the brand&apos;s Drive folder — pick one to
          insert into the draft.
          {brand.drive_folder_id ? ` Folder: ${brand.drive_folder_id}` : ''}
        </p>
      </div>

      {brand.drive_folder_id ? (
        <EmptyState
          title="Drive browsing coming soon"
          description="Full folder listing lands once the read-only Drive OAuth scope is added — same dependency as the Assets picker on the item detail page."
        />
      ) : (
        <EmptyState
          title="No Drive folder configured"
          description="Operators set drive_folder_id on the brand row via SQL. Once set, finalized designs will preview here."
        />
      )}
    </div>
  )
}
