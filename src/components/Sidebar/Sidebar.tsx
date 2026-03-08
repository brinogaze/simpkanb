import React, { useState, useEffect } from 'react'
import {
  LayoutGrid, Calendar, Archive,
  Layers, FolderOpen, ChevronDown, ChevronRight,
  Shield, Search, Trash2,
} from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import { useBoardStore } from '../../stores/boardStore'

export function Sidebar() {
  const { projects, activeProjectId, setActiveProject, deleteProject } = useProjectStore()
  const {
    view, setView, quickCreateOnEmptyClick, setQuickCreateOnEmptyClick,
    profile, setProfileName, setProfileAvatar, visualTheme, setVisualTheme,
  } = useUiStore()
  const { loadBoard } = useBoardStore()
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(activeProjectId ? [activeProjectId] : [])
  )

  // Auto-expand the active project when it changes
  useEffect(() => {
    if (activeProjectId) {
      setExpandedProjects(prev => new Set([...prev, activeProjectId]))
    }
  }, [activeProjectId])

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const openBoard = async (projectId: string) => {
    setActiveProject(projectId)
    await loadBoard(projectId)
    setView('board')
  }

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Delete board "${projectName}"? This cannot be undone.`)) return
    await deleteProject(projectId)
    if (activeProjectId === projectId) setView('dashboard')
  }

  return (
    <div className="w-60 flex-shrink-0 bg-bg-surface/55 border-r border-border flex flex-col h-full overflow-hidden backdrop-blur-xl">
      {/* Logo / workspace */}
      <div className="px-3 py-3 flex items-center gap-2 border-b border-border flex-shrink-0">
        <Shield size={15} className="text-accent flex-shrink-0" />
        <span className="font-semibold text-sm text-text-primary tracking-wide truncate">SimpKanb</span>
        <ChevronDown size={11} className="text-text-muted ml-auto flex-shrink-0" />
      </div>

      {/* Search shortcut */}
      <div className="px-2 pt-2 pb-1 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-text-muted text-xs hover:bg-bg-elevated cursor-pointer transition-colors">
          <Search size={12} />
          <span>Search...</span>
          <span className="ml-auto text-[10px] bg-bg-overlay border border-border rounded px-1 font-mono leading-none py-0.5">
            /
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
        {/* Boards section */}
        <div className="pt-3 pb-1 px-2 text-[11px] font-medium text-text-muted uppercase tracking-wider">
          Boards
        </div>

        {projects.map(project => (
          <div key={project.id}>
            {/* Project row */}
            <div className="group relative">
              <button
                onClick={() => toggleProject(project.id)}
                className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-xs text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
              >
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate flex-1 text-left font-medium pr-6">{project.name}</span>
                {expandedProjects.has(project.id)
                  ? <ChevronDown size={11} className="flex-shrink-0 text-text-muted" />
                  : <ChevronRight size={11} className="flex-shrink-0 text-text-muted" />
                }
              </button>
              <button
                onClick={e => {
                  e.stopPropagation()
                  handleDeleteProject(project.id, project.name)
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 btn-ghost p-1 text-text-muted hover:text-severity-critical transition-opacity"
                title="Delete board"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Project sub-items */}
            {expandedProjects.has(project.id) && (
              <div className="ml-3 border-l border-border pl-2 mt-0.5 space-y-0.5 mb-1">
                <SubNavItem label="Issues" />
                <SubNavItem
                  icon={<LayoutGrid size={11} />}
                  label="Board"
                  active={view === 'board' && activeProjectId === project.id}
                  onClick={() => openBoard(project.id)}
                />
                <SubNavItem icon={<Calendar size={11} />} label="Calendar" />
                <SubNavItem icon={<Archive size={11} />} label="Backlog" />
                <SubNavItem icon={<Layers size={11} />} label="Sprints" />
              </div>
            )}
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-border my-2" />

        <NavItem
          icon={<FolderOpen size={14} />}
          label="Projects"
          active={view === 'dashboard'}
          onClick={() => { setActiveProject(null); setView('dashboard') }}
        />
      </nav>

      {/* Version */}
      <div className="px-4 py-2 border-t border-border flex-shrink-0">
        <div className="mb-2 p-2 rounded-md border border-border bg-bg-elevated">
          <div className="text-[10px] uppercase tracking-[0.16em] text-text-muted mb-1">Perfil</div>
          <input
            value={profile.name}
            onChange={e => setProfileName(e.target.value)}
            className="input text-xs py-1 px-2 mb-2"
            placeholder="Seu nome"
          />
          <div className="flex items-center gap-1.5">
            {['🙂', '😎', '🧠', '🛡️', '🔥', '🚀'].map(a => (
              <button
                key={a}
                type="button"
                onClick={() => setProfileAvatar(a)}
                className={`w-6 h-6 rounded-full border text-xs transition-colors ${profile.avatar === a ? 'border-accent bg-accent/20' : 'border-border'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-2 p-2 rounded-md border border-border bg-bg-elevated">
          <div className="text-[10px] uppercase tracking-[0.16em] text-text-muted mb-1">Tema</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setVisualTheme('galaxy')}
              className={`text-[11px] rounded-md border px-2 py-1 transition-colors ${
                visualTheme === 'galaxy'
                  ? 'border-accent bg-accent/15 text-text-primary'
                  : 'border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Galaxia
            </button>
            <button
              type="button"
              onClick={() => setVisualTheme('simple')}
              className={`text-[11px] rounded-md border px-2 py-1 transition-colors ${
                visualTheme === 'simple'
                  ? 'border-accent bg-accent/15 text-text-primary'
                  : 'border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              Simples
            </button>
          </div>
        </div>
        <label className="flex items-center justify-between gap-2 text-[11px] text-text-secondary mb-2 cursor-pointer">
          <span className="truncate">Click vazio cria card</span>
          <input
            type="checkbox"
            checked={quickCreateOnEmptyClick}
            onChange={e => setQuickCreateOnEmptyClick(e.target.checked)}
            className="accent-accent"
          />
        </label>
        <span className="text-[10px] text-text-muted font-mono">v1.00-20-002-03</span>
      </div>
    </div>
  )
}

interface NavItemProps {
  icon?: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
}

function NavItem({ icon, label, onClick, active }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs transition-colors ${
        active
          ? 'bg-accent/10 text-accent font-medium'
          : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function SubNavItem({ icon, label, onClick, active }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 w-full px-2 py-1 rounded-md text-[11px] transition-colors ${
        active
          ? 'bg-accent/10 text-accent font-medium'
          : 'text-text-muted hover:bg-bg-elevated hover:text-text-secondary'
      }`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
