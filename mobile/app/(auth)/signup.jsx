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
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { authUtils } from '../../utils/auth';
import { validateEmail, validatePhone, validatePassword, validateAge, validateRequired } from '../../utils/validation';
import { PALESTINIAN_CITIES, GENDER_OPTIONS, COUNTRY_CODES } from '../../utils/constants';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const passwordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '', color: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const levels = [
      { text: 'Very Weak', color: 'bg-red-500' },
      { text: 'Weak', color: 'bg-orange-500' },
      { text: 'Fair', color: 'bg-yellow-500' },
      { text: 'Good', color: 'bg-blue-500' },
      { text: 'Strong', color: 'bg-green-500' },
    ];

    return { strength, ...levels[strength] };
  };

  const passwordInfo = passwordStrength();

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
        {/* Decorative background */}
        <View className="absolute top-20 right-20 w-72 h-72 rounded-full bg-teal-300 opacity-20 blur-3xl" />
        <View className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-cyan-300 opacity-20 blur-3xl" />

        <View className="flex-1 px-6 py-8">
          {/* Logo Section */}
          <View className="items-center mb-6">
            <Text className="text-4xl font-bold text-teal-600">🦷 Dentify</Text>
            <Text className="mt-3 text-lg text-gray-600 text-center">
              Create your patient account to get started
            </Text>
          </View>

          {/* Signup Card */}
          <View className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
            {/* Header */}
            <View className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6">
              <Text className="text-3xl font-bold text-center text-white">
                Patient Registration
              </Text>
              <Text className="text-sm text-center mt-2 text-white opacity-90">
                Join our dental care community today
              </Text>
            </View>

            {/* Content */}
            <View className="p-6">
              {/* First Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  First Name
                </Text>
                <View className={`flex-row items-center rounded-lg border ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                } bg-white shadow-sm`}>
                  <View className="pl-3 pr-2">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Enter your first name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    className="flex-1 py-3 pr-3 text-gray-900"
                  />
                </View>
                {errors.firstName && (
                  <Text className="mt-1 text-sm text-red-600">{errors.firstName}</Text>
                )}
              </View>

              {/* Last Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </Text>
                <View className={`flex-row items-center rounded-lg border ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                } bg-white shadow-sm`}>
                  <View className="pl-3 pr-2">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Enter your last name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    className="flex-1 py-3 pr-3 text-gray-900"
                  />
                </View>
                {errors.lastName && (
                  <Text className="mt-1 text-sm text-red-600">{errors.lastName}</Text>
                )}
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Text>
                <View className={`flex-row items-center rounded-lg border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
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
                  <Text className="mt-1 text-sm text-red-600">{errors.email}</Text>
                )}
              </View>

              {/* Phone Number */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </Text>
                <View className="flex-row space-x-2">
                  <View className="w-32 rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
                    <Picker
                      selectedValue={formData.countryCode}
                      onValueChange={(value) => handleInputChange('countryCode', value)}
                      style={{ height: 50 }}
                    >
                      {COUNTRY_CODES.map((code) => (
                        <Picker.Item key={code.value} label={code.value} value={code.value} />
                      ))}
                    </Picker>
                  </View>
                  <View className={`flex-1 flex-row items-center rounded-lg border ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } bg-white shadow-sm`}>
                    <View className="pl-3 pr-2">
                      <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                    </View>
                    <TextInput
                      placeholder="Phone number"
                      placeholderTextColor="#9CA3AF"
                      value={formData.phoneNumber}
                      onChangeText={(value) => handleInputChange('phoneNumber', value.replace(/\D/g, ''))}
                      keyboardType="phone-pad"
                      className="flex-1 py-3 pr-3 text-gray-900"
                    />
                  </View>
                </View>
                {errors.phone && (
                  <Text className="mt-1 text-sm text-red-600">{errors.phone}</Text>
                )}
              </View>

              {/* Date of Birth */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Date of Birth
                </Text>
                <View className={`flex-row items-center rounded-lg border ${
                  errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                } bg-white shadow-sm`}>
                  <View className="pl-3 pr-2">
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                    value={formData.dateOfBirth}
                    onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                    className="flex-1 py-3 pr-3 text-gray-900"
                  />
                </View>
                {errors.dateOfBirth && (
                  <Text className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</Text>
                )}
              </View>

              {/* Gender */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Gender
                </Text>
                <View className={`rounded-lg border ${
                  errors.gender ? 'border-red-300' : 'border-gray-300'
                } bg-white shadow-sm overflow-hidden`}>
                  <Picker
                    selectedValue={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Select your gender" value="" />
                    {GENDER_OPTIONS.map((option) => (
                      <Picker.Item key={option.value} label={option.label} value={option.value} />
                    ))}
                  </Picker>
                </View>
                {errors.gender && (
                  <Text className="mt-1 text-sm text-red-600">{errors.gender}</Text>
                )}
              </View>

              {/* City */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  City
                </Text>
                <View className={`rounded-lg border ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                } bg-white shadow-sm overflow-hidden`}>
                  <Picker
                    selectedValue={formData.city}
                    onValueChange={(value) => handleInputChange('city', value)}
                    style={{ height: 50 }}
                  >
                    <Picker.Item label="Select your city" value="" />
                    {PALESTINIAN_CITIES.map((city) => (
                      <Picker.Item key={city} label={city} value={city} />
                    ))}
                  </Picker>
                </View>
                {errors.city && (
                  <Text className="mt-1 text-sm text-red-600">{errors.city}</Text>
                )}
              </View>

              {/* Password */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password
                </Text>
                <View className={`flex-row items-center rounded-lg border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } bg-white shadow-sm`}>
                  <View className="pl-3 pr-2">
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Create a strong password"
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
                {formData.password && (
                  <View className="mt-2">
                    <View className="flex-row items-center">
                      <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <View 
                          className={`h-2 ${passwordInfo.color}`}
                          style={{ width: `${(passwordInfo.strength / 5) * 100}%` }}
                        />
                      </View>
                      <Text className="ml-2 text-xs text-gray-600">
                        {passwordInfo.text}
                      </Text>
                    </View>
                  </View>
                )}
                {errors.password && (
                  <Text className="mt-1 text-sm text-red-600">{errors.password}</Text>
                )}
              </View>

              {/* Confirm Password */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </Text>
                <View className={`flex-row items-center rounded-lg border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } bg-white shadow-sm`}>
                  <View className="pl-3 pr-2">
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor="#9CA3AF"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                    className="flex-1 py-3 text-gray-900"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="px-3 py-3"
                  >
                    <Ionicons 
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
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
                {errors.confirmPassword && (
                  <Text className="mt-1 text-sm text-red-600">{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Terms and Conditions */}
              <View className="mb-6 p-4 bg-gray-50 rounded-lg">
                <TouchableOpacity 
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  className="flex-row items-start"
                >
                  <View className={`w-5 h-5 rounded border-2 mr-3 mt-1 items-center justify-center ${
                    acceptedTerms ? 'bg-teal-600 border-teal-600' : 'border-gray-300'
                  }`}>
                    {acceptedTerms && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                  <Text className="flex-1 text-sm text-gray-600 leading-relaxed">
                    I accept the{' '}
                    <Text className="text-teal-600 font-medium">Terms and Conditions</Text>
                    {' '}and{' '}
                    <Text className="text-teal-600 font-medium">Privacy Policy</Text>
                  </Text>
                </TouchableOpacity>
                {errors.terms && (
                  <Text className="mt-2 text-sm text-red-600">{errors.terms}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`rounded-lg py-4 shadow-lg ${
                  isLoading 
                    ? 'bg-gray-400' 
                    : 'bg-gradient-to-r from-teal-500 to-blue-500'
                }`}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center text-lg font-semibold">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="bg-gray-50 p-6 border-t border-gray-100">
              <View className="flex-row justify-center items-center">
                <Text className="text-sm text-gray-600">
                  Already have an account?{' '}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-sm font-semibold text-teal-600">
                      Sign in here
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>

          {/* Additional Info */}
          <View className="mb-8 items-center">
            <View className="flex-row bg-white bg-opacity-80 px-6 py-3 rounded-full shadow-md">
              <Link href="/" asChild>
                <TouchableOpacity className="flex-row items-center">
                  <Text className="text-xs text-gray-500">🏠 Home</Text>
                </TouchableOpacity>
              </Link>
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
