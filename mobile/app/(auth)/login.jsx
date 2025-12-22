import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { authUtils } from '../../utils/auth';
import { validateEmail } from '../../utils/validation';
import { 
  Input, 
  Button, 
  PasswordInput, 
  AuthCard,
  AuthHeader,
  AuthFooter,
  AuthBackground
} from '../../components';
import { useTheme } from '../../contexts/ThemeContext';

export default function Login() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');

  // Clear logout flag when component mounts
  useEffect(() => {
    authUtils.clearLogoutFlag();
  }, []);

  // Check if already authenticated
  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const wasLoggedOut = await authUtils.wasLoggedOut();
    if (wasLoggedOut) return;

    const isAuth = await authUtils.isAuthenticated();
    if (isAuth) {
      const user = await authUtils.getCurrentUser();
      
      // Check if user role is allowed on mobile
      if (!authUtils.isRoleAllowed(user?.role)) {
        // Logout user with disallowed role
        await authUtils.logout();
        return;
      }

      const dashboardRoute = await authUtils.getDashboardRoute();
      router.replace(dashboardRoute);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    const newErrors = {};
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await authAPI.login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      // Check if 2FA is required
      if (response && response.requiresTwoFactor) {
        setRequires2FA(true);
        setApiError('');
        return;
      }

      // Backend returns { message, user, token, refreshToken } directly
      if (response && response.token && response.user) {
        // Check if user role is allowed on mobile app (patient, dentist, secretary only)
        if (!authUtils.isRoleAllowed(response.user.role)) {
          Alert.alert(
            'Access Restricted',
            `This mobile app is only available for Patients, Dentists, and Secretaries. Your account type (${response.user.role}) cannot access the mobile app. Please use the web application instead.`,
            [{ text: 'OK' }]
          );
          return;
        }

        // Store user data and tokens using auth utils
        await authUtils.login(
          response.user, 
          {
            token: response.token,
            refreshToken: response.refreshToken
          }
        );

        // Navigate to appropriate dashboard based on user role
        const dashboardRoute = await authUtils.getDashboardRoute();
        router.replace(dashboardRoute);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Handle specific error messages from backend (without console.error to avoid error logs)
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('not active') || error.message.includes('deactivated')) {
        errorMessage = 'Your account has been deactivated. Please contact support for assistance.';
      } else if (error.message.includes('Email and password are required')) {
        errorMessage = 'Please enter both email and password.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setTwoFactorError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setTwoFactorError('');

    try {
      const response = await authAPI.verify2FA({
        email: formData.email.toLowerCase().trim(),
        token: twoFactorCode,
      });

      if (response && response.token && response.user) {
        // Check if user role is allowed on mobile app
        if (!authUtils.isRoleAllowed(response.user.role)) {
          Alert.alert(
            'Access Restricted',
            `This mobile app is only available for Patients, Dentists, and Secretaries. Your account type (${response.user.role}) cannot access the mobile app. Please use the web application instead.`,
            [{ text: 'OK' }]
          );
          return;
        }

        // Store user data and tokens
        await authUtils.login(
          response.user,
          {
            token: response.token,
            refreshToken: response.refreshToken
          }
        );

        // Navigate to dashboard
        const dashboardRoute = await authUtils.getDashboardRoute();
        router.replace(dashboardRoute);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      let errorMessage = 'Verification failed. Please try again.';
      
      if (error.message.includes('Invalid') || error.message.includes('incorrect')) {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setTwoFactorError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack2FA = () => {
    setRequires2FA(false);
    setTwoFactorCode('');
    setTwoFactorError('');
  };

  // Render 2FA verification screen
  if (requires2FA) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkMode ? '#1F2937' : '#f0fdfa' }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <AuthBackground />

            <View className="flex-1 justify-center px-6 py-12">
              <AuthHeader message="Enter the 6-digit code from your authenticator app." />

              <AuthCard
                title="Two-Factor Authentication"
                subtitle="Verify your identity"
              >
                {/* Error Message */}
                {twoFactorError && (
                  <View className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <View className="flex-row items-start">
                      <Ionicons name="warning" size={20} color="#DC2626" />
                      <View className="flex-1 ml-3">
                        <Text className="font-semibold text-red-800">Verification Failed</Text>
                        <Text className="text-sm text-red-600 mt-1">{twoFactorError}</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View className="mb-6">
                  <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Verification Code
                  </Text>
                  <Input
                    placeholder="Enter 6-digit code"
                    value={twoFactorCode}
                    onChangeText={(value) => {
                      setTwoFactorCode(value.replace(/[^0-9]/g, ''));
                      if (twoFactorError) setTwoFactorError('');
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    icon="shield-checkmark-outline"
                    className="text-center text-2xl tracking-widest"
                  />
                </View>

                <Button
                  onPress={handleVerify2FA}
                  isLoading={isLoading}
                  disabled={isLoading || twoFactorCode.length !== 6}
                  className="mb-3"
                >
                  Verify Code
                </Button>

                <TouchableOpacity
                  onPress={handleBack2FA}
                  disabled={isLoading}
                  className="py-3"
                >
                  <Text className="text-center text-primary-600 font-medium">
                    Back to Login
                  </Text>
                </TouchableOpacity>
              </AuthCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkMode ? '#1F2937' : '#f0fdfa' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <AuthBackground />

          <View className="flex-1 justify-center px-6 py-12">
            <AuthHeader message="Welcome back! Please sign in to continue." />

            <AuthCard
              title="Sign In"
              subtitle="Access your Dentify account"
            >
              {/* API Error Message */}
              {apiError && (
                <View className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <View className="flex-row items-start">
                    <Ionicons name="warning" size={20} color="#DC2626" />
                    <View className="flex-1 ml-3">
                      <Text className="font-semibold text-red-800">Login Failed</Text>
                      <Text className="text-sm text-red-600 mt-1">{apiError}</Text>
                    </View>
                  </View>
                </View>
              )}

              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email}
                className="mb-2"
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={errors.password}
                className="mb-2"
              />

              <View className="flex-row justify-end items-center mb-6">
                <Link href="/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm text-primary-600 font-medium">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              <Button
                onPress={handleSubmit}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </AuthCard>

            <View className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <AuthFooter
                text="Don't have an account?"
                linkText="Sign up here"
                linkHref="/(auth)/signup"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
