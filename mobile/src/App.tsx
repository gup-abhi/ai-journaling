import React, { useEffect } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { View } from 'react-native'
import AppNavigator from './navigation'
import { useAuthStore } from './stores/auth.store'
import { useThemeColors } from './theme/colors'
import { getAuthTokens } from './lib/auth-tokens'

export default function App() {
  const { restore, setIsAuthenticated } = useAuthStore()
  const colors = useThemeColors()

  const checkAuthTokenInStore = async () => {
    const { access_token } = await getAuthTokens();

    if (access_token) setIsAuthenticated(true);
  }
  
  useEffect(() => { 
     checkAuthTokenInStore();
  }, [checkAuthTokenInStore])

  useEffect(() => { 
    // Initialize authentication state on app start
    restore() 
  }, [])
  
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  )
}

