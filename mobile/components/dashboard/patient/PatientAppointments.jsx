import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, TextInput, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppointmentCard, FilterTabs, StatCard } from '../shared';
import { LoadingState, EmptyState } from '../shared';
import BookAppointmentModal from '../shared/modals/BookAppointmentModal';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAppointments } from '../../../hooks';
import { createCancelHandler, createViewDetailsHandler } from '../../../utils/appointmentHandlers';
import { Select } from '../../common';
import { UI_COLORS, COLORS } from '../../../utils/colors';

const PatientAppointments = () => {
  const { isDarkMode } = useTheme();
  const [isBookModalVisible, setIsBookModalVisible] = useState(false);

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
    activeView: activeTab,
    setActiveView: setActiveTab,
    stats,
    filterTabs
  } = useAppointments('patient');

  const handleCancelAppointment = createCancelHandler({
    role: 'patient',
    onSuccess: refetch
  });

  const handleViewDetails = createViewDetailsHandler('patient');

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
        onSuccess={refetch}
      />
    </View>
  );
};

export default PatientAppointments;
