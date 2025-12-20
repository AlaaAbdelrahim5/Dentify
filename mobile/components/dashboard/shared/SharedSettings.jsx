import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
import { Input, Select, DatePicker } from '../../../components/common';
import { ProfileHeader } from './SettingsComponents';
import { LoadingState } from './OverviewComponents';
import PasswordChangeSection from './PasswordChangeSection';
import { CITY_OPTIONS, GENDER_OPTIONS } from '../../../utils/constants';

/**
 * Shared Settings Component - Base settings interface for all user roles
 * @param {Object} props Component props
 * @param {Object} props.profile - User profile data
 * @param {Function} props.handleProfileUpdate - Function to update profile fields
 * @param {Function} props.handleNestedUpdate - Function to update nested fields
 * @param {Function} props.handleSave - Function to save profile changes
 * @param {Function} props.onRefresh - Function to refresh profile data
 * @param {Function} props.onProfileUpdate - Callback after profile update
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.refreshing - Refreshing state
 * @param {boolean} props.saving - Saving state
 * @param {boolean} props.isEditing - Editing state
 * @param {Function} props.setIsEditing - Function to toggle editing mode
 * @param {string} props.role - User role ('dentist', 'secretary', 'patient')
 * @param {React.ReactNode} props.roleSpecificFields - Additional role-specific fields
 * @param {string} props.subtitle - Subtitle for profile header
 */
const SharedSettings = ({
  profile,
  handleProfileUpdate,
  handleNestedUpdate,
  handleSave,
  onRefresh,
  onProfileUpdate,
  loading,
  refreshing,
  saving,
  isEditing,
  setIsEditing,
  role,
  roleSpecificFields,
  subtitle
}) => {
  const { isDarkMode } = useTheme();

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
          subtitle={subtitle}
          isDarkMode={isDarkMode}
          profileImage={profile.profileImage}
          onImageUpdate={(imageUrl) => {
            handleProfileUpdate('profileImage', imageUrl);
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
            onChangeText={(value) => handleProfileUpdate('firstName', value)}
            disabled={!isEditing}
          />

          <Input
            label="Last Name"
            value={profile.lastName}
            onChangeText={(value) => handleProfileUpdate('lastName', value)}
            disabled={!isEditing}
          />

          <Input
            label="Email"
            value={profile.email}
            disabled={true}
            editable={false}
            helperText="Email cannot be changed"
          />

          <Input
            label="Phone"
            value={profile.phone}
            disabled={true}
            editable={false}
            helperText="Phone cannot be changed"
          />

          <DatePicker
            label="Birth Date"
            value={profile.birthDate}
            onChange={(value) => handleProfileUpdate('birthDate', value)}
            disabled={!isEditing}
          />

          <Select
            label="Gender"
            value={profile.gender}
            onValueChange={(value) => handleProfileUpdate('gender', value)}
            options={GENDER_OPTIONS}
            disabled={!isEditing}
          />

          <Select
            label="City"
            value={profile.city}
            onValueChange={(value) => handleProfileUpdate('city', value)}
            options={CITY_OPTIONS}
            disabled={!isEditing}
          />
        </View>

        {/* Role-Specific Fields */}
        {roleSpecificFields}

        {/* Edit/Save Buttons */}
        <View className="flex-row gap-3 mb-4">
          {!isEditing ? (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="flex-1 rounded-xl p-4 items-center"
              style={{ backgroundColor: UI_COLORS.primary }}
            >
              <Text className="text-white font-semibold text-base">Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                className="flex-1 rounded-xl p-4 items-center"
                style={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }}
                disabled={saving}
              >
                <Text className={`font-semibold text-base ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 rounded-xl p-4 items-center"
                style={{ backgroundColor: UI_COLORS.primary }}
                disabled={saving}
              >
                <Text className="text-white font-semibold text-base">
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Password Change Section */}
        <PasswordChangeSection isDarkMode={isDarkMode} />
      </ScrollView>
    </View>
  );
};

export default SharedSettings;
