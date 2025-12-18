import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateTime } from '../../../utils/dateUtils';

// Status color helper
export const getStatusColor = (status) => {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return 'bg-green-500';
    case 'PENDING':
      return 'bg-yellow-500';
    case 'COMPLETED':
      return 'bg-blue-500';
    case 'CANCELLED':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Appointment Card Component
export const AppointmentCard = ({ appointment, isDarkMode, role = 'patient' }) => {
  const { date, time } = formatDateTime(appointment.appointmentDateTime || appointment.startTime);

  // Determine what to display based on role
  const getPrimaryText = () => {
    if (role === 'patient') {
      return `Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}`;
    }
    return `${appointment.patient?.firstName} ${appointment.patient?.lastName}`;
  };

  const getSecondaryText = () => {
    if (role === 'secretary') {
      return `Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}`;
    }
    return appointment.treatmentType || appointment.treatment?.treatmentType || 'General Checkup';
  };

  return (
    <View
      className={`mb-3 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getPrimaryText()}
          </Text>
          <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {getSecondaryText()}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
          <Text className="text-white text-xs font-medium">{appointment.status}</Text>
        </View>
      </View>

      <View className="mt-2" style={{ gap: 8 }}>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {date}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {time}
          </Text>
        </View>

        {appointment.clinic && (
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {appointment.clinic.clinicName}
            </Text>
          </View>
        )}

        {appointment.notes && (
          <View className="flex-row items-start mt-1">
            <Ionicons name="document-text-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-2 text-sm flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {appointment.notes}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Filter Tabs Component
export const FilterTabs = ({ tabs, activeTab, onTabChange, isDarkMode }) => (
  <View className="flex-row mb-4" style={{ gap: 8 }}>
    {tabs.map((tab) => (
      <TouchableOpacity
        key={tab.id}
        onPress={() => onTabChange(tab.id)}
        className={`flex-1 py-3 rounded-xl ${
          activeTab === tab.id
            ? isDarkMode
              ? 'bg-teal-500'
              : 'bg-teal-500'
            : isDarkMode
            ? 'bg-gray-800'
            : 'bg-gray-100'
        }`}
        style={{ elevation: activeTab === tab.id ? 2 : 0 }}
      >
        <Text
          className={`text-center font-semibold ${
            activeTab === tab.id ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {tab.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
