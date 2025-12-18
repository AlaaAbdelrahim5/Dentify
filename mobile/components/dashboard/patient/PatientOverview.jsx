import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { authUtils } from '../../../utils/auth';
import { formatDateTime } from '../../../utils/dateUtils';
import { WelcomeCard, LoadingState, EmptyState, StatusBadge, SectionHeader, InfoRow } from '../shared/OverviewComponents';
import { appointmentsAPI } from '../../../services/api';

const PatientOverview = () => {
  const { isDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await authUtils.getCurrentUser();
      setUserData(user);

      const response = await appointmentsAPI.getMyAppointments();
      const appointments = response.data || [];

      const now = new Date();
      const upcoming = appointments
        .filter(apt => new Date(apt.appointmentDate) >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED')
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 3);

      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-4" style={{ gap: 16 }}>
        {/* Welcome Card */}
        <WelcomeCard
          greeting={`Welcome back, ${userData?.firstName || 'there'}!`}
          subtitle={userData?.city || 'Manage your dental health'}
          isDarkMode={isDarkMode}
        />

        {/* Upcoming Appointments */}
        <View
          className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{ elevation: 3 }}
        >
          <SectionHeader title="Next Appointments" onViewAll={true} isDarkMode={isDarkMode} />

          {isLoading ? (
            <LoadingState isDarkMode={isDarkMode} />
          ) : upcomingAppointments.length > 0 ? (
            <View style={{ gap: 12 }}>
              {upcomingAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.startTime);
                return (
                  <TouchableOpacity
                    key={appointment.id}
                    className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <View className="flex-row items-start justify-between mb-3">
                      <Text className={`font-semibold flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointment.treatment?.treatmentType || 'Appointment'}
                      </Text>
                      <StatusBadge status={appointment.status} isDarkMode={isDarkMode} />
                    </View>

                    <View style={{ gap: 8 }}>
                      <InfoRow
                        icon="person-outline"
                        text={`Dr. ${appointment.dentist?.firstName} ${appointment.dentist?.lastName}`}
                        isDarkMode={isDarkMode}
                      />
                      <InfoRow
                        icon="calendar-outline"
                        text={`${date} at ${time}`}
                        isDarkMode={isDarkMode}
                      />
                      {appointment.clinic && (
                        <InfoRow
                          icon="location-outline"
                          text={appointment.clinic.clinicName}
                          isDarkMode={isDarkMode}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No appointments scheduled"
              message="Book an appointment with your dentist"
              isDarkMode={isDarkMode}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default PatientOverview;
