import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatsCard, StatusBadge, EmptyState, LoadingSpinner } from '../../../components/dashboard';
import { authUtils } from '../../../utils/auth';
// import { appointmentsAPI, patientsAPI, dentistsAPI } from '../../../services/api'; // Uncomment when API is ready

const SecretaryOverview = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayTotal: 0,
    pending: 0,
    confirmed: 0,
    totalPatients: 0,
    totalDentists: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchAllData();
  }, []);

  const loadUserData = async () => {
    const user = await authUtils.getCurrentUser();
    setUserData(user);
  };

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Uncomment when API is ready
      // const [appointmentsRes, dentistsRes] = await Promise.allSettled([
      //   appointmentsAPI.getClinicAppointments(),
      //   dentistsAPI.getForClinic()
      // ]);
      
      // Mock data for demonstration
      const appointments = [];
      const dentists = [];
      
      // Filter today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppts = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
      }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      // Calculate unique patients
      const uniquePatientIds = new Set();
      appointments.forEach(apt => {
        if (apt.patientId) {
          uniquePatientIds.add(apt.patientId);
        }
      });
      
      setTodayAppointments(todayAppts);
      setStats({
        todayTotal: todayAppts.length,
        pending: todayAppts.filter(a => a.status === 'PENDING').length,
        confirmed: todayAppts.filter(a => a.status === 'CONFIRMED').length,
        totalPatients: uniquePatientIds.size,
        totalDentists: dentists.length,
      });
    } catch (error) {
      console.error('Error fetching secretary data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authUtils.logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Logout */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <View>
          <Text className="text-xl font-bold text-gray-800">Dashboard</Text>
          <Text className="text-xs text-gray-500">Secretary Portal</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center bg-red-50 px-4 py-2 rounded-lg"
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text className="text-red-600 font-semibold ml-2">Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#14B8A6']} />
        }
      >
        <View className="p-4 space-y-4">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 p-6">
            <View>
              <Text className="text-2xl font-bold text-white mb-2">
                Welcome, {userData?.firstName || 'Secretary'}!
              </Text>
              <Text className="text-sm text-white/90">
                {userData?.clinic?.clinicName || 'Clinic'}
              </Text>
              <Text className="text-xs text-white/80 mt-1">
                {getTodayDate()}
              </Text>
            </View>
          </Card>

          {/* Stats Overview */}
          <View>
            <Text className="text-lg font-bold text-gray-800 mb-3 px-1">Clinic Overview</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
              <StatsCard
                icon="calendar"
                label="Today's Appointments"
                value={stats.todayTotal}
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
              <StatsCard
                icon="people"
                label="Total Patients"
                value={stats.totalPatients}
                gradient="from-purple-600 to-pink-600"
              />
              <StatsCard
                icon="medkit"
                label="Dentists"
                value={stats.totalDentists}
                gradient="from-teal-600 to-cyan-600"
              />
            </ScrollView>
          </View>

          {/* Today's Schedule */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Today's Schedule</Text>
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
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-full bg-teal-100 items-center justify-center mr-3">
                          <Ionicons name="time" size={20} color="#14B8A6" />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center mb-1">
                            <Text className="font-semibold text-gray-800">
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </Text>
                            <View className="ml-2">
                              <StatusBadge status={appointment.status.toLowerCase()} />
                            </View>
                          </View>
                          <Text className="text-sm text-gray-600">
                            with Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                          </Text>
                          {appointment.patient?.user?.phone && (
                            <View className="flex-row items-center mt-1">
                              <Ionicons name="call-outline" size={12} color="#6B7280" />
                              <Text className="text-xs text-gray-500 ml-1">
                                {appointment.patient.user.phone}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View className="items-end ml-2">
                        <Text className="text-lg font-bold text-teal-600">
                          {formatTime(appointment.startTime)}
                        </Text>
                        {appointment.reason && (
                          <Text className="text-xs text-gray-500 mt-1">
                            {appointment.reason}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="calendar-outline"
                title="No appointments today"
                message="No appointments scheduled for today"
              />
            )}
          </Card>

          {/* Quick Actions */}
          <View className="space-y-3">
            <Text className="text-lg font-bold text-gray-800 px-1">Quick Actions</Text>
            
            <View className="space-y-3">
              <TouchableOpacity>
                <Card className="flex-row items-center p-4">
                  <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-4">
                    <Ionicons name="calendar-outline" size={24} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">Manage Appointments</Text>
                    <Text className="text-sm text-gray-600">Schedule and organize</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Card>
              </TouchableOpacity>

              <TouchableOpacity>
                <Card className="flex-row items-center p-4">
                  <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mr-4">
                    <Ionicons name="people-outline" size={24} color="#9333EA" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">Patient Records</Text>
                    <Text className="text-sm text-gray-600">View and manage patients</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Card>
              </TouchableOpacity>

              <TouchableOpacity>
                <Card className="flex-row items-center p-4">
                  <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-4">
                    <Ionicons name="cash-outline" size={24} color="#16A34A" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">Payments</Text>
                    <Text className="text-sm text-gray-600">Process and track payments</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Card>
              </TouchableOpacity>

              <TouchableOpacity>
                <Card className="flex-row items-center p-4">
                  <View className="w-12 h-12 rounded-full bg-teal-100 items-center justify-center mr-4">
                    <Ionicons name="medkit-outline" size={24} color="#14B8A6" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-800">Dentists</Text>
                    <Text className="text-sm text-gray-600">View dentist schedules</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </Card>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SecretaryOverview;
