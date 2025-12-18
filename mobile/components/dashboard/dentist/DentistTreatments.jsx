import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';

const DentistTreatments = () => {
  const { isDarkMode } = useTheme();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const response = await api.get('/treatments/dentist');
      setTreatments(response.data.treatments || []);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load treatments';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreatments();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'ON_HOLD': return 'bg-yellow-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredTreatments = useMemo(() => {
    if (selectedStatus === 'all') return treatments;
    return treatments.filter(t => t.status === selectedStatus);
  }, [treatments, selectedStatus]);

  const TreatmentCard = ({ treatment }) => (
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
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {treatment.patient?.firstName} {treatment.patient?.lastName}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${getStatusColor(treatment.status)}`}>
          <Text className="text-white text-xs font-medium">{treatment.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <View>
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount</Text>
          <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${treatment.totalAmount?.toFixed(2)}
          </Text>
        </View>
        <View>
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Paid</Text>
          <Text className="text-lg font-bold text-green-600">
            ${treatment.paidAmount?.toFixed(2)}
          </Text>
        </View>
        <View>
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Balance</Text>
          <Text className="text-lg font-bold text-orange-600">
            ${(treatment.totalAmount - treatment.paidAmount)?.toFixed(2)}
          </Text>
        </View>
      </View>

      {treatment.notes && (
        <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {treatment.notes}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading treatments...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row mb-4 overflow-x-auto" style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={() => setSelectedStatus('all')}
          className={`py-3 px-4 rounded-xl ${selectedStatus === 'all' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`font-semibold ${selectedStatus === 'all' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            All ({treatments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus('IN_PROGRESS')}
          className={`py-3 px-4 rounded-xl ${selectedStatus === 'IN_PROGRESS' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`font-semibold ${selectedStatus === 'IN_PROGRESS' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            In Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus('COMPLETED')}
          className={`py-3 px-4 rounded-xl ${selectedStatus === 'COMPLETED' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`font-semibold ${selectedStatus === 'COMPLETED' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTreatments.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="medkit-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No treatments found
            </Text>
          </View>
        ) : (
          filteredTreatments.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DentistTreatments;
