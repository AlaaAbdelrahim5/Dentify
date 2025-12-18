import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';

const DentistAppointments = () => {
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('today');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/dentist/mine');
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load appointments';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const todayAppointments = useMemo(() => {
    const today = new Date().toDateString();
    return appointments.filter(apt => 
      new Date(apt.appointmentDateTime).toDateString() === today
    );
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    return appointments.filter(apt => 
      new Date(apt.appointmentDateTime) > today &&
      apt.status !== 'CANCELLED'
    );
  }, [appointments]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'COMPLETED': return 'bg-blue-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const AppointmentCard = ({ appointment }) => (
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
            {appointment.patient?.firstName} {appointment.patient?.lastName}
          </Text>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {appointment.treatmentType || 'General Checkup'}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
          <Text className="text-white text-xs font-medium">{appointment.status}</Text>
        </View>
      </View>
      
      <View className="flex-row items-center mt-2">
        <Ionicons name="time-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
        <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {new Date(appointment.appointmentDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {appointment.notes && (
        <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {appointment.notes}
        </Text>
      )}
    </View>
  );

  const currentAppointments = activeView === 'today' ? todayAppointments : upcomingAppointments;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row mb-4" style={{ gap: 8 }}>
        <TouchableOpacity
          onPress={() => setActiveView('today')}
          className={`flex-1 py-3 rounded-xl ${activeView === 'today' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`text-center font-semibold ${activeView === 'today' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            Today ({todayAppointments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveView('upcoming')}
          className={`flex-1 py-3 rounded-xl ${activeView === 'upcoming' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`text-center font-semibold ${activeView === 'upcoming' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            Upcoming ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentAppointments.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="calendar-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No appointments {activeView === 'today' ? 'today' : 'upcoming'}
            </Text>
          </View>
        ) : (
          currentAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DentistAppointments;
