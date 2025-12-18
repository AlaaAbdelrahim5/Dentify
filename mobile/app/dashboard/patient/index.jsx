import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authUtils } from '../../../utils/auth';
import { DashboardHeader, MobileNavigation } from '../../../components/common';
import { LoadingSpinner, Sidebar } from '../../../components/dashboard';
import PatientOverview from '../../../components/dashboard/patient/PatientOverview';
import PatientAppointments from '../../../components/dashboard/patient/PatientAppointments';
import PatientTreatments from '../../../components/dashboard/patient/PatientTreatments';
import PatientXRayResults from '../../../components/dashboard/patient/PatientXRayResults';
import PatientPayments from '../../../components/dashboard/patient/PatientPayments';
import SearchPage from '../../../components/dashboard/patient/SearchPage';
import PatientSettings from '../../../components/dashboard/patient/PatientSettings';
import { useTheme } from '../../../contexts/ThemeContext';

/**
 * Patient Dashboard - Role-specific dashboard for patients
 */
export default function PatientDashboard() {
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
      if (!user || user.role.toLowerCase() !== 'patient') {
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
        return <PatientOverview />;
      case 'appointments':
        return <PatientAppointments />;
      case 'treatments':
        return <PatientTreatments />;
      case 'xray':
        return <PatientXRayResults />;
      case 'payments':
        return <PatientPayments />;
      case 'search':
        return <SearchPage />;
      case 'settings':
        return <PatientSettings />;
      default:
        return <PatientOverview />;
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
        userRole="patient"
        activeTab={activeTab}
        onTabChange={handleTabChange}
        userData={userData}
      />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        userData={userData}
        role="patient"
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </SafeAreaView>
  );
}
