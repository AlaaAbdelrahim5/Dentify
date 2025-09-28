import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaUser, FaEnvelope, FaLock, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa'
import Logo from '../components/Logo'
import Button from '../components/Button'
import Input from '../components/Input'
import Card from '../components/Card'

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)

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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    
    if (!acceptedTerms) newErrors.terms = 'You must accept the terms and conditions'
    
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Handle signup logic here
    console.log('Signup attempt:', formData)
  }

  const passwordStrength = () => {
    const password = formData.password
    if (!password) return { strength: 0, text: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    const levels = [
      { text: 'Very Weak', color: 'bg-red-500' },
      { text: 'Weak', color: 'bg-orange-500' },
      { text: 'Fair', color: 'bg-yellow-500' },
      { text: 'Good', color: 'bg-blue-500' },
      { text: 'Strong', color: 'bg-green-500' }
    ]
    
    return { strength, ...levels[strength] }
  }

  const passwordInfo = passwordStrength()

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="justify-center" size="text-3xl" />
          <p className="mt-4 text-gray-600">Create your patient account to get started.</p>
        </div>

        {/* Signup Form */}
        <Card className="shadow-2xl">
          <Card.Header>
            <h2 className="text-2xl font-bold text-gray-900 text-center">Create Account</h2>
            <p className="text-sm text-gray-600 text-center mt-2">
              Join thousands of patients managing their dental care
            </p>
          </Card.Header>

          <Card.Content className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <Input
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                icon={FaUser}
              />

              {/* Email */}
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

              {/* Phone */}
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                icon={FaPhone}
              />

              {/* Date of Birth */}
              <Input
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                error={errors.dateOfBirth}
                icon={FaCalendarAlt}
              />

              {/* Address */}
              <Input
                label="Address"
                type="text"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleInputChange}
                error={errors.address}
                icon={FaMapMarkerAlt}
              />

              {/* Password */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  icon={FaLock}
                />
                <button
                  type="button"
                  className="absolute right-2 top-11 p-1.5 text-gray-400 hover:text-teal-600 transition-colors duration-200 focus:outline-none focus:text-teal-600 rounded hover:bg-gray-50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${passwordInfo.color}`}
                          style={{ width: `${(passwordInfo.strength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{passwordInfo.text}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={errors.confirmPassword}
                  icon={FaLock}
                />
                <button
                  type="button"
                  className="absolute right-2 top-11 p-1.5 text-gray-400 hover:text-teal-600 transition-colors duration-200 focus:outline-none focus:text-teal-600 rounded hover:bg-gray-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                </button>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && formData.password && (
                  <div className="mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm">
                        <FaCheck className="text-xs" />
                        <span>Passwords match</span>
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">
                        Passwords do not match
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 shadow-sm focus:border-teal-300 focus:ring focus:ring-teal-200 focus:ring-opacity-50 mt-1"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I accept the{' '}
                    <Link to="/terms" className="text-teal-600 hover:text-teal-500 font-medium">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-teal-600 hover:text-teal-500 font-medium">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-2 text-sm text-red-600">{errors.terms}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full">
                Create Account
              </Button>
            </form>
          </Card.Content>

          {/* Login Link */}
          <Card.Footer className="bg-gray-50 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Sign in here
              </Link>
            </p>
          </Card.Footer>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Why create an account?</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <FaCheck className="text-teal-500" />
                Book appointments with your preferred dentist
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-teal-500" />
                View your treatment history and X-ray results
              </li>
              <li className="flex items-center gap-2">
                <FaCheck className="text-teal-500" />
                Receive appointment reminders and notifications
              </li>
            </ul>
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <Link to="/" className="hover:text-teal-600">Home</Link>
            <span>•</span>
            <span>Patient Registration</span>
            <span>•</span>
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
