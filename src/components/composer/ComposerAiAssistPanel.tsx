import { useState } from 'react'
import { cn } from '../../lib/cn'
import { SUGGESTIONS } from '../../lib/planner/suggestions'
import {
  LOADING_VERBS,
  mockGeneratePostCopy,
  mockRefinePostCopy,
} from '../../lib/composer/mockGenerate'

type Phase = 'idle' | 'loading' | 'done'

export function ComposerAiAssistPanel({
  onApplyCopy,
}: {
  onApplyCopy: (copy: string) => void
}) {
  const [prompt, setPrompt] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null,
  )
  const [phase, setPhase] = useState<Phase>('idle')
  const [verbIndex, setVerbIndex] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [lastCopy, setLastCopy] = useState('')
  const [error, setError] = useState<string | null>(null)

  function applySuggestion(id: string, suggestionPrompt: string) {
    setSelectedSuggestion(id)
    setPrompt(suggestionPrompt)
  }

  async function handleGenerate() {
    const text = prompt.trim()
    if (!text || phase === 'loading') return
    setError(null)
    setPhase('loading')
    const cycle = setInterval(() => {
      setVerbIndex((i) => (i + 1) % LOADING_VERBS.length)
    }, 1300)
    try {
      const suggestionLabel = SUGGESTIONS.find(
        (s) => s.id === selectedSuggestion,
      )?.label
      const copy = await mockGeneratePostCopy({ prompt: text, suggestionLabel })
      setLastCopy(copy)
      onApplyCopy(copy)
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generate failed')
      setPhase('idle')
    } finally {
      clearInterval(cycle)
    }
  }

  async function handleRefine(e: React.FormEvent) {
    e.preventDefault()
    const note = feedback.trim()
    if (!note || phase === 'loading') return
    setError(null)
    setPhase('loading')
    const cycle = setInterval(() => {
      setVerbIndex((i) => (i + 1) % LOADING_VERBS.length)
    }, 1300)
    try {
      const copy = await mockRefinePostCopy({
        currentCopy: lastCopy,
        feedback: note,
      })
      setLastCopy(copy)
      onApplyCopy(copy)
      setFeedback('')
      setPhase('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refine failed')
      setPhase('done')
    } finally {
      clearInterval(cycle)
    }
  }

  function startOver() {
    setPhase('idle')
    setPrompt('')
    setSelectedSuggestion(null)
    setFeedback('')
    setLastCopy('')
    setError(null)
  }

  return (
    <div className="flex h-full flex-col gap-3 px-4 py-5">
      <h3 className="text-sm font-semibold text-neutral-100">AI Assist</h3>

      {phase === 'loading' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-600 border-t-accent-500"
            aria-hidden
          />
          <p className="text-sm text-neutral-300">{LOADING_VERBS[verbIndex]}</p>
        </div>
      )}

      {phase === 'idle' && (
        <>
          <label className="block text-xs font-medium text-neutral-300">
            Give me some details and I&apos;ll generate the post copy
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Pro tip: share things like what your goal of the post is, any specifics like service or themes..."
              className="mt-1.5 w-full resize-none rounded-xl border border-neutral-600 bg-neutral-700 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
          </label>

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={!prompt.trim()}
            className="self-start rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate
          </button>

          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => {
              const active = selectedSuggestion === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => applySuggestion(s.id, s.prompt)}
                  className={cn(
                    'rounded-lg border px-2.5 py-2 text-left transition',
                    active
                      ? 'border-accent-500 bg-accent-600/20 text-neutral-100'
                      : 'border-neutral-700 bg-neutral-700/50 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-700',
                  )}
                >
                  <span className="block text-xs font-medium">{s.label}</span>
                  <span className="mt-0.5 block text-[11px] text-neutral-500 line-clamp-2">
                    {s.prompt}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {phase === 'done' && (
        <div className="flex flex-1 flex-col gap-3">
          <p className="text-sm text-neutral-300">
            Dropped that into the post copy field. Any notes, edits or
            adjustments you&apos;d like to make?
          </p>
          <form onSubmit={(e) => void handleRefine(e)} className="flex gap-2">
            <input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g. make it shorter, add a CTA..."
              className="flex-1 rounded-lg border border-neutral-600 bg-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />
            <button
              type="submit"
              disabled={!feedback.trim()}
              className="rounded-md bg-accent-600 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
          <button
            type="button"
            onClick={startOver}
            className="self-start text-xs text-neutral-500 underline-offset-2 hover:text-neutral-300 hover:underline"
          >
            Start over
          </button>
        </div>
      )}

      {error && <p className="text-xs text-rose-300">{error}</p>}
    </div>
  )
}
