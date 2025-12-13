import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const COUNTRY_CODES = [
  { value: '+970', label: '🇵🇸 +970' },
  { value: '+962', label: '🇯🇴 +962' },
  { value: '+20', label: '🇪🇬 +20' },
  { value: '+966', label: '🇸🇦 +966' },
  { value: '+971', label: '🇦🇪 +971' },
  { value: '+961', label: '🇱🇧 +961' },
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+44', label: '🇬🇧 +44' },
];

const PhoneInput = ({ 
  label, 
  countryCode,
  phoneNumber,
  onCountryChange,
  onPhoneChange,
  error,
  className = '',
  ...props 
}) => {
  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </Text>
      )}
      <View className="flex-row space-x-2">
        <View className="w-32 rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
          <Picker
            selectedValue={countryCode}
            onValueChange={onCountryChange}
            style={{ height: 50 }}
          >
            {COUNTRY_CODES.map((code) => (
              <Picker.Item key={code.value} label={code.label} value={code.value} />
            ))}
          </Picker>
        </View>
        <View className={`flex-1 flex-row items-center rounded-lg border ${
          error ? 'border-red-300' : 'border-gray-300'
        } bg-white shadow-sm`}>
          <View className="pl-3 pr-2">
            <Ionicons name="call-outline" size={20} color="#9CA3AF" />
          </View>
          <TextInput
            placeholder="Phone number"
            placeholderTextColor="#9CA3AF"
            value={phoneNumber}
            onChangeText={onPhoneChange}
            keyboardType="phone-pad"
            className="flex-1 py-3 pr-3 text-gray-900"
            {...props}
          />
        </View>
      </View>
      {error && (
        <Text className="mt-2 text-sm text-red-600">{error}</Text>
      )}
    </View>
  );
};

export default PhoneInput;
