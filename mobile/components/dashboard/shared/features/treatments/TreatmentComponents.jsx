import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStatusColors, COLORS } from '../../../../../utils/colors';

// Universal treatment card component that adapts to role
export const TreatmentCard = ({ treatment, isDarkMode, role = 'patient', onBookAppointment }) => {
  const showDentistInfo = role === 'patient' || role === 'secretary';
  const showPatientInfo = role === 'dentist' || role === 'secretary';
  
  // Only show book appointment button if treatment is not completed or cancelled AND user is not a patient
  const canBookAppointment = onBookAppointment && 
    role !== 'patient' &&
    treatment.status !== 'COMPLETED' && 
    treatment.status !== 'CANCELLED';

  return (
    <View className={`mb-3 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {treatment.treatmentName}
          </Text>
          {showDentistInfo && treatment.dentist && (
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Dr. {treatment.dentist.firstName} {treatment.dentist.lastName}
            </Text>
          )}
          {showPatientInfo && treatment.patient && (
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {treatment.patient.firstName} {treatment.patient.lastName}
            </Text>
          )}
        </View>
        <View 
          className="px-2 py-1 rounded-full" 
          style={{ 
            backgroundColor: getStatusColors(treatment.status, isDarkMode).bg,
            borderWidth: 1,
            borderColor: getStatusColors(treatment.status, isDarkMode).border
          }}
        >
          <Text 
            className="text-xs font-medium"
            style={{ color: getStatusColors(treatment.status, isDarkMode).text }}
          >
            {treatment.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      {treatment.description && (
        <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {treatment.description}
        </Text>
      )}

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <View>
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Amount
          </Text>
          <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${treatment.totalAmount?.toFixed(2) || '0.00'}
          </Text>
        </View>
        {treatment.startDate && (
          <View>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Started
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        )}
      </View>

      {/* Book Appointment Button */}
      {canBookAppointment && (
        <TouchableOpacity
          onPress={() => onBookAppointment(treatment)}
          className={`mt-3 py-2 px-4 rounded-lg flex-row items-center justify-center ${
            isDarkMode ? 'bg-teal-600' : 'bg-teal-500'
          }`}
          style={{ elevation: 2 }}
        >
          <Ionicons name="calendar-outline" size={18} color="white" />
          <Text className="text-white font-semibold ml-2">
            Book Appointment
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
