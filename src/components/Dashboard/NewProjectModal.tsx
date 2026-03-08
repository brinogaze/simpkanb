import React, { useState } from 'react'
import { Modal } from '../shared/Modal'
import { useProjectStore } from '../../stores/projectStore'
import { useUiStore } from '../../stores/uiStore'
import type { ProjectType } from '../../types'
import { isPentestProject } from '../../types'

const SECTIONS: {
  label: string
  types: { value: ProjectType; label: string; icon: string }[]
}[] = [
  {
    label: 'Segurança / Pentest',
    types: [
      { value: 'web',      label: 'Web Pentest', icon: '🌐' },
      { value: 'mobile',   label: 'Mobile',      icon: '📱' },
      { value: 'api',      label: 'API',         icon: '⚡' },
      { value: 'network',  label: 'Network',     icon: '🔌' },
      { value: 'cloud',    label: 'Cloud',       icon: '☁️' },
      { value: 'red_team', label: 'Red Team',    icon: '🎯' },
    ],
  },
  {
    label: 'Geral',
    types: [
      { value: 'personal', label: 'Pessoal',  icon: '🙋' },
      { value: 'gaming',   label: 'Gaming',   icon: '🎮' },
      { value: 'work',     label: 'Trabalho', icon: '💼' },
      { value: 'study',    label: 'Estudos',  icon: '📚' },
      { value: 'other',    label: 'Outro',    icon: '📋' },
    ],
  },
]

const COLORS = ['#58a6ff', '#f78166', '#3fb950', '#d2a8ff', '#ffa657', '#79c0ff', '#56d364']

export function NewProjectModal() {
  const { createProject, setActiveProject } = useProjectStore()
  const { setNewProjectModal, setView } = useUiStore()
  const [name, setName] = useState('')
  const [context, setContext] = useState('')
  const [type, setType] = useState<ProjectType>('personal')
  const [color, setColor] = useState(COLORS[0])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const isPentest = isPentestProject(type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const project = await createProject({
      name: name.trim(),
      client: context.trim() || null,
      type,
      color,
      description: description.trim() || null,
    })
    setActiveProject(project.id)
    setNewProjectModal(false)
    setView('board')
  }

  return (
    <Modal title="Novo Board" onClose={() => setNewProjectModal(false)} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-xs text-text-secondary mb-1.5">Nome *</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={isPentest ? 'Pentest – Cliente Corp' : 'Meu board...'}
            className="input"
            required
          />
        </div>

        {/* Category selector */}
        <div className="space-y-3">
          {SECTIONS.map(section => (
            <div key={section.label}>
              <p className="text-[10px] uppercase tracking-widest text-text-muted font-mono mb-1.5">
                {section.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {section.types.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                      type === t.value
                        ? 'border-accent bg-accent/10 text-text-primary'
                        : 'border-border bg-bg-elevated text-text-secondary hover:border-border-emphasis'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contextual label: Client for pentest, optional context for general */}
        <div>
          <label className="block text-xs text-text-secondary mb-1.5">
            {isPentest ? 'Cliente' : 'Contexto (opcional)'}
          </label>
          <input
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder={isPentest ? 'Nome do cliente' : 'ex: Final Fantasy XIV, Q1 2026...'}
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs text-text-secondary mb-2">Cor</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/30' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-secondary mb-1.5">Descrição</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={isPentest ? 'Escopo, objetivos...' : 'Sobre o que é este board...'}
            className="input resize-none h-16"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => setNewProjectModal(false)} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={!name.trim() || loading} className="btn-primary flex-1">
            {loading ? 'Criando...' : 'Criar Board'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
