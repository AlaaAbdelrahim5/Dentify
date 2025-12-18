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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Button from '../../common/Button';
import { appointmentsAPI, patientsAPI, dentistsAPI } from '../../../services/api';
import { showErrorAlert } from '../../../utils/errorUtils';
import { authUtils } from '../../../utils/auth';
import { UI_COLORS } from '../../../utils/colors';

const NewAppointmentModal = ({ visible, onClose, onSuccess, userRole }) => {
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    patientId: '',
    dentistId: '',
    date: '',
    time: '',
    sessionNotes: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch patients and dentists on mount
  useEffect(() => {
    if (visible) {
      fetchPatients();
      if (userRole === 'secretary') {
        fetchDentists();
      } else {
        // For dentist, set their own ID
        const user = authUtils.getCurrentUser();
        setFormData(prev => ({ ...prev, dentistId: user?.id?.toString() || '' }));
      }
    }
  }, [visible, userRole]);

  // Fetch available slots when dentist and date change
  useEffect(() => {
    if (formData.dentistId && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.dentistId, formData.date]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await patientsAPI.getClinicPatients();
      setPatients(response.patients || []);
    } catch (error) {
      showErrorAlert('Failed to load patients', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDentists = async () => {
    try {
      setLoading(true);
      const response = await dentistsAPI.getForClinic();
      setDentists(response.data || []);
    } catch (error) {
      showErrorAlert('Failed to load dentists', error.message);
      setDentists([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await appointmentsAPI.getAvailableSlots(formData.dentistId, formData.date);
      
      const duration = response.appointmentDuration || 30;
      const slots = generateTimeSlots(response.workingHours, duration);
      const booked = findBookedSlots(slots, response.appointments, duration, formData.date);
      
      setAvailableSlots(slots);
      setBookedSlots(booked);
    } catch (error) {
      showErrorAlert('Failed to load time slots', error.message);
      setAvailableSlots([]);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const generateTimeSlots = (workingHours, duration = 30) => {
    if (!workingHours || !workingHours.isWorking) return [];

    const slots = [];
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    const endTimeInMinutes = endHour * 60 + endMinute;
    
    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
      const slotStartInMinutes = currentHour * 60 + currentMinute;
      const slotEndInMinutes = slotStartInMinutes + duration;
      
      if (slotEndInMinutes > endTimeInMinutes) break;
      
      let isDuringBreak = false;
      if (workingHours.breaks && Array.isArray(workingHours.breaks)) {
        for (const breakPeriod of workingHours.breaks) {
          const [breakStartHour, breakStartMinute] = breakPeriod.start.split(':').map(Number);
          const [breakEndHour, breakEndMinute] = breakPeriod.end.split(':').map(Number);
          const breakStartMinutes = breakStartHour * 60 + breakStartMinute;
          const breakEndMinutes = breakEndHour * 60 + breakEndMinute;
          
          if (slotStartInMinutes >= breakStartMinutes && slotStartInMinutes < breakEndMinutes) {
            isDuringBreak = true;
            currentHour = breakEndHour;
            currentMinute = breakEndMinute;
            break;
          }
        }
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

  const findBookedSlots = (slots, appointments, duration, date) => {
    const booked = [];
    
    slots.forEach(slot => {
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      const slotStart = new Date(date);
      slotStart.setHours(slotHour, slotMinute, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);
      
      const hasOverlap = appointments.some(apt => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        return slotStart < aptEnd && slotEnd > aptStart;
      });
      
      if (hasOverlap) {
        booked.push(slot);
      }
    });
    
    return booked;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientId) newErrors.patientId = 'Please select a patient';
    if (userRole === 'secretary' && !formData.dentistId) newErrors.dentistId = 'Please select a dentist';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time slot';
    
    // Check if appointment is in the future
    if (formData.date && formData.time) {
      const [hours, minutes] = formData.time.split(':');
      const appointmentDate = new Date(formData.date);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const now = new Date();
      
      if (appointmentDate <= now) {
        newErrors.time = 'Appointment must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const [hours, minutes] = formData.time.split(':');
      const appointmentDate = new Date(formData.date);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await appointmentsAPI.create({
        patientId: formData.patientId,
        dentistId: formData.dentistId,
        date: appointmentDate.toISOString(),
        sessionNotes: formData.sessionNotes,
      });

      Alert.alert('Success', 'Appointment created successfully!', [
        { text: 'OK', onPress: () => {
          onSuccess?.();
          handleClose();
        }}
      ]);
    } catch (error) {
      showErrorAlert('Failed to create appointment', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      patientId: '',
      dentistId: userRole === 'dentist' ? formData.dentistId : '',
      date: '',
      time: '',
      sessionNotes: '',
    });
    setErrors({});
    setPatients([]);
    setDentists([]);
    setAvailableSlots([]);
    setBookedSlots([]);
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-white dark:bg-gray-800 mt-20 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              New Appointment
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={UI_COLORS.iconGray} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Patient Selection */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Patient *
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color={UI_COLORS.primaryDark} />
              ) : (
                <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <Picker
                    selectedValue={formData.patientId}
                    onValueChange={(value) => setFormData({ ...formData, patientId: value })}
                    style={{ color: '#000' }}
                  >
                    <Picker.Item label="Select a patient..." value="" />
                    {patients.map((patient) => (
                      <Picker.Item
                        key={patient._id || patient.userId}
                        label={`${patient.firstName} ${patient.lastName}`}
                        value={(patient._id || patient.userId).toString()}
                      />
                    ))}
                  </Picker>
                </View>
              )}
              {errors.patientId && (
                <Text className="text-red-500 text-sm mt-1">{errors.patientId}</Text>
              )}
            </View>

            {/* Dentist Selection (Secretary Only) */}
            {userRole === 'secretary' && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Dentist *
                </Text>
                {loading ? (
                  <ActivityIndicator size="small" color={UI_COLORS.primaryDark} />
                ) : (
                  <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={formData.dentistId}
                      onValueChange={(value) => setFormData({ ...formData, dentistId: value, time: '' })}
                      style={{ color: '#000' }}
                    >
                      <Picker.Item label="Select a dentist..." value="" />
                      {dentists.map((dentist) => (
                        <Picker.Item
                          key={dentist._id || dentist.userId}
                          label={`Dr. ${dentist.firstName} ${dentist.lastName}`}
                          value={(dentist._id || dentist.userId).toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
                {errors.dentistId && (
                  <Text className="text-red-500 text-sm mt-1">{errors.dentistId}</Text>
                )}
              </View>
            )}

            {/* Date Input */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appointment Date *
              </Text>
              <TextInput
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text, time: '' })}
                placeholder="YYYY-MM-DD"
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                placeholderTextColor={UI_COLORS.placeholderLight}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum date: {getMinDate()}
              </Text>
              {errors.date && (
                <Text className="text-red-500 text-sm mt-1">{errors.date}</Text>
              )}
            </View>

            {/* Time Slots */}
            {formData.date && formData.dentistId && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Time Slots *
                </Text>
                
                {loadingSlots ? (
                  <ActivityIndicator size="small" color={UI_COLORS.primaryDark} />
                ) : availableSlots.length === 0 ? (
                  <Text className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No available slots for this date
                  </Text>
                ) : (
                  <View className="flex-row flex-wrap gap-2">
                    {availableSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = formData.time === slot;
                      
                      return (
                        <TouchableOpacity
                          key={slot}
                          onPress={() => !isBooked && setFormData({ ...formData, time: slot })}
                          disabled={isBooked}
                          className={`px-4 py-2 rounded-lg border ${
                            isBooked
                              ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                              : isSelected
                              ? 'bg-teal-600 border-teal-600'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <Text className={`text-sm font-medium ${
                            isBooked
                              ? 'text-gray-400 dark:text-gray-500'
                              : isSelected
                              ? 'text-white'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                
                {errors.time && (
                  <Text className="text-red-500 text-sm mt-2">{errors.time}</Text>
                )}
              </View>
            )}

            {/* Notes */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Notes (Optional)
              </Text>
              <TextInput
                value={formData.sessionNotes}
                onChangeText={(text) => setFormData({ ...formData, sessionNotes: text })}
                placeholder="Notes about this appointment..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                placeholderTextColor={UI_COLORS.placeholderLight}
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View className="p-4 border-t border-gray-200 dark:border-gray-700">
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                onPress={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onPress={handleSubmit}
                disabled={loading || loadingSlots}
                className="flex-1"
              >
                {loading ? (
                  <ActivityIndicator size="small" color={UI_COLORS.white} />
                ) : (
                  'Create Appointment'
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
