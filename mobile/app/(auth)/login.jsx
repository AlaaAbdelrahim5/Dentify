import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
      const dashboardRoute = await authUtils.getDashboardRoute();
      router.replace(dashboardRoute);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
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
        // Store user data and tokens using auth utils
        await authUtils.login(
          response.user, 
          {
            token: response.token,
            refreshToken: response.refreshToken
          }, 
          rememberMe
        );

        console.log('Login successful, navigating to dashboard...');

        // Navigate to appropriate dashboard based on user role
        const dashboardRoute = await authUtils.getDashboardRoute();
        router.replace(dashboardRoute);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);

      // Handle specific error messages from backend
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

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
        >
        {/* Decorative background */}
        <View className="absolute top-20 right-20 w-72 h-72 rounded-full bg-teal-300 opacity-20 blur-3xl" />
        <View className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-cyan-300 opacity-20 blur-3xl" />

        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo Section */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold text-teal-600">🦷 Dentify</Text>
            <Text className="mt-4 text-lg text-gray-600 text-center">
              Welcome back! Please sign in to continue.
            </Text>
          </View>

          {/* Login Card */}
          <View className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <View className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
              <Text className="text-3xl font-bold text-center text-white">
                Sign In
              </Text>
              <Text className="text-sm text-center mt-2 text-white opacity-90">
                Access your Dentify account
              </Text>
            </View>

            {/* Content */}
            <View className="p-8">
              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Text>
                <View className={`flex-row items-center rounded-lg border ${
                  errors.email 
                    ? 'border-red-300' 
                    : 'border-gray-300'
                } bg-white shadow-sm`}>
                  <View className="pl-3 pr-2">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 py-3 pr-3 text-gray-900"
                  />
                </View>
                {errors.email && (
                  <Text className="mt-2 text-sm text-red-600">{errors.email}</Text>
                )}
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className={`flex-row items-center rounded-lg border ${
                  errors.password 
                    ? 'border-red-300' 
                    : 'border-gray-300'
                } bg-white shadow-sm`}>
                  <View className="pl-3 pr-2">
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    className="flex-1 py-3 text-gray-900"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="px-3 py-3"
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="mt-2 text-sm text-red-600">{errors.password}</Text>
                )}
              </View>

              {/* Remember Me & Forgot Password */}
              <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity 
                  onPress={() => setRememberMe(!rememberMe)}
                  className="flex-row items-center"
                >
                  <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
                    rememberMe ? 'bg-teal-600 border-teal-600' : 'border-gray-300'
                  }`}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                  <Text className="text-sm text-gray-600">Remember me</Text>
                </TouchableOpacity>
                <Link href="/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm text-teal-600 font-medium">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`rounded-lg py-4 shadow-lg ${
                  isLoading 
                    ? 'bg-gray-400' 
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-lg font-semibold">
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="bg-gray-50 p-6 border-t border-gray-100">
              <View className="flex-row justify-center items-center">
                <Text className="text-sm text-gray-600">
                  Don't have an account?{' '}
                </Text>
                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm font-semibold text-teal-600">
                      Sign up here
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>

          {/* Additional Info */}
          <View className="mt-8 items-center">
            <View className="flex-row bg-white bg-opacity-80 px-6 py-3 rounded-full shadow-md">
              <Link href="/" asChild>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-xs text-gray-500">🏠 Home</Text>
                </TouchableOpacity>
              </Link>
              <Text className="text-xs text-gray-500 mx-3">•</Text>
              <Text className="text-xs text-gray-500">🔒 Secure Login</Text>
              <Text className="text-xs text-gray-500 mx-3">•</Text>
              <Text className="text-xs text-gray-500">💬 24/7 Support</Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
