import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';
import { showErrorAlert } from '../../../utils/errorUtils';
import { filterTodayAppointments, filterUpcomingAppointments } from '../../../utils/filterUtils';
import { AppointmentCard, FilterTabs, LoadingState, EmptyState } from '../shared';

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
      showErrorAlert(error, 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const todayAppointments = useMemo(() => filterTodayAppointments(appointments), [appointments]);

  const upcomingAppointments = useMemo(() => filterUpcomingAppointments(appointments), [appointments]);



  const currentAppointments = activeView === 'today' ? todayAppointments : upcomingAppointments;

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  const filterTabs = [
    { id: 'today', label: `Today (${todayAppointments.length})` },
    { id: 'upcoming', label: `Upcoming (${upcomingAppointments.length})` }
  ];

  return (
    <View className="flex-1 p-4">
      <FilterTabs
        tabs={filterTabs}
        activeTab={activeView}
        onTabChange={setActiveView}
        isDarkMode={isDarkMode}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        {currentAppointments.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={`No appointments ${activeView === 'today' ? 'today' : 'upcoming'}`}
            isDarkMode={isDarkMode}
          />
        ) : (
          currentAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isDarkMode={isDarkMode}
              role="dentist"
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DentistAppointments;
