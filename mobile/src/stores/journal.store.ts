import { create } from 'zustand'
import { api, safeRequest } from '../lib/api'
import { JournalTemplate } from '../types/JournalTemplate'

export type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  template_id?: string | null
}


interface JournalStore {
  journalEntries: JournalEntry[]
  totalEntries: number
  monthlyEntries: number
  journalTemplates: JournalTemplate[]
  selectedTemplate: JournalTemplate | null
  fetchJournalEntries: () => Promise<void>
  fetchTotalEntries: () => Promise<void>
  fetchMonthlyEntries: () => Promise<void>
  fetchJournalTemplates: () => Promise<void>
  fetchJournalTemplate: (templateId: string) => Promise<JournalTemplate | null>
  setSelectedTemplate: (template: JournalTemplate | null) => void
  addJournalEntry: (newEntry: { content: string; template_id: string | null }) => Promise<JournalEntry | null>
}

export const useJournalStore = create<JournalStore>((set) => ({
  journalEntries: [],
  totalEntries: 0,
  monthlyEntries: 0,
  journalTemplates: [],
  selectedTemplate: null,

  fetchJournalEntries: async () => {
    const response = await safeRequest(api.get<{ entries: JournalEntry[] }>('/journal'))
    if (response.ok) {
      set({ journalEntries: response.data.entries })
    } else {
      set({ journalEntries: [] })
    }
  },

  fetchTotalEntries: async () => {
    const response = await safeRequest(api.get<{ totalEntries: number }>('/journal/total-entries'))
    if (response.ok) {
      set({ totalEntries: response.data.totalEntries })
    } else {
      set({ totalEntries: 0 })
    }
  },

  fetchMonthlyEntries: async () => {
    const response = await safeRequest(api.get<{ totalMonthlyEntries: number }>('/journal/total-monthly-entries'))
    if (response.ok) {
      set({ monthlyEntries: response.data.totalMonthlyEntries })
    } else {
      set({ monthlyEntries: 0 })
    }
  },

  fetchJournalTemplates: async () => {
    const response = await safeRequest(api.get<JournalTemplate[]>('/journal-template'))
    if (response.ok && Array.isArray(response.data)) {
      set({ journalTemplates: response.data })
    } else {
      set({ journalTemplates: [] })
    }
  },

  fetchJournalTemplate: async (templateId: string) => {
    const response = await safeRequest(api.get<JournalTemplate>(`/journal-template/${templateId}`))
    if (response.ok) {
      return response.data
    } else {
      return null
    }
  },

  setSelectedTemplate: (template: JournalTemplate | null) => {
    set({ selectedTemplate: template })
  },

  addJournalEntry: async (newEntry) => {
    const response = await safeRequest(api.post<{ entry: JournalEntry }>('/journal', {
      content: newEntry.content,
      entry_date: new Date().toISOString(),
      template_id: newEntry.template_id,
    }))
    if (response.ok) {
      return response.data.entry
    } else {
      return null
    }
  },
}))

