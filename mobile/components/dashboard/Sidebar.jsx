import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { authUtils } from '../../utils/auth';
import ThemeToggle from '../common/ThemeToggle';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = 288; // w-72 = 288px

const Sidebar = ({ visible, onClose, userData, role, activeTab, onTabChange }) => {
  const { isDarkMode } = useTheme();
  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  const [shouldRender, setShouldRender] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible]);

  const patientMenuItems = [
    { label: 'Overview', icon: 'apps', id: 'overview' },
    { label: 'Appointments', icon: 'calendar', id: 'appointments' },
    { label: 'Treatments', icon: 'medical', id: 'treatments' },
    { label: 'X-Ray Results', icon: 'images', id: 'xray' },
    { label: 'Payments', icon: 'card', id: 'payments' },
    { label: 'Find Providers', icon: 'search', id: 'search' },
    { label: 'Settings', icon: 'settings', id: 'settings' },
  ];

  const dentistMenuItems = [
    { label: 'Overview', icon: 'apps', id: 'overview' },
    { label: 'Appointments', icon: 'calendar', id: 'appointments' },
    { label: 'My Patients', icon: 'people', id: 'patients' },
    { label: 'Treatments', icon: 'medical', id: 'treatments' },
    { label: 'Payments', icon: 'card', id: 'payments' },
    { label: 'Radiology', icon: 'scan', id: 'radiology' },
    { label: 'Schedule', icon: 'time', id: 'schedule' },
    { label: 'Settings', icon: 'settings', id: 'settings' },
  ];

  const secretaryMenuItems = [
    { label: 'Overview', icon: 'apps', id: 'overview' },
    { label: 'Appointments', icon: 'calendar', id: 'appointments' },
    { label: 'Patients', icon: 'people', id: 'patients' },
    { label: 'Dentists', icon: 'medkit', id: 'dentists' },
    { label: 'Treatments', icon: 'medical', id: 'treatments' },
    { label: 'Payments', icon: 'card', id: 'payments' },
    { label: 'Settings', icon: 'settings', id: 'settings' },
  ];

  const getMenuItems = () => {
    const userRole = role || userData?.role;
    const normalizedRole = userRole?.toUpperCase();
    switch (normalizedRole) {
      case 'DENTIST':
        return dentistMenuItems;
      case 'SECRETARY':
        return secretaryMenuItems;
      case 'PATIENT':
        return patientMenuItems;
      default:
        return patientMenuItems;
    }
  };

  const getDashboardTitle = () => {
    const userRole = role || userData?.role;
    const normalizedRole = userRole?.toUpperCase();
    switch (normalizedRole) {
      case 'DENTIST':
        return 'Dentist';
      case 'SECRETARY':
        return 'Secretary';
      case 'PATIENT':
        return 'Patient';
      default:
        return 'Patient';
    }
  };

  const menuItems = getMenuItems();

  const handleNavigation = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const isActive = (tabId) => {
    return activeTab === tabId;
  };

  if (!shouldRender) return null;

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View 
        style={[
          styles.sidebar,
          {
            transform: [{ translateX }],
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          }
        ]}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View className="flex-1">
              {/* Header */}
              <View className={`px-6 py-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-teal-500 items-center justify-center mr-3"
                      style={{
                        shadowColor: '#14B8A6',
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 4
                      }}
                    >
                      <Ionicons name="medical" size={20} color="#FFF" />
                    </View>
                    <View>
                      <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        style={{ letterSpacing: -0.5 }}
                      >
                        Dentify
                      </Text>
                      <Text className={`text-xs font-medium ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                        {getDashboardTitle()} Portal
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={onClose}
                    className={`w-9 h-9 items-center justify-center rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={22} color={isDarkMode ? '#FFF' : '#000'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Navigation Menu - Scrollable */}
              <ScrollView className="flex-1 px-4 py-3" contentContainerStyle={styles.scrollContent}>
                {menuItems.map((item, index) => {
                  const active = isActive(item.id);
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleNavigation(item.id)}
                      className="mb-2"
                      activeOpacity={0.7}
                      style={[
                        styles.menuItem,
                        {
                          shadowColor: active ? '#14B8A6' : 'transparent',
                          shadowOpacity: active ? 0.3 : 0,
                          shadowRadius: active ? 8 : 0,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: active ? 4 : 0
                        }
                      ]}
                    >
                      {active ? (
                        <LinearGradient
                          colors={isDarkMode ? ['#0D9488', '#0891B2'] : ['#14B8A6', '#06B6D4']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.gradientBackground}
                        />
                      ) : (
                        <View className={`absolute inset-0 rounded-xl ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}`} />
                      )}
                      <View style={styles.menuItemContent}>
                        <View className={`w-8 h-8 rounded-lg items-center justify-center ${
                          active ? 'bg-white/20' : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <Ionicons 
                            name={item.icon} 
                            size={18} 
                            color={active ? '#FFF' : isDarkMode ? '#14B8A6' : '#14B8A6'} 
                          />
                        </View>
                        <Text className={`font-semibold flex-1 ml-3 text-sm ${
                          active 
                            ? 'text-white' 
                            : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {item.label}
                        </Text>
                        {active && (
                          <Ionicons name="chevron-forward" size={16} color="#FFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            {/* Dashboard Title at Bottom - Fixed */}
              <View className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <View className={`rounded-2xl overflow-hidden ${
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                }`}
                  style={{
                    shadowColor: '#14B8A6',
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3
                  }}
                >
                  <View style={styles.dashboardCard}>
                    <View style={styles.dashboardContent}>
                      <View className="w-10 h-10 rounded-xl bg-teal-500 items-center justify-center"
                        style={{
                          shadowColor: '#14B8A6',
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 4
                        }}
                      >
                        <Ionicons 
                          name="apps" 
                          size={20} 
                          color="#FFF" 
                        />
                      </View>
                      <View className="flex-col ml-3 flex-1">
                        <Text className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Dashboard</Text>
                        <Text className={`text-base font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>{getDashboardTitle()}</Text>
                      </View>
                      <ThemeToggle />
                    </View>
                  </View>
                </View>
              </View>

              {/* Logout - Fixed at bottom */}
              <View className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Logout',
                      'Are you sure you want to logout?',
                      [
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        },
                        {
                          text: 'Logout',
                          style: 'destructive',
                          onPress: async () => {
                            onClose();
                            await authUtils.logout();
                            const router = require('expo-router').router;
                            router.replace('/(auth)/login');
                          }
                        }
                      ]
                    );
                  }}
                  className={`flex-row items-center py-3 px-4 rounded-xl ${
                    isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="w-8 h-8 rounded-lg bg-red-100 items-center justify-center">
                    <Ionicons name="log-out" size={18} color="#EF4444" />
                  </View>
                  <Text className="ml-3 text-sm font-semibold text-red-500">
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  menuItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dashboardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Sidebar;
