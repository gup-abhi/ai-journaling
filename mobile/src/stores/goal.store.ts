import { create } from 'zustand'
import { api, safeRequest, isApiErr } from '../lib/api'

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
  currentFilter: string
  fetchGoals: (filter?: string) => Promise<void>
  setFilter: (filter: string) => void
  addGoal: (newGoal: { name: string; description?: string; progress: string }) => Promise<void>
  updateGoal: (goalId: string, progress: string) => Promise<void>
  deleteGoal: (goalId: string) => Promise<void>
  getActiveGoals: () => Promise<void>
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  activeGoals: [],
  isLoading: false,
  currentFilter: 'all',

  fetchGoals: async (filter?: string) => {
    set({ isLoading: true })
    const params: { params: Record<string, string> } = { params: {} }

    if (filter && filter !== "all") {
      params.params["progress"] = filter
    }

    const response = await safeRequest(api.get<{ goals: Goal[] }>('/goal-tracking', params))
    if (response.ok) {
      set({ goals: response.data.goals, currentFilter: filter || 'all', isLoading: false })
    } else {
      set({ goals: [], currentFilter: filter || 'all', isLoading: false })
    }
  },

  setFilter: (filter: string) => {
    set({ currentFilter: filter })
  },

  addGoal: async (newGoal: { name: string; description?: string; progress: string }) => {
    set({ isLoading: true })
    const response = await safeRequest(api.post('/goal-tracking', newGoal))
    if (response.ok) {
      const { goals } = get()
      set({
        goals: [...goals, response.data.newGoal],
        isLoading: false
      })
    } else {
      set({ isLoading: false })
      throw new Error(isApiErr(response) ? response.error : 'Failed to add goal')
    }
  },

  updateGoal: async (goalId: string, progress: string) => {
    set({ isLoading: true })
    const response = await safeRequest(api.put(`/goal-tracking/${goalId}`, { progress }))
    if (response.ok) {
      // Update activeGoals if the goal is in there
      const { activeGoals } = get()
      const updatedActiveGoals = activeGoals.map(goal => 
        goal._id === goalId ? { ...goal, progress, updatedAt: new Date().toISOString() } : goal
      )
      
      set({ activeGoals: updatedActiveGoals })
      
      // Re-fetch goals with current filter to ensure correct filtering
      const { currentFilter } = get()
      await get().fetchGoals(currentFilter)
    } else {
      set({ isLoading: false })
      throw new Error(isApiErr(response) ? response.error : 'Failed to update goal')
    }
  },

  deleteGoal: async (goalId: string) => {
    set({ isLoading: true })
    const response = await safeRequest(api.delete(`/goal-tracking/${goalId}`))
    if (response.ok) {
      const { goals } = get()
      const filteredGoals = goals.filter((goal) => goal._id !== goalId)
      set({
        goals: filteredGoals,
        isLoading: false
      })
    } else {
      set({ isLoading: false })
      throw new Error(isApiErr(response) ? response.error : 'Failed to delete goal')
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


