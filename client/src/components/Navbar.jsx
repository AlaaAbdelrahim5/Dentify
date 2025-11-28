import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaTimes, FaBars, FaBell, FaSignOutAlt, FaUser, FaCog, FaHome, FaChevronDown } from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import Button from './Button'
import { useTheme } from '../contexts/ThemeContext'
import { authUtils } from '../utils/auth'

const Navbar = ({ showDashboardInfo = false, dashboardTitle = "", onToggleSidebar = null }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const handleLogout = () => {
    try {
      console.log('Navbar: Starting logout process')
      authUtils.logout()
      console.log('Navbar: Logout completed, navigating to login page')
      setIsProfileDropdownOpen(false)
      // Navigate to login page after logout
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Navbar: Error during logout:', error)
      // Even if there's an error, try to navigate to login
      navigate('/login', { replace: true })
    }
  }

  const getDashboardRoute = () => {
    if (!currentUser?.role) return '/'
    
    const roleRoutes = {
      'admin': '/admin/dashboard',
      'clinic': '/clinic/dashboard',
      'dentist': '/dentist/dashboard',
      'patient': '/patient/dashboard',
      'secretary': '/clinic/dashboard',
      'radiology': '/radiology/dashboard'
    }
    
    return roleRoutes[currentUser.role.toLowerCase()] || '/'
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-lg transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-900/95 border-b border-gray-700/50' 
        : 'bg-white/95 border-b border-gray-200/50'
    }`}>
      <div className={`${showDashboardInfo ? 'w-full' : 'max-w-7xl mx-auto'} px-6 lg:px-8`}>
        <div className="flex justify-between items-center h-16">
          {/* Logo and Sidebar Toggle */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button (only show on dashboard pages) */}
            {showDashboardInfo && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
                  isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-300 hover:text-teal-400' 
                    : 'hover:bg-gray-100 text-gray-700 hover:text-teal-600'
                }`}
                aria-label="Toggle sidebar"
              >
                <FaBars className="w-5 h-5" />
              </button>
            )}
            {!isAuthenticated && (
              <Link to="/" className="flex-shrink-0 transform transition-transform duration-200 hover:scale-105">
                <Logo size="text-2xl" />
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/" className="flex-shrink-0 transform transition-transform duration-200 hover:scale-105">
                <Logo size="text-xl" />
              </Link>
            )}
          </div>

          {/* Navigation Links - Desktop and Mobile */}
          <div className="flex items-center space-x-2 md:space-x-4">
              
              {!isAuthenticated ? (
                // Unauthenticated user navigation
                <>
                  <Link 
                    to="/login" 
                    className={`hidden md:block px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border ${
                      isDarkMode 
                        ? 'text-gray-300 border-gray-700 hover:text-teal-400 hover:border-teal-400 hover:bg-gray-800/50' 
                        : 'text-gray-700 border-gray-300 hover:text-teal-600 hover:border-teal-600 hover:bg-gray-50'
                    }`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="hidden md:block bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 hover:from-teal-500 hover:to-cyan-500"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                // Authenticated user navigation
                <>
                  {/* Notifications */}
                  <div className="relative group">
                    <button className={`p-2 md:p-2.5 rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'hover:bg-gray-800 text-gray-400 hover:text-teal-400' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-teal-600'
                    }`}>
                      <FaBell className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <span className="absolute top-1 right-1 md:top-1.5 md:right-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                      2
                    </span>
                  </div>

                  {/* User Profile with Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleProfileDropdown}
                      className={`flex items-center space-x-2 md:space-x-3 px-2 md:px-3 py-1.5 md:py-2 rounded-lg transition-all duration-200 ${
                        isDarkMode 
                          ? 'hover:bg-gray-800/50' 
                          : 'hover:bg-gray-100/50'
                      } ${isProfileDropdownOpen ? (isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50') : ''}`}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-offset-2 ring-offset-transparent transition-all duration-200 hover:ring-teal-500">
                          <span className="text-white text-xs md:text-sm font-bold">
                            {currentUser ? authUtils.getUserInitials() : 'U'}
                          </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="hidden md:flex flex-col">
                        <span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {currentUser ? authUtils.getUserName() : 'User'}
                        </span>
                      </div>
                      {/* Dropdown Indicator */}
                      <FaChevronDown 
                        className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        } ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border overflow-hidden transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700' 
                          : 'bg-white border-gray-200'
                      }`}>
                        {/* User Info Header */}
                        <div className={`px-4 py-3 border-b ${
                          isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'
                        }`}>
                          <p className={`text-sm font-semibold truncate ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {currentUser ? authUtils.getUserName() : 'User'}
                          </p>
                          {currentUser?.email && (
                            <p className={`text-xs truncate ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {currentUser.email}
                            </p>
                          )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false)
                              // You can add profile page navigation here
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors duration-200 ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <FaUser className="w-5 h-5" />
                            <span className="text-sm font-medium">Profile</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false)
                              // You can add settings page navigation here
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors duration-200 ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <FaCog className="w-5 h-5" />
                            <span className="text-sm font-medium">Settings</span>
                          </button>
                        </div>

                        {/* Logout Section */}
                        <div className={`border-t ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <button
                            onClick={handleLogout}
                            className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors duration-200 ${
                              isDarkMode 
                                ? 'hover:bg-red-900/20 text-red-400' 
                                : 'hover:bg-red-50 text-red-600'
                            }`}
                          >
                            <FaSignOutAlt className="w-5 h-5" />
                            <span className="text-sm font-semibold">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          {/* Mobile Menu Button (only when not showing dashboard) */}
          {!showDashboardInfo && (
            <div className="md:hidden flex items-center space-x-2">
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
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className={`px-3 pt-3 pb-4 space-y-2 shadow-xl rounded-b-2xl transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-900/95 border-t border-gray-700/50' 
                : 'bg-white/95 border-t border-gray-200/50'
            }`}>
              {!isAuthenticated ? (
                // Unauthenticated mobile menu
                <>
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 border ${
                      isDarkMode 
                        ? 'text-gray-300 border-gray-700 hover:text-teal-400 hover:border-teal-400 hover:bg-gray-800/70' 
                        : 'text-gray-700 border-gray-300 hover:text-teal-600 hover:border-teal-600 hover:bg-gray-50'
                    }`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 mt-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-center rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                // Authenticated mobile menu
                <>
                  {/* Dashboard Info Badge */}
                  {showDashboardInfo && dashboardTitle && (
                    <div className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 ${
                      isDarkMode ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-100/70 text-gray-700'
                    }`}>
                      <MdDashboard className={`text-lg ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
                      <span className="text-sm font-semibold">{dashboardTitle}</span>
                    </div>
                  )}

                  {/* User Profile Card */}
                  <div className={`px-4 py-3 rounded-xl flex items-center space-x-3 ${
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/70'
                  }`}>
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white text-base font-bold">
                          {currentUser ? authUtils.getUserInitials() : 'U'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className={`text-base font-semibold ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {currentUser ? authUtils.getUserName() : 'User'}
                      </span>
                    </div>
                    {/* Notification Badge */}
                    <div className="relative">
                      <FaBell className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                        2
                      </span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                      isDarkMode 
                        ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30' 
                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span>Logout</span>
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