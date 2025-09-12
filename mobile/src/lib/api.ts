import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { ENV } from '../config/env'
import { getAuthTokens, removeAuthTokens, setAuthTokens } from './auth-tokens'
import { useAuthStore } from '../stores/auth.store'
import { resetToSignIn } from './navigation-service'

const BASE_URL = ENV.API_BASE

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

    if (access_token) {
      config.headers['Authorization'] = `Bearer ${access_token}`
      console.log('✅ Authorization header set')
    } else {
      console.log('⚠️  No access token available')
    }
    
    if (refresh_token) {
      config.headers['Refresh'] = `Bearer ${refresh_token}`
      console.log('✅ Refresh header set')
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

    if (status === 401) {
      console.log('🚨 Received 401 - Authentication failed')
      
      try {
        await removeAuthTokens()
        const authStore = useAuthStore.getState()
        authStore.setIsAuthenticated(false)
        authStore.setIsLoading(false)
        resetToSignIn()
      } catch (cleanupError) {
        console.error('❌ Error during 401 cleanup:', cleanupError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Rest of your existing code...
export type ApiOk<T> = { ok: true; status: number; data: T }
export type ApiErr = { ok: false; status: number; error: string }
export type ApiResult<T> = ApiOk<T> | ApiErr

export function isApiErr<T>(res: ApiResult<T>): res is ApiErr {
  return !res.ok
}

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