import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import Dashboard from '../screens/Dashboard';
import Journals from '../screens/Journals';
import NewJournalEntry from '../screens/NewJournalEntry';
import JournalView from '../screens/JournalView';
import { useAuthStore } from '../stores/auth.store';
import { View, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../theme/colors';
import Goals from '../screens/Goals';
import NewGoal from '../screens/NewGoal';
import UpdateGoal from '../screens/UpdateGoal';
import Trends from '../screens/Trends';
import Timeline from '../screens/Timeline';
import JournalTemplates from '../screens/JournalTemplates';
import GoogleOAuth from '../screens/GoogleOAuth';
import { navigationRef } from '../lib/navigation-service';

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  Root: undefined;
  Journals: undefined;
  NewJournalEntry: undefined;
  JournalView: { id: string };
  JournalTemplates: undefined;
  NewGoal: undefined;
  UpdateGoal: { goalId: string };
  Timeline: undefined;
  GoogleOAuth: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function AuthedTabs() {
  const colors = useThemeColors();
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.cardBg, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, any> = {
            Dashboard: 'home',
            Journals: 'book-open',
            Goals: 'check-circle',
            Trends: 'bar-chart-2',
          };
          const iconName = iconMap[route.name] || 'circle';
          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Journals" component={Journals} />
      <Tab.Screen name="Goals" component={Goals} />
      <Tab.Screen name="Trends" component={Trends} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, restore } = useAuthStore();
  const colors = useThemeColors();

  useEffect(() => {
    restore();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Root" component={AuthedTabs} />
            <Stack.Screen name="NewJournalEntry" component={NewJournalEntry} />
            <Stack.Screen name="JournalView" component={JournalView} />
            <Stack.Screen name="JournalTemplates" component={JournalTemplates} />
            <Stack.Screen name="NewGoal" component={NewGoal} />
            <Stack.Screen name="UpdateGoal" component={UpdateGoal} />
            <Stack.Screen name="Timeline" component={Timeline} />
          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="GoogleOAuth" component={GoogleOAuth} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


