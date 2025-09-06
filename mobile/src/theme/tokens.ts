export const theme = {
  light: {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.141 0.005 285.823)',
    primary: 'oklch(0.723 0.219 149.579)',
    primaryForeground: 'oklch(0.982 0.018 155.826)',
    secondary: 'oklch(0.967 0.001 286.375)',
    secondaryForeground: 'oklch(0.21 0.006 285.885)',
    muted: 'oklch(0.967 0.001 286.375)',
    mutedForeground: 'oklch(0.552 0.016 285.938)',
    accent: 'oklch(0.967 0.001 286.375)',
    accentForeground: 'oklch(0.21 0.006 285.885)',
    destructive: 'oklch(0.577 0.245 27.325)',
    border: 'oklch(0.92 0.004 286.32)',
    input: 'oklch(0.92 0.004 286.32)',
    ring: 'oklch(0.723 0.219 149.579)',
  },
  dark: {
    background: 'oklch(0.22 0.01 275)',
    foreground: 'oklch(0.92 0.01 280)',
    primary: 'oklch(0.70 0.14 150)',
    primaryForeground: 'oklch(0.95 0.02 150)',
    secondary: 'oklch(0.30 0.02 280)',
    secondaryForeground: 'oklch(0.88 0.01 280)',
    muted: 'oklch(0.28 0.01 280)',
    mutedForeground: 'oklch(0.70 0.02 280)',
    accent: 'oklch(0.65 0.12 140)',
    accentForeground: 'oklch(0.95 0.02 150)',
    destructive: 'oklch(0.55 0.20 25)',
    border: 'oklch(0.30 0.01 280)',
    input: 'oklch(0.30 0.01 280)',
    ring: 'oklch(0.70 0.14 150)',
  }
} as const

export type ThemeName = keyof typeof theme

