import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { FaTooth, FaCalendarAlt, FaUserMd, FaHospital, FaUserShield, FaXRay, FaStar, FaArrowRight, FaCheck, FaUsers, FaChartLine, FaLock, FaCloud } from 'react-icons/fa'
import { MdDashboard, MdSchedule, MdMedicalServices, MdVerified } from 'react-icons/md'
import { Navbar, Button, Card, Logo, LoadingSpinner } from '../components'
import { useTheme } from '../contexts/ThemeContext'
import { authUtils } from '../utils/auth'

const Home = () => {
  const { isDarkMode } = useTheme()  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const { scrollYProgress } = useScroll()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await authUtils.isAuthenticated()
        setIsAuthenticated(authResult)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthenticated(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()

    // Listen for logout events
    const handleLogout = () => {
      setIsAuthenticated(false)
    }

    window.addEventListener('logout', handleLogout)

    return () => {
      window.removeEventListener('logout', handleLogout)
    }
  }, [])

  // If user is authenticated and didn't just logout, redirect to their dashboard
  if (!isChecking && isAuthenticated) {
    const dashboardRoute = authUtils.getDashboardRoute()
    return <Navigate to={dashboardRoute} replace />
  }

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-linear-to-br from-gray-900 to-gray-800'
          : 'bg-linear-to-br from-teal-50 to-blue-50'
      }`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  const features = [
    {
      icon: FaUserMd,
      title: "Complete Patient Management",
      description: "Centralized patient records with treatment history, appointments, and comprehensive medical documentation all in one place.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FaCalendarAlt,
      title: "Intelligent Scheduling",
      description: "Smart appointment booking system with real-time availability, automated reminders, and conflict prevention.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: MdMedicalServices,
      title: "Treatment Planning",
      description: "Create detailed treatment plans with cost estimation, session tracking, and progress monitoring for optimal patient care.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: FaXRay,
      title: "Radiology Integration",
      description: "Seamlessly request X-rays and receive digital results from integrated radiology centers directly in the system.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: FaHospital,
      title: "Multi-Clinic Support",
      description: "Manage multiple clinic locations with dedicated staff, schedules, and resources from a unified platform.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: FaUserShield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with role-based access control ensuring data privacy and regulatory compliance.",
      color: "from-indigo-500 to-purple-500"
    }
  ]

  const userTypes = [
    {
      type: "System Admin",
      icon: FaUserShield,
      description: "Complete system oversight and configuration",
      features: ["Create & manage clinics", "Setup radiology centers", "User administration", "System-wide analytics & reports"]
    },
    {
      type: "Clinic Manager",
      icon: FaHospital,
      description: "Multi-location clinic operations management",
      features: ["Manage dentist teams", "Secretary coordination", "Clinic resource allocation", "Performance monitoring"]
    },
    {
      type: "Dentist",
      icon: FaUserMd,
      description: "Comprehensive patient care and treatment",
      features: ["Patient management system", "Treatment planning & tracking", "Appointment scheduling", "Digital X-ray requests", "Payment processing"]
    },
    {
      type: "Patient",
      icon: FaTooth,
      description: "Convenient care access and health tracking",
      features: ["Online appointment booking", "Treatment history access", "Digital X-ray results", "Payment history", "Multi-clinic selection"]
    }
  ]

  return (
    <div className={`min-h-screen ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className={`relative overflow-hidden ${
        isDarkMode ? 'bg-linear-to-b from-gray-900 via-gray-800 to-gray-900' : 'bg-linear-to-b from-teal-50 to-white'
      }`}>
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className={`absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-20 ${
              isDarkMode ? 'bg-teal-500' : 'bg-teal-300'
            }`}
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div 
            className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
              isDarkMode ? 'bg-cyan-500' : 'bg-cyan-300'
            }`}
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-32 pb-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Logo Badge */}
            <motion.div 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-sm'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <FaTooth className="text-teal-500" />
              </motion.div>
              <span className="text-sm font-medium">Professional Dental Management</span>
              <MdVerified className="text-teal-500" />
            </motion.div>
            
            <motion.h1 
              className={`text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Simplify Your
              <span className="relative inline-block mx-3">
                <motion.span 
                  className="relative z-10 bg-linear-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  Dental Practice
                </motion.span>
                <motion.span 
                  className="absolute bottom-2 left-0 w-full h-3 bg-teal-500/20 -rotate-1"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                />
              </span>
              Management
            </motion.h1>
            
            <motion.p 
              className={`text-lg md:text-xl mb-10 leading-relaxed ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              All-in-one platform to manage patients, appointments, treatments, and staff. 
              Built for modern dental practices who want efficiency without complexity.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="xl" className="min-w-52 shadow-lg shadow-teal-500/30">
                  <Link to="/signup" className="flex items-center gap-2">
                    Get Started Free 
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <FaArrowRight />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="xl" className="min-w-52">
                  <Link to="/login" className="flex items-center gap-2">
                    Sign In
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { value: '100+', label: 'Active Clinics' },
                { value: '5000+', label: 'Patients Managed' },
                { value: '99.9%', label: 'Uptime' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-3xl font-bold text-teal-500 mb-1">{stat.value}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="py-24 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-block px-4 py-2 bg-teal-500/10 text-teal-500 rounded-full text-sm font-semibold mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              FEATURES
            </motion.span>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4`}>
              Everything Your Practice Needs
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Powerful tools designed to streamline operations and improve patient care
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`group relative p-8 rounded-2xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-750 border border-gray-700' 
                    : 'bg-gray-50 hover:bg-white hover:shadow-xl border border-gray-100'
                }`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div 
                  className={`inline-flex p-3 rounded-xl bg-linear-to-br ${feature.color} mb-5`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="text-2xl text-white" />
                </motion.div>
                <h3 className={`text-xl font-bold mb-3`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* User Roles Section */}
      <motion.section 
        id="roles"
        className={`py-24 px-4 ${
          isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-block px-4 py-2 bg-cyan-500/10 text-cyan-500 rounded-full text-sm font-semibold mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              FOR EVERYONE
            </motion.span>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4`}>
              Tailored for Your Team
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Custom dashboards and features for every role in your practice
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userTypes.map((user, index) => (
              <motion.div
                key={index}
                className={`group p-8 rounded-2xl transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-900 border border-gray-700 hover:border-teal-500' 
                    : 'bg-white border border-gray-200 hover:border-teal-500 shadow-sm hover:shadow-lg'
                }`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-start gap-5">
                  <motion.div 
                  className="shrink-0 w-14 h-14 flex items-center justify-center bg-linear-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <user.icon className="text-2xl text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-2`}>
                      {user.type}
                    </h3>
                    <p className={`mb-5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user.description}
                    </p>
                    <ul className="space-y-2">
                      {user.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className={`flex items-start gap-3 text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <FaCheck className="text-teal-500 mt-1 shrink-0" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us Section */}
      <motion.section 
        id="why-us"
        className="py-24 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              className="inline-block px-4 py-2 bg-purple-500/10 text-purple-500 rounded-full text-sm font-semibold mb-4"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              WHY DENTIFY
            </motion.span>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4`}>
              Built for Modern Practices
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaCloud, title: 'Cloud-Based', desc: 'Access from anywhere, anytime', color: 'blue' },
              { icon: FaLock, title: 'Secure', desc: 'Bank-level encryption & security', color: 'green' },
              { icon: FaUsers, title: 'Easy to Use', desc: 'Intuitive interface for all users', color: 'orange' },
              { icon: FaChartLine, title: 'Analytics', desc: 'Track performance & insights', color: 'purple' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className={`text-center p-6 rounded-xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <motion.div 
                  className={`w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-${item.color}-500/10 rounded-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <item.icon className={`text-2xl text-${item.color}-500`} />
                </motion.div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        id="get-started"
        className="py-24 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className={`relative overflow-hidden rounded-3xl ${
              isDarkMode ? 'bg-linear-to-r from-teal-600 to-cyan-600' : 'bg-linear-to-r from-teal-500 to-cyan-500'
            }`}
            initial={{ scale: 0.9, y: 30 }}
            whileInView={{ scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <motion.div 
                className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.1, 0.15, 0.1]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </div>

            <div className="relative p-12 md:p-16 text-center text-white">
              <motion.div 
                className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-white/20 rounded-2xl backdrop-blur-sm"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FaTooth className="text-3xl" />
              </motion.div>
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Start Managing Smarter Today
              </motion.h2>
              <motion.p 
                className="text-lg mb-8 opacity-95 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Join hundreds of dental professionals transforming their practice management. 
                Get started in minutes, no credit card required.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="secondary" size="xl" className="bg-white text-teal-600 hover:bg-white">
                    <Link to="/signup" className="flex items-center gap-2">
                      Create Free Account <FaArrowRight />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="xl" className="text-white border-2 border-white hover:bg-white/10">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className={`border-t py-12 px-4 ${
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'
        }`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Logo className="justify-center mb-4" />
            </motion.div>
            <motion.p 
              className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Professional dental practice management for modern clinics
            </motion.p>
            <motion.div 
              className={`flex items-center gap-6 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span>© 2025 Dentify</span>
              <span>•</span>
              <span>All rights reserved</span>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default Home
