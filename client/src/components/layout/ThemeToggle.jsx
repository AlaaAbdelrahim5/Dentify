import React from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95
        ${isDarkMode 
          ? 'hover:bg-gray-800/70 text-gray-400 hover:text-teal-400 hover:shadow-lg hover:shadow-teal-500/10' 
          : 'hover:bg-gray-100 text-gray-600 hover:text-teal-600 hover:shadow-md'
        }
        ${className}
      `}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        <FaSun 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out
            ${isDarkMode ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}
          `}
        />
        <FaMoon 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-in-out
            ${isDarkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}
          `}
        />
      </div>
    </button>
  )
}

export default ThemeToggle