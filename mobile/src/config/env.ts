import { Platform } from 'react-native'

const fallbackBase = Platform.select({
  android: 'http://10.0.2.2:5001/api/v1',
  ios: 'http://localhost:5001/api/v1',
  default: 'http://localhost:5001/api/v1',
}) as string

export const ENV = {
  API_BASE: process.env.EXPO_PUBLIC_API_BASE || fallbackBase,
}

