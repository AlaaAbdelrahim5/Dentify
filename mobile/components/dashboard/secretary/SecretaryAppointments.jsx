import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
import { appointmentsAPI, dentistsAPI } from '../../../services/api';
import { showErrorAlert } from '../../../utils/errorUtils';
import { filterTodayAppointments, filterUpcomingAppointments } from '../../../utils/filterUtils';
import { createCancelHandler, createConfirmHandler, createCompleteHandler, createViewDetailsHandler, createSessionCostSaveHandler } from '../../../utils/appointmentHandlers';
import { AppointmentCard, FilterTabs, LoadingState, EmptyState } from '../shared';
import NewAppointmentModal from '../shared/NewAppointmentModal';
import SessionCostModal from '../shared/SessionCostModal';
import { Select } from '../../common';

const SecretaryAppointments = () => {
  const { isDarkMode } = useTheme();
  const [activeView, setActiveView] = useState('today');
  const [appointments, setAppointments] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDentist, setSelectedDentist] = useState('all');
  const [isNewAppointmentModalVisible, setIsNewAppointmentModalVisible] = useState(false);
  const [isSessionCostModalVisible, setIsSessionCostModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchDentists();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentsAPI.getClinicAppointments();
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showErrorAlert(error, 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDentists = async () => {
    try {
      const response = await dentistsAPI.getForClinic();
      setDentists(response.data || []);
    } catch (error) {
      console.error('Error fetching dentists:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleConfirmAppointment = createConfirmHandler({
    role: 'secretary',
    onSuccess: fetchAppointments
  });

  const handleCompleteAppointment = createCompleteHandler({
    setSelectedAppointment,
    setModalVisible: setIsSessionCostModalVisible
  });

  const handleSaveSessionCost = createSessionCostSaveHandler({
    selectedAppointment,
    setModalVisible: setIsSessionCostModalVisible,
    setSelectedAppointment,
    onSuccess: fetchAppointments
  });

  const handleCancelAppointment = createCancelHandler({
    role: 'secretary',
    onSuccess: fetchAppointments
  });

  const handleViewDetails = createViewDetailsHandler('secretary');

  const todayAppointments = useMemo(() => filterTodayAppointments(appointments), [appointments]);
  const upcomingAppointments = useMemo(() => filterUpcomingAppointments(appointments), [appointments]);
  
  const pendingAppointments = useMemo(() => {
    return appointments.filter(apt => apt.status === 'PENDING')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => {
        const aptEndTime = new Date(apt.endTime);
        return aptEndTime < now || apt.status === 'COMPLETED';
      })
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [appointments]);

  const allAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  }, [appointments]);

  const displayAppointments = useMemo(() => {
    switch (activeView) {
      case 'today':
        return todayAppointments;
      case 'pending':
        return pendingAppointments;
      case 'upcoming':
        return upcomingAppointments;
      case 'past':
        return pastAppointments;
      case 'all':
        return allAppointments;
      default:
        return todayAppointments;
    }
  }, [activeView, todayAppointments, pendingAppointments, upcomingAppointments, pastAppointments, allAppointments]);

  // Filter appointments by search, status, and dentist
  const filteredAppointments = useMemo(() => {
    return displayAppointments.filter(appointment => {
      const patientName = `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`;
      const dentistName = `Dr. ${appointment.dentist?.firstName || ''} ${appointment.dentist?.lastName || ''}`;
      const treatment = appointment.treatment?.treatmentType || '';
      
      const matchesSearch = searchTerm === '' || 
        treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dentistName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || appointment.status === selectedStatus;
      
      const matchesDentist = selectedDentist === 'all' || 
        appointment.dentist?.userId?.toString() === selectedDentist ||
        appointment.dentist?._id?.toString() === selectedDentist;

      return matchesSearch && matchesStatus && matchesDentist;
    });
  }, [displayAppointments, searchTerm, selectedStatus, selectedDentist]);

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  const filterTabs = [
    { id: 'today', label: `Today (${todayAppointments.length})` },
    { id: 'pending', label: `Pending (${pendingAppointments.length})` },
    { id: 'upcoming', label: `Upcoming (${upcomingAppointments.length})` },
    { id: 'past', label: `Past (${pastAppointments.length})` },
    { id: 'all', label: `All (${allAppointments.length})` }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const dentistOptions = [
    { value: 'all', label: 'All Dentists' },
    ...dentists.map((dentist) => ({
      value: (dentist._id || dentist.userId).toString(),
      label: `Dr. ${dentist.firstName} ${dentist.lastName}`
    }))
  ];

  // Calculate stats
  const stats = [
    { label: 'Today', value: todayAppointments.length },
    { label: 'Pending', value: pendingAppointments.length },
    { label: 'Upcoming', value: upcomingAppointments.length },
    { label: 'Past', value: pastAppointments.length },
    { label: 'All', value: allAppointments.length }
  ];

  return (
    <View className="flex-1 p-4">
      {/* Filter Tabs */}
      <FilterTabs
        tabs={filterTabs}
        activeTab={activeView}
        onTabChange={setActiveView}
        isDarkMode={isDarkMode}
      />

      {/* Search Bar */}
      <View className={`mb-3 p-3 rounded-xl flex-row items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 1 }}>
        <Ionicons name="search" size={20} color={isDarkMode ? UI_COLORS.iconGrayLight : UI_COLORS.iconGray} />
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search by patient, dentist, or treatment..."
          placeholderTextColor={isDarkMode ? UI_COLORS.iconGray : UI_COLORS.placeholderLight}
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

      {/* Dentist Filter */}
      <View className="mb-3">
        <Select
          value={selectedDentist}
          onValueChange={setSelectedDentist}
          options={dentistOptions}
          placeholder="Filter by Dentist"
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={UI_COLORS.primary} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={`No appointments found`}
            message={searchTerm || selectedStatus !== 'all' || selectedDentist !== 'all' ? 'Try adjusting your filters' : undefined}
            isDarkMode={isDarkMode}
          />
        ) : (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isDarkMode={isDarkMode}
              role="secretary"
              onConfirm={(appointment.status === 'PENDING' || appointment.status === 'SCHEDULED') ? handleConfirmAppointment : undefined}
              onComplete={appointment.status === 'CONFIRMED' ? handleCompleteAppointment : undefined}
              onCancel={handleCancelAppointment}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </ScrollView>

      {/* Modals */}
      <NewAppointmentModal
        visible={isNewAppointmentModalVisible}
        onClose={() => setIsNewAppointmentModalVisible(false)}
        onSuccess={fetchAppointments}
        userRole="secretary"
      />

      <SessionCostModal
        visible={isSessionCostModalVisible}
        onClose={() => {
          setIsSessionCostModalVisible(false);
          setSelectedAppointment(null);
        }}
        onSave={handleSaveSessionCost}
        appointmentInfo={selectedAppointment ? {
          patientName: `${selectedAppointment.patient?.firstName} ${selectedAppointment.patient?.lastName}`,
          treatment: selectedAppointment.treatment?.treatmentType || 'General Consultation'
        } : null}
      />
    </View>
  );
};

export default SecretaryAppointments;
