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
import { authAPI } from '../../services/api';
import { authUtils } from '../../utils/auth';
import { validateEmail } from '../../utils/validation';
import { 
  Input, 
  Button, 
  PasswordInput, 
  Checkbox,
  AuthCard,
  AuthHeader,
  AuthFooter,
  AuthInfoBar,
  AuthBackground
} from '../../components';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f0fdfa' }}>
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

              <View className="flex-row justify-between items-center mb-6">
                <Checkbox
                  checked={rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                  label="Remember me"
                />
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

            <AuthInfoBar />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
