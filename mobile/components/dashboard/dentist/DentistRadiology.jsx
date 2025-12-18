import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
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
      setRequests(response.radiologyRequests || []);
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

  const filteredRequests = useMemo(() => {
    if (selectedStatus === 'all') return requests;
    return requests.filter(req => req.status === selectedStatus);
  }, [requests, selectedStatus]);

  const filterTabs = [
    { id: 'all', label: `All (${requests.length})` },
    { id: 'REQUESTED', label: `Requested (${requests.filter(r => r.status === 'REQUESTED').length})` },
    { id: 'COMPLETED', label: `Completed (${requests.filter(r => r.status === 'COMPLETED').length})` }
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
        activeTab={selectedStatus}
        onTabChange={setSelectedStatus}
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
