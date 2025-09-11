import { create } from 'zustand'
import { api, ApiErr, safeRequest } from '../lib/api'
import { JournalTemplate } from '../types/JournalTemplate'

export type JournalEntry = {
  _id: string
  content: string
  entry_date: string
  template_id?: string | null
}

export type PaginationMeta = {
  currentPage: number
  totalPages: number
  totalEntries: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

export type PaginatedJournalResponse = {
  entries: JournalEntry[]
  pagination: PaginationMeta
}


interface JournalStore {
  journalEntries: JournalEntry[]
  totalEntries: number
  monthlyEntries: number
  journalTemplates: JournalTemplate[]
  selectedTemplate: JournalTemplate | null
  pagination: PaginationMeta | null
  isLoading: boolean
  isLoadingMore: boolean
  isRetrying: boolean
  error: string | null
  retryCount: number
  fetchJournalEntries: (page?: number, limit?: number) => Promise<void>
  fetchPaginatedJournalEntries: (page?: number, limit?: number) => Promise<void>
  loadMoreJournalEntries: () => Promise<void>
  fetchTotalEntries: () => Promise<void>
  fetchMonthlyEntries: () => Promise<void>
  fetchJournalTemplates: () => Promise<void>
  fetchJournalTemplate: (templateId: string) => Promise<JournalTemplate | null>
  setSelectedTemplate: (template: JournalTemplate | null) => void
  addJournalEntry: (newEntry: { content: string; template_id: string | null }) => Promise<JournalEntry | null>
  retryFetch: () => Promise<void>
  clearError: () => void
}

export const useJournalStore = create<JournalStore>((set, get) => ({
  journalEntries: [],
  totalEntries: 0,
  monthlyEntries: 0,
  journalTemplates: [],
  selectedTemplate: null,
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  isRetrying: false,
  error: null,
  retryCount: 0,

  fetchJournalEntries: async (page = 1, limit = 10) => {
    console.log('Journal Store: Starting to fetch journal entries...')
    set({ isLoading: true })
    const response = await safeRequest(api.get<{ entries: JournalEntry[] }>(`/journal?page=${page}&limit=${limit}`))
    if (response.ok) {
      console.log('Journal Store: Journal entries fetched successfully, count:', response.data.entries.length)
      set({
        journalEntries: response.data.entries,
        isLoading: false
      })
    } else {
      console.log('Journal Store: Failed to fetch journal entries:', (response as ApiErr).error, 'Status:', (response as ApiErr).status)
      set({
        journalEntries: [],
        isLoading: false
      })
    }
  },

  fetchPaginatedJournalEntries: async (page = 1, limit = 10) => {
    console.log(`Journal Store: Starting to fetch paginated journal entries (page: ${page}, limit: ${limit})...`)
    set({ isLoading: true, error: null })

    try {
      const response = await safeRequest(api.get<PaginatedJournalResponse>(`/journal/paginated?page=${page}&limit=${limit}`))

      if (response.ok) {
        console.log('Journal Store: Paginated journal entries fetched successfully, count:', response.data.entries.length)
        set({
          journalEntries: response.data.entries,
          pagination: response.data.pagination,
          isLoading: false,
          error: null,
          retryCount: 0
        })
      } else {
        const errorMsg = `Failed to fetch journal entries: ${(response as ApiErr).error}`
        console.log('Journal Store:', errorMsg, 'Status:', (response as ApiErr).status)
        set({
          journalEntries: [],
          pagination: null,
          isLoading: false,
          error: errorMsg
        })
      }
    } catch (error: any) {
      const errorMsg = `Network error: ${error.message || 'Unable to fetch journal entries'}`
      console.log('Journal Store: Exception occurred:', errorMsg)
      set({
        journalEntries: [],
        pagination: null,
        isLoading: false,
        error: errorMsg
      })
    }
  },

  loadMoreJournalEntries: async () => {
    const { pagination, journalEntries, isLoadingMore } = get()
    if (!pagination || !pagination.hasNextPage || isLoadingMore) return

    console.log('Journal Store: Loading more journal entries...')
    set({ isLoadingMore: true, error: null })

    try {
      const nextPage = pagination.currentPage + 1
      const response = await  safeRequest(api.get<PaginatedJournalResponse>(`/journal/paginated?page=${nextPage}&limit=${pagination.limit}`))

      if (response.ok) {
        console.log('Journal Store: More journal entries loaded successfully, count:', response.data.entries.length)
        set({
          journalEntries: [...journalEntries, ...response.data.entries],
          pagination: response.data.pagination,
          isLoadingMore: false,
          error: null
        })
      } else {
        const errorMsg = `Failed to load more entries: ${(response as ApiErr).error}`
        console.log('Journal Store:', errorMsg, 'Status:', (response as ApiErr).status)
        set({
          isLoadingMore: false,
          error: errorMsg
        })
      }
    } catch (error: any) {
      const errorMsg = `Network error loading more: ${error.message || 'Unable to load more entries'}`
      console.log('Journal Store: Exception occurred:', errorMsg)
      set({
        isLoadingMore: false,
        error: errorMsg
      })
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

  retryFetch: async () => {
    const currentRetryCount = get().retryCount
    console.log(`Journal Store: Retrying fetch (attempt ${currentRetryCount + 1})...`)
    set({
      retryCount: currentRetryCount + 1,
      error: null,
      isRetrying: true
    })

    try {
      await get().fetchPaginatedJournalEntries(1, 10)
    } finally {
      set({ isRetrying: false })
    }
  },

  clearError: () => {
    console.log('Journal Store: Clearing error state')
    set({ error: null, retryCount: 0 })
  },
}))

