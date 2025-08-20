import axios, { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'

export const API_BASE = 'http://localhost:5001/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    // Do not force Content-Type on GET; axios sets it for JSON bodies automatically
  },
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  if (token && config.headers && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export type ApiResult<T> = { ok: true; status: number; data: T } | { ok: false; status: number; error: string }

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
