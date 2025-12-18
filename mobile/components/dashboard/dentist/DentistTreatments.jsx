import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';
import { showErrorAlert } from '../../../utils/errorUtils';
import { filterByStatus } from '../../../utils/filterUtils';
import { TreatmentCard, FilterTabs, LoadingState, EmptyState } from '../shared';

const DentistTreatments = () => {
  const { isDarkMode } = useTheme();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const response = await api.get('/treatments/dentist');
      setTreatments(response.data.treatments || []);
    } catch (error) {
      console.error('Error fetching treatments:', error);
      showErrorAlert(error, 'Failed to load treatments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreatments();
  };

  const filteredTreatments = useMemo(() => filterByStatus(treatments, selectedStatus), [treatments, selectedStatus]);

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  const filterTabs = [
    { id: 'all', label: `All (${treatments.length})` },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' }
  ];

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        {filteredTreatments.length === 0 ? (
          <EmptyState
            icon="medkit-outline"
            title="No treatments found"
            isDarkMode={isDarkMode}
          />
        ) : (
          filteredTreatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              isDarkMode={isDarkMode}
              role="dentist"
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DentistTreatments;
