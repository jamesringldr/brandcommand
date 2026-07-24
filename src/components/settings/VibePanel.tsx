import { useEffect, useState } from 'react'
import { useBrandContext } from '../BrandProvider'
import { Card } from '../ui/Card'
import { getVoiceProfile, upsertVoiceProfile } from '../../lib/ai/api'

/** Brand vibe profile (formerly Voice) — feeds AI suggest / critique. */
export function VibePanel() {
  const { activeBrand } = useBrandContext()
  const [tone, setTone] = useState('')
  const [audience, setAudience] = useState('')
  const [dos, setDos] = useState('')
  const [donts, setDonts] = useState('')
  const [examples, setExamples] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeBrand) return
    void getVoiceProfile(activeBrand.id)
      .then((p) => {
        if (!p) return
        setTone(p.tone ?? '')
        setAudience(p.audience ?? '')
        setDos(p.dos ?? '')
        setDonts(p.donts ?? '')
        setExamples(p.examples ?? '')
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Load failed'),
      )
  }, [activeBrand])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!activeBrand) return
    try {
      await upsertVoiceProfile({
        brand_id: activeBrand.id,
        tone,
        audience,
        dos,
        donts,
        examples,
      })
      setMessage('Saved')
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    }
  }

  if (!activeBrand) return null

  return (
    <Card className="max-w-2xl">
      <p className="mb-4 text-sm text-neutral-400">
        Tone, audience, and guardrails for AI suggest / rewrite.
      </p>
      <form onSubmit={(e) => void save(e)} className="space-y-3">
        {(
          [
            ['Tone', tone, setTone],
            ['Audience', audience, setAudience],
            ['Dos', dos, setDos],
            ["Don'ts", donts, setDonts],
            ['Examples', examples, setExamples],
          ] as const
        ).map(([label, value, setter]) => (
          <label key={label} className="block text-xs text-neutral-400">
            {label}
            <textarea
              value={value}
              onChange={(e) => setter(e.target.value)}
              rows={label === 'Examples' ? 4 : 2}
              className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100"
            />
          </label>
        ))}
        <button
          type="submit"
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500"
        >
          Save vibe
        </button>
        {message && <p className="text-sm text-emerald-300">{message}</p>}
        {error && <p className="text-sm text-rose-300">{error}</p>}
      </form>
    </Card>
  )
}
