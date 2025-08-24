import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import type { SentimentTrend } from '@/types/SentimentTrends'
import type { TopThemeTrends } from '@/types/TopThemeTrends'

type AiInsightState = {
    moodTrends: number;
    sentimentTrends: SentimentTrend[];
    topThemesTrends: TopThemeTrends;
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

    fetchMoodTrends: async () => {
        const response = await safeRequest(api.get<{ overallSentiment: number }>('/ai-insights/trends/overall'));
        if (response.ok) {
            set({ moodTrends: response.data.overallSentiment });
        } else {
            set({ moodTrends: 0 }); // or handle error as needed
        }
    },

    fetchSentimentTrends: async (period: 'week' | 'month' | 'year') => {
        const response = await safeRequest(api.get<{ averageSentiment: number; period_label: string }[]>(`/ai-insights/trends/sentiment/period/${period}`));
        if (response.ok && Array.isArray(response.data)) {
            const formattedData = response.data.map(item => ({
                date: item.period_label,
                sentiment: item.averageSentiment
            }));
            set({ sentimentTrends: formattedData });
        } else {
            set({ sentimentTrends: [] }); // or handle error as needed
        }
    },

    fetchTopThemes: async (period: string, limit: number) => {
      const res = await safeRequest(api.get<TopThemeTrends>(`/ai-insights/trends/keyThemes/period/${period}?limit=${limit}`));
      if (res.ok) {
        set({ topThemesTrends: res.data });
      } else {
        set({ topThemesTrends: { user_id: '', period: '', top_themes: [] } }); // or handle error as needed
      }
    },
}));