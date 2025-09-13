import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'

export interface NudgeCardProps {
  id: string
  title: string
  message: string
  priority: 'high' | 'medium' | 'low'
  action: string
  generatedAt: string
  onPress?: () => void
  onDismiss?: () => void
}

export default function NudgeCard({
  id,
  title,
  message,
  priority,
  action,
  generatedAt,
  onPress,
  onDismiss
}: NudgeCardProps) {
  const colors = useThemeColors()
  
  const getPriorityColor = () => {
    switch (priority) {
      case 'high': return '#ef4444' // red
      case 'medium': return '#f59e0b' // amber
      case 'low': return '#10b981' // green
      default: return colors.accent
    }
  }

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high': return 'alert-circle'
      case 'medium': return 'info'
      case 'low': return 'check-circle'
      default: return 'info'
    }
  }

  const getActionIcon = () => {
    switch (action) {
      case 'journal_now': return 'edit-3'
      case 'plan_activity': return 'calendar'
      case 'self_care': return 'heart'
      case 'celebrate': return 'star'
      case 'plan_weekend': return 'calendar'
      case 'optimize_timing': return 'clock'
      default: return 'arrow-right'
    }
  }

  const priorityColor = getPriorityColor()
  const priorityIcon = getPriorityIcon()
  const actionIcon = getActionIcon()

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.priorityContainer}>
            <Feather name={priorityIcon} size={16} color={priorityColor} />
            <Text style={[styles.priority, { color: priorityColor }]}>
              {priority.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity 
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.dismissButton}
          >
            <Feather name="x" size={18} color={colors.muted} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      
      <View style={styles.footer}>
        <View style={styles.actionContainer}>
          <Feather name={actionIcon} size={14} color={colors.accent} />
          <Text style={[styles.actionText, { color: colors.accent }]}>
            {action.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.muted }]}>
          {new Date(generatedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priority: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dismissButton: {
    padding: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 11,
  },
})
