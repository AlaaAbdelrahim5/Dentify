import { useState, useEffect } from 'react';
import { showErrorAlert, showSuccessAlert } from '../utils/errorUtils';

/**
 * Custom hook for managing user settings/profile
 * @param {Object} options Configuration options
 * @param {Function} options.fetchProfile - Function to fetch profile data
 * @param {Function} options.updateProfile - Function to update profile data
 * @param {Function} options.transformFetchData - Function to transform fetched data
 * @param {Function} options.transformUpdateData - Function to transform data before update
 * @param {Function} options.onProfileUpdate - Callback after profile update
 * @returns {Object} Profile data and management functions
 */
export const useSettings = ({
  fetchProfile,
  updateProfile,
  transformFetchData,
  transformUpdateData,
  onProfileUpdate
}) => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetchProfile();
      const rawData = response.data?.dentist || response.data?.secretary || response.data?.patient || response.data;
      
      if (!rawData) {
        throw new Error('Profile not found');
      }

      const transformedData = transformFetchData ? transformFetchData(rawData) : rawData;
      setProfile(transformedData);
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
    loadProfile();
  };

  const handleProfileUpdate = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedUpdate = (parentField, field, value) => {
    setProfile(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = transformUpdateData ? transformUpdateData(profile) : profile;
      
      await updateProfile(updateData);
      showSuccessAlert('Profile updated successfully');
      setIsEditing(false);
      await loadProfile();
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showErrorAlert(error, 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    setProfile,
    loading,
    refreshing,
    saving,
    isEditing,
    setIsEditing,
    onRefresh,
    handleProfileUpdate,
    handleNestedUpdate,
    handleSave,
    refetch: loadProfile
  };
};
