import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'
import { Calendar } from 'react-native-calendars'
import { useStreakStore } from '../stores/streak.store'
import { useAiInsightStore } from '../stores/ai-insight.store'
import SentimentSummaryCard from '../components/SentimentSummaryCard'
import NarrativeSummary from '../components/NarrativeSummary'
import Toast from 'react-native-simple-toast'
import Header from '../components/Header'

export default function Trends() {
  const colors = useThemeColors()
  const navigation = useNavigation()
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
  const [refreshing, setRefreshing] = useState(false)

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

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        getStreakData(),
        fetchSentimentSummary(selectedPeriod),
        fetchTopThemesData(selectedPeriod, 8)
      ])
    } catch (error) {
      console.error('Error refreshing trends data:', error)
    } finally {
      setRefreshing(false)
    }
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

  // Create data for FlatList
  const getTrendsData = () => {
    const data = []
    
    // Period Selector
    data.push({ id: 'period-selector', type: 'period-selector' })
    
    // Narrative Summary
    if (isSentimentSummaryLoading) {
      data.push({ id: 'narrative-loading', type: 'narrative-loading' })
    } else if (sentimentSummaryData && sentimentSummaryData.narrativeSummary) {
      data.push({ id: 'narrative-summary', type: 'narrative-summary', data: sentimentSummaryData.narrativeSummary })
    } else if (sentimentSummaryData && !sentimentSummaryData.narrativeSummary) {
      data.push({ id: 'narrative-error', type: 'narrative-error' })
    }
    
    // Sentiment Summary
    if (isSentimentSummaryLoading) {
      data.push({ id: 'sentiment-loading', type: 'sentiment-loading' })
    } else if (sentimentSummaryData) {
      data.push({ id: 'sentiment-summary', type: 'sentiment-summary', data: sentimentSummaryData })
    } else {
      data.push({ id: 'sentiment-error', type: 'sentiment-error' })
    }
    
    // Top Themes
    if (isTopThemesDataLoading) {
      data.push({ id: 'themes-loading', type: 'themes-loading' })
    } else if (topThemesData && topThemesData.top_themes.length > 0) {
      data.push({ id: 'top-themes', type: 'top-themes', data: topThemesData })
    } else {
      data.push({ id: 'themes-error', type: 'themes-error' })
    }
    
    // Timeline Button
    data.push({ id: 'timeline-button', type: 'timeline-button' })
    
    // Calendar
    data.push({ id: 'calendar', type: 'calendar' })
    
    return data
  }

  const renderCard = (title: string, children: React.ReactNode) => (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.accent }]}>{title}</Text>
      {children}
    </View>
  )

  const renderTrendsItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'period-selector':
        return (
          <View style={styles.periodSelectorContainer}>
            {renderPeriodSelector()}
          </View>
        )
      
      case 'narrative-loading':
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.loadingContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading your story...</Text>
            </View>
          </View>
        )
      
      case 'narrative-summary':
        return (
          <View style={styles.itemContainer}>
            <NarrativeSummary 
              summary={item.data}
              onPress={() => {
                Toast.show('Narrative insights help you understand your emotional patterns!', Toast.SHORT)
              }}
            />
          </View>
        )
      
      case 'narrative-error':
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.errorContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.errorText, { color: colors.muted }]}>
                Unable to generate narrative summary
              </Text>
              <Text style={[styles.errorSubtext, { color: colors.muted }]}>
                Try refreshing or check back later
              </Text>
            </View>
          </View>
        )
      
      case 'sentiment-loading':
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.loadingContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading sentiment data...</Text>
            </View>
          </View>
        )
      
      case 'sentiment-summary':
        return (
          <View style={styles.itemContainer}>
            <SentimentSummaryCard 
              data={item.data} 
              onPress={() => {
                Toast.show('Sentiment details coming soon!', Toast.SHORT)
              }}
            />
          </View>
        )
      
      case 'sentiment-error':
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.errorContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.errorText, { color: colors.muted }]}>
                No sentiment data available
              </Text>
              <Text style={[styles.errorSubtext, { color: colors.muted }]}>
                Start journaling to see your sentiment trends
              </Text>
            </View>
          </View>
        )
      
      case 'themes-loading':
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.loadingContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading themes data...</Text>
            </View>
          </View>
        )
      
      case 'top-themes':
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.accent }]}>Top Themes</Text>
              <View style={styles.themesContainer}>
                {item.data.top_themes.map((theme: any, index: number) => (
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
                      navigation.navigate('ThemeDetail' as never, { 
                        theme: theme.theme, 
                        period: selectedPeriod 
                      } as never)
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
              <Text style={[styles.themesHint, { color: colors.muted }]}>
                Tap on any theme to explore related journal entries
              </Text>
            </View>
          </View>
        )
      
      case 'themes-error':
        return (
          <View style={styles.itemContainer}>
            <View style={[styles.errorContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Text style={[styles.errorText, { color: colors.muted }]}>
                No themes data available
              </Text>
              <Text style={[styles.errorSubtext, { color: colors.muted }]}>
                Start journaling to see your recurring themes
              </Text>
            </View>
          </View>
        )
      
      case 'timeline-button':
        return (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              style={[styles.timelineButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Timeline' as never)}
            >
              <View style={styles.timelineButtonContent}>
                <View style={styles.timelineButtonLeft}>
                  <View style={[styles.timelineIcon, { backgroundColor: colors.accent + '20' }]}>
                    <Feather name="clock" size={24} color={colors.accent} />
                  </View>
                  <View style={styles.timelineButtonText}>
                    <Text style={[styles.timelineButtonTitle, { color: colors.text }]}>
                      Interactive Timeline
                    </Text>
                    <Text style={[styles.timelineButtonSubtitle, { color: colors.muted }]}>
                      Explore your journal entries chronologically
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.muted} />
              </View>
            </TouchableOpacity>
          </View>
        )
      
      case 'calendar':
        return (
          <View style={styles.itemContainer}>
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
          </View>
        )
      
      default:
        return null
    }
  }

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Trends & Insights" />
      
      <FlatList
        data={getTrendsData()}
        keyExtractor={(item) => item.id}
        renderItem={renderTrendsItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { marginTop: 20 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 48 
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
    gap: 16
  },
  itemContainer: {
    marginBottom: 16,
  },
  periodSelectorContainer: {
    marginBottom: 8,
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
    marginBottom: 8,
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
  timelineButton: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  timelineButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timelineButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timelineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  timelineButtonText: {
    flex: 1,
  },
  timelineButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineButtonSubtitle: {
    fontSize: 14,
    lineHeight: 20,
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
  themesHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
})