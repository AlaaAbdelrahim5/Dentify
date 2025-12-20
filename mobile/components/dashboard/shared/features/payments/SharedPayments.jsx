import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { UI_COLORS } from '../../../../../utils/colors';
import { showErrorAlert } from '../../../../../utils/errorUtils';
import { calculatePaymentStats } from '../../../../../utils/paymentUtils';
import { PaymentCard, PaymentStatsCard } from './PaymentComponents';
import { LoadingState, EmptyState } from '../../overview/OverviewComponents';

/**
 * SharedPayments - Unified payments component for all roles
 * @param {Function} fetchPaymentsAPI - API function to fetch payments (e.g., paymentsAPI.getDentistPayments)
 * @param {string} role - User role ('dentist', 'patient', 'secretary')
 */
const SharedPayments = ({ fetchPaymentsAPI, role }) => {
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetchPaymentsAPI();
      setPayments(response.payments || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      showErrorAlert(error, 'Failed to load payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const stats = useMemo(() => calculatePaymentStats(payments), [payments]);

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={UI_COLORS.primary} />
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
              role={role}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default SharedPayments;
