import { create } from 'zustand'
import { api, safeRequest } from '../lib/api'

type AiInsightState = {
  moodTrends: number
  isSentimentLoading: boolean
  fetchMoodTrends: () => Promise<void>
}

export const useAiInsightStore = create<AiInsightState>((set) => ({
  moodTrends: 0,
  isSentimentLoading: false,

  fetchMoodTrends: async () => {
    set({ isSentimentLoading: true })
    const response = await safeRequest(api.get<{ overallSentiment: number }>('/ai-insights/trends/overall'))
    if (response.ok) {
      set({ moodTrends: response.data.overallSentiment, isSentimentLoading: false })
    } else {
      set({ moodTrends: 0, isSentimentLoading: false })
    }
  },
}))


