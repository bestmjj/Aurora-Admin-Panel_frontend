import { atomWithStorage } from 'jotai/utils'

// ---------------------------------------------------------------------------
// Theme configuration types and constants
// ---------------------------------------------------------------------------

export interface ThemeConfig {
  name: string
  label: string
  colorScheme: 'light' | 'dark'
}

export const THEMES: ThemeConfig[] = [
  { name: 'aurora-classic', label: 'Aurora Classic', colorScheme: 'light' },
  { name: 'morning', label: 'Morning', colorScheme: 'light' },
  { name: 'sunset', label: 'Sunset', colorScheme: 'dark' },
  { name: 'midnight', label: 'Midnight', colorScheme: 'dark' },
]

export const DEFAULT_LIGHT_THEME = 'aurora-classic'
export const DEFAULT_DARK_THEME = 'sunset'

export type ThemeName = 'aurora-classic' | 'morning' | 'sunset' | 'midnight'
export type ThemeSelection = 'auto' | ThemeName

// Persisted user selection: 'auto' | theme name
export const themeSelectionAtom = atomWithStorage<ThemeSelection>('aurora-theme', 'auto')
