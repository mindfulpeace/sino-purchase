import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "dark" | "light"

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const STORAGE_KEY = "sino-purchase-theme"

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readInitial(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark"
  } catch {
    return "dark"
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitial)

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === "dark" ? "light" : "dark"
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", theme === "light")
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
