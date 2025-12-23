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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authAPI } from '../../services/api';
import { Input, Button } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!token) {
      Alert.alert(
        'Invalid Link',
        'The password reset link is invalid or missing.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    }

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
  }, [token]);

  const validatePassword = () => {
    if (!newPassword) {
      return 'Password is required';
    }
    if (newPassword.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (newPassword !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const getPasswordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 6) return { text: 'Weak', color: '#ef4444' };
    if (newPassword.length < 10) return { text: 'Medium', color: '#eab308' };
    return { text: 'Strong', color: '#10b981' };
  };

  const handleSubmit = async () => {
    const validationError = validatePassword();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authAPI.resetPassword({ token, newPassword });
      setResetSuccess(true);
      
      Alert.alert(
        'Success!',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password. The link may have expired.');
      Alert.alert('Error', error.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength();

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
              onPress={() => router.replace('/(auth)/login')}
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
              borderColor: resetSuccess ? '#10B981' : '#14B8A6',
              shadowColor: resetSuccess ? '#10B981' : '#14B8A6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}>
              <Ionicons 
                name={resetSuccess ? "checkmark-circle" : "key-outline"}
                size={56} 
                color={resetSuccess ? '#10B981' : (isDarkMode ? '#14b8a6' : '#0d9488')} 
              />
            </View>
            
            <Text className={`text-3xl font-bold text-center mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {resetSuccess ? 'Password Reset!' : 'Reset Password'}
            </Text>
            <Text className={`text-center text-base ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {resetSuccess 
                ? 'Your password has been updated'
                : 'Create your new password below'
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
            }`} style={{ 
              borderWidth: 1.5, 
              borderColor: resetSuccess ? '#10B981' : '#14B8A6', 
              shadowColor: resetSuccess ? '#10B981' : '#14B8A6', 
              shadowOffset: { width: 0, height: 8 }, 
              shadowOpacity: 0.2, 
              shadowRadius: 16, 
              elevation: 8 
            }}>
              {resetSuccess ? (
                <View className="items-center py-4">
                  <View className={`w-20 h-20 rounded-full items-center justify-center mb-5 ${
                    isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                  }`} style={{ borderWidth: 1.5, borderColor: '#10B981' }}>
                    <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                  </View>
                  <Text className={`text-center mb-2 text-lg font-semibold ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Password Reset Successfully!
                  </Text>
                  <Text className={`text-center mb-6 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    You can now log in with your new password. Redirecting...
                  </Text>
                  <Button
                    onPress={() => router.replace('/(auth)/login')}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="arrow-forward" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">Go to Login</Text>
                    </View>
                  </Button>
                </View>
              ) : (
                <>
                  {error && (
                    <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                      <View className="flex-row items-start">
                        <Ionicons name="alert-circle" size={20} color="#ef4444" />
                        <Text className="flex-1 ml-3 text-sm text-red-700">{error}</Text>
                      </View>
                    </View>
                  )}

                  <View className="mb-4">
                    <Input
                      label="New Password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChangeText={(value) => {
                        setNewPassword(value);
                        setError('');
                      }}
                      secureTextEntry={!showPassword}
                      icon="lock-closed-outline"
                      rightIcon={
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                          <Ionicons 
                            name={showPassword ? "eye-off-outline" : "eye-outline"} 
                            size={22} 
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                          />
                        </TouchableOpacity>
                      }
                    />
                    {/* Password Strength Indicator */}
                    {strength && (
                      <View className="mt-2">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text style={{ color: strength.color, fontSize: 12, fontWeight: '600' }}>
                            {strength.text}
                          </Text>
                        </View>
                        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <View 
                            style={{ 
                              height: '100%', 
                              backgroundColor: strength.color,
                              width: strength.text === 'Weak' ? '33%' : 
                                     strength.text === 'Medium' ? '66%' : '100%' 
                            }}
                          />
                        </View>
                      </View>
                    )}
                  </View>

                  <View className="mb-6">
                    <Input
                      label="Confirm Password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        setError('');
                      }}
                      secureTextEntry={!showConfirmPassword}
                      icon="lock-closed-outline"
                      rightIcon={
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                          <Ionicons 
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                            size={22} 
                            color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                          />
                        </TouchableOpacity>
                      }
                    />
                  </View>

                  <Button
                    onPress={handleSubmit}
                    isLoading={isLoading}
                    disabled={isLoading || !newPassword || !confirmPassword || !token}
                  >
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="key-outline" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">
                        Reset Password
                      </Text>
                    </View>
                  </Button>

                  {/* Password Requirements */}
                  <View className={`mt-6 p-4 rounded-2xl ${
                    isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <Text className={`text-sm font-semibold mb-2 ${
                      isDarkMode ? 'text-blue-200' : 'text-blue-700'
                    }`}>
                      Password Requirements:
                    </Text>
                    <View className="space-y-1">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={newPassword.length >= 6 ? '#10B981' : (isDarkMode ? '#60a5fa' : '#3b82f6')} 
                        />
                        <Text className={`ml-2 text-xs ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          At least 6 characters
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={(newPassword === confirmPassword && newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                          size={16} 
                          color={(newPassword === confirmPassword && newPassword) ? '#10B981' : (isDarkMode ? '#60a5fa' : '#3b82f6')} 
                        />
                        <Text className={`ml-2 text-xs ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          Passwords match
                        </Text>
                      </View>
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
