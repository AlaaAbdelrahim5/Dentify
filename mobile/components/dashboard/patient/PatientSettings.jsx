import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { patientsAPI } from '../../../services/api';
import { useSettings } from '../../../hooks';
import { SharedSettings } from '../shared';

const PatientSettings = ({ onProfileUpdate }) => {
  const { isDarkMode } = useTheme();

  const {
    profile,
    loading,
    refreshing,
    saving,
    isEditing,
    setIsEditing,
    onRefresh,
    handleProfileUpdate,
    handleSave
  } = useSettings({
    fetchProfile: patientsAPI.getMyProfile,
    updateProfile: patientsAPI.updateMyProfile,
    transformFetchData: (patient) => ({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.user?.email || '',
      phone: patient.user?.phone || '',
      city: patient.city || '',
      birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : '',
      gender: patient.gender || '',
      profileImage: patient.user?.profileImage || ''
    }),
    transformUpdateData: (profile) => ({
      firstName: profile.firstName,
      lastName: profile.lastName,
      gender: profile.gender,
      birthDate: profile.birthDate,
      city: profile.city
    }),
    onProfileUpdate
  });

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

  const roleSpecificFields = (
    <>
      {profile.birthDate && (
        <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Age: {calculateAge()} years old
          </Text>
        </View>
      )}
    </>
  );

  return (
    <SharedSettings
      profile={profile}
      handleProfileUpdate={handleProfileUpdate}
      handleSave={handleSave}
      onRefresh={onRefresh}
      onProfileUpdate={onProfileUpdate}
      loading={loading}
      refreshing={refreshing}
      saving={saving}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      role="patient"
      roleSpecificFields={roleSpecificFields}
      subtitle="Patient"
    />
  );
};

export default PatientSettings;
