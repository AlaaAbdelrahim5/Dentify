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
 * @param {Function} fetchTreatmentsAPI - Optional API function to fetch treatments (for calculating remaining balance)
 * @param {string} role - User role ('dentist', 'patient', 'secretary')
 */
const SharedPayments = ({ fetchPaymentsAPI, fetchTreatmentsAPI, role }) => {
  const { isDarkMode } = useTheme();
  const [payments, setPayments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetchPaymentsAPI();
      setPayments(response.payments || []);
      
      // Fetch treatments for patient role to calculate remaining balance
      if (role === 'patient' && fetchTreatmentsAPI) {
        const treatmentsResponse = await fetchTreatmentsAPI();
        setTreatments(treatmentsResponse.treatments || []);
      }
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

  const stats = useMemo(() => calculatePaymentStats(payments, treatments), [payments, treatments]);

  if (loading) {
    return (
      <View className="flex-1 p-4">
        <LoadingState isDarkMode={isDarkMode} />
      </View>
    );
  }

  // Show different stats based on role
  const secondaryLabel = role === 'patient' ? 'Remaining' : 'This Month';
  const secondaryValue = role === 'patient' ? stats.remaining : stats.thisMonth;

  return (
    <View className="flex-1 p-4">
      <View className="flex-row mb-4" style={{ gap: 8 }}>
        <PaymentStatsCard label="Total" value={stats.total} isDarkMode={isDarkMode} />
        <PaymentStatsCard label={secondaryLabel} value={secondaryValue} isDarkMode={isDarkMode} />
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
