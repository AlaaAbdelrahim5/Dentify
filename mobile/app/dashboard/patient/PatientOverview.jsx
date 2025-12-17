import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatusBadge, EmptyState, LoadingSpinner } from '../../../components/dashboard';
import { authUtils } from '../../../utils/auth';
import { useTheme } from '../../../contexts/ThemeContext';
// import { appointmentsAPI } from '../../../services/api'; // Uncomment when API is ready

const PatientOverview = () => {
  const { isDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
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
    }
  };

  const getUserFirstName = () => {
    if (userData?.firstName) {
      return userData.firstName;
    }
    return 'there';
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  return (
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
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Next Appointments</Text>
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
    </View>
  );
};

export default PatientOverview;
