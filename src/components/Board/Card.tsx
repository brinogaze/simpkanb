import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CheckSquare, FileText, Search, Zap, StickyNote, CalendarDays, Trash2 } from 'lucide-react'
import type { Card as CardType } from '../../types'
import { SeverityBadge, SeverityDot } from '../shared/SeverityBadge'
import { useUiStore } from '../../stores/uiStore'
import { useBoardStore } from '../../stores/boardStore'
import { parseTag } from '../../utils/tags'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Formats an ISO date string as "Aug 12". */
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Returns Tailwind classes for a tag based on its content. */
function tagStyle(tag: string): string {
  const { label, color } = parseTag(tag)
  if (color) return ''
  const t = label.toLowerCase()
  if (t === 'bug' || t === 'critical') return 'bg-severity-critical-bg text-severity-critical border-severity-critical/30'
  if (t === 'high') return 'bg-severity-high-bg text-severity-high border-severity-high/30'
  if (t === 'medium') return 'bg-severity-medium-bg text-severity-medium border-severity-medium/30'
  if (t === 'low') return 'bg-severity-low-bg text-severity-low border-severity-low/30'
  if (t === 'enhancement' || t === 'feature') return 'bg-accent/10 text-accent border-accent/30'
  // "MSP Scope" and similar label-style tags
  if (t.includes('scope') || t.includes('msp') || t.startsWith('msp')) {
    return 'bg-bg-overlay text-text-secondary border-border'
  }
  return 'bg-bg-overlay text-text-muted border-border'
}

const CARD_TYPE_ICONS: Record<string, React.ReactNode> = {
  task:    <FileText size={11} className="text-text-muted" />,
  finding: <Zap size={11} className="text-severity-high" />,
  recon:   <Search size={11} className="text-accent" />,
  exploit: <Zap size={11} className="text-severity-critical" />,
  note:    <StickyNote size={11} className="text-text-muted" />,
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  card: CardType
  ticketNumber?: number
}

export function KanbanCard({ card, ticketNumber }: Props) {
  const { selectCard, profile } = useUiStore()
  const { deleteCard } = useBoardStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id })

  const ticketId = `MT-${String(Math.max(ticketNumber || 1, 1)).padStart(3, '0')}`
  const createdByMe = card.created_by === profile.id
  const avatarLabel = createdByMe ? profile.avatar : (card.created_by ? card.created_by[0].toUpperCase() : '?')
  const avatarColor = createdByMe ? '#58a6ff' : '#6e7681'
  const dateLabel = formatDate(card.updated_at || card.created_at)
  const previewImage = card.attachments.find(att => att.kind === 'image')

  const doneChecklist = card.checklist.filter(i => i.done).length
  const totalChecklist = card.checklist.length

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-card="true"
      onClick={() => selectCard(card.id)}
      className="relative bg-bg-elevated border border-border rounded-lg p-3 cursor-pointer hover:border-border-emphasis hover:shadow-sm transition-all group select-none"
    >
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={async (e) => {
          e.stopPropagation()
          if (confirm('Delete this card?')) {
            await deleteCard(card.id)
          }
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 btn-ghost p-1 text-text-muted hover:text-severity-critical transition-opacity"
        title="Delete card"
      >
        <Trash2 size={13} />
      </button>

      {/* Severity row — pentest findings */}
      {card.severity && (
        <div className="flex items-center gap-1.5 mb-2">
          <SeverityDot severity={card.severity} />
          <SeverityBadge severity={card.severity} size="sm" />
        </div>
      )}

      {/* Ticket ID + type icon + avatar */}
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-1.5 pr-8">
          <span className="text-[10px] font-mono text-text-muted">{ticketId}</span>
          {card.card_type && (
            <span>{CARD_TYPE_ICONS[card.card_type]}</span>
          )}
        </div>
        {/* Assignee avatar */}
        <div
          className="w-5 h-5 mt-5 rounded-full flex items-center justify-center text-[9px] font-bold text-bg-primary flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
          title={createdByMe ? `Created by ${profile.name}` : 'Created by another user'}
        >
          {avatarLabel}
        </div>
      </div>

      {/* Title */}
      <p className="text-sm text-text-primary leading-snug mb-2">{card.title}</p>

      {/* Affected URL — pentest specific */}
      {card.affected_url && (
        <p className="text-xs text-text-muted font-mono truncate mb-2">{card.affected_url}</p>
      )}

      {previewImage && (
        <div className="mb-2 rounded border border-border overflow-hidden bg-bg-primary">
          <img
            src={previewImage.data_url}
            alt={previewImage.name}
            className="w-full h-20 object-cover"
          />
        </div>
      )}

      {/* Tags */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.tags.slice(0, 3).map(tag => {
            const parsed = parseTag(tag)
            return (
              <span
                key={tag}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${tagStyle(tag)}`}
                style={parsed.color ? {
                  backgroundColor: `${parsed.color}22`,
                  borderColor: parsed.color,
                  color: parsed.color,
                } : undefined}
              >
                {parsed.label}
              </span>
            )
          })}
          {card.tags.length > 3 && (
            <span className="text-[10px] text-text-muted">+{card.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Checklist progress */}
      {totalChecklist > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
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

      {/* Footer: CVSS score + date */}
      <div className="flex items-center gap-2 mt-1">
        {card.cvss_score !== null && (
          <div>
            <span className="text-[10px] font-mono text-text-muted">CVSS </span>
            <span className="text-[10px] font-mono text-severity-high font-semibold">
              {card.cvss_score.toFixed(1)}
            </span>
          </div>
        )}
        {dateLabel && (
          <div className="ml-auto flex items-center gap-1 text-[10px] text-text-muted">
            <CalendarDays size={10} />
            <span>{dateLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
