import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../../utils/colors';
import { showErrorAlert } from '../../../../utils/errorUtils';
import { DentistCard } from '../cards/PersonListComponents';
import { LoadingState, EmptyState, SearchBar } from '../overview/OverviewComponents';

/**
 * SharedDentistsList - Unified dentists list component
 * @param {Function} fetchDentistsAPI - API function to fetch dentists
 * @param {Function} filterFunction - Function to filter dentists (from searchUtils)
 * @param {string} searchPlaceholder - Placeholder text for search bar
 */
const SharedDentistsList = ({ 
  fetchDentistsAPI, 
  filterFunction, 
  searchPlaceholder = "Search dentists..." 
}) => {
  const { isDarkMode } = useTheme();
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDentists();
  }, []);

  const fetchDentists = async () => {
    try {
      const response = await fetchDentistsAPI();
      setDentists(response.data || response.dentists || response);
    } catch (error) {
      console.error('Error fetching dentists:', error);
      showErrorAlert(error, 'Failed to load dentists');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDentists();
  };

  const filteredDentists = useMemo(() => {
    if (!Array.isArray(dentists)) return [];
    if (!searchTerm.trim()) return dentists;
    return filterFunction(dentists, searchTerm) || dentists;
  }, [dentists, searchTerm]);

  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} message="Loading dentists..." />;
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
        {filteredDentists.length === 0 ? (
          <EmptyState 
            isDarkMode={isDarkMode}
            icon="people-outline"
            message="No dentists found"
          />
        ) : (
          filteredDentists.map((dentist) => (
            <DentistCard key={dentist.userId} dentist={dentist} isDarkMode={isDarkMode} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SharedDentistsList;
