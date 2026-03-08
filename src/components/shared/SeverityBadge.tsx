import React from 'react'
import type { Severity } from '../../types'

const PENTEST_CONFIG: Record<Severity, { label: string; cls: string }> = {
  critical: { label: 'Critical', cls: 'bg-severity-critical-bg text-severity-critical border-severity-critical/30' },
  high:     { label: 'High',     cls: 'bg-severity-high-bg text-severity-high border-severity-high/30' },
  medium:   { label: 'Medium',   cls: 'bg-severity-medium-bg text-severity-medium border-severity-medium/30' },
  low:      { label: 'Low',      cls: 'bg-severity-low-bg text-severity-low border-severity-low/30' },
  info:     { label: 'Info',     cls: 'bg-severity-info-bg text-severity-info border-severity-info/30' },
}

const PRIORITY_CONFIG: Record<Severity, { label: string; cls: string }> = {
  critical: { label: 'Urgente', cls: 'bg-severity-critical-bg text-severity-critical border-severity-critical/30' },
  high:     { label: 'Alta',    cls: 'bg-severity-high-bg text-severity-high border-severity-high/30' },
  medium:   { label: 'Normal',  cls: 'bg-severity-medium-bg text-severity-medium border-severity-medium/30' },
  low:      { label: 'Baixa',   cls: 'bg-severity-low-bg text-severity-low border-severity-low/30' },
  info:     { label: 'Info',    cls: 'bg-severity-info-bg text-severity-info border-severity-info/30' },
}

interface Props {
  severity: Severity | null
  size?: 'sm' | 'md'
  mode?: 'pentest' | 'priority'
}

export function SeverityBadge({ severity, size = 'md', mode = 'pentest' }: Props) {
  if (!severity) return null
  const config = mode === 'priority' ? PRIORITY_CONFIG : PENTEST_CONFIG
  const { label, cls } = config[severity]
  return (
    <span className={`inline-flex items-center border rounded font-mono font-medium uppercase tracking-wide ${cls} ${
      size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
    }`}>
      {label}
    </span>
  )
}

export function SeverityDot({ severity }: { severity: Severity | null }) {
  if (!severity) return null
  const colors: Record<Severity, string> = {
    critical: 'bg-severity-critical',
    high:     'bg-severity-high',
    medium:   'bg-severity-medium',
    low:      'bg-severity-low',
    info:     'bg-severity-info',
  }
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[severity]}`} />
}
