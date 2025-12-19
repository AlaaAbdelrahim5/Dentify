import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppointmentCard, FilterTabs, StatCard } from '../shared';
import { LoadingState, EmptyState } from '../shared';
import BookAppointmentModal from '../shared/BookAppointmentModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { appointmentsAPI } from '../../../services/api';
import { showErrorAlert } from '../../../utils/errorUtils';
import { createCancelHandler, createViewDetailsHandler, filterAppointments } from '../../../utils/appointmentHandlers';
import { Select } from '../../common';
import { UI_COLORS, COLORS } from '../../../utils/colors';

const PatientAppointments = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, all
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isBookModalVisible, setIsBookModalVisible] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getMyAppointments();
      setAppointments(response.appointments || []);
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

  const handleCancelAppointment = createCancelHandler({
    role: 'patient',
    onSuccess: fetchAppointments
  });

  const handleViewDetails = createViewDetailsHandler('patient');

  // Separate appointments into upcoming and past
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.startTime) >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.startTime) < now || apt.status === 'COMPLETED' || apt.status === 'CANCELLED')
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [appointments]);

  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  // Filtered appointments based on search and status
  const filteredAppointments = useMemo(() => {
    return filterAppointments(displayAppointments, searchTerm, selectedStatus, 'patient');
  }, [displayAppointments, searchTerm, selectedStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    return [
      { label: 'Upcoming', value: upcomingAppointments.length, color: 'bg-teal-500' },
      { label: 'Confirmed', value: upcomingAppointments.filter(a => a.status === 'CONFIRMED').length, color: 'bg-green-500' },
      { label: 'Pending', value: upcomingAppointments.filter(a => a.status === 'PENDING').length, color: 'bg-yellow-500' },
      { label: 'Total Visits', value: pastAppointments.filter(a => a.status === 'COMPLETED').length, color: 'bg-blue-500' }
    ];
  }, [upcomingAppointments, pastAppointments]);

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  const filterTabs = [
    { id: 'upcoming', label: `Upcoming (${upcomingAppointments.length})` },
    { id: 'past', label: `Past (${pastAppointments.length})` }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <View className="flex-1 p-4">
      {/* Filter Tabs */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isDarkMode={isDarkMode}
      />

      {/* Search Bar */}
      <View className={`mb-3 p-3 rounded-xl flex-row items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 1 }}>
        <Ionicons name="search" size={20} color={isDarkMode ? UI_COLORS.iconGrayLight : UI_COLORS.iconGray} />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by dentist or treatment..."
          placeholderTextColor={isDarkMode ? UI_COLORS.placeholderDark : UI_COLORS.placeholderLight}
          className={`flex-1 ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
        />
      </View>

      {/* Status Filter */}
      <View className="mb-3">
        <Select
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          options={statusOptions}
          placeholder="Filter by Status"
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={UI_COLORS.primary} />
        }
      >
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isDarkMode={isDarkMode}
              role="patient"
              onCancel={handleCancelAppointment}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No appointments found"
            message={searchTerm || selectedStatus !== 'all' ? 'Try adjusting your filters' : 'Book your first appointment to get started'}
            isDarkMode={isDarkMode}
          />
        )}
      </ScrollView>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        visible={isBookModalVisible}
        onClose={() => setIsBookModalVisible(false)}
        onSuccess={fetchAppointments}
      />
    </View>
  );
};

export default PatientAppointments;
