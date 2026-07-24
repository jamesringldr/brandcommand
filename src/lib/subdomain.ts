/**
 * Detect brand from subdomain.
 * certpro.maiztro.dev → 'certpro'
 * app.maiztro.dev → null (full multi-brand dashboard)
 */
export function detectBrandFromSubdomain(): string | null {
  const hostname = window.location.hostname
  const parts = hostname.split('.')

  if (parts.length < 2) return null // localhost, no subdomain

  const subdomain = parts[0]
  if (subdomain === 'app' || subdomain === 'www') return null

  return subdomain
}
