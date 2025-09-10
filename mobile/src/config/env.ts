import { Platform } from 'react-native'

const fallbackBase = Platform.select({
  android: 'http://10.0.2.2:5001/api/v1', // Android emulator uses 10.0.2.2 to reach host
  ios: 'http://localhost:5001/api/v1', // iOS simulator can use localhost
  default: 'http://localhost:5001/api/v1',
}) as string

// Alternative configurations for different environments
export const ALTERNATIVE_BASES = {
  // For physical devices or different network setups
  hostMachineIP: 'http://192.168.1.100:5001/api/v1', // Replace with your host machine's IP
  ngrokTunnel: 'https://your-ngrok-url.ngrok.io/api/v1', // For ngrok tunnels
  production: 'https://your-production-url.com/api/v1',
}

export const ENV = {
  API_BASE: process.env.EXPO_PUBLIC_API_BASE || fallbackBase,
}

