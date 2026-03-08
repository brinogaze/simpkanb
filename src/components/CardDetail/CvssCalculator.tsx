import React, { useState, useEffect } from 'react'
import type { CvssMetrics } from '../../types'

const METRICS: {
  key: keyof CvssMetrics
  label: string
  options: { value: string; label: string; score: number }[]
}[] = [
  { key: 'AV', label: 'Attack Vector', options: [
    { value: 'N', label: 'Network', score: 0.85 },
    { value: 'A', label: 'Adjacent', score: 0.62 },
    { value: 'L', label: 'Local', score: 0.55 },
    { value: 'P', label: 'Physical', score: 0.20 },
  ]},
  { key: 'AC', label: 'Attack Complexity', options: [
    { value: 'L', label: 'Low', score: 0.77 },
    { value: 'H', label: 'High', score: 0.44 },
  ]},
  { key: 'PR', label: 'Privileges Required', options: [
    { value: 'N', label: 'None', score: 0.85 },
    { value: 'L', label: 'Low', score: 0.62 },
    { value: 'H', label: 'High', score: 0.27 },
  ]},
  { key: 'UI', label: 'User Interaction', options: [
    { value: 'N', label: 'None', score: 0.85 },
    { value: 'R', label: 'Required', score: 0.62 },
  ]},
  { key: 'S', label: 'Scope', options: [
    { value: 'U', label: 'Unchanged', score: 0 },
    { value: 'C', label: 'Changed', score: 1 },
  ]},
  { key: 'C', label: 'Confidentiality', options: [
    { value: 'H', label: 'High', score: 0.56 },
    { value: 'L', label: 'Low', score: 0.22 },
    { value: 'N', label: 'None', score: 0 },
  ]},
  { key: 'I', label: 'Integrity', options: [
    { value: 'H', label: 'High', score: 0.56 },
    { value: 'L', label: 'Low', score: 0.22 },
    { value: 'N', label: 'None', score: 0 },
  ]},
  { key: 'A', label: 'Availability', options: [
    { value: 'H', label: 'High', score: 0.56 },
    { value: 'L', label: 'Low', score: 0.22 },
    { value: 'N', label: 'None', score: 0 },
  ]},
]

function calcCvss(m: CvssMetrics): { score: number; vector: string } {
  const av = METRICS[0].options.find(o => o.value === m.AV)!.score
  const ac = METRICS[1].options.find(o => o.value === m.AC)!.score
  const pr = METRICS[2].options.find(o => o.value === m.PR)!.score
  const ui = METRICS[3].options.find(o => o.value === m.UI)!.score
  const scopeChanged = m.S === 'C'
  const c = METRICS[5].options.find(o => o.value === m.C)!.score
  const i = METRICS[6].options.find(o => o.value === m.I)!.score
  const a = METRICS[7].options.find(o => o.value === m.A)!.score

  const iss = 1 - (1 - c) * (1 - i) * (1 - a)
  const impact = scopeChanged
    ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15)
    : 6.42 * iss
  const exploitability = 8.22 * av * ac * pr * ui

  if (impact <= 0) return { score: 0, vector: buildVector(m) }

  const base = scopeChanged
    ? Math.min(1.08 * (impact + exploitability), 10)
    : Math.min(impact + exploitability, 10)

  return { score: Math.ceil(base * 10) / 10, vector: buildVector(m) }
}

function buildVector(m: CvssMetrics): string {
  return `CVSS:3.1/AV:${m.AV}/AC:${m.AC}/PR:${m.PR}/UI:${m.UI}/S:${m.S}/C:${m.C}/I:${m.I}/A:${m.A}`
}

function scoreColor(score: number): string {
  if (score >= 9.0) return 'text-severity-critical'
  if (score >= 7.0) return 'text-severity-high'
  if (score >= 4.0) return 'text-severity-medium'
  if (score > 0)    return 'text-severity-low'
  return 'text-text-muted'
}

interface Props {
  initialVector?: string | null
  onChange: (score: number, vector: string) => void
}

function defaultMetrics(): CvssMetrics {
  return { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'N', I: 'N', A: 'N' }
}

function parseVector(vector: string): CvssMetrics | null {
  try {
    const parts = vector.split('/')
    const m: Partial<CvssMetrics> = {}
    parts.slice(1).forEach(p => {
      const [k, v] = p.split(':')
      ;(m as Record<string, string>)[k] = v
    })
    return m as CvssMetrics
  } catch { return null }
}

export function CvssCalculator({ initialVector, onChange }: Props) {
  const [metrics, setMetrics] = useState<CvssMetrics>(() =>
    (initialVector && parseVector(initialVector)) || defaultMetrics()
  )

  const { score, vector } = calcCvss(metrics)

  useEffect(() => {
    onChange(score, vector)
  }, [score, vector])

  const set = (key: keyof CvssMetrics, value: string) => {
    setMetrics(m => ({ ...m, [key]: value }))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 bg-bg-primary rounded-lg border border-border">
        <div className="text-center">
          <div className={`text-3xl font-mono font-bold ${scoreColor(score)}`}>{score.toFixed(1)}</div>
          <div className="text-xs text-text-muted">CVSS 3.1</div>
        </div>
        <div className="flex-1">
          <code className="text-xs text-text-muted font-mono break-all">{vector}</code>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {METRICS.map(metric => (
          <div key={metric.key}>
            <label className="text-xs text-text-muted mb-1 block">{metric.label}</label>
            <div className="flex gap-1 flex-wrap">
              {metric.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set(metric.key, opt.value)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    metrics[metric.key] === opt.value
                      ? 'bg-accent text-bg-primary font-semibold'
                      : 'bg-bg-elevated border border-border text-text-secondary hover:border-border-emphasis'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
