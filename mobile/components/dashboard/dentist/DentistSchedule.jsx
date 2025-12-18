import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';
import { showErrorAlert, showSuccessAlert } from '../../../utils/errorUtils';
import { LoadingState } from '../shared';

const DentistSchedule = () => {
  const { isDarkMode } = useTheme();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/dentists/profile');
      const workingHours = response.data.dentist?.workingHours || [];
      
      const scheduleMap = {};
      workingHours.forEach(wh => {
        scheduleMap[wh.day] = {
          enabled: true,
          startTime: wh.startTime,
          endTime: wh.endTime,
          breakStart: wh.breakStart,
          breakEnd: wh.breakEnd
        };
      });
      
      setSchedule(scheduleMap);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      showErrorAlert(error, 'Failed to load schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      const workingHours = Object.entries(schedule)
        .filter(([_, data]) => data.enabled)
        .map(([day, data]) => ({
          day,
          startTime: data.startTime,
          endTime: data.endTime,
          breakStart: data.breakStart || null,
          breakEnd: data.breakEnd || null
        }));

      await api.put('/dentists/profile', { workingHours });
      showSuccessAlert('Schedule updated successfully');
    } catch (error) {
      console.error('Error saving schedule:', error);
      showErrorAlert(error, 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day]?.enabled
      }
    }));
  };

  const DayCard = ({ day }) => {
    const dayData = schedule[day] || {};
    
    return (
      <View className={`mb-3 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3
        }}
      >
        <View className="flex-row justify-between items-center">
          <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {day}
          </Text>
          <Switch
            value={dayData.enabled || false}
            onValueChange={() => toggleDay(day)}
            trackColor={{ false: '#767577', true: '#14b8a6' }}
            thumbColor={dayData.enabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        {dayData.enabled && (
          <View className="mt-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="time-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {dayData.startTime || '09:00'} - {dayData.endTime || '17:00'}
              </Text>
            </View>
            {dayData.breakStart && dayData.breakEnd && (
              <View className="flex-row items-center">
                <Ionicons name="cafe-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Break: {dayData.breakStart} - {dayData.breakEnd}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <LoadingState isDarkMode={isDarkMode} message="Loading schedule..." />;
  }

  return (
    <View className="flex-1 p-4">
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#14B8A6"
          />
        }
      >
        {daysOfWeek.map((day) => (
          <DayCard key={day} day={day} />
        ))}

        <TouchableOpacity
          onPress={handleSaveSchedule}
          disabled={saving}
          className="bg-teal-500 py-4 rounded-xl items-center mt-4"
          style={{
            opacity: saving ? 0.6 : 1
          }}
        >
          <Text className="text-white font-semibold text-base">
            {saving ? 'Saving...' : 'Save Schedule'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DentistSchedule;
