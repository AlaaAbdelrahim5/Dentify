import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DatePicker from '../../../common/DatePicker';
import Button from '../../../common/Button';
import { appointmentsAPI } from '../../../../services/api';
import { authUtils } from '../../../../utils/auth';
import { UI_COLORS } from '../../../../utils/colors';
import { useTheme } from '../../../../contexts/ThemeContext';

const NewAppointmentModal = ({ 
  visible, 
  onClose, 
  onSuccess, 
  userRole, 
  preselectedTreatment = null 
}) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    sessionNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [appointmentDuration, setAppointmentDuration] = useState(30);

  // Patient and dentist info from preselected treatment
  const patientInfo = preselectedTreatment?.patient;
  const dentistInfo = preselectedTreatment?.dentist;
  const treatmentId = preselectedTreatment?.id || preselectedTreatment?._id;

  // Fetch available slots when date is selected
  useEffect(() => {
    if (visible && formData.date) {
      fetchAvailableSlots(formData.date);
    }
  }, [formData.date, visible]);

  const fetchAvailableSlots = async (date) => {
    try {
      setLoadingSlots(true);
      const user = authUtils.getCurrentUser();
      
      // Use preselected dentist if available (for secretary), otherwise use current user (for dentist)
      const dentistId = dentistInfo?._id?.toString() || 
                       dentistInfo?.userId?.toString() || 
                       preselectedTreatment?.dentistId?.toString() ||
                       user?.id;
      
      if (!dentistId) {
        console.error('Dentist ID not available');
        return;
      }

      const response = await appointmentsAPI.getAvailableSlots(dentistId, date);
      
      // Store the dentist's appointment duration
      const duration = response.appointmentDuration || 30;
      setAppointmentDuration(duration);
      
      // Generate time slots based on working hours
      const slots = generateTimeSlotsFromWorkingHours(
        response.workingHours,
        duration
      );
      
      // Mark booked slots
      const booked = [];
      
      slots.forEach(slot => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotStart = new Date(date);
        slotStart.setHours(slotHour, slotMinute, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);
        
        // Check if this slot overlaps with any existing appointment
        const hasOverlap = response.appointments.some(apt => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);
          
          // Check for overlap
          return slotStart < aptEnd && slotEnd > aptStart;
        });
        
        if (hasOverlap) {
          booked.push(slot);
        }
      });
      
      setAvailableSlots(slots);
      setBookedSlots(booked);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      showErrorAlert('Failed to load available time slots', err.message);
      setAvailableSlots([]);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const generateTimeSlotsFromWorkingHours = (workingHours, duration = 30) => {
    if (!workingHours || !workingHours.isWorking) {
      return [];
    }

    const slots = [];
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    
    const endTimeInMinutes = endHour * 60 + endMinute;
    
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour || 
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      const slotStartInMinutes = currentHour * 60 + currentMinute;
      const slotEndInMinutes = slotStartInMinutes + duration;
      
      if (slotEndInMinutes > endTimeInMinutes) {
        break;
      }
      
      // Check if this slot is during a break
      let isDuringBreak = false;
      let breakEndTime = null;
      if (workingHours.breaks && Array.isArray(workingHours.breaks)) {
        for (const breakPeriod of workingHours.breaks) {
          const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number);
          const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number);
          
          const slotMinutes = currentHour * 60 + currentMinute;
          const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
          const breakEndMinutes = breakEndHour * 60 + breakEndMinute;
          
          if (slotMinutes >= breakStartMinutes && slotMinutes < breakEndMinutes) {
            isDuringBreak = true;
            breakEndTime = { hour: breakEndHour, minute: breakEndMinute };
            break;
          }
        }
      }
      
      if (isDuringBreak && breakEndTime) {
        currentHour = breakEndTime.hour;
        currentMinute = breakEndTime.minute;
        continue;
      }
      
      if (!isDuringBreak) {
        slots.push(timeSlot);
      }
      
      currentMinute += duration;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }

    return slots;
  };

  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleDateChange = (dateString) => {
    setFormData({ ...formData, date: dateString, time: '' });
    setErrors(prev => ({ ...prev, date: '' }));
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleTimeSelect = (time) => {
    // Check if the selected time is in the future
    if (formData.date) {
      const appointmentDateTime = new Date(`${formData.date}T${time}`);
      const now = new Date();
      
      if (appointmentDateTime <= now) {
        setErrors(prev => ({
          ...prev,
          time: 'Appointment must be scheduled for a future time'
        }));
        return;
      }
    }
    
    setErrors(prev => ({ ...prev, time: '' }));
    setFormData(prev => ({ ...prev, time }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    } else if (formData.date && formData.time) {
      const appointmentDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      
      if (appointmentDateTime <= now) {
        newErrors.time = 'Appointment must be scheduled for a future time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const user = await authUtils.getCurrentUser();
      
      console.log('Current user:', user);
      
      if (!user || !user.id) {
        Alert.alert('Error', 'User not authenticated. Please login again.');
        setLoading(false);
        return;
      }

      if (!patientInfo) {
        Alert.alert('Error', 'Patient information is missing.');
        setLoading(false);
        return;
      }

      // Get clinicId
      const clinicId = dentistInfo?.clinic?.userId || 
                      preselectedTreatment?.clinicId || 
                      user.dentist?.clinicId || 
                      user.clinicId;
      
      console.log('Clinic ID:', clinicId);
      console.log('Dentist info:', dentistInfo);
      console.log('Patient info:', patientInfo);
      console.log('Treatment:', preselectedTreatment);
      
      if (!clinicId) {
        Alert.alert('Error', 'Clinic information is missing. Please contact support.');
        setLoading(false);
        return;
      }
      
      // Construct appointment data
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + appointmentDuration * 60000);
      
      // Extract patient ID - check various possible locations
      const patientId = patientInfo?.userId || 
                       patientInfo?._id || 
                       patientInfo?.id ||
                       preselectedTreatment?.patientId;
      
      // Extract dentist ID - use preselected dentist if available (for secretary), otherwise use current user (for dentist)
      const dentistId = dentistInfo?.userId || 
                       dentistInfo?._id || 
                       dentistInfo?.id ||
                       preselectedTreatment?.dentistId ||
                       user.id;
      
      console.log('Appointment data being prepared:');
      console.log('- Patient info:', patientInfo);
      console.log('- Patient ID:', patientId);
      console.log('- Dentist info:', dentistInfo);
      console.log('- Dentist ID:', dentistId);
      console.log('- Clinic ID:', clinicId);
      console.log('- Date:', formData.date);
      console.log('- Start Time:', startDateTime.toISOString());
      console.log('- End Time:', endDateTime.toISOString());
      console.log('- Treatment ID:', treatmentId);
      
      if (!patientId) {
        console.error('Could not extract patient ID from:', patientInfo);
        Alert.alert('Error', 'Patient ID is missing. Please try again.');
        setLoading(false);
        return;
      }
      
      if (!dentistId) {
        console.error('Could not extract dentist ID from:', dentistInfo);
        Alert.alert('Error', 'Dentist ID is missing. Please try again.');
        setLoading(false);
        return;
      }
      
      const appointmentData = {
        patientId: parseInt(patientId),
        dentistId: parseInt(dentistId),
        clinicId: parseInt(clinicId),
        appointmentDate: formData.date,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        sessionNotes: formData.sessionNotes || '',
        treatmentId: treatmentId ? parseInt(treatmentId) : null
      };

      console.log('Final appointment data:', appointmentData);
      
      const response = await appointmentsAPI.create(appointmentData);
      console.log('Appointment created successfully:', response);
      
      Alert.alert('Success', 'Appointment created successfully!', [
        { text: 'OK', onPress: () => {
          onSuccess?.();
          handleClose();
        }}
      ]);
    } catch (error) {
      console.error('Error creating appointment:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'An unknown error occurred';
      
      Alert.alert('Error', `Failed to create appointment: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: '',
      time: '',
      sessionNotes: '',
    });
    setErrors({});
    setAvailableSlots([]);
    setBookedSlots([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <View className={`flex-1 mt-20 rounded-t-3xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Header */}
          <View className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Book an Appointment
                </Text>
                {patientInfo && (
                  <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    for {patientInfo.firstName} {patientInfo.lastName}
                    {dentistInfo && ` with Dr. ${dentistInfo.firstName} ${dentistInfo.lastName}`}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : UI_COLORS.iconGray} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            <View style={{ gap: 24 }}>
              <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Date, Time & Treatment
              </Text>

              {/* Date Selection */}
              <DatePicker
                label="Appointment Date"
                value={formData.date}
                onChange={handleDateChange}
                error={errors.date}
                placeholder="Select appointment date"
                minimumDate={new Date()}
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
              />

              {/* Time Selection */}
              <View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time-outline" size={18} color={isDarkMode ? '#9CA3AF' : UI_COLORS.iconGray} />
                  <Text className={`text-sm font-medium ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Appointment Time
                  </Text>
                </View>
                
                {!formData.date ? (
                  <Text className={`text-sm italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Please select a date first
                  </Text>
                ) : loadingSlots ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="large" color={UI_COLORS.primary} />
                  </View>
                ) : availableSlots.length === 0 ? (
                  <View className="py-8 items-center">
                    <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No available time slots for this date.
                    </Text>
                    <Text className={`text-xs text-center mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      You may not be working on this day.
                    </Text>
                  </View>
                ) : (
                  <>
                    <View 
                      className={`border rounded-lg p-2 ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-300 bg-gray-50'}`}
                      style={{ maxHeight: 256 }}
                    >
                      <ScrollView>
                        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                          {availableSlots.map((time) => {
                            const isBooked = bookedSlots.includes(time);
                            const isSelected = formData.time === time;
                            
                            const isPastTime = (() => {
                              const appointmentDateTime = new Date(`${formData.date}T${time}`);
                              const now = new Date();
                              return appointmentDateTime <= now;
                            })();

                            return (
                              <TouchableOpacity
                                key={time}
                                onPress={() => !isBooked && !isPastTime && handleTimeSelect(time)}
                                disabled={isPastTime || isBooked}
                                className={`px-4 py-3 rounded-lg ${
                                  isPastTime
                                    ? isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                                    : isBooked
                                    ? 'bg-red-500/20 border-2 border-red-500'
                                    : isSelected
                                    ? 'bg-teal-600'
                                    : isDarkMode ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-300'
                                }`}
                                style={{ minWidth: '30%' }}
                              >
                                <Text className={`text-sm font-medium text-center ${
                                  isPastTime
                                    ? 'text-gray-400 line-through'
                                    : isBooked
                                    ? isDarkMode ? 'text-red-400' : 'text-red-600'
                                    : isSelected
                                    ? 'text-white'
                                    : isDarkMode ? 'text-gray-200' : 'text-gray-700'
                                }`}>
                                  {convertTo12Hour(time)}
                                </Text>
                                {isBooked && (
                                  <Text className={`text-xs text-center mt-1 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    Booked
                                  </Text>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </ScrollView>
                    </View>
                    
                    {/* Legend */}
                    <View className="flex-row flex-wrap items-center justify-center mt-3" style={{ gap: 16 }}>
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 rounded bg-teal-600 mr-2" />
                        <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Selected</Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-4 h-4 rounded bg-red-500/20 border-2 border-red-500 mr-2" />
                        <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Booked</Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className={`w-4 h-4 rounded mr-2 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} />
                        <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Available</Text>
                      </View>
                    </View>
                  </>
                )}
                
                {errors.time && (
                  <Text className="text-red-500 text-sm mt-2">{errors.time}</Text>
                )}
              </View>

              {/* Session Notes */}
              <View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="document-text-outline" size={18} color={isDarkMode ? '#9CA3AF' : UI_COLORS.iconGray} />
                  <Text className={`text-sm font-medium ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Session Notes (Optional)
                  </Text>
                </View>
                <TextInput
                  value={formData.sessionNotes}
                  onChangeText={(text) => setFormData({ ...formData, sessionNotes: text })}
                  placeholder="Your notes about the planned session (treatment details, observations, etc.)..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className={`border rounded-lg p-3 ${isDarkMode ? 'border-gray-600 text-white bg-gray-700' : 'border-gray-300 text-gray-900 bg-white'}`}
                  placeholderTextColor={isDarkMode ? '#6B7280' : UI_COLORS.placeholderLight}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                onPress={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onPress={handleSubmit}
                disabled={!formData.date || !formData.time || loading}
                className="flex-1"
              >
                {loading ? (
                  <ActivityIndicator size="small" color={UI_COLORS.white} />
                ) : (
                  'Book Appointment'
                )}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NewAppointmentModal;
