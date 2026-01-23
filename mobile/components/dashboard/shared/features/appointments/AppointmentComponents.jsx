import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDateTime } from '../../../../../utils/dateUtils';
import { getStatusColors, COLORS, UI_COLORS } from '../../../../../utils/colors';

// Appointment Card Component
export const AppointmentCard = ({ appointment, isDarkMode, role = 'patient', onCancel, onComplete, onConfirm, onViewDetails }) => {
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
    return appointment.treatmentName || appointment.treatment?.treatmentName || 'General Checkup';
  };

  // Determine if appointment is in the past - use startTime for comparison
  const appointmentTime = appointment.startTime || appointment.appointmentDateTime || appointment.appointmentDate;
  const isPastAppointment = appointmentTime ? new Date(appointmentTime) < new Date() : false;
  
  // Match web client button logic
  const isPending = appointment.status === 'PENDING';
  const isConfirmed = appointment.status === 'CONFIRMED';

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
        <View 
          className="px-3 py-1 rounded-full" 
          style={{ 
            backgroundColor: getStatusColors(appointment.status, isDarkMode).bg,
            borderWidth: 1,
            borderColor: getStatusColors(appointment.status, isDarkMode).border
          }}
        >
          <Text 
            className="text-xs font-medium" 
            style={{ color: getStatusColors(appointment.status, isDarkMode).text }}
          >
            {appointment.status}
          </Text>
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

        {(appointment.notes || appointment.patientNotes || appointment.sessionNotes) && (
          <View className="flex-row items-start mt-1">
            <Ionicons name="document-text-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-2 text-sm flex-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {appointment.notes || appointment.patientNotes || appointment.sessionNotes}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row mt-3" style={{ gap: 8 }}>
        {/* View button - always show if available */}
        {onViewDetails && (
          <TouchableOpacity
            onPress={() => onViewDetails(appointment)}
            className={`flex-1 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            <Text className={`text-center text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              View
            </Text>
          </TouchableOpacity>
        )}
        
        {/* PENDING status: Show Confirm + Cancel for dentist and secretary */}
        {isPending && (role === 'dentist' || role === 'secretary') && (
          <>
            {onConfirm && (
              <TouchableOpacity
                onPress={() => onConfirm(appointment)}
                className="flex-1 py-2 rounded-lg"
                style={{ backgroundColor: COLORS.green[600] }}
              >
                <Text className="text-center text-sm font-medium text-white">
                  Confirm
                </Text>
              </TouchableOpacity>
            )}
            {onCancel && (
              <TouchableOpacity
                onPress={() => onCancel(appointment)}
                className="flex-1 py-2 rounded-lg"
                style={{ backgroundColor: COLORS.red[600] }}
              >
                <Text className="text-center text-sm font-medium text-white">
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* CONFIRMED status: Show Complete + Cancel for dentist and secretary */}
        {isConfirmed && (role === 'dentist' || role === 'secretary') && (
          <>
            {onComplete && (
              <TouchableOpacity
                onPress={() => onComplete(appointment)}
                className="flex-1 py-2 rounded-lg"
                style={{ backgroundColor: COLORS.blue[600] }}
              >
                <Text className="text-center text-sm font-medium text-white">
                  Complete
                </Text>
              </TouchableOpacity>
            )}
            {onCancel && (
              <TouchableOpacity
                onPress={() => onCancel(appointment)}
                className="flex-1 py-2 rounded-lg"
                style={{ backgroundColor: COLORS.red[600] }}
              >
                <Text className="text-center text-sm font-medium text-white">
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        
        {/* For patient role, show only cancel if available */}
        {role === 'patient' && (isPending || isConfirmed) && onCancel && (
          <TouchableOpacity
            onPress={() => onCancel(appointment)}
            className="flex-1 py-2 rounded-lg"
            style={{ backgroundColor: COLORS.red[600] }}
          >
            <Text className="text-center text-sm font-medium text-white">
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Filter Tabs Component
export const FilterTabs = ({ tabs, activeTab, onTabChange, isDarkMode }) => {
  const { ScrollView } = require('react-native');
  
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ gap: 8 }}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => onTabChange(tab.id)}
          className={`py-3 px-4 rounded-xl ${
            activeTab === tab.id
              ? 'bg-teal-500'
              : isDarkMode
              ? 'bg-gray-800'
              : 'bg-gray-100'
          }`}
          style={{ elevation: activeTab === tab.id ? 2 : 0 }}
        >
          <Text
            className={`text-center font-semibold text-sm ${
              activeTab === tab.id ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
