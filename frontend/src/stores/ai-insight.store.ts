import { create } from 'zustand'
import { api } from '@/lib/api'
import type { SentimentTrend } from '@/types/SentimentTrends.type'
import type { TopThemeTrends } from '@/types/TopThemeTrends.type'
import type { Period } from '@/types/Period.type'
import type { SentimentSummaryData } from '@/types/SentimentSummary.type'
import type { TopThemesData } from '@/types/ThematicSentiment.type'

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
    // New sentiment summary and themes data
    sentimentSummaryData: SentimentSummaryData | null;
    topThemesData: TopThemesData | null;
    isSentimentLoading: boolean;
    isThemesLoading: boolean;
    isThemeActionLoading: boolean;
    isEntitySentimentLoading: boolean;
    isCognitivePatternLoading: boolean;
    isTopStressorsLoading: boolean;
    isEmotionDistributionLoading: boolean;
    isEmotionIntensityHeatmapLoading: boolean;
    isThematicSentimentLoading: boolean;
    // New loading states
    isSentimentSummaryLoading: boolean;
    isTopThemesDataLoading: boolean;
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
    // New functions for sentiment summary and top themes
    fetchSentimentSummary: (period: Period) => Promise<void>;
    fetchTopThemesData: (period: Period, limit?: number) => Promise<void>;
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
    // New data fields
    sentimentSummaryData: null,
    topThemesData: null,
    isSentimentLoading: false,
    isThemesLoading: false,
    isThemeActionLoading: false,
    isEntitySentimentLoading: false,
    isCognitivePatternLoading: false,
    isTopStressorsLoading: false,
    isEmotionDistributionLoading: false,
    isEmotionIntensityHeatmapLoading: false,
    isThematicSentimentLoading: false,
    // New loading states
    isSentimentSummaryLoading: false,
    isTopThemesDataLoading: false,

    fetchMoodTrends: async () => {
        try {
            const response = await api.get<{ overallSentiment: number }>('/ai-insights/trends/overall');
            set({ moodTrends: response.data.overallSentiment });
        } catch (error) {
            console.error("Error fetching mood trends:", error);
            set({ moodTrends: 0 });
        }
    },

    fetchSentimentTrends: async (period: 'week' | 'month' | 'year') => {
        set({ isSentimentLoading: true });
        try {
            const response = await api.get<{ averageSentiment: number; period_label: string }[]>(`/ai-insights/trends/sentiment/period/${period}`);
            const formattedData = response.data.map(item => ({
                date: item.period_label,
                sentiment: item.averageSentiment
            }));
            set({ sentimentTrends: formattedData, isSentimentLoading: false });
        } catch (error) {
            console.error("Error fetching sentiment trends:", error);
            set({ sentimentTrends: [], isSentimentLoading: false });
        }
    },

    fetchTopThemes: async (period: string, limit: number) => {
      set({ isThemesLoading: true });
      try {
        const res = await api.get<TopThemeTrends>(`/ai-insights/trends/keyThemes/period/${period}?limit=${limit}`);
        set({ topThemesTrends: res.data, isThemesLoading: false });
      } catch (error) {
        console.error("Error fetching top themes:", error);
        set({ topThemesTrends: { user_id: '', period: '', top_themes: [] }, isThemesLoading: false });
      }
    },

    fetchThemeActionRadarData: async (period: Period) => {
      set({ isThemeActionLoading: true });
      try {
        const res = await api.get<{ themeActionData: ThemeActionData[] }>(`/ai-insights/theme-action-radar/period/${period}`);
        set({ themeActionRadarData: res.data.themeActionData, isThemeActionLoading: false });
      } catch (error) {
        console.error("Error fetching theme action radar data:", error);
        set({ themeActionRadarData: [], isThemeActionLoading: false });
      }
    },

    fetchEntitySentimentTreemap: async (period: Period, limit: number) => {
        set({ isEntitySentimentLoading: true });
        try {
            const res = await api.get(`/ai-insights/treemap/entity-sentiment/period/${period}?limit=${limit}`);
            set({ entitySentimentTreemap: res.data.top_entities, isEntitySentimentLoading: false });
        } catch (error) {
            console.error("Error fetching entity sentiment treemap:", error);
            set({ entitySentimentTreemap: [], isEntitySentimentLoading: false });
        }
      },

    fetchCognitivePatternFrequency: async (period: Period, limit: number) => {
        set({ isCognitivePatternLoading: true });
        try {
            const res = await api.get(`/ai-insights/trends/cognitive-pattern-frequency/period/${period}?limit=${limit}`);
            set({ cognitivePatternFrequency: res.data.cognitive_patterns, isCognitivePatternLoading: false });
        } catch (error) {
            console.error("Error fetching cognitive pattern frequency:", error);
            set({ cognitivePatternFrequency: [], isCognitivePatternLoading: false });
        }
    },

    fetchTopStressors: async (period: Period, limit: number) => {
        set({ isTopStressorsLoading: true });
        try {
            const res = await api.get(`/ai-insights/trends/top-stressors?period=${period}&limit=${limit}`);
            set({ topStressors: res.data.top_stressors, isTopStressorsLoading: false });
        } catch (error) {
            console.error("Error fetching top stressors:", error);
            set({ topStressors: [], isTopStressorsLoading: false });
        }
    },

    fetchEmotionDistribution: async (period: Period) => {
        set({ isEmotionDistributionLoading: true });
        try {
            const res = await api.get(`/ai-insights/emotion-distribution/period/${period}`);
            set({ emotionDistribution: res.data.emotionDistribution, isEmotionDistributionLoading: false });
        } catch (error) {
            set({ emotionDistribution: [], isEmotionDistributionLoading: false });
        }
    },

    fetchEmotionIntensityHeatmap: async (period: Period) => {
        set({ isEmotionIntensityHeatmapLoading: true });
        try {
            const res = await api.get(`/ai-insights/emotion-intensity-heatmap/period/${period}`);
            set({ emotionIntensityHeatmap: res.data.intensityMap, isEmotionIntensityHeatmapLoading: false });
        } catch (error) {
            console.error("Error fetching emotion intensity heatmap:", error);
            set({ emotionIntensityHeatmap: [], isEmotionIntensityHeatmapLoading: false });
        }
    },

    fetchThematicSentiment: async (period: Period) => {
        set({ isThematicSentimentLoading: true });
        try {
            const res = await api.get(`/ai-insights/thematic-sentiment/period/${period}`);
            set({ thematicSentiment: res.data.thematicSentiment, isThematicSentimentLoading: false });
        } catch (error) {
            set({ thematicSentiment: [], isThematicSentimentLoading: false });
        }
    },

    // New functions for sentiment summary and top themes
    fetchSentimentSummary: async (period: Period) => {
        set({ isSentimentSummaryLoading: true });
        try {
            const response = await api.get<SentimentSummaryData>(`/ai-insights/sentiment-summary/period/${period}`);
            set({ sentimentSummaryData: response.data, isSentimentSummaryLoading: false });
        } catch (error) {
            console.error('Error fetching sentiment summary:', error);
            set({ sentimentSummaryData: null, isSentimentSummaryLoading: false });
        }
    },

    fetchTopThemesData: async (period: Period, limit: number = 10) => {
        set({ isTopThemesDataLoading: true });
        try {
            const response = await api.get<TopThemesData>(`/ai-insights/trends/keyThemes/period/${period}?limit=${limit}`);
            set({ topThemesData: response.data, isTopThemesDataLoading: false });
        } catch (error) {
            console.error('Error fetching top themes data:', error);
            set({ topThemesData: null, isTopThemesDataLoading: false });
        }
    },
}));