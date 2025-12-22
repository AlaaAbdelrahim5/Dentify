import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authAPI } from '../../services/api';
import { authUtils } from '../../utils/auth';
import { validateEmail, validatePhone, validatePassword, validateAge, validateRequired } from '../../utils/validation';
import { PALESTINIAN_CITIES, GENDER_OPTIONS, COUNTRY_CODES } from '../../utils/constants';
import {
  Input,
  Button,
  PasswordInput,
  PhoneInput,
  Select,
  Checkbox,
  DatePicker,
  AuthCard,
  AuthHeader,
  AuthFooter,
  AuthBackground
} from '../../components';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

export default function SignUp() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+970',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bannerSlideAnim = useRef(new Animated.Value(-100)).current;
  const formSlideAnim = useRef(new Animated.Value(30)).current;
  const formScaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Start animations on mount
  useEffect(() => {
    Animated.stagger(100, [
      // Header fade and slide with scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Info banner slide from left with bounce
      Animated.spring(bannerSlideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      // Form card slide and scale with spring
      Animated.parallel([
        Animated.spring(formSlideAnim, {
          toValue: 0,
          tension: 45,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(formScaleAnim, {
          toValue: 1,
          tension: 45,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    authUtils.clearLogoutFlag();
  }, []);

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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.phoneNumber) newErrors.phone = 'Phone number is required';
    else if (formData.phoneNumber.length < 7)
      newErrors.phone = 'Phone number must be at least 7 digits';
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Please select your gender';
    if (!formData.city) newErrors.city = 'Please select your city';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!acceptedTerms)
      newErrors.terms = 'You must accept the terms and conditions';

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Shake animation for error
      Animated.sequence([
        Animated.timing(formSlideAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(formSlideAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
        Animated.timing(formSlideAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
        Animated.timing(formSlideAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.spring(buttonScaleAnim, {
        toValue: 0.95,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLoading(true);

    try {
      // Prepare data for API in the format expected by backend
      const signupData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: 'Patient',
        phone: `${formData.countryCode}${formData.phoneNumber}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        birthDate: new Date(formData.dateOfBirth).toISOString(),
        city: formData.city,
      };

      const response = await authAPI.register(signupData);

      // Backend returns { message, user, token, refreshToken }
      if (response && response.token) {
        // Use authUtils to properly store authentication data
        await authUtils.login(
          response.user,
          {
            token: response.token,
            refreshToken: response.refreshToken
          },
          false // Don't remember me by default on signup
        );

        Alert.alert(
          'Success!',
          'Account created successfully! Redirecting to dashboard...',
          [
            {
              text: 'OK',
              onPress: async () => {
                const dashboardRoute = await authUtils.getDashboardRoute();
                router.replace(dashboardRoute);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);

      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (error.message.includes('User already exists') || error.message.includes('email')) {
        setErrors({ email: 'An account with this email already exists' });
        errorMessage = 'An account with this email already exists';
      } else if (error.message.includes('phone')) {
        setErrors({ phone: 'An account with this phone number already exists' });
        errorMessage = 'An account with this phone number already exists';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Text */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
              paddingHorizontal: 24,
              marginBottom: 24
            }}
          >
            <Text className={`text-4xl font-bold text-center mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Join Dentify
            </Text>
            <Text className={`text-center text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Create your account to get started
            </Text>
          </Animated.View>

          {/* Info Banner */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateX: bannerSlideAnim }],
              paddingHorizontal: 24,
              marginBottom: 24,
              zIndex: 10,
            }}
          >
            <View 
              className={`p-5 rounded-2xl ${
                isDarkMode 
                  ? 'bg-teal-900/30' 
                  : 'bg-teal-50'
              }`} 
              style={{
                borderWidth: 2,
                borderColor: isDarkMode ? '#0f766e' : '#5eead4',
                shadowColor: isDarkMode ? '#14b8a6' : '#0d9488',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <View className="flex-row items-start">
                <View className={`p-2.5 rounded-full ${
                  isDarkMode ? 'bg-teal-700/50' : 'bg-teal-200'
                }`}>
                  <Ionicons 
                    name="information-circle" 
                    size={24} 
                    color={isDarkMode ? '#14b8a6' : '#0d9488'} 
                  />
                </View>
                <View className="flex-1 ml-3">
                  <Text className={`text-sm font-bold mb-1 ${
                    isDarkMode ? 'text-teal-300' : 'text-teal-900'
                  }`}>
                    Registration for <Text className="font-extrabold">Patients</Text> only
                  </Text>
                  <Text className={`text-xs leading-5 ${
                    isDarkMode ? 'text-teal-200' : 'text-teal-700'
                  }`}>
                    Healthcare providers should contact administration.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Sign Up Form */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [
                { translateY: formSlideAnim },
                { scale: formScaleAnim }
              ],
              paddingHorizontal: 20,
              zIndex: 1,
            }}
          >
            <View className={`mx-4 p-6 rounded-3xl shadow-xl ${
              isDarkMode ? 'bg-gray-800/90' : 'bg-white'
            }`}>
              <View className="flex-row space-x-2 mb-4">
                <View className="flex-1">
                  <Input
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    icon="person-outline"
                    error={errors.firstName}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    icon="person-outline"
                    error={errors.lastName}
                  />
                </View>
              </View>

              <Input
                label="Email Address"
                placeholder="your.email@example.com"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email}
              />

              <PhoneInput
                label="Phone Number"
                countryCode={formData.countryCode}
                phoneNumber={formData.phoneNumber}
                onCountryChange={(value) => handleInputChange('countryCode', value)}
                onPhoneChange={(value) => handleInputChange('phoneNumber', value.replace(/\D/g, ''))}
                error={errors.phone}
              />

              <DatePicker
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                value={formData.dateOfBirth}
                onChange={(value) => handleInputChange('dateOfBirth', value)}
                error={errors.dateOfBirth}
                maximumDate={new Date()}
              />

              <View className="flex-row space-x-2 mb-4">
                <View className="flex-1">
                  <Select
                    label="Gender"
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    options={GENDER_OPTIONS}
                    placeholder="Select"
                    error={errors.gender}
                  />
                </View>
                <View className="flex-1">
                  <Select
                    label="City"
                    value={formData.city}
                    onValueChange={(value) => handleInputChange('city', value)}
                    options={PALESTINIAN_CITIES.map(city => ({ label: city, value: city }))}
                    placeholder="Select"
                    error={errors.city}
                  />
                </View>
              </View>

              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={errors.password}
                showStrength={true}
              />

              <View className="mb-4">
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  error={errors.confirmPassword}
                  className="mb-0"
                />
                {formData.confirmPassword && formData.password && (
                  <View className="mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text className="ml-1 text-sm text-green-600 font-semibold">Passwords match</Text>
                      </View>
                    ) : (
                      <View className="flex-row items-center">
                        <Ionicons name="close-circle" size={16} color="#EF4444" />
                        <Text className="ml-1 text-sm text-red-600">Passwords do not match</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              <View className={`mb-6 p-5 rounded-2xl border ${
                isDarkMode 
                  ? 'bg-gray-700/30 border-gray-600' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <TouchableOpacity 
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  activeOpacity={0.7}
                  className="flex-row items-start"
                >
                  <View className={`w-6 h-6 rounded-lg border-2 items-center justify-center ${
                    acceptedTerms
                      ? 'bg-teal-600 border-teal-600'
                      : isDarkMode
                      ? 'border-gray-500 bg-gray-800/50'
                      : 'border-gray-300 bg-white'
                  }`} style={{
                    shadowColor: acceptedTerms ? '#14b8a6' : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: acceptedTerms ? 2 : 0,
                  }}>
                    {acceptedTerms && (
                      <Ionicons name="checkmark" size={18} color="white" style={{ fontWeight: 'bold' }} />
                    )}
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className={`text-sm leading-6 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      I accept the{' '}
                      <Text className={`font-bold underline ${
                        isDarkMode ? 'text-teal-400' : 'text-teal-600'
                      }`}>Terms and Conditions</Text>
                      {' '}and{' '}
                      <Text className={`font-bold underline ${
                        isDarkMode ? 'text-teal-400' : 'text-teal-600'
                      }`}>Privacy Policy</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.terms && (
                  <View className="flex-row items-center mt-3 ml-9">
                    <Ionicons name="warning" size={14} color="#DC2626" />
                    <Text className="text-red-600 text-xs ml-1 font-medium">{errors.terms}</Text>
                  </View>
                )}
              </View>

              <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
                <Button
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="person-add-outline" size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">Create Account</Text>
                  </View>
                </Button>
              </Animated.View>
            </View>

            {/* Login Link */}
            <View className={`mx-4 mt-6 mb-8 p-4 rounded-2xl ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
            }`}>
              <View className="flex-row items-center justify-center">
                <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text className={`font-bold ${
                    isDarkMode ? 'text-teal-400' : 'text-teal-600'
                  }`}>
                    Sign in here
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
