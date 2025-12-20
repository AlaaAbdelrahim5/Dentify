import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistance } from '../../../../utils/geoUtils';
import Avatar from '../ui/Avatar';
import CardWrapper from '../ui/CardWrapper';
import InfoRow from '../ui/InfoRow';

const DentistCard = ({ dentist, isDarkMode, onBook, onViewDetails }) => {
  return (
    <CardWrapper isDarkMode={isDarkMode}>
      <View className="flex-row items-start">
        <Avatar
          imageUri={dentist.user?.profileImage || dentist.profileImage}
          fallbackText={`${dentist.firstName?.[0] || ''}${dentist.lastName?.[0] || ''}`}
          size={64}
          shape="circle"
        />

        <View className="flex-1">
          <Text className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dr. {dentist.firstName} {dentist.lastName}
          </Text>

          {dentist.specialty && (
            <InfoRow
              icon="medical"
              text={dentist.specialty}
              isDarkMode={isDarkMode}
              iconSize={14}
              iconColor="#14B8A6"
              textColor="text-sm text-teal-600"
              spacing="mt-1"
            />
          )}

          {dentist.licenseNumber && (
            <InfoRow
              icon="card"
              text={`License: ${dentist.licenseNumber}`}
              isDarkMode={isDarkMode}
              iconSize={12}
              textSize="text-xs"
              spacing="mt-1"
            />
          )}

          {dentist.clinic && (
            <InfoRow
              icon="business"
              text={dentist.clinic.clinicName}
              isDarkMode={isDarkMode}
              iconSize={12}
              spacing="mt-2"
            />
          )}

          {dentist.clinic?.city && (
            <InfoRow
              icon="location"
              text={dentist.clinic.city}
              isDarkMode={isDarkMode}
              iconSize={12}
              spacing="mt-1"
            />
          )}

          {dentist.distance !== undefined && dentist.distance !== Infinity && (
            <View className="mt-2">
              <View className={`px-2 py-1 rounded-full self-start ${
                isDarkMode ? 'bg-teal-500/20' : 'bg-teal-50'
              }`}>
                <Text className={`text-xs font-medium ${
                  isDarkMode ? 'text-teal-300' : 'text-teal-700'
                }`}>
                  📍 {formatDistance(dentist.distance)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => onBook(dentist)}
            className="bg-teal-600 py-2 rounded-lg items-center flex-row justify-center mt-3"
          >
            <Ionicons name="calendar" size={16} color="white" />
            <Text className="text-white font-medium ml-2">Book</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => onViewDetails(dentist)}
            className="mt-2 bg-purple-600 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-medium">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CardWrapper>
  );
};

export default DentistCard;
