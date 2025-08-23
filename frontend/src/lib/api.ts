import axios, { AxiosError } from 'axios'
import type { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'

export const API_BASE = 'http://localhost:5001/api/v1'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
})


// Add authorization token for all requests 
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? Cookies.get('auth_token') : null
  if (token && config.headers && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Global handling for 401 error code
api.interceptors.response.use(
  (response) => response, // pass successful responses
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Example: redirect to login or refresh token
      console.warn('Unauthorized! Redirecting to login...')
      sessionStorage.clear()
       if (window.location.href.split("/")[3] !== 'sign-in') {
        window.location.href = '/sign-in'
      }
    }

    return Promise.reject(error)
  }
)

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
