import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadAPI } from '../../../services/api';
import { getImageUrl } from '../../../utils/imageUtils';

// Profile Header Component (Avatar + Name with Image Upload)
export const ProfileHeader = ({ firstName, lastName, subtitle, isDarkMode, prefix = '', profileImage, onImageUpdate, isEditing = false }) => {
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (!isEditing) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permissions to update your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (asset) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('profileImage', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'profile.jpg',
      });

      const response = await uploadAPI.uploadProfileImage(formData);
      
      if (onImageUpdate) {
        onImageUpdate(response.imageUrl);
      }

      Alert.alert('Success', 'Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async () => {
    if (!isEditing) return;

    Alert.alert(
      'Delete Profile Image',
      'Are you sure you want to delete your profile image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              await uploadAPI.deleteProfileImage();
              
              if (onImageUpdate) {
                onImageUpdate(null);
              }

              Alert.alert('Success', 'Profile image deleted successfully!');
            } catch (error) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', 'Failed to delete image. Please try again.');
            } finally {
              setUploading(false);
            }
          }
        }
      ]
    );
  };

  const imageUrl = getImageUrl(profileImage);

  return (
    <View className="items-center mb-6">
      <View className="relative">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-24 h-24 rounded-full"
            style={{ backgroundColor: '#14B8A6', width: 96, height: 96, borderRadius: 48 }}
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-teal-500 items-center justify-center">
            <Text className="text-white font-bold text-3xl">
              {firstName?.charAt(0)}{lastName?.charAt(0)}
            </Text>
          </View>
        )}
        
        {uploading && (
          <View className="absolute inset-0 w-24 h-24 rounded-full bg-black/50 items-center justify-center">
            <ActivityIndicator color="white" />
          </View>
        )}

        {isEditing && !uploading && (
          <View className="absolute -bottom-1 -right-1 flex-row" style={{ gap: 4 }}>
            <TouchableOpacity
              onPress={pickImage}
              className="w-8 h-8 rounded-full bg-teal-500 items-center justify-center"
              style={{ elevation: 3 }}
            >
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
            
            {profileImage && (
              <TouchableOpacity
                onPress={deleteImage}
                className="w-8 h-8 rounded-full bg-red-500 items-center justify-center"
                style={{ elevation: 3 }}
              >
                <Ionicons name="trash" size={16} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <Text className={`mt-3 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {prefix}{firstName} {lastName}
      </Text>
      {subtitle && (
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

// Profile Info Row Component
export const ProfileInfoRow = ({ icon, label, value, editable = false, onChangeText, isEditing, isDarkMode, multiline = false }) => (
  <View className={`mb-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon} size={18} color="#14b8a6" />
      <Text className={`ml-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </Text>
    </View>
    {isEditing && editable ? (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'} border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-300'
        } rounded-lg p-3`}
        placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
        style={multiline ? { textAlignVertical: 'top' } : {}}
      />
    ) : (
      <Text className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        {value || 'Not provided'}
      </Text>
    )}
  </View>
);

// Settings Action Button
export const SettingsActionButton = ({ icon, label, onPress, isDarkMode, variant = 'primary' }) => {
  const getButtonStyle = () => {
    if (variant === 'primary') {
      return 'bg-teal-500';
    } else if (variant === 'secondary') {
      return isDarkMode ? 'bg-gray-700' : 'bg-gray-200';
    } else if (variant === 'danger') {
      return 'bg-red-500';
    }
  };

  const getTextStyle = () => {
    if (variant === 'primary' || variant === 'danger') {
      return 'text-white';
    }
    return isDarkMode ? 'text-white' : 'text-gray-900';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-center py-3 px-4 rounded-xl ${getButtonStyle()}`}
      style={{ elevation: 2 }}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={20} color={variant === 'secondary' && !isDarkMode ? '#111827' : 'white'} />
      <Text className={`ml-2 text-base font-semibold ${getTextStyle()}`}>{label}</Text>
    </TouchableOpacity>
  );
};

// Settings Section Header
export const SettingsSectionHeader = ({ title, icon, isDarkMode }) => (
  <View className="flex-row items-center mb-3 px-1">
    {icon && <Ionicons name={icon} size={20} color="#14b8a6" />}
    <Text className={`text-lg font-bold ${icon ? 'ml-2' : ''} ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </Text>
  </View>
);

// Settings Toggle Row
export const SettingsToggleRow = ({ icon, label, value, onToggle, isDarkMode }) => (
  <TouchableOpacity
    onPress={onToggle}
    className={`mb-3 p-4 rounded-xl flex-row items-center justify-between ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}
    style={{ elevation: 2 }}
    activeOpacity={0.7}
  >
    <View className="flex-row items-center flex-1">
      <Ionicons name={icon} size={20} color="#14b8a6" />
      <Text className={`ml-3 text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{label}</Text>
    </View>
    <View
      className={`w-12 h-6 rounded-full p-1 ${value ? 'bg-teal-500' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
    >
      <View
        className={`w-4 h-4 rounded-full bg-white ${value ? 'ml-auto' : ''}`}
        style={{ transform: [{ translateX: value ? 0 : 0 }] }}
      />
    </View>
  </TouchableOpacity>
);
