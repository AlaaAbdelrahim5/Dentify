import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import Logo from '../components/Logo'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Handle login logic here
    console.log('Login attempt:', formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="justify-center" size="text-3xl" />
          <p className="mt-4 text-gray-600">Welcome to Dentify! Please sign in to continue.</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl">
          <Card.Header>
            <h2 className="text-2xl font-bold text-gray-900 text-center">Sign In</h2>
            <p className="text-sm text-gray-600 text-center mt-2">
              Access your Dentify account
            </p>
          </Card.Header>
          <Card.Content className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                icon={FaEnvelope}
              />

              {/* Password Input */}
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                icon={FaLock}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-500 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full">
                Sign In
              </Button>
            </form>
          </Card.Content>

          {/* Sign Up Link */}
          <Card.Footer className="bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Sign up here
              </Link>
            </p>
          </Card.Footer>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <Link to="/" className="hover:text-teal-600">Home</Link>
            <span>•</span>
            <span>Secure Login</span>
            <span>•</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
