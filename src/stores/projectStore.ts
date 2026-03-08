import { create } from 'zustand'
import type { Project } from '../types'

interface ProjectStore {
  projects: Project[]
  activeProjectId: string | null
  loading: boolean
  loadProjects: () => Promise<void>
  setActiveProject: (id: string | null) => void
  createProject: (data: Partial<Project>) => Promise<Project>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
}

function parseProject(row: Project): Project {
  return {
    ...row,
    scope: typeof row.scope === 'string' ? JSON.parse(row.scope as unknown as string) : row.scope,
  }
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  loading: false,

  loadProjects: async () => {
    set({ loading: true })
    const rows = await window.api.projects.getAll()
    set({ projects: rows.map(parseProject), loading: false })
  },

  setActiveProject: (id) => set({ activeProjectId: id }),

  createProject: async (data) => {
    const row = await window.api.projects.create(data)
    const project = parseProject(row as Project)
    set(s => ({ projects: [project, ...s.projects] }))
    return project
  },

  updateProject: async (id, data) => {
    const row = await window.api.projects.update(id, data)
    const updated = parseProject(row as Project)
    set(s => ({ projects: s.projects.map(p => p.id === id ? updated : p) }))
  },

  deleteProject: async (id) => {
    await window.api.projects.delete(id)
    set(s => ({
      projects: s.projects.filter(p => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    }))
  },
}))
