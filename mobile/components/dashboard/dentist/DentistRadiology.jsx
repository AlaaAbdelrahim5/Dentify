import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';

const DentistRadiology = () => {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchRadiologyRequests();
  }, []);

  const fetchRadiologyRequests = async () => {
    try {
      const response = await api.get('/radiology-requests/dentist');
      setRequests(response.data.radiologyRequests || []);
    } catch (error) {
      console.error('Error fetching radiology requests:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load radiology requests';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRadiologyRequests();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Requested': return 'bg-yellow-500';
      case 'Available': return 'bg-green-500';
      case 'Not_Available': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredRequests = useMemo(() => {
    if (selectedStatus === 'all') return requests;
    return requests.filter(r => r.status === selectedStatus);
  }, [requests, selectedStatus]);

  const RequestCard = ({ request }) => (
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
        <View className={`px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
          <Text className="text-white text-xs font-medium">{request.status.replace('_', ' ')}</Text>
        </View>
      </View>

      <View className="flex-row items-center mt-2">
        <Ionicons name="business-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {request.radiology?.centerName}
        </Text>
      </View>

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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading radiology requests...</Text>
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
            All ({requests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedStatus('Available')}
          className={`flex-1 py-3 rounded-xl ${selectedStatus === 'Available' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`text-center font-semibold ${selectedStatus === 'Available' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            Available
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRequests.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="medical-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No radiology requests
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DentistRadiology;
