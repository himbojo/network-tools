// File: frontend/src/hooks/useTheme.ts
import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

type Theme = 'dark' | 'light'

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark')
  
  useEffect(() => {
    // Update DOM when theme changes
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  return { theme, toggleTheme }
}