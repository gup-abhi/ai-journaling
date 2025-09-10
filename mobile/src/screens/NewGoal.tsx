import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { useThemeColors } from '../theme/colors'
import { useGoalStore } from '../stores/goal.store'

export default function NewGoal() {
  const colors = useThemeColors()
  const nav = useNavigation<any>()
  const { addGoal, isLoading } = useGoalStore()

  const [goalName, setGoalName] = useState('')
  const [progress, setProgress] = useState('')
  const [description, setDescription] = useState('')

  const progressOptions = [
    { label: 'Not Started', value: 'not-started' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'On Hold', value: 'on-hold' },
  ]

  const handleSubmit = async () => {
    if (!goalName.trim()) {
      Alert.alert('Error', 'Goal name is required')
      return
    }

    if (!progress) {
      Alert.alert('Error', 'Please select a progress status')
      return
    }

    try {
      await addGoal({
        name: goalName.trim(),
        progress,
        description: description.trim() || undefined
      })
      nav.goBack()
    } catch (error) {
      Alert.alert('Error', 'Failed to create goal. Please try again.')
    }
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
          <Text style={[styles.title, { color: colors.text }]}>New Goal</Text>
          <View style={{ width: 40 }} /> {/* Spacer for centering */}
        </View>

        {/* Form */}
        <View style={[styles.formContainer, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          {/* Goal Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Goal Name *</Text>
            <TextInput
              style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="Enter your goal name"
              placeholderTextColor={colors.muted}
              maxLength={100}
            />
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

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your goal..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
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
                <Text style={styles.submitButtonText}>Save Goal</Text>
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
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    minHeight: 100,
    textAlignVertical: 'top',
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
