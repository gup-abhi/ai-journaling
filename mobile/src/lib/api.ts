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
  // console.log("Tokens:", access_token, refresh_token); // check if tokens exist
  if (access_token && config.headers && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${access_token}`
    config.headers['Refresh'] = `Bearer ${refresh_token}`
  }
  return config
})


api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear tokens on authentication failure
      await removeAuthTokens()
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

