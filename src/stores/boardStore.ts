import { create } from 'zustand'
import type { Column, Card, ChecklistItem } from '../types'

function parseCard(row: Record<string, unknown>): Card {
  const refs = row.card_refs ?? row.references ?? []
  return {
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags as string) : (row.tags ?? []),
    references: typeof refs === 'string' ? JSON.parse(refs as string) : refs,
    attachments: typeof row.attachments === 'string' ? JSON.parse(row.attachments as string) : (row.attachments ?? []),
    checklist: typeof row.checklist === 'string' ? JSON.parse(row.checklist as string) : (row.checklist ?? []),
  } as Card
}

interface BoardStore {
  columns: Column[]
  cards: Card[]
  loading: boolean
  loadBoard: (projectId: string) => Promise<void>
  createColumn: (data: Partial<Column>) => Promise<void>
  updateColumn: (id: string, data: Partial<Column>) => Promise<void>
  deleteColumn: (id: string) => Promise<void>
  reorderColumns: (projectId: string, ids: string[]) => Promise<void>
  createCard: (data: Partial<Card>) => Promise<Card>
  updateCard: (id: string, data: Partial<Card>) => Promise<void>
  deleteCard: (id: string) => Promise<void>
  moveCard: (id: string, columnId: string, position: number) => Promise<void>
  updateChecklist: (cardId: string, checklist: ChecklistItem[]) => Promise<void>
}

export const useBoardStore = create<BoardStore>((set, get) => ({
  columns: [],
  cards: [],
  loading: false,

  loadBoard: async (projectId) => {
    set({ loading: true })
    const [cols, rows] = await Promise.all([
      window.api.columns.getByProject(projectId),
      window.api.cards.getByProject(projectId),
    ])
    set({
      columns: cols as Column[],
      cards: (rows as Record<string, unknown>[]).map(parseCard),
      loading: false,
    })
  },

  createColumn: async (data) => {
    const col = await window.api.columns.create(data)
    set(s => ({ columns: [...s.columns, col as Column].sort((a, b) => a.position - b.position) }))
  },

  updateColumn: async (id, data) => {
    const col = await window.api.columns.update(id, data)
    set(s => ({ columns: s.columns.map(c => c.id === id ? col as Column : c) }))
  },

  deleteColumn: async (id) => {
    await window.api.columns.delete(id)
    set(s => ({
      columns: s.columns.filter(c => c.id !== id),
      cards: s.cards.filter(c => c.column_id !== id),
    }))
  },

  reorderColumns: async (projectId, ids) => {
    const cols = await window.api.columns.reorder(projectId, ids)
    set({ columns: cols as Column[] })
  },

  createCard: async (data) => {
    const row = await window.api.cards.create(data)
    const card = parseCard(row as Record<string, unknown>)
    set(s => ({ cards: [...s.cards, card] }))
    return card
  },

  updateCard: async (id, data) => {
    const row = await window.api.cards.update(id, data)
    const card = parseCard(row as Record<string, unknown>)
    set(s => ({ cards: s.cards.map(c => c.id === id ? card : c) }))
  },

  deleteCard: async (id) => {
    await window.api.cards.delete(id)
    set(s => ({ cards: s.cards.filter(c => c.id !== id) }))
  },

  moveCard: async (id, columnId, position) => {
    await window.api.cards.move(id, columnId, position)
    set(s => ({
      cards: s.cards.map(c =>
        c.id === id ? { ...c, column_id: columnId, position } : c
      ),
    }))
  },

  updateChecklist: async (cardId, checklist) => {
    await get().updateCard(cardId, { checklist })
  },
}))
