import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native'
import { useThemeColors } from '../theme/colors'
import { Calendar } from 'react-native-calendars'
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-gifted-charts'
import { useAiInsightStore } from '../stores/ai-insight.store'
import { useStreakStore } from '../stores/streak.store'
import { Feather } from '@expo/vector-icons'

type Period = 'week' | 'month' | 'year'

const EMOTION_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF69B4', '#8A2BE2']

export default function Trends() {
  const colors = useThemeColors()
  const [period, setPeriod] = useState<Period>('month')
  const screenWidth = Dimensions.get('window').width - 32

  const {
    sentimentTrends,
    topThemesTrends,
    emotionDistribution,
    emotionIntensityHeatmap,
    thematicSentiment,
    themeActionRadarData,
    entitySentimentTreemap,
    cognitivePatternFrequency,
    topStressors,
    isSentimentLoading,
    isThemesLoading,
    isEmotionDistributionLoading,
    isEmotionIntensityHeatmapLoading,
    isThematicSentimentLoading,
    isThemeActionLoading,
    isEntitySentimentLoading,
    isCognitivePatternLoading,
    isTopStressorsLoading,
    fetchSentimentTrends,
    fetchTopThemes,
    fetchEmotionDistribution,
    fetchEmotionIntensityHeatmap,
    fetchThematicSentiment,
    fetchThemeActionRadarData,
    fetchEntitySentimentTreemap,
    fetchCognitivePatternFrequency,
    fetchTopStressors
  } = useAiInsightStore()

  const { journalingDays, getStreakData } = useStreakStore()

  useEffect(() => {
    getStreakData()
    fetchSentimentTrends(period)
    fetchTopThemes(period, 10)
    fetchEmotionDistribution(period)
    fetchEmotionIntensityHeatmap(period)
    fetchThematicSentiment(period)
    fetchThemeActionRadarData(period)
    fetchEntitySentimentTreemap(period, 10)
    fetchCognitivePatternFrequency(period, 10)
    fetchTopStressors(period, 10)
  }, [period])

  const PeriodSelector = () => (
    <View style={[styles.periodSelector, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {(['week', 'month', 'year'] as Period[]).map((p) => (
        <TouchableOpacity
          key={p}
          onPress={() => setPeriod(p)}
          style={[
            styles.periodButton,
            { backgroundColor: period === p ? colors.accent : 'transparent' }
          ]}
        >
          <Text style={[
            styles.periodButtonText,
            { color: period === p ? colors.background : colors.text }
          ]}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const tileClassName = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`
    return journalingDays && journalingDays.get(dateString)
  }

  const getMarkedDates = () => {
    const marked: any = {}
    if (journalingDays) {
      console.log('Mobile: Journaling days data:', Array.from(journalingDays.entries()))
      journalingDays.forEach((value, dateString) => {
        if (value) {
          console.log('Mobile: Marking date:', dateString)
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

  const renderChart = (title: string, children: React.ReactNode, isLoading?: boolean) => (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.accent }]}>{title}</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        children
      )}
    </View>
  )

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }} 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Trends & Analytics</Text>
        <PeriodSelector />
      </View>

      {/* Journaling Activity Calendar */}
      {renderChart(`Journaling Activity (${getJournaledDaysCount()} days)`, (
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

      {/* Sentiment Trends */}
      {renderChart('Sentiment Over Time', (
        sentimentTrends && sentimentTrends.length > 0 ? (
          <View style={styles.chartContainer}>
            <LineChart
              data={sentimentTrends.map((item, index) => ({
                value: item.sentiment,
                label: item.date.slice(-5), // MM-DD format
                dataPointText: item.sentiment.toFixed(2),
              }))}
              height={220}
              width={screenWidth - 60}
              curved
              color={colors.accent}
              thickness={3}
              dataPointsColor={colors.accent}
              textColor={colors.muted}
              textFontSize={12}
              hideRules
              hideAxesAndRules={false}
              rulesColor={colors.border}
              rulesType="solid"
              yAxisColor={colors.border}
              xAxisColor={colors.border}
              showVerticalLines
              verticalLinesColor={colors.border}
              initialSpacing={20}
              endSpacing={20}
              animateOnDataChange
              animationDuration={800}
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.muted }}>No sentiment data available</Text>
          </View>
        )
      ), isSentimentLoading)}

      {/* Top Key Themes */}
      {renderChart('Top Key Themes', (
        topThemesTrends.top_themes && topThemesTrends.top_themes.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={topThemesTrends.top_themes.slice(0, 5).map((theme, index) => ({
                value: theme.frequency,
                label: theme.theme.length > 8 ? theme.theme.slice(0, 8) + '..' : theme.theme,
                frontColor: colors.accent,
                gradientColor: colors.accent,
                spacing: 2,
                labelWidth: 60,
                labelTextStyle: { color: colors.muted, fontSize: 10 },
              }))}
              height={220}
              width={screenWidth - 60}
              barWidth={35}
              spacing={25}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.muted }}
              noOfSections={4}
              maxValue={Math.max(...topThemesTrends.top_themes.slice(0, 5).map(t => t.frequency)) * 1.2}
              isAnimated
              animationDuration={1000}
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.muted }}>No theme data available</Text>
          </View>
        )
      ), isThemesLoading)}

      {/* Emotion Distribution */}
      {renderChart('Emotion Distribution', (
        emotionDistribution && emotionDistribution.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={emotionDistribution.map((emotion, index) => ({
                value: emotion.count,
                color: EMOTION_COLORS[index % EMOTION_COLORS.length],
                gradientCenterColor: EMOTION_COLORS[index % EMOTION_COLORS.length],
                text: emotion.emotion,
                textColor: colors.text,
                textSize: 12,
                shiftTextX: 0,
                shiftTextY: 0,
              }))}
              radius={90}
              innerRadius={30}
              centerLabelComponent={() => (
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, color: colors.text, fontWeight: 'bold' }}>
                    Emotions
                  </Text>
                </View>
              )}
              showText
              textColor={colors.text}
              textSize={10}
              showTextBackground
              textBackgroundColor={colors.cardBg}
              textBackgroundRadius={8}
              strokeColor={colors.cardBg}
              strokeWidth={2}
              isAnimated
              animationDuration={1200}
            />
            <View style={styles.legendContainer}>
              {emotionDistribution.slice(0, 6).map((emotion, index) => (
                <View key={emotion.emotion} style={styles.legendItem}>
                  <View 
                    style={[
                      styles.legendColor, 
                      { backgroundColor: EMOTION_COLORS[index % EMOTION_COLORS.length] }
                    ]} 
                  />
                  <Text style={[styles.legendText, { color: colors.text }]}>
                    {emotion.emotion} ({emotion.count})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.muted }}>No emotion data available</Text>
          </View>
        )
      ), isEmotionDistributionLoading)}

      {/* Thematic Sentiment */}
      {renderChart('Thematic Sentiment', (
        thematicSentiment && thematicSentiment.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={thematicSentiment.slice(0, 5).map((item: any) => {
                const sentiment = typeof item.sentiment === 'number' ? item.sentiment : item.value || 0
                const name = item.theme || item.name || 'Unknown'
                return {
                  value: Math.abs(sentiment),
                  label: name.length > 8 ? name.slice(0, 8) + '..' : name,
                  frontColor: sentiment > 0 ? colors.accent : sentiment < 0 ? '#FF6B6B' : '#FFA726',
                  gradientColor: sentiment > 0 ? colors.accent : sentiment < 0 ? '#FF6B6B' : '#FFA726',
                  spacing: 2,
                  labelWidth: 60,
                  labelTextStyle: { color: colors.muted, fontSize: 10 },
                  topLabelComponent: () => (
                    <Text style={{ color: colors.text, fontSize: 10, marginBottom: 4 }}>
                      {sentiment.toFixed(2)}
                    </Text>
                  ),
                }
              })}
              height={220}
              width={screenWidth - 60}
              barWidth={35}
              spacing={25}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.muted }}
              noOfSections={4}
              isAnimated
              animationDuration={1000}
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.muted }}>No thematic sentiment data available</Text>
          </View>
        )
      ), isThematicSentimentLoading)}

      {/* Top Stressors */}
      {renderChart('Top Stressors/Triggers', (
        topStressors && topStressors.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={topStressors.slice(0, 5).map((stressor: any) => {
                const name = stressor.stressor || stressor.name || 'Unknown'
                const value = stressor.frequency || stressor.count || 0
                return {
                  value: value,
                  label: name.length > 8 ? name.slice(0, 8) + '..' : name,
                  frontColor: '#FF6B6B',
                  gradientColor: '#FF4444',
                  spacing: 2,
                  labelWidth: 60,
                  labelTextStyle: { color: colors.muted, fontSize: 10 },
                  topLabelComponent: () => (
                    <Text style={{ color: colors.text, fontSize: 10, marginBottom: 4 }}>
                      {value}
                    </Text>
                  ),
                }
              })}
              height={220}
              width={screenWidth - 60}
              barWidth={35}
              spacing={25}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.muted }}
              noOfSections={4}
              maxValue={Math.max(...topStressors.slice(0, 5).map((s: any) => s.frequency || s.count || 0)) * 1.2}
              isAnimated
              animationDuration={1000}
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.muted }}>No stressor data available</Text>
          </View>
        )
      ), isTopStressorsLoading)}

      {/* Cognitive Pattern Frequency */}
      {renderChart('Cognitive Pattern Frequency', (
        cognitivePatternFrequency && cognitivePatternFrequency.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={cognitivePatternFrequency.slice(0, 5).map((pattern: any) => {
                const name = pattern.pattern || pattern.name || 'Unknown'
                const value = pattern.frequency || pattern.count || 0
                return {
                  value: value,
                  label: name.length > 8 ? name.slice(0, 8) + '..' : name,
                  frontColor: '#8A2BE2',
                  gradientColor: '#9932CC',
                  spacing: 2,
                  labelWidth: 60,
                  labelTextStyle: { color: colors.muted, fontSize: 10 },
                  topLabelComponent: () => (
                    <Text style={{ color: colors.text, fontSize: 10, marginBottom: 4 }}>
                      {value}
                    </Text>
                  ),
                }
              })}
              height={220}
              width={screenWidth - 60}
              barWidth={35}
              spacing={25}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.muted }}
              noOfSections={4}
              maxValue={Math.max(...cognitivePatternFrequency.slice(0, 5).map((p: any) => p.frequency || p.count || 0)) * 1.2}
              isAnimated
              animationDuration={1000}
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.muted }}>No cognitive pattern data available</Text>
          </View>
        )
      ), isCognitivePatternLoading)}

      {/* Emotion Intensity */}
      {renderChart('Emotion Intensity', (
        emotionIntensityHeatmap && emotionIntensityHeatmap.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={emotionIntensityHeatmap.slice(0, 6).map((item: any) => {
                const name = item.emotion || item.name || 'Unknown'
                const value = item.intensity || item.value || 0
                return {
                  value: value,
                  label: name.length > 6 ? name.slice(0, 6) + '..' : name,
                  frontColor: '#FFA726',
                  gradientColor: '#FFB74D',
                  spacing: 2,
                  labelWidth: 50,
                  labelTextStyle: { color: colors.muted, fontSize: 10 },
                  topLabelComponent: () => (
                    <Text style={{ color: colors.text, fontSize: 10, marginBottom: 4 }}>
                      {value.toFixed(1)}
                    </Text>
                  ),
                }
              })}
              height={220}
              width={screenWidth - 60}
              barWidth={30}
              spacing={20}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.muted }}
              noOfSections={4}
              maxValue={Math.max(...emotionIntensityHeatmap.slice(0, 6).map((item: any) => item.intensity || item.value || 0)) * 1.2}
              isAnimated
              animationDuration={1000}
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.muted }}>No emotion intensity data available</Text>
          </View>
        )
      ), isEmotionIntensityHeatmapLoading)}

      {/* Entity Sentiment Analysis */}
      {renderChart('Entity Sentiment Analysis', (
        entitySentimentTreemap && entitySentimentTreemap.length > 0 ? (
          <View style={styles.chartContainer}>
            <BarChart
              data={entitySentimentTreemap.slice(0, 5).map((item: any) => {
                const sentiment = item.sentiment || item.value || 0
                const name = item.entity || item.name || 'Unknown'
                return {
                  value: Math.abs(sentiment),
                  label: name.length > 8 ? name.slice(0, 8) + '..' : name,
                  frontColor: sentiment > 0 ? '#4CAF50' : sentiment < 0 ? '#F44336' : '#FF9800',
                  gradientColor: sentiment > 0 ? '#66BB6A' : sentiment < 0 ? '#EF5350' : '#FFB74D',
                  spacing: 2,
                  labelWidth: 60,
                  labelTextStyle: { color: colors.muted, fontSize: 10 },
                  topLabelComponent: () => (
                    <Text style={{ color: colors.text, fontSize: 10, marginBottom: 4 }}>
                      {sentiment.toFixed(2)}
                    </Text>
                  ),
                }
              })}
              height={220}
              width={screenWidth - 60}
              barWidth={35}
              spacing={25}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={1}
              yAxisThickness={1}
              xAxisColor={colors.border}
              yAxisColor={colors.border}
              yAxisTextStyle={{ color: colors.muted }}
              noOfSections={4}
              isAnimated
              animationDuration={1000}
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={{ color: colors.muted }}>No entity sentiment data available</Text>
          </View>
        )
      ), isEntitySentimentLoading)}

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
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600'
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
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noDataContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500'
  },
  emotionContainer: {
    gap: 8
  },
  emotionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1
  },
  emotionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  emotionColor: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  emotionName: {
    fontSize: 14,
    fontWeight: '500'
  },
  emotionCount: {
    fontSize: 16,
    fontWeight: '700'
  },
  listContainer: {
    gap: 8
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  },
  listItemValue: {
    fontSize: 14,
    fontWeight: '700'
  },
  calendarInfo: {
    marginTop: 12,
    paddingHorizontal: 8
  },
  calendarInfoText: {
    fontSize: 12,
    marginBottom: 4
  }
})