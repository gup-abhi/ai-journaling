import axios, { type AxiosError, type AxiosResponse } from 'axios'
import * as SecureStore from 'expo-secure-store'
import { ENV } from '../config/env'

// Match web base path; Expo needs absolute for device/simulator. Adjust via env if needed.
const BASE_URL = ENV.API_BASE

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use(async (config) => {
  // Mobile: try auth header from secure storage
  const token = await SecureStore.getItemAsync('auth_token')
  if (token && config.headers && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('auth_token')
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

