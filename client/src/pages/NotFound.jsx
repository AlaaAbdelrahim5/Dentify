import { Link, useNavigate } from 'react-router-dom'
import { FaTooth, FaHome, FaArrowLeft } from 'react-icons/fa'
import { Button, Card } from '../components'
import { useTheme } from '../contexts/ThemeContext'

const NotFound = () => {
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50'
    }`}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? 'bg-teal-500' : 'bg-teal-300'
        }`}></div>
        <div className={`absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isDarkMode ? 'bg-cyan-500' : 'bg-cyan-300'
        }`}></div>
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Animated Tooth Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <FaTooth className="text-9xl text-teal-200 mx-auto animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">404</span>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl backdrop-blur-sm bg-opacity-95">
          <Card.Content className="p-10">
            <h1 className={`text-4xl font-extrabold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Oops! Page Not Found
            </h1>
            
            <p className={`mb-8 text-lg leading-relaxed ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              The page you're looking for seems to have wandered off like a wisdom tooth! 
              Let's get you back to familiar territory.
            </p>

            <div className="space-y-4">
              <Button 
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                size="lg"
                onClick={() => navigate(-1)}
              >
                <div className="flex items-center justify-center gap-2">
                  <FaArrowLeft />
                  Go Back
                </div>
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            If you believe this is an error, please contact our support team.
          </p>
          
          <div className={`inline-flex items-center gap-6 text-xs px-6 py-3 rounded-full ${
            isDarkMode ? 'bg-gray-800 bg-opacity-50 text-gray-400' : 'bg-white bg-opacity-80 text-gray-500'
          } shadow-md`}>
            <span>Error Code: 404</span>
            <span>•</span>
            <span>Page Not Found</span>
            <span>•</span>
            <span>💬 Need Help?</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound