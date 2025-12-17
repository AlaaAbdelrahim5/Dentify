import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StatusBar } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authUtils } from '../../utils/auth';
import { DashboardHeader, MobileNavigation } from '../../components/common';
import { LoadingSpinner } from '../../components/dashboard';
import { useTheme } from '../../contexts/ThemeContext';

// Import role-specific overview components
import PatientOverview from './patient/PatientOverview';
import DentistOverview from './dentist/DentistOverview';
import SecretaryOverview from './secretary/SecretaryOverview';

/**
 * Unified Dashboard Layout Component
 * Similar to web Dashboard.jsx - provides consistent header and navigation
 * across all role-specific pages
 */
const UnifiedDashboard = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    initializeDashboard();
  }, []);

  // Update active tab based on pathname
  useEffect(() => {
    updateActiveTab();
  }, [pathname]);

  const initializeDashboard = async () => {
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

      setUserRole(user.role.toLowerCase());
      setUserData(user);
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const updateActiveTab = () => {
    // Determine active tab based on pathname
    if (pathname.includes('/appointments')) {
      setActiveTab('appointments');
    } else if (pathname.includes('/dentists') || pathname.includes('/patients')) {
      setActiveTab('search');
    } else if (pathname.includes('/profile')) {
      setActiveTab('profile');
    } else {
      setActiveTab('home');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  };

  const getDashboardConfig = () => {
    const configs = {
      patient: {
        title: 'Dashboard',
        subtitle: 'Patient Portal',
      },
      dentist: {
        title: 'Dashboard',
        subtitle: 'Dentist Portal',
      },
      secretary: {
        title: 'Dashboard',
        subtitle: 'Secretary Portal',
      },
    };
    return configs[userRole] || configs.patient;
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  if (!userRole) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-600">Invalid user role</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = getDashboardConfig();

  // Render role-specific overview content
  const renderContent = () => {
    switch (userRole) {
      case 'patient':
        return <PatientOverview />;
      case 'dentist':
        return <DentistOverview />;
      case 'secretary':
        return <SecretaryOverview />;
      default:
        return (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-600">Invalid user role</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`} edges={['bottom']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={isDarkMode ? '#111827' : '#FFFFFF'} />
      
      {/* Unified Header */}
      <DashboardHeader 
        title={config.title}
        subtitle={config.subtitle}
      />

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#14B8A6']} 
          />
        }
      >
        {renderContent()}
      </ScrollView>

      {/* Unified Bottom Navigation */}
      <MobileNavigation userRole={userRole} />
    </SafeAreaView>
  );
};

export default UnifiedDashboard;
