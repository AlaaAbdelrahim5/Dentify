import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
import { secretariesAPI } from '../../../services/api';
import { showErrorAlert, showSuccessAlert } from '../../../utils/errorUtils';
import { Input, Select, DatePicker } from '../../../components/common';
import { ProfileHeader, LoadingState, PasswordChangeSection } from '../shared';
import { CITY_OPTIONS, GENDER_OPTIONS } from '../../../utils/constants';

const SecretarySettings = ({ onProfileUpdate }) => {
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    city: '',
    profileImage: '',
    clinic: {
      name: '',
      city: '',
      address: ''
    }
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
      const response = await secretariesAPI.getMyProfile();
      const secretary = response.data?.secretary || response.data;
      
      if (!secretary) {
        throw new Error('Secretary profile not found');
      }

      setProfile({
        firstName: secretary.firstName || '',
        lastName: secretary.lastName || '',
        email: secretary.userId?.email || secretary.user?.email || '',
        phone: secretary.userId?.phone || secretary.user?.phone || '',
        birthDate: secretary.birthDate ? secretary.birthDate.split('T')[0] : '',
        gender: secretary.gender || '',
        city: secretary.city || '',
        profileImage: secretary.userId?.profileImage || secretary.user?.profileImage || '',
        clinic: {
          name: secretary.clinic?.clinicName || '',
          city: secretary.clinic?.city || '',
          address: secretary.clinic?.location || ''
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showErrorAlert(error, 'Failed to load profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleProfileUpdate = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        birthDate: profile.birthDate,
        gender: profile.gender,
        city: profile.city
      };
      
      await secretariesAPI.updateMyProfile(updateData);
      showSuccessAlert('Profile updated successfully');
      setIsEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      showErrorAlert(error, 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={UI_COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <ProfileHeader
          firstName={profile.firstName}
          lastName={profile.lastName}
          subtitle={`Secretary at ${profile.clinic.name || 'Clinic'}`}
          isDarkMode={isDarkMode}
          profileImage={profile.profileImage}
          onImageUpdate={(imageUrl) => {
            setProfile(prev => ({ ...prev, profileImage: imageUrl }));
            if (onProfileUpdate) onProfileUpdate();
          }}
          isEditing={isEditing}
        />

        {/* Personal Information */}
        <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
          <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Personal Information
          </Text>
          
          <Input
            label="First Name"
            value={profile.firstName}
            onChangeText={(text) => handleProfileUpdate('firstName', text)}
            editable={isEditing}
            icon="person-outline"
          />

          <Input
            label="Last Name"
            value={profile.lastName}
            onChangeText={(text) => handleProfileUpdate('lastName', text)}
            editable={isEditing}
            icon="person-outline"
          />

          <Input
            label="Email"
            value={profile.email}
            editable={false}
            icon="mail-outline"
            keyboardType="email-address"
          />

          <Input
            label="Phone"
            value={profile.phone}
            editable={false}
            icon="call-outline"
            keyboardType="phone-pad"
          />

          <DatePicker
            label="Birth Date"
            value={profile.birthDate}
            onChange={(date) => handleProfileUpdate('birthDate', date)}
            maximumDate={new Date()}
            disabled={!isEditing}
          />

          <Select
            label="Gender"
            value={profile.gender}
            onValueChange={(value) => handleProfileUpdate('gender', value)}
            options={GENDER_OPTIONS}
            enabled={isEditing}
          />

          <Select
            label="City"
            value={profile.city}
            onValueChange={(value) => handleProfileUpdate('city', value)}
            options={CITY_OPTIONS}
            enabled={isEditing}
          />
        </View>

        {/* Clinic Information */}
        <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
          <View className="flex-row items-center mb-4">
            <Ionicons name="business" size={20} color={UI_COLORS.primary} />
            <Text className={`text-lg font-bold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Clinic Information
            </Text>
          </View>

          <View className="mb-4">
            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Clinic Name
            </Text>
            <View className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Text className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.clinic.name || 'Not assigned'}
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Clinic Location
            </Text>
            <View className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Text className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.clinic.city || 'N/A'}
              </Text>
              {profile.clinic.address && (
                <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {profile.clinic.address}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Change Password Section */}
        <PasswordChangeSection
          isDarkMode={isDarkMode}
          apiChangePassword={secretariesAPI.changePassword}
        />

        {/* Action Buttons */}
        <View style={{ gap: 12, marginBottom: 20 }}>
          {!isEditing ? (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-teal-500 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-semibold text-base">Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="bg-teal-500 py-4 rounded-xl items-center"
                style={{ opacity: saving ? 0.6 : 1 }}
              >
                <Text className="text-white font-semibold text-base">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                className={`py-4 rounded-xl items-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
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

export default SecretarySettings;
