import { create } from 'zustand'

interface UserProfile {
  id: string
  name: string
  avatar: string
}

type VisualTheme = 'galaxy' | 'simple'

const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  name: 'You',
  avatar: '🙂',
}

function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE
  try {
    const raw = window.localStorage.getItem('pentboard.profile')
    if (!raw) return DEFAULT_PROFILE
    const parsed = JSON.parse(raw) as Partial<UserProfile>
    if (!parsed?.id || !parsed?.name || !parsed?.avatar) return DEFAULT_PROFILE
    return { id: parsed.id, name: parsed.name, avatar: parsed.avatar }
  } catch {
    return DEFAULT_PROFILE
  }
}

function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('pentboard.profile', JSON.stringify(profile))
}

function loadTheme(): VisualTheme {
  if (typeof window === 'undefined') return 'galaxy'
  const raw = window.localStorage.getItem('pentboard.theme')
  return raw === 'simple' ? 'simple' : 'galaxy'
}

function saveTheme(theme: VisualTheme): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem('pentboard.theme', theme)
}

interface UiStore {
  view: 'dashboard' | 'board'
  selectedCardId: string | null
  commandPaletteOpen: boolean
  newProjectModalOpen: boolean
  newCardColumnId: string | null
  quickCreateOnEmptyClick: boolean
  profile: UserProfile
  visualTheme: VisualTheme
  filterSeverity: string[]
  filterType: string[]
  searchQuery: string
  setView: (v: 'dashboard' | 'board') => void
  selectCard: (id: string | null) => void
  setCommandPalette: (open: boolean) => void
  setNewProjectModal: (open: boolean) => void
  setNewCardColumn: (columnId: string | null) => void
  setQuickCreateOnEmptyClick: (enabled: boolean) => void
  setProfileName: (name: string) => void
  setProfileAvatar: (avatar: string) => void
  setVisualTheme: (theme: VisualTheme) => void
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
  quickCreateOnEmptyClick: true,
  profile: loadProfile(),
  visualTheme: loadTheme(),
  filterSeverity: [],
  filterType: [],
  searchQuery: '',

  setView: (view) => set({ view }),
  selectCard: (id) => set({ selectedCardId: id }),
  setCommandPalette: (open) => set({ commandPaletteOpen: open }),
  setNewProjectModal: (open) => set({ newProjectModalOpen: open }),
  setNewCardColumn: (columnId) => set({ newCardColumnId: columnId }),
  setQuickCreateOnEmptyClick: (quickCreateOnEmptyClick) => set({ quickCreateOnEmptyClick }),
  setProfileName: (name) => set((state) => {
    const profile = { ...state.profile, name: name.trim() || 'You' }
    saveProfile(profile)
    return { profile }
  }),
  setProfileAvatar: (avatar) => set((state) => {
    const profile = { ...state.profile, avatar }
    saveProfile(profile)
    return { profile }
  }),
  setVisualTheme: (visualTheme) => set(() => {
    saveTheme(visualTheme)
    return { visualTheme }
  }),
  setFilterSeverity: (filterSeverity) => set({ filterSeverity }),
  setFilterType: (filterType) => set({ filterType }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
