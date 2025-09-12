import { useColorScheme } from 'react-native'
import { formatHex, oklch } from 'culori'
import { theme as webTokens } from './tokens'
import { useThemeStore } from '../stores/theme.store'

type ThemeColors = {
  accent: string
  accentBg: string
  accentText: string
  text: string
  muted: string
  mutedBg: string
  border: string
  cardBg: string
  background: string
}

export function useThemeColors(): ThemeColors {
  const systemScheme = useColorScheme()
  const { themeMode } = useThemeStore()
  
  // Determine if we should use dark theme
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemScheme === 'dark')

  const tokens = isDark ? webTokens.dark : webTokens.light

  // Convert OKLCH strings to hex for RN
  const toHex = (oklchStr: string) => {
    try { return formatHex(oklch(oklchStr)!) } catch { return '#000' }
  }

  return {
    accent: toHex(tokens.primary),
    accentBg: toHex(tokens.accent),
    accentText: toHex(tokens.accentForeground || tokens.foreground),
    text: toHex(tokens.foreground),
    muted: toHex(tokens.mutedForeground || tokens.foreground),
    mutedBg: toHex(tokens.muted),
    border: toHex(tokens.border),
    cardBg: isDark ? toHex('oklch(0.25 0.01 275)') : '#ffffff',
    background: toHex(tokens.background),
  }
}


