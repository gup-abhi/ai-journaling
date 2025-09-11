import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import type { JournalEntry, PaginationMeta, PaginatedJournalResponse } from '@/types/JournalEntry.type'
import toast from 'react-hot-toast'
import type { JournalTemplate } from '@/types/JournalTemplate.type'

interface JournalStore {
  journalEntries: JournalEntry[];
  totalEntries: number;
  monthlyEntries: number;
  journalTemplates: JournalTemplate[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  fetchJournalEntries: (page?: number, limit?: number) => Promise<void>;
  fetchPaginatedJournalEntries: (page?: number, limit?: number) => Promise<void>;
  fetchTotalEntries: () => Promise<void>;
  fetchMonthlyEntries: () => Promise<void>;
  fetchJournalTemplates: () => Promise<void>;
  addJournalEntry: (newEntry: { content: string, template_id: string | null }) => Promise<JournalEntry | null>;
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  journalEntries: [],
  totalEntries: 0,
  monthlyEntries: 0,
  journalTemplates: [],
  pagination: null,
  isLoading: false,

  fetchJournalEntries: async (page = 1, limit = 10) => {
    set({ isLoading: true })
    const response = await safeRequest(api.get<{ entries: JournalEntry[] }>(`/journal?page=${page}&limit=${limit}`))
    if (response.ok) {
      set({
        journalEntries: response.data.entries,
        isLoading: false
      })
    } else {
      set({
        journalEntries: [],
        isLoading: false
      })
    }
  },

  fetchPaginatedJournalEntries: async (page = 1, limit = 10) => {
    set({ isLoading: true })
    const response = await safeRequest(api.get<PaginatedJournalResponse>(`/journal/paginated?page=${page}&limit=${limit}`))
    if (response.ok) {
      set({
        journalEntries: response.data.entries,
        pagination: response.data.pagination,
        isLoading: false
      })
    } else {
      set({
        journalEntries: [],
        pagination: null,
        isLoading: false
      })
    }
  },

  fetchTotalEntries: async () => {
    const response = await safeRequest(api.get<{ totalEntries: number }>('/journal/total-entries'))
    if (response.ok) {
      set({ totalEntries: response.data.totalEntries });
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
    const response = await safeRequest(api.get<JournalTemplate[]>('/journal-template'));
    if (response.ok && Array.isArray(response.data)) {
      set({ journalTemplates: response.data });
    } else {
      set({ journalTemplates: [] });
    }
  },

  addJournalEntry: async (newEntry: { content: string, template_id: string | null }) => {
    const response = await safeRequest(api.post<{ entry: JournalEntry }>('/journal', {
      content: newEntry.content,
      entry_date: new Date().toISOString(),
      template_id: newEntry.template_id
    }))
    if (response.ok) {
      toast.success('Journal entry added successfully')
      return response.data.entry
    } else {
      toast.error('Failed to add journal entry')
      return null
    }
  },
}))
