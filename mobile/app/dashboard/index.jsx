import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { authUtils } from '../../utils/auth';
import PatientOverview from './patient/PatientOverview';
import DentistOverview from './dentist/DentistOverview';
import SecretaryOverview from './secretary/SecretaryOverview';

const Dashboard = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
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
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  // Render appropriate overview based on role
  switch (userRole) {
    case 'patient':
      return <PatientOverview />;
    case 'dentist':
      return <DentistOverview />;
    case 'secretary':
      return <SecretaryOverview />;
    default:
      return (
        <View className="flex-1 items-center justify-center bg-gray-50">
          <Text className="text-red-600">Invalid user role</Text>
        </View>
      );
  }
};

export default Dashboard;
