import * as SecureStore from 'expo-secure-store'

// Use more specific key names to avoid conflicts
const TOKEN_KEYS = {
  ACCESS: 'myapp_auth_access_token',
  REFRESH: 'myapp_auth_refresh_token'
} as const

export const removeAuthTokens = async (): Promise<void> => {
  try {
    console.log('🗑️ Removing auth tokens...')
    
    // Remove tokens in parallel for better performance
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS),
      SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH)
    ])
    
    // Verify tokens are actually removed
    const verification = await getAuthTokens()
    console.log('🔐 Verification - tokens removed:', {
      accessTokenRemoved: !verification.access_token,
      refreshTokenRemoved: !verification.refresh_token
    })
    
    if (verification.access_token || verification.refresh_token) {
      throw new Error('Failed to completely remove tokens')
    }
    
    console.log('✅ All tokens successfully removed')
  } catch (error) {
    console.error('❌ Error removing tokens:', error)
    throw error
  }
}

export const setAuthTokens = async (accessToken: string, refreshToken?: string): Promise<void> => {
  try {
    if (!accessToken || accessToken.trim() === '') {
      throw new Error('Access token is required and cannot be empty')
    }

    console.log('🔐 Storing tokens in secure store...')
    console.log('Access token preview:', accessToken.substring(0, 20) + '...')
    console.log('Refresh token preview:', refreshToken ? refreshToken.substring(0, 10) + '...' : 'none')
    
    // Always clear existing tokens first to prevent stale data
    await removeAuthTokens().catch(() => {
      // Don't fail if removal fails (tokens might not exist)
      console.log('⚠️ No existing tokens to remove or removal failed - continuing...')
    })
    
    // Set new tokens
    const setPromises = [SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, accessToken)]
    
    if (refreshToken && refreshToken.trim() !== '') {
      setPromises.push(SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken))
    }
    
    await Promise.all(setPromises)
    
    // Verify tokens were stored correctly
    const verification = await getAuthTokens()
    if (!verification.access_token) {
      throw new Error('Failed to store access token')
    }
    
    console.log('✅ Tokens stored and verified successfully')
  } catch (error) {
    console.error('❌ Error storing tokens:', error)
    throw error
  }
}

export const getAuthTokens = async (): Promise<{ 
  access_token: string | null; 
  refresh_token: string | null 
}> => {
  try {
    // Get both tokens in parallel
    const [access_token, refresh_token] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEYS.ACCESS),
      SecureStore.getItemAsync(TOKEN_KEYS.REFRESH)
    ])
    
    console.log('🔍 Retrieved tokens from storage:', {
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      accessTokenPreview: access_token ? access_token.substring(0, 20) + '...' : 'none',
      refreshTokenPreview: refresh_token ? refresh_token.substring(0, 10) + '...' : 'none',
      timestamp: new Date().toISOString() // Add timestamp for debugging
    })
    
    return { access_token, refresh_token }
  } catch (error) {
    console.error('❌ Error retrieving tokens:', error)
    return { access_token: null, refresh_token: null }
  }
}

// Additional utility functions for better token management

export const hasValidTokens = async (): Promise<boolean> => {
  try {
    const { access_token } = await getAuthTokens()
    return !!access_token && access_token.trim() !== ''
  } catch (error) {
    console.error('❌ Error checking token validity:', error)
    return false
  }
}

export const updateAccessToken = async (newAccessToken: string): Promise<void> => {
  try {
    if (!newAccessToken || newAccessToken.trim() === '') {
      throw new Error('New access token cannot be empty')
    }

    console.log('🔄 Updating access token only...')
    await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, newAccessToken)
    
    // Verify the update
    const { access_token } = await getAuthTokens()
    if (access_token !== newAccessToken) {
      throw new Error('Access token update verification failed')
    }
    
    console.log('✅ Access token updated successfully')
  } catch (error) {
    console.error('❌ Error updating access token:', error)
    throw error
  }
}

// Debug function to help troubleshoot issues
export const debugTokenStorage = async (): Promise<void> => {
  console.log('🐛 === TOKEN STORAGE DEBUG ===')
  
  try {
    // Check what's actually stored with the old keys (in case of migration issues)
    const oldAccessToken = await SecureStore.getItemAsync('auth_token')
    const oldRefreshToken = await SecureStore.getItemAsync('refresh_token')
    
    console.log('Old key tokens:', {
      oldAccess: !!oldAccessToken,
      oldRefresh: !!oldRefreshToken
    })
    
    // Check current tokens
    const currentTokens = await getAuthTokens()
    console.log('Current tokens:', {
      hasAccess: !!currentTokens.access_token,
      hasRefresh: !!currentTokens.refresh_token
    })
    
    // If old tokens exist, migrate them
    if (oldAccessToken || oldRefreshToken) {
      console.log('⚠️ Found tokens with old keys - consider migration')
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
  
  console.log('🐛 === END DEBUG ===')
}