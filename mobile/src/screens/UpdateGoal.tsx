import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useThemeColors } from '../theme/colors'
import { useGoalStore } from '../stores/goal.store'
import type { Goal } from '../stores/goal.store'

export default function UpdateGoal() {
  const colors = useThemeColors()
  const nav = useNavigation<any>()
  const route = useRoute<any>()
  const { goalId } = route.params || {}
  const { goals, fetchGoals, updateGoal, isLoading } = useGoalStore()

  const [goal, setGoal] = useState<Goal | null>(null)
  const [progress, setProgress] = useState('')

  const progressOptions = [
    { label: 'Not Started', value: 'not-started' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'On Hold', value: 'on-hold' },
  ]

  useEffect(() => {
    if (goalId) {
      fetchGoals("all")
    }
  }, [fetchGoals, goalId])

  useEffect(() => {
    if (goalId && goals.length > 0) {
      const goalToUpdate = goals.find((g) => g._id === goalId)
      if (goalToUpdate) {
        setGoal(goalToUpdate)
        setProgress(goalToUpdate.progress)
      } else {
        Alert.alert('Error', 'Goal not found', [
          { text: 'OK', onPress: () => nav.goBack() }
        ])
      }
    }
  }, [goalId, goals, nav])

  const handleSubmit = async () => {
    if (!goalId || !progress) {
      Alert.alert('Error', 'Please select a progress status')
      return
    }

    try {
      await updateGoal(goalId, progress)
      nav.goBack()
    } catch (error) {
      Alert.alert('Error', 'Failed to update goal. Please try again.')
    }
  }


  if (!goal) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading goal...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={() => nav.goBack()}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Update Goal</Text>
          <View style={{ width: 40 }} /> {/* Spacer for centering */}
        </View>

        {/* Form */}
        <View style={[styles.formContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          {/* Goal Name (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Goal Name</Text>
            <View style={[styles.readOnlyInput, { borderColor: colors.border, backgroundColor: colors.mutedBg }]}>
              <Text style={[styles.readOnlyText, { color: colors.muted }]}>{goal.name}</Text>
            </View>
          </View>

          {/* Progress Status */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Progress Status *</Text>
            <View style={styles.progressGrid}>
              {progressOptions.map((option) => (
                <ProgressButton
                  key={option.value}
                  option={option}
                  progress={progress}
                  colors={colors}
                  onPress={setProgress}
                />
              ))}
            </View>
          </View>

          {/* Description (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <View style={[styles.readOnlyTextArea, { borderColor: colors.border, backgroundColor: colors.mutedBg }]}>
              <Text style={[styles.readOnlyText, { color: colors.muted }]}>
                {goal.description || 'No description provided'}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isLoading ? colors.muted : colors.accent,
                opacity: isLoading ? 0.6 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="save" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Update Goal</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

function ProgressButton({ option, progress, colors, onPress }: {
  option: { label: string; value: string }
  progress: string
  colors: any
  onPress: (value: string) => void
}) {
  return (
    <TouchableOpacity
      style={[
        styles.progressButton,
        {
          backgroundColor: progress === option.value ? colors.accent : colors.cardBg,
          borderColor: progress === option.value ? colors.accent : colors.border
        }
      ]}
      onPress={() => onPress(option.value)}
    >
      <Text style={[
        styles.progressButtonText,
        { color: progress === option.value ? '#fff' : colors.text }
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '700' },

  formContainer: {
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  readOnlyInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  readOnlyTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    minHeight: 80,
  },
  readOnlyText: {
    fontSize: 16,
    lineHeight: 22,
  },

  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  progressButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  progressButtonText: { fontSize: 14, fontWeight: '500' },

  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 10,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
