import { create } from 'zustand'
import { api } from '@/lib/api'
import { type ThemeDetailData } from '@/types/ThemeDetail.type'

interface ThemeDetailState {
  data: ThemeDetailData | null
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  fetchThemeEntries: (theme: string, period?: string, page?: number) => Promise<void>
  loadMoreEntries: (theme: string, period?: string) => Promise<void>
  clearData: () => void
  setError: (error: string | null) => void
}

export const useThemeDetailStore = create<ThemeDetailState>((set, get) => ({
  data: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  fetchThemeEntries: async (theme: string, period = 'all', page = 1) => {
    set({ isLoading: true, error: null })
    
    try {
      const response = await api.get<ThemeDetailData>(
        `/journal/by-theme?theme=${encodeURIComponent(theme)}&period=${period}&page=${page}&limit=10`
      )
      
      set({
        data: response.data,
        isLoading: false,
        error: null
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch theme entries',
        isLoading: false
      })
    }
  },

  loadMoreEntries: async (theme: string, period = 'all') => {
    const { data } = get()
    if (!data || !data.pagination.hasNextPage || get().isLoadingMore) return

    set({ isLoadingMore: true })
    
    try {
      const nextPage = data.pagination.currentPage + 1
      const response = await api.get<ThemeDetailData>(
        `/journal/by-theme?theme=${encodeURIComponent(theme)}&period=${period}&page=${nextPage}&limit=10`
      )
      
      set({
        data: {
          ...response.data,
          entries: [...data.entries, ...response.data.entries]
        },
        isLoadingMore: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load more entries',
        isLoadingMore: false
      })
    }
  },

  clearData: () => {
    set({ data: null, error: null })
  },

  setError: (error) => {
    set({ error })
  }
}))
