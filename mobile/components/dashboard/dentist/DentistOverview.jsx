import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatsCard, StatusBadge, EmptyState, LoadingSpinner } from '../../../components/dashboard';
import { authUtils } from '../../../utils/auth';
import { useTheme } from '../../../contexts/ThemeContext';
// import { appointmentsAPI } from '../../../services/api'; // Uncomment when API is ready

const DentistOverview = () => {
  const { isDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    confirmed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    fetchAppointments();
  }, []);

  const loadUserData = async () => {
    const user = await authUtils.getCurrentUser();
    setUserData(user);
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Uncomment when API is ready
      // const response = await appointmentsAPI.getMyAppointments();
      // const appointments = response.data || [];
      
      // Mock data for demonstration
      const appointments = [];
      
      // Filter today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppts = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      setTodayAppointments(todayAppts);
      setStats({
        today: todayAppts.length,
        pending: todayAppts.filter(a => a.status === 'PENDING').length,
        confirmed: todayAppts.filter(a => a.status === 'CONFIRMED').length,
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <View className="p-4 space-y-4">
          {/* Welcome Card */}
          <View className="rounded-xl overflow-hidden shadow-md">
            <LinearGradient
              colors={isDarkMode ? ['#0D9488', '#0891B2'] : ['#0D9488', '#0891B2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 24 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white mb-2">
                    Welcome, Dr. {userData?.firstName || 'Doctor'}!
                  </Text>
                  <Text style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.9)' }}>
                    {userData?.clinic?.clinicName || 'Private Practice'}
                  </Text>
                </View>
                <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                  <Ionicons name="medkit" size={32} color="white" />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Overview */}
          <View>
            <Text className={`text-lg font-bold mb-3 px-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Today's Overview</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
              <StatsCard
                icon="calendar"
                label="Total Appointments"
                value={stats.today}
                gradient="from-blue-600 to-cyan-600"
              />
              <StatsCard
                icon="time"
                label="Pending"
                value={stats.pending}
                gradient="from-yellow-600 to-orange-600"
              />
              <StatsCard
                icon="checkmark-circle"
                label="Confirmed"
                value={stats.confirmed}
                gradient="from-green-600 to-teal-600"
              />
            </ScrollView>
          </View>

          {/* Today's Schedule */}
          <View className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Today's Schedule</Text>
              <TouchableOpacity>
                <Text className="text-sm text-teal-600 font-medium">View All</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <LoadingSpinner />
            ) : todayAppointments.length > 0 ? (
              <View className="space-y-3">
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <TouchableOpacity
                    key={appointment.id}
                    className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-1">
                        <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {appointment.patient?.firstName} {appointment.patient?.lastName}
                        </Text>
                        <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {appointment.treatment?.treatmentType || 'Consultation'}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-teal-600">
                          {formatTime(appointment.startTime)}
                        </Text>
                        <View className="mt-1">
                          <StatusBadge status={appointment.status.toLowerCase()} />
                        </View>
                      </View>
                    </View>
                    
                    {appointment.patient?.user?.phone && (
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="call-outline" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`text-xs ml-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {appointment.patient.user.phone}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="calendar-outline"
                title="No appointments today"
                message="You have a free day ahead"
              />
            )}
          </View>
    </View>
  );
};

export default DentistOverview;
