import { create } from 'zustand'
import { api, safeRequest } from '../lib/api'

export type Goal = {
  _id: string
  name: string
  description?: string
  progress: 'not-started' | 'in-progress' | 'completed' | 'on-hold'
  user_id: string
  createdAt: string
  updatedAt: string
}

type GoalState = {
  goals: Goal[]
  activeGoals: Goal[]
  isLoading: boolean
  fetchGoals: (filter?: string) => Promise<void>
  addGoal: (newGoal: { name: string; description?: string; progress: string }) => Promise<void>
  updateGoal: (goalId: string, progress: string) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  getActiveGoals: () => Promise<void>
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  activeGoals: [],
  isLoading: false,

  fetchGoals: async (filter?: string) => {
    set({ isLoading: true })
    const params: { params: Record<string, string> } = { params: {} }

    if (filter && filter !== "all") {
      params.params["progress"] = filter
    }

    const response = await safeRequest(api.get<{ goals: Goal[] }>('/goal-tracking', params))
    if (response.ok) {
      set({ goals: response.data.goals, isLoading: false })
    } else {
      set({ goals: [], isLoading: false })
    }
  },

  addGoal: async (newGoal: { name: string; description?: string; progress: string }) => {
    set({ isLoading: true })
    const response = await safeRequest(api.post('/goal-tracking', newGoal))
    if (response.ok) {
      const { goals } = get()
      set({
        goals: [...goals, response.data],
        isLoading: false
      })
    } else {
      set({ isLoading: false })
      throw new Error(response.error || 'Failed to add goal')
    }
  },

  updateGoal: async (goalId: string, progress: string) => {
    set({ isLoading: true })
    const response = await safeRequest(api.put(`/goal-tracking/${goalId}`, { progress }))
    if (response.ok) {
      set({ isLoading: false })
    } else {
      set({ isLoading: false })
      throw new Error(response.error || 'Failed to update goal')
    }
  },

  deleteGoal: async (goalId: string) => {
    set({ isLoading: true })
    const response = await safeRequest(api.delete(`/goal-tracking/${goalId}`))
    if (response.ok) {
      const { goals } = get()
      set({
        goals: goals.filter((goal) => goal._id !== goalId),
        isLoading: false
      })
    } else {
      set({ isLoading: false })
      throw new Error(response.error || 'Failed to delete goal')
    }
  },

  getActiveGoals: async () => {
    set({ isLoading: true })
    const response = await safeRequest(api.get<{ goals: Goal[] }>('/goal-tracking/active-goals'))
    if (response.ok) {
      set({ activeGoals: response.data.goals, isLoading: false })
    } else {
      set({ activeGoals: [], isLoading: false })
    }
  },
}))


