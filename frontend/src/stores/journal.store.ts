import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import type { JournalEntry } from '@/types/JournalEntry'
import toast from 'react-hot-toast'

interface JournalStore {
  journalEntries: JournalEntry[];
  totalEntries: number;
  monthlyEntries: number;
  fetchJournalEntries: () => Promise<void>;
  fetchTotalEntries: () => Promise<void>;
  fetchMonthlyEntries: () => Promise<void>;
  addJournalEntry: (newEntry: { content: string }) => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set) => ({
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

  addJournalEntry: async (newEntry: { content: string }) => {
    const response = await safeRequest(api.post('/journal', {
      content: newEntry.content,
      entry_date: new Date().toISOString(),
    }))
    if (response.ok) {
      toast.success('Journal entry added successfully')
    } else {
      toast.error('Failed to add journal entry')
    }
  },
}))