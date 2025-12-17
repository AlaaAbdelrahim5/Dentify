import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Card component for mobile dashboard
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
 * StatsCard component to display statistics
 */
export const StatsCard = ({ icon, label, value, gradient = 'from-teal-500 to-cyan-500' }) => {
  const { isDarkMode } = useTheme();
  const gradientColors = {
    'from-blue-600 to-cyan-600': ['#2563EB', '#0891B2'],
    'from-yellow-600 to-orange-600': ['#CA8A04', '#EA580C'],
    'from-green-600 to-teal-600': ['#16A34A', '#0D9488'],
    'from-purple-600 to-pink-600': ['#9333EA', '#DB2777'],
    'from-teal-600 to-cyan-600': ['#0D9488', '#0891B2'],
    'from-teal-500 to-cyan-500': ['#14B8A6', '#06B6D4'],
  };

  return (
    <View className={`rounded-xl shadow-sm p-4 flex-1 min-w-[150px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <View className={`w-12 h-12 rounded-full items-center justify-center mb-3 bg-gradient-to-br ${gradient}`}
        style={{ backgroundColor: gradientColors[gradient]?.[0] || '#14B8A6' }}
      >
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{value}</Text>
      <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</Text>
    </View>
  );
};

/**
 * StatusBadge component
 */
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Pending' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', label: 'Confirmed' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', label: 'Cancelled' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

  return (
    <View className={`px-2 py-1 rounded-full border ${config.bg} ${config.border}`}>
      <Text className={`text-xs font-medium ${config.text}`}>{config.label}</Text>
    </View>
  );
};

/**
 * EmptyState component
 */
export const EmptyState = ({ icon, title, message, actionText, onAction }) => {
  const { isDarkMode } = useTheme();
  return (
    <View className="items-center justify-center py-12">
      <Ionicons name={icon} size={48} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
      <Text className={`text-lg font-semibold mt-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{title}</Text>
      <Text className={`text-sm mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{message}</Text>
      {actionText && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="mt-4 bg-teal-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * LoadingSpinner component
 */
export const LoadingSpinner = ({ size = 'large', color = '#14B8A6' }) => {
  return (
    <View className="items-center justify-center py-8">
      <View className="animate-spin rounded-full border-b-2 border-teal-600"
        style={{ width: size === 'small' ? 24 : 32, height: size === 'small' ? 24 : 32, borderWidth: 2, borderColor: color }}
      />
    </View>
  );
};
