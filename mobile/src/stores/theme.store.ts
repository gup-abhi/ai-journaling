import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as SecureStore from 'expo-secure-store'

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
            const value = await SecureStore.getItemAsync(name)
            return value ? JSON.parse(value) : null
          } catch (error) {
            console.error('Error getting theme from secure store:', error)
            return null
          }
        },
        setItem: async (name, value) => {
          try {
            await SecureStore.setItemAsync(name, JSON.stringify(value))
          } catch (error) {
            console.error('Error setting theme in secure store:', error)
          }
        },
        removeItem: async (name) => {
          try {
            await SecureStore.deleteItemAsync(name)
          } catch (error) {
            console.error('Error removing theme from secure store:', error)
          }
        },
      },
    }
  )
)
