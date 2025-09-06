import React, { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View } from 'react-native'
import AppNavigator from './navigation'
import { useAuthStore } from './stores/auth.store'
import { useThemeColors } from './theme/colors'

export default function App() {
  const { restore } = useAuthStore()
  const colors = useThemeColors()
  useEffect(() => { restore() }, [])
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  )
}

