import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '../stores/auth.store'

export const removeAuthTokens = async () => {
  await SecureStore.deleteItemAsync('auth_token')
  await SecureStore.deleteItemAsync('refresh_token') // Fixed typo: was 'redfresh_token'
  console.log(`🔐 Checking if tokens are removed... ${JSON.stringify(await getAuthTokens())}`)
  useAuthStore.getState().setIsAuthenticated(false)
}

export const setAuthTokens = async (accessToken: string, refreshToken?: string) => {
  console.log('🔐 Storing tokens in secure store...')
  console.log('Access token preview:', accessToken ? accessToken.substring(0, 20) + '...' : 'none')
  console.log('Refresh token preview:', refreshToken ? refreshToken.substring(0, 10) + '...' : 'none')
  
  await SecureStore.setItemAsync('auth_token', accessToken)
  if (refreshToken) {
    await SecureStore.setItemAsync('refresh_token', refreshToken)
  }
  
  console.log('✅ Tokens stored successfully')
}

export const getAuthTokens = async (): Promise<{ access_token: string | null; refresh_token: string | null }> => {
  const access_token = await SecureStore.getItemAsync('auth_token')
  const refresh_token = await SecureStore.getItemAsync('refresh_token')
  
  console.log('🔍 Retrieved tokens from storage:', {
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    accessTokenPreview: access_token ? access_token.substring(0, 20) + '...' : 'none',
    refreshTokenPreview: refresh_token ? refresh_token.substring(0, 10) + '...' : 'none'
  })
  
  return { access_token, refresh_token }
}

