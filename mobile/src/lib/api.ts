import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { ENV } from '../config/env'
import { getAuthTokens, removeAuthTokens } from './auth-tokens'
import { useAuthStore } from '../stores/auth.store'

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
      console.log("Received 401 - backend should handle token refresh automatically")
      // Don't attempt refresh here - let the backend handle it
      // The backend will return new tokens and the client will use them
    }
    return Promise.reject(error)
  }
)

// Token utilities have been moved to auth-tokens.ts to avoid circular dependencies

// Debug utility to test API connectivity
export async function testApiConnectivity(baseURL?: string) {
  const testUrls = [
    baseURL || BASE_URL,
    'http://localhost:5001/api/v1',
    'http://10.0.2.2:5001/api/v1',
    'http://127.0.0.1:5001/api/v1'
  ]

  console.log('🔍 Testing API connectivity to multiple endpoints...')

  for (const url of testUrls) {
    try {
      console.log(`📡 Testing: ${url}`)
      const testApi = axios.create({ baseURL: url, timeout: 5000 })
      const response = await testApi.get('/')
      console.log(`✅ ${url} - Status: ${response.status}`)
      return { success: true, url, status: response.status }
    } catch (error: any) {
      console.log(`❌ ${url} - Error: ${error.code || error.message}`)
    }
  }

  console.log('💥 All connectivity tests failed')
  return { success: false, error: 'All endpoints unreachable' }
}

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

