export {}

declare global {
  interface Window {
    api: {
      projects: {
        getAll: () => Promise<unknown[]>
        create: (data: unknown) => Promise<unknown>
        update: (id: string, data: unknown) => Promise<unknown>
        delete: (id: string) => Promise<{ success: boolean }>
      }
      columns: {
        getByProject: (projectId: string) => Promise<unknown[]>
        create: (data: unknown) => Promise<unknown>
        update: (id: string, data: unknown) => Promise<unknown>
        delete: (id: string) => Promise<{ success: boolean }>
        reorder: (projectId: string, ids: string[]) => Promise<unknown[]>
      }
      cards: {
        getByProject: (projectId: string) => Promise<unknown[]>
        create: (data: unknown) => Promise<unknown>
        update: (id: string, data: unknown) => Promise<unknown>
        delete: (id: string) => Promise<{ success: boolean }>
        move: (id: string, columnId: string, position: number) => Promise<unknown>
      }
    }
  }
}
