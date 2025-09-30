import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '../components'
import { FaUserShield, FaCheck, FaExclamationTriangle } from 'react-icons/fa'

const AdminSetup = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [adminCreated, setAdminCreated] = useState(false)

  const createAdminUser = async () => {
    setIsLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/auth/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'System Administrator',
          email: 'admin@dentify.com',
          password: 'admin123456'
        })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Admin user created successfully!')
        setAdminCreated(true)
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Admin user created. You can now login with admin@dentify.com',
              email: 'admin@dentify.com'
            }
          })
        }, 2000)
      } else {
        setError(data.message || 'Failed to create admin user')
      }
    } catch (error) {
      console.error('Error creating admin:', error)
      setError('Network error. Please make sure the server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Setup</h1>
          <p className="text-gray-600">Create the system administrator account</p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <FaCheck className="w-4 h-4" />
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <FaExclamationTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Admin Credentials</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Email:</strong> admin@dentify.com</p>
              <p><strong>Password:</strong> admin123456</p>
              <p><strong>Role:</strong> System Administrator</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={createAdminUser}
            disabled={isLoading || adminCreated}
            className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
          >
            {isLoading ? 'Creating Admin...' : adminCreated ? 'Admin Created!' : 'Create Admin User'}
          </Button>

          <Button
            onClick={() => navigate('/login')}
            variant="outline"
            className="w-full"
          >
            Go to Login
          </Button>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-700">
            <strong>Note:</strong> This is a development setup page. Remove this route in production.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default AdminSetup