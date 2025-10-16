export interface TimelineEntry {
  id: string
  date: string
  content: string
  wordCount: number
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed'
    score: number
    emotions: Array<{
      emotion: string
      intensity: string
      trigger?: string
    }>
  }
  themes: Array<{
    theme: string
    sentiment_towards_theme: string
    action_taken_or_planned?: string
  }>
  summary: string
  keyEvents: Array<{
    name: string
    sentiment: string
  }>
  significantEvents: string[]
}

export interface TimelineResponse {
  timeline: TimelineEntry[]
  period: string
  theme: string | null
  totalEntries: number
  dateRange: {
    start: string
    end: string
  }
}

export type TimelinePeriod = 'week' | 'month' | 'year'
