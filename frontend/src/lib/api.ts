import axios, { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

export const API_BASE = 'http://localhost:5001/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? Cookies.get('auth_token') : null
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
