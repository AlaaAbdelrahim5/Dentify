import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { TreatmentCard, FilterTabs, LoadingState, EmptyState } from '../shared';
import { treatmentsAPI } from '../../../services/api';

const PatientTreatments = () => {
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
      const response = await treatmentsAPI.getPatientTreatments();
      setTreatments(response.data || []);
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

  const filteredTreatments = treatments.filter(t => 
    selectedStatus === 'all' || t.status === selectedStatus
  );

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  const filterTabs = [
    { id: 'all', label: 'All' },
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
            icon="medical-outline"
            title="No treatments found"
            isDarkMode={isDarkMode}
          />
        ) : (
          filteredTreatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              isDarkMode={isDarkMode}
              role="patient"
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default PatientTreatments;
