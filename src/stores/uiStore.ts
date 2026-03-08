import { create } from 'zustand'

interface UiStore {
  view: 'dashboard' | 'board'
  selectedCardId: string | null
  commandPaletteOpen: boolean
  newProjectModalOpen: boolean
  newCardColumnId: string | null
  filterSeverity: string[]
  filterType: string[]
  searchQuery: string
  setView: (v: 'dashboard' | 'board') => void
  selectCard: (id: string | null) => void
  setCommandPalette: (open: boolean) => void
  setNewProjectModal: (open: boolean) => void
  setNewCardColumn: (columnId: string | null) => void
  setFilterSeverity: (s: string[]) => void
  setFilterType: (t: string[]) => void
  setSearchQuery: (q: string) => void
}

export const useUiStore = create<UiStore>((set) => ({
  view: 'dashboard',
  selectedCardId: null,
  commandPaletteOpen: false,
  newProjectModalOpen: false,
  newCardColumnId: null,
  filterSeverity: [],
  filterType: [],
  searchQuery: '',

  setView: (view) => set({ view }),
  selectCard: (id) => set({ selectedCardId: id }),
  setCommandPalette: (open) => set({ commandPaletteOpen: open }),
  setNewProjectModal: (open) => set({ newProjectModalOpen: open }),
  setNewCardColumn: (columnId) => set({ newCardColumnId: columnId }),
  setFilterSeverity: (filterSeverity) => set({ filterSeverity }),
  setFilterType: (filterType) => set({ filterType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
