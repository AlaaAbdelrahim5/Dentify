import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  AuthInfoBar,
  AuthBackground
} from '../../components';

export default function SignUp() {
  const router = useRouter();
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
      return;
    }

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

      console.log('Sending signup data:', { ...signupData, password: '***' });

      const response = await authAPI.register(signupData);

      console.log('Signup response:', response);

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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#f0fdfa' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthBackground />

          <View className="flex-1 px-6 py-8">
            <AuthHeader message="Create your patient account to get started" />

            <AuthCard
            title="Patient Registration"
            subtitle="Join our dental care community today"
            className="mb-6"
          >
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              icon="person-outline"
              error={errors.firstName}
            />

            <Input
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              icon="person-outline"
              error={errors.lastName}
            />

            <Input
              label="Email Address"
              placeholder="Enter your email"
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

            <Select
              label="Gender"
              value={formData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
              options={GENDER_OPTIONS}
              placeholder="Select your gender"
              error={errors.gender}
            />

            <Select
              label="City"
              value={formData.city}
              onValueChange={(value) => handleInputChange('city', value)}
              options={PALESTINIAN_CITIES.map(city => ({ label: city, value: city }))}
              placeholder="Select your city"
              error={errors.city}
            />

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
                placeholder="Confirm your password"
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
                      <Text className="ml-1 text-sm text-green-600">Passwords match</Text>
                    </View>
                  ) : (
                    <Text className="text-sm text-red-600">Passwords do not match</Text>
                  )}
                </View>
              )}
            </View>

            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                checked={acceptedTerms}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                error={errors.terms}
              />
              <TouchableOpacity 
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                className="ml-7 -mt-5"
              >
                <Text className="text-sm text-gray-600 leading-relaxed">
                  I accept the{' '}
                  <Text className="text-primary-600 font-medium">Terms and Conditions</Text>
                  {' '}and{' '}
                  <Text className="text-primary-600 font-medium">Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              onPress={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </AuthCard>

          <View className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <AuthFooter
              text="Already have an account?"
              linkText="Sign in here"
              linkHref="/(auth)/login"
            />
          </View>

          <View className="mb-8 items-center">
            <View className="flex-row bg-white bg-opacity-80 px-6 py-3 rounded-full shadow-md">
              <Text className="text-xs text-gray-500">🏠 Home</Text>
              <Text className="text-xs text-gray-500 mx-3">•</Text>
              <Text className="text-xs text-gray-500">🔒 Secure & Private</Text>
              <Text className="text-xs text-gray-500 mx-3">•</Text>
              <Text className="text-xs text-gray-500">⚡ Fast & Easy</Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
