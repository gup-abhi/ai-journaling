import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useThemeColors } from '../theme/colors'

interface NarrativeSummaryProps {
  summary: string
  onPress?: () => void
}

export default function NarrativeSummary({ summary, onPress }: NarrativeSummaryProps) {
  const colors = useThemeColors()

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: colors.accent }]}>💭</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.accent }]}>Your Story</Text>
          <Text style={[styles.summary, { color: colors.text }]}>{summary}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
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
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    fontStyle: 'italic',
  },
})
