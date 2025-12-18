import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { radiologyRequestsAPI } from '../../../services/api';
import { showErrorAlert } from '../../../utils/errorUtils';
import { filterByStatus, countByStatus } from '../../../utils/filterUtils';
import { RadiologyRequestCard, LoadingState, EmptyState, FilterTabs } from '../shared';

const DentistRadiology = () => {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchRadiologyRequests();
  }, []);

  const fetchRadiologyRequests = async () => {
    try {
      const response = await radiologyRequestsAPI.getDentistRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error('Error fetching radiology requests:', error);
      showErrorAlert(error, 'Failed to load radiology requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRadiologyRequests();
  };

  const filteredRequests = useMemo(() => filterByStatus(requests, selectedStatus), [requests, selectedStatus]);

  const tabs = [
    { key: 'all', label: 'All', count: requests.length },
    { key: 'Available', label: 'Available', count: countByStatus(requests, 'Available') }
  ];

  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} message="Loading radiology requests..." />;
  }

  return (
    <View className="flex-1 p-4">
      <FilterTabs 
        tabs={tabs}
        selectedTab={selectedStatus}
        onSelectTab={setSelectedStatus}
        isDarkMode={isDarkMode}
      />

      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
      >
        {filteredRequests.length === 0 ? (
          <EmptyState 
            isDarkMode={isDarkMode}
            icon="medical-outline"
            message="No radiology requests"
          />
        ) : (
          filteredRequests.map((request) => (
            <RadiologyRequestCard key={request.id} request={request} isDarkMode={isDarkMode} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DentistRadiology;
