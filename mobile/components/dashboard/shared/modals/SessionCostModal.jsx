import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../common/Button';
import { UI_COLORS } from '../../../../utils/colors';
import { useTheme } from '../../../../contexts/ThemeContext';

const SessionCostModal = ({ visible, onClose, onSave, appointmentInfo }) => {
  const { isDarkMode } = useTheme();
  const [sessionCost, setSessionCost] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation - allow 0 as valid cost
    const cost = parseFloat(sessionCost);
    if (sessionCost === '' || isNaN(cost) || cost < 0) {
      setError('Please enter a valid session cost');
      return;
    }

    try {
      setLoading(true);
      await onSave(cost);
      
      Alert.alert('Success', 'Appointment completed successfully!', [
        { text: 'OK', onPress: handleClose }
      ]);
    } catch (err) {
      console.error('Error saving session cost:', err);
      setError(err.message || 'Failed to complete appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSessionCost('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className={`rounded-2xl w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Header */}
          <View className={`flex-row items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-row items-center gap-3">
              <View className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                <Ionicons name="cash-outline" size={20} color={UI_COLORS.primaryDark} />
              </View>
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Complete Appointment
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : UI_COLORS.iconGray} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="p-6 space-y-4">
            {/* Appointment Info */}
            {appointmentInfo && (
              <View className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Patient: <Text className="font-semibold">{appointmentInfo.patientName}</Text>
                </Text>
                {appointmentInfo.treatment && (
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                    Treatment: <Text className="font-semibold">{appointmentInfo.treatment}</Text>
                  </Text>
                )}
                {!appointmentInfo.treatment && (
                  <Text className={`text-xs mt-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Note: This appointment is not linked to a treatment
                  </Text>
                )}
              </View>
            )}

            {/* Session Cost Input */}
            <View>
              <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Session Cost
              </Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <Text className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>$</Text>
                </View>
                <TextInput
                  value={sessionCost}
                  onChangeText={(text) => {
                    setSessionCost(text);
                    setError('');
                  }}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  autoFocus
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border text-lg ${
                    error
                      ? 'border-red-500'
                      : isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  } ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  placeholderTextColor={isDarkMode ? '#6B7280' : UI_COLORS.placeholderLight}
                />
              </View>
              {error && (
                <Text className="text-red-500 text-sm mt-2">{error}</Text>
              )}
              <Text className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                This cost will be added to the treatment's total amount
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View className={`flex-row justify-end gap-3 p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
              disabled={loading || !sessionCost}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {loading ? (
                <ActivityIndicator size="small" color={UI_COLORS.white} />
              ) : (
                'Complete'
              )}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SessionCostModal;
