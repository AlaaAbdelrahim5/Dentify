import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaTimes, FaBars, FaBell, FaSignOutAlt } from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Button from './Button'
import { useTheme } from '../contexts/ThemeContext'
import { authUtils } from '../utils/auth'

const Navbar = ({ showDashboardInfo = false, dashboardTitle = "" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await authUtils.isAuthenticated()
      const user = authUtils.getCurrentUser()
      setIsAuthenticated(authenticated)
      setCurrentUser(user)
    }
    
    checkAuth()
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = async () => {
    try {
      console.log('Navbar: Starting logout process')
      await authUtils.logout()
      console.log('Navbar: Logout completed, navigating to home page')
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Navbar: Error during logout:', error)
      // Even if there's an error, try to navigate to home
      navigate('/', { replace: true })
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm shadow-lg transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900/95 border-b border-gray-800' 
        : 'bg-white/95 border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Dashboard Info */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated && (
              <Link to="/" className="flex-shrink-0">
                <Logo size="text-2xl" />
              </Link>
            )}
            {isAuthenticated && showDashboardInfo && dashboardTitle && (
              <div className="flex items-center space-x-2">
                <MdDashboard className="text-gray-400" />
                <span className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>{dashboardTitle}</span>
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {!isAuthenticated ? (
                // Unauthenticated user navigation
                <>
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
                </>
              ) : (
                // Authenticated user navigation
                <>
                  <div className="relative">
                    <FaBell className="text-gray-400 hover:text-teal-600 cursor-pointer" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {currentUser ? authUtils.getUserInitials() : 'U'}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {currentUser ? authUtils.getUserName() : 'User'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-red-600"
                      title="Logout"
                    >
                      <FaSignOutAlt />
                    </Button>
                  </div>
                </>
              )}
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
              {!isAuthenticated ? (
                // Unauthenticated mobile menu
                <>
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
                </>
              ) : (
                // Authenticated mobile menu
                <>
                  {showDashboardInfo && dashboardTitle && (
                    <div className={`px-3 py-2 text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <MdDashboard className="inline-block mr-2" />
                      {dashboardTitle}
                    </div>
                  )}
                  <div className={`px-3 py-2 flex items-center space-x-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {currentUser ? authUtils.getUserInitials() : 'U'}
                      </span>
                    </div>
                    <span className="text-base font-medium">
                      {currentUser ? authUtils.getUserName() : 'User'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'text-red-400 hover:bg-gray-800' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <FaSignOutAlt className="inline-block mr-2" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar