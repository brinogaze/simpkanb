import React from 'react'
import type { Card, CardAttachment } from '../../types'
import { useBoardStore } from '../../stores/boardStore'
import { Paperclip, Download, X } from 'lucide-react'

const MAX_ATTACHMENT_SIZE = 3 * 1024 * 1024

function isTextFile(file: File): boolean {
  if (file.type.startsWith('text/')) return true
  const lower = file.name.toLowerCase()
  return lower.endsWith('.md') || lower.endsWith('.txt') || lower.endsWith('.json')
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface Props {
  card: Card
}

export function AttachmentSection({ card }: Props) {
  const { updateCard } = useBoardStore()

  const handleAttach = async (files: FileList | null) => {
    if (!files?.length) return
    const next: CardAttachment[] = [...card.attachments]

    for (const file of Array.from(files)) {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        alert(`Arquivo muito grande: ${file.name} (max ${formatSize(MAX_ATTACHMENT_SIZE)})`)
        continue
      }

      const kind: CardAttachment['kind'] = file.type.startsWith('image/')
        ? 'image'
        : isTextFile(file) ? 'text' : 'file'

      const data_url = await readAsDataUrl(file)
      const preview_text = kind === 'text' ? (await readAsText(file)).slice(0, 400) : undefined

      next.push({
        id: crypto.randomUUID(),
        name: file.name,
        mime: file.type || 'application/octet-stream',
        size: file.size,
        kind,
        data_url,
        preview_text,
        created_at: new Date().toISOString(),
      })
    }

    await updateCard(card.id, { attachments: next })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-text-muted block">Attachments</label>
        <label className="btn-secondary text-xs px-2.5 py-1 cursor-pointer inline-flex items-center gap-1.5">
          <Paperclip size={12} />
          Attach files
          <input
            type="file"
            multiple
            className="hidden"
            onChange={e => {
              handleAttach(e.target.files)
              e.currentTarget.value = ''
            }}
          />
        </label>
      </div>

      {card.attachments.length === 0 ? (
        <div className="text-xs text-text-muted border border-dashed border-border rounded-lg p-3">
          Add image, markdown, txt or other useful files.
        </div>
      ) : (
        <div className="space-y-2">
          {card.attachments.map(att => (
            <div key={att.id} className="border border-border rounded-lg bg-bg-elevated overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <Paperclip size={12} className="text-text-muted flex-shrink-0" />
                <span className="text-xs text-text-primary truncate flex-1">{att.name}</span>
                <span className="text-[10px] text-text-muted font-mono">{formatSize(att.size)}</span>
                <a
                  href={att.data_url}
                  download={att.name}
                  onClick={e => e.stopPropagation()}
                  className="btn-ghost p-1"
                  title="Download"
                >
                  <Download size={12} />
                </a>
                <button
                  onClick={() => updateCard(card.id, { attachments: card.attachments.filter(a => a.id !== att.id) })}
                  className="btn-ghost p-1 text-text-muted hover:text-severity-critical"
                  title="Remove"
                >
                  <X size={12} />
                </button>
              </div>

              {att.kind === 'image' && (
                <div className="p-2">
                  <img src={att.data_url} alt={att.name} className="max-h-40 rounded border border-border object-cover" />
                </div>
              )}

              {att.kind === 'text' && (
                <pre className="p-3 text-xs text-text-secondary font-mono whitespace-pre-wrap break-words max-h-40 overflow-auto">
                  {att.preview_text || '(empty file)'}
                </pre>
              )}

              {att.kind === 'file' && (
                <div className="p-3 text-xs text-text-muted">
                  Preview not available for this format.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
