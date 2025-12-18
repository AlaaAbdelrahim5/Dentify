import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';

const SecretaryPatients = () => {
  const { isDarkMode } = useTheme();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load patients';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.user?.phone?.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  const PatientCard = ({ patient }) => (
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
            {patient.firstName?.charAt(0)}{patient.lastName?.charAt(0)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {patient.firstName} {patient.lastName}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="mail-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {patient.user?.email || 'N/A'}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Ionicons name="call-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {patient.user?.phone || 'N/A'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className={`mb-4 px-4 py-3 rounded-xl flex-row items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <Ionicons name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        <TextInput
          placeholder="Search patients..."
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
        {filteredPatients.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="people-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No patients found
            </Text>
          </View>
        ) : (
          filteredPatients.map((patient) => (
            <PatientCard key={patient.userId} patient={patient} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SecretaryPatients;
