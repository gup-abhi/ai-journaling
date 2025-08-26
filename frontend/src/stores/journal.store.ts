import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import type { JournalEntry } from '@/types/JournalEntry.type'
import toast from 'react-hot-toast'
import type { JournalTemplate } from '@/types/JournalTemplate.type'

interface JournalStore {
  journalEntries: JournalEntry[];
  totalEntries: number;
  monthlyEntries: number;
  journalTemplates: JournalTemplate[];
  fetchJournalEntries: () => Promise<void>;
  fetchTotalEntries: () => Promise<void>;
  fetchMonthlyEntries: () => Promise<void>;
  fetchJournalTemplates: () => Promise<void>;
  addJournalEntry: (newEntry: { content: string, template_id: string | null }) => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set) => ({
  journalEntries: [],
  totalEntries: 0,
  monthlyEntries: 0,
  journalTemplates: [],

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

  fetchJournalTemplates: async () => {
    const response = await safeRequest(api.get<JournalTemplate[]>('/journal-template'));
    if (response.ok && Array.isArray(response.data)) {
      set({ journalTemplates: response.data });
    } else {
      set({ journalTemplates: [] });
    }
  },

  addJournalEntry: async (newEntry: { content: string, template_id: string | null }) => {
    const response = await safeRequest(api.post('/journal', {
      content: newEntry.content,
      entry_date: new Date().toISOString(),
      template_id: newEntry.template_id
    }))
    if (response.ok) {
      toast.success('Journal entry added successfully')
    } else {
      toast.error('Failed to add journal entry')
    }
  },
}))
