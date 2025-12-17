import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';

/**
 * 404 Not Found Page
 * Displayed when user navigates to an invalid route
 */
export default function NotFound() {
  const { isDarkMode } = useTheme();

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className="flex-1 items-center justify-center px-6">
        <Text className={`text-6xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          404
        </Text>
        <Text className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Page Not Found
        </Text>
        <Text className={`text-base text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/login')}
          className="bg-teal-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold text-base">
            Go to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
