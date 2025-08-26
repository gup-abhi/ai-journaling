import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import type { SentimentTrend } from '@/types/SentimentTrends.type'
import type { TopThemeTrends } from '@/types/TopThemeTrends.type'

type AiInsightState = {
    moodTrends: number;
    sentimentTrends: SentimentTrend[];
    topThemesTrends: TopThemeTrends;
    isSentimentLoading: boolean; // Added
    isThemesLoading: boolean; // Added
    fetchMoodTrends: () => Promise<void>;
    fetchSentimentTrends: (period: 'week' | 'month' | 'year') => Promise<void>;
    fetchTopThemes: (period: 'week' | 'month' | 'year', limit: number) => Promise<void>;
}

export const useAiInsightStore = create<AiInsightState>((set) => ({
    moodTrends: 0,
    sentimentTrends: [],
    topThemesTrends: {
        user_id: '',
        period: '',
        top_themes: []
    },
    isSentimentLoading: false, // Initialized
    isThemesLoading: false, // Initialized

    fetchMoodTrends: async () => {
        const response = await safeRequest(api.get<{ overallSentiment: number }>('/ai-insights/trends/overall'));
        if (response.ok) {
            set({ moodTrends: response.data.overallSentiment });
        } else {
            set({ moodTrends: 0 }); // or handle error as needed
        }
    },

    fetchSentimentTrends: async (period: 'week' | 'month' | 'year') => {
        set({ isSentimentLoading: true }); // Set loading to true
        const response = await safeRequest(api.get<{ averageSentiment: number; period_label: string }[]>(`/ai-insights/trends/sentiment/period/${period}`));
        if (response.ok && Array.isArray(response.data)) {
            const formattedData = response.data.map(item => ({
                date: item.period_label,
                sentiment: item.averageSentiment
            }));
            set({ sentimentTrends: formattedData, isSentimentLoading: false }); // Set loading to false
        } else {
            set({ sentimentTrends: [], isSentimentLoading: false }); // Set loading to false
        }
    },

    fetchTopThemes: async (period: string, limit: number) => {
      set({ isThemesLoading: true }); // Set loading to true
      const res = await safeRequest(api.get<TopThemeTrends>(`/ai-insights/trends/keyThemes/period/${period}?limit=${limit}`));
      if (res.ok) {
        set({ topThemesTrends: res.data, isThemesLoading: false }); // Set loading to false
      } else {
        set({ topThemesTrends: { user_id: '', period: '', top_themes: [] }, isThemesLoading: false }); // Set loading to false
      }
    },
}));