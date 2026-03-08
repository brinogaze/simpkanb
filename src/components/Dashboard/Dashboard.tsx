import React, { useEffect } from 'react'
import { Plus, Shield } from 'lucide-react'
import { useProjectStore } from '../../stores/projectStore'
import { useBoardStore } from '../../stores/boardStore'
import { useUiStore } from '../../stores/uiStore'
import { ProjectCard } from './ProjectCard'
import { NewProjectModal } from './NewProjectModal'

export function Dashboard() {
  const { projects, loadProjects, setActiveProject, deleteProject } = useProjectStore()
  const { loadBoard, cards } = useBoardStore()
  const { setView, setNewProjectModal, newProjectModalOpen } = useUiStore()

  useEffect(() => { loadProjects() }, [])

  const openProject = async (id: string) => {
    setActiveProject(id)
    await loadBoard(id)
    setView('board')
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete project "${name}"? This cannot be undone.`)) {
      await deleteProject(id)
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      {newProjectModalOpen && <NewProjectModal />}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-accent" />
            <div>
              <h1 className="text-xl font-semibold text-text-primary">PentBoard</h1>
              <p className="text-xs text-text-muted">Engagements</p>
            </div>
          </div>
          <button onClick={() => setNewProjectModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            New Engagement
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Shield size={48} className="text-border mb-4" />
            <h2 className="text-lg font-medium text-text-secondary mb-2">No engagements yet</h2>
            <p className="text-sm text-text-muted mb-6">Create your first pentest project to get started</p>
            <button onClick={() => setNewProjectModal(true)} className="btn-primary flex items-center gap-2">
              <Plus size={16} />
              New Engagement
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                cards={cards.filter(c => c.project_id === project.id)}
                onClick={() => openProject(project.id)}
                onDelete={() => handleDelete(project.id, project.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
