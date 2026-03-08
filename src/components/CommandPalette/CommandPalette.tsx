import React, { useEffect, useState } from 'react'
import { useProjectStore } from '../../stores/projectStore'
import { useBoardStore } from '../../stores/boardStore'
import { useUiStore } from '../../stores/uiStore'
import { Search, FolderOpen, FileText, ArrowRight } from 'lucide-react'

interface Cmd {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
}

export function CommandPalette() {
  const [query, setQuery] = useState('')
  const { projects, setActiveProject, loadProjects } = useProjectStore()
  const { cards, loadBoard } = useBoardStore()
  const { setCommandPalette, setView, selectCard } = useUiStore()

  const close = () => setCommandPalette(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const q = query.toLowerCase()

  const projectCmds: Cmd[] = projects
    .filter(p => p.name.toLowerCase().includes(q) || (p.client || '').toLowerCase().includes(q))
    .map(p => ({
      id: `project:${p.id}`,
      label: p.name,
      description: p.client || undefined,
      icon: <FolderOpen size={14} className="text-accent" />,
      action: async () => {
        setActiveProject(p.id)
        await loadBoard(p.id)
        setView('board')
        close()
      },
    }))

  const cardCmds: Cmd[] = cards
    .filter(c => c.title.toLowerCase().includes(q) || (c.affected_url || '').toLowerCase().includes(q))
    .slice(0, 8)
    .map(c => ({
      id: `card:${c.id}`,
      label: c.title,
      description: c.affected_url || c.card_type,
      icon: <FileText size={14} className="text-text-muted" />,
      action: () => {
        selectCard(c.id)
        setView('board')
        close()
      },
    }))

  const allCmds = [...projectCmds, ...cardCmds].slice(0, 12)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-xl bg-bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={16} className="text-text-muted flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') close() }}
            placeholder="Search projects, cards, commands..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-muted outline-none"
          />
          <kbd className="text-xs text-text-muted bg-bg-elevated border border-border rounded px-1.5 py-0.5 font-mono">Esc</kbd>
        </div>

        {allCmds.length > 0 ? (
          <div className="max-h-80 overflow-y-auto py-1">
            {projectCmds.length > 0 && (
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-text-muted font-mono">Projects</div>
            )}
            {projectCmds.slice(0, 5).map(cmd => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-bg-elevated transition-colors text-left"
              >
                {cmd.icon}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">{cmd.label}</div>
                  {cmd.description && <div className="text-xs text-text-muted truncate">{cmd.description}</div>}
                </div>
                <ArrowRight size={12} className="text-text-muted flex-shrink-0" />
              </button>
            ))}

            {cardCmds.length > 0 && (
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-text-muted font-mono border-t border-border-muted mt-1">Cards</div>
            )}
            {cardCmds.map(cmd => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-bg-elevated transition-colors text-left"
              >
                {cmd.icon}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">{cmd.label}</div>
                  {cmd.description && <div className="text-xs text-text-muted font-mono truncate">{cmd.description}</div>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-text-muted">
            {query ? 'No results found' : 'Type to search...'}
          </div>
        )}
      </div>
    </div>
  )
}
