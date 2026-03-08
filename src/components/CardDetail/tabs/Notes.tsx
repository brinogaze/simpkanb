import React, { useState } from 'react'
import type { Card, ChecklistItem } from '../../../types'
import { useBoardStore } from '../../../stores/boardStore'
import { Plus, Trash2 } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Eye, Edit3 } from 'lucide-react'

interface Props { card: Card }

export function NotesTab({ card }: Props) {
  const { updateCard, updateChecklist } = useBoardStore()
  const [preview, setPreview] = useState(false)
  const [newItem, setNewItem] = useState('')

  const update = (field: string, value: unknown) =>
    updateCard(card.id, { [field]: value } as Partial<Card>)

  const addCheckItem = () => {
    const text = newItem.trim()
    if (!text) return
    const item: ChecklistItem = { id: uuid(), text, done: false }
    updateChecklist(card.id, [...card.checklist, item])
    setNewItem('')
  }

  const toggleItem = (id: string) => {
    updateChecklist(
      card.id,
      card.checklist.map(i => i.id === id ? { ...i, done: !i.done } : i)
    )
  }

  const deleteItem = (id: string) => {
    updateChecklist(card.id, card.checklist.filter(i => i.id !== id))
  }

  const doneCount = card.checklist.filter(i => i.done).length

  return (
    <div className="space-y-4 p-4">
      {/* Free notes */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-text-muted">Notes</label>
          <div className="flex gap-1">
            <button onClick={() => setPreview(false)} className={`btn-ghost text-xs py-0.5 ${!preview ? 'bg-bg-elevated text-text-primary' : ''}`}>
              <Edit3 size={10} className="inline mr-0.5" />Edit
            </button>
            <button onClick={() => setPreview(true)} className={`btn-ghost text-xs py-0.5 ${preview ? 'bg-bg-elevated text-text-primary' : ''}`}>
              <Eye size={10} className="inline mr-0.5" />Preview
            </button>
          </div>
        </div>
        {preview ? (
          <div className="border border-border rounded-lg p-3 min-h-[100px] prose prose-invert prose-sm max-w-none text-text-primary">
            {card.notes ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.notes}</ReactMarkdown>
            ) : (
              <p className="text-text-muted italic">No notes</p>
            )}
          </div>
        ) : (
          <textarea
            value={card.notes || ''}
            onChange={e => update('notes', e.target.value || null)}
            placeholder="Free notes, context, observations..."
            className="input resize-none h-32 text-sm font-mono"
          />
        )}
      </div>

      {/* Checklist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-text-muted">
            Checklist {card.checklist.length > 0 && (
              <span className="ml-1 text-[10px] bg-bg-overlay border border-border rounded px-1 font-mono">
                {doneCount}/{card.checklist.length}
              </span>
            )}
          </label>
        </div>

        {card.checklist.length > 0 && (
          <div className="h-1.5 bg-bg-overlay rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-severity-low rounded-full transition-all"
              style={{ width: `${(doneCount / card.checklist.length) * 100}%` }}
            />
          </div>
        )}

        <div className="space-y-1 mb-2">
          {card.checklist.map(item => (
            <div key={item.id} className="flex items-start gap-2 group py-1">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
                className="mt-0.5 accent-accent"
              />
              <span className={`flex-1 text-sm ${item.done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                {item.text}
              </span>
              <button
                onClick={() => deleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-severity-critical transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addCheckItem() }}
            placeholder="Add checklist item..."
            className="input text-sm flex-1"
          />
          <button onClick={addCheckItem} disabled={!newItem.trim()} className="btn-secondary px-3">
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
