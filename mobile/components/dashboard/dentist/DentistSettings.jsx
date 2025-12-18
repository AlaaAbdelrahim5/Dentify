import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
import { dentistsAPI } from '../../../services/api';
import { showErrorAlert, showSuccessAlert } from '../../../utils/errorUtils';
import { Input, Select, DatePicker } from '../../../components/common';
import { ProfileHeader, LoadingState, PasswordChangeSection } from '../shared';
import { CITY_OPTIONS, GENDER_OPTIONS, SPECIALIZATION_OPTIONS } from '../../../utils/constants';

const DentistSettings = ({ onProfileUpdate }) => {
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    specialization: [],
    birthDate: '',
    gender: '',
    city: '',
    profileImage: '',
    clinic: {
      name: '',
      address: ''
    },
    socialLinks: {
      facebook: '',
      instagram: '',
      whatsapp: '',
      tiktok: ''
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
      const response = await dentistsAPI.getMyProfile();
      const dentist = response.data?.dentist || response.data;
      
      if (!dentist) {
        throw new Error('Dentist profile not found');
      }

      setProfile({
        firstName: dentist.firstName || '',
        lastName: dentist.lastName || '',
        email: dentist.user?.email || '',
        phone: dentist.user?.phone || '',
        licenseNumber: dentist.licenseNumber || '',
        specialization: Array.isArray(dentist.specialization) ? dentist.specialization : [],
        birthDate: dentist.birthDate ? dentist.birthDate.split('T')[0] : '',
        gender: dentist.gender || '',
        city: dentist.city || '',
        profileImage: dentist.user?.profileImage || '',
        clinic: {
          name: dentist.clinic?.clinicName || '',
          address: dentist.clinic?.location || ''
        },
        socialLinks: typeof dentist.socialLinks === 'object' && dentist.socialLinks !== null ? {
          facebook: dentist.socialLinks.facebook || '',
          instagram: dentist.socialLinks.instagram || '',
          whatsapp: dentist.socialLinks.whatsapp || dentist.user?.phone || '',
          tiktok: dentist.socialLinks.tiktok || ''
        } : {
          facebook: '',
          instagram: '',
          whatsapp: dentist.user?.phone || '',
          tiktok: ''
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

  const handleSocialLinksUpdate = (field, value) => {
    setProfile(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value
      }
    }));
  };

  const toggleSpecialization = (spec) => {
    setProfile(prev => ({
      ...prev,
      specialization: prev.specialization.includes(spec)
        ? prev.specialization.filter(s => s !== spec)
        : [...prev.specialization, spec]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        licenseNumber: profile.licenseNumber,
        specialization: profile.specialization,
        birthDate: profile.birthDate,
        gender: profile.gender,
        city: profile.city,
        socialLinks: profile.socialLinks
      };
      
      await dentistsAPI.updateMyProfile(updateData);
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
          prefix="Dr. "
          isDarkMode={isDarkMode}
          profileImage={profile.profileImage}
          onImageUpdate={(imageUrl) => {
            setProfile(prev => ({ ...prev, profileImage: imageUrl }));
            if (onProfileUpdate) onProfileUpdate();
          }}
          isEditing={isEditing}
        />

        {/* Basic Information */}
        <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
          <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Basic Information
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
            onChangeText={(text) => handleProfileUpdate('phone', text)}
            editable={isEditing}
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
        </View>

        {/* Professional Information */}
        <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
          <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Professional Information
          </Text>

          <Input
            label="License Number"
            value={profile.licenseNumber}
            onChangeText={(text) => handleProfileUpdate('licenseNumber', text)}
            editable={isEditing}
            icon="document-text-outline"
          />

          <Select
            label="City"
            value={profile.city}
            onValueChange={(value) => handleProfileUpdate('city', value)}
            options={CITY_OPTIONS}
            enabled={isEditing}
          />

          {/* Clinic Info (Read-only) */}
          <View className="mb-4">
            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Clinic
            </Text>
            <View className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <Text className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.clinic.name || 'Not assigned'}
              </Text>
              {profile.clinic.address && (
                <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {profile.clinic.address}
                </Text>
              )}
            </View>
          </View>

          {/* Specializations */}
          <View className="mb-4">
            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Specializations
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {SPECIALIZATION_OPTIONS.map((spec) => (
                <TouchableOpacity
                  key={spec.value}
                  onPress={() => isEditing && toggleSpecialization(spec.value)}
                  disabled={!isEditing}
                  className={`px-3 py-2 rounded-full ${
                    profile.specialization.includes(spec.value)
                      ? 'bg-teal-500'
                      : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <Text className={`text-sm ${
                    profile.specialization.includes(spec.value)
                      ? 'text-white font-medium'
                      : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {spec.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Social Links */}
        <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
          <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Social Links
          </Text>

          <Input
            label="Facebook"
            value={profile.socialLinks.facebook}
            onChangeText={(text) => handleSocialLinksUpdate('facebook', text)}
            editable={isEditing}
            icon="logo-facebook"
            placeholder="https://facebook.com/..."
          />

          <Input
            label="Instagram"
            value={profile.socialLinks.instagram}
            onChangeText={(text) => handleSocialLinksUpdate('instagram', text)}
            editable={isEditing}
            icon="logo-instagram"
            placeholder="https://instagram.com/..."
          />

          <Input
            label="WhatsApp"
            value={profile.socialLinks.whatsapp}
            onChangeText={(text) => handleSocialLinksUpdate('whatsapp', text)}
            editable={isEditing}
            icon="logo-whatsapp"
            placeholder="+970..."
          />

          <Input
            label="TikTok"
            value={profile.socialLinks.tiktok}
            onChangeText={(text) => handleSocialLinksUpdate('tiktok', text)}
            editable={isEditing}
            icon="logo-tiktok"
            placeholder="https://tiktok.com/@..."
          />
        </View>

        {/* Change Password Section */}
        <PasswordChangeSection
          isDarkMode={isDarkMode}
          apiChangePassword={dentistsAPI.changePassword}
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

export default DentistSettings;
