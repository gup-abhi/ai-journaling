import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useThemeColors } from '../theme/colors'
import { Calendar } from 'react-native-calendars'
import { useStreakStore } from '../stores/streak.store'
import { useAiInsightStore } from '../stores/ai-insight.store'
import SentimentSummaryCard from '../components/SentimentSummaryCard'
import NarrativeSummary from '../components/NarrativeSummary'
import Toast from 'react-native-simple-toast'

export default function Trends() {
  const colors = useThemeColors()
  const { journalingDays, getStreakData } = useStreakStore()
  const {
    sentimentSummaryData,
    topThemesData,
    isSentimentSummaryLoading,
    isTopThemesDataLoading,
    fetchSentimentSummary,
    fetchTopThemesData
  } = useAiInsightStore()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')

  useEffect(() => {
    getStreakData()
  }, [])

  useEffect(() => {
    fetchSentimentSummary(selectedPeriod)
    fetchTopThemesData(selectedPeriod, 8)
  }, [selectedPeriod, fetchSentimentSummary, fetchTopThemesData])


  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral' | 'mixed') => {
    switch (sentiment) {
      case 'positive':
        return '#10B981' // green
      case 'negative':
        return '#EF4444' // red
      case 'mixed':
        return '#F59E0B' // amber
      case 'neutral':
      default:
        return '#EAB308' // yellow
    }
  }

  const getSentimentBackgroundColor = (sentiment: 'positive' | 'negative' | 'neutral' | 'mixed') => {
    switch (sentiment) {
      case 'positive':
        return '#10B98120' // green with opacity
      case 'negative':
        return '#EF444420' // red with opacity
      case 'mixed':
        return '#F59E0B20' // amber with opacity
      case 'neutral':
      default:
        return '#EAB30820' // yellow with opacity
    }
  }

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period)
    fetchSentimentSummary(period)
    fetchTopThemesData(period, 8)
  }



  const getMarkedDates = () => {
    const marked: any = {}
    if (journalingDays) {
      // console.log('Mobile: Journaling days data:', Array.from(journalingDays.entries()))
      journalingDays.forEach((value, dateString) => {
        if (value) {
          // console.log('Mobile: Marking date:', dateString)
          marked[dateString] = {
            marked: true,
            dotColor: colors.accent,
            selectedColor: colors.accent,
            selectedTextColor: colors.background
          }
        }
      })
    }
    return marked
  }

  const getJournaledDaysCount = () => {
    if (!journalingDays) return 0
    return Array.from(journalingDays.values()).filter(Boolean).length
  }

  const renderCard = (title: string, children: React.ReactNode) => (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.accent }]}>{title}</Text>
      {children}
    </View>
  )

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {(['week', 'month', 'year'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period ? colors.accent : colors.cardBg,
              borderColor: colors.border,
            },
          ]}
          onPress={() => handlePeriodChange(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              {
                color: selectedPeriod === period ? colors.background : colors.text,
              },
            ]}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Trends & Insights</Text>
      </View>

      {/* Period Selector */}
      {renderPeriodSelector()}

      {/* Narrative Summary */}
      {isSentimentSummaryLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading your story...</Text>
        </View>
      ) : sentimentSummaryData && sentimentSummaryData.narrativeSummary ? (
        <NarrativeSummary 
          summary={sentimentSummaryData.narrativeSummary}
          onPress={() => {
            Toast.show('Narrative insights help you understand your emotional patterns!', Toast.SHORT)
          }}
        />
      ) : sentimentSummaryData && !sentimentSummaryData.narrativeSummary ? (
        <View style={[styles.errorContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.errorText, { color: colors.muted }]}>
            Unable to generate narrative summary
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.muted }]}>
            Try refreshing or check back later
          </Text>
        </View>
      ) : null}

      {/* Sentiment Summary Card */}
      {isSentimentSummaryLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading sentiment data...</Text>
        </View>
      ) : sentimentSummaryData ? (
        <SentimentSummaryCard 
          data={sentimentSummaryData} 
          onPress={() => {
            // Could navigate to detailed sentiment view
            Toast.show('Sentiment details coming soon!', Toast.SHORT)
          }}
        />
      ) : (
        <View style={[styles.errorContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.errorText, { color: colors.muted }]}>
            No sentiment data available
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.muted }]}>
            Start journaling to see your sentiment trends
          </Text>
        </View>
      )}

      {/* Top Themes Card */}
      {isTopThemesDataLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading themes data...</Text>
        </View>
      ) : topThemesData && topThemesData.top_themes.length > 0 ? (
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.accent }]}>Top Themes</Text>
          <View style={styles.themesContainer}>
            {topThemesData.top_themes.map((theme, index) => (
              <TouchableOpacity
                key={`${theme.theme}-${index}`}
                style={[
                  styles.themeTag, 
                  { 
                    backgroundColor: getSentimentBackgroundColor(theme.dominant_sentiment), 
                    borderColor: getSentimentColor(theme.dominant_sentiment) 
                  }
                ]}
                onPress={() => {
                  const sentimentBreakdown = Object.entries(theme.sentiment_breakdown)
                    .filter(([_, count]) => count > 0)
                    .map(([sentiment, count]) => `${sentiment}: ${count}`)
                    .join(', ')
                  Toast.show(
                    `${theme.theme}\nMentions: ${theme.frequency}\nSentiment: ${theme.dominant_sentiment}\nBreakdown: ${sentimentBreakdown}`, 
                    Toast.LONG
                  )
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.themeText, { color: getSentimentColor(theme.dominant_sentiment) }]}>
                  {theme.theme}
                </Text>
                <Text style={[styles.themeFrequency, { color: colors.muted }]}>
                  {theme.frequency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={[styles.errorContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <Text style={[styles.errorText, { color: colors.muted }]}>
            No themes data available
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.muted }]}>
            Start journaling to see your recurring themes
          </Text>
        </View>
      )}

      {/* Journaling Activity Calendar */}
      {renderCard(`Journaling Activity (${getJournaledDaysCount()} days)`, (
        <View>
          <Calendar
            markedDates={getMarkedDates()}
            theme={{
              calendarBackground: colors.cardBg,
              dayTextColor: colors.text,
              monthTextColor: colors.text,
              textDisabledColor: colors.muted,
              selectedDayBackgroundColor: colors.accent,
              selectedDayTextColor: colors.background,
              arrowColor: colors.accent,
              todayTextColor: colors.accent,
              dotColor: colors.accent
            }}
            enableSwipeMonths={true}
            onMonthChange={(month) => {
              console.log('Month changed:', month)
            }}
          />
          <View style={styles.calendarInfo}>
            <Text style={[styles.calendarInfoText, { color: colors.muted }]}>
              • Dots indicate journaled days
            </Text>
            <Text style={[styles.calendarInfoText, { color: colors.muted }]}>
              • Swipe to view different months
            </Text>
          </View>
        </View>
      ))}

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { 
    padding: 16, 
    paddingTop: 48, 
    gap: 16 
  },
  header: {
    marginBottom: 16
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    marginBottom: 16,
    textAlign: 'center'
  },
  card: { 
    borderWidth: 1, 
    borderRadius: 12, 
    padding: 16,
    marginBottom: 8
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  calendarInfo: {
    marginTop: 12,
    paddingHorizontal: 8
  },
  calendarInfoText: {
    fontSize: 12,
    marginBottom: 4
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  themeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  themeText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  themeFrequency: {
    fontSize: 10,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
})