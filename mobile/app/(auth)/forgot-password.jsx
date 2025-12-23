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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authAPI } from '../../services/api';
import { validateEmail } from '../../utils/validation';
import { Input, Button } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';

export default function ForgotPassword() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
    ]).start();
  }, []);

  const handleSubmit = async () => {
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
      Alert.alert(
        'Email Sent!',
        'If an account exists with this email, you will receive password reset instructions.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset email. Please try again.');
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
          {/* Back Button */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              paddingHorizontal: 24,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center"
            >
              <Ionicons 
                name="arrow-back" 
                size={24} 
                color={isDarkMode ? '#14b8a6' : '#0d9488'} 
              />
              <Text className={`ml-2 text-base font-semibold ${
                isDarkMode ? 'text-teal-400' : 'text-teal-600'
              }`}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Header */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
              paddingHorizontal: 24,
              marginBottom: 32,
              alignItems: 'center'
            }}
          >
            <View className={`w-28 h-28 rounded-full items-center justify-center mb-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`} style={{
              borderWidth: 1.5,
              borderColor: '#14B8A6',
              shadowColor: '#14B8A6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}>
              <Ionicons 
                name="lock-closed-outline" 
                size={56} 
                color={isDarkMode ? '#14b8a6' : '#0d9488'} 
              />
            </View>
            
            <Text className={`text-3xl font-bold text-center mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Forgot Password?
            </Text>
            <Text className={`text-center text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {emailSent 
                ? 'Check your email for reset instructions'
                : 'Enter your email and we\'ll send you reset instructions'
              }
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              paddingHorizontal: 20,
            }}
          >
            <View className={`mx-4 p-7 rounded-3xl shadow-xl ${
              isDarkMode ? 'bg-gray-800/90' : 'bg-white'
            }`} style={{ borderWidth: 1.5, borderColor: '#14B8A6', shadowColor: '#14B8A6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 }}>
              {emailSent ? (
                <View className="items-center py-4">
                  <View className={`w-20 h-20 rounded-full items-center justify-center mb-5 ${
                    isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'
                  }`} style={{ borderWidth: 1.5, borderColor: '#10B981' }}>
                    <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                  </View>
                  <Text className={`text-center mb-6 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    We've sent password reset instructions to {email}
                  </Text>
                  <Button
                    onPress={() => router.push('/(auth)/login')}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="arrow-back" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">Back to Login</Text>
                    </View>
                  </Button>
                </View>
              ) : (
                <>
                  <Input
                    label="Email Address"
                    placeholder="your.email@example.com"
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      setError('');
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    icon="mail-outline"
                    error={error}
                    className="mb-4"
                  />

                  <Button
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    disabled={isLoading || !email}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="send-outline" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">
                        Send Reset Link
                      </Text>
                    </View>
                  </Button>

                  {/* Info Box */}
                  <View className={`mt-6 p-4 rounded-2xl ${
                    isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <View className="flex-row items-start">
                      <Ionicons 
                        name="information-circle" 
                        size={20} 
                        color={isDarkMode ? '#60a5fa' : '#3b82f6'} 
                      />
                      <Text className={`flex-1 ml-3 text-sm ${
                        isDarkMode ? 'text-blue-200' : 'text-blue-700'
                      }`}>
                        For security reasons, we'll send reset instructions only if an account exists with this email.
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
