'use client'

import { createContext, useContext, useLayoutEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
}>({ theme: 'light', setTheme: () => {} })

function applyTheme(t: Theme) {
  if (t === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as Theme | null
      const resolved: Theme = stored === 'dark' ? 'dark' : 'light'
      setThemeState(resolved)
      applyTheme(resolved)
    } catch {
      applyTheme('light')
    }
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    applyTheme(t)
    try {
      localStorage.setItem('theme', t)
    } catch {}
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
