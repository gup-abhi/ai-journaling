import React, { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View } from 'react-native'
import AppNavigator from './navigation'
import { useAuthStore } from './stores/auth.store'
import { useThemeColors } from './theme/colors'
import { ToastProvider } from './contexts/ToastContext'

export default function App() {
  const { restore } = useAuthStore()
  const colors = useThemeColors()

  useEffect(() => { 
    // Initialize authentication state on app start
    restore() 
  }, [])
  
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <AppNavigator />
        </View>
      </ToastProvider>
    </SafeAreaProvider>
  )
}

