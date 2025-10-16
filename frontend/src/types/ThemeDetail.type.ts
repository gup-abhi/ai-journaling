export interface ThemeEntry {
  id: string
  content: string
  entry_date: string
  word_count: number
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed'
    score: number
    emotions: Array<{
      emotion: string
      intensity: 'low' | 'medium' | 'high'
    }>
  }
  matched_theme: {
    theme: string
    sentiment_towards_theme: string
    action_taken_or_planned?: string
  }
  all_themes: Array<{
    theme: string
    sentiment_towards_theme: string
    action_taken_or_planned?: string
  }>
  summary: string
  key_learnings: string[]
}

export interface ThemeDetailData {
  entries: ThemeEntry[]
  theme: string
  period: string
  pagination: {
    currentPage: number
    totalPages: number
    totalEntries: number
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
  }
  dateRange?: {
    start: string
    end: string
  }
}
