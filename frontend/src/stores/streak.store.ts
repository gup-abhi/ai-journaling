import { create } from 'zustand';
import { api, safeRequest } from '@/lib/api';

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
    const res = await safeRequest(api.get(`/user/streak`, { withCredentials: true }));

    console.log('Streak data response:', res);

    if (res.ok) {
      set({ streakData: res.data.streakData, journalingDays: new Map(Object.entries(res.data.journalingDays)), isLoading: false });
    } else {
      set({ error: res.error, isLoading: false });
    }
  },
}));
