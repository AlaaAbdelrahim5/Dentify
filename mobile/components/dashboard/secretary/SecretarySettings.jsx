import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';
import { showErrorAlert, showSuccessAlert } from '../../../utils/errorUtils';
import { ProfileHeader, ProfileInfoRow, SettingsActionButton, LoadingState } from '../shared';

const SecretarySettings = () => {
  const { isDarkMode } = useTheme();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    clinic: {
      name: '',
      city: ''
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
      const response = await api.get('/secretaries/profile');
      const secretary = response.data.secretary;
      setProfile({
        firstName: secretary.firstName || '',
        lastName: secretary.lastName || '',
        email: secretary.user?.email || '',
        phone: secretary.user?.phone || '',
        city: secretary.city || '',
        clinic: {
          name: secretary.clinic?.clinicName || '',
          city: secretary.clinic?.city || ''
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/secretaries/profile', {
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
          subtitle={`Secretary at ${profile.clinic.name}`}
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
          icon="business-outline"
          label="Clinic"
          value={profile.clinic.name}
          isDarkMode={isDarkMode}
        />

        <ProfileInfoRow
          icon="location-outline"
          label="Clinic City"
          value={profile.clinic.city}
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

export default SecretarySettings;
