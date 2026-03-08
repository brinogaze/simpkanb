import React, { useState } from 'react'
import type { Card, CardType, Severity } from '../../../types'
import { isPentestProject } from '../../../types'
import { useBoardStore } from '../../../stores/boardStore'
import { useProjectStore } from '../../../stores/projectStore'
import { SeverityBadge } from '../../shared/SeverityBadge'
import { CvssCalculator } from '../CvssCalculator'
import { TagInput } from '../../shared/TagInput'
import { ChevronDown } from 'lucide-react'
import { FINDING_TEMPLATES } from '../../../data/findingTemplates'
import { AttachmentSection } from '../AttachmentSection'

// ── Pentest constants ────────────────────────────────────────────────────────
const PENTEST_CARD_TYPES: CardType[] = ['task', 'finding', 'recon', 'exploit', 'note']
const PENTEST_SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info']
const OWASP = [
  'A01:2021 – Broken Access Control',
  'A02:2021 – Cryptographic Failures',
  'A03:2021 – Injection',
  'A04:2021 – Insecure Design',
  'A05:2021 – Security Misconfiguration',
  'A06:2021 – Vulnerable and Outdated Components',
  'A07:2021 – Identification and Authentication Failures',
  'A08:2021 – Software and Data Integrity Failures',
  'A09:2021 – Security Logging and Monitoring Failures',
  'A10:2021 – Server-Side Request Forgery',
]

// ── General constants ────────────────────────────────────────────────────────
const GENERAL_CARD_TYPES: { value: CardType; label: string }[] = [
  { value: 'task', label: 'Tarefa' },
  { value: 'note', label: 'Nota' },
]
const PRIORITIES: { value: Severity; label: string }[] = [
  { value: 'critical', label: 'Urgente' },
  { value: 'high',     label: 'Alta' },
  { value: 'medium',   label: 'Normal' },
  { value: 'low',      label: 'Baixa' },
]

// ── Component ────────────────────────────────────────────────────────────────
interface Props { card: Card }

export function OverviewTab({ card }: Props) {
  const { updateCard } = useBoardStore()
  const { projects } = useProjectStore()
  const [showCvss, setShowCvss] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const project = projects.find(p => p.id === card.project_id)
  const pentest = project ? isPentestProject(project.type) : false

  const update = (field: string, value: unknown) =>
    updateCard(card.id, { [field]: value } as Partial<Card>)

  const applyTemplate = (templateId: string) => {
    const tpl = FINDING_TEMPLATES.find(t => t.id === templateId)
    if (!tpl) return
    updateCard(card.id, {
      card_type: tpl.card_type,
      severity: tpl.severity,
      cwe_id: tpl.cwe_id,
      owasp_category: tpl.owasp_category,
      description: tpl.description,
      remediation: tpl.remediation,
      references: tpl.references,
    })
    setShowTemplates(false)
  }

  // ── General UI ─────────────────────────────────────────────────────────────
  if (!pentest) {
    return (
      <div className="space-y-4 p-4">
        {/* Card type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Tipo</label>
            <select
              value={card.card_type}
              onChange={e => update('card_type', e.target.value)}
              className="input text-xs py-1.5"
            >
              {GENERAL_CARD_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">Prioridade</label>
            <select
              value={card.severity || ''}
              onChange={e => update('severity', e.target.value || null)}
              className="input text-xs py-1.5"
            >
              <option value="">— Nenhuma —</option>
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-text-muted mb-1.5 block">Descrição</label>
          <textarea
            value={card.description || ''}
            onChange={e => update('description', e.target.value || null)}
            placeholder="O que precisa ser feito..."
            className="input text-sm resize-none h-32"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs text-text-muted mb-1.5 block">Tags</label>
          <TagInput
            tags={card.tags}
            onChange={tags => update('tags', tags)}
          />
        </div>

        <AttachmentSection card={card} />
      </div>
    )
  }

  // ── Pentest UI ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 p-4">
      {/* Finding templates */}
      <div className="relative">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="btn-ghost text-xs flex items-center gap-1.5 w-full border border-dashed border-border hover:border-accent"
        >
          <span>Aplicar Template de Finding</span>
          <ChevronDown size={12} className={showTemplates ? 'rotate-180' : ''} />
        </button>
        {showTemplates && (
          <div className="absolute left-0 right-0 top-10 z-10 bg-bg-elevated border border-border rounded-lg shadow-xl py-1 max-h-48 overflow-y-auto">
            {FINDING_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-bg-overlay transition-colors text-left"
              >
                <SeverityBadge severity={t.severity} size="sm" />
                <span className="text-text-primary">{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Type & Severity */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted mb-1.5 block">Card Type</label>
          <select
            value={card.card_type}
            onChange={e => update('card_type', e.target.value)}
            className="input text-xs py-1.5"
          >
            {PENTEST_CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted mb-1.5 block">Severity</label>
          <select
            value={card.severity || ''}
            onChange={e => update('severity', e.target.value || null)}
            className="input text-xs py-1.5"
          >
            <option value="">— None —</option>
            {PENTEST_SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* CVSS */}
      {card.card_type === 'finding' && (
        <div>
          <button
            onClick={() => setShowCvss(!showCvss)}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors mb-2"
          >
            <ChevronDown size={12} className={showCvss ? 'rotate-180' : ''} />
            CVSS Calculator
            {card.cvss_score !== null && (
              <span className="font-mono text-severity-high ml-1">{card.cvss_score.toFixed(1)}</span>
            )}
          </button>
          {showCvss && (
            <CvssCalculator
              initialVector={card.cvss_vector}
              onChange={(score, vector) => updateCard(card.id, { cvss_score: score, cvss_vector: vector })}
            />
          )}
        </div>
      )}

      {/* CWE & OWASP */}
      {card.card_type === 'finding' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">CWE ID</label>
            <input
              value={card.cwe_id || ''}
              onChange={e => update('cwe_id', e.target.value || null)}
              placeholder="CWE-89"
              className="input text-xs py-1.5 font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-text-muted mb-1.5 block">OWASP Category</label>
            <select
              value={card.owasp_category || ''}
              onChange={e => update('owasp_category', e.target.value || null)}
              className="input text-xs py-1.5"
            >
              <option value="">— Select —</option>
              {OWASP.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Affected URL & Param */}
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">Affected URL</label>
        <input
          value={card.affected_url || ''}
          onChange={e => update('affected_url', e.target.value || null)}
          placeholder="https://target.com/api/endpoint"
          className="input text-xs py-1.5 font-mono"
        />
      </div>
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">Affected Parameter</label>
        <input
          value={card.affected_parameter || ''}
          onChange={e => update('affected_parameter', e.target.value || null)}
          placeholder="id, user, token..."
          className="input text-xs py-1.5 font-mono"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">Description</label>
        <textarea
          value={card.description || ''}
          onChange={e => update('description', e.target.value || null)}
          placeholder="Describe the finding..."
          className="input text-sm resize-none h-28"
        />
      </div>

      {/* Remediation */}
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">Remediation</label>
        <textarea
          value={card.remediation || ''}
          onChange={e => update('remediation', e.target.value || null)}
          placeholder="How to fix..."
          className="input text-sm resize-none h-24"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">Tags</label>
        <TagInput
          tags={card.tags}
          onChange={tags => update('tags', tags)}
        />
      </div>

      <AttachmentSection card={card} />
    </div>
  )
}
