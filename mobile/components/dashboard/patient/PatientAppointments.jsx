import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { AppointmentCard, FilterTabs } from '../shared';
import { LoadingState, EmptyState } from '../shared';
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

  const getStats = () => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
    const pending = appointments.filter(a => a.status === 'PENDING').length;
    const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
    
    return { total, confirmed, pending, cancelled };
  };

  const stats = getStats();

  const currentAppointments = activeTab === 'upcoming' ? 
    appointments.filter(apt => apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED') : 
    appointments;

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  const filterTabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'all', label: 'All' }
  ];

  return (
    <View className="flex-1 p-4">
      <FilterTabs
        tabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        {currentAppointments.length > 0 ? (
          currentAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isDarkMode={isDarkMode}
              role="patient"
            />
          ))
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No appointments found"
            message="Book your first appointment to get started"
            isDarkMode={isDarkMode}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default PatientAppointments;
