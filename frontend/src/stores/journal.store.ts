import { create } from 'zustand'
import { api } from '@/lib/api'
import type { JournalEntry, PaginationMeta, PaginatedJournalResponse } from '@/types/JournalEntry.type'
import toast from 'react-hot-toast'
import type { JournalTemplate } from '@/types/JournalTemplate.type'

interface DateFilters {
  month?: number;
  year?: number;
}

interface JournalStore {
  journalEntries: JournalEntry[];
  totalEntries: number;
  monthlyEntries: number;
  journalTemplates: JournalTemplate[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  dateFilters: DateFilters;
  fetchJournalEntries: (page?: number, limit?: number) => Promise<void>;
  fetchPaginatedJournalEntries: (page?: number, limit?: number) => Promise<void>;
  fetchTotalEntries: () => Promise<void>;
  fetchMonthlyEntries: () => Promise<void>;
  fetchJournalTemplates: () => Promise<void>;
  addJournalEntry: (newEntry: { content: string, template_id: string | null }) => Promise<JournalEntry | null>;
  setDateFilters: (filters: DateFilters) => void;
  clearDateFilters: () => void;
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  journalEntries: [],
  totalEntries: 0,
  monthlyEntries: 0,
  journalTemplates: [],
  pagination: null,
  isLoading: false,
  dateFilters: {},

  fetchJournalEntries: async (page = 1, limit = 10) => {
    set({ isLoading: true })
    try {
      const response = await api.get<{ entries: JournalEntry[] }>(`/journal?page=${page}&limit=${limit}`)
      set({
        journalEntries: response.data.entries,
        isLoading: false
      })
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      set({
        journalEntries: [],
        isLoading: false
      })
    }
  },

  fetchPaginatedJournalEntries: async (page = 1, limit = 10) => {
    set({ isLoading: true })
    const { dateFilters } = get()

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })

    // Only add date filters if they have valid values
    if (dateFilters.month && dateFilters.year && dateFilters.month > 0 && dateFilters.year > 0) {
      params.append('month', dateFilters.month.toString())
      params.append('year', dateFilters.year.toString())
    } else if (dateFilters.year && dateFilters.year > 0) {
      params.append('year', dateFilters.year.toString())
    }

    const url = `/journal/paginated?${params.toString()}`
    console.log('Fetching journals from:', url, 'with dateFilters:', dateFilters)

    try {
      const response = await api.get<PaginatedJournalResponse>(url)
      console.log('Successfully fetched', response.data.entries.length, 'journal entries')
      set({
        journalEntries: response.data.entries,
        pagination: response.data.pagination,
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to fetch journals:', error)
      set({
        journalEntries: [],
        pagination: null,
        isLoading: false
      })
    }
  },

  fetchTotalEntries: async () => {
    try {
      const response = await api.get<{ totalEntries: number }>('/journal/total-entries')
      set({ totalEntries: response.data.totalEntries });
    } catch (error) {
        console.error("Error fetching total entries:", error);
        set({ totalEntries: 0 })
    }
  },

  fetchMonthlyEntries: async () => {
    try {
      const response = await api.get<{ totalMonthlyEntries: number }>('/journal/total-monthly-entries')
      set({ monthlyEntries: response.data.totalMonthlyEntries })
    } catch (error) {
      set({ monthlyEntries: 0 })
    }
  },

  fetchJournalTemplates: async () => {
    try {
      const response = await api.get<JournalTemplate[]>('/journal-template');
      set({ journalTemplates: response.data });
    } catch (error) {
      set({ journalTemplates: [] });
    }
  },

  addJournalEntry: async (newEntry: { content: string, template_id: string | null }) => {
    try {
      const response = await api.post<{ entry: JournalEntry }>('/journal', {
        content: newEntry.content,
        entry_date: new Date().toISOString(),
        template_id: newEntry.template_id
      })
      toast.success('Journal entry added successfully')
      return response.data.entry
    } catch (error) {
      console.error("Error adding journal entry:", error);
      toast.error('Failed to add journal entry')
      return null
    }
  },

  setDateFilters: (filters: DateFilters) => {
    set({ dateFilters: filters })
    // Don't automatically refetch here - let the component handle it
  },

  clearDateFilters: () => {
    set({ dateFilters: {} })
    // Don't automatically refetch here - let the component handle it
  },
}))
