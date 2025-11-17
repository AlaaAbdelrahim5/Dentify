import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(undefined)

function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export { useTheme }

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Only run this on client side
    if (typeof window === 'undefined') return false
    
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme === 'dark'
    }
    // Default to light mode
    return false
  })

  useEffect(() => {
    // Add transition class before theme changes for smooth transition
    document.documentElement.classList.add('theme-transition')
    document.body.classList.add('theme-transition')
    
    // Use requestAnimationFrame to ensure transition class is applied before theme change
    requestAnimationFrame(() => {
      // Update document class, style, and localStorage
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
        document.documentElement.style.backgroundColor = '#1f2937'
        document.documentElement.style.colorScheme = 'dark'
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
        document.documentElement.style.backgroundColor = '#ffffff'
        document.documentElement.style.colorScheme = 'light'
        localStorage.setItem('theme', 'light')
      }
      
      // Remove transition class after animation completes
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition')
        document.body.classList.remove('theme-transition')
      }, 300)
    })
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev)
  }

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}