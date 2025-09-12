import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  onBackPress?: () => void
  rightButton?: {
    icon: string
    onPress: () => void
    accessibilityLabel?: string
  }
  showLogo?: boolean
  subtitle?: string
  variant?: 'default' | 'dashboard' | 'simple'
}

export default function Header({
  title,
  showBackButton = false,
  onBackPress,
  rightButton,
  showLogo = false,
  subtitle,
  variant = 'default'
}: HeaderProps) {
  const colors = useThemeColors()

  const renderLeftContent = () => {
    if (variant === 'dashboard') {
      return <View style={styles.placeholder} />
    }

    if (showBackButton) {
      return (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
      )
    }

    if (showLogo) {
      return <Logo width={32} height={32} />
    }

    return <View style={styles.placeholder} />
  }

  const renderRightContent = () => {
    if (rightButton) {
      return (
        <TouchableOpacity
          style={[styles.rightButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={rightButton.onPress}
          accessibilityLabel={rightButton.accessibilityLabel}
        >
          <Feather name={rightButton.icon as any} size={18} color={colors.muted} />
        </TouchableOpacity>
      )
    }

    return <View style={styles.placeholder} />
  }

  const renderCenterContent = () => {
    if (variant === 'dashboard') {
      return (
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title || 'Dashboard'}
        </Text>
      )
    }

    if (title) {
      return (
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      )
    }

    return null
  }

  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {renderLeftContent()}
      {renderCenterContent()}
      {renderRightContent()}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  rightButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 12,
  },
  placeholder: {
    width: 40,
  },
})
