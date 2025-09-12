import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useThemeColors } from '../theme/colors'
import { LineChart } from 'react-native-gifted-charts'

export interface InsightCardProps {
  title: string
  subtitle?: string
  value: string | number
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    percentage: number
    description: string
  }
  icon?: React.ReactNode
  backgroundColor?: string
  textColor?: string
  trendData?: Array<{ value: number; label?: string }>
  onPress?: () => void
  children?: React.ReactNode
}

export default function InsightCard({
  title,
  subtitle,
  value,
  trend,
  icon,
  backgroundColor,
  textColor,
  trendData,
  onPress,
  children
}: InsightCardProps) {
  const colors = useThemeColors()
  
  const cardBackgroundColor = backgroundColor || colors.cardBg
  const cardTextColor = textColor || colors.text
  
  const getTrendColor = () => {
    if (!trend) return colors.muted
    switch (trend.direction) {
      case 'up': return '#10B981' // green
      case 'down': return '#EF4444' // red
      default: return colors.muted
    }
  }
  
  const getTrendIcon = () => {
    if (!trend) return null
    switch (trend.direction) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  const renderTrendLine = () => {
    if (!trendData || trendData.length < 2) return null
    
    const chartData = trendData.map((item, index) => ({
      value: item.value,
      label: item.label || `${index + 1}`
    }))
    
    return (
      <View style={styles.trendChart}>
        <LineChart
          data={chartData}
          width={120}
          height={40}
          color={getTrendColor()}
          thickness={2}
          hideDataPoints
          hideRules
          hideYAxisText
          hideAxesAndRules
          startFillColor={getTrendColor()}
          endFillColor={getTrendColor()}
          startOpacity={0.3}
          endOpacity={0.1}
          areaChart
          curved
        />
      </View>
    )
  }

  const CardContent = () => (
    <View style={[styles.card, { backgroundColor: cardBackgroundColor, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: cardTextColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
          )}
        </View>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: cardTextColor }]}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Text style={[styles.trendIcon, { color: getTrendColor() }]}>
              {getTrendIcon()}
            </Text>
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {trend.description}
            </Text>
          </View>
        )}
      </View>
      
      {trendData && trendData.length > 0 && (
        <View style={styles.chartContainer}>
          {renderTrendLine()}
        </View>
      )}
      
      {children && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </View>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    )
  }

  return <CardContent />
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  iconContainer: {
    marginLeft: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  trendChart: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  childrenContainer: {
    marginTop: 12,
  },
})
