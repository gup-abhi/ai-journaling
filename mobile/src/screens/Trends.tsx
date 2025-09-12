import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useThemeColors } from '../theme/colors'
import { Calendar } from 'react-native-calendars'
import { useStreakStore } from '../stores/streak.store'
import { getSentimentSummary, type SentimentSummaryData, isApiErr } from '../lib/api'
import SentimentSummaryCard from '../components/SentimentSummaryCard'
import Toast from 'react-native-simple-toast'

export default function Trends() {
  const colors = useThemeColors()
  const { journalingDays, getStreakData } = useStreakStore()
  const [sentimentData, setSentimentData] = useState<SentimentSummaryData | null>(null)
  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')

  useEffect(() => {
    getStreakData()
  }, [])

  useEffect(() => {
    fetchSentimentData()
  }, [selectedPeriod])

  const fetchSentimentData = async () => {
    setIsLoadingSentiment(true)
    try {
      const result = await getSentimentSummary(selectedPeriod)
      if (result.ok) {
        // Validate the data structure before setting it
        if (result.data && result.data.sentiment && result.data.sentiment.label) {
          setSentimentData(result.data)
        } else {
          console.error('Invalid sentiment data structure:', result.data)
          setSentimentData(null)
          Toast.show('Unable to load sentiment data. Please try again.', Toast.SHORT)
        }
      } else if (isApiErr(result)) {
        console.error('Failed to fetch sentiment data:', result.error)
        setSentimentData(null)
        
        // Show user-friendly toast based on error type
        if (result.status === 401) {
          Toast.show('Please sign in again to view your trends', Toast.SHORT)
        } else if (result.status >= 500) {
          Toast.show('Server error. Please try again later.', Toast.SHORT)
        } else if (result.status === 404) {
          Toast.show('No sentiment data available for this period', Toast.SHORT)
        } else {
          Toast.show('Unable to load sentiment data. Please try again.', Toast.SHORT)
        }
      }
    } catch (error) {
      console.error('Error fetching sentiment data:', error)
      setSentimentData(null)
      Toast.show('Network error. Please check your connection.', Toast.SHORT)
    } finally {
      setIsLoadingSentiment(false)
    }
  }

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period)
    fetchSentimentData()
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

      {/* Sentiment Summary Card */}
      {isLoadingSentiment ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading sentiment data...</Text>
        </View>
      ) : sentimentData ? (
        <SentimentSummaryCard 
          data={sentimentData} 
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
})