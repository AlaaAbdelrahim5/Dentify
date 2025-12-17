import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authUtils } from '../../../utils/auth';
import { DashboardHeader, MobileNavigation } from '../../../components/common';
import { LoadingSpinner, Sidebar } from '../../../components/dashboard';
import DentistOverview from '../../../components/dashboard/dentist/DentistOverview';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Dentist Dashboard - Role-specific dashboard for dentists
 */
export default function DentistDashboard() {
  const { isDarkMode } = useTheme();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const isAuth = await authUtils.isAuthenticated();
      if (!isAuth) {
        router.replace('/(auth)/login');
        return;
      }

      const user = await authUtils.getCurrentUser();
      if (!user || user.role.toLowerCase() !== 'dentist') {
        router.replace('/dashboard');
        return;
      }

      setUserData(user);
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarVisible(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DentistOverview />;
      // Add more dentist-specific tabs here as needed
      default:
        return <DentistOverview />;
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <DashboardHeader
        userData={userData}
        onMenuPress={() => setSidebarVisible(true)}
      />

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 85 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderContent()}
        </ScrollView>
      </View>

      <MobileNavigation
        userRole="dentist"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        userData={userData}
        role="dentist"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </SafeAreaView>
  );
}
