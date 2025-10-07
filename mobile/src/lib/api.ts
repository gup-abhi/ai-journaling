import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { ENV } from '../config/env'
import { getAuthTokens, removeAuthTokens, setAuthTokens } from './auth-tokens'
import { ApiOk, ApiErr, ApiResult, isApiErr } from '../types/Api.type'

// Re-export for convenience
export { isApiErr, ApiOk, ApiErr, ApiResult }

const BASE_URL = ENV.API_BASE

// Callback registry to avoid circular dependencies
type AuthStateCallback = () => void
const authStateCallbacks: AuthStateCallback[] = []

export const registerAuthStateCallback = (callback: AuthStateCallback) => {
  authStateCallbacks.push(callback)
}

export const unregisterAuthStateCallback = (callback: AuthStateCallback) => {
  const index = authStateCallbacks.indexOf(callback)
  if (index > -1) {
    authStateCallbacks.splice(index, 1)
  }
}

const notifyAuthStateChange = () => {
  authStateCallbacks.forEach(callback => {
    try {
      callback()
    } catch (error) {
      console.error('Error in auth state callback:', error)
    }
  })
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Increased timeout for remote server (60 seconds)
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use(async (config) => {
  try {
    const { access_token, refresh_token } = await getAuthTokens()

    console.log('=== API REQUEST ===')
    console.log('Request Details:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method?.toUpperCase(),
      hasAccessToken: !!access_token,
      hasRefreshToken: !!refresh_token,
      accessTokenPreview: access_token ? access_token.substring(0, 20) + "..." : 'none',
      refreshTokenPreview: refresh_token ? refresh_token.substring(0, 10) + "..." : 'none'
    })

    // Check token expiration before sending
    if (access_token) {
      try {
        const parts = access_token.split('.');
        if (parts.length === 3) {
          // Use atob for base64 decoding in React Native
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(atob(base64));
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          const timeDiff = expDate.getTime() - now.getTime();
          
          console.log('Token expiration check:', {
            exp: expDate.toISOString(),
            now: now.toISOString(),
            timeUntilExpiry: timeDiff,
            isExpired: timeDiff < 0
          });
          
          if (timeDiff < 0) {
            console.warn('⚠️  Access token is expired!');
          }
        }
      } catch (decodeErr) {
        console.warn('Could not decode access token:', decodeErr.message);
      }
      
      config.headers['Authorization'] = `Bearer ${access_token}`
      console.log('✅ Authorization header set')
    } else {
      console.log('⚠️  No access token available')
    }
    
    if (refresh_token) {
      config.headers['Refresh'] = `Bearer ${refresh_token}`
      console.log('✅ Refresh header set:', `Bearer ${refresh_token.substring(0, 10)}...`)
    } else {
      console.log('⚠️  No refresh token available')
    }

    config.headers['User-Agent'] = `AI-Journaling/1.0.0 (Mobile; Expo; ReactNative-Mobile-App)`
    config.headers['X-Request-ID'] = `mobile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    console.log('Request Headers:', {
      'Authorization': config.headers['Authorization'] ? 'Bearer [REDACTED]' : 'not set',
      'Refresh': config.headers['Refresh'] ? 'Bearer [REDACTED]' : 'not set',
      'User-Agent': config.headers['User-Agent'],
      'Content-Type': config.headers['Content-Type']
    })

    return config
  } catch (error) {
    console.error('❌ Error in request interceptor:', error)
    return config
  }
})

api.interceptors.response.use(
  async (response) => {
    console.log('=== API RESPONSE SUCCESS ===')
    console.log('Response Details:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      hasNewAccessToken: !!response.headers['x-new-access-token'],
      hasNewRefreshToken: !!response.headers['x-new-refresh-token'],
      shouldClearTokens: response.headers['x-clear-tokens']
    })
    
    try {
      const newAccessToken = response.headers['x-new-access-token']
      const newRefreshToken = response.headers['x-new-refresh-token']
      const shouldClearTokens = response.headers['x-clear-tokens']

      if (shouldClearTokens === 'true') {
        console.log('🔄 Backend requested token clearing')
        await removeAuthTokens()
        return response
      }

      if (newAccessToken && newRefreshToken) {
        console.log('🔄 Backend provided new tokens, storing them...')
        await setAuthTokens(newAccessToken, newRefreshToken)
        console.log('✅ New tokens stored successfully')
      } else if (newAccessToken || newRefreshToken) {
        console.warn('⚠️  Received partial token refresh:', {
          hasNewAccessToken: !!newAccessToken,
          hasNewRefreshToken: !!newRefreshToken
        })
      }

      return response
    } catch (error) {
      console.error('❌ Error handling response tokens:', error)
      return response
    }
  },
  async (error: AxiosError) => {
    const status = error.response?.status
    const config = error.config
    const responseData = error.response?.data

    console.log('=== API RESPONSE ERROR ===')
    console.log('Error Details:', {
      status,
      statusText: error.response?.statusText,
      url: config?.url,
      method: config?.method?.toUpperCase(),
      baseURL: config?.baseURL,
      message: error.message,
      responseData: typeof responseData === 'string' ? responseData.substring(0, 200) + '...' : responseData
    })

    // Log response headers that might contain token refresh info
    if (error.response?.headers) {
      console.log('Response Headers:', {
        'x-new-access-token': error.response.headers['x-new-access-token'] ? '[REDACTED]' : 'not present',
        'x-new-refresh-token': error.response.headers['x-new-refresh-token'] ? '[REDACTED]' : 'not present',
        'x-clear-tokens': error.response.headers['x-clear-tokens'] || 'not present'
      })
    }

    // Handle token refresh in error response
    if (error.response?.headers) {
      const newAccessToken = error.response.headers['x-new-access-token']
      const newRefreshToken = error.response.headers['x-new-refresh-token']
      const shouldClearTokens = error.response.headers['x-clear-tokens']

      if (shouldClearTokens === 'true') {
        console.log('🔄 Backend requested token clearing in error response')
        await removeAuthTokens()
        notifyAuthStateChange()
        return Promise.reject(error)
      }

      if (newAccessToken && newRefreshToken) {
        console.log('🔄 Backend provided new tokens in error response, storing them...')
        await setAuthTokens(newAccessToken, newRefreshToken)
        console.log('✅ New tokens stored successfully')

        // Retry the original request with new tokens (only if not already retried)
        // Use a symbol to safely mark retried requests without TypeScript errors
        const RETRY_MARK = Symbol.for('api_retry_mark')
        if (!(config as any)[RETRY_MARK]) {
          console.log('🔄 Retrying original request with new tokens...')
          
          // Clone the request config and update authorization header
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${newAccessToken}`
            }
          }
          ;(retryConfig as any)[RETRY_MARK] = true // Prevent infinite retry loops
          
          try {
            return await api(retryConfig)
          } catch (retryError) {
            console.error('❌ Retry failed:', retryError)
            return Promise.reject(retryError)
          }
        } else {
          console.log('⚠️  Already retried this request, not retrying again')
        }
      }
    }

    if (status === 401) {
      console.log('🚨 Received 401 - Authentication failed')
      
      try {
        await removeAuthTokens()
        notifyAuthStateChange()
      } catch (cleanupError) {
        console.error('❌ Error during 401 cleanup:', cleanupError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Rest of your existing code...

export async function safeRequest<T = any>(promise: Promise<AxiosResponse<T>>): Promise<ApiResult<T>> {
  try {
    const res = await promise
    return { ok: true, status: res.status, data: res.data }
  } catch (err) {
    const e = err as AxiosError<any>
    const status = e.response?.status ?? 0
    const data = e.response?.data as any
    const message = (data && (data.message || data.error)) || e.message || 'Request failed'
    return { ok: false, status, error: String(message) }
  }
}
