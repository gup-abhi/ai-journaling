import React from 'react'
import { useColorScheme } from 'react-native'
import { formatHex, oklch } from 'culori'
import Svg, { Rect, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg'
import { theme } from '../theme/tokens'

interface LogoProps {
  width?: number
  height?: number
}

export default function Logo({ width = 80, height = 80 }: LogoProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const tokens = isDark ? theme.dark : theme.light

  // Convert OKLCH to hex for React Native SVG
  const toHex = (oklchStr: string) => {
    try { return formatHex(oklch(oklchStr)!) } catch { return '#000' }
  }

  // Use accent colors from theme
  const primaryColor = toHex(tokens.primary)      // Main accent color
  const accentColor = toHex(tokens.accent)        // Light accent background
  const foregroundColor = toHex(tokens.foreground) // Text color
  const leafColor = toHex(tokens.accent)          // Green accent for leaf

  return (
    <Svg width={width} height={height} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={primaryColor} />
          <Stop offset="100%" stopColor={accentColor} />
        </LinearGradient>
      </Defs>
      <Rect x="10" y="10" width="80" height="80" rx="20" fill="url(#backgroundGradient)" />
      <Path d="M30 25 H70 V35 H30 Z" fill={foregroundColor} />
      <Path d="M30 40 H70 V50 H30 Z" fill={foregroundColor} />
      <Path d="M30 55 H60 V65 H30 Z" fill={foregroundColor} />
      <Circle cx="75" cy="25" r="10" fill={accentColor} opacity="0.8" />
      <Circle cx="65" cy="35" r="5" fill={accentColor} opacity="0.8" />
      <Path d="M25 70 C20 75, 20 80, 25 85 C30 80, 30 75, 25 70 Z" fill={leafColor} />
    </Svg>
  )
}