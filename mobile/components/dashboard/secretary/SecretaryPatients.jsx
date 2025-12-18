import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { patientsAPI } from '../../../services/api';
import { showErrorAlert } from '../../../utils/errorUtils';
import { filterPatients } from '../../../utils/searchUtils';
import { PatientCard, LoadingState, EmptyState, SearchBar } from '../shared';

const SecretaryPatients = () => {
  const { isDarkMode } = useTheme();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await patientsAPI.getAll();
      setPatients(response.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      showErrorAlert(error, 'Failed to load patients');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const filteredPatients = useMemo(() => {
    return filterPatients(patients, searchTerm);
  }, [patients, searchTerm]);

  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} message="Loading patients..." />;
  }

  return (
    <View className="flex-1 p-4">
      <SearchBar 
        placeholder="Search patients..."
        value={searchTerm}
        onChangeText={setSearchTerm}
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
        {filteredPatients.length === 0 ? (
          <EmptyState 
            isDarkMode={isDarkMode}
            icon="people-outline"
            message="No patients found"
          />
        ) : (
          filteredPatients.map((patient) => (
            <PatientCard key={patient.userId} patient={patient} isDarkMode={isDarkMode} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SecretaryPatients;
