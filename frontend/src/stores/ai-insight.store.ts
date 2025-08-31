import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import type { SentimentTrend } from '@/types/SentimentTrends.type'
import type { TopThemeTrends } from '@/types/TopThemeTrends.type'
import type { Period } from '@/types/Period.type'

interface ThemeActionData {
  theme: string;
  action_count: number;
}

type AiInsightState = {
    moodTrends: number;
    sentimentTrends: SentimentTrend[];
    topThemesTrends: TopThemeTrends;
    themeActionRadarData: ThemeActionData[];
    isSentimentLoading: boolean;
    isThemesLoading: boolean;
    isThemeActionLoading: boolean;
    fetchMoodTrends: () => Promise<void>;
    fetchSentimentTrends: (period: 'week' | 'month' | 'year') => Promise<void>;
    fetchTopThemes: (period: 'week' | 'month' | 'year', limit: number) => Promise<void>;
    fetchThemeActionRadarData: (period: Period) => Promise<void>;
}

export const useAiInsightStore = create<AiInsightState>((set) => ({
    moodTrends: 0,
    sentimentTrends: [],
    topThemesTrends: {
        user_id: '',
        period: '',
        top_themes: []
    },
    themeActionRadarData: [],
    isSentimentLoading: false,
    isThemesLoading: false,
    isThemeActionLoading: false,

    fetchMoodTrends: async () => {
        const response = await safeRequest(api.get<{ overallSentiment: number }>('/ai-insights/trends/overall'));
        if (response.ok) {
            set({ moodTrends: response.data.overallSentiment });
        } else {
            set({ moodTrends: 0 });
        }
    },

    fetchSentimentTrends: async (period: 'week' | 'month' | 'year') => {
        set({ isSentimentLoading: true });
        const response = await safeRequest(api.get<{ averageSentiment: number; period_label: string }[]>(`/ai-insights/trends/sentiment/period/${period}`));
        if (response.ok && Array.isArray(response.data)) {
            const formattedData = response.data.map(item => ({
                date: item.period_label,
                sentiment: item.averageSentiment
            }));
            set({ sentimentTrends: formattedData, isSentimentLoading: false });
        } else {
            set({ sentimentTrends: [], isSentimentLoading: false });
        }
    },

    fetchTopThemes: async (period: string, limit: number) => {
      set({ isThemesLoading: true });
      const res = await safeRequest(api.get<TopThemeTrends>(`/ai-insights/trends/keyThemes/period/${period}?limit=${limit}`));
      if (res.ok) {
        set({ topThemesTrends: res.data, isThemesLoading: false });
      } else {
        set({ topThemesTrends: { user_id: '', period: '', top_themes: [] }, isThemesLoading: false });
      }
    },

    fetchThemeActionRadarData: async (period: Period) => {
      set({ isThemeActionLoading: true });
      const res = await safeRequest(api.get<{ themeActionData: ThemeActionData[] }>(`/ai-insights/theme-action-radar/period/${period}`));
      if (res.ok) {
        set({ themeActionRadarData: res.data.themeActionData, isThemeActionLoading: false });
      } else {
        set({ themeActionRadarData: [], isThemeActionLoading: false });
      }
    },
}));