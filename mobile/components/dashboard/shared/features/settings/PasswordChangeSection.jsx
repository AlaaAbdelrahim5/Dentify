import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../../../components/common';
import { UI_COLORS } from '../../../../../utils/colors';

const PasswordChangeSection = ({ isDarkMode, apiChangePassword, onSuccess }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      await apiChangePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      Alert.alert('Success', 'Password updated successfully');
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="lock-closed" size={20} color={UI_COLORS.primary} />
          <Text className={`text-lg font-bold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Change Password
          </Text>
        </View>
        {!isChangingPassword && (
          <TouchableOpacity onPress={() => setIsChangingPassword(true)}>
            <Ionicons name="create-outline" size={20} color={UI_COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {isChangingPassword ? (
        <>
          <Input
            label="Current Password"
            value={passwordData.currentPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <Input
            label="New Password"
            value={passwordData.newPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
            secureTextEntry
            icon="lock-open-outline"
          />

          <Input
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry
            icon="lock-open-outline"
          />

          <View style={{ gap: 12, marginTop: 12 }}>
            <TouchableOpacity
              onPress={handlePasswordChange}
              disabled={saving}
              className="bg-teal-500 py-3 rounded-xl items-center"
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              <Text className="text-white font-semibold">
                {saving ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              className={`py-3 rounded-xl items-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Click the edit icon to change your password
        </Text>
      )}
    </View>
  );
};

export default PasswordChangeSection;
