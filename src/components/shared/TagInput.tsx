import React, { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...' }: Props) {
  const [input, setInput] = useState('')

  const add = () => {
    const val = input.trim().toLowerCase()
    if (val && !tags.includes(val)) {
      onChange([...tags, val])
    }
    setInput('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 bg-bg-elevated border border-border rounded-md min-h-[38px] focus-within:border-accent transition-colors">
      {tags.map(t => (
        <span key={t} className="inline-flex items-center gap-1 bg-bg-overlay border border-border rounded px-2 py-0.5 text-xs text-text-secondary font-mono">
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-text-primary">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
      />
    </div>
  )
}
