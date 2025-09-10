import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../stores/auth.store'

export const removeAuthTokens = async () => {
  await SecureStore.deleteItemAsync('auth_token')
  await SecureStore.deleteItemAsync('refresh_token') // Fixed typo: was 'redfresh_token'
  useAuthStore.getState().setIsAuthenticated(false)
}

export const setAuthTokens = async (accessToken: string, refreshToken?: string) => {
  // console.log(`Adding tokens to secure store - ${accessToken} ${refreshToken}`)
  await SecureStore.setItemAsync('auth_token', accessToken)
  await SecureStore.setItemAsync('refresh_token', refreshToken)
}

export const getAuthTokens = async (): Promise<{ access_token: string | null; refresh_token: string | null }> => {
  const access_token = await SecureStore.getItemAsync('auth_token')
  const refresh_token = await SecureStore.getItemAsync('refresh_token')
  return { access_token, refresh_token }
}

