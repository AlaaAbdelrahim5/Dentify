import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { dentistsAPI } from '../../../services/api';
import { showErrorAlert } from '../../../utils/errorUtils';
import { filterDentists } from '../../../utils/searchUtils';
import { DentistCard, LoadingState, EmptyState, SearchBar } from '../shared';

const SecretaryDentists = () => {
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
      const response = await dentistsAPI.getForClinic();
      setDentists(response.data || []);
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
    return filterDentists(dentists, searchTerm);
  }, [dentists, searchTerm]);

  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} message="Loading dentists..." />;
  }

  return (
    <View className="flex-1 p-4">
      <SearchBar 
        placeholder="Search dentists..."
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

export default SecretaryDentists;
