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
import { Picker } from '@react-native-picker/picker';
import Button from '../../../common/Button';
import { clinicsAPI, appointmentsAPI } from '../../../../services/api';
import { showErrorAlert } from '../../../../utils/errorUtils';
import { UI_COLORS } from '../../../../utils/colors';
import { generateTimeSlots, findBookedSlots, isAppointmentInFuture } from '../../../../utils/appointmentUtils';

const BookAppointmentModal = ({ visible, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Select Clinic, 2: Select Dentist, 3: Select Date/Time
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  const [formData, setFormData] = useState({
    clinicId: '',
    dentistId: '',
    date: '',
    time: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch clinics on mount
  useEffect(() => {
    if (visible) {
      fetchClinics();
    }
  }, [visible]);

  // Fetch dentists when clinic changes
  useEffect(() => {
    if (formData.clinicId) {
      fetchDentists();
    }
  }, [formData.clinicId]);

  // Fetch available slots when dentist and date change
  useEffect(() => {
    if (formData.dentistId && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.dentistId, formData.date]);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await clinicsAPI.getAll();
      setClinics(response.data || []);
    } catch (error) {
      showErrorAlert('Failed to load clinics', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDentists = async () => {
    try {
      setLoading(true);
      const response = await appointmentsAPI.getDentistsByClinic(formData.clinicId);
      setDentists(response.dentists || []);
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

  const validateStep = () => {
    const newErrors = {};
    
    if (step === 1 && !formData.clinicId) {
      newErrors.clinicId = 'Please select a clinic';
    }
    if (step === 2 && !formData.dentistId) {
      newErrors.dentistId = 'Please select a dentist';
    }
    if (step === 3) {
      if (!formData.date) newErrors.date = 'Please select a date';
      if (!formData.time) newErrors.time = 'Please select a time slot';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      setLoading(true);
      
      const [hours, minutes] = formData.time.split(':');
      const appointmentDate = new Date(formData.date);
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await appointmentsAPI.create({
        clinicId: formData.clinicId,
        dentistId: formData.dentistId,
        date: appointmentDate.toISOString(),
        patientNotes: formData.notes,
      });

      Alert.alert('Success', 'Appointment booked successfully!', [
        { text: 'OK', onPress: () => {
          onSuccess?.();
          handleClose();
        }}
      ]);
    } catch (error) {
      showErrorAlert('Failed to book appointment', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      clinicId: '',
      dentistId: '',
      date: '',
      time: '',
      notes: '',
    });
    setErrors({});
    setClinics([]);
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
              Book Appointment
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={UI_COLORS.iconGray} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator */}
          <View className="flex-row items-center justify-center p-4 space-x-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <View className={`w-8 h-8 rounded-full items-center justify-center ${
                  step >= s ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <Text className={`font-bold ${
                    step >= s ? 'text-white' : 'text-gray-500'
                  }`}>{s}</Text>
                </View>
                {s < 3 && (
                  <View className={`h-1 w-8 ${
                    step > s ? 'bg-teal-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Step 1: Select Clinic */}
            {step === 1 && (
              <View className="space-y-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select Clinic
                </Text>
                
                {loading ? (
                  <ActivityIndicator size="large" color={UI_COLORS.primaryDark} />
                ) : (
                  <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={formData.clinicId}
                      onValueChange={(value) => setFormData({ ...formData, clinicId: value, dentistId: '' })}
                      style={{ color: '#000' }}
                    >
                      <Picker.Item label="Select a clinic..." value="" />
                      {clinics.map((clinic) => (
                        <Picker.Item
                          key={clinic._id || clinic.userId}
                          label={clinic.clinicName}
                          value={(clinic._id || clinic.userId).toString()}
                        />
                      ))}
                    </Picker>
                  </View>
                )}
                
                {errors.clinicId && (
                  <Text className="text-red-500 text-sm">{errors.clinicId}</Text>
                )}
              </View>
            )}

            {/* Step 2: Select Dentist */}
            {step === 2 && (
              <View className="space-y-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select Dentist
                </Text>
                
                {loading ? (
                  <ActivityIndicator size="large" color={UI_COLORS.primaryDark} />
                ) : dentists.length === 0 ? (
                  <Text className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No dentists available at this clinic
                  </Text>
                ) : (
                  <View className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <Picker
                      selectedValue={formData.dentistId}
                      onValueChange={(value) => setFormData({ ...formData, dentistId: value })}
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
                  <Text className="text-red-500 text-sm">{errors.dentistId}</Text>
                )}
              </View>
            )}

            {/* Step 3: Select Date & Time */}
            {step === 3 && (
              <View className="space-y-4">
                <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Select Date & Time
                </Text>
                
                {/* Date Input */}
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Appointment Date
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
                {formData.date && (
                  <View>
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Available Time Slots
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
                <View>
                  <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes (Optional)
                  </Text>
                  <TextInput
                    value={formData.notes}
                    onChangeText={(text) => setFormData({ ...formData, notes: text })}
                    placeholder="Any additional information..."
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
                    placeholderTextColor={UI_COLORS.placeholderLight}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View className="p-4 border-t border-gray-200 dark:border-gray-700">
            <View className="flex-row gap-2">
              {step > 1 && (
                <Button
                  variant="outline"
                  onPress={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              
              <Button
                variant="primary"
                onPress={step === 3 ? handleSubmit : handleNext}
                disabled={loading || loadingSlots}
                className="flex-1"
              >
                {loading ? (
                  <ActivityIndicator size="small" color={UI_COLORS.white} />
                ) : step === 3 ? (
                  'Book Appointment'
                ) : (
                  'Next'
                )}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BookAppointmentModal;
