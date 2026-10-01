/**
 * lib/theme.ts
 * Mengelola tema Dark / Light Mode.
 * - Membaca preferensi dari localStorage atau prefers-color-scheme
 * - Mengatur atribut data-theme pada document.documentElement
 * - Menyediakan hook / helper reaktif
 */

import { useState, useEffect } from 'react'

export type Theme = 'pixel' | 'dark' | 'light'

const THEME_STORAGE_KEY = 'snapbooth_theme'

export function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'pixel' || saved === 'dark' || saved === 'light') return saved
  } catch {}
  return 'pixel'
}

export function applyTheme(theme: Theme): void {
  try {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const color =
        theme === 'pixel' ? '#090a12' : theme === 'light' ? '#f8fafc' : '#0d0d14'
      metaThemeColor.setAttribute('content', color)
    }
  } catch {}
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    const next: Theme =
      theme === 'pixel' ? 'dark' : theme === 'dark' ? 'light' : 'pixel'
    setThemeState(next)
    applyTheme(next)
  }

  return { theme, toggleTheme, setTheme: setThemeState }
}


