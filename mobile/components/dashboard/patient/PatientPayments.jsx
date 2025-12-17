import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, EmptyState, LoadingSpinner } from '../../../components/dashboard';
import { useTheme } from '../../../contexts/ThemeContext';
// import { paymentsAPI } from '../../../services/api';

const PatientPayments = () => {
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, paid, pending

  useEffect(() => {
    fetchPayments();
  }, [selectedFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // TODO: Uncomment when API is ready
      // const response = await paymentsAPI.getPatientPayments();
      // let allPayments = response.payments || [];
      
      // Mock data
      let allPayments = [];
      
      // Filter based on selection
      if (selectedFilter !== 'all') {
        allPayments = allPayments.filter(p => p.status.toLowerCase() === selectedFilter);
      }
      
      setPayments(allPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStats = () => {
    const total = payments.reduce((sum, p) => sum + parseFloat(p.amountPaid || 0), 0);
    const paid = payments.filter(p => p.status === 'PAID').length;
    const pending = payments.filter(p => p.status === 'PENDING').length;
    
    return { total, paid, pending };
  };

  const stats = getStats();

  const getPaymentMethodIcon = (method) => {
    const icons = {
      CASH: 'cash',
      CREDIT_CARD: 'card',
      DEBIT_CARD: 'card',
      INSURANCE: 'shield-checkmark',
      OTHER: 'wallet'
    };
    return icons[method] || 'wallet';
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      CASH: '#10B981',
      CREDIT_CARD: '#3B82F6',
      DEBIT_CARD: '#6366F1',
      INSURANCE: '#8B5CF6',
      OTHER: '#6B7280'
    };
    return colors[method] || '#6B7280';
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        <View className="p-4 space-y-4">
          {/* Header */}
          <View>
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Payment History
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              View your payment records
            </Text>
          </View>

          {/* Stats Cards */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-3">
            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="cash" size={24} color="#10B981" />
                <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(stats.total)}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Paid</Text>
            </View>

            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.paid}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</Text>
            </View>

            <View className={`rounded-xl p-4 min-w-[140px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <View className="flex-row items-center justify-between mb-2">
                <Ionicons name="time" size={24} color="#F59E0B" />
                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stats.pending}
                </Text>
              </View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</Text>
            </View>
          </ScrollView>

          {/* Filter Tabs */}
          <View className={`flex-row rounded-xl p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {['all', 'paid', 'pending'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`flex-1 py-2 rounded-lg ${
                  selectedFilter === filter
                    ? 'bg-teal-600'
                    : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-center font-medium capitalize ${
                    selectedFilter === filter
                      ? 'text-white'
                      : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payments List */}
          {loading ? (
            <LoadingSpinner />
          ) : payments.length > 0 ? (
            <View className="space-y-3">
              {payments.map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  onPress={() => console.log('View payment details')}
                >
                  <Card>
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center flex-1">
                        <View 
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{ backgroundColor: `${getPaymentMethodColor(payment.paymentMethod)}20` }}
                        >
                          <Ionicons 
                            name={getPaymentMethodIcon(payment.paymentMethod)} 
                            size={20} 
                            color={getPaymentMethodColor(payment.paymentMethod)} 
                          />
                        </View>
                        <View className="flex-1">
                          <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {payment.treatment?.treatmentType || 'Treatment'}
                          </Text>
                          <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {formatDate(payment.paymentDate)}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-teal-600">
                          {formatCurrency(payment.amountPaid)}
                        </Text>
                        <View className={`px-2 py-1 rounded-full ${
                          payment.status === 'PAID' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <Text className={`text-xs font-medium ${
                            payment.status === 'PAID' ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                            {payment.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="space-y-1">
                      <View className="flex-row items-center">
                        <Ionicons name="person" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Dr. {payment.treatment?.dentist?.firstName} {payment.treatment?.dentist?.lastName}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <Ionicons name="wallet" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {payment.paymentMethod.replace('_', ' ')}
                        </Text>
                      </View>

                      {payment.receiptNumber && (
                        <View className="flex-row items-center">
                          <Ionicons name="document-text" size={14} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          <Text className={`text-sm ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Receipt #{payment.receiptNumber}
                          </Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="wallet-outline"
              title="No payments found"
              message="Your payment history will appear here"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default PatientPayments;
