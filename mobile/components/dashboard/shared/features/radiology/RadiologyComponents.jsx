import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStatusColors } from '../../../../../utils/colors';

export const RadiologyRequestCard = ({ request, isDarkMode }) => (
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
          {request.imagingType}
        </Text>
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {request.patient?.firstName} {request.patient?.lastName}
        </Text>
      </View>
      <View 
        className="px-2 py-1 rounded-full" 
        style={{ 
          backgroundColor: getStatusColors(request.status, isDarkMode).bg,
          borderWidth: 1,
          borderColor: getStatusColors(request.status, isDarkMode).border
        }}
      >
        <Text 
          className="text-xs font-medium"
          style={{ color: getStatusColors(request.status, isDarkMode).text }}
        >
          {request.status.replace('_', ' ')}
        </Text>
      </View>
    </View>

    {(request.radiologyCenter?.centerName || request.radiology?.centerName) && (
      <View className="flex-row items-center mt-2">
        <Ionicons name="business-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {request.radiologyCenter?.centerName || request.radiology?.centerName}
        </Text>
      </View>
    )}

    <View className="flex-row items-center mt-1">
      <Ionicons name="calendar-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
      <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {new Date(request.requestDate).toLocaleDateString()}
      </Text>
    </View>

    {request.notes && (
      <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {request.notes}
      </Text>
    )}
  </View>
);
