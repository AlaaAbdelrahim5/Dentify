import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
import { useAppointments } from '../../../hooks';
import { createCancelHandler, createConfirmHandler, createCompleteHandler, createViewDetailsHandler, createSessionCostSaveHandler } from '../../../utils/appointmentHandlers';
import { AppointmentCard, FilterTabs, LoadingState, EmptyState } from '../shared';
import NewAppointmentModal from '../shared/NewAppointmentModal';
import SessionCostModal from '../shared/SessionCostModal';
import { Select } from '../../common';

const DentistAppointments = () => {
  const { isDarkMode } = useTheme();
  const [isNewAppointmentModalVisible, setIsNewAppointmentModalVisible] = useState(false);
  const [isSessionCostModalVisible, setIsSessionCostModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const {
    filteredAppointments,
    loading,
    refreshing,
    onRefresh,
    refetch,
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    activeView,
    setActiveView,
    stats,
    filterTabs
  } = useAppointments('dentist');

  const handleConfirmAppointment = createConfirmHandler({
    role: 'dentist',
    onSuccess: refetch
  });

  const handleCompleteAppointment = createCompleteHandler({
    setSelectedAppointment,
    setModalVisible: setIsSessionCostModalVisible
  });

  const handleSaveSessionCost = createSessionCostSaveHandler({
    selectedAppointment,
    setModalVisible: setIsSessionCostModalVisible,
    setSelectedAppointment,
    onSuccess: refetch
  });

  const handleCancelAppointment = createCancelHandler({
    role: 'dentist',
    onSuccess: refetch
  });

  const handleViewDetails = createViewDetailsHandler('dentist');

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

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
          placeholder="Search by patient or treatment..."
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

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={UI_COLORS.primary} />
        }
      >
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title={`No appointments ${activeView === 'today' ? 'today' : activeView === 'upcoming' ? 'upcoming' : 'pending'}`}
            message={searchTerm || selectedStatus !== 'all' ? 'Try adjusting your filters' : undefined}
            isDarkMode={isDarkMode}
          />
        ) : (
          filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isDarkMode={isDarkMode}
              role="dentist"
              onConfirm={appointment.status === 'PENDING' ? handleConfirmAppointment : undefined}
              onComplete={handleCompleteAppointment}
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
        onSuccess={refetch}
        userRole="dentist"
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

export default DentistAppointments;
