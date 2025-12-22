import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { authUtils } from '../../utils/auth';
import { UI_COLORS } from '../../utils/colors';

// API configuration - matches the mobile API setup
// Note: EXPO_PUBLIC_API_BASE_URL already includes /api
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.15:5000/api';

const TwoFactorAuth = () => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      setLoading(true);
      const token = await authUtils.getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/2fa/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setIsEnabled(data.twoFactorEnabled);
    } catch (err) {
      console.error('Error checking 2FA status:', err);
      setError('Failed to check 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      const token = await authUtils.getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to enable 2FA');
      }
      
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShowSetup(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      const token = await authUtils.getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/2fa/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationCode })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      setSuccess('Two-factor authentication enabled successfully!');
      setIsEnabled(true);
      setShowSetup(false);
      setQrCode('');
      setSecret('');
      setVerificationCode('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      setError('Password is required');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      
      const token = await authUtils.getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/2fa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          password: disablePassword,
          token: disableCode || undefined
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }
      
      setSuccess('Two-factor authentication disabled successfully');
      setIsEnabled(false);
      setShowDisableModal(false);
      setDisablePassword('');
      setDisableCode('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const cancelSetup = () => {
    setShowSetup(false);
    setQrCode('');
    setSecret('');
    setVerificationCode('');
    setError('');
  };

  const cancelDisable = () => {
    setShowDisableModal(false);
    setDisablePassword('');
    setDisableCode('');
    setError('');
  };

  if (loading) {
    return (
      <View className={`rounded-xl p-6 items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
        <ActivityIndicator size="large" color={UI_COLORS.primary} />
      </View>
    );
  }

  return (
    <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View className={`p-3 rounded-lg mr-3 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
          <Ionicons name="shield-checkmark" size={24} color={isDarkMode ? '#60A5FA' : '#2563EB'} />
        </View>
        <View className="flex-1">
          <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Two-Factor Authentication
          </Text>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Add extra security to your account
          </Text>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
          <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</Text>
        </View>
      )}

      {/* Success Message */}
      {success && (
        <View className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
          <Text className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{success}</Text>
        </View>
      )}

      {/* Main Status View */}
      {!showSetup && !showDisableModal && (
        <View className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                isEnabled 
                  ? isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
                  : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                <Ionicons 
                  name={isEnabled ? "checkmark" : "shield-outline"} 
                  size={20} 
                  color={isEnabled ? (isDarkMode ? '#4ADE80' : '#16A34A') : (isDarkMode ? '#9CA3AF' : '#6B7280')} 
                />
              </View>
              <View className="flex-1">
                <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  2FA is {isEnabled ? 'Enabled' : 'Disabled'}
                </Text>
                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isEnabled 
                    ? 'Protected with 2FA' 
                    : 'Enable for security'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={isEnabled ? () => setShowDisableModal(true) : handleEnable2FA}
              disabled={processing}
              className={`px-4 py-2 rounded-lg ${isEnabled ? 'bg-red-600' : 'bg-teal-600'}`}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">{isEnabled ? 'Disable' : 'Enable'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <ScrollView className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <Text className={`text-base font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Set Up Two-Factor Authentication
          </Text>
          
          <Text className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            1. Scan this QR code with your authenticator app
          </Text>
          
          {qrCode && (
            <View className="items-center mb-4 p-3 bg-white rounded-lg">
              <Image 
                source={{ uri: qrCode }} 
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            </View>
          )}

          <Text className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            2. Or manually enter this secret key:
          </Text>
          <View className={`p-3 rounded mb-4 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
            <Text className={`font-mono text-xs ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{secret}</Text>
          </View>

          <Text className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            3. Enter the 6-digit code:
          </Text>
          <TextInput
            value={verificationCode}
            onChangeText={(text) => setVerificationCode(text.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            className={`p-3 rounded-lg text-center text-2xl tracking-widest mb-4 ${
              isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
            }`}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleVerify2FA}
              disabled={processing || verificationCode.length !== 6}
              className={`flex-1 p-3 rounded-lg items-center ${
                processing || verificationCode.length !== 6 ? 'bg-gray-400' : 'bg-teal-600'
              }`}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">Verify</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelSetup}
              disabled={processing}
              className={`flex-1 p-3 rounded-lg items-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Disable Modal */}
      {showDisableModal && (
        <View className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <Text className="text-base font-semibold mb-4 text-red-500">
            Disable Two-Factor Authentication
          </Text>
          
          <Text className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Disabling 2FA will make your account less secure. Please confirm with your password.
          </Text>

          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Password *
          </Text>
          <TextInput
            value={disablePassword}
            onChangeText={setDisablePassword}
            placeholder="Enter your password"
            secureTextEntry
            className={`p-3 rounded-lg mb-4 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
          />

          <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            2FA Code (Optional)
          </Text>
          <TextInput
            value={disableCode}
            onChangeText={(text) => setDisableCode(text.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            keyboardType="number-pad"
            maxLength={6}
            className={`p-3 rounded-lg text-center text-xl tracking-widest mb-4 ${
              isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
            }`}
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleDisable2FA}
              disabled={processing || !disablePassword}
              className={`flex-1 p-3 rounded-lg items-center ${
                processing || !disablePassword ? 'bg-gray-400' : 'bg-red-600'
              }`}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold">Disable 2FA</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelDisable}
              disabled={processing}
              className={`flex-1 p-3 rounded-lg items-center ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}
            >
              <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default TwoFactorAuth;
