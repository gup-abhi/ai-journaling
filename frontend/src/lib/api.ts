export const API_BASE = 'http://localhost:5001/api/v1'

export type JsonRecord = Record<string, unknown>

export async function apiRequest(path: string, init: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const headers = new Headers(init.headers || {})
  const method = (init.method || 'GET').toString().toUpperCase()
  const hasBody = !!init.body

  // Only set JSON content-type when sending a body
  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers,
    method,
  })
  return response
}

export async function parseJson<T = any>(response: Response): Promise<{ ok: boolean; status: number; data: T | null; error: string | null }>{
  let payload: any = null
  try {
    payload = await response.json()
  } catch (_) {
    payload = null
  }
  if (response.ok) {
    return { ok: true, status: response.status, data: payload as T, error: null }
  }
  const message = (payload && (payload.message || payload.error)) || `Request failed with status ${response.status}`
  return { ok: false, status: response.status, data: null, error: String(message) }
}
