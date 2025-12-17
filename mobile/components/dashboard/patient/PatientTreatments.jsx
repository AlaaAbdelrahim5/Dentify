import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, EmptyState, LoadingSpinner } from '../../../components/dashboard';
import { useTheme } from '../../../contexts/ThemeContext';
// import { treatmentsAPI } from '../../../services/api';

const PatientTreatments = () => {
  const { isDarkMode } = useTheme();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('ongoing'); // ongoing, completed, all

  useEffect(() => {
    fetchTreatments();
  }, [selectedTab]);

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      // TODO: Uncomment when API is ready
      // const response = await treatmentsAPI.getPatientTreatments();
      // let allTreatments = response.treatments || [];
      
      // Mock data
      let allTreatments = [];
      
      // Filter based on tab
      if (selectedTab === 'ongoing') {
        allTreatments = allTreatments.filter(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING');
      } else if (selectedTab === 'completed') {
        allTreatments = allTreatments.filter(t => t.status === 'COMPLETED');
      }
      
      setTreatments(allTreatments);
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreatments();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-800' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    return colors[status] || colors.PENDING;
  };

  const getTreatmentIcon = (type) => {
    const icons = {
      'Root Canal': 'medical',
      'Teeth Cleaning': 'brush',
      'Dental Filling': 'construct',
      'Tooth Extraction': 'cut',
      'Crown': 'diamond',
      'Braces': 'grid',
      'Whitening': 'sunny',
      'Implant': 'flask'
    };
    return icons[type] || 'medical';
  };

  const getStats = () => {
    const total = treatments.length;
    const ongoing = treatments.filter(t => t.status === 'IN_PROGRESS' || t.status === 'PENDING').length;
    const completed = treatments.filter(t => t.status === 'COMPLETED').length;
    const totalCost = treatments.reduce((sum, t) => sum + parseFloat(t.totalCost || 0), 0);
    
    return { total, ongoing, completed, totalCost };
  };

  const stats = getStats();

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        <View className="p-4 space-y-4">
          {/* Header */}
          <View>
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              My Treatments
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your dental treatment progress
            </Text>
          </View>

          {/* Stats Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="medical" size={24} color="#3B82F6" />
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</Text>
            </View>

            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="play-circle" size={24} color="#F59E0B" />
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.ongoing}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ongoing</Text>
            </View>

            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.completed}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</Text>
            </View>

            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="cash" size={24} color="#10B981" />
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.totalCost)}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Cost</Text>
            </View>
          </ScrollView>

          {/* Filter Tabs */}
          <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {['ongoing', 'completed', 'all'].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                className={`flex-1 py-2 rounded-lg ${
                  selectedTab === tab
                    ? 'bg-teal-600'
                    : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    selectedTab === tab
                      ? 'text-white'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Treatments List */}
          {loading ? (
            <LoadingSpinner />
          ) : treatments.length > 0 ? (
            <View className="space-y-3">
              {treatments.map((treatment) => {
                const statusColors = getStatusColor(treatment.status);
                
                return (
                  <TouchableOpacity
                    key={treatment.id}
                    onPress={() => console.log('View treatment details')}
                  >
                    <Card>
                      <View className="flex-row items-start justify-between mb-3">
                        <View className="flex-row items-start flex-1">
                          <View className="w-12 h-12 rounded-full bg-teal-100 items-center justify-center mr-3">
                            <Ionicons 
                              name={getTreatmentIcon(treatment.treatmentType)} 
                              size={24} 
                              color="#14B8A6" 
                            />
                          </View>
                          <View className="flex-1">
                            <Text className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {treatment.treatmentType}
                            </Text>
                            {treatment.description && (
                              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {treatment.description}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View className={`px-3 py-1 rounded-full ${statusColors.bg}`}>
                          <Text className={`text-xs font-medium ${statusColors.text}`}>
                            {treatment.status.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>

                      <View className="space-y-2">
                        <View className="flex-row items-center">
                          <Ionicons name="person" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Dr. {treatment.dentist?.firstName} {treatment.dentist?.lastName}
                          </Text>
                        </View>

                        <View className="flex-row items-center">
                          <Ionicons name="calendar" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Started: {formatDate(treatment.startDate)}
                          </Text>
                        </View>

                        {treatment.endDate && (
                          <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Completed: {formatDate(treatment.endDate)}
                            </Text>
                          </View>
                        )}

                        <View className="flex-row items-center justify-between pt-2 border-t border-gray-200">
                          <View className="flex-row items-center">
                            <Ionicons name="cash" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Total Cost
                            </Text>
                          </View>
                          <Text className="text-lg font-bold text-teal-600">
                            {formatCurrency(treatment.totalCost)}
                          </Text>
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <EmptyState
              icon="medical-outline"
              title="No treatments found"
              message="Your treatment history will appear here"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientTreatments;
