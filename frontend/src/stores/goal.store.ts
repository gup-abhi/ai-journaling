
import { create } from 'zustand';
import { api } from '@/lib/api';
import type { Goal } from '@/types/Goal.type';
import toast from 'react-hot-toast';

interface GoalStore {
  goals: Goal[];
  activeGoals: Goal[];
  isLoading: boolean; // Added isLoading
  fetchGoals: (filter: string) => Promise<void>;
  addGoal: (newGoal: { name: string; description?: string; progress: string }) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  updateGoal: (goalId: string, progress: string) => Promise<void>;
  getActiveGoals: () => Promise<void>;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  activeGoals: [],
  isLoading: false, // Initialized isLoading

  fetchGoals: async (filter?: string) => {
    set({ isLoading: true }); // Set loading to true
    const params: { params: Record<string, string> } = { params: {} };

    if (filter !== "all") {
      params.params["progress"] = filter as string;
    }

    try {
      const response = await api.get<{ goals: Goal[] }>('/goal-tracking', params);
      set({ goals: response.data.goals, isLoading: false }); // Set loading to false on success
    } catch (error) {
      set({ goals: [], isLoading: false }); // Set loading to false on error
    }
  },

  addGoal: async (newGoal: { name: string; description?: string; progress: string }) => {
    set({ isLoading: true }); // Set loading to true
    try {
      const response = await api.post('/goal-tracking', newGoal);
      toast.success(response.data.message || 'Goal added successfully');
      set((state) => ({ ...state, goals: [...state.goals, response.data], isLoading: false })); // Set loading to false on success
    } catch (error: any) {
      toast.error(error.message || 'Failed to add goal');
      set({ isLoading: false }); // Set loading to false on error
    }
  },

  deleteGoal: async (goalId: string) => {
    set({ isLoading: true }); // Set loading to true
    try {
      const response = await api.delete(`/goal-tracking/${goalId}`);
      toast.success(response.data.message);
      set((state) => ({ ...state, goals: state.goals.filter((goal) => goal._id !== goalId), isLoading: false })); // Set loading to false on success
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete goal');
      set({ isLoading: false }); // Set loading to false on error
    }
  },


  updateGoal: async (goalId: string, progress: string) => {
    set({ isLoading: true }); // Set loading to true
    try {
      const response = await api.put(`/goal-tracking/${goalId}`, { progress });
      toast.success(response.data.message);
      set({ isLoading: false }); // Set loading to false on success
    } catch (error: any) {
      toast.error(error.message || 'Failed to update goal');
      set({ isLoading: false }); // Set loading to false on error
    }
  }, 

  getActiveGoals: async () => {
    set({ isLoading: true }); // Set loading to true
    try {
      const response = await api.get<{ goals: Goal[] }>('/goal-tracking/active-goals');
      set({ activeGoals: response.data.goals, isLoading: false }); // Set loading to false on success
    } catch (error) {
      set({ activeGoals: [], isLoading: false }); // Set loading to false on error
    }
  }
}));
