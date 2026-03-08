import React, { useState, KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { parseTag, encodeTag } from '../../utils/tags'

const TAG_COLORS = ['#58a6ff', '#3fb950', '#f78166', '#d2a8ff', '#ffa657', '#79c0ff']

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...' }: Props) {
  const [input, setInput] = useState('')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const add = () => {
    const val = input.trim().toLowerCase()
    if (val) {
      const exists = tags.some(t => parseTag(t).label === val)
      if (!exists) onChange([...tags, encodeTag(val, selectedColor)])
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
      {tags.map(t => {
        const parsed = parseTag(t)
        return (
          <span
            key={t}
            className="inline-flex items-center gap-1 border rounded px-2 py-0.5 text-xs text-text-secondary font-mono"
            style={{
              backgroundColor: parsed.color ? `${parsed.color}22` : undefined,
              borderColor: parsed.color || undefined,
            }}
          >
            {parsed.label}
            <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-text-primary">
              <X size={10} />
            </button>
          </span>
        )
      })}
      <div className="inline-flex items-center gap-1.5 mr-1">
        {TAG_COLORS.map(color => (
          <button
            key={color}
            type="button"
            title={`Tag color ${color}`}
            onClick={() => setSelectedColor(selectedColor === color ? null : color)}
            className={`w-3.5 h-3.5 rounded-full border transition-transform ${selectedColor === color ? 'scale-110' : ''}`}
            style={{ backgroundColor: color, borderColor: selectedColor === color ? '#e6edf3' : '#30363d' }}
          />
        ))}
      </div>
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
