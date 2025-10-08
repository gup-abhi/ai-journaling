import axios from 'axios'
import { supabase } from './supabase-client'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

// Add a request interceptor to attach the access token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
