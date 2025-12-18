import React from 'react';
import { View, Text } from 'react-native';

// Get status color for treatments
export const getTreatmentStatusColor = (status) => {
  switch (status) {
    case 'IN_PROGRESS': return 'bg-blue-500';
    case 'COMPLETED': return 'bg-green-500';
    case 'ON_HOLD': return 'bg-yellow-500';
    case 'CANCELLED': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Universal treatment card component that adapts to role
export const TreatmentCard = ({ treatment, isDarkMode, role = 'patient' }) => {
  const showDentistInfo = role === 'patient' || role === 'secretary';
  const showPatientInfo = role === 'dentist' || role === 'secretary';

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
            {treatment.treatmentType}
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
        <View className={`px-2 py-1 rounded-full ${getTreatmentStatusColor(treatment.status)}`}>
          <Text className="text-white text-xs font-medium">
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
              {new Date(treatment.startDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
