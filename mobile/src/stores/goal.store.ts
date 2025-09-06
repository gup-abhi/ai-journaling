import { create } from 'zustand'
import { api, safeRequest } from '../lib/api'

export type Goal = {
  _id: string
  title: string
  status: 'in-progress' | 'completed' | string
}

type GoalState = {
  activeGoals: Goal[]
  getActiveGoals: () => Promise<void>
}

export const useGoalStore = create<GoalState>((set) => ({
  activeGoals: [],
  getActiveGoals: async () => {
    const res = await safeRequest(api.get<Goal[]>('/goals?status=in-progress'))
    if (res.ok && Array.isArray(res.data)) {
      set({ activeGoals: res.data })
    } else {
      set({ activeGoals: [] })
    }
  },
}))


