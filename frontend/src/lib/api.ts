import axios from 'axios'
import { getAuthStore } from '@/stores/auth.store'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

// Add a request interceptor to attach the access token
api.interceptors.request.use((config) => {
  const token = getAuthStore().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})