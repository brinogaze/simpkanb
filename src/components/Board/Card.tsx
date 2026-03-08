import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckSquare, FileText, Search, Zap, StickyNote } from 'lucide-react'
import type { Card as CardType } from '../../types'
import { SeverityBadge, SeverityDot } from '../shared/SeverityBadge'
import { useUiStore } from '../../stores/uiStore'

const CARD_TYPE_ICONS = {
  task:    <FileText size={11} className="text-text-muted" />,
  finding: <Zap size={11} className="text-severity-high" />,
  recon:   <Search size={11} className="text-accent" />,
  exploit: <Zap size={11} className="text-severity-critical" />,
  note:    <StickyNote size={11} className="text-text-muted" />,
}

interface Props {
  card: CardType
}

export function KanbanCard({ card }: Props) {
  const { selectCard } = useUiStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const doneChecklist = card.checklist.filter(i => i.done).length
  const totalChecklist = card.checklist.length

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-card="true"
      onClick={() => selectCard(card.id)}
      className="bg-bg-elevated border border-border rounded-lg p-3 cursor-pointer hover:border-border-emphasis transition-all group select-none"
    >
      {card.severity && (
        <div className="flex items-center gap-1.5 mb-2">
          <SeverityDot severity={card.severity} />
          <SeverityBadge severity={card.severity} size="sm" />
        </div>
      )}

      <div className="flex items-start gap-1.5 mb-2">
        <span className="mt-0.5">{CARD_TYPE_ICONS[card.card_type]}</span>
        <p className="text-sm text-text-primary leading-snug">{card.title}</p>
      </div>

      {card.affected_url && (
        <p className="text-xs text-text-muted font-mono truncate mb-2">{card.affected_url}</p>
      )}

      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] font-mono bg-bg-overlay border border-border px-1.5 py-0.5 rounded text-text-muted">
              {t}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="text-[10px] text-text-muted">+{card.tags.length - 3}</span>
          )}
        </div>
      )}

      {totalChecklist > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
          <CheckSquare size={11} />
          <span>{doneChecklist}/{totalChecklist}</span>
          <div className="flex-1 h-1 bg-bg-overlay rounded-full overflow-hidden">
            <div
              className="h-full bg-severity-low rounded-full"
              style={{ width: `${(doneChecklist / totalChecklist) * 100}%` }}
            />
          </div>
        </div>
      )}

      {card.cvss_score !== null && (
        <div className="mt-2 pt-2 border-t border-border-muted">
          <span className="text-[10px] font-mono text-text-muted">CVSS </span>
          <span className="text-[10px] font-mono text-severity-high font-semibold">{card.cvss_score.toFixed(1)}</span>
        </div>
      )}
    </div>
  )
}
