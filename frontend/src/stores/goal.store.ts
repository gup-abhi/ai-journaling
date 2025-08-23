
import { create } from 'zustand';
import { api, safeRequest } from '@/lib/api';
import type { Goal } from '@/types/Goal';
import toast from 'react-hot-toast';

interface GoalStore {
  goals: Goal[];
  activeGoals: Goal[];
  fetchGoals: (filter: string) => Promise<void>;
  addGoal: (newGoal: { name: string; description?: string; progress: string }) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  updateGoal: (goalId: string, progress: string) => Promise<void>;
  getActiveGoals: () => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  activeGoals: [],

  fetchGoals: async (filter?: string) => {
    const params: { params: Record<string, string> } = { params: {} };

    if (filter !== "all") {
      params.params["progress"] = filter as string;
    }

    const response = await safeRequest(api.get<{ goals: Goal[] }>('/goal-tracking', params));
    console.log(response);
    if (response.ok) {
      set({ goals: response.data.goals });
    } else {
      set({ goals: [] });
    }
  },

  addGoal: async (newGoal: { name: string; description?: string; progress: string }) => {
    const response = await safeRequest(api.post('/goal-tracking', newGoal));
    if (response.ok) {
      toast.success(response.data.message || 'Goal added successfully');
      set((state) => ({ ...state, goals: [...state.goals, response.data] }));
    } else {
      toast.error(response.error || 'Failed to add goal');
    }
  },

  deleteGoal: async (goalId: string) => {
    const response = await safeRequest(api.delete(`/goal-tracking/${goalId}`));
    if (response.ok) {
      toast.success(response.data.message);
      set((state) => ({ ...state, goals: state.goals.filter((goal) => goal._id !== goalId) }));
    } else {
      toast.error(response.error || 'Failed to delete goal');
    }
  },


  updateGoal: async (goalId: string, progress: string) => {
    const response = await safeRequest(api.put(`/goal-tracking/${goalId}`, { progress }));
    if (response.ok) {
      toast.success(response.data.message);
    } else {
      toast.error(response.error || 'Failed to update goal');
    }
  }, 

  getActiveGoals: async () => {
    const response = await safeRequest(api.get<{ goals: Goal[] }>('/goal-tracking/active-goals'));
    if (response.ok) {
      set({ activeGoals: response.data.goals });
    } else {
      set({ activeGoals: [] });
    }
  }
}));
