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

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        <View className="p-4 space-y-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                My Appointments
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your dental appointments
              </Text>
            </View>
            <TouchableOpacity 
              className="bg-teal-600 px-4 py-3 rounded-xl flex-row items-center"
              onPress={() => console.log('Book appointment')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1">Book</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="calendar" size={24} color="#3B82F6" />
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</Text>
            </View>

            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.confirmed}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirmed</Text>
            </View>

            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="time" size={24} color="#F59E0B" />
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pending}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</Text>
            </View>
          </ScrollView>

          {/* Tabs */}
          <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {['upcoming', 'past', 'all'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg ${
                  activeTab === tab
                    ? 'bg-teal-600'
                    : isDarkMode ? 'bg-transparent' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    activeTab === tab
                      ? 'text-white'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Appointments List */}
          {loading ? (
            <LoadingSpinner />
          ) : appointments.length > 0 ? (
            <View className="space-y-3">
              {appointments.map((appointment) => {
                const { date, time, day } = formatDateTime(appointment.startTime);
                
                return (
                  <TouchableOpacity
                    key={appointment.id}
                    onPress={() => console.log('View appointment details')}
                  >
                    <Card>
                      <View className="flex-row">
                        {/* Date Badge */}
                        <View className="bg-teal-100 rounded-xl p-3 items-center justify-center mr-4">
                          <Text className="text-xs font-semibold text-teal-600">{day}</Text>
                          <Text className="text-lg font-bold text-teal-700">{date.split(' ')[1]}</Text>
                          <Text className="text-xs text-teal-600">{date.split(' ')[0]}</Text>
                        </View>

                        {/* Appointment Details */}
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between mb-2">
                            <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {appointment.treatment?.treatmentType || 'Consultation'}
                            </Text>
                            <StatusBadge status={appointment.status.toLowerCase()} />
                          </View>

                          <View className="space-y-1">
                            <View className="flex-row items-center">
                              <Ionicons name="person" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                              </Text>
                            </View>

                            <View className="flex-row items-center">
                              <Ionicons name="time" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {time}
                              </Text>
                            </View>

                            {appointment.clinic && (
                              <View className="flex-row items-center">
                                <Ionicons name="location" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                                <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {appointment.clinic.clinicName}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title={`No ${activeTab} appointments`}
              message="Book an appointment with your dentist"
              actionText="Book Appointment"
              onAction={() => console.log('Book appointment')}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientAppointments;
