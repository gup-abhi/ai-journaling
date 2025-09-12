import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'
import { useTimelineStore } from '../stores/timeline.store'
import Timeline from '../components/Timeline'
import { useNavigation } from '@react-navigation/native'
import { type TimelinePeriod } from '../types/Timeline.type'

export default function TimelineScreen() {
  const colors = useThemeColors()
  const navigation = useNavigation()
  const {
    timelineData,
    isLoading: isTimelineLoading,
    selectedPeriod,
    selectedTheme,
    fetchTimelineData,
    setSelectedPeriod,
    setSelectedTheme
  } = useTimelineStore()

  useEffect(() => {
    fetchTimelineData(selectedPeriod)
  }, [selectedPeriod, fetchTimelineData])

  const handlePeriodChange = (period: TimelinePeriod) => {
    setSelectedPeriod(period)
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Timeline</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.periodSelectorContainer}>
        <Text style={[styles.periodLabel, { color: colors.text }]}>Time Period:</Text>
        <View style={styles.periodSelector}>
          {(['week', 'month', 'year'] as TimelinePeriod[]).map((period) => (
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
      </View>

      <View style={styles.timelineContainer}>
        <Timeline
          entries={timelineData}
          isLoading={isTimelineLoading}
          selectedTheme={selectedTheme}
          onThemeFilter={setSelectedTheme}
          onEntryPress={(entry) => {
            // Could navigate to journal entry detail
            console.log('Timeline entry pressed:', entry.id)
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40, // Same width as back button to center title
  },
  periodSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  periodLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  periodSelector: {
    flexDirection: 'row',
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
  timelineContainer: {
    flex: 1,
    padding: 16,
  },
})
