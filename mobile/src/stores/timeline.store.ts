import { create } from 'zustand'
import { api, safeRequest, type ApiResult } from '../lib/api'
import { type TimelineEntry, type TimelineResponse, type TimelinePeriod } from '../types/Timeline.type'

interface TimelineState {
  timelineData: TimelineEntry[]
  isLoading: boolean
  error: string | null
  selectedPeriod: TimelinePeriod
  selectedTheme: string | null
  totalEntries: number
  dateRange: {
    start: string
    end: string
  } | null
  fetchTimelineData: (period?: TimelinePeriod, theme?: string | null) => Promise<void>
  setSelectedPeriod: (period: TimelinePeriod) => void
  setSelectedTheme: (theme: string | null) => void
  clearError: () => void
}

// API function moved to store
const getTimelineData = async (period: TimelinePeriod = 'week', theme?: string): Promise<ApiResult<TimelineResponse>> => {
  const params = new URLSearchParams()
  params.append('period', period)
  if (theme) {
    params.append('theme', theme)
  }
  
  return safeRequest<TimelineResponse>(
    api.get(`/journal/timeline?${params.toString()}`)
  )
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  timelineData: [],
  isLoading: false,
  error: null,
  selectedPeriod: 'week',
  selectedTheme: null,
  totalEntries: 0,
  dateRange: null,

  fetchTimelineData: async (period = 'week', theme = null) => {
    set({ isLoading: true, error: null })
    
    try {
      const result = await getTimelineData(period, theme || undefined)
      
      if (result.ok) {
        set({
          timelineData: result.data.timeline,
          totalEntries: result.data.totalEntries,
          dateRange: result.data.dateRange,
          selectedPeriod: period,
          selectedTheme: theme,
          isLoading: false,
          error: null
        })
      } else {
        set({
          error: result.error,
          isLoading: false
        })
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch timeline data',
        isLoading: false
      })
    }
  },

  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period })
    // Automatically fetch new data when period changes
    get().fetchTimelineData(period, get().selectedTheme)
  },

  setSelectedTheme: (theme) => {
    set({ selectedTheme: theme })
    // Automatically fetch new data when theme changes
    get().fetchTimelineData(get().selectedPeriod, theme)
  },

  clearError: () => {
    set({ error: null })
  }
}))
