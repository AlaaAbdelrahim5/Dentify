import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import Logo from '../../components/common/Logo';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;

  // Start animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(formSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkMode ? '#111827' : '#f0fdfa' }}>
        <LinearGradient
          colors={isDarkMode ? ['#111827', '#1F2937', '#111827'] : ['#f0fdfa', '#ccfbf1', '#f0fdfa']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingTop: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Animated Logo */}
            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{ scale: logoScale }],
                alignItems: 'center',
                marginBottom: 30
              }}
            >
              <Logo size="md" showSubtitle={false} />
            </Animated.View>

            <Animated.View 
              style={{ 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                paddingHorizontal: 20
              }}
            >
              <View className="items-center mb-6">
                <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
                  isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'
                }`}>
                  <Ionicons 
                    name="shield-checkmark" 
                    size={40} 
                    color={isDarkMode ? '#14b8a6' : '#0d9488'} 
                  />
                </View>
                <Text className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Two-Factor Authentication
                </Text>
                <Text className={`text-center px-6 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Enter the 6-digit code from your authenticator app
                </Text>
              </View>

              <View className={`mx-4 p-6 rounded-3xl shadow-xl ${
                isDarkMode ? 'bg-gray-800/90' : 'bg-white'
              }`}>
                {/* Error Message */}
                {twoFactorError && (
                  <Animated.View 
                    entering="fadeIn"
                    className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                  >
                    <View className="flex-row items-start">
                      <Ionicons name="warning" size={20} color="#DC2626" />
                      <View className="flex-1 ml-3">
                        <Text className="font-semibold text-red-800">Verification Failed</Text>
                        <Text className="text-sm text-red-600 mt-1">{twoFactorError}</Text>
                      </View>
                    </View>
                  </Animated.View>
                )}

                <View className="mb-6">
                  <Text className={`text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Verification Code
                  </Text>
                  <Input
                    placeholder="000000"
                    value={twoFactorCode}
                    onChangeText={(value) => {
                      setTwoFactorCode(value.replace(/[^0-9]/g, ''));
                      if (twoFactorError) setTwoFactorError('');
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    icon="shield-checkmark-outline"
                    className="text-center text-2xl tracking-widest font-bold"
                  />
                </View>

                <Button
                  onPress={handleVerify2FA}
                  isLoading={isLoading}
                  disabled={isLoading || twoFactorCode.length !== 6}
                  className="mb-3"
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Verify Code</Text>
                  </View>
                </Button>

                <TouchableOpacity
                  onPress={handleBack2FA}
                  disabled={isLoading}
                  className="py-3"
                >
                  <Text className={`text-center font-semibold ${
                    isDarkMode ? 'text-teal-400' : 'text-teal-600'
                  }`}>
                    ← Back to Login
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDarkMode ? '#111827' : '#f0fdfa' }}>
      <LinearGradient
        colors={isDarkMode ? ['#111827', '#1F2937', '#111827'] : ['#f0fdfa', '#ccfbf1', '#f0fdfa']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingTop: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Logo */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ scale: logoScale }],
              alignItems: 'center',
              marginBottom: 30
            }}
          >
            <Logo size="lg" showSubtitle={true} />
          </Animated.View>

          {/* Welcome Text */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              paddingHorizontal: 24,
              marginBottom: 20
            }}
          >
            <Text className={`text-3xl font-bold text-center mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome Back
            </Text>
            <Text className={`text-center ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sign in to manage your dental care
            </Text>
          </Animated.View>

          {/* Login Form */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: formSlideAnim }],
              paddingHorizontal: 20
            }}
          >
            <View className={`mx-4 p-6 rounded-3xl shadow-xl ${
              isDarkMode ? 'bg-gray-800/90' : 'bg-white'
            }`}>
              {/* API Error Message */}
              {apiError && (
                <View className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
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
                placeholder="your.email@example.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email}
                className="mb-4"
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
                    <Text className={`text-sm font-semibold ${
                      isDarkMode ? 'text-teal-400' : 'text-teal-600'
                    }`}>
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
                <View className="flex-row items-center justify-center">
                  <Text className="text-white font-bold text-base">Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
                </View>
              </Button>
            </View>

            {/* Sign Up Link */}
            <View className={`mx-4 mt-6 p-4 rounded-2xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
            }`}>
              <View className="flex-row items-center justify-center">
                <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Don't have an account?{' '}
                </Text>
                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity>
                    <Text className={`font-bold ${
                      isDarkMode ? 'text-teal-400' : 'text-teal-600'
                    }`}>
                      Sign up here
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
