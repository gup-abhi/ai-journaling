import { create } from 'zustand'
import { api, safeRequest, isApiErr } from '../lib/api'
import { SentimentSummaryData } from '../types/Sentiment.type'
import { TopThemesData } from '../types/Themes.type'

type Period = 'week' | 'month' | 'year'

interface SentimentTrend {
  date: string
  sentiment: number
}

interface TopTheme {
  theme: string
  frequency: number
}

interface TopThemeTrends {
  user_id: string
  period: string
  top_themes: TopTheme[]
}

interface EmotionDistribution {
  emotion: string
  count: number
}

type AiInsightState = {
  moodTrends: number
  sentimentTrends: SentimentTrend[]
  topThemesTrends: TopThemeTrends
  emotionDistribution: EmotionDistribution[]
  emotionIntensityHeatmap: any[]
  thematicSentiment: any[]
  themeActionRadarData: any[]
  entitySentimentTreemap: any[]
  cognitivePatternFrequency: any[]
  topStressors: any[]
  // New sentiment summary and themes data
  sentimentSummaryData: SentimentSummaryData | null
  topThemesData: TopThemesData | null
  isSentimentLoading: boolean
  isThemesLoading: boolean
  isEmotionDistributionLoading: boolean
  isEmotionIntensityHeatmapLoading: boolean
  isThematicSentimentLoading: boolean
  isThemeActionLoading: boolean
  isEntitySentimentLoading: boolean
  isCognitivePatternLoading: boolean
  isTopStressorsLoading: boolean
  // New loading states
  isSentimentSummaryLoading: boolean
  isTopThemesDataLoading: boolean
  fetchMoodTrends: (period?: string) => Promise<void>
  fetchSentimentTrends: (period: Period) => Promise<void>
  fetchTopThemes: (period: Period, limit: number) => Promise<void>
  fetchEmotionDistribution: (period: Period) => Promise<void>
  fetchEmotionIntensityHeatmap: (period: Period) => Promise<void>
  fetchThematicSentiment: (period: Period) => Promise<void>
  fetchThemeActionRadarData: (period: Period) => Promise<void>
  fetchEntitySentimentTreemap: (period: Period, limit: number) => Promise<void>
  fetchCognitivePatternFrequency: (period: Period, limit: number) => Promise<void>
  fetchTopStressors: (period: Period, limit: number) => Promise<void>
  // New functions for sentiment summary and top themes
  fetchSentimentSummary: (period: Period) => Promise<void>
  fetchTopThemesData: (period: Period, limit?: number) => Promise<void>
}

export const useAiInsightStore = create<AiInsightState>((set) => ({
  moodTrends: 0,
  sentimentTrends: [],
  topThemesTrends: {
    user_id: '',
    period: '',
    top_themes: []
  },
  emotionDistribution: [],
  emotionIntensityHeatmap: [],
  thematicSentiment: [],
  themeActionRadarData: [],
  entitySentimentTreemap: [],
  cognitivePatternFrequency: [],
  topStressors: [],
  // New data fields
  sentimentSummaryData: null,
  topThemesData: null,
  isSentimentLoading: false,
  isThemesLoading: false,
  isEmotionDistributionLoading: false,
  isEmotionIntensityHeatmapLoading: false,
  isThematicSentimentLoading: false,
  isThemeActionLoading: false,
  isEntitySentimentLoading: false,
  isCognitivePatternLoading: false,
  isTopStressorsLoading: false,
  // New loading states
  isSentimentSummaryLoading: false,
  isTopThemesDataLoading: false,

  fetchMoodTrends: async (period?: string) => {
    const res = await safeRequest(api.get('/ai-insights/trends/overall'))
    if (res.ok) {
      set({ moodTrends: res.data.overallSentiment || 0 })
    } else {
      set({ moodTrends: 0 })
    }
  },

  fetchSentimentTrends: async (period: Period) => {
    set({ isSentimentLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/trends/sentiment/period/${period}`))
    if (res.ok && Array.isArray(res.data)) {
      const formattedData = res.data.map((item: any) => ({
        date: item.period_label,
        sentiment: item.averageSentiment
      }))
      set({ sentimentTrends: formattedData, isSentimentLoading: false })
    } else {
      set({ sentimentTrends: [], isSentimentLoading: false })
    }
  },

  fetchTopThemes: async (period: Period, limit: number) => {
    set({ isThemesLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/trends/keyThemes/period/${period}?limit=${limit}`))
    if (res.ok) {
      set({ topThemesTrends: res.data, isThemesLoading: false })
    } else {
      set({ topThemesTrends: { user_id: '', period: '', top_themes: [] }, isThemesLoading: false })
    }
  },

  fetchEmotionDistribution: async (period: Period) => {
    set({ isEmotionDistributionLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/emotion-distribution/period/${period}`))
    if (res.ok) {
      set({ emotionDistribution: res.data.emotionDistribution, isEmotionDistributionLoading: false })
    } else {
      set({ emotionDistribution: [], isEmotionDistributionLoading: false })
    }
  },

  fetchEmotionIntensityHeatmap: async (period: Period) => {
    set({ isEmotionIntensityHeatmapLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/emotion-intensity-heatmap/period/${period}`))
    if (res.ok) {
      set({ emotionIntensityHeatmap: res.data.intensityMap, isEmotionIntensityHeatmapLoading: false })
    } else {
      set({ emotionIntensityHeatmap: [], isEmotionIntensityHeatmapLoading: false })
    }
  },

  fetchThematicSentiment: async (period: Period) => {
    set({ isThematicSentimentLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/thematic-sentiment/period/${period}`))
    if (res.ok) {
      set({ thematicSentiment: res.data.thematicSentiment, isThematicSentimentLoading: false })
    } else {
      set({ thematicSentiment: [], isThematicSentimentLoading: false })
    }
  },

  fetchThemeActionRadarData: async (period: Period) => {
    set({ isThemeActionLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/theme-action-radar/period/${period}`))
    if (res.ok) {
      set({ themeActionRadarData: res.data.themeActionData, isThemeActionLoading: false })
    } else {
      set({ themeActionRadarData: [], isThemeActionLoading: false })
    }
  },

  fetchEntitySentimentTreemap: async (period: Period, limit: number) => {
    set({ isEntitySentimentLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/treemap/entity-sentiment/period/${period}?limit=${limit}`))
    if (res.ok) {
      set({ entitySentimentTreemap: res.data.top_entities, isEntitySentimentLoading: false })
    } else {
      set({ entitySentimentTreemap: [], isEntitySentimentLoading: false })
    }
  },

  fetchCognitivePatternFrequency: async (period: Period, limit: number) => {
    set({ isCognitivePatternLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/trends/cognitive-pattern-frequency/period/${period}?limit=${limit}`))
    if (res.ok) {
      set({ cognitivePatternFrequency: res.data.cognitive_patterns, isCognitivePatternLoading: false })
    } else {
      set({ cognitivePatternFrequency: [], isCognitivePatternLoading: false })
    }
  },

  fetchTopStressors: async (period: Period, limit: number) => {
    set({ isTopStressorsLoading: true })
    const res = await safeRequest(api.get(`/ai-insights/trends/top-stressors?period=${period}&limit=${limit}`))
    if (res.ok) {
      set({ topStressors: res.data.top_stressors, isTopStressorsLoading: false })
    } else {
      set({ topStressors: [], isTopStressorsLoading: false })
    }
  },

  // New functions for sentiment summary and top themes
  fetchSentimentSummary: async (period: Period) => {
    set({ isSentimentSummaryLoading: true })
    try {
      const result = await safeRequest(api.get(`/ai-insights/sentiment-summary/period/${period}`))
      if (result.ok) {
        set({ sentimentSummaryData: result.data, isSentimentSummaryLoading: false })
      } else if (isApiErr(result)) {
        console.error('Failed to fetch sentiment summary:', result.error)
        set({ sentimentSummaryData: null, isSentimentSummaryLoading: false })
      }
    } catch (error) {
      console.error('Error fetching sentiment summary:', error)
      set({ sentimentSummaryData: null, isSentimentSummaryLoading: false })
    }
  },

  fetchTopThemesData: async (period: Period, limit: number = 10) => {
    set({ isTopThemesDataLoading: true })
    try {
      const result = await safeRequest(api.get(`/ai-insights/trends/keyThemes/period/${period}?limit=${limit}`))
      if (result.ok) {
        set({ topThemesData: result.data, isTopThemesDataLoading: false })
      } else if (isApiErr(result)) {
        console.error('Failed to fetch top themes data:', result.error)
        set({ topThemesData: null, isTopThemesDataLoading: false })
      }
    } catch (error) {
      console.error('Error fetching top themes data:', error)
      set({ topThemesData: null, isTopThemesDataLoading: false })
    }
  },
}))