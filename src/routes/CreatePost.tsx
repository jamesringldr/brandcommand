import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/shell/AppShell'
import { useBrandContext } from '../components/BrandProvider'
import { cn } from '../lib/cn'
import { requestSuggestions, acceptSuggestion } from '../lib/ai/api'
import { SUGGESTIONS } from '../lib/planner/suggestions'
import { useCreatePostModal } from '../components/composer/CreatePostModalContext'
import type { AiSuggestion } from '../lib/database.types'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  content: string
}

const OPENING_LINE_1 = 'Greetings Ash!'
const OPENING_LINE_2 = 'What shall we cook up, today?'

export default function CreatePost() {
  const { activeBrand } = useBrandContext()
  const navigate = useNavigate()
  const { openCreatePost } = useCreatePostModal()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [prompt, setPrompt] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null,
  )
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [ideas, setIdeas] = useState<AiSuggestion[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!activeBrand) return null

  const brand = activeBrand
  const hasStarted = messages.length > 0 || ideas.length > 0

  function applySuggestion(id: string, suggestionPrompt: string) {
    setSelectedSuggestion(id)
    setPrompt(suggestionPrompt)
    inputRef.current?.focus()
  }

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault()
    const text = prompt.trim()
    if (!text || busy) return

    setBusy(true)
    setError(null)
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text },
    ])
    setPrompt('')
    setSelectedSuggestion(null)

    try {
      const suggestions = await requestSuggestions(brand.id)
      setIdeas(suggestions)
      const summary =
        suggestions.length > 0
          ? `Here are ${suggestions.length} directions based on what you described — pick one to drop into the Planner as Planned.`
          : 'I drafted a few angles. Check the cards below and accept one into the Planner.'
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: summary },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generate failed'
      setError(msg)
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Couldn't generate right now — ${msg}`,
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  async function handleAccept(suggestion: AiSuggestion) {
    try {
      const item = await acceptSuggestion(suggestion)
      setIdeas((prev) => prev.filter((s) => s.id !== suggestion.id))
      void navigate(`/${brand.slug}/planner/${item.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Accept failed')
    }
  }

  function handleStartNewPost() {
    openCreatePost()
  }

  return (
    <AppShell>
      <div className="mx-auto flex min-h-[calc(100vh-10rem)] max-w-2xl flex-col">
        <div className="flex flex-1 flex-col justify-center pb-8">
          <h1 className="mb-10 text-center text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
            <span className="block">{OPENING_LINE_1}</span>
            <span className="block">{OPENING_LINE_2}</span>
          </h1>

          {hasStarted && (
            <div className="mb-8 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'flex',
                    m.role === 'user' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      m.role === 'user'
                        ? 'bg-accent-600 text-neutral-950'
                        : 'border border-neutral-800 bg-neutral-900/80 text-neutral-200',
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {ideas.length > 0 && (
                <ul className="space-y-3 pt-2">
                  {ideas.map((idea) => (
                    <li
                      key={idea.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
                    >
                      <h3 className="text-sm font-medium text-neutral-100">
                        {idea.title}
                      </h3>
                      {idea.body && (
                        <p className="mt-2 text-sm text-neutral-400">
                          {idea.body}
                        </p>
                      )}
                      {idea.rationale && (
                        <p className="mt-2 text-xs text-neutral-500">
                          {idea.rationale}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleAccept(idea)}
                        className="mt-3 rounded-md bg-accent-600 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-accent-500"
                      >
                        Use in Planner
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {busy && (
                <p className="text-sm text-neutral-500">Generating ideas…</p>
              )}
              {error && (
                <p className="text-sm text-rose-300" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}

          <form
            onSubmit={(e) => void handleGenerate(e)}
            className="space-y-3"
          >
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleGenerate()
                }
              }}
              rows={3}
              placeholder="Describe what your wanting to post..."
              className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />

            <div className="grid gap-2 sm:grid-cols-3">
              {SUGGESTIONS.map((s) => {
                const active = selectedSuggestion === s.id
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applySuggestion(s.id, s.prompt)}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-left transition',
                      active
                        ? 'border-accent-500 bg-accent-600/20 text-neutral-100'
                        : 'border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-900',
                    )}
                  >
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="mt-1 block text-xs text-neutral-500 line-clamp-2">
                      {s.prompt}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={busy || !prompt.trim()}
                className="rounded-md bg-accent-600 px-5 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Generating…' : 'Generate Ideas...'}
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 pt-4">
              <p className="text-sm text-neutral-400">
                Already have a post in mind?
              </p>
              <button
                type="button"
                onClick={handleStartNewPost}
                className="rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-100 hover:border-neutral-600 hover:bg-neutral-800"
              >
                Start New Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
