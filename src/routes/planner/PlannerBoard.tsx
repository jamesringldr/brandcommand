import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { AppShell } from '../../components/shell/AppShell'
import { useBrandContext } from '../../components/BrandProvider'
import { useCreatePostModal } from '../../components/composer/CreatePostModalContext'
import { BoardColumn } from '../../components/planner/BoardColumn'
import {
  ContentItemCard,
  ContentItemCardOverlay,
} from '../../components/planner/ContentItemCard'
import { PlannerFilters } from '../../components/planner/PlannerFilters'
import { listConnectors } from '../../lib/analytics/api'
import { listCampaigns } from '../../lib/campaigns/api'
import { listItems, transitionItem } from '../../lib/planner/api'
import {
  EMPTY_FILTERS,
  connectedSocialChannels,
  itemMatchesFilters,
  type PlannerFilterState,
} from '../../lib/planner/filters'
import {
  BOARD_COLUMNS,
  allowedTransitions,
} from '../../lib/planner/transitions'
import type {
  BrandConnector,
  Campaign,
  ContentItem,
  ContentStatus,
} from '../../lib/database.types'

export default function PlannerBoard() {
  const { activeBrand } = useBrandContext()
  const { openCreatePost } = useCreatePostModal()
  const [items, setItems] = useState<ContentItem[]>([])
  const [connectors, setConnectors] = useState<BrandConnector[]>([])
  const [goals, setGoals] = useState<Campaign[]>([])
  const [filters, setFilters] = useState<PlannerFilterState>(EMPTY_FILTERS)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const channels = useMemo(
    () => connectedSocialChannels(connectors),
    [connectors],
  )

  const load = useCallback(async () => {
    if (!activeBrand) return
    try {
      setError(null)
      const [nextItems, nextConnectors, nextGoals] = await Promise.all([
        listItems(activeBrand.id),
        listConnectors(activeBrand.id),
        listCampaigns(activeBrand.id),
      ])
      setItems(nextItems)
      setConnectors(nextConnectors)
      setGoals(nextGoals)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load planner')
    }
  }, [activeBrand])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = useMemo(
    () => items.filter((item) => itemMatchesFilters(item, filters)),
    [items, filters],
  )

  const byStatus = useMemo(() => {
    const map = new Map<ContentStatus, ContentItem[]>()
    for (const col of BOARD_COLUMNS) map.set(col, [])
    for (const item of filtered) {
      const list = map.get(item.status) ?? []
      list.push(item)
      map.set(item.status, list)
    }
    return map
  }, [filtered])

  const activeItem = useMemo(
    () => (activeId ? (items.find((i) => i.id === activeId) ?? null) : null),
    [activeId, items],
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
    setError(null)
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const itemId = String(active.id)
    const overId = String(over.id)
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    // Drop target may be a column id or another card (resolve to that card's status)
    let nextStatus: ContentStatus | null = null
    if ((BOARD_COLUMNS as string[]).includes(overId)) {
      nextStatus = overId as ContentStatus
    } else {
      const overItem = items.find((i) => i.id === overId)
      nextStatus = overItem?.status ?? null
    }
    if (!nextStatus || item.status === nextStatus) return

    if (nextStatus === 'Posted') {
      setError('Posted is set by the scheduler — not a manual drop target')
      return
    }

    const allowed = allowedTransitions(item.status, item.type)
    if (!allowed.includes(nextStatus)) {
      setError(`Cannot move from ${item.status} to ${nextStatus}`)
      return
    }

    const previous = items
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: nextStatus } : i)),
    )

    try {
      const updated = await transitionItem(itemId, nextStatus)
      setItems((prev) => prev.map((i) => (i.id === itemId ? updated : i)))
    } catch (err) {
      setItems(previous)
      setError(
        err instanceof Error
          ? err.message
          : 'Transition rejected by status machine',
      )
    }
  }

  if (!activeBrand) return null

  const filtersActive =
    Boolean(filters.channel) ||
    Boolean(filters.goal) ||
    Boolean(filters.tag) ||
    Boolean(filters.postType)

  return (
    <AppShell
      fillHeight
      title="Planner"
      subtitle="Content pipeline — Buffer-style queue with status stages"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0">
          <PlannerFilters
            value={filters}
            onChange={setFilters}
            channels={channels}
            goals={goals}
          />

          {error && (
            <p className="mb-4 text-sm text-rose-300" role="alert">
              {error}
            </p>
          )}

          {filtersActive && filtered.length === 0 && items.length > 0 && (
            <p className="mb-4 text-sm text-neutral-500">
              No items match these filters — columns stay visible so you can
              still add ideas.
            </p>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={(e) => void onDragEnd(e)}
          onDragCancel={() => setActiveId(null)}
        >
          <div
            className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div
              className="flex gap-4"
              style={{ flex: '1 1 0%', minHeight: 0 }}
            >
              {BOARD_COLUMNS.map((col) => (
                <BoardColumn
                  key={col}
                  status={col}
                  count={byStatus.get(col)?.length ?? 0}
                  onNewIdea={openCreatePost}
                  acceptDrops={col !== 'Posted'}
                >
                  {(byStatus.get(col) ?? []).map((item) => (
                    <li key={item.id}>
                      <ContentItemCard
                        item={item}
                        brandSlug={activeBrand.slug}
                      />
                    </li>
                  ))}
                </BoardColumn>
              ))}
            </div>
            <div style={{ flex: '0 0 16px' }} aria-hidden />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeItem ? <ContentItemCardOverlay item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </AppShell>
  )
}
