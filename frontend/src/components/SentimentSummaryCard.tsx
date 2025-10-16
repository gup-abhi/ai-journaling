import InsightCard, { type InsightCardProps } from './ui/InsightCard'
import { type SentimentSummaryData } from '@/types/SentimentSummary.type'

interface SentimentSummaryCardProps {
  data: SentimentSummaryData
  onPress?: () => void
}

export default function SentimentSummaryCard({ data, onPress }: SentimentSummaryCardProps) {
  // Add safety checks for data structure
  if (!data || !data.sentiment) {
    return (
      <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 text-center shadow-sm">
        <p className="text-gray-600 dark:text-gray-400">Unable to display sentiment data</p>
      </div>
    )
  }
  
  const getSentimentIcon = (label: string) => {
    switch (label) {
      case 'positive': return '😊'
      case 'negative': return '😔'
      case 'mixed': return '😐'
      default: return '😌'
    }
  }
  
  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive': return '#10B981' // green
      case 'negative': return '#EF4444' // red
      case 'mixed': return '#F59E0B' // amber
      default: return '#EAB308' // yellow for neutral
    }
  }
  
  const getSentimentBackgroundColor = (label: string) => {
    switch (label) {
      case 'positive': return 'bg-green-50 dark:bg-green-900/20' // light green
      case 'negative': return 'bg-red-50 dark:bg-red-900/20' // light red
      case 'mixed': return 'bg-amber-50 dark:bg-amber-900/20' // light amber
      default: return 'bg-gray-50 dark:bg-gray-900/20' // neutral
    }
  }
  
  const getTrendDirection = (percentageChange: number): 'up' | 'down' | 'neutral' => {
    if (Math.abs(percentageChange) < 5) return 'neutral'
    return percentageChange > 0 ? 'up' : 'down'
  }
  
  const formatSentimentValue = (score: number) => {
    const percentage = Math.round(score * 100)
    return `${percentage > 0 ? '+' : ''}${percentage}%`
  }
  
  // Safe access with defaults
  const sentimentLabel = data.sentiment?.label || 'neutral'
  const sentimentScore = data.sentiment?.score || 0
  const distribution = data.distribution || { positive: 0, negative: 0, neutral: 0, mixed: 0 }
  const totalEntries = data.totalEntries || 0
  const period = data.period || 'week'
  const percentageChange = data.sentiment?.trend?.percentageChange || 0
  const trendDescription = data.sentiment?.trend?.description || 'No change'
  
  const sentimentColor = getSentimentColor(sentimentLabel)
  const trendDirection = getTrendDirection(percentageChange)
  
  const cardProps: InsightCardProps = {
    title: 'Sentiment Summary',
    subtitle: `Last ${period}`,
    value: formatSentimentValue(sentimentScore),
    trend: {
      direction: trendDirection,
      percentage: Math.abs(percentageChange),
      description: trendDescription
    },
    icon: (
      <span className="text-2xl">{getSentimentIcon(sentimentLabel)}</span>
    ),
    className: getSentimentBackgroundColor(sentimentLabel),
    textColor: sentimentColor,
    onPress
  }
  
  return (
    <div>
      <InsightCard {...cardProps}>
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Sentiment Distribution
          </h4>
          <div className="space-y-3">
            {Object.entries(distribution)
              .filter(([_, percentage]) => percentage > 0).length > 0 ? (
              Object.entries(distribution)
                .filter(([_, percentage]) => percentage > 0) // Only show sentiments with > 0%
                .map(([sentiment, percentage]) => (
                <div key={sentiment} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold capitalize" style={{ color: getSentimentColor(sentiment) }}>
                      {sentiment}
                    </span>
                    <span className="text-sm font-bold px-2 py-1 rounded-full bg-white dark:bg-gray-800 shadow-sm" style={{ color: getSentimentColor(sentiment) }}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                      style={{ 
                        backgroundColor: getSentimentColor(sentiment),
                        width: `${Math.max(percentage, 2)}%` // Ensure minimum 2% width for visibility
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                  No sentiment data available
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Based on {totalEntries} journal entries
            </p>
          </div>
        </div>
      </InsightCard>
    </div>
  )
}
