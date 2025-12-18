import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatusBadge, EmptyState, LoadingSpinner } from '../../../components/dashboard';
import { useTheme } from '../../../contexts/ThemeContext';
// import { appointmentsAPI } from '../../../services/api';

const PatientAppointments = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, all
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // TODO: Uncomment when API is ready
      // const response = await appointmentsAPI.getMyAppointments();
      // const allAppointments = response.appointments || [];
      
      // Mock data
      const allAppointments = [];
      
      // Filter based on active tab
      const now = new Date();
      let filtered = allAppointments;
      
      if (activeTab === 'upcoming') {
        filtered = allAppointments.filter(apt => new Date(apt.startTime) >= now && apt.status !== 'CANCELLED');
      } else if (activeTab === 'past') {
        filtered = allAppointments.filter(apt => new Date(apt.startTime) < now || apt.status === 'COMPLETED');
      }
      
      setAppointments(filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      day: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };

  const getStats = () => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
    const pending = appointments.filter(a => a.status === 'PENDING').length;
    const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
    
    return { total, confirmed, pending, cancelled };
  };

  const stats = getStats();

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
            Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
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
          {new Date(appointment.appointmentDateTime).toLocaleString()}
        </Text>
      </View>

      {appointment.notes && (
        <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {appointment.notes}
        </Text>
      )}
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'COMPLETED': return 'bg-blue-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const currentAppointments = activeTab === 'upcoming' ? 
    appointments.filter(apt => apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED') : 
    appointments;

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
          onPress={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 rounded-xl ${activeTab === 'upcoming' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`text-center font-semibold ${activeTab === 'upcoming' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          className={`flex-1 py-3 rounded-xl ${activeTab === 'all' ? 'bg-teal-500' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}`}
        >
          <Text className={`text-center font-semibold ${activeTab === 'all' ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        {currentAppointments.length > 0 ? (
          currentAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="calendar-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-lg font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No appointments found
            </Text>
            <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Book your first appointment to get started
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PatientAppointments;
