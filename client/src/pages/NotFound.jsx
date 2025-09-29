import { Link } from 'react-router-dom'
import { FaTooth, FaHome, FaArrowLeft } from 'react-icons/fa'
import { Button, Card } from '../components'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated Tooth Icon */}
        <div className="mb-8">
          <div className="relative">
            <FaTooth className="text-8xl text-teal-200 mx-auto animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-teal-600">404</span>
            </div>
          </div>
        </div>

        <Card className="shadow-2xl">
          <Card.Content className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Page Not Found
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              The page you're looking for seems to have wandered off like a wisdom tooth! 
              Let's get you back to familiar territory.
            </p>

            <div className="space-y-4">
              <Button className="w-full" size="lg">
                <Link to="/" className="flex items-center justify-center gap-2">
                  <FaHome />
                  Back to Home
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" size="lg">
                <Link to="/login" className="flex items-center justify-center gap-2">
                  <FaTooth />
                  Go to Login
                </Link>
              </Button>
            </div>
          </Card.Content>
        </Card>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            If you believe this is an error, please contact our support team.
          </p>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
            <span>Error Code: 404</span>
            <span>•</span>
            <span>Page Not Found</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound