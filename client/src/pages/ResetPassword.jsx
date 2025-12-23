import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { Logo, Button, Input, Card, LoadingSpinner } from '../components';
import { authAPI } from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid or missing reset token');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const validatePassword = () => {
    if (!newPassword) {
      return 'Password is required';
    }
    if (newPassword.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({ token, newPassword });
      setResetSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return { text: 'Weak', color: 'text-red-500', bg: 'bg-red-500' };
    if (newPassword.length < 10) return { text: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { text: 'Strong', color: 'text-green-500', bg: 'bg-green-500' };
  };

  const strength = passwordStrength();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-linear-to-br from-gray-900 via-gray-800 to-gray-900'
        : 'bg-linear-to-br from-teal-50 via-blue-50 to-cyan-50'
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

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="justify-center" size="text-4xl" />
          <p className={`mt-4 text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {resetSuccess 
              ? 'Password reset successful!'
              : 'Create your new password'
            }
          </p>
        </div>

        {/* Reset Password Form */}
        <Card className="shadow-2xl backdrop-blur-sm bg-opacity-95">
          <Card.Header className={isDarkMode ? 'bg-linear-to-r from-gray-800 to-gray-700' : 'bg-linear-to-r from-teal-500 to-cyan-500'}>
            <div className="flex items-center justify-center mb-2">
              <FaLock className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-center text-white">
              Reset Password
            </h2>
            <p className="text-sm text-center mt-2 text-white text-opacity-90">
              {resetSuccess 
                ? 'Your password has been updated'
                : 'Enter your new password below'
              }
            </p>
          </Card.Header>
          
          <Card.Content className="p-8">
            {/* Success Message */}
            {resetSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaCheck className="text-green-600 text-2xl" />
                  <div>
                    <h3 className="font-medium text-green-800">
                      Password Reset Successfully!
                    </h3>
                    <p className="text-sm text-green-600 mt-1">
                      You can now log in with your new password. Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaExclamationTriangle className="text-red-600" />
                  <div>
                    <h3 className="font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {resetSuccess ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                    } transition-transform duration-300`}
                  >
                    <FaCheck className="text-3xl text-green-500" />
                  </div>
                  
                  <p className={`text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Your password has been reset successfully. You will be redirected to the login page in a moment.
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="w-full bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    icon={FaLock}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  
                  {/* Password Strength Indicator */}
                  {strength && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`${strength.color} font-medium`}>
                          {strength.text}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${strength.bg} transition-all duration-300`}
                          style={{ 
                            width: strength.text === 'Weak' ? '33%' : 
                                   strength.text === 'Medium' ? '66%' : '100%' 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    icon={FaLock}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading || !newPassword || !confirmPassword || !token}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaLock className="mr-2" />
                      Reset Password
                    </div>
                  )}
                </Button>

                {/* Password Requirements */}
                <div className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-blue-900/20 border-blue-800' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <h4 className={`text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    Password Requirements:
                  </h4>
                  <ul className={`text-xs space-y-1 ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    <li className="flex items-center gap-2">
                      <span className={newPassword.length >= 6 ? 'text-green-500' : ''}>
                        {newPassword.length >= 6 ? '✓' : '○'}
                      </span>
                      At least 6 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={newPassword === confirmPassword && newPassword ? 'text-green-500' : ''}>
                        {newPassword === confirmPassword && newPassword ? '✓' : '○'}
                      </span>
                      Passwords match
                    </li>
                  </ul>
                </div>
              </form>
            )}
          </Card.Content>

          {/* Login Link */}
          <Card.Footer className={`text-center ${
            isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-linear-to-r from-gray-50 to-gray-100'
          }`}>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-semibold text-teal-600 hover:text-teal-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </Card.Footer>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className={`inline-flex items-center gap-6 text-xs px-6 py-3 rounded-full ${
            isDarkMode ? 'bg-gray-800 bg-opacity-50 text-gray-400' : 'bg-white bg-opacity-80 text-gray-500'
          } shadow-md`}>
            <Link to="/" className="hover:text-teal-600 transition-colors flex items-center gap-1">
              🏠 Home
            </Link>
            <span>•</span>
            <span className="flex items-center gap-1">🔒 Secure Reset</span>
            <span>•</span>
            <span className="flex items-center gap-1">💬 24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
