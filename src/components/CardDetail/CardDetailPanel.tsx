import React, { useState, useRef, useEffect } from 'react'
import { X, Trash2, MoveRight, Calendar, Clock, ExternalLink } from 'lucide-react'
import type { Card } from '../../types'
import { isPentestProject } from '../../types'
import { useBoardStore } from '../../stores/boardStore'
import { useUiStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { SeverityBadge } from '../shared/SeverityBadge'
import { OverviewTab } from './tabs/Overview'
import { EvidenceTab } from './tabs/Evidence'
import { NotesTab } from './tabs/Notes'
import { parseTag } from '../../utils/tags'

type Tab = 'overview' | 'evidence' | 'notes'

interface Props { card: Card }

const CARD_TYPE_LABELS: Record<string, string> = {
  task: 'Task',
  finding: 'Finding',
  recon: 'Recon',
  exploit: 'Exploit',
  note: 'Note',
}

export function CardDetailPanel({ card }: Props) {
  const { updateCard, deleteCard, columns } = useBoardStore()
  const { selectCard } = useUiStore()
  const { projects } = useProjectStore()
  const [tab, setTab] = useState<Tab>('overview')
  const [editingTitle, setEditingTitle] = useState(() => card.title === 'Novo card')
  const [title, setTitle] = useState(card.title)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const project = projects.find(p => p.id === card.project_id)
  const pentestBoard = project ? isPentestProject(project.type) : false

  useEffect(() => {
    setTitle(card.title)
    setTab('overview')
    if (card.title === 'Novo card') {
      setEditingTitle(true)
      setTimeout(() => { titleRef.current?.select() }, 80)
    } else {
      setEditingTitle(false)
    }
  }, [card.id])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') selectCard(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const saveTitle = () => {
    if (title.trim() && title.trim() !== card.title) {
      updateCard(card.id, { title: title.trim() })
    } else {
      setTitle(card.title)
    }
    setEditingTitle(false)
  }

  const handleDelete = async () => {
    if (confirm('Delete this card?')) {
      selectCard(null)
      await deleteCard(card.id)
    }
  }

  const handleMove = (colId: string) => {
    updateCard(card.id, { column_id: colId } as Partial<Card>)
  }

  const currentColumn = columns.find(c => c.id === card.column_id)
  const otherColumns = columns.filter(c => c.id !== card.column_id)

  const TABS: { id: Tab; label: string }[] = pentestBoard
    ? [
      { id: 'overview', label: 'Overview' },
      { id: 'evidence', label: 'Evidence / PoC' },
      { id: 'notes', label: 'Notes & Checklist' },
    ]
    : [
      { id: 'overview', label: 'Overview' },
      { id: 'notes', label: 'Notes & Checklist' },
    ]

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/72"
        onClick={() => selectCard(null)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border bg-bg-elevated">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-3 text-xs text-text-muted font-mono">
            <span>{currentColumn?.title ?? '—'}</span>
            {otherColumns.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-accent transition-colors">
                  <MoveRight size={11} />
                  Move
                </button>
                <div className="absolute left-0 top-5 z-30 hidden group-hover:block bg-bg-elevated border border-border rounded-lg shadow-xl py-1 w-48">
                  {otherColumns.map(col => (
                    <button
                      key={col.id}
                      onClick={() => handleMove(col.id)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors"
                    >
                      → {col.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="ml-auto flex items-center gap-1">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {new Date(card.created_at).toLocaleDateString()}
              </span>
              <span className="text-border mx-1">·</span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {new Date(card.updated_at || card.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {/* Editable title */}
            <div className="flex-1 min-w-0">
              {editingTitle ? (
                <textarea
                  ref={titleRef}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveTitle() }
                    if (e.key === 'Escape') { setTitle(card.title); setEditingTitle(false) }
                  }}
                  autoFocus
                  rows={2}
                  className="w-full bg-bg-primary border border-accent rounded-lg px-3 py-2 text-lg font-semibold text-text-primary resize-none focus:outline-none"
                />
              ) : (
                <h1
                  onClick={() => { setEditingTitle(true); setTimeout(() => titleRef.current?.select(), 0) }}
                  className="text-lg font-semibold text-text-primary cursor-text hover:text-accent transition-colors leading-snug"
                  title="Click to edit"
                >
                  {card.title}
                </h1>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <SeverityBadge severity={card.severity} />
                <span className="text-xs font-mono text-text-muted bg-bg-overlay border border-border rounded px-1.5 py-0.5">
                  {CARD_TYPE_LABELS[card.card_type] ?? card.card_type}
                </span>
                {card.cvss_score !== null && (
                  <span className="text-xs font-mono bg-severity-high-bg text-severity-high border border-severity-high/20 rounded px-1.5 py-0.5">
                    CVSS {card.cvss_score.toFixed(1)}
                  </span>
                )}
                {card.cwe_id && (
                  <span className="text-xs font-mono text-text-muted bg-bg-overlay border border-border rounded px-1.5 py-0.5">
                    {card.cwe_id}
                  </span>
                )}
                {card.tags.slice(0, 4).map(t => {
                  const parsed = parseTag(t)
                  return (
                    <span
                      key={t}
                      className="text-[10px] font-mono border rounded px-1.5 py-0.5 text-text-muted"
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
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleDelete}
                className="btn-ghost p-2 text-text-muted hover:text-severity-critical"
                title="Delete card"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => selectCard(null)}
                className="btn-ghost p-2"
                title="Close (Esc)"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Affected URL bar (if set) ──────────────────────────────── */}
        {card.affected_url && (
          <div className="flex-shrink-0 px-6 py-2 bg-bg-primary border-b border-border flex items-center gap-2">
            <ExternalLink size={11} className="text-text-muted flex-shrink-0" />
            <code className="text-xs text-accent font-mono truncate">{card.affected_url}</code>
            {card.affected_parameter && (
              <>
                <span className="text-border">·</span>
                <code className="text-xs text-text-muted font-mono">param: {card.affected_parameter}</code>
              </>
            )}
          </div>
        )}

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className="flex-shrink-0 flex border-b border-border px-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? 'text-accent border-accent'
                  : 'text-text-muted hover:text-text-primary border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === 'overview' && <OverviewTab card={card} />}
          {tab === 'evidence' && pentestBoard && <EvidenceTab card={card} />}
          {tab === 'notes' && <NotesTab card={card} />}
        </div>
      </div>
    </div>
  )
}
