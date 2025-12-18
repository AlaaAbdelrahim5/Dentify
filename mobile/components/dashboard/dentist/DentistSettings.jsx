import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';
import { showErrorAlert, showSuccessAlert } from '../../../utils/errorUtils';
import { ProfileHeader, ProfileInfoRow, SettingsActionButton, LoadingState } from '../shared';

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
      await api.put('/dentists/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        licenseNumber: profile.licenseNumber,
        specialization: profile.specialization,
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
          prefix="Dr. "
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
          icon="document-text-outline"
          label="License Number"
          value={profile.licenseNumber}
          editable={isEditing}
          onChangeText={(text) => setProfile({ ...profile, licenseNumber: text })}
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

export default DentistSettings;
