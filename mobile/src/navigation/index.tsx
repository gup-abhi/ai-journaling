import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import SignIn from '../screens/SignIn'
import SignUp from '../screens/SignUp'
import Dashboard from '../screens/Dashboard'
import Journals from '../screens/Journals'
import NewJournalEntry from '../screens/NewJournalEntry'
import JournalView from '../screens/JournalView'
import { useAuthStore } from '../stores/auth.store'
import { View, ActivityIndicator } from 'react-native'

export type RootStackParamList = {
  SignIn: undefined
  SignUp: undefined
  Dashboard: undefined
  Journals: undefined
  NewJournalEntry: undefined
  JournalView: { id: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  const { isAuthenticated } = useAuthStore()
  const isLoading = useAuthStore(s => s.isLoading)
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }
  return (
    <NavigationContainer>
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="Journals" component={Journals} />
            <Stack.Screen name="NewJournalEntry" component={NewJournalEntry} />
            <Stack.Screen name="JournalView" component={JournalView} />
          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

