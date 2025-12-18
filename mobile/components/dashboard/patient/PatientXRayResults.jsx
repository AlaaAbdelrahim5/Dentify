import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS, getStatusColors } from '../../../utils/colors';
import { formatDate } from '../../../utils/dateUtils';
import { LoadingState, EmptyState, FilterTabs } from '../shared';
import { patientsAPI } from '../../../services/api';

const PatientXRayResults = () => {
  const { isDarkMode } = useTheme();
  const [xrays, setXrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, reviewed, pending

  useEffect(() => {
    fetchXRays();
  }, []);

  const fetchXRays = async () => {
    try {
      setLoading(true);
      const response = await patientsAPI.getMyRadiologyRequests();
      setXrays(response.data || response.radiologyRequests || []);
    } catch (error) {
      console.error('Error fetching x-rays:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchXRays();
  };

  const filteredXrays = xrays.filter(xray => {
    if (selectedFilter === 'all') return true;
    return xray.status === selectedFilter;
  });

  const filterTabs = [
    { id: 'all', label: `All (${xrays.length})` },
    { id: 'REQUESTED', label: `Requested (${xrays.filter(x => x.status === 'REQUESTED').length})` },
    { id: 'COMPLETED', label: `Completed (${xrays.filter(x => x.status === 'COMPLETED').length})` }
  ];

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <FilterTabs 
        tabs={filterTabs}
        activeTab={selectedFilter}
        onTabChange={setSelectedFilter}
        isDarkMode={isDarkMode}
      />

      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={UI_COLORS.primary}
          />
        }
      >
        {filteredXrays.length > 0 ? (
          <View>
              {filteredXrays.map((xray) => (
                <View
                  key={xray.id}
                  className={`p-4 rounded-xl mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                  style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3
                  }}
                >
                    <View className="flex-row items-start justify-between mb-2">
                      <Text className={`font-semibold text-base flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {xray.type || 'Dental X-Ray'}
                      </Text>
                      <View 
                        className="px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: getStatusColors(xray.status, isDarkMode).bg,
                          borderWidth: 1,
                          borderColor: getStatusColors(xray.status, isDarkMode).border
                        }}
                      >
                        <Text 
                          className="text-xs font-medium"
                          style={{ color: getStatusColors(xray.status, isDarkMode).text }}
                        >
                          {xray.status}
                        </Text>
                      </View>
                    </View>

                    {xray.toothNumber && (
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="tooth" size={12} color={isDarkMode ? UI_COLORS.iconGrayLight : UI_COLORS.iconGray} />
                        <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Tooth #{xray.toothNumber}
                        </Text>
                      </View>
                    )}

                    <View className="flex-row items-center mb-1">
                      <Ionicons name="person" size={12} color={isDarkMode ? UI_COLORS.iconGrayLight : UI_COLORS.iconGray} />
                      <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Dr. {xray.dentist?.firstName} {xray.dentist?.lastName}
                      </Text>
                    </View>

                    <View className="flex-row items-center mb-1">
                      <Ionicons name="business-outline" size={12} color={isDarkMode ? UI_COLORS.iconGrayLight : UI_COLORS.iconGray} />
                      <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {xray.radiologyCenter?.centerName || xray.radiology?.centerName || 'N/A'}
                      </Text>
                    </View>

                    <View className="flex-row items-center">
                      <Ionicons name="calendar" size={12} color={isDarkMode ? UI_COLORS.iconGrayLight : UI_COLORS.iconGray} />
                      <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatDate(xray.requestDate)}
                      </Text>
                    </View>

                    {xray.notes && (
                      <View className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Text className="font-medium">Notes: </Text>
                          {xray.notes}
                        </Text>
                      </View>
                    )}
                </View>
              ))}
          </View>
        ) : (
          <EmptyState 
            isDarkMode={isDarkMode}
            icon="images-outline"
            message="No x-ray results"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default PatientXRayResults;
