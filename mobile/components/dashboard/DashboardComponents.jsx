import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Card component for mobile dashboard
 * @deprecated Use components from shared/OverviewComponents instead
 */
export const Card = ({ children, className = '' }) => {
  const { isDarkMode } = useTheme();
  return (
    <View className={`rounded-xl shadow-sm p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${className}`}>
      {children}
    </View>
  );
};

/**
 * StatsCard component - Re-exported from shared components
 */
export { StatCard as StatsCard } from './shared/overview/OverviewComponents';

/**
 * StatusBadge component - Re-exported from shared components
 */
export { StatusBadge } from './shared/overview/OverviewComponents';

/**
 * EmptyState component - Re-exported from shared components
 */
export { EmptyState } from './shared/overview/OverviewComponents';

/**
 * LoadingSpinner component - Re-exported from shared components
 */
export { LoadingState as LoadingSpinner } from './shared/overview/OverviewComponents';
