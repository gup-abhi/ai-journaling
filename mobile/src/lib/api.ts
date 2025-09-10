import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { ENV } from '../config/env'
import { getAuthTokens, removeAuthTokens } from './auth-tokens'
import { useAuthStore } from '../stores/auth.store'

// Match web base path; Expo needs absolute for device/simulator. Adjust via env if needed.
const BASE_URL = ENV.API_BASE

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
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


api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Check if we already have a refresh attempt in progress to prevent loops
      const refreshInProgress = (error.config as any)?._retry
      if (refreshInProgress) {
        console.log("Token refresh already in progress, rejecting request")
        return Promise.reject(error)
      }

      // Mark this request as having attempted refresh
      ;(error.config as any)._retry = true

      console.log("Attempting token refresh due to 401 error")
      const res = await useAuthStore.getState().refreshToken()

      if (res.ok) {
        console.log("Token refresh successful, retrying original request")
        // Retry the original request with new tokens
        return api(error.config!)
      } else {
        console.log("Token refresh failed, clearing authentication")
        await removeAuthTokens()
        useAuthStore.getState().setIsAuthenticated(false)
      }
    }
    return Promise.reject(error)
  }
)

// Token utilities have been moved to auth-tokens.ts to avoid circular dependencies

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

