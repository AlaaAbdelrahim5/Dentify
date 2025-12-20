import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../../../../utils/imageUtils';
import Avatar from '../ui/Avatar';
import CardWrapper from '../ui/CardWrapper';
import InfoRow from '../ui/InfoRow';

export const PatientCard = ({ patient, isDarkMode, onPress }) => {
  return (
    <CardWrapper isDarkMode={isDarkMode} onPress={onPress}>
      <View className="flex-row items-center">
        <Avatar
          imageUri={getImageUrl(patient.userId?.profileImage || patient.user?.profileImage || patient.profileImage)}
          fallbackText={`${patient.firstName?.charAt(0) || ''}${patient.lastName?.charAt(0) || ''}`}
          size={48}
        />
      <View className="flex-1">
        <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {patient.firstName} {patient.lastName}
        </Text>
        <InfoRow
          icon="mail-outline"
          text={patient.user?.email || 'N/A'}
          isDarkMode={isDarkMode}
          iconSize={14}
        />
        <InfoRow
          icon="call-outline"
          text={patient.user?.phone || 'N/A'}
          isDarkMode={isDarkMode}
          iconSize={14}
        />
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
    </View>
    </CardWrapper>
  );
};

export const DentistCard = ({ dentist, isDarkMode, onPress }) => {
  return (
    <CardWrapper isDarkMode={isDarkMode} onPress={onPress}>
      <View className="flex-row items-center">
        <Avatar
          imageUri={getImageUrl(dentist.userId?.profileImage || dentist.user?.profileImage || dentist.profileImage)}
          fallbackText="Dr"
          size={48}
        />
        <View className="flex-1">
        <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Dr. {dentist.firstName} {dentist.lastName}
        </Text>
        <InfoRow
          icon="card-outline"
          text={dentist.licenseNumber || 'N/A'}
          isDarkMode={isDarkMode}
          iconSize={14}
        />
        <InfoRow
          icon="mail-outline"
          text={dentist.user?.email || 'N/A'}
          isDarkMode={isDarkMode}
          iconSize={14}
        />
        {dentist.specialization && dentist.specialization.length > 0 && (
          <InfoRow
            icon="medical-outline"
            text={dentist.specialization.join(', ')}
            isDarkMode={isDarkMode}
            iconSize={14}
          />
        )}
      </View>
        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
      </View>
    </CardWrapper>
  );
};
