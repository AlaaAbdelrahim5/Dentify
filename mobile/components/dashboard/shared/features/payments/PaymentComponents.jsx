import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Universal payment card component that adapts to role
export const PaymentCard = ({ payment, isDarkMode, role = 'patient' }) => {
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
            {payment.treatment?.treatmentName || 'Treatment'}
          </Text>
          {showDentistInfo && payment.treatment?.dentist && (
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Dr. {payment.treatment.dentist.firstName} {payment.treatment.dentist.lastName}
            </Text>
          )}
          {showPatientInfo && payment.treatment?.patient && (
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {payment.treatment.patient.firstName} {payment.treatment.patient.lastName}
            </Text>
          )}
        </View>
        <Text className="text-green-600 font-bold text-lg">
          ${payment.amount?.toFixed(2) || '0.00'}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <View 
          className={`px-3 py-1 rounded-full ${
            payment.method === 'CASH'
              ? isDarkMode 
                ? 'bg-green-500/20 border border-green-500/30' 
                : 'bg-emerald-100 border border-emerald-200'
              : isDarkMode
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'bg-blue-100 border border-blue-200'
          }`}
        >
          <Text 
            className={`text-xs font-medium ${
              payment.method === 'CASH'
                ? isDarkMode ? 'text-green-400' : 'text-emerald-700'
                : isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            {payment.method === 'CASH' ? '💵 Cash' : '💳 Card'}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Payment stats card component
export const PaymentStatsCard = ({ label, value, isDarkMode }) => (
  <View className={`flex-1 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    style={{
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3
    }}
  >
    <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</Text>
    <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      ${value.toFixed(2)}
    </Text>
  </View>
);
