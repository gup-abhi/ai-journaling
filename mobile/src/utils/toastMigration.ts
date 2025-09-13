/**
 * Migration utility to help replace react-native-simple-toast with custom themed toast
 * 
 * Usage examples:
 * 
 * OLD:
 * import Toast from 'react-native-simple-toast'
 * Toast.show('Message', Toast.LONG)
 * Toast.show('Error message', Toast.SHORT)
 * 
 * NEW:
 * import { useToast } from '../contexts/ToastContext'
 * const { showToast } = useToast()
 * showToast('Message', 'info', 3000) // default duration
 * showToast('Error message', 'error', 2000)
 * showToast('Success message', 'success', 3000)
 * 
 * Toast types:
 * - 'info': Default informational message (uses cardBg background)
 * - 'success': Success message (uses accent color)
 * - 'error': Error message (uses destructive/red color)
 * 
 * Duration:
 * - Default: 3000ms (3 seconds)
 * - Custom: Any number in milliseconds
 */

export const TOAST_DURATION = {
  SHORT: 2000,
  LONG: 4000,
  DEFAULT: 3000,
} as const

export const TOAST_TYPE = {
  INFO: 'info' as const,
  SUCCESS: 'success' as const,
  ERROR: 'error' as const,
} as const
