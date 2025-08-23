
import { create } from 'zustand';
import { api, safeRequest } from '@/lib/api';
import type { Goal } from '@/types/Goal';
import toast from 'react-hot-toast';

interface GoalStore {
  goals: Goal[];
  fetchGoals: () => Promise<void>;
  addGoal: (newGoal: { name: string; description?: string; progress: string }) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],

  fetchGoals: async () => {
    const response = await safeRequest(api.get<{ goals: Goal[] }>('/goal-tracking'));
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
}));
