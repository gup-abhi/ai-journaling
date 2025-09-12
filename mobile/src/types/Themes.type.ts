import { SentimentLabel } from './Sentiment.type'

// Theme-related types
export type SentimentBreakdown = {
  positive: number
  negative: number
  neutral: number
  mixed: number
}

export type TopTheme = {
  theme: string
  frequency: number
  dominant_sentiment: SentimentLabel
  sentiment_breakdown: SentimentBreakdown
}

export type TopThemesData = {
  user_id: string
  period: string
  top_themes: TopTheme[]
}
