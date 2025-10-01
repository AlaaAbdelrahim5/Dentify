import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import PatientDashboard from './pages/dashboard/PatientDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import AdminSetup from './pages/AdminSetup'
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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user just logged out - this should be the first check
        if (authUtils.wasLoggedOut()) {
          console.log('App: User just logged out, clearing auth state and clearing logout flag')
          setIsAuthenticated(false)
          setUser(null)
          // Clear the logout flag after handling
          authUtils.clearLogoutFlag()
          setIsInitializing(false)
          return
        }

        const authResult = await authUtils.initializeAuth()
        setIsAuthenticated(authResult)
        if (authResult) {
          setUser(authUtils.getCurrentUser())
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Failed to initialize authentication:', error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeApp()
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
  // Don't redirect if user just logged out
  if (isAuthenticated && user && !authUtils.wasLoggedOut() && 
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
        <Route path="/admin/setup" element={<AdminSetup />} />
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
