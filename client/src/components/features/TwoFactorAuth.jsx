import { useState, useEffect } from 'react'
import { FaShieldAlt, FaQrcode, FaKey, FaCheck, FaTimes } from 'react-icons/fa'
import { Card, Button, Input, LoadingSpinner } from '../common'
import { authUtils } from '../../utils/auth'
import { useTheme } from '../../contexts/ThemeContext'
import QRCode from 'react-qr-code'

const TwoFactorAuth = () => {
  const { isDarkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [isEnabled, setIsEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    check2FAStatus()
  }, [])

  const check2FAStatus = async () => {
    try {
      setLoading(true)
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/2fa/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      setIsEnabled(data.twoFactorEnabled)
    } catch (err) {
      console.error('Error checking 2FA status:', err)
      setError('Failed to check 2FA status')
    } finally {
      setLoading(false)
    }
  }

  const handleEnable2FA = async () => {
    try {
      setProcessing(true)
      setError('')
      setSuccess('')
      
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable 2FA')
      }
      
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setShowSetup(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    try {
      setProcessing(true)
      setError('')
      
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/2fa/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }
      
      setSuccess('Two-factor authentication enabled successfully!')
      setIsEnabled(true)
      setShowSetup(false)
      setQrCode('')
      setSecret('')
      setVerificationCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      setError('Password is required')
      return
    }

    try {
      setProcessing(true)
      setError('')
      
      const token = authUtils.getAccessToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          password: disablePassword,
          token: disableCode || undefined
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA')
      }
      
      setSuccess('Two-factor authentication disabled successfully')
      setIsEnabled(false)
      setShowDisableModal(false)
      setDisablePassword('')
      setDisableCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const cancelSetup = () => {
    setShowSetup(false)
    setQrCode('')
    setSecret('')
    setVerificationCode('')
    setError('')
  }

  const cancelDisable = () => {
    setShowDisableModal(false)
    setDisablePassword('')
    setDisableCode('')
    setError('')
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
          <FaShieldAlt className={`text-2xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
        <div>
          <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Two-Factor Authentication</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Add an extra layer of security to your account
          </p>
        </div>
      </div>

      {error && (
        <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
          <div className="flex items-center gap-2">
            <FaTimes />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
          <div className="flex items-center gap-2">
            <FaCheck />
            <span>{success}</span>
          </div>
        </div>
      )}

      {!showSetup && !showDisableModal && (
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isEnabled 
                  ? isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                  : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                {isEnabled ? (
                  <FaCheck className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                ) : (
                  <FaShieldAlt className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                )}
              </div>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  2FA is {isEnabled ? 'Enabled' : 'Disabled'}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isEnabled 
                    ? 'Your account is protected with two-factor authentication' 
                    : 'Enable 2FA to add extra security to your account'}
                </p>
              </div>
            </div>
            <Button
              variant={isEnabled ? 'danger' : 'primary'}
              onClick={isEnabled ? () => setShowDisableModal(true) : handleEnable2FA}
              disabled={processing}
            >
              {processing ? <LoadingSpinner size="sm" /> : isEnabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        </div>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            <FaQrcode /> Set Up Two-Factor Authentication
          </h4>
          
          <div className="space-y-4">
            <div>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                {qrCode && <img src={qrCode} alt="QR Code" className="w-64 h-64" />}
              </div>
            </div>

            <div>
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                2. Or manually enter this secret key:
              </p>
              <div className={`p-3 rounded font-mono text-sm break-all ${isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                {secret}
              </div>
            </div>

            <div>
              <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                3. Enter the 6-digit code from your authenticator app:
              </p>
              <Input
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setVerificationCode(value)
                }}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleVerify2FA}
                disabled={processing || verificationCode.length !== 6}
                className="flex-1"
              >
                {processing ? <LoadingSpinner size="sm" /> : 'Verify and Enable'}
              </Button>
              <Button
                variant="secondary"
                onClick={cancelSetup}
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Disable Modal */}
      {showDisableModal && (
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-500">
            <FaShieldAlt /> Disable Two-Factor Authentication
          </h4>
          
          <div className="space-y-4">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Disabling 2FA will make your account less secure. Please confirm by entering your password.
            </p>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password *</label>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                2FA Code (Optional)
              </label>
              <Input
                type="text"
                value={disableCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setDisableCode(value)
                }}
                placeholder="000000"
                maxLength={6}
                className="text-center text-xl tracking-widest font-mono"
              />
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Enter the code from your authenticator app if available
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="danger"
                onClick={handleDisable2FA}
                disabled={processing || !disablePassword}
                className="flex-1"
              >
                {processing ? <LoadingSpinner size="sm" /> : 'Disable 2FA'}
              </Button>
              <Button
                variant="secondary"
                onClick={cancelDisable}
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default TwoFactorAuth
