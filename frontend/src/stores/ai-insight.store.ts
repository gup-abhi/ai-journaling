import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'
import type { JournalSentiment } from '@/types/JournalSentiment'


type AiInsightState = {
    moodTrends: number;
    journalSentiment: JournalSentiment | null;
    sentimentTrends: { date: string; sentiment: number }[];
    fetchMoodTrends: () => Promise<void>;
    fetchJournalSentiment: (journalId: string) => Promise<void>;
    fetchSentimentTrends: (period: 'week' | 'month' | 'year') => Promise<void>;
}

export const useAiInsightStore = create<AiInsightState>((set) => ({
    moodTrends: 0,
    journalSentiment: null,
    sentimentTrends: [],

    fetchMoodTrends: async () => {
        const response = await safeRequest(api.get<{ overallSentiment: number }>('/ai-insights/sentiment-trends/overall'));
        if (response.ok) {
            set({ moodTrends: response.data.overallSentiment });
        } else {
            set({ moodTrends: 0 }); // or handle error as needed
        }
    },

    fetchJournalSentiment: async (journalId: string) => {
        const response = await safeRequest(api.get<JournalSentiment>(`/ai-insights/sentiment-trends/journal/${journalId}`));
        if (response.ok) {
            set({ journalSentiment: response.data });
        } else {
            set({ journalSentiment: null }); // or handle error as needed
        }
    },

    fetchSentimentTrends: async (period: 'week' | 'month' | 'year') => {
        const response = await safeRequest(api.get<{ averageSentiment: number; period_label: string }[]>(`/ai-insights/sentiment-trends/period/${period}`));
        if (response.ok && Array.isArray(response.data)) {
            const formattedData = response.data.map(item => ({
                date: item.period_label,
                sentiment: item.averageSentiment
            }));
            set({ sentimentTrends: formattedData });
        } else {
            set({ sentimentTrends: [] }); // or handle error as needed
        }
    }
}));