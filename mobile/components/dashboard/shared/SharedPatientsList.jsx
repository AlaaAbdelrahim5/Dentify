import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
import { showErrorAlert } from '../../../utils/errorUtils';
import { PatientCard, LoadingState, EmptyState, SearchBar } from './index';

/**
 * SharedPatientsList - Unified patients list component
 * @param {Function} fetchPatientsAPI - API function to fetch patients
 * @param {Function} filterFunction - Function to filter patients (from searchUtils)
 * @param {string} searchPlaceholder - Placeholder text for search bar
 */
const SharedPatientsList = ({ 
  fetchPatientsAPI, 
  filterFunction, 
  searchPlaceholder = "Search patients..." 
}) => {
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
      const response = await fetchPatientsAPI();
      console.log('SharedPatientsList - Response:', response);
      
      // Handle different response structures
      let patientsData = response.patients || response.data || response.treatments || response;
      
      // If data comes from treatments, extract unique patients
      if (Array.isArray(patientsData) && patientsData.length > 0 && patientsData[0]?.patient) {
        console.log('Extracting patients from treatments');
        const patientMap = new Map();
        patientsData.forEach(treatment => {
          if (treatment.patient && treatment.patient.userId) {
            const patientId = treatment.patient.userId;
            if (!patientMap.has(patientId)) {
              const patientData = {
                ...treatment.patient,
                user: treatment.patient.user || {
                  email: treatment.patient.email,
                  phone: treatment.patient.phone,
                  status: treatment.patient.status || 'ACTIVE'
                }
              };
              patientMap.set(patientId, patientData);
            }
          }
        });
        const extractedPatients = Array.from(patientMap.values());
        console.log('Extracted patients:', extractedPatients.length);
        setPatients(extractedPatients);
      } else {
        console.log('Using patients data directly:', patientsData?.length);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      showErrorAlert(error, 'Failed to load patients');
      setPatients([]);
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
    if (!Array.isArray(patients)) return [];
    if (!searchTerm.trim()) return patients;
    return filterFunction(patients, searchTerm) || patients;
  }, [patients, searchTerm]);

  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} message="Loading patients..." />;
  }

  return (
    <View className="flex-1 p-4">
      <SearchBar 
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChangeText={setSearchTerm}
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

export default SharedPatientsList;
