import React, { useEffect, useMemo, useState } from 'react'
import {
  DndContext, DragEndEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners, DragOverlay,
} from '@dnd-kit/core'
import { Plus, Search, Share2, Filter, Eye, ChevronRight, LayoutGrid } from 'lucide-react'
import { useBoardStore } from '../../stores/boardStore'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import { Column } from './Column'
import { KanbanCard } from './Card'
import { CardDetailPanel } from '../CardDetail/CardDetailPanel'
import type { Card } from '../../types'

export function KanbanBoard() {
  const { columns, cards, loadBoard, createColumn, moveCard } = useBoardStore()
  const { activeProjectId, projects, setActiveProject } = useProjectStore()
  const { setView, selectedCardId, searchQuery, setSearchQuery } = useUiStore()
  const [activeCard, setActiveCard] = useState<Card | null>(null)

  const project = projects.find(p => p.id === activeProjectId)

  useEffect(() => {
    if (activeProjectId) loadBoard(activeProjectId)
  }, [activeProjectId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const filteredCards = cards.filter(c => {
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const ticketNumberById = useMemo(() => {
    const ordered = cards
      .slice()
      .sort((a, b) => {
        const createdDiff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        if (createdDiff !== 0) return createdDiff
        return a.id.localeCompare(b.id)
      })
    const map: Record<string, number> = {}
    ordered.forEach((c, i) => { map[c.id] = i + 1 })
    return map
  }, [cards])

  const getColumnCards = (colId: string) =>
    filteredCards.filter(c => c.column_id === colId).sort((a, b) => a.position - b.position)

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveCard(cards.find(c => c.id === active.id) || null)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveCard(null)
    if (!over || active.id === over.id) return

    const sourceCard = cards.find(c => c.id === active.id)
    if (!sourceCard) return

    const targetColumn = columns.find(col => col.id === over.id)
    if (targetColumn) {
      moveCard(sourceCard.id, targetColumn.id, getColumnCards(targetColumn.id).length)
      return
    }

    const targetCard = cards.find(c => c.id === over.id)
    if (targetCard) {
      const idx = getColumnCards(targetCard.column_id).findIndex(c => c.id === targetCard.id)
      moveCard(sourceCard.id, targetCard.column_id, idx)
    }
  }

  const handleAddColumn = async () => {
    if (!activeProjectId) return
    const title = prompt('Column name:')
    if (title?.trim()) {
      await createColumn({ project_id: activeProjectId, title: title.trim() })
    }
  }

  const selectedCard = selectedCardId ? cards.find(c => c.id === selectedCardId) : null

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* ── Brandby-style toolbar ─────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-bg-surface/70 backdrop-blur-xl flex-shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm min-w-0">
          <button
            onClick={() => { setView('dashboard'); setActiveProject(null) }}
            className="text-text-muted hover:text-text-primary transition-colors text-xs font-medium truncate max-w-32"
          >
            {project?.name || 'Projects'}
          </button>
          <ChevronRight size={12} className="text-text-muted flex-shrink-0" />
          <span className="text-xs font-medium text-text-primary flex items-center gap-1.5 flex-shrink-0">
            <LayoutGrid size={13} className="text-text-muted" />
            Board
          </span>
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button className="btn-ghost py-1 px-2.5 text-xs flex items-center gap-1.5 text-text-secondary hover:text-accent">
            <Share2 size={13} />
            <span className="hidden sm:inline">Share</span>
          </button>
          <button className="btn-ghost py-1 px-2.5 text-xs flex items-center gap-1.5 text-text-secondary hover:text-accent">
            <Filter size={13} />
            <span className="hidden sm:inline">Filter</span>
          </button>
          <button className="btn-ghost py-1 px-2.5 text-xs flex items-center gap-1.5 text-text-secondary hover:text-accent">
            <Eye size={13} />
            <span className="hidden sm:inline">View</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search cards..."
              className="input pl-7 py-1.5 text-xs w-40"
            />
          </div>

          <button
            onClick={handleAddColumn}
            className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3 ml-1"
          >
            <Plus size={13} />
            Column
          </button>
        </div>
      </div>

      {/* ── Board ─────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div className="flex gap-4 h-full items-stretch">
            {columns.map(col => (
              <Column
                key={col.id}
                column={col}
                cards={getColumnCards(col.id)}
                ticketNumberById={ticketNumberById}
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="rotate-1 opacity-90">
                <KanbanCard card={activeCard} ticketNumber={ticketNumberById[activeCard.id]} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card detail modal — overlaid above everything */}
      {selectedCard && <CardDetailPanel card={selectedCard} />}
    </div>
  )
}
