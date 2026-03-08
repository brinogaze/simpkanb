import React, { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import type { Column as ColumnType, Card } from '../../types'
import { KanbanCard } from './Card'
import { useBoardStore } from '../../stores/boardStore'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'

/** Returns a status accent color based on the column's title */
function getColumnStatusColor(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('progress') || lower.includes('doing') || lower.includes('active')) return '#58a6ff'
  if (lower.includes('review') || lower.includes('testing') || lower.includes('qa')) return '#cc88ff'
  if (lower.includes('done') || lower.includes('complete') || lower.includes('closed')) return '#44ff88'
  if (lower.includes('blocked') || lower.includes('hold')) return '#ff4444'
  return '#6e7681' // todo / default
}

interface Props {
  column: ColumnType
  cards: Card[]
  ticketNumberById: Record<string, number>
}

export function Column({ column, cards, ticketNumberById }: Props) {
  const { deleteColumn, createCard, updateColumn } = useBoardStore()
  const { activeProjectId } = useProjectStore()
  const { selectCard, quickCreateOnEmptyClick } = useUiStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(column.title)
  const [isHoveringEmpty, setIsHoveringEmpty] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)

  // Ref for quick-create without stale closure
  const quickCreateRef = useRef<() => void>(() => {})
  quickCreateRef.current = () => {
    if (!activeProjectId) return
    createCard({
      column_id: column.id,
      project_id: activeProjectId,
      title: 'Novo card',
      card_type: 'task',
    }).then(card => selectCard(card.id))
  }

  const addingRef = useRef(adding)
  addingRef.current = adding

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  // Native pointer listener with capture:true to detect clicks on empty column area
  useEffect(() => {
    if (!quickCreateOnEmptyClick) return
    const el = columnRef.current
    if (!el) return
    const handler = (e: PointerEvent) => {
      if (addingRef.current) return
      const target = e.target as HTMLElement
      if (
        target.closest('[data-col-header]') ||
        target.closest('[data-card]') ||
        target.closest('form') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea')
      ) return
      e.stopPropagation()
      quickCreateRef.current()
    }
    el.addEventListener('pointerdown', handler, { capture: true })
    return () => el.removeEventListener('pointerdown', handler, { capture: true })
  }, [quickCreateOnEmptyClick])

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !activeProjectId) return
    const card = await createCard({
      column_id: column.id,
      project_id: activeProjectId,
      title: newTitle.trim(),
      card_type: 'task',
    })
    setNewTitle('')
    setAdding(false)
    selectCard(card.id)
  }

  const startEditTitle = () => {
    setTitleValue(column.title)
    setEditingTitle(true)
    setMenuOpen(false)
    setTimeout(() => { titleInputRef.current?.select() }, 0)
  }

  const saveTitle = () => {
    const trimmed = titleValue.trim()
    if (trimmed && trimmed !== column.title) {
      updateColumn(column.id, { title: trimmed })
    }
    setEditingTitle(false)
  }

  const isEmpty = cards.length === 0
  const statusColor = getColumnStatusColor(column.title)

  return (
    <div
      ref={columnRef}
      className="flex-shrink-0 w-72 h-full flex flex-col gap-1"
      onMouseLeave={() => setIsHoveringEmpty(false)}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div data-col-header className="flex items-center justify-between px-1 py-0.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Status color dot */}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: statusColor }}
          />

          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') saveTitle()
                if (e.key === 'Escape') { setTitleValue(column.title); setEditingTitle(false) }
              }}
              className="input text-sm font-medium py-0.5 px-2 h-7"
              autoFocus
            />
          ) : (
            <button
              onClick={startEditTitle}
              className="text-sm font-medium text-text-primary hover:text-accent transition-colors truncate text-left"
            >
              {column.title}
            </button>
          )}

          {/* Card count badge */}
          <span className="text-xs text-text-muted bg-bg-elevated border border-border rounded-full px-1.5 py-0.5 font-mono flex-shrink-0 leading-none">
            {cards.length}
          </span>
        </div>

        {/* Column actions */}
        <div className="flex items-center gap-0.5 relative flex-shrink-0">
          <button onClick={() => setAdding(true)} className="btn-ghost p-1">
            <Plus size={14} />
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-1">
            <MoreHorizontal size={14} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 bg-bg-elevated border border-border rounded-lg shadow-xl py-1 w-44">
              <button
                onClick={startEditTitle}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-text-secondary hover:bg-bg-overlay transition-colors"
              >
                Rename Column
              </button>
              <button
                onClick={() => { deleteColumn(column.id); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-severity-critical hover:bg-bg-overlay transition-colors"
              >
                <Trash2 size={12} />
                Delete Column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Cards (droppable zone) ─────────────────────── */}
      <div
        ref={setNodeRef}
        className={`space-y-2 rounded-lg transition-colors ${
          isOver ? 'bg-accent/5 ring-1 ring-accent/20' : ''
        } ${isEmpty ? 'min-h-0' : 'min-h-[10px]'}`}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <KanbanCard key={card.id} card={card} ticketNumber={ticketNumberById[card.id]} />
          ))}
        </SortableContext>
      </div>

      {/* ── Empty column drop hint ─────────────────────── */}
      {isEmpty && !adding && (
        <button
          type="button"
          data-empty-create="true"
          onMouseEnter={() => setIsHoveringEmpty(true)}
          onMouseLeave={() => setIsHoveringEmpty(false)}
          onClick={() => quickCreateRef.current()}
          className={`h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all ${
            isOver
              ? 'border-accent bg-accent/5'
              : isHoveringEmpty
                ? 'border-accent/50 bg-accent/5'
                : 'border-border'
          }`}
        >
          <div className={`flex items-center justify-center rounded-full transition-all ${
            isHoveringEmpty ? 'w-9 h-9 bg-accent/10 border border-accent/20' : 'w-7 h-7'
          }`}>
            <Plus
              size={isHoveringEmpty ? 20 : 16}
              className={`transition-all ${isHoveringEmpty ? 'text-accent' : 'text-border'}`}
            />
          </div>
          <span className={`text-[11px] transition-colors ${isHoveringEmpty ? 'text-accent' : 'text-text-muted'}`}>
            {isOver ? 'Drop to change status' : 'click to add'}
          </span>
        </button>
      )}

      {/* ── Add card form ──────────────────────────────── */}
      {adding && (
        <form onSubmit={handleAddCard} className="space-y-2">
          <textarea
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') { setAdding(false); setNewTitle('') }
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(e as unknown as React.FormEvent) }
            }}
            placeholder="Card title..."
            className="input resize-none text-sm h-20"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={!newTitle.trim()} className="btn-primary flex-1 text-xs py-1.5">
              Add Card
            </button>
            <button type="button" onClick={() => { setAdding(false); setNewTitle('') }} className="btn-secondary text-xs py-1.5 px-3">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Add card button (when column has cards) ─────── */}
      {!adding && !isEmpty && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent py-1.5 px-2 rounded-md hover:bg-accent/5 transition-colors cursor-cell group"
        >
          <Plus size={13} className="group-hover:scale-110 transition-transform" />
          Add card
        </button>
      )}

      {/* Spacer — fills remaining column height */}
      <div className="flex-1" />
    </div>
  )
}
