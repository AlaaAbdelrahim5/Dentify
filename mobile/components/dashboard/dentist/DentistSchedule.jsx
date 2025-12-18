import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Switch, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { dentistsAPI } from '../../../services/api';
import { showErrorAlert, showSuccessAlert } from '../../../utils/errorUtils';
import { LoadingState } from '../shared';
import { Input } from '../../common';

const DentistSchedule = () => {
  const { isDarkMode } = useTheme();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [defaultDuration, setDefaultDuration] = useState(null);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await dentistsAPI.getMyProfile();
      const dentist = response.data?.dentist || response.data;
      const workingHours = dentist?.workingHours || [];
      
      const scheduleMap = {};
      
      // Process working hours from database
      if (Array.isArray(workingHours)) {
        workingHours.forEach(wh => {
          scheduleMap[wh.day] = {
            isWorking: wh.isWorking !== false,
            startTime: wh.start || wh.startTime || '',
            endTime: wh.end || wh.endTime || '',
            breaks: Array.isArray(wh.breaks) ? wh.breaks : []
          };
        });
      }
      
      // Fill in missing days
      daysOfWeek.forEach(day => {
        if (!scheduleMap[day]) {
          scheduleMap[day] = {
            isWorking: false,
            startTime: '',
            endTime: '',
            breaks: []
          };
        }
      });
      
      setSchedule(scheduleMap);
      
      // Load appointment duration
      if (dentist?.appointmentDuration) {
        setDefaultDuration(dentist.appointmentDuration.toString());
      }
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
      // Convert schedule to database format
      const workingHours = daysOfWeek.map(day => ({
        day,
        isWorking: schedule[day].isWorking,
        start: schedule[day].startTime,
        end: schedule[day].endTime,
        breaks: schedule[day].breaks || []
      }));

      const updateData = { workingHours };
      
      // Include appointment duration if set
      if (defaultDuration) {
        updateData.appointmentDuration = parseInt(defaultDuration);
      }

      await dentistsAPI.updateMyProfile(updateData);
      showSuccessAlert('Schedule updated successfully');
      setEditingDay(null);
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
        isWorking: !prev[day]?.isWorking
      }
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const addBreak = (day) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: [...(prev[day].breaks || []), { label: 'Break', start: '12:00', end: '13:00' }]
      }
    }));
  };

  const removeBreak = (day, index) => {
    Alert.alert(
      'Remove Break',
      'Are you sure you want to remove this break?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSchedule(prev => ({
              ...prev,
              [day]: {
                ...prev[day],
                breaks: prev[day].breaks.filter((_, i) => i !== index)
              }
            }));
          }
        }
      ]
    );
  };

  const updateBreak = (day, index, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breaks: prev[day].breaks.map((breakItem, i) => 
          i === index ? { ...breakItem, [field]: value } : breakItem
        )
      }
    }));
  };

  const formatTime = (time) => {
    if (!time) return 'Not Set';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getWorkingDays = () => {
    return daysOfWeek.filter(day => schedule[day]?.isWorking).length;
  };

  const getTotalWorkingHours = () => {
    let totalMinutes = 0;
    
    daysOfWeek.forEach(day => {
      const daySchedule = schedule[day];
      if (daySchedule?.isWorking && daySchedule.startTime && daySchedule.endTime) {
        const [startH, startM] = daySchedule.startTime.split(':').map(Number);
        const [endH, endM] = daySchedule.endTime.split(':').map(Number);
        let dayMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        
        // Subtract break times
        (daySchedule.breaks || []).forEach(breakItem => {
          if (breakItem.start && breakItem.end) {
            const [breakStartH, breakStartM] = breakItem.start.split(':').map(Number);
            const [breakEndH, breakEndM] = breakItem.end.split(':').map(Number);
            dayMinutes -= (breakEndH * 60 + breakEndM) - (breakStartH * 60 + breakStartM);
          }
        });
        
        totalMinutes += dayMinutes;
      }
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return totalMinutes > 0 ? `${hours}h ${minutes}m` : '0h 0m';
  };

  const DayCard = ({ day }) => {
    const dayData = schedule[day] || {};
    const isExpanded = editingDay === day;
    
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
        {/* Day Header */}
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {day}
            </Text>
            {dayData.isWorking && !isExpanded && (
              <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatTime(dayData.startTime)} - {formatTime(dayData.endTime)}
              </Text>
            )}
          </View>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            {dayData.isWorking && (
              <TouchableOpacity
                onPress={() => setEditingDay(isExpanded ? null : day)}
                className="p-2"
              >
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "pencil"} 
                  size={20} 
                  color="#14B8A6" 
                />
              </TouchableOpacity>
            )}
            <Switch
              value={dayData.isWorking || false}
              onValueChange={() => toggleDay(day)}
              trackColor={{ false: '#767577', true: '#14b8a6' }}
              thumbColor={dayData.isWorking ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Expanded Edit Section */}
        {dayData.isWorking && isExpanded && (
          <View className="mt-4 pt-4 border-t" style={{ borderTopColor: isDarkMode ? '#374151' : '#E5E7EB' }}>
            {/* Time Inputs */}
            <View className="mb-4">
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Working Hours
              </Text>
              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1">
                  <Text className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Start Time (24h)
                  </Text>
                  <TextInput
                    value={dayData.startTime}
                    onChangeText={(text) => handleTimeChange(day, 'startTime', text)}
                    placeholder="09:00"
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                    className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  />
                  {dayData.startTime && (
                    <Text className={`text-xs mt-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                      = {formatTime(dayData.startTime)}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    End Time (24h)
                  </Text>
                  <TextInput
                    value={dayData.endTime}
                    onChangeText={(text) => handleTimeChange(day, 'endTime', text)}
                    placeholder="17:00"
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                    className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
                  />
                  {dayData.endTime && (
                    <Text className={`text-xs mt-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                      = {formatTime(dayData.endTime)}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Breaks Section */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Breaks
                </Text>
                <TouchableOpacity
                  onPress={() => addBreak(day)}
                  className="flex-row items-center bg-teal-500 px-3 py-1.5 rounded-lg"
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text className="text-white text-xs font-medium ml-1">Add Break</Text>
                </TouchableOpacity>
              </View>

              {(dayData.breaks || []).length > 0 && (
                <View style={{ gap: 8 }}>
                  {dayData.breaks.map((breakItem, index) => (
                    <View 
                      key={index}
                      className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                    >
                      <View className="mb-2">
                        <Text className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Label
                        </Text>
                        <TextInput
                          value={breakItem.label}
                          onChangeText={(text) => updateBreak(day, index, 'label', text)}
                          placeholder="Break"
                          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                          className={`px-2 py-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                        />
                      </View>
                      <View className="flex-row items-center" style={{ gap: 8 }}>
                        <View className="flex-1">
                          <Text className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Start (24h)
                          </Text>
                          <TextInput
                            value={breakItem.start}
                            onChangeText={(text) => updateBreak(day, index, 'start', text)}
                            placeholder="12:00"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            className={`px-2 py-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                          />
                          {breakItem.start && (
                            <Text className={`text-xs mt-0.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                              {formatTime(breakItem.start)}
                            </Text>
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            End (24h)
                          </Text>
                          <TextInput
                            value={breakItem.end}
                            onChangeText={(text) => updateBreak(day, index, 'end', text)}
                            placeholder="13:00"
                            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                            className={`px-2 py-1.5 rounded text-sm ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                          />
                          {breakItem.end && (
                            <Text className={`text-xs mt-0.5 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                              {formatTime(breakItem.end)}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => removeBreak(day, index)}
                          className="p-2 mt-4"
                        >
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Schedule Management
          </Text>
          <Text className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your working hours and availability
          </Text>
        </View>

        {/* Statistics Cards */}
        <View className="flex-row mb-6" style={{ gap: 12 }}>
          <View className={`flex-1 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
            <View className="flex-row justify-between items-start">
              <View>
                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Working Days
                </Text>
                <Text className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getWorkingDays()}
                </Text>
              </View>
              <Ionicons name="calendar" size={24} color="#3B82F6" />
            </View>
          </View>

          <View className={`flex-1 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
            <View className="flex-row justify-between items-start">
              <View>
                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Weekly Hours
                </Text>
                <Text className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTotalWorkingHours()}
                </Text>
              </View>
              <Ionicons name="time" size={24} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Weekly Schedule Section */}
        <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
          <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Weekly Schedule
          </Text>
          
          {daysOfWeek.map((day) => (
            <DayCard key={day} day={day} />
          ))}
        </View>

        {/* Appointment Settings */}
        <View className={`rounded-xl p-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ elevation: 2 }}>
          <View className="flex-row items-center mb-4">
            <Ionicons name="settings" size={20} color="#14B8A6" />
            <Text className={`text-lg font-bold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Appointment Settings
            </Text>
          </View>

          <View className="mb-2">
            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Default Appointment Duration (minutes)
            </Text>
            <TextInput
              value={defaultDuration || ''}
              onChangeText={setDefaultDuration}
              placeholder="Enter duration in minutes (e.g., 30)"
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              keyboardType="numeric"
              className={`px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'}`}
            />
            <Text className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              Standard duration for each appointment (in 15-minute increments)
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveSchedule}
          disabled={saving}
          className="bg-teal-500 py-4 rounded-xl items-center mb-6"
          style={{
            opacity: saving ? 0.6 : 1
          }}
        >
          <View className="flex-row items-center">
            <Ionicons name="save" size={20} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              {saving ? 'Saving...' : 'Save Schedule'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default DentistSchedule;
