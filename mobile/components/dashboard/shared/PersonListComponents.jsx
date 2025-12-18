import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const PatientCard = ({ patient, isDarkMode, onPress }) => (
  <TouchableOpacity
    className={`mb-3 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    style={{
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3
    }}
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <View className="w-12 h-12 rounded-full bg-teal-500 items-center justify-center mr-3">
        <Text className="text-white font-bold text-lg">
          {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
        </Text>
      </View>
      <View className="flex-1">
        <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {patient.firstName} {patient.lastName}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="mail-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {patient.user?.email || 'N/A'}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Ionicons name="call-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {patient.user?.phone || 'N/A'}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
    </View>
  </TouchableOpacity>
);

export const DentistCard = ({ dentist, isDarkMode, onPress }) => (
  <TouchableOpacity
    className={`mb-3 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    style={{
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3
    }}
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <View className="w-12 h-12 rounded-full bg-teal-500 items-center justify-center mr-3">
        <Text className="text-white font-bold text-lg">
          Dr
        </Text>
      </View>
      <View className="flex-1">
        <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Dr. {dentist.firstName} {dentist.lastName}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="card-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {dentist.licenseNumber || 'N/A'}
          </Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Ionicons name="mail-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {dentist.user?.email || 'N/A'}
          </Text>
        </View>
        {dentist.specialization && dentist.specialization.length > 0 && (
          <View className="flex-row items-center mt-1">
            <Ionicons name="medical-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {dentist.specialization.join(', ')}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
    </View>
  </TouchableOpacity>
);
