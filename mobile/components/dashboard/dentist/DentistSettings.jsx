import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';

const DentistSettings = () => {
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    specialization: [],
    city: ''
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/dentists/profile');
      const dentist = response.data.dentist;
      setProfile({
        firstName: dentist.firstName || '',
        lastName: dentist.lastName || '',
        email: dentist.user?.email || '',
        phone: dentist.user?.phone || '',
        licenseNumber: dentist.licenseNumber || '',
        specialization: dentist.specialization || [],
        city: dentist.city || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load profile';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/dentists/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        licenseNumber: profile.licenseNumber,
        specialization: profile.specialization,
        city: profile.city
      });
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const InfoRow = ({ icon, label, value, editable = false, onChangeText }) => (
    <View className={`mb-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={18} color="#14b8a6" />
        <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {label}
        </Text>
      </View>
      {isEditing && editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} rounded-lg p-2`}
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
        />
      ) : (
        <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {value || 'N/A'}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-teal-500 items-center justify-center">
            <Text className="text-white font-bold text-3xl">
              {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
            </Text>
          </View>
          <Text className={`mt-3 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dr. {profile.firstName} {profile.lastName}
          </Text>
        </View>

        <InfoRow
          icon="person-outline"
          label="First Name"
          value={profile.firstName}
          editable
          onChangeText={(text) => setProfile({ ...profile, firstName: text })}
        />

        <InfoRow
          icon="person-outline"
          label="Last Name"
          value={profile.lastName}
          editable
          onChangeText={(text) => setProfile({ ...profile, lastName: text })}
        />

        <InfoRow
          icon="mail-outline"
          label="Email"
          value={profile.email}
        />

        <InfoRow
          icon="call-outline"
          label="Phone"
          value={profile.phone}
        />

        <InfoRow
          icon="document-text-outline"
          label="License Number"
          value={profile.licenseNumber}
          editable
          onChangeText={(text) => setProfile({ ...profile, licenseNumber: text })}
        />

        <InfoRow
          icon="location-outline"
          label="City"
          value={profile.city}
          editable
          onChangeText={(text) => setProfile({ ...profile, city: text })}
        />

        <View className="flex-row" style={{ gap: 8 }}>
          {!isEditing ? (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="flex-1 bg-teal-500 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="flex-1 bg-teal-500 py-4 rounded-xl items-center"
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                <Text className="text-white font-semibold text-base">
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                className={`flex-1 py-4 rounded-xl items-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                <Text className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DentistSettings;
