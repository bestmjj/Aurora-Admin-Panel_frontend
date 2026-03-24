/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import {
  THEMES,
  DEFAULT_LIGHT_THEME,
  DEFAULT_DARK_THEME,
  type ThemeSelection,
  type ThemeName,
} from "../atoms/theme"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: ThemeSelection
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  /** The raw user selection (may be 'auto'). */
  theme: ThemeSelection
  /** The resolved concrete theme name after auto-detection. */
  resolvedTheme: ThemeName
  setTheme: (theme: ThemeSelection) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_VALUES: readonly string[] = [
  "auto",
  ...THEMES.map((t) => t.name),
]

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isThemeSelection(value: string | null): value is ThemeSelection {
  if (value === null) return false
  return THEME_VALUES.includes(value)
}

function getSystemColorScheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light"
}

function resolveTheme(selection: ThemeSelection): ThemeName {
  if (selection === "auto") {
    return getSystemColorScheme() === "dark"
      ? (DEFAULT_DARK_THEME as ThemeName)
      : (DEFAULT_LIGHT_THEME as ThemeName)
  }
  return selection
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']"
  )
  return !!editableParent
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ThemeProvider({
  children,
  defaultTheme = "auto",
  storageKey = "aurora-theme",
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeSelection>(() => {
    if (typeof window === "undefined") return defaultTheme
    const stored = localStorage.getItem(storageKey)
    return isThemeSelection(stored) ? stored : defaultTheme
  })

  // Track the last explicitly-chosen light and dark themes for 'd' toggle
  const lastLightRef = React.useRef<ThemeName>(DEFAULT_LIGHT_THEME as ThemeName)
  const lastDarkRef = React.useRef<ThemeName>(DEFAULT_DARK_THEME as ThemeName)

  // Keep refs in sync when user picks a concrete theme
  React.useEffect(() => {
    if (theme === "auto") return
    const config = THEMES.find((t) => t.name === theme)
    if (!config) return
    if (config.colorScheme === "light") {
      lastLightRef.current = theme
    } else {
      lastDarkRef.current = theme
    }
  }, [theme])

  const setTheme = React.useCallback(
    (next: ThemeSelection) => {
      localStorage.setItem(storageKey, next)
      setThemeState(next)
    },
    [storageKey]
  )

  // Resolve theme (handles 'auto')
  const resolvedTheme = React.useMemo(() => resolveTheme(theme), [theme])

  // Re-resolve when system preference changes and user is on 'auto'
  const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0)

  const applyTheme = React.useCallback(
    (resolved: ThemeName) => {
      const root = document.documentElement
      const config = THEMES.find((t) => t.name === resolved)

      const restoreTransitions = disableTransitionOnChange
        ? disableTransitionsTemporarily()
        : null

      // Remove all theme classes
      THEMES.forEach((t) => root.classList.remove(`theme-${t.name}`))
      root.classList.remove("dark")

      // Apply new theme class
      root.classList.add(`theme-${resolved}`)
      if (config?.colorScheme === "dark") {
        root.classList.add("dark")
      }

      // Also set data-theme for DaisyUI compatibility during migration
      root.setAttribute("data-theme", resolved)

      if (restoreTransitions) {
        restoreTransitions()
      }
    },
    [disableTransitionOnChange]
  )

  // Apply theme on mount and when it changes
  React.useEffect(() => {
    applyTheme(resolveTheme(theme))
  }, [theme, applyTheme])

  // System preference listener (only when 'auto')
  React.useEffect(() => {
    if (theme !== "auto") return undefined

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      applyTheme(resolveTheme("auto"))
      forceUpdate()
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [theme, applyTheme])

  // Keyboard shortcut 'd' — toggle between light/dark themes
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isEditableTarget(event.target)) return
      if (event.key.toLowerCase() !== "d") return

      setThemeState((current) => {
        const currentResolved = resolveTheme(current)
        const currentConfig = THEMES.find((t) => t.name === currentResolved)
        const isDark = currentConfig?.colorScheme === "dark"

        const next: ThemeName = isDark
          ? lastLightRef.current
          : lastDarkRef.current

        localStorage.setItem(storageKey, next)
        return next
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [storageKey])

  // Cross-tab sync via storage event
  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return
      if (event.key !== storageKey) return

      if (isThemeSelection(event.newValue)) {
        setThemeState(event.newValue)
        return
      }

      setThemeState(defaultTheme)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [defaultTheme, storageKey])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
