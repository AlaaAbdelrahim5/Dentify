import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PatientDashboard from './pages/dashboard/PatientDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ClinicDashboard from './pages/dashboard/ClinicDashboard'
import DentistDashboard from './pages/dashboard/DentistDashboard'
import NotFound from './pages/NotFound'
import LoadingSpinner from './components/LoadingSpinner'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { authUtils } from './utils/auth'
import './styles/App.css'

// Component to handle authentication-based routing
const AuthRouter = () => {
  const { isDarkMode } = useTheme()
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  // Function to check auth state
  const checkAuthState = async () => {
    try {
      const authResult = await authUtils.initializeAuth()
      setIsAuthenticated(authResult)
      if (authResult) {
        setUser(authUtils.getCurrentUser())
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to check authentication:', error)
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  // Initial authentication check
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await checkAuthState()
      } finally {
        setIsInitializing(false)
      }
    }

    initializeApp()
  }, [])

  // Listen for logout events (storage changes)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Check if logout flag was set
      if (e.key === 'dentify_logout_performed' && e.newValue === 'true') {
        console.log('App: Logout detected via storage event')
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    // Listen for storage changes (works across tabs and after logout)
    window.addEventListener('storage', handleStorageChange)

    // Also create a custom event listener for same-tab logout
    const handleLogout = () => {
      console.log('App: Logout detected via custom event')
      setIsAuthenticated(false)
      setUser(null)
    }

    window.addEventListener('logout', handleLogout)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('logout', handleLogout)
    }
  }, [])

  if (isInitializing) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-teal-50 to-blue-50'
      }`}>
        <LoadingSpinner />
      </div>
    )
  }

  // Only redirect if user is authenticated AND we have valid user data
  if (isAuthenticated && user && 
      (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup')) {
    const dashboardRoute = authUtils.getDashboardRoute()
    console.log('AuthRouter: Redirecting authenticated user to dashboard:', dashboardRoute)
    return <Navigate to={dashboardRoute} replace />
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800'
        : 'bg-gradient-to-br from-teal-50 to-blue-50'
    }`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/clinic/dashboard" element={<ClinicDashboard />} />
        <Route path="/dentist/dashboard" element={<DentistDashboard />} />
        {/* <Route path="/admin/setup" element={<AdminSetup />} /> */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

const AppContent = () => {
  return (
    <Router>
      <AuthRouter />
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
