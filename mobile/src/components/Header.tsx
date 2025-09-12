import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeColors } from '../theme/colors'
import Logo from './Logo'

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
      return (
        <View style={styles.headerLeft}>
          <Logo width={32} height={32} />
          <View style={styles.welcomeText}>
            <Text style={[styles.title, { color: colors.text }]}>
              {title || 'Welcome back'}
            </Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.accent }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )
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
      return null
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  welcomeText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    flexWrap: 'wrap',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '800',
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
