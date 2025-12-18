import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
// import api from '../../../services/api';

const PatientTreatments = () => {
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
      // TODO: Uncomment when API is ready
      // const response = await api.get('/treatments/patient/mine');
      // setTreatments(response.data.treatments || []);
      setTreatments([]);
    } catch (error) {
      console.error('Error fetching treatments:', error);
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

  const filteredTreatments = treatments.filter(t => 
    selectedStatus === 'all' || t.status === selectedStatus
  );

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
            Dr. {treatment.dentist?.firstName} {treatment.dentist?.lastName}
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
        {treatment.startDate && (
          <View>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Started</Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {new Date(treatment.startDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
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
      <View className="flex-row mb-4" style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={() => setSelectedStatus('all')}
          className={`flex-1 py-3 rounded-xl ${selectedStatus === 'all' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`text-center font-semibold ${selectedStatus === 'all' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus('IN_PROGRESS')}
          className={`flex-1 py-3 rounded-xl ${selectedStatus === 'IN_PROGRESS' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`text-center font-semibold ${selectedStatus === 'IN_PROGRESS' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            In Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus('COMPLETED')}
          className={`flex-1 py-3 rounded-xl ${selectedStatus === 'COMPLETED' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`text-center font-semibold ${selectedStatus === 'COMPLETED' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        {filteredTreatments.length > 0 ? (
          filteredTreatments.map((treatment) => (
            <TreatmentCard key={treatment.id} treatment={treatment} />
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="medical-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No treatments found
            </Text>
            <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Your treatment history will appear here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PatientTreatments;
