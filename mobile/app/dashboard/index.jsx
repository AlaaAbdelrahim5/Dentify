import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authUtils } from '../../utils/auth';
import { LoadingSpinner } from '../../components/dashboard';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Dashboard Router - Routes users to role-specific dashboards
 * This is the entry point for /dashboard and redirects based on user role
 */
export default function DashboardIndex() {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthAndRoute();
  }, []);

  const checkAuthAndRoute = async () => {
    try {
      const isAuth = await authUtils.isAuthenticated();
      if (!isAuth) {
        router.replace('/(auth)/login');
        return;
      }

      const user = await authUtils.getCurrentUser();
      if (!user || !authUtils.isRoleAllowed(user.role)) {
        await authUtils.logout();
        router.replace('/(auth)/login');
        return;
      }

      // Route to role-specific dashboard
      const role = user.role.toLowerCase();
      switch (role) {
        case 'patient':
          router.replace('/dashboard/patient');
          break;
        case 'dentist':
          router.replace('/dashboard/dentist');
          break;
        case 'secretary':
          router.replace('/dashboard/secretary');
          break;
        default:
          // For admin or other roles, stay on this page or add specific routing
          setIsLoading(false);
          break;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className="flex-1 items-center justify-center">
        <LoadingSpinner />
      </View>
    </SafeAreaView>
  );
}
