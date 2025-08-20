import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import type { JournalEntry } from '@/types/JournalEntry'

export const useJournalStore = create((set) => ({
  journalEntries: [],
  totalEntries: 0,
  monthlyEntries: 0,

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
}))