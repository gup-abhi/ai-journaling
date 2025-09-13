import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useThemeColors } from '../theme/colors'

interface ToastProps {
  visible: boolean
  message: string
  duration?: number
  onHide?: () => void
  type?: 'success' | 'error' | 'info'
}

const CustomToast: React.FC<ToastProps> = ({
  visible,
  message,
  duration = 3000,
  onHide,
  type = 'info'
}) => {
  const colors = useThemeColors()
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(-100)).current

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration])

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide?.()
    })
  }

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.accent,
          borderColor: colors.accent,
        }
      case 'error':
        return {
          backgroundColor: colors.destructive || '#ef4444',
          borderColor: colors.destructive || '#ef4444',
        }
      default:
        return {
          backgroundColor: colors.cardBg,
          borderColor: colors.border,
        }
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return colors.primaryForeground  // Use theme's primary foreground for proper contrast
      case 'error':
        return '#ffffff'  // Keep white for error toasts for high contrast
      default:
        return colors.text
    }
  }

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.toast,
          getToastStyles(),
        ]}
        onPress={hideToast}
        activeOpacity={0.8}
      >
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
})

export default CustomToast
