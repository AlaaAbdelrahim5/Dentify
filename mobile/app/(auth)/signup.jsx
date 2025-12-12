import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link, useRouter } from 'expo-router';
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    authUtils.clearLogoutFlag();
    
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
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

    const firstNameError = validateRequired(formData.firstName, 'First name');
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateRequired(formData.lastName, 'Last name');
    if (lastNameError) newErrors.lastName = lastNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const fullPhone = formData.countryCode + formData.phoneNumber;
    const phoneError = validatePhone(fullPhone);
    if (phoneError) newErrors.phoneNumber = phoneError;

    const dobError = validateAge(formData.dateOfBirth, 10);
    if (dobError) newErrors.dateOfBirth = dobError;

    const genderError = validateRequired(formData.gender, 'Gender');
    if (genderError) newErrors.gender = genderError;

    const cityError = validateRequired(formData.city, 'City');
    if (cityError) newErrors.city = cityError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.countryCode + formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        city: formData.city,
        password: formData.password,
      };

      const response = await authAPI.signup(signupData);

      if (response.user && response.token) {
        Alert.alert(
          'Success!',
          'Your account has been created successfully. You can now sign in.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login'),
            },
          ]
        );
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>🦷 Dentify</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Form Card */}
          <Animated.View 
            style={[
              styles.card,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.cardTitle}>Sign Up</Text>

            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Enter your first name"
                placeholderTextColor="#999"
                value={formData.firstName}
                onChangeText={(value) => handleInputChange('firstName', value)}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Enter your last name"
                placeholderTextColor="#999"
                value={formData.lastName}
                onChangeText={(value) => handleInputChange('lastName', value)}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.countryCodePicker}>
                  <Picker
                    selectedValue={formData.countryCode}
                    onValueChange={(value) => handleInputChange('countryCode', value)}
                    style={styles.picker}
                  >
                    {COUNTRY_CODES.map((code) => (
                      <Picker.Item key={code.value} label={code.value} value={code.value} />
                    ))}
                  </Picker>
                </View>
                <TextInput
                  style={[styles.phoneInput, errors.phoneNumber && styles.inputError]}
                  placeholder="5xxxxxxxx"
                  placeholderTextColor="#999"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth * (YYYY-MM-DD)</Text>
              <TextInput
                style={[styles.input, errors.dateOfBirth && styles.inputError]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                value={formData.dateOfBirth}
                onChangeText={(value) => handleInputChange('dateOfBirth', value)}
              />
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>

            {/* Gender */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender *</Text>
              <View style={[styles.pickerContainer, errors.gender && styles.inputError]}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select gender" value="" />
                  {GENDER_OPTIONS.map((option) => (
                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            </View>

            {/* City */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>City *</Text>
              <View style={[styles.pickerContainer, errors.city && styles.inputError]}>
                <Picker
                  selectedValue={formData.city}
                  onValueChange={(value) => handleInputChange('city', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select city" value="" />
                  {PALESTINIAN_CITIES.map((city) => (
                    <Picker.Item key={city} label={city} value={city} />
                  ))}
                </Picker>
              </View>
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Enter password"
                  placeholderTextColor="#999"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
                  placeholder="Confirm password"
                  placeholderTextColor="#999"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxChecked]}>
                  {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>I accept the terms and conditions</Text>
              </TouchableOpacity>
              {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign in here</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d9488',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 17,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.95,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 36,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 15,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  inputError: {
    borderColor: '#f43f5e',
    backgroundColor: '#fef2f2',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  countryCodePicker: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    width: 110,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  picker: {
    height: 54,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyeButton: {
    padding: 16,
  },
  eyeIcon: {
    fontSize: 22,
  },
  errorText: {
    color: '#f43f5e',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  termsContainer: {
    marginBottom: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#475569',
    flex: 1,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 15,
    color: '#64748b',
  },
  link: {
    fontSize: 15,
    color: '#14b8a6',
    fontWeight: '700',
  },
});
