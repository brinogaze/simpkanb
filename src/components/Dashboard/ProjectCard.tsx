import React from 'react'
import { Calendar, Trash2 } from 'lucide-react'
import type { Project, Card, Severity } from '../../types'
import { isPentestProject } from '../../types'

const TYPE_ICONS: Record<string, string> = {
  web: '🌐', mobile: '📱', api: '⚡', network: '🔌', cloud: '☁️', red_team: '🎯',
  personal: '🙋', gaming: '🎮', work: '💼', study: '📚', other: '📋',
}

const SEV_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info']
const SEV_COLORS: Record<Severity, string> = {
  critical: '#ff4444', high: '#ff8800', medium: '#ffcc00', low: '#44ff88', info: '#4499ff',
}
const PRIORITY_LABELS: Record<Severity, string> = {
  critical: 'Urgente', high: 'Alta', medium: 'Normal', low: 'Baixa', info: 'Info',
}

interface Props {
  project: Project
  cards: Card[]
  onClick: () => void
  onDelete: () => void
}

export function ProjectCard({ project, cards, onClick, onDelete }: Props) {
  const pentest = isPentestProject(project.type)

  // Pentest: count findings by severity
  const findings = pentest ? cards.filter(c => c.card_type === 'finding' && c.severity) : []
  const bySeverity = SEV_ORDER.reduce((acc, s) => {
    acc[s] = findings.filter(c => c.severity === s).length
    return acc
  }, {} as Record<Severity, number>)

  // General: count tasks by priority
  const byPriority = !pentest ? SEV_ORDER.reduce((acc, s) => {
    acc[s] = cards.filter(c => c.severity === s).length
    return acc
  }, {} as Record<Severity, number>) : ({} as Record<Severity, number>)

  const statusColors: Record<string, string> = {
    active: 'text-severity-low',
    paused: 'text-severity-medium',
    completed: 'text-text-muted',
  }

  const doneCards = cards.filter(c => {
    // heuristic: cards in last column are "done" - we don't have column info here, just count
    return false
  }).length

  return (
    <div
      className="card-surface p-4 hover:border-border-emphasis transition-all cursor-pointer group relative"
      style={{ borderTopColor: project.color, borderTopWidth: 2 }}
      onClick={onClick}
    >
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="absolute top-3 right-3 btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-severity-critical"
      >
        <Trash2 size={14} />
      </button>

      <div className="pr-6">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">{TYPE_ICONS[project.type] ?? '📋'}</span>
          <h3 className="font-semibold text-text-primary text-sm truncate">{project.name}</h3>
        </div>
        {project.client && (
          <p className="text-xs text-text-muted mb-2 ml-6">{project.client}</p>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3 mt-1">
        <span className={`text-xs font-mono uppercase ${statusColors[project.status]}`}>
          {project.status}
        </span>
        <span className="text-border">·</span>
        <span className="text-xs text-text-muted uppercase font-mono">{project.type.replace('_', ' ')}</span>
      </div>

      {/* Pentest: findings por severity */}
      {pentest && findings.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-text-muted mb-1.5">Findings</p>
          <div className="flex gap-2 flex-wrap">
            {SEV_ORDER.filter(s => bySeverity[s] > 0).map(s => (
              <span key={s} className="flex items-center gap-1 text-xs font-mono" style={{ color: SEV_COLORS[s] }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SEV_COLORS[s] }} />
                {bySeverity[s]} {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* General: tarefas por prioridade */}
      {!pentest && cards.length > 0 && SEV_ORDER.some(s => byPriority[s] > 0) && (
        <div className="mb-3">
          <p className="text-xs text-text-muted mb-1.5">Prioridades</p>
          <div className="flex gap-2 flex-wrap">
            {SEV_ORDER.filter(s => byPriority[s] > 0 && s !== 'info').map(s => (
              <span key={s} className="flex items-center gap-1 text-xs font-mono" style={{ color: SEV_COLORS[s] }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SEV_COLORS[s] }} />
                {byPriority[s]} {PRIORITY_LABELS[s]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-text-muted pt-2 border-t border-border-muted">
        <span className="flex items-center gap-1">
          <Calendar size={11} />
          {new Date(project.created_at).toLocaleDateString()}
        </span>
        <span>{cards.length} {cards.length === 1 ? 'card' : 'cards'}</span>
      </div>
    </div>
  )
}
