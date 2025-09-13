import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native'
import { useToast } from '../contexts/ToastContext'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useThemeColors } from '../theme/colors'
import { useGoalStore } from '../stores/goal.store'
import type { Goal } from '../stores/goal.store'
import Header from '../components/Header'

export default function Goals() {
  const colors = useThemeColors()
  const nav = useNavigation<any>()
  const { showToast } = useToast()
  const { goals, fetchGoals, deleteGoal, isLoading, currentFilter, setFilter } = useGoalStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchGoals(currentFilter)
  }, [fetchGoals, currentFilter])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await fetchGoals(currentFilter)
    } finally {
      setRefreshing(false)
    }
  }, [fetchGoals, currentFilter])

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
  }

  const getProgressIcon = (progress: string) => {
    switch (progress) {
      case "not-started":
        return { name: "x-circle" as const, color: colors.muted }
      case "in-progress":
        return { name: "clock" as const, color: "#3b82f6" }
      case "completed":
        return { name: "check-circle" as const, color: "#10b981" }
      case "on-hold":
        return { name: "pause-circle" as const, color: "#f59e0b" }
      default:
        return { name: "circle" as const, color: colors.muted }
    }
  }

  const handleDeleteGoal = (goalId: string, goalName: string) => {
    Alert.alert(
      'Delete Goal',
      `Are you sure you want to delete "${goalName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              showToast(`Deleting "${goalName}"...`, 'info', 2000)
              await deleteGoal(goalId)
              // Refresh the goals list to ensure UI is in sync
              await fetchGoals(currentFilter)
              showToast('Goal deleted successfully!', 'success')
            } catch (error) {
              showToast('Failed to delete goal. Please try again.', 'error')
            }
          },
        },
      ]
    )
  }

  const FilterButton = ({ label, value, isActive }: { label: string; value: string; isActive: boolean }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: isActive ? colors.accent : colors.cardBg,
          borderColor: isActive ? colors.accent : colors.border
        }
      ]}
      onPress={() => handleFilterChange(value)}
    >
      <Text style={[
        styles.filterButtonText,
        { color: isActive ? '#fff' : colors.text }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Header title="My Goals" />

          {/* Filter Buttons */}
          <View style={[styles.filterContainer, { marginTop: 20 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Filter by Status</Text>
            <View style={styles.filterRow}>
              {[
                { key: "all", label: "All", value: "all" },
                { key: "not-started", label: "Not Started", value: "not-started" },
                { key: "in-progress", label: "In Progress", value: "in-progress" },
                { key: "completed", label: "Completed", value: "completed" },
                { key: "on-hold", label: "On Hold", value: "on-hold" }
              ].map(({ key, label, value }) => (
                <FilterButton 
                  key={key} 
                  label={label} 
                  value={value} 
                  isActive={currentFilter === value} 
                />
              ))}
            </View>
          </View>

          {/* Goals Grid */}
          {isLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.muted }]}>Loading goals...</Text>
            </View>
          ) : goals.length > 0 ? (
            <View style={styles.goalsGrid}>
              {goals
                .filter((goal) => goal && goal._id && goal.name) // Filter out invalid goals
                .map((goal) => (
                  <GoalCard
                    key={goal._id}
                    goal={goal}
                    onDelete={handleDeleteGoal}
                    onUpdate={() => nav.navigate('UpdateGoal', { goalId: goal._id })}
                    colors={colors}
                  />
                ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="target" size={48} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No goals found</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {currentFilter === "all"
                  ? "Get started by adding your first goal!"
                  : `No goals with status "${currentFilter}". Try changing the filter.`
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => nav.navigate('NewGoal')}
        activeOpacity={0.8}
        accessibilityLabel="Add new goal"
        accessibilityRole="button"
      >
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  )
}

function GoalCard({
  goal,
  onDelete,
  onUpdate,
  colors
}: {
  goal: Goal
  onDelete: (goalId: string, goalName: string) => void
  onUpdate: () => void
  colors: any
}) {
  const progressIcon = getProgressIcon(goal.progress)

  function getProgressIcon(progress: string | undefined) {
    if (!progress) {
      return { name: "circle" as const, color: colors.muted }
    }
    switch (progress) {
      case "not-started":
        return { name: "x-circle" as const, color: colors.muted }
      case "in-progress":
        return { name: "clock" as const, color: "#3b82f6" }
      case "completed":
        return { name: "check-circle" as const, color: "#10b981" }
      case "on-hold":
        return { name: "pause-circle" as const, color: "#f59e0b" }
      default:
        return { name: "circle" as const, color: colors.muted }
    }
  }

  return (
    <View style={[styles.goalCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.goalTitle, { color: colors.text }]} numberOfLines={2}>
          {goal.name || 'Untitled Goal'}
        </Text>
        <View style={styles.progressContainer}>
          <Feather name={progressIcon.name} size={16} color={progressIcon.color} />
          <Text style={[styles.progressText, { color: colors.muted }]}>
            {goal.progress ? goal.progress.replace('-', ' ') : 'Unknown'}
          </Text>
        </View>
      </View>

      {goal.description && (
        <Text style={[styles.goalDescription, { color: colors.text }]} numberOfLines={3}>
          {goal.description}
        </Text>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.accent, backgroundColor: colors.accentBg }]}
          onPress={onUpdate}
        >
          <Feather name="edit-2" size={14} color={colors.accent} />
          <Text style={[styles.actionButtonText, { color: colors.accent, fontWeight: '600' }]}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, { borderColor: '#ef4444' }]}
          onPress={() => onDelete(goal._id, goal.name)}
        >
          <Feather name="trash-2" size={14} color="#ef4444" />
          <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingTop: 32 },

  filterContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterButtonText: { fontSize: 12, fontWeight: '500' },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: { marginTop: 12, fontSize: 16 },

  goalsGrid: { gap: 12 },
  goalCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressText: { fontSize: 12, textTransform: 'capitalize' },
  goalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
    minHeight: 36,
  },
  actionButtonText: { fontSize: 13, fontWeight: '600' },
  deleteButton: { backgroundColor: '#fef2f2' },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
})


