import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';

const SecretaryDentists = () => {
  const { isDarkMode } = useTheme();
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDentists();
  }, []);

  const fetchDentists = async () => {
    try {
      const response = await api.get('/dentists');
      setDentists(response.data.dentists || []);
    } catch (error) {
      console.error('Error fetching dentists:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load dentists';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDentists();
  };

  const filteredDentists = useMemo(() => {
    return dentists.filter(dentist =>
      `${dentist.firstName} ${dentist.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dentist.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dentist.licenseNumber?.includes(searchTerm)
    );
  }, [dentists, searchTerm]);

  const DentistCard = ({ dentist }) => (
    <TouchableOpacity
      className={`mb-3 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3
      }}
    >
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-teal-500 items-center justify-center mr-3">
          <Text className="text-white font-bold text-lg">
            Dr
          </Text>
        </View>
        <View className="flex-1">
          <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dr. {dentist.firstName} {dentist.lastName}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="card-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {dentist.licenseNumber || 'N/A'}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="mail-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {dentist.user?.email || 'N/A'}
            </Text>
          </View>
          {dentist.specialization && dentist.specialization.length > 0 && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="medical-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dentist.specialization.join(', ')}
              </Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading dentists...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className={`mb-4 px-4 py-3 rounded-xl flex-row items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <Ionicons name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        <TextInput
          placeholder="Search dentists..."
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
          value={searchTerm}
          onChangeText={setSearchTerm}
          className={`flex-1 ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredDentists.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No dentists found
            </Text>
          </View>
        ) : (
          filteredDentists.map((dentist) => (
            <DentistCard key={dentist.userId} dentist={dentist} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SecretaryDentists;
