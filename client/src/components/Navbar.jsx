import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaTimes, FaBars } from 'react-icons/fa'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isDarkMode } = useTheme()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-lg transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900/95 border-b border-gray-800' 
        : 'bg-white/95 border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo size="text-2xl" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium transition-colors duration-200 relative group ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-teal-400' 
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              Home
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isDarkMode ? 'bg-teal-400' : 'bg-teal-600'
              }`}></span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link 
                to="/login" 
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-teal-400' 
                    : 'text-gray-700 hover:text-teal-600'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button and Theme Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button 
              onClick={toggleMobileMenu}
              className={`p-2 transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-teal-400' 
                  : 'text-gray-700 hover:text-teal-600'
              }`}
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 shadow-lg rounded-b-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-900 border-t border-gray-800' 
                : 'bg-white border-t border-gray-100'
            }`}>
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-teal-400 hover:bg-gray-800' 
                    : 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 mx-3 mt-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center rounded-lg text-base font-medium hover:shadow-lg transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar