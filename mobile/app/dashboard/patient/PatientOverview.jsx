import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatusBadge, EmptyState, LoadingSpinner } from '../../../components/dashboard';
import { authUtils } from '../../../utils/auth';
// import { appointmentsAPI } from '../../../services/api'; // Uncomment when API is ready

const PatientOverview = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      // const appointments = response.data || response.appointments || [];
      
      // Mock data for demonstration
      const appointments = [];
      
      // Filter upcoming appointments
      const now = new Date();
      const upcoming = appointments
        .filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= now && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED';
        })
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 3);
      
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const getUserFirstName = () => {
    if (userData?.firstName) {
      return userData.firstName;
    }
    return 'there';
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Logout */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <View>
          <Text className="text-xl font-bold text-gray-800">Dashboard</Text>
          <Text className="text-xs text-gray-500">Patient Portal</Text>
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
          <Card className="bg-gradient-to-br from-teal-500 to-cyan-500 p-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white mb-2">
                  Welcome back, {getUserFirstName()}!
                </Text>
                {userData?.city && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="location-outline" size={14} color="white" />
                    <Text className="text-sm text-white ml-1">{userData.city}</Text>
                  </View>
                )}
              </View>
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center">
                <Ionicons name="person" size={32} color="white" />
              </View>
            </View>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Next Appointments</Text>
              <TouchableOpacity>
                <Text className="text-sm text-teal-600 font-medium">View All</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <LoadingSpinner />
            ) : upcomingAppointments.length > 0 ? (
              <View className="space-y-3">
                {upcomingAppointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.startTime);
                  
                  return (
                    <View
                      key={appointment.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <View className="flex-row items-start justify-between mb-2">
                        <Text className="font-semibold text-gray-800 flex-1">
                          {appointment.treatment?.treatmentType || 'Appointment'}
                        </Text>
                        <StatusBadge status={appointment.status.toLowerCase()} />
                      </View>
                      
                      <View className="space-y-1">
                        <View className="flex-row items-center">
                          <Ionicons name="person-outline" size={16} color="#6B7280" />
                          <Text className="text-sm text-gray-600 ml-2">
                            Dr. {appointment.dentist?.firstName} {appointment.dentist?.lastName}
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                          <Text className="text-sm text-gray-600 ml-2">
                            {date} at {time}
                          </Text>
                        </View>
                        
                        {appointment.clinic && (
                          <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={16} color="#6B7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                              {appointment.clinic.clinicName}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <EmptyState
                icon="calendar-outline"
                title="No appointments scheduled"
                message="Book an appointment with your dentist"
                actionText="Book Appointment"
                onAction={() => {
                  // TODO: Navigate to appointments page
                  console.log('Navigate to appointments');
                }}
              />
            )}
          </Card>

          {/* Quick Actions */}
          <View className="space-y-3">
            <Text className="text-lg font-bold text-gray-800 px-1">Quick Actions</Text>
            
            <View className="flex-row space-x-3">
              <TouchableOpacity className="flex-1">
                <Card className="items-center py-4">
                  <View className="w-12 h-12 rounded-full bg-teal-100 items-center justify-center mb-2">
                    <Ionicons name="calendar" size={24} color="#14B8A6" />
                  </View>
                  <Text className="text-sm font-medium text-gray-700">Book</Text>
                  <Text className="text-xs text-gray-500">Appointment</Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1">
                <Card className="items-center py-4">
                  <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-2">
                    <Ionicons name="search" size={24} color="#3B82F6" />
                  </View>
                  <Text className="text-sm font-medium text-gray-700">Find</Text>
                  <Text className="text-xs text-gray-500">Dentist</Text>
                </Card>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1">
                <Card className="items-center py-4">
                  <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-2">
                    <Ionicons name="document-text" size={24} color="#9333EA" />
                  </View>
                  <Text className="text-sm font-medium text-gray-700">My</Text>
                  <Text className="text-xs text-gray-500">Records</Text>
                </Card>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PatientOverview;
