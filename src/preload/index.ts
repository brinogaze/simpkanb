import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Projects
  projects: {
    getAll: () => ipcRenderer.invoke('projects:getAll'),
    create: (data: unknown) => ipcRenderer.invoke('projects:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('projects:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('projects:delete', id),
  },
  // Columns
  columns: {
    getByProject: (projectId: string) => ipcRenderer.invoke('columns:getByProject', projectId),
    create: (data: unknown) => ipcRenderer.invoke('columns:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('columns:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('columns:delete', id),
    reorder: (projectId: string, ids: string[]) => ipcRenderer.invoke('columns:reorder', projectId, ids),
  },
  // Cards
  cards: {
    getByProject: (projectId: string) => ipcRenderer.invoke('cards:getByProject', projectId),
    create: (data: unknown) => ipcRenderer.invoke('cards:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('cards:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('cards:delete', id),
    move: (id: string, columnId: string, position: number) =>
      ipcRenderer.invoke('cards:move', id, columnId, position),
  },
})
