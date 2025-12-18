import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
import { patientsAPI } from '../../../services/api';
import { showErrorAlert, showSuccessAlert } from '../../../utils/errorUtils';
import { Input, Select, DatePicker } from '../../../components/common';
import { ProfileHeader, LoadingState, PasswordChangeSection } from '../shared';
import { CITY_OPTIONS, GENDER_OPTIONS } from '../../../utils/constants';

const PatientSettings = ({ onProfileUpdate }) => {
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    birthDate: '',
    gender: '',
    profileImage: ''
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
      const response = await patientsAPI.getMyProfile();
      const patient = response.data?.patient || response.data;
      
      if (!patient) {
        throw new Error('Patient profile not found');
      }

      setProfile({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.user?.email || '',
        phone: patient.user?.phone || '',
        city: patient.city || '',
        birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : '',
        gender: patient.gender || '',
        profileImage: patient.user?.profileImage || ''
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
        gender: profile.gender,
        birthDate: profile.birthDate,
        city: profile.city
      };
      
      await patientsAPI.updateMyProfile(updateData);
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

  const calculateAge = () => {
    if (!profile.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(profile.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

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

          {profile.birthDate && (
            <View className="mb-4">
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Age: {calculateAge()} years old
              </Text>
            </View>
          )}

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

        {/* Change Password Section */}
        <PasswordChangeSection
          isDarkMode={isDarkMode}
          apiChangePassword={patientsAPI.changePassword}
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

export default PatientSettings;
