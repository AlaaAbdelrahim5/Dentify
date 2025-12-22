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
              <View className={`px-3 py-1.5 rounded-full self-start`}
                style={{
                  backgroundColor: isDarkMode ? '#0D948820' : '#F0FDFA',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#14B8A6' : '#99F6E4'
                }}
              >
                <Text className={`text-xs font-bold ${
                  isDarkMode ? 'text-teal-300' : 'text-teal-700'
                }`}>
                  📍 {formatDistance(clinic.distance)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => onViewDetails(clinic)}
            className="mt-3 py-3 rounded-xl items-center"
            style={{
              backgroundColor: isDarkMode ? '#1E40AF' : '#3B82F6',
              borderWidth: 1.5,
              borderColor: isDarkMode ? '#2563EB' : '#60A5FA',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4
            }}
          >
            <Text className="text-white font-bold text-base">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CardWrapper>
  );
};

export default ClinicCard;
