import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { Logo, Button, Input, Card, LoadingSpinner, Alert } from '../components';
import { validateEmail } from '../utils/validation';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword({ email: email.toLowerCase().trim() });
      setEmailSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo className="justify-center" size="text-4xl" />
          <p className={`mt-4 text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {emailSent 
              ? 'Check your email for reset instructions'
              : 'Reset your password to continue'
            }
          </p>
        </div>

        {/* Password Reset Form */}
        <Card className="shadow-2xl backdrop-blur-sm bg-opacity-95">
          <Card.Header className={isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-teal-500 to-cyan-500'}>
            <div className="flex items-center justify-center mb-2">
              <FaLock className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-center text-white">
              Forgot Password?
            </h2>
            <p className="text-sm text-center mt-2 text-white text-opacity-90">
              {emailSent 
                ? 'Email sent successfully'
                : 'We\'ll send you reset instructions'
              }
            </p>
          </Card.Header>
          
          <Card.Content className="p-8">
            {/* Success Message */}
            {emailSent && (
              <Alert
                variant="success"
                title="Email Sent Successfully!"
                message={
                  <>
                    We've sent password reset instructions to <span className="font-semibold">{email}</span>
                  </>
                }
                className="mb-6"
              />
            )}

            {/* Error Message */}
            {error && (
              <Alert
                variant="error"
                title="Error"
                message={error}
                className="mb-6"
              />
            )}

            {emailSent ? (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                      isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'
                    } transition-transform duration-300`}
                  >
                    <FaCheck className="text-3xl text-green-500" />
                  </div>
                  
                  <p className={`text-base ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Check your inbox and follow the instructions to reset your password.
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  icon={FaEnvelope}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <FaEnvelope className="mr-2" />
                      Send Reset Link
                    </div>
                  )}
                </Button>

                {/* Info Box */}
                <div className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-blue-900/20 border-blue-800' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start">
                    <svg 
                      className={`w-5 h-5 mt-0.5 mr-3 shrink-0 ${
                        isDarkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-700'
                    }`}>
                      For security reasons, we'll send reset instructions only if an account exists with this email.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </Card.Content>

          {/* Login Link */}
          <Card.Footer className={`text-center ${
            isDarkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-gradient-to-r from-gray-50 to-gray-100'
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
