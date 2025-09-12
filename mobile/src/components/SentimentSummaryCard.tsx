import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useThemeColors } from '../theme/colors'
import InsightCard, { InsightCardProps } from './InsightCard'
import { SentimentSummaryData } from '../types/Sentiment.type'

interface SentimentSummaryCardProps {
  data: SentimentSummaryData
  onPress?: () => void
}

export default function SentimentSummaryCard({ data, onPress }: SentimentSummaryCardProps) {
  const colors = useThemeColors()
  
  // Add safety checks for data structure
  if (!data || !data.sentiment) {
    return (
      <View style={[styles.errorCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
        <Text style={[styles.errorText, { color: colors.muted }]}>Unable to display sentiment data</Text>
      </View>
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
      case 'positive': return '#ECFDF5' // light green
      case 'negative': return '#FEF2F2' // light red
      case 'mixed': return '#FFFBEB' // light amber
      default: return colors.cardBg // neutral
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
  const trendData = data.trendData || []
  const distribution = data.distribution || { positive: 0, negative: 0, neutral: 0, mixed: 0 }
  const totalEntries = data.totalEntries || 0
  const period = data.period || 'week'
  const percentageChange = data.sentiment?.trend?.percentageChange || 0
  const trendDescription = data.sentiment?.trend?.description || 'No change'
  
  const sentimentColor = getSentimentColor(sentimentLabel)
  const backgroundColor = getSentimentBackgroundColor(sentimentLabel)
  const trendDirection = getTrendDirection(percentageChange)
  
  // Prepare trend data for the chart
  const chartTrendData = trendData.map(item => ({
    value: item.value,
    label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))
  
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
      <Text style={styles.sentimentIcon}>{getSentimentIcon(sentimentLabel)}</Text>
    ),
    backgroundColor,
    textColor: sentimentColor,
    trendData: chartTrendData.length > 1 ? chartTrendData : undefined,
    onPress
  }
  
  return (
    <View>
      <InsightCard {...cardProps}>
        <View style={styles.distributionContainer}>
          <Text style={[styles.distributionTitle, { color: colors.muted }]}>
            Sentiment Distribution
          </Text>
          <View style={styles.distributionBars}>
            {Object.entries(distribution)
              .filter(([_, percentage]) => percentage > 0).length > 0 ? (
              Object.entries(distribution)
                .filter(([_, percentage]) => percentage > 0) // Only show sentiments with > 0%
                .map(([sentiment, percentage]) => (
                <View key={sentiment} style={styles.distributionItem}>
                <View style={styles.distributionBarContainer}>
                    <View 
                      style={[
                        styles.distributionBar, 
                        { 
                          backgroundColor: getSentimentColor(sentiment),
                          width: `${Math.max(percentage, 2)}%` // Ensure minimum 2% width for visibility
                        }
                      ]} 
                    />
                    {percentage < 5 && (
                      <View style={styles.smallPercentageIndicator}>
                        <Text style={styles.smallPercentageText}>•</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.distributionLabel, { color: getSentimentColor(sentiment) }]}>
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} {percentage}%
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.noDataText, { color: colors.muted }]}>
                No sentiment data available
              </Text>
            )}
          </View>
          <Text style={[styles.entriesCount, { color: colors.muted }]}>
            Based on {totalEntries} journal entries
          </Text>
        </View>
      </InsightCard>
    </View>
  )
}

const styles = StyleSheet.create({
  sentimentIcon: {
    fontSize: 24,
  },
  distributionContainer: {
    marginTop: 8,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  distributionBars: {
    marginBottom: 8,
  },
  distributionItem: {
    marginBottom: 6,
  },
  distributionBarContainer: {
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  distributionBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 3, // Ensure very small percentages are still visible
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  distributionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  entriesCount: {
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  smallPercentageIndicator: {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: [{ translateY: -6 }],
  },
  smallPercentageText: {
    color: '#6B7280',
    fontSize: 8,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  errorCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
})
