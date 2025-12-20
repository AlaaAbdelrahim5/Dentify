import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistance } from '../../../../utils/geoUtils';
import Avatar from '../ui/Avatar';
import CardWrapper from '../ui/CardWrapper';
import InfoRow from '../ui/InfoRow';

const ClinicCard = ({ clinic, isDarkMode, onViewDetails }) => {
  return (
    <CardWrapper isDarkMode={isDarkMode}>
      <View className="flex-row items-start">
        <Avatar
          imageUri={clinic.user?.profileImage || clinic.profileImage}
          fallbackIcon="business"
          size={64}
          shape="square"
          backgroundColor="#3B82F6"
        />

        <View className="flex-1">
          <Text className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {clinic.clinicName}
          </Text>

          {clinic.registrationNumber && (
            <InfoRow
              icon="document-text"
              text={`Reg: ${clinic.registrationNumber}`}
              isDarkMode={isDarkMode}
              iconSize={12}
              textSize="text-xs"
              spacing="mt-1"
            />
          )}

          {clinic.city && (
            <InfoRow
              icon="location"
              text={clinic.city}
              isDarkMode={isDarkMode}
              iconSize={12}
              spacing="mt-2"
            />
          )}

          {clinic.address && (
            <View className="flex-row items-start mt-1">
              <Ionicons name="navigate" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} style={{ marginTop: 2 }} />
              <Text className={`text-sm ml-2 flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {clinic.address}
              </Text>
            </View>
          )}

          {clinic.distance !== undefined && clinic.distance !== Infinity && (
            <View className="mt-2">
              <View className={`px-2 py-1 rounded-full self-start ${
                isDarkMode ? 'bg-teal-500/20' : 'bg-teal-50'
              }`}>
                <Text className={`text-xs font-medium ${
                  isDarkMode ? 'text-teal-300' : 'text-teal-700'
                }`}>
                  📍 {formatDistance(clinic.distance)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => onViewDetails(clinic)}
            className="mt-3 bg-blue-600 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-medium">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CardWrapper>
  );
};

export default ClinicCard;
