import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';
import { showErrorAlert, showSuccessAlert } from '../../../utils/errorUtils';
import { ProfileHeader, ProfileInfoRow, SettingsActionButton, LoadingState } from '../shared';

const PatientSettings = () => {
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    dateOfBirth: '',
    gender: ''
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
      const response = await api.get('/patients/profile');
      const patient = response.data.patient;
      setProfile({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        email: patient.user?.email || '',
        phone: patient.user?.phone || '',
        city: patient.city || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || ''
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/patients/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        city: profile.city
      });
      showSuccessAlert('Profile updated successfully');
      setIsEditing(false);
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
            tintColor="#14B8A6"
          />
        }
      >
        <ProfileHeader
          firstName={profile.firstName}
          lastName={profile.lastName}
          isDarkMode={isDarkMode}
        />

        <ProfileInfoRow
          icon="person-outline"
          label="First Name"
          value={profile.firstName}
          editable={isEditing}
          onChangeText={(text) => setProfile({ ...profile, firstName: text })}
          isDarkMode={isDarkMode}
        />

        <ProfileInfoRow
          icon="person-outline"
          label="Last Name"
          value={profile.lastName}
          editable={isEditing}
          onChangeText={(text) => setProfile({ ...profile, lastName: text })}
          isDarkMode={isDarkMode}
        />

        <ProfileInfoRow
          icon="mail-outline"
          label="Email"
          value={profile.email}
          isDarkMode={isDarkMode}
        />

        <ProfileInfoRow
          icon="call-outline"
          label="Phone"
          value={profile.phone}
          isDarkMode={isDarkMode}
        />

        <ProfileInfoRow
          icon="location-outline"
          label="City"
          value={profile.city}
          editable={isEditing}
          onChangeText={(text) => setProfile({ ...profile, city: text })}
          isDarkMode={isDarkMode}
        />

        <ProfileInfoRow
          icon="calendar-outline"
          label="Date of Birth"
          value={profile.dateOfBirth}
          isDarkMode={isDarkMode}
        />

        <ProfileInfoRow
          icon="male-female-outline"
          label="Gender"
          value={profile.gender}
          isDarkMode={isDarkMode}
        />

        <View className="flex-row" style={{ gap: 8 }}>
          {!isEditing ? (
            <SettingsActionButton
              onPress={() => setIsEditing(true)}
              label="Edit Profile"
              variant="primary"
              isDarkMode={isDarkMode}
            />
          ) : (
            <>
              <SettingsActionButton
                onPress={handleSave}
                disabled={saving}
                label={saving ? 'Saving...' : 'Save'}
                variant="primary"
                isDarkMode={isDarkMode}
              />
              <SettingsActionButton
                onPress={() => {
                  setIsEditing(false);
                  fetchProfile();
                }}
                label="Cancel"
                variant="secondary"
                isDarkMode={isDarkMode}
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientSettings;
