import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FaTimes, FaBars, FaSignOutAlt, FaUser, FaCog, FaHome, FaChevronDown, FaEnvelope } from 'react-icons/fa'
import { MdDashboard, MdNotifications } from 'react-icons/md'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { Button } from '../common'
import { useTheme } from '../../contexts/ThemeContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { useChat } from '../../contexts/ChatContext'
import { NotificationDropdown } from '../features/notifications'
import { ChatButton, ChatSidebar } from '../features/chat'
import { authUtils } from '../../utils/auth'
import { getImageUrl } from '../../utils/helpers'

const Navbar = ({ showDashboardInfo = false, dashboardTitle = "", onToggleSidebar = null }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
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

    // Listen for profile image updates
    const handleProfileImageUpdate = () => {
      const user = authUtils.getCurrentUser()
      setCurrentUser(user)
    }

    window.addEventListener('profileImageUpdated', handleProfileImageUpdate)

    return () => {
      window.removeEventListener('profileImageUpdated', handleProfileImageUpdate)
    }
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
      authUtils.logout()
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
      'secretary': '/secretary/dashboard',
      'radiology': '/radiology/dashboard',
      'radiologycenter': '/radiology/dashboard'
    }
    
    return roleRoutes[currentUser.role.toLowerCase()] || '/'
  }

  const handleSettingsClick = () => {
    setIsProfileDropdownOpen(false)
    const dashboardPath = getDashboardRoute()
    // Check if we're already on the dashboard route
    if (location.pathname === dashboardPath) {
      // If already on dashboard, use replace to update state without navigation
      navigate(dashboardPath, { state: { activeTab: 'settings' }, replace: true })
    } else {
      // If on a different route, navigate normally
      navigate(dashboardPath, { state: { activeTab: 'settings' } })
    }
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-linear-to-r from-gray-900/98 via-gray-900/98 to-gray-800/98 border-b border-gray-700/30 shadow-2xl shadow-gray-900/20' 
        : 'bg-linear-to-r from-white/98 via-white/98 to-gray-50/98 border-b border-gray-200/40 shadow-xl shadow-gray-200/40'
    }`}>
      <div className={`${showDashboardInfo ? 'w-full' : 'max-w-7xl mx-auto'} px-4 lg:px-6`}>
        <div className="flex justify-between items-center h-16">
          {/* Logo and Sidebar Toggle */}
          <div className="flex items-center space-x-3">
            {/* Sidebar Toggle Button - Visible on all screen sizes */}
            {showDashboardInfo && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className={`p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isDarkMode 
                    ? 'hover:bg-gray-800/70 text-gray-400 hover:text-teal-400 hover:shadow-lg hover:shadow-teal-500/10' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-teal-600 hover:shadow-md'
                }`}
                aria-label="Toggle sidebar"
                type="button"
              >
                <FaBars className="w-5 h-5" />
              </button>
            )}
            <div className="shrink-0 transform transition-all duration-300 hover:scale-105">
              <Logo size={isAuthenticated ? "text-xl" : "text-2xl"} />
            </div>
          </div>

          {/* Navigation Links - Desktop and Mobile */}
          <div className="flex items-center space-x-1 md:space-x-2">
              
              {!isAuthenticated ? (
                // Unauthenticated user navigation
                <>
                  <Link 
                    to="/login" 
                    className={`hidden md:block px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 border-2 hover:scale-105 active:scale-95 ${
                      isDarkMode 
                        ? 'text-gray-300 border-gray-700/50 hover:text-teal-400 hover:border-teal-500/50 hover:bg-gray-800/40 hover:shadow-lg hover:shadow-teal-500/10' 
                        : 'text-gray-700 border-gray-300 hover:text-teal-600 hover:border-teal-500 hover:bg-teal-50/50 hover:shadow-md'
                    }`}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="hidden md:block bg-linear-to-r from-teal-500 via-teal-600 to-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 active:scale-95 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                // Authenticated user navigation
                <>
                  {/* Chat Button */}
                  <ChatButton onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)} />

                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* Divider */}
                  <div className={`hidden md:block h-8 w-px mx-1 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-300/50'}`}></div>

                  {/* User Profile with Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleProfileDropdown}
                      className={`flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 ${
                        isDarkMode 
                          ? 'hover:bg-gray-800/70 hover:shadow-lg hover:shadow-teal-500/10' 
                          : 'hover:bg-gray-100 hover:shadow-md'
                      } ${isProfileDropdownOpen ? (isDarkMode ? 'bg-gray-800/70 shadow-lg' : 'bg-gray-100 shadow-md') : ''}`}
                    >
                      <div className="relative">
                        {currentUser?.profileImage ? (
                          <img 
                            src={getImageUrl(currentUser.profileImage)}
                            alt={authUtils.getUserName()}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover shadow-lg ring-2 ring-teal-400/30 transition-all duration-200 hover:ring-teal-400/50 hover:shadow-2xl hover:shadow-teal-500/20"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 md:w-10 md:h-10 bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-teal-400/30 transition-all duration-200 hover:ring-teal-400/50 hover:shadow-2xl hover:shadow-teal-500/20 ${currentUser?.profileImage ? 'hidden' : ''}`}>
                          <span className="text-white text-xs md:text-sm font-bold">
                            {currentUser ? authUtils.getUserInitials() : 'U'}
                          </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white shadow-lg ring-2 ring-green-400/30"></div>
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className={`text-sm font-semibold ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {currentUser ? authUtils.getUserName() : 'User'}
                        </span>
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {currentUser?.role || 'Guest'}
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
                      <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl border backdrop-blur-lg overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-2 z-100 ${
                        isDarkMode 
                          ? 'bg-gray-800/95 border-gray-700/50 shadow-gray-900/50' 
                          : 'bg-white/95 border-gray-200/50 shadow-gray-200/50'
                      }`}>
                        {/* User Info Header */}
                        <div className={`px-5 py-4 border-b backdrop-blur-sm ${
                          isDarkMode ? 'border-gray-700/50 bg-linear-to-r from-gray-900/50 to-gray-800/50' : 'border-gray-200/50 bg-linear-to-r from-gray-50 to-white'
                        }`}>
                            <div className="flex items-center space-x-3">
                            {currentUser?.profileImage ? (
                                <img 
                                src={getImageUrl(currentUser.profileImage)}
                                alt={authUtils.getUserName()}
                                className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-teal-400/30"
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                    e.target.nextElementSibling.style.display = 'flex'
                                }}
                                />
                            ) : null}
                            <div className={`w-12 h-12 bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-teal-400/30 ${currentUser?.profileImage ? 'hidden' : ''}`}>
                              <span className="text-white text-base font-bold">
                                {currentUser ? authUtils.getUserInitials() : 'U'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold truncate ${
                                isDarkMode ? 'text-gray-100' : 'text-gray-900'
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
                              <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                                isDarkMode ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'
                              }`}>
                                {currentUser?.role || 'Guest'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2 px-2">
                          <button
                            onClick={handleSettingsClick}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                              isDarkMode 
                                ? 'hover:bg-gray-700/70 text-gray-300 hover:text-teal-400 hover:shadow-md' 
                                : 'hover:bg-gray-100 text-gray-700 hover:text-teal-600 hover:shadow-sm'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                              <FaCog className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold">Settings</span>
                          </button>
                        </div>

                        {/* Logout Section */}
                        <div className={`border-t mt-1 ${
                          isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                        }`}>
                          <div className="py-2 px-2">
                            <button
                              onClick={handleLogout}
                              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isDarkMode 
                                  ? 'hover:bg-red-900/30 text-red-400 hover:text-red-300 hover:shadow-md hover:shadow-red-900/20' 
                                  : 'hover:bg-red-50 text-red-600 hover:text-red-700 hover:shadow-sm'
                              }`}
                            >
                              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                                <FaSignOutAlt className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-bold">Logout</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          {/* Mobile Menu Button - Only for authenticated users on non-dashboard pages */}
          {!showDashboardInfo && isAuthenticated && (
            <div className="flex items-center space-x-2">
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
          <div>
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
                    className="block px-4 py-3 mt-2 bg-linear-to-r from-teal-600 to-cyan-600 text-white text-center rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
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
                      <div className="relative mb-4">
                      {currentUser?.profileImage ? (
                          <img 
                          src={getImageUrl(currentUser.profileImage)}
                          alt={authUtils.getUserName()}
                          className="w-12 h-12 rounded-full object-cover shadow-lg ring-2 ring-teal-400/30"
                          onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                          }}
                          />
                      ) : null}
                      <div className={`w-12 h-12 bg-linear-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ${currentUser?.profileImage ? 'hidden' : ''}`}>
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
                    {/* Notification Badges */}
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <FaEnvelope className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className="absolute -top-1 -right-1 bg-linear-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                          3
                        </span>
                      </div>
                      <div className="relative">
                        <MdNotifications className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className="absolute -top-1 -right-1 bg-linear-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                          2
                        </span>
                      </div>
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

      {/* Chat Sidebar */}
      {isAuthenticated && (
        <ChatSidebar 
          isOpen={isChatSidebarOpen} 
          onClose={() => setIsChatSidebarOpen(false)} 
        />
      )}
    </nav>
  )
}

export default Navbar