import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { authUtils } from '../../../utils/auth';
import { formatTime } from '../../../utils/dateUtils';
import { WelcomeCard, StatCard, LoadingState, EmptyState, StatusBadge, SectionHeader } from '../shared/OverviewComponents';
import { appointmentsAPI } from '../../../services/api';

const DentistOverview = () => {
  const { isDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({ today: 0, pending: 0, confirmed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await authUtils.getCurrentUser();
      console.log('DentistOverview - User data:', user);
      setUserData(user);

      const response = await appointmentsAPI.getDentistAppointments();
      const appointments = response.appointments || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayAppts = appointments
        .filter(apt => {
          const aptDate = new Date(apt.startTime);
          aptDate.setHours(0, 0, 0, 0);
          return aptDate.getTime() === today.getTime();
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      setTodayAppointments(todayAppts);
      setStats({
        today: todayAppts.length,
        pending: todayAppts.filter(a => a.status === 'PENDING').length,
        confirmed: todayAppts.filter(a => a.status === 'CONFIRMED').length,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return (
      <View className="flex-1 items-center justify-center">
        <LoadingState isDarkMode={isDarkMode} message="Loading overview..." />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-4" style={{ gap: 16 }}>
        {/* Welcome Card */}
        <WelcomeCard
          greeting={`Welcome, Dr. ${userData?.dentist?.firstName || 'Doctor'}!`}
          subtitle={userData?.dentist?.clinic?.clinicName || 'Private Practice'}
          isDarkMode={isDarkMode}
        />

        {/* Stats */}
        <View>
          <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Today's Overview
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <StatCard icon="calendar" label="Total Appointments" value={stats.today} colors={['#2563EB', '#06B6D4']} />
            <StatCard icon="time" label="Pending" value={stats.pending} colors={['#F59E0B', '#F97316']} />
            <StatCard icon="checkmark-circle" label="Confirmed" value={stats.confirmed} colors={['#10B981', '#14B8A6']} />
          </ScrollView>
        </View>

        {/* Today's Schedule */}
        <View className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 3 }}>
          <SectionHeader title="Today's Schedule" onViewAll={true} isDarkMode={isDarkMode} />

          {todayAppointments.length > 0 ? (
            <View style={{ gap: 12 }}>
              {todayAppointments.slice(0, 5).map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </Text>
                      <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {appointment.treatment?.treatmentType || 'Consultation'}
                      </Text>
                      {appointment.patient?.user?.phone && (
                        <View className="flex-row items-center mt-2">
                          <Ionicons name="call-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          <Text className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {appointment.patient.user.phone}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="items-end ml-3">
                      <Text className="text-lg font-bold text-teal-600">{formatTime(appointment.startTime)}</Text>
                      <View className="mt-1">
                        <StatusBadge status={appointment.status} isDarkMode={isDarkMode} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No appointments today"
              message="You have a free day ahead"
              isDarkMode={isDarkMode}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default DentistOverview;
