import { create } from 'zustand'
import { api, safeRequest } from '@/lib/api'


export const useAiInsightStore = create((set) => ({
    moodTrends: 0,

    fetchMoodTrends: async () => {
        const response = await safeRequest(api.get<{ overallSentiment: number }>('/ai-insights/sentiment-trends/overall'));
        if (response.ok) {
            set({ moodTrends: response.data.overallSentiment });
        } else {
            set({ moodTrends: 0 }); // or handle error as needed
        }
    }
}));