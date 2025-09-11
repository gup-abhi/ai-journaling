import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { ENV } from '../config/env'
import { getAuthTokens, removeAuthTokens } from './auth-tokens'
import { useAuthStore } from '../stores/auth.store'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation'

// Match web base path; Expo needs absolute for device/simulator. Adjust via env if needed.
const BASE_URL = ENV.API_BASE

export const api = axios.create({
  baseURL: BASE_URL,
  // Note: withCredentials is disabled for mobile since we use Bearer token authentication
  // withCredentials: true, // This causes issues with mobile token refresh
})

api.interceptors.request.use(async (config) => {
  // Mobile: try auth header from secure storage
  const { access_token, refresh_token } = await getAuthTokens()

  // Debug logging
  console.log('API Request - Tokens retrieved:', {
    hasAccessToken: !!access_token,
    hasRefreshToken: !!refresh_token,
    url: config.url
  })

  // Only set headers if tokens exist
  if (access_token) {
    config.headers['Authorization'] = `Bearer ${access_token}`
  }
  if (refresh_token) {
    config.headers['Refresh'] = `Bearer ${refresh_token}`
  }

  // Add custom User-Agent
  config.headers['User-Agent'] = `AI-Journaling/1.0.0 (Mobile; Expo)`

  return config
})


// Disable axios interceptor token refresh for mobile - let backend handle it
// This prevents conflicts between mobile and backend token refresh logic
api.interceptors.response.use(
  async (response) => {
    // Check if backend sent new tokens in headers (after refresh)
    const newAccessToken = response.headers['x-new-access-token'];
    const newRefreshToken = response.headers['x-new-refresh-token'];

    if (newAccessToken || newRefreshToken) {
      console.log("Backend provided new tokens, storing them...");
      const { setAuthTokens } = await import('../lib/auth-tokens');
      await setAuthTokens(newAccessToken, newRefreshToken);
      console.log("New tokens stored successfully");
    }

    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.log(`Received 401 - ${JSON.stringify(error.response.data)}`)
    }
    return Promise.reject(error)
  }
)


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

