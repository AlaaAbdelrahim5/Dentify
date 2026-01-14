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

  // Calculate payment progress
  const treatmentDiscount = treatment.treatmentDiscount || 0;
  const effectiveTotal = (treatment.totalAmount || 0) - treatmentDiscount;
  const paidAmount = treatment.paidAmount || 0;
  const remainingBalance = Math.max(0, effectiveTotal - paidAmount);
  const paymentProgress = effectiveTotal > 0 ? Math.min(100, (paidAmount / effectiveTotal) * 100) : 0;

  // Count teeth if available
  const teethStatus = treatment.teethStatus || [];
  const totalTeeth = Array.isArray(teethStatus) ? teethStatus.length : 0;
  const completedTeeth = Array.isArray(teethStatus) 
    ? teethStatus.filter(tooth => tooth.status === 'Completed').length 
    : 0;

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
        <Text 
          className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
          numberOfLines={2}
        >
          {treatment.description}
        </Text>
      )}

      {/* Teeth Status */}
      {totalTeeth > 0 && (
        <View className="flex-row items-center mt-2">
          <Ionicons name="medical" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {completedTeeth}/{totalTeeth} teeth completed
          </Text>
        </View>
      )}

      {/* Payment Progress */}
      <View 
        className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Payment Progress
          </Text>
          <Text 
            className={`text-xs font-bold ${
              paymentProgress === 100 ? 'text-green-600' : 'text-teal-600'
            }`}
          >
            {paymentProgress.toFixed(0)}%
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View 
          className={`w-full h-2 rounded-full overflow-hidden ${
            isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
          }`}
        >
          <View 
            className={paymentProgress === 100 ? 'bg-green-600' : 'bg-teal-600'}
            style={{ width: `${paymentProgress}%`, height: '100%' }}
          />
        </View>

        {/* Payment Details */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Paid: ${paidAmount.toFixed(2)}
          </Text>
          <Text 
            className={`text-xs font-medium ${
              remainingBalance > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {remainingBalance > 0 
              ? `Balance: $${remainingBalance.toFixed(2)}` 
              : 'Fully Paid'
            }
          </Text>
        </View>
      </View>

      {/* Date and Total Amount */}
      <View className="flex-row items-center justify-between mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: isDarkMode ? '#374151' : '#E5E7EB' }}>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {treatment.startDate 
              ? new Date(treatment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : new Date(treatment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }
          </Text>
        </View>
        <View>
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total
          </Text>
          <Text className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${(treatment.totalAmount || 0).toFixed(2)}
          </Text>
        </View>
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
