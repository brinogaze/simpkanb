import React, { useState } from 'react'
import type { Card } from '../../../types'
import { useBoardStore } from '../../../stores/boardStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Eye, Edit3, Plus, X } from 'lucide-react'
import { AttachmentSection } from '../AttachmentSection'

interface Props { card: Card }

function MarkdownEditor({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [preview, setPreview] = useState(false)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-bg-overlay border-b border-border">
        <div className="flex gap-1">
          <button onClick={() => setPreview(false)} className={`btn-ghost text-xs py-0.5 ${!preview ? 'text-text-primary bg-bg-elevated' : ''}`}>
            <Edit3 size={11} className="inline mr-1" />Edit
          </button>
          <button onClick={() => setPreview(true)} className={`btn-ghost text-xs py-0.5 ${preview ? 'text-text-primary bg-bg-elevated' : ''}`}>
            <Eye size={11} className="inline mr-1" />Preview
          </button>
        </div>
        <span className="text-[10px] text-text-muted">Markdown</span>
      </div>
      {preview ? (
        <div className="p-3 prose prose-invert prose-sm max-w-none min-h-[120px] text-text-primary">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-text-muted italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent p-3 text-sm text-text-primary font-mono placeholder-text-muted focus:outline-none resize-none min-h-[120px]"
        />
      )}
    </div>
  )
}

export function EvidenceTab({ card }: Props) {
  const { updateCard } = useBoardStore()
  const [newRef, setNewRef] = useState('')

  const update = (field: string, value: unknown) =>
    updateCard(card.id, { [field]: value } as Partial<Card>)

  const addRef = () => {
    const val = newRef.trim()
    if (val && !card.references.includes(val)) {
      update('references', [...card.references, val])
      setNewRef('')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="text-xs text-text-muted mb-1.5 block">Proof of Concept</label>
        <MarkdownEditor
          value={card.proof_of_concept || ''}
          onChange={v => update('proof_of_concept', v || null)}
          placeholder={`# Proof of Concept\n\n## Steps to Reproduce\n1. ...\n\n## Payload\n\`\`\`\nINJECT_HERE\n\`\`\`\n\n## Response\n...`}
        />
      </div>

      <div>
        <label className="text-xs text-text-muted mb-1.5 block">Technical Notes</label>
        <MarkdownEditor
          value={card.description || ''}
          onChange={v => update('description', v || null)}
          placeholder="Additional technical context..."
        />
      </div>

      <div>
        <label className="text-xs text-text-muted mb-2 block">References</label>
        <div className="space-y-1 mb-2">
          {card.references.map((ref, i) => (
            <div key={i} className="flex items-center gap-2 bg-bg-elevated border border-border rounded px-3 py-1.5">
              <span className="flex-1 text-xs font-mono text-accent truncate">{ref}</span>
              <a
                href={ref}
                target="_blank"
                rel="noreferrer noopener"
                onClick={e => e.stopPropagation()}
                className="text-[10px] text-accent underline decoration-dotted"
              >
                abrir
              </a>
              <button
                onClick={() => update('references', card.references.filter((_, j) => j !== i))}
                className="text-text-muted hover:text-severity-critical"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newRef}
            onChange={e => setNewRef(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addRef() }}
            placeholder="https://owasp.org/..."
            className="input text-xs py-1.5 font-mono flex-1"
          />
          <button onClick={addRef} className="btn-secondary text-xs px-3">
            <Plus size={13} />
          </button>
        </div>
      </div>

      <AttachmentSection card={card} />
    </div>
  )
}
