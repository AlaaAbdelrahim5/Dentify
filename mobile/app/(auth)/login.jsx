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
      console.log('Attempting login with email:', formData.email);
      
      const response = await authAPI.login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      console.log('Login response received:', { 
        hasUser: !!response.user, 
        hasToken: !!response.token,
        userRole: response.user?.role 
      });

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

        console.log('Login successful, navigating to dashboard...');

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
