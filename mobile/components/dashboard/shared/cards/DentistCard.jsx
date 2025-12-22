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
                  📍 {formatDistance(dentist.distance)}
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => onBook(dentist)}
            className="py-3 rounded-xl items-center flex-row justify-center mt-3"
            style={{
              backgroundColor: '#14B8A6',
              shadowColor: '#14B8A6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4
            }}
          >
            <Ionicons name="calendar" size={18} color="white" />
            <Text className="text-white font-bold ml-2 text-base">Book Appointment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => onViewDetails(dentist)}
            className="mt-2 py-3 rounded-xl items-center"
            style={{
              backgroundColor: isDarkMode ? '#4C1D95' : '#8B5CF6',
              borderWidth: 1.5,
              borderColor: isDarkMode ? '#5B21B6' : '#A78BFA',
              shadowColor: '#8B5CF6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}
          >
            <Text className="text-white font-bold text-base">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CardWrapper>
  );
};

export default DentistCard;
