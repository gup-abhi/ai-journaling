// Sentiment-related types
export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed'

export type SentimentTrend = {
  percentageChange: number
  description: string
}

export type SentimentData = {
  label: SentimentLabel
  score: number
  percentage: number
  trend: SentimentTrend
}

export type SentimentDistribution = {
  positive: number
  negative: number
  neutral: number
  mixed: number
}

export type TrendDataPoint = {
  date: string
  value: number
}

export type SentimentSummaryData = {
  period: string
  sentiment: SentimentData
  distribution: SentimentDistribution
  totalEntries: number
  trendData: TrendDataPoint[]
  narrativeSummary: string
}
