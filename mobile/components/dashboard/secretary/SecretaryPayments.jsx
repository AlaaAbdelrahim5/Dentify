import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../services/api';

const SecretaryPayments = () => {
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load payments';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const thisMonth = payments.filter(p => {
      const date = new Date(p.paymentDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + (p.amount || 0), 0);

    return { total, thisMonth, count: payments.length };
  }, [payments]);

  const PaymentCard = ({ payment }) => (
    <View className={`mb-3 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3
      }}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {payment.treatment?.patient?.firstName} {payment.treatment?.patient?.lastName}
          </Text>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Dr. {payment.treatment?.dentist?.firstName} {payment.treatment?.dentist?.lastName}
          </Text>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {payment.treatment?.treatmentType}
          </Text>
        </View>
        <Text className="text-green-600 font-bold text-lg">
          ${payment.amount?.toFixed(2)}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(payment.paymentDate).toLocaleDateString()}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${payment.method === 'CASH' ? 'bg-green-100' : 'bg-blue-100'}`}>
          <Text className={`text-xs font-medium ${payment.method === 'CASH' ? 'text-green-700' : 'text-blue-700'}`}>
            {payment.method === 'CASH' ? '💵 Cash' : '💳 Card'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row mb-4" style={{ gap: 8 }}>
        <View className={`flex-1 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total</Text>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${stats.total.toFixed(2)}
          </Text>
        </View>
        <View className={`flex-1 p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</Text>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            ${stats.thisMonth.toFixed(2)}
          </Text>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {payments.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Ionicons name="card-outline" size={64} color={isDarkMode ? '#4B5563' : '#D1D5DB'} />
            <Text className={`mt-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No payments recorded
            </Text>
          </View>
        ) : (
          payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SecretaryPayments;
