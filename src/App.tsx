import React, { useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Dashboard } from './components/Dashboard/Dashboard'
import { KanbanBoard } from './components/Board/KanbanBoard'
import { CommandPalette } from './components/CommandPalette/CommandPalette'
import { useUiStore } from './stores/uiStore'

export default function App() {
  const { view, commandPaletteOpen, setCommandPalette } = useUiStore()

  useHotkeys('ctrl+k, meta+k', (e) => {
    e.preventDefault()
    setCommandPalette(!commandPaletteOpen)
  })

  useHotkeys('escape', () => {
    if (commandPaletteOpen) setCommandPalette(false)
  })

  return (
    <div className="flex flex-col h-screen bg-bg-primary overflow-hidden">
      {/* Titlebar spacer for electron */}
      <div className="h-9 titlebar flex-shrink-0 bg-bg-surface border-b border-border flex items-center px-4">
        <div className="no-drag flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-severity-critical opacity-70" />
          <div className="w-3 h-3 rounded-full bg-severity-medium opacity-70" />
          <div className="w-3 h-3 rounded-full bg-severity-low opacity-70" />
        </div>
        <div className="flex-1 flex items-center justify-center no-drag">
          <span className="text-xs text-text-muted font-mono">PentBoard</span>
        </div>
        <div className="no-drag">
          <kbd
            onClick={() => setCommandPalette(true)}
            className="text-[10px] text-text-muted bg-bg-elevated border border-border rounded px-1.5 py-0.5 font-mono cursor-pointer hover:border-accent hover:text-accent transition-colors"
          >
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {view === 'dashboard' && <Dashboard />}
        {view === 'board' && <KanbanBoard />}
      </div>

      {/* Overlays */}
      {commandPaletteOpen && <CommandPalette />}
    </div>
  )
}
