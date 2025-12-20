import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../utils/colors';
import { showErrorAlert } from '../../../utils/errorUtils';
import { filterByStatus } from '../../../utils/filterUtils';
import { TreatmentCard, FilterTabs, LoadingState, EmptyState } from './index';
import NewAppointmentModal from './NewAppointmentModal';

/**
 * SharedTreatments - Unified treatments component for all roles
 * @param {Function} fetchTreatmentsAPI - API function to fetch treatments (e.g., treatmentsAPI.getDentistTreatments)
 * @param {string} role - User role ('dentist', 'patient', 'secretary')
 * @param {boolean} showCount - Show count in filter tabs (default: false for patient, true for dentist/secretary)
 */
const SharedTreatments = ({ fetchTreatmentsAPI, role, showCount = true }) => {
  const { isDarkMode } = useTheme();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('IN_PROGRESS');
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    try {
      const response = await fetchTreatmentsAPI();
      setTreatments(response.treatments || []);
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

  const handleBookAppointment = (treatment) => {
    setSelectedTreatment(treatment);
    setIsAppointmentModalVisible(true);
  };

  const handleAppointmentSuccess = () => {
    setIsAppointmentModalVisible(false);
    setSelectedTreatment(null);
    // Optionally refresh treatments to update counts
  };

  const filteredTreatments = useMemo(() => 
    filterByStatus(treatments, selectedStatus), 
    [treatments, selectedStatus]
  );

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  const filterTabs = showCount 
    ? [
        { id: 'all', label: `All (${treatments.length})` },
        { id: 'IN_PROGRESS', label: 'In Progress' },
        { id: 'COMPLETED', label: 'Completed' }
      ]
    : [
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={UI_COLORS.primary} />
        }
      >
        {filteredTreatments.length === 0 ? (
          <EmptyState
            icon={role === 'patient' ? 'medical-outline' : 'medkit-outline'}
            title="No treatments found"
            isDarkMode={isDarkMode}
          />
        ) : (
          filteredTreatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id}
              treatment={treatment}
              isDarkMode={isDarkMode}
              role={role}
              onBookAppointment={handleBookAppointment}
            />
          ))
        )}
      </ScrollView>

      {/* New Appointment Modal */}
      <NewAppointmentModal
        visible={isAppointmentModalVisible}
        onClose={() => {
          setIsAppointmentModalVisible(false);
          setSelectedTreatment(null);
        }}
        onSuccess={handleAppointmentSuccess}
        userRole={role}
        preselectedTreatment={selectedTreatment}
      />
    </View>
  );
};

export default SharedTreatments;
