import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Select } from '../../../components/common';
import { useTheme } from '../../../contexts/ThemeContext';
import { LoadingState, EmptyState } from '../shared';
import NewAppointmentModal from '../shared/modals/NewAppointmentModal';
import DentistCard from '../shared/cards/DentistCard';
import ClinicCard from '../shared/cards/ClinicCard';
import { dentistsAPI, clinicsAPI } from '../../../services/api';
import { sortByDistance, formatDistance } from '../../../utils/geoUtils';
import { useDebounce } from '../../../hooks';
import { authUtils } from '../../../utils/auth';

const SearchPage = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('dentists');
  const [allDentists, setAllDentists] = useState([]);
  const [allClinics, setAllClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationChecked, setLocationChecked] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  const [filters, setFilters] = useState({
    specialty: '',
    city: '',
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    getUserLocation();
    fetchAllData();
  }, []);

  // Reset to list view when switching to dentists
  useEffect(() => {
    if (searchType === 'dentists') {
      setViewMode('list');
    }
  }, [searchType]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        setUserLocation('failed');
        setLocationChecked(true);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation([location.coords.latitude, location.coords.longitude]);
      setLocationChecked(true);
    } catch (error) {
      console.log('Error getting location:', error);
      setUserLocation('failed');
      setLocationChecked(true);
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dentistsResponse, clinicsResponse] = await Promise.all([
        dentistsAPI.getAll({ limit: 1000, status: 'active' }),
        clinicsAPI.getAll()
      ]);
      
      const dentistsData = dentistsResponse.dentists || dentistsResponse.data || dentistsResponse || [];
      const clinicsData = clinicsResponse.clinics || clinicsResponse.data || clinicsResponse || [];
      
      setAllDentists(dentistsData);
      setAllClinics(clinicsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const specialties = useMemo(() => {
    const specs = [...new Set(allDentists.map(d => d.specialty).filter(Boolean))];
    return specs.sort();
  }, [allDentists]);

  const cities = useMemo(() => {
    const dentistCities = allDentists.map(d => d.clinic?.city).filter(Boolean);
    const clinicCities = allClinics.map(c => c.city).filter(Boolean);
    const allCities = [...new Set([...dentistCities, ...clinicCities])];
    return allCities.sort();
  }, [allDentists, allClinics]);

  const filteredResults = useMemo(() => {
    const dataToFilter = searchType === 'dentists' ? allDentists : allClinics;
    
    const filtered = dataToFilter.filter(item => {
      if (searchType === 'dentists') {
        const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
        const clinicName = item.clinic?.clinicName?.toLowerCase() || '';
        const specialty = item.specialty || '';
        const city = item.clinic?.city || '';

        const matchesSearch = debouncedSearchQuery === '' || 
          fullName.includes(debouncedSearchQuery.toLowerCase()) ||
          clinicName.includes(debouncedSearchQuery.toLowerCase()) ||
          specialty.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

        const matchesSpecialty = filters.specialty === '' || item.specialty === filters.specialty;
        const matchesCity = filters.city === '' || item.clinic?.city === filters.city;

        return matchesSearch && matchesSpecialty && matchesCity;
      } else {
        const clinicName = item.clinicName?.toLowerCase() || '';
        const city = item.city?.toLowerCase() || '';
        const address = item.address?.toLowerCase() || '';

        const matchesSearch = debouncedSearchQuery === '' || 
          clinicName.includes(debouncedSearchQuery.toLowerCase()) ||
          city.includes(debouncedSearchQuery.toLowerCase()) ||
          address.includes(debouncedSearchQuery.toLowerCase());

        const matchesCity = filters.city === '' || item.city === filters.city;

        return matchesSearch && matchesCity;
      }
    });

    if (userLocation && Array.isArray(userLocation)) {
      if (searchType === 'dentists') {
        const dentistsWithCoords = filtered.map(dentist => ({
          ...dentist,
          coordinates: dentist.clinic?.coordinates,
          fullName: `${dentist.firstName} ${dentist.lastName}`
        }));
        return sortByDistance(dentistsWithCoords, userLocation, 'fullName');
      } else {
        return sortByDistance(filtered, userLocation, 'clinicName');
      }
    }

    return filtered.sort((a, b) => {
      if (searchType === 'dentists') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      } else {
        const nameA = (a.clinicName || '').toLowerCase();
        const nameB = (b.clinicName || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
    });
  }, [allDentists, allClinics, debouncedSearchQuery, filters, searchType, userLocation]);

  const clearFilters = () => {
    setFilters({ specialty: '', city: '' });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.specialty !== '' || filters.city !== '';

  const parseCoordinates = (coords) => {
    if (!coords) return null;
    try {
      const [lat, lng] = coords.split(',').map(c => parseFloat(c.trim()));
      if (isNaN(lat) || isNaN(lng)) return null;
      return { latitude: lat, longitude: lng };
    } catch (error) {
      return null;
    }
  };

  const handleBookAppointment = async (dentist) => {
    try {
      const user = await authUtils.getCurrentUser();
      if (!user) {
        Alert.alert('Authentication Required', 'Please log in to book an appointment.');
        return;
      }

      console.log('Current user for booking:', user);

      // Extract patient name from user object
      const patientFirstName = user.firstName || user.patient?.firstName || 'Patient';
      const patientLastName = user.lastName || user.patient?.lastName || '';

      // Create a treatment object structure for the booking modal
      const treatmentData = {
        patient: {
          userId: user.id,
          firstName: patientFirstName,
          lastName: patientLastName,
          _id: user.id
        },
        dentist: {
          userId: dentist.userId || dentist.id,
          firstName: dentist.firstName,
          lastName: dentist.lastName,
          _id: dentist.userId || dentist.id,
          clinic: dentist.clinic
        },
        dentistId: dentist.userId || dentist.id,
        patientId: user.id,
        clinicId: dentist.clinic?.userId || dentist.clinic?.id
      };

      console.log('Treatment data for booking:', treatmentData);

      setSelectedDentist(treatmentData);
      setBookingModalVisible(true);
    } catch (error) {
      console.error('Error preparing booking:', error);
      Alert.alert('Error', 'Failed to prepare booking. Please try again.');
    }
  };

  const handleBookingSuccess = () => {
    setBookingModalVisible(false);
    setSelectedDentist(null);
    Alert.alert('Success', 'Appointment booked successfully!');
  };

  const handleViewDentist = (dentist) => {
    const details = [
      `👨‍⚕️ Dr. ${dentist.firstName} ${dentist.lastName}`,
      dentist.specialty ? `\n🏥 Specialty: ${dentist.specialty}` : '',
      dentist.licenseNumber ? `\n📄 License: ${dentist.licenseNumber}` : '',
      dentist.clinic?.clinicName ? `\n🏢 Clinic: ${dentist.clinic.clinicName}` : '',
      dentist.clinic?.city ? `\n📍 City: ${dentist.clinic.city}` : '',
      dentist.clinic?.address ? `\n📮 Address: ${dentist.clinic.address}` : '',
      dentist.user?.phone ? `\n📞 Phone: ${dentist.user.phone}` : '',
      dentist.user?.email ? `\n✉️ Email: ${dentist.user.email}` : '',
      dentist.distance !== undefined && dentist.distance !== Infinity 
        ? `\n📏 Distance: ${formatDistance(dentist.distance)}` 
        : ''
    ].filter(Boolean).join('');

    Alert.alert('Dentist Details', details, [
      { text: 'Close', style: 'cancel' },
      dentist.user?.phone ? { 
        text: 'Call', 
        onPress: () => handleCall(dentist.user.phone) 
      } : null,
      { 
        text: 'Book Appointment', 
        onPress: () => handleBookAppointment(dentist) 
      }
    ].filter(Boolean));
  };

  const handleViewClinic = (clinic) => {
    const details = [
      `🏥 ${clinic.clinicName}`,
      clinic.registrationNumber ? `\n📄 Registration: ${clinic.registrationNumber}` : '',
      clinic.city ? `\n📍 City: ${clinic.city}` : '',
      clinic.address ? `\n📮 Address: ${clinic.address}` : '',
      clinic.user?.phone ? `\n📞 Phone: ${clinic.user.phone}` : '',
      clinic.user?.email ? `\n✉️ Email: ${clinic.user.email}` : '',
      clinic.distance !== undefined && clinic.distance !== Infinity 
        ? `\n📏 Distance: ${formatDistance(clinic.distance)}` 
        : ''
    ].filter(Boolean).join('');

    Alert.alert('Clinic Details', details, [
      { text: 'Close', style: 'cancel' },
      clinic.user?.phone ? { 
        text: 'Call', 
        onPress: () => handleCall(clinic.user.phone) 
      } : null,
      clinic.user?.email ? { 
        text: 'Email', 
        onPress: () => handleEmail(clinic.user.email) 
      } : null
    ].filter(Boolean));
  };

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  if (loading && !locationChecked) {
    return <LoadingState isDarkMode={isDarkMode} message="Getting your location..." />;
  }

  return (
    <View className="flex-1 p-4">
      {/* Search Type Tabs */}
      <View className="flex-row mb-4">
        <TouchableOpacity
          onPress={() => setSearchType('dentists')}
          className={`flex-1 py-3 rounded-lg mr-2 ${
            searchType === 'dentists' ? 'bg-teal-600' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              searchType === 'dentists'
                ? 'text-white'
                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Dentists
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSearchType('clinics')}
          className={`flex-1 py-3 rounded-lg ${
            searchType === 'clinics' ? 'bg-teal-600' : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`text-center font-medium ${
              searchType === 'clinics'
                ? 'text-white'
                : isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Clinics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View 
        className={`flex-row items-center px-4 py-3 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3
        }}
      >
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

      {/* Filter and View Toggle */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`flex-row items-center px-4 py-2 rounded-lg mr-2 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            <Ionicons name="filter" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <Text className={`ml-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filters
            </Text>
            {hasActiveFilters && (
              <View className="ml-2 w-2 h-2 rounded-full bg-teal-600" />
            )}
          </TouchableOpacity>

          {/* View Mode Toggle - Only for clinics */}
          {searchType === 'clinics' && (
            <View className="flex-row items-center rounded-lg overflow-hidden">
              <TouchableOpacity
                onPress={() => setViewMode('list')}
                className={`px-3 py-2 ${
                  viewMode === 'list'
                    ? 'bg-teal-600'
                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <Ionicons
                  name="list"
                  size={16}
                  color={viewMode === 'list' ? '#FFF' : (isDarkMode ? '#9CA3AF' : '#6B7280')}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('map')}
                className={`px-3 py-2 ${
                  viewMode === 'map'
                    ? 'bg-teal-600'
                    : isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <Ionicons
                  name="map"
                  size={16}
                  color={viewMode === 'map' ? '#FFF' : (isDarkMode ? '#9CA3AF' : '#6B7280')}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {hasActiveFilters && (
          <TouchableOpacity
            onPress={clearFilters}
            className="flex-row items-center px-4 py-2"
          >
            <Ionicons name="close-circle" size={16} color="#EF4444" />
            <Text className="text-red-500 ml-2 font-medium">Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View 
          className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3
          }}
        >
          {searchType === 'dentists' && specialties.length > 0 && (
            <View className="mb-3">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Specialty
              </Text>
              <View className={`border rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <Select
                  value={filters.specialty}
                  onValueChange={(value) => setFilters({ ...filters, specialty: value })}
                  items={[
                    { label: 'All Specialties', value: '', key: 'all-specialties' },
                    ...specialties.map(spec => ({ label: spec, value: spec, key: `specialty-${spec}` }))
                  ]}
                  isDarkMode={isDarkMode}
                />
              </View>
            </View>
          )}

          {cities.length > 0 && (
            <View>
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                City
              </Text>
              <View className={`border rounded-lg ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <Select
                  value={filters.city}
                  onValueChange={(value) => setFilters({ ...filters, city: value })}
                  items={[
                    { label: 'All Cities', value: '', key: 'all-cities' },
                    ...cities.map(city => ({ label: city, value: city, key: `city-${city}` }))
                  ]}
                  isDarkMode={isDarkMode}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Loading State */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading {searchType}...
          </Text>
        </View>
      )}

      {/* Results */}
      {!loading && (
        <>
          {viewMode === 'list' || searchType === 'dentists' ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredResults.length > 0 ? (
                <View>
                  <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
                    {userLocation && Array.isArray(userLocation) && ' (sorted by distance)'}
                  </Text>
                  
                  {/* Dentist Cards */}
                  {searchType === 'dentists' && filteredResults.map((dentist, index) => (
                    <DentistCard
                      key={dentist.userId || dentist.id || `dentist-${index}`}
                      dentist={dentist}
                      isDarkMode={isDarkMode}
                      onBook={handleBookAppointment}
                      onViewDetails={handleViewDentist}
                    />
                  ))}

                  {/* Clinic Cards */}
                  {searchType === 'clinics' && filteredResults.map((clinic, index) => (
                    <ClinicCard
                      key={clinic.userId || clinic.id || clinic._id || `clinic-${index}`}
                      clinic={clinic}
                      isDarkMode={isDarkMode}
                      onViewDetails={handleViewClinic}
                    />
                  ))}
                </View>
              ) : (
                <EmptyState 
                  isDarkMode={isDarkMode}
                  icon="search-outline"
                  message={debouncedSearchQuery || hasActiveFilters ? "No results found" : `No ${searchType} available`}
                  subtitle={debouncedSearchQuery || hasActiveFilters ? "Try adjusting your search or filters" : ""}
                />
              )}
            </ScrollView>
          ) : (
            /* Map View - Only for Clinics */
            <View className="flex-1">
              {filteredResults.length > 0 ? (
                <View className="flex-1 rounded-xl overflow-hidden" style={{ height: 500 }}>
                  <MapView
                    style={{ flex: 1 }}
                    provider={PROVIDER_GOOGLE}
                    initialRegion={{
                      latitude: userLocation && Array.isArray(userLocation) ? userLocation[0] : 31.9522,
                      longitude: userLocation && Array.isArray(userLocation) ? userLocation[1] : 35.2332,
                      latitudeDelta: 0.5,
                      longitudeDelta: 0.5,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                  >
                    {/* User Location Circle */}
                    {userLocation && Array.isArray(userLocation) && (
                      <Circle
                        center={{
                          latitude: userLocation[0],
                          longitude: userLocation[1],
                        }}
                        radius={100}
                        fillColor="rgba(59, 130, 246, 0.2)"
                        strokeColor="#3B82F6"
                        strokeWidth={2}
                      />
                    )}

                    {/* Clinic Markers */}
                    {filteredResults.map((clinic, index) => {
                      const coords = parseCoordinates(clinic.coordinates);
                      if (!coords) return null;
                      return (
                        <Marker
                          key={clinic.userId || clinic.id || clinic._id || `clinic-${index}`}
                          coordinate={coords}
                          title={clinic.clinicName}
                          description={clinic.address || clinic.city}
                          pinColor="#3B82F6"
                          onCalloutPress={() => handleViewClinic(clinic)}
                        />
                      );
                    })}
                  </MapView>
                  
                  <View className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
                  }`}>
                    <Text className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {filteredResults.length} clinics on map
                    </Text>
                    <Text className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Tap a marker to view details
                    </Text>
                  </View>
                </View>
              ) : (
                <EmptyState 
                  isDarkMode={isDarkMode}
                  icon="map-outline"
                  message={debouncedSearchQuery || hasActiveFilters ? "No results found" : "No clinics available"}
                  subtitle={debouncedSearchQuery || hasActiveFilters ? "Try adjusting your search or filters" : ""}
                />
              )}
            </View>
          )}
        </>
      )}

      {/* Booking Modal */}
      <NewAppointmentModal
        visible={bookingModalVisible}
        onClose={() => {
          setBookingModalVisible(false);
          setSelectedDentist(null);
        }}
        onSuccess={handleBookingSuccess}
        userRole="patient"
        preselectedTreatment={selectedDentist}
      />
    </View>
  );
};

export default SearchPage;
