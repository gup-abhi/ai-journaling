import { create } from 'zustand';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

export type StreakData = {
    currentStreak: number;
    longestStreak: number;
    lastJournalDate: string;
};

export type JournalingDays = Map<string, boolean>;

type StreakState = {
  streakData: StreakData | null;
  journalingDays: JournalingDays | null;
  isLoading: boolean;
  error: string | null;
  getStreakData: () => Promise<void>;
};
export const useStreakStore = create<StreakState>((set) => ({
  streakData: null,
  journalingDays: null,
  isLoading: false,
  error: null,

  getStreakData: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/user/streak`, { withCredentials: true });
      console.log('Streak data response:', res);
      set({ streakData: res.data.streakData, journalingDays: new Map(Object.entries(res.data.journalingDays)), isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof AxiosError ? error.response?.data?.message : 'An unexpected error occurred';
      set({ error: errorMessage, isLoading: false });
    }
  },
}));
