import { create } from 'zustand'
import { api, safeRequest } from '../lib/api'

export type StreakData = {
  currentStreak: number
  longestStreak: number
  lastJournalDate?: string
}

type StreakResponse = {
  streakData: StreakData
  journalingDays: Record<string, boolean>
}

type StreakState = {
  streakData: StreakData | null
  getStreakData: () => Promise<void>
}

export const useStreakStore = create<StreakState>((set) => ({
  streakData: null,
  getStreakData: async () => {
    const res = await safeRequest(api.get<StreakResponse>('/user/streak'))
    if (res.ok) {
      set({ streakData: res.data.streakData })
    } else {
      set({ streakData: null })
    }
  },
}))


