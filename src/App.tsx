import React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Dashboard } from './components/Dashboard/Dashboard'
import { KanbanBoard } from './components/Board/KanbanBoard'
import { CommandPalette } from './components/CommandPalette/CommandPalette'
import { Sidebar } from './components/Sidebar/Sidebar'
import { GalaxyBackground } from './components/shared/GalaxyBackground'
import { useUiStore } from './stores/uiStore'

export default function App() {
  const { view, commandPaletteOpen, selectedCardId, setCommandPalette, visualTheme } = useUiStore()

  useHotkeys('ctrl+k, meta+k', (e) => {
    e.preventDefault()
    setCommandPalette(!commandPaletteOpen)
  })

  useHotkeys('escape', () => {
    if (commandPaletteOpen) setCommandPalette(false)
  })

  return (
    <div className={`relative isolate flex flex-col h-screen bg-bg-primary/70 overflow-hidden ${visualTheme === 'simple' ? 'theme-simple' : ''}`}>
      {visualTheme === 'galaxy' && <GalaxyBackground paused={Boolean(selectedCardId || commandPaletteOpen)} />}
      {/* Electron titlebar drag region */}
      <div className="relative z-10 h-8 titlebar flex-shrink-0 bg-bg-surface/70 border-b border-border backdrop-blur-xl flex items-center px-4">
        <div className="no-drag flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-severity-critical opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-severity-medium opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-severity-low opacity-60" />
        </div>
        <div className="flex-1 flex items-center justify-center no-drag">
          <span className="text-[11px] text-text-muted font-mono tracking-[0.18em] uppercase select-none">SimpKanb</span>
        </div>
        <div className="no-drag">
          <kbd
            onClick={() => setCommandPalette(true)}
            className="text-[10px] text-text-muted bg-bg-elevated/80 border border-border rounded-lg px-1.5 py-0.5 font-mono cursor-pointer hover:border-accent hover:text-accent transition-colors"
          >
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Main layout: sidebar + content */}
      <div className="relative z-10 flex-1 flex min-h-0">
        <Sidebar />

        <div className="flex-1 flex min-h-0 min-w-0">
          {view === 'dashboard' && <Dashboard />}
          {view === 'board' && <KanbanBoard />}
        </div>
      </div>

      {/* Overlays */}
      {commandPaletteOpen && <CommandPalette />}
    </div>
  )
}
