import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { authUtils } from '../../utils/auth';
import ThemeToggle from '../common/ThemeToggle';
import Logo from '../common/Logo';

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
    // Close sidebar after navigation
    if (onClose) {
      onClose();
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
            borderRightWidth: 2,
            borderRightColor: isDarkMode ? '#374151' : '#14B8A6',
          }
        ]}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View className="flex-1">
              {/* Header */}
              <View className={`px-6 py-5`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <Logo size="sm" showSubtitle={false} align="flex-start" />
                  </View>
                  <TouchableOpacity
                    onPress={onClose}
                    className={`w-10 h-10 items-center justify-center rounded-xl`}
                    style={{
                      backgroundColor: isDarkMode ? '#374151' : '#F0FDFA',
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#4B5563' : '#14B8A6',
                      shadowColor: '#14B8A6',
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: 3
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={24} color={isDarkMode ? '#10B981' : '#14B8A6'} />
                  </TouchableOpacity>
                </View>

                {/* Gradient divider */}
                <View 
                  style={{
                    height: 3,
                    marginTop: 16,
                    borderRadius: 1.5,
                    backgroundColor: '#14B8A6',
                    shadowColor: '#14B8A6',
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: 4
                  }}
                />
              </View>

              {/* Navigation Menu - Scrollable */}
              <ScrollView className="flex-1 px-4 py-3" contentContainerStyle={styles.scrollContent}>
                {menuItems.map((item, index) => {
                  const active = isActive(item.id);
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleNavigation(item.id)}
                      className="mb-2.5"
                      activeOpacity={0.7}
                      style={[
                        styles.menuItem,
                        {
                          borderWidth: active ? 1.5 : 1,
                          borderColor: active ? '#10B981' : (isDarkMode ? '#374151' : '#E5E7EB'),
                          shadowColor: active ? '#14B8A6' : 'transparent',
                          shadowOpacity: active ? 0.4 : 0,
                          shadowRadius: active ? 10 : 0,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: active ? 6 : 0
                        }
                      ]}
                    >
                      {active ? (
                        <LinearGradient
                          colors={isDarkMode ? ['#0D9488', '#0891B2'] : ['#14B8A6', '#06B6D4']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.gradientBackground}
                        />
                      ) : (
                        <View 
                          className={`absolute inset-0 rounded-xl`}
                          style={{
                            backgroundColor: isDarkMode ? '#1F293780' : '#F9FAFB'
                          }}
                        />
                      )}
                      <View style={styles.menuItemContent}>
                        <View 
                          className={`w-9 h-9 rounded-xl items-center justify-center`}
                          style={{
                            backgroundColor: active ? 'rgba(255,255,255,0.25)' : (isDarkMode ? '#374151' : '#F0FDFA'),
                            borderWidth: active ? 0 : 1,
                            borderColor: isDarkMode ? '#4B5563' : '#CCFBF1'
                          }}
                        >
                          <Ionicons 
                            name={item.icon} 
                            size={20} 
                            color={active ? '#FFF' : (isDarkMode ? '#10B981' : '#14B8A6')} 
                          />
                        </View>
                        <Text className={`font-semibold flex-1 ml-3 text-base ${
                          active 
                            ? 'text-white' 
                            : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                          style={{ letterSpacing: -0.3 }}
                        >
                          {item.label}
                        </Text>
                        {active && (
                          <Ionicons name="chevron-forward" size={18} color="#FFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>

            {/* Dashboard Title at Bottom - Fixed */}
              <View className={`p-4`}
                style={{
                  borderTopWidth: 2,
                  borderTopColor: isDarkMode ? '#374151' : '#E5E7EB'
                }}
              >
                <View className={`rounded-2xl overflow-hidden`}
                  style={{
                    backgroundColor: isDarkMode ? '#374151' : '#F0FDFA',
                    borderWidth: 1.5,
                    borderColor: isDarkMode ? '#4B5563' : '#14B8A6',
                    shadowColor: '#14B8A6',
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 4
                  }}
                >
                  <View style={styles.dashboardCard}>
                    <View style={styles.dashboardContent}>
                      <LinearGradient
                        colors={['#14B8A6', '#06B6D4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          shadowColor: '#14B8A6',
                          shadowOpacity: 0.4,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 5
                        }}
                      >
                        <Ionicons 
                          name="apps" 
                          size={22} 
                          color="#FFF" 
                        />
                      </LinearGradient>
                      <View className="flex-col ml-3 flex-1">
                        <Text className={`text-xs font-semibold ${
                          isDarkMode ? 'text-teal-400' : 'text-teal-600'
                        }`}
                          style={{ letterSpacing: 0.5 }}
                        >Dashboard</Text>
                        <Text className={`text-base font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                          style={{ letterSpacing: -0.4 }}
                        >{getDashboardTitle()}</Text>
                      </View>
                      <ThemeToggle />
                    </View>
                  </View>
                </View>
              </View>

              {/* Logout - Fixed at bottom */}
              <View className={`px-4 py-3`}
                style={{
                  borderTopWidth: 2,
                  borderTopColor: isDarkMode ? '#374151' : '#E5E7EB'
                }}
              >
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
                  className={`flex-row items-center py-3.5 px-4 rounded-xl`}
                  style={{
                    backgroundColor: isDarkMode ? '#7F1D1D40' : '#FEE2E2',
                    borderWidth: 1.5,
                    borderColor: isDarkMode ? '#991B1B' : '#FCA5A5',
                    shadowColor: '#EF4444',
                    shadowOpacity: 0.2,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 3
                  }}
                  activeOpacity={0.7}
                >
                  <View 
                    className="w-9 h-9 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: isDarkMode ? '#991B1B' : '#FEE2E2',
                      borderWidth: 1,
                      borderColor: '#EF4444'
                    }}
                  >
                    <Ionicons name="log-out" size={20} color="#EF4444" />
                  </View>
                  <Text className="ml-3 text-base font-bold text-red-500"
                    style={{ letterSpacing: -0.3 }}
                  >
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
    borderRadius: 14,
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
