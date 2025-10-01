import { Link, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FaTooth, FaCalendarAlt, FaUserMd, FaHospital, FaUserShield, FaXRay, FaStar, FaArrowRight, FaCheck } from 'react-icons/fa'
import { MdDashboard, MdSchedule, MdMedicalServices } from 'react-icons/md'
import { Navbar, Button, Card, Logo } from '../components'
import { useTheme } from '../contexts/ThemeContext'
import { authUtils } from '../utils/auth'

const Home = () => {
  const { isDarkMode, theme } = useTheme()  
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If user just logged out, don't redirect
        if (authUtils.wasLoggedOut()) {
          console.log('Home: User just logged out, staying on home page and clearing logout flag')
          setIsAuthenticated(false)
          setIsChecking(false)
          // Clear the logout flag since we handled it
          authUtils.clearLogoutFlag()
          return
        }

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
  }, [])

  // If user is authenticated and didn't just logout, redirect to their dashboard
  if (!isChecking && isAuthenticated) {
    const dashboardRoute = authUtils.getDashboardRoute()
    console.log('Home: Redirecting authenticated user to dashboard:', dashboardRoute)
    return <Navigate to={dashboardRoute} replace />
  }

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-teal-50 to-blue-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }
  
  const features = [
    {
      icon: FaUserMd,
      title: "Dentist Dashboard",
      description: "Complete patient management, appointment scheduling, and treatment planning.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FaHospital,
      title: "Clinic Management",
      description: "Manage multiple dentists, secretaries, and clinic operations efficiently.",
      color: "from-teal-500 to-green-500"
    },
    {
      icon: FaCalendarAlt,
      title: "Smart Scheduling",
      description: "Advanced appointment booking with automated confirmations and reminders.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: FaXRay,
      title: "Radiology Integration",
      description: "Seamless X-ray requests and results sharing between centers and doctors.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: FaUserShield,
      title: "Role-Based Access",
      description: "Secure access control for admins, dentists, secretaries, and patients.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: MdMedicalServices,
      title: "Patient Records",
      description: "Comprehensive medical history and treatment tracking for better care.",
      color: "from-green-500 to-teal-500"
    }
  ]

  const userTypes = [
    {
      type: "Admin",
      icon: FaUserShield,
      description: "Complete system management and oversight",
      features: ["Create clinics", "Manage dentists", "Radiology centers", "System analytics"]
    },
    {
      type: "Dentist",
      icon: FaUserMd,
      description: "Patient care and practice management",
      features: ["Patient management", "Appointment scheduling", "Treatment planning", "X-ray requests"]
    },
    {
      type: "Patient",
      icon: FaTooth,
      description: "Easy appointment booking and health tracking",
      features: ["Book appointments", "View treatments", "Medical history", "X-ray results"]
    },
    {
      type: "Secretary",
      icon: MdSchedule,
      description: "Clinic operations and appointment coordination",
      features: ["Schedule management", "Patient check-in", "Appointment confirmation", "Clinic support"]
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 text-gray-900'
    }`}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Logo className="justify-center" size="text-4xl" />
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Modern Dental
            <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Practice Management
            </span>
          </h1>
          
          <p className={`text-xl mb-10 max-w-3xl mx-auto leading-relaxed ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Streamline your dental clinic operations with our comprehensive management system. 
            From patient care to administrative tasks, we've got you covered.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="xl" className="min-w-48">
              <Link to="/signup" className="flex items-center gap-2">
                Get Started <FaArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="min-w-48">
              <Link to="/login" className="flex items-center gap-2">
                Sign In <FaTooth className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Everything You Need to
              <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Run Your Practice
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Powerful features designed specifically for modern dental practices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="group">
                <Card.Content className="p-8 text-center">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="text-3xl text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className={`py-20 px-4 ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
      }`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Built for Every Role in
              <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Your Dental Practice
              </span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Tailored experiences for administrators, dentists, patients, and support staff
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {userTypes.map((user, index) => (
              <Card key={index} hover className="group">
                <Card.Content className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <user.icon className="text-2xl text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-2xl font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {user.type}
                      </h3>
                      <p className={`mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {user.description}
                      </p>
                      <ul className="space-y-2">
                        {user.features.map((feature, idx) => (
                          <li key={idx} className={`flex items-center gap-2 text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            <FaCheck className="text-teal-500 text-xs" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 border-0 text-white">
            <Card.Content className="p-12 text-center">
              <FaTooth className="text-5xl mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Practice?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of dental professionals who trust Dentify to manage their practice efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="xl" className="bg-white text-teal-600 hover:bg-gray-50">
                  <Link to="/signup">Create Account</Link>
                </Button>
                <Button variant="ghost" size="xl" className="text-white border-white hover:bg-white/10">
                  <Link to="/login">Sign In Now</Link>
                </Button>
              </div>
            </Card.Content>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className={`text-white py-12 px-4 ${
        isDarkMode ? 'bg-gray-950' : 'bg-gray-900'
      }`}>
        <div className="max-w-7xl mx-auto text-center">
          <Logo className="justify-center mb-6" />
          <p className="text-gray-400 mb-4">
            Empowering dental practices with modern management solutions
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
            <span>© 2025 Dentify. All rights reserved.</span>
            <span>•</span>
            <span>Dental Practice Management System</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
