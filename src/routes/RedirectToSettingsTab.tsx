import { Navigate, useParams } from 'react-router-dom'

/** Redirect legacy Channels/Voice URLs into Settings tabs. */
export function RedirectToSettingsTab({ tab }: { tab: string }) {
  const { brandSlug } = useParams<{ brandSlug: string }>()
  if (!brandSlug) return <Navigate to="/" replace />
  return <Navigate to={`/${brandSlug}/settings/${tab}`} replace />
}
