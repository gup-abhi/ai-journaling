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
    entitySentimentTreemap: any[];
    cognitivePatternFrequency: any[];
    topStressors: any[];
    emotionDistribution: any[];
    emotionIntensityHeatmap: any[];
    thematicSentiment: any[];
    isSentimentLoading: boolean;
    isThemesLoading: boolean;
    isThemeActionLoading: boolean;
    isEntitySentimentLoading: boolean;
    isCognitivePatternLoading: boolean;
    isTopStressorsLoading: boolean;
    isEmotionDistributionLoading: boolean;
    isEmotionIntensityHeatmapLoading: boolean;
    isThematicSentimentLoading: boolean;
    fetchMoodTrends: () => Promise<void>;
    fetchSentimentTrends: (period: 'week' | 'month' | 'year') => Promise<void>;
    fetchTopThemes: (period: 'week' | 'month' | 'year', limit: number) => Promise<void>;
    fetchThemeActionRadarData: (period: Period) => Promise<void>;
    fetchEntitySentimentTreemap: (period: Period, limit: number) => Promise<void>;
    fetchCognitivePatternFrequency: (period: Period, limit: number) => Promise<void>;
    fetchTopStressors: (period: Period, limit: number) => Promise<void>;
    fetchEmotionDistribution: (period: Period) => Promise<void>;
    fetchEmotionIntensityHeatmap: (period: Period) => Promise<void>;
    fetchThematicSentiment: (period: Period) => Promise<void>;
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
    entitySentimentTreemap: [],
    cognitivePatternFrequency: [],
    topStressors: [],
    emotionDistribution: [],
    emotionIntensityHeatmap: [],
    thematicSentiment: [],
    isSentimentLoading: false,
    isThemesLoading: false,
    isThemeActionLoading: false,
    isEntitySentimentLoading: false,
    isCognitivePatternLoading: false,
    isTopStressorsLoading: false,
    isEmotionDistributionLoading: false,
    isEmotionIntensityHeatmapLoading: false,
    isThematicSentimentLoading: false,

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

    fetchEntitySentimentTreemap: async (period: Period, limit: number) => {
        set({ isEntitySentimentLoading: true });
        const res = await safeRequest(api.get(`/ai-insights/treemap/entity-sentiment/period/${period}?limit=${limit}`));
        if (res.ok) {
          set({ entitySentimentTreemap: res.data.top_entities, isEntitySentimentLoading: false });
        } else {
          set({ entitySentimentTreemap: [], isEntitySentimentLoading: false });
        }
      },

    fetchCognitivePatternFrequency: async (period: Period, limit: number) => {
        set({ isCognitivePatternLoading: true });
        const res = await safeRequest(api.get(`/ai-insights/trends/cognitive-pattern-frequency/period/${period}?limit=${limit}`));
        if (res.ok) {
            set({ cognitivePatternFrequency: res.data.cognitive_patterns, isCognitivePatternLoading: false });
        } else {
            set({ cognitivePatternFrequency: [], isCognitivePatternLoading: false });
        }
    },

    fetchTopStressors: async (period: Period, limit: number) => {
        set({ isTopStressorsLoading: true });
        const res = await safeRequest(api.get(`/ai-insights/trends/top-stressors?period=${period}&limit=${limit}`));
        if (res.ok) {
            set({ topStressors: res.data.top_stressors, isTopStressorsLoading: false });
        } else {
            set({ topStressors: [], isTopStressorsLoading: false });
        }
    },

    fetchEmotionDistribution: async (period: Period) => {
        set({ isEmotionDistributionLoading: true });
        const res = await safeRequest(api.get(`/ai-insights/emotion-distribution/period/${period}`));
        if (res.ok) {
            set({ emotionDistribution: res.data.emotionDistribution, isEmotionDistributionLoading: false });
        } else {
            set({ emotionDistribution: [], isEmotionDistributionLoading: false });
        }
    },

    fetchEmotionIntensityHeatmap: async (period: Period) => {
        set({ isEmotionIntensityHeatmapLoading: true });
        const res = await safeRequest(api.get(`/ai-insights/emotion-intensity-heatmap/period/${period}`));
        if (res.ok) {
            set({ emotionIntensityHeatmap: res.data.intensityMap, isEmotionIntensityHeatmapLoading: false });
        } else {
            set({ emotionIntensityHeatmap: [], isEmotionIntensityHeatmapLoading: false });
        }
    },

    fetchThematicSentiment: async (period: Period) => {
        set({ isThematicSentimentLoading: true });
        const res = await safeRequest(api.get(`/ai-insights/thematic-sentiment/period/${period}`));
        if (res.ok) {
            set({ thematicSentiment: res.data.thematicSentiment, isThematicSentimentLoading: false });
        } else {
            set({ thematicSentiment: [], isThematicSentimentLoading: false });
        }
    },
}));