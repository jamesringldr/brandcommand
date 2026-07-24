import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrandContext } from '../BrandProvider'
import { cn } from '../../lib/cn'
import { listConnectors } from '../../lib/analytics/api'
import { connectedSocialChannels } from '../../lib/planner/filters'
import { createItem, updateItem } from '../../lib/planner/api'
import type { BrandConnector } from '../../lib/database.types'
import { ComposerAiAssistPanel } from './ComposerAiAssistPanel'
import { ComposerDesignsPanel } from './ComposerDesignsPanel'
import {
  SchedulingControl,
  type ScheduleOption,
} from './SchedulingControl'

const MEDIA_TYPES = [
  { value: 'photo', label: 'Photo' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'video', label: 'Video' },
  { value: 'story', label: 'Story' },
  { value: 'reel', label: 'Reel' },
  { value: 'text', label: 'Text' },
] as const

const PLATFORM_COLORS: Record<string, string> = {
  facebook: 'bg-blue-600',
  instagram: 'bg-pink-600',
}

const COPY_CHAR_LIMIT = 3000

const TABS = [
  { id: 'templates', label: 'Templates', disabled: true },
  { id: 'ai', label: 'AI Assistant', disabled: false },
  { id: 'preview', label: 'Preview', disabled: true },
  { id: 'designs', label: 'Designs', disabled: false },
] as const

type TabId = (typeof TABS)[number]['id']

function deriveTitle(body: string): string {
  const firstLine = body.trim().split('\n')[0]?.trim()
  if (!firstLine) return 'Untitled post'
  return firstLine.length > 60 ? `${firstLine.slice(0, 57)}…` : firstLine
}

export function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { activeBrand } = useBrandContext()
  const navigate = useNavigate()

  const [connectors, setConnectors] = useState<BrandConnector[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [mediaType, setMediaType] = useState<string>(MEDIA_TYPES[0].value)
  const [activeTab, setActiveTab] = useState<TabId>('ai')
  const [expanded, setExpanded] = useState(false)
  const [postCopy, setPostCopy] = useState('')
  const [firstComment, setFirstComment] = useState('')
  const [createAnother, setCreateAnother] = useState(false)
  const [scheduleOption, setScheduleOption] = useState<ScheduleOption>('now')
  const [scheduleAt, setScheduleAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!activeBrand) return
    void listConnectors(activeBrand.id)
      .then((rows) => {
        setConnectors(rows)
        const channels = connectedSocialChannels(rows)
        setSelectedPlatforms(channels.map((c) => c.value))
      })
      .catch(() => setConnectors([]))
  }, [activeBrand])

  const channels = useMemo(() => connectedSocialChannels(connectors), [connectors])

  function togglePlatform(value: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    )
  }

  function resetForm() {
    setPostCopy('')
    setFirstComment('')
    setMediaType(MEDIA_TYPES[0].value)
    setActiveTab('ai')
    setScheduleOption('now')
    setScheduleAt('')
  }

  function finish() {
    if (createAnother) {
      resetForm()
      return
    }
    onClose()
    if (activeBrand) void navigate(`/${activeBrand.slug}/planner`)
  }

  async function persistDraft() {
    if (!activeBrand) return null
    const item = await createItem({
      brand_id: activeBrand.id,
      title: deriveTitle(postCopy),
      body: postCopy || undefined,
    })
    if (selectedPlatforms.length > 0) {
      await updateItem(item.id, { platforms: selectedPlatforms })
    }
    return item
  }

  async function handleSaveDraft() {
    if (!activeBrand || busy) return
    setBusy(true)
    setError(null)
    try {
      await persistDraft()
      finish()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save draft')
    } finally {
      setBusy(false)
    }
  }

  async function handlePrimaryAction() {
    if (!activeBrand || busy) return
    setBusy(true)
    setError(null)
    try {
      // Scheduling still needs an item to pass through Editing → Reviewing →
      // Ready before the status trigger allows Scheduled — see docs/schema.md.
      // For now this saves the same way Save Draft does.
      await persistDraft()
      finish()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save post')
    } finally {
      setBusy(false)
    }
  }

  function handleBackdropMouseDown(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  if (!activeBrand) return null

  const remaining = COPY_CHAR_LIMIT - postCopy.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className={cn(
          'flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-neutral-900 ring-1 ring-neutral-800 transition-[max-width]',
          expanded ? 'max-w-[95vw]' : 'max-w-[90vw]',
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-neutral-800 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <h2 className="text-lg font-semibold text-neutral-50">
              Create Post
            </h2>
            <div className="relative">
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="appearance-none rounded-full border border-neutral-700 bg-neutral-800 py-1.5 pl-3 pr-7 text-xs font-medium text-neutral-200 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500">
                ⌄
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-neutral-800 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  disabled={tab.disabled}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.disabled ? 'Coming soon' : undefined}
                  className={cn(
                    'rounded-md px-2.5 py-1.5 text-xs font-medium transition',
                    tab.disabled
                      ? 'cursor-not-allowed text-neutral-600'
                      : activeTab === tab.id
                        ? 'bg-accent-600 text-neutral-950'
                        : 'text-neutral-300 hover:bg-neutral-800',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? 'Collapse' : 'Expand'}
              title={expanded ? 'Collapse' : 'Expand'}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
            >
              ⛶
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-md text-lg leading-none text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
            >
              ×
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 divide-neutral-800 overflow-hidden lg:grid-cols-2 lg:divide-x">
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
            <div className="flex items-center gap-2">
              {channels.map((ch) => {
                const active = selectedPlatforms.includes(ch.value)
                return (
                  <button
                    key={ch.value}
                    type="button"
                    onClick={() => togglePlatform(ch.value)}
                    title={ch.label}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold uppercase text-white ring-2 transition',
                      PLATFORM_COLORS[ch.value] ?? 'bg-neutral-700',
                      active
                        ? 'ring-accent-500'
                        : 'opacity-40 ring-transparent hover:opacity-70',
                    )}
                  >
                    {ch.label.slice(0, 2)}
                  </button>
                )
              })}
              <a
                href={`/${activeBrand.slug}/settings/socials`}
                title="Add channel"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-neutral-700 text-neutral-500 transition hover:border-neutral-500 hover:text-neutral-300"
              >
                +
              </a>
              {channels.length === 0 && (
                <p className="text-xs text-neutral-500">No channels connected yet.</p>
              )}
            </div>

            <textarea
              value={postCopy}
              onChange={(e) => setPostCopy(e.target.value)}
              placeholder="Start writing or get inspired with AI Assist…"
              className="min-h-[12rem] flex-1 resize-none rounded-xl border border-neutral-800 bg-neutral-800/60 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            />

            <div className="flex items-center justify-between">
              <div className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-700 text-center text-neutral-500">
                <span className="text-lg leading-none">+</span>
                <span className="px-1 text-[10px] leading-tight">
                  Drag &amp; drop or use the Designs tab
                </span>
              </div>
              <span className="text-xs tabular-nums text-neutral-500">
                {remaining}
              </span>
            </div>

            <label className="block text-xs text-neutral-400">
              First Comment
              <input
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                placeholder="Your comment"
                className="mt-1.5 w-full rounded-lg border border-neutral-800 bg-neutral-800/60 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
              />
            </label>
          </div>

          <div className="min-h-0 overflow-y-auto">
            {activeTab === 'ai' && (
              <ComposerAiAssistPanel onApplyCopy={setPostCopy} />
            )}
            {activeTab === 'designs' && (
              <ComposerDesignsPanel brand={activeBrand} />
            )}
          </div>
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-neutral-800 px-5 py-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-neutral-400">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={(e) => setCreateAnother(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-neutral-600 bg-neutral-800 text-accent-600 focus:ring-accent-500"
              />
              Create Another
            </label>
            <button
              type="button"
              onClick={() => void handleSaveDraft()}
              disabled={busy}
              className="text-sm text-neutral-400 hover:text-neutral-200 hover:underline disabled:opacity-50"
            >
              Save Drafts
            </button>
          </div>

          <div className="flex items-center gap-2">
            {error && <p className="text-xs text-rose-300">{error}</p>}
            <SchedulingControl
              value={scheduleOption}
              onChange={setScheduleOption}
              scheduleAt={scheduleAt}
              onScheduleAtChange={setScheduleAt}
            />
            <button
              type="button"
              onClick={() => void handlePrimaryAction()}
              disabled={busy}
              className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy
                ? 'Saving…'
                : scheduleOption === 'now'
                  ? 'Post Now'
                  : 'Schedule Posts'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
