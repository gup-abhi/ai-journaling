import { create } from 'zustand'
import { api, safeRequest, isApiErr } from '../lib/api'

export type StreakData = {
  currentStreak: number
  longestStreak: number
  lastJournalDate?: string
}

export type JournalingDays = Map<string, boolean>

type StreakResponse = {
  streakData: StreakData
  journalingDays: Record<string, boolean>
}

type StreakState = {
  streakData: StreakData | null
  journalingDays: JournalingDays | null
  isLoading: boolean
  error: string | null
  getStreakData: () => Promise<void>
}

export const useStreakStore = create<StreakState>((set) => ({
  streakData: null,
  journalingDays: null,
  isLoading: false,
  error: null,
  getStreakData: async () => {
    set({ isLoading: true, error: null })
    const res = await safeRequest(api.get<StreakResponse>('/user/streak'))
    if (res.ok) {
      set({ 
        streakData: res.data.streakData,
        journalingDays: new Map(Object.entries(res.data.journalingDays || {})),
        isLoading: false 
      })
    } else {
      const errorMsg = isApiErr(res) ? res.error : 'Failed to fetch streak data'
      set({ 
        streakData: null, 
        journalingDays: null, 
        error: errorMsg, 
        isLoading: false 
      })
    }
  },
}))


