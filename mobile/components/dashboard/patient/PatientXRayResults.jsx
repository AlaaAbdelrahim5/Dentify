import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { formatDate } from '../../../utils/dateUtils';
import { LoadingState, EmptyState, FilterTabs } from '../shared';
import { patientsAPI } from '../../../services/api';

const PatientXRayResults = () => {
  const { isDarkMode } = useTheme();
  const [xrays, setXrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedXray, setSelectedXray] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, reviewed, pending

  useEffect(() => {
    fetchXRays();
  }, [selectedFilter]);

  const fetchXRays = async () => {
    try {
      setLoading(true);
      const response = await patientsAPI.getMyRadiologyRequests();
      let allXRays = response.data || [];
      
      // Filter based on selection
      if (selectedFilter === 'reviewed') {
        allXRays = allXRays.filter(x => x.status === 'REVIEWED');
      } else if (selectedFilter === 'pending') {
        allXRays = allXRays.filter(x => x.status === 'PENDING');
      }
      
      setXrays(allXRays);
    } catch (error) {
      console.error('Error fetching x-rays:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchXRays();
  };

  const openImageViewer = (xray) => {
    setSelectedXray(xray);
    setModalVisible(true);
  };

  const tabs = [
    { key: 'all', label: 'All', count: xrays.length },
    { key: 'reviewed', label: 'Reviewed' },
    { key: 'pending', label: 'Pending' }
  ];

  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} message="Loading x-ray results..." />;
  }

  return (
    <View className="flex-1">
      <View className="p-4">
        <FilterTabs 
          tabs={tabs}
          selectedTab={selectedFilter}
          onSelectTab={setSelectedFilter}
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
        {xrays.length > 0 ? (
          <View>
              {xrays.map((xray) => (
                <TouchableOpacity
                  key={xray.id}
                  onPress={() => openImageViewer(xray)}
                  className={`p-4 rounded-xl mb-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                  style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3
                  }}
                >
                    <View className="flex-row">
                      {/* Thumbnail */}
                      <View className="w-20 h-20 rounded-lg bg-gray-200 mr-4 overflow-hidden">
                        {xray.imageUrl ? (
                          <Image 
                            source={{ uri: xray.imageUrl }} 
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-full items-center justify-center">
                            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                          </View>
                        )}
                      </View>

                      {/* Content */}
                      <View className="flex-1">
                        <View className="flex-row items-start justify-between mb-2">
                          <Text className={`font-semibold text-base flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {xray.type || 'Dental X-Ray'}
                          </Text>
                          <View className={`px-2 py-1 rounded-full ${
                            xray.status === 'REVIEWED' ? 'bg-green-100' : 'bg-yellow-100'
                          }`}>
                            <Text className={`text-xs font-medium ${
                              xray.status === 'REVIEWED' ? 'text-green-800' : 'text-yellow-800'
                            }`}>
                              {xray.status}
                            </Text>
                          </View>
                        </View>

                        {xray.toothNumber && (
                          <View className="flex-row items-center mb-1">
                            <Ionicons name="tooth" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                            <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Tooth #{xray.toothNumber}
                            </Text>
                          </View>
                        )}

                        <View className="flex-row items-center mb-1">
                          <Ionicons name="person" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Dr. {xray.dentist?.firstName} {xray.dentist?.lastName}
                          </Text>
                        </View>

                        <View className="flex-row items-center">
                          <Ionicons name="calendar" size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(xray.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {xray.notes && (
                      <View className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          <Text className="font-medium">Notes: </Text>
                          {xray.notes}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => openImageViewer(xray)}
                      className="mt-3 flex-row items-center justify-center py-2 bg-teal-600 rounded-lg"
                    >
                      <Ionicons name="eye" size={18} color="#FFF" />
                      <Text className="text-white font-medium ml-2">View Full Image</Text>
                    </TouchableOpacity>
                </TouchableOpacity>
              ))}
          </View>
        ) : (
          <View className="items-center justify-center py-12">
            <Ionicons name="images-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No x-ray results
            </Text>
          </View>
        )}
      </ScrollView>
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 bg-black/50">
            <View>
              <Text className="text-white font-semibold text-lg">
                {selectedXray?.type || 'X-Ray Image'}
              </Text>
              <Text className="text-gray-300 text-sm">
                {selectedXray && formatDate(selectedXray.createdAt)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Image */}
          <View className="flex-1 items-center justify-center">
            {selectedXray?.imageUrl ? (
              <Image
                source={{ uri: selectedXray.imageUrl }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="image-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-400 mt-4">No image available</Text>
              </View>
            )}
          </View>

          {/* Details */}
          {selectedXray?.notes && (
            <View className="p-4 bg-black/50">
              <Text className="text-white font-medium mb-2">Dentist Notes:</Text>
              <Text className="text-gray-300">{selectedXray.notes}</Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default PatientXRayResults;
