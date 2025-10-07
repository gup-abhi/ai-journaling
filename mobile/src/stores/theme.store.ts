import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ThemeMode = 'light' | 'dark' | 'system'

type ThemeState = {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'theme-storage',
      storage: {
        getItem: async (name) => {
          try {
            const value = await AsyncStorage.getItem(name)
            return value ? JSON.parse(value) : null
          } catch (error) {
            console.error('Error getting theme from async storage:', error)
            return null
          }
        },
        setItem: async (name, value) => {
          try {
            await AsyncStorage.setItem(name, JSON.stringify(value))
          } catch (error) {
            console.error('Error setting theme in async storage:', error)
          }
        },
        removeItem: async (name) => {
          try {
            await AsyncStorage.removeItem(name)
          } catch (error) {
            console.error('Error removing theme from async storage:', error)
          }
        },
      },
    }
  )
)
