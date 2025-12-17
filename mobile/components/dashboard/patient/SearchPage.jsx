import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, EmptyState, LoadingSpinner } from '../../../components/dashboard';
import { Select } from '../../../components/common';
import { useTheme } from '../../../contexts/ThemeContext';
// import { dentistsAPI, clinicsAPI } from '../../../services/api';

const SearchPage = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('dentists'); // dentists, clinics
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    availability: ''
  });

  const specializations = [
    { label: 'All Specializations', value: '' },
    { label: 'General Dentistry', value: 'GENERAL' },
    { label: 'Orthodontics', value: 'ORTHODONTICS' },
    { label: 'Endodontics', value: 'ENDODONTICS' },
    { label: 'Periodontics', value: 'PERIODONTICS' },
    { label: 'Prosthodontics', value: 'PROSTHODONTICS' },
    { label: 'Oral Surgery', value: 'ORAL_SURGERY' },
    { label: 'Pediatric Dentistry', value: 'PEDIATRIC' }
  ];

  const cities = [
    { label: 'All Cities', value: '' },
    { label: 'Amman', value: 'Amman' },
    { label: 'Zarqa', value: 'Zarqa' },
    { label: 'Irbid', value: 'Irbid' },
    { label: 'Aqaba', value: 'Aqaba' }
  ];

  const availabilityOptions = [
    { label: 'Any Time', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' }
  ];

  useEffect(() => {
    if (searchQuery.length >= 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [searchQuery, filters, searchType]);

  const performSearch = async () => {
    try {
      setLoading(true);
      // TODO: Uncomment when API is ready
      // const response = searchType === 'dentists'
      //   ? await dentistsAPI.search({ query: searchQuery, ...filters })
      //   : await clinicsAPI.search({ query: searchQuery, ...filters });
      // setResults(response.results || []);
      
      // Mock data
      setResults([]);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      specialization: '',
      city: '',
      availability: ''
    });
    setSearchQuery('');
  };

  const handleBookAppointment = (item) => {
    console.log('Book appointment with:', item);
    // Navigate to booking page
  };

  const renderDentistCard = (dentist) => (
    <Card key={dentist.id}>
      <View className="flex-row items-start">
        <View className="w-16 h-16 rounded-full bg-teal-100 items-center justify-center mr-3">
          <Text className="text-2xl font-bold text-teal-600">
            {dentist.firstName?.[0]}{dentist.lastName?.[0]}
          </Text>
        </View>

        <View className="flex-1">
          <Text className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dr. {dentist.firstName} {dentist.lastName}
          </Text>

          {dentist.specialization && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="medical" size={14} color="#14B8A6" />
              <Text className="text-sm text-teal-600 ml-1">
                {dentist.specialization.replace('_', ' ')}
              </Text>
            </View>
          )}

          {dentist.clinic && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="business" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dentist.clinic.name}
              </Text>
            </View>
          )}

          {dentist.clinic?.address && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dentist.clinic.address}
              </Text>
            </View>
          )}

          {dentist.phoneNumber && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="call" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dentist.phoneNumber}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => handleBookAppointment(dentist)}
            className="mt-3 bg-teal-600 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-medium">Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderClinicCard = (clinic) => (
    <Card key={clinic.id}>
      <View className="flex-row items-start">
        <View className="w-16 h-16 rounded-lg bg-blue-100 items-center justify-center mr-3">
          <Ionicons name="business" size={32} color="#3B82F6" />
        </View>

        <View className="flex-1">
          <Text className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {clinic.name}
          </Text>

          {clinic.address && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {clinic.address}
              </Text>
            </View>
          )}

          {clinic.phoneNumber && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="call" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {clinic.phoneNumber}
              </Text>
            </View>
          )}

          {clinic.email && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="mail" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {clinic.email}
              </Text>
            </View>
          )}

          {clinic.dentistsCount > 0 && (
            <View className="flex-row items-center mt-2 pt-2 border-t border-gray-200">
              <Ionicons name="people" size={14} color="#14B8A6" />
              <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {clinic.dentistsCount} {clinic.dentistsCount === 1 ? 'dentist' : 'dentists'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => console.log('View clinic details')}
            className="mt-3 bg-blue-600 py-2 rounded-lg items-center"
          >
            <Text className="text-white font-medium">View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView>
        <View className="p-4 space-y-4">
          {/* Header */}
          <View>
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Search
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Find dentists and dental clinics
            </Text>
          </View>

          {/* Search Type Tabs */}
          <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <TouchableOpacity
              onPress={() => setSearchType('dentists')}
              className={`flex-1 py-2 rounded-lg ${
                searchType === 'dentists' ? 'bg-teal-600' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  searchType === 'dentists'
                    ? 'text-white'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Dentists
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSearchType('clinics')}
              className={`flex-1 py-2 rounded-lg ${
                searchType === 'clinics' ? 'bg-teal-600' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  searchType === 'clinics'
                    ? 'text-white'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Clinics
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className={`flex-row items-center px-4 py-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              placeholder={`Search ${searchType}...`}
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className={`flex-1 ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filters */}
          <View className="space-y-3">
            {searchType === 'dentists' && (
              <Select
                label="Specialization"
                value={filters.specialization}
                onValueChange={(value) => setFilters({ ...filters, specialization: value })}
                options={specializations}
              />
            )}

            <Select
              label="City"
              value={filters.city}
              onValueChange={(value) => setFilters({ ...filters, city: value })}
              options={cities}
            />

            {searchType === 'dentists' && (
              <Select
                label="Availability"
                value={filters.availability}
                onValueChange={(value) => setFilters({ ...filters, availability: value })}
                options={availabilityOptions}
              />
            )}

            {(filters.specialization || filters.city || filters.availability) && (
              <TouchableOpacity
                onPress={clearFilters}
                className="flex-row items-center justify-center py-2"
              >
                <Ionicons name="close-circle" size={16} color="#EF4444" />
                <Text className="text-red-500 ml-2 font-medium">Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Results */}
          {loading ? (
            <LoadingSpinner />
          ) : searchQuery.length >= 2 ? (
            results.length > 0 ? (
              <View className="space-y-3">
                <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {results.length} {results.length === 1 ? 'result' : 'results'} found
                </Text>
                {results.map((item) =>
                  searchType === 'dentists' ? renderDentistCard(item) : renderClinicCard(item)
                )}
              </View>
            ) : (
              <EmptyState
                icon="search-outline"
                title="No results found"
                message={`Try adjusting your search or filters`}
              />
            )
          ) : (
            <View className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <View className="items-center">
                <Ionicons name="search" size={48} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
                <Text className={`text-center mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Enter at least 2 characters to start searching
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default SearchPage;
