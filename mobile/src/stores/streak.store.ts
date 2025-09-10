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
    console.log('Streak Store: Starting to fetch streak data...')
    set({ isLoading: true, error: null })

    try {
      const res = await safeRequest(api.get<StreakResponse>('/user/streak'))
      console.log('Streak Store: API Response:', {
        ok: res.ok,
        status: res.status,
        error: isApiErr(res) ? res.error : 'No error',
        hasData: res.ok ? !!res.data : false
      })

      if (res.ok) {
        console.log('Streak Store: Streak data fetched successfully:', res.data.streakData)
        set({
          streakData: res.data.streakData,
          journalingDays: new Map(Object.entries(res.data.journalingDays || {})),
          isLoading: false
        })
      } else {
        const errorMsg = isApiErr(res) ? res.error : 'Failed to fetch streak data'
        console.log('Streak Store: Failed to fetch streak data:', errorMsg, 'Status:', res.status)
        set({
          streakData: null,
          journalingDays: null,
          error: errorMsg,
          isLoading: false
        })
      }
    } catch (error) {
      console.log('Streak Store: Unexpected error:', error)
      set({
        streakData: null,
        journalingDays: null,
        error: 'Network error occurred',
        isLoading: false
      })
    }
  },
}))


