import React, { useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import type { Column as ColumnType, Card } from '../../types'
import { KanbanCard } from './Card'
import { useBoardStore } from '../../stores/boardStore'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'

interface Props {
  column: ColumnType
  cards: Card[]
}

export function Column({ column, cards }: Props) {
  const { deleteColumn, createCard, updateColumn } = useBoardStore()
  const { activeProjectId } = useProjectStore()
  const { selectCard } = useUiStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(column.title)
  const [isHoveringEmpty, setIsHoveringEmpty] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const columnRef = useRef<HTMLDivElement>(null)

  // Ref para quick-create sem stale closure
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

  // ── Listener nativo com capture:true ─────────────────────────────────────
  useEffect(() => {
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
  }, [])

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

  return (
    <div
      ref={columnRef}
      className="flex-shrink-0 w-72 h-full flex flex-col gap-1"
      onMouseMove={e => {
        if (addingRef.current) { setIsHoveringEmpty(false); return }
        const target = e.target as HTMLElement
        setIsHoveringEmpty(
          !target.closest('[data-col-header]') &&
          !target.closest('[data-card]') &&
          !target.closest('button') &&
          !target.closest('form')
        )
      }}
      onMouseLeave={() => setIsHoveringEmpty(false)}
    >

      {/* ── Header ───────────────────────────────────── */}
      <div data-col-header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 flex-1 min-w-0">
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
          <span className="text-xs text-text-muted bg-bg-elevated border border-border rounded-full px-1.5 py-0.5 font-mono flex-shrink-0">
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1 relative flex-shrink-0">
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

      {/* ── Cards (zona droppable) ────────────────────── */}
      <div
        ref={setNodeRef}
        className={`space-y-2 rounded-lg transition-colors ${
          isOver ? 'bg-accent/5 ring-1 ring-accent/20' : ''
        } ${isEmpty ? 'min-h-0' : 'min-h-[10px]'}`}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <KanbanCard key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      {/* ── Indicador visual área vazia (pointer-events:none) ── */}
      {isEmpty && !adding && (
        <div
          style={{ pointerEvents: 'none' }}
          className={`h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all ${
            isHoveringEmpty ? 'border-accent bg-accent/5' : 'border-border'
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
            clique para adicionar
          </span>
        </div>
      )}

      {/* ── Form de adicionar ─────────────────────────── */}
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

      {/* ── Add card (quando tem cards) ───────────────── */}
      {!adding && !isEmpty && (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent py-1.5 px-2 rounded-md hover:bg-accent/5 transition-colors cursor-cell group"
        >
          <Plus size={13} className="group-hover:scale-110 transition-transform" />
          Add card
        </button>
      )}

      {/* ── Espaçador — preenche a altura restante da coluna ── */}
      {/* O native listener do wrapper captura cliques aqui também */}
      <div className="flex-1" />

    </div>
  )
}
