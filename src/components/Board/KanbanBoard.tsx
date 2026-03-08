import React, { useEffect, useState } from 'react'
import {
  DndContext, DragEndEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners, DragOverlay,
} from '@dnd-kit/core'
import { Plus, ArrowLeft, Search } from 'lucide-react'
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
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-surface flex-shrink-0">
        <button
          onClick={() => { setView('dashboard'); setActiveProject(null) }}
          className="btn-ghost flex items-center gap-1.5 text-text-muted"
        >
          <ArrowLeft size={14} />
        </button>

        {project && (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
            <span className="font-medium text-sm text-text-primary">{project.name}</span>
            {project.client && <span className="text-xs text-text-muted">— {project.client}</span>}
          </div>
        )}

        <div className="flex-1" />

        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            className="input pl-8 py-1.5 text-xs w-48"
          />
        </div>

        <button onClick={handleAddColumn} className="btn-secondary flex items-center gap-1.5 text-xs">
          <Plus size={13} />
          Add Column
        </button>
      </div>

      {/* Board — full width now, no side panel pushing layout */}
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
              />
            ))}
          </div>

          <DragOverlay>
            {activeCard && (
              <div className="rotate-1 opacity-90">
                <KanbanCard card={activeCard} />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card modal — rendered as overlay above everything */}
      {selectedCard && <CardDetailPanel card={selectedCard} />}
    </div>
  )
}
