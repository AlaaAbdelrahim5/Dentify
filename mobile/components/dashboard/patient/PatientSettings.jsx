import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Input, Button } from '../../../components/dashboard';
import { useTheme } from '../../../contexts/ThemeContext';
import { authUtils } from '../../../utils/auth';
// import { usersAPI } from '../../../services/api';

const PatientSettings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    country: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    appointments: true,
    reminders: true,
    promotions: false,
    email: true,
    sms: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await authUtils.getCurrentUser();
      setUserData(user);
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dateOfBirth: user?.dateOfBirth || '',
        gender: user?.gender || '',
        address: user?.address || '',
        city: user?.city || '',
        country: user?.country || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleSave = async () => {
    try {
      // TODO: Uncomment when API is ready
      // await usersAPI.updateProfile(formData);
      console.log('Save profile:', formData);
      setIsEditing(false);
      loadUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authUtils.logout();
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightElement }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl mb-3`}
    >
      <View className="w-10 h-10 rounded-full bg-teal-100 items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#14B8A6" />
      </View>
      <View className="flex-1">
        <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </Text>
        {subtitle && (
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />}
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        <View className="p-4 space-y-4">
          {/* Header */}
          <View>
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your account and preferences
            </Text>
          </View>

          {/* Profile Section */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Profile Information
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                className="flex-row items-center"
              >
                <Ionicons name={isEditing ? 'close' : 'create'} size={20} color="#14B8A6" />
                <Text className="text-teal-600 ml-1 font-medium">
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <View className="space-y-3">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                  placeholder="Enter first name"
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                  placeholder="Enter last name"
                />
                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Enter email"
                  keyboardType="email-address"
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  placeholder="Enter city"
                />
                <Button onPress={handleSave}>Save Changes</Button>
              </View>
            ) : (
              <View className="space-y-3">
                <View>
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</Text>
                  <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userData?.firstName} {userData?.lastName}
                  </Text>
                </View>
                <View>
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</Text>
                  <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userData?.email}
                  </Text>
                </View>
                <View>
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</Text>
                  <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userData?.phone}
                  </Text>
                </View>
                {userData?.city && (
                  <View>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>City</Text>
                    <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userData.city}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>

          {/* Appearance */}
          <View>
            <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Appearance
            </Text>
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Toggle dark/light theme"
              rightElement={
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
                  thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
                />
              }
            />
          </View>

          {/* Notifications */}
          <View>
            <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </Text>
            <SettingItem
              icon="notifications"
              title="Appointment Reminders"
              subtitle="Get notified about upcoming appointments"
              rightElement={
                <Switch
                  value={notifications.appointments}
                  onValueChange={(value) => setNotifications({ ...notifications, appointments: value })}
                  trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
                  thumbColor={notifications.appointments ? '#fff' : '#f4f3f4'}
                />
              }
            />
            <SettingItem
              icon="mail"
              title="Email Notifications"
              subtitle="Receive updates via email"
              rightElement={
                <Switch
                  value={notifications.email}
                  onValueChange={(value) => setNotifications({ ...notifications, email: value })}
                  trackColor={{ false: '#D1D5DB', true: '#14B8A6' }}
                  thumbColor={notifications.email ? '#fff' : '#f4f3f4'}
                />
              }
            />
          </View>

          {/* Account */}
          <View>
            <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Account
            </Text>
            <SettingItem
              icon="key"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => console.log('Change password')}
            />
            <SettingItem
              icon="shield-checkmark"
              title="Privacy & Security"
              subtitle="Manage your privacy settings"
              onPress={() => console.log('Privacy settings')}
            />
            <SettingItem
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help or contact support"
              onPress={() => console.log('Help & support')}
            />
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 py-4 rounded-xl flex-row items-center justify-center"
          >
            <Ionicons name="log-out" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientSettings;
