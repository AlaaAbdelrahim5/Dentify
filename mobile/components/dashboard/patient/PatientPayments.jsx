import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { calculatePaymentStats } from '../../../utils/paymentUtils';
import { PaymentCard, PaymentStatsCard, LoadingState, EmptyState } from '../shared';
// import api from '../../../services/api';

const PatientPayments = () => {
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // TODO: Uncomment when API is ready
      // const response = await api.get('/payments/patient/mine');
      // setPayments(response.data.payments || []);
      setPayments([]);
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

  const stats = calculatePaymentStats(payments);

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row mb-4" style={{ gap: 8 }}>
        <PaymentStatsCard label="Total" value={stats.total} isDarkMode={isDarkMode} />
        <PaymentStatsCard label="This Month" value={stats.thisMonth} isDarkMode={isDarkMode} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#14B8A6" />
        }
      >
        {payments.length === 0 ? (
          <EmptyState
            icon="card-outline"
            title="No payments recorded"
            isDarkMode={isDarkMode}
          />
        ) : (
          payments.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              isDarkMode={isDarkMode}
              role="patient"
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default PatientPayments;
