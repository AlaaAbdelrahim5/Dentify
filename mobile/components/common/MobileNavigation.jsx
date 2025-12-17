import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const MobileNavigation = ({ userRole = 'patient' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isDarkMode } = useTheme();

  // Navigation configuration based on user role (similar to web Sidebar)
  const getNavigationItems = () => {
    const navConfigs = {
      patient: [
        { name: 'Home', icon: 'home', iconOutline: 'home-outline', route: '/dashboard' },
        { name: 'Appointments', icon: 'calendar', iconOutline: 'calendar-outline', route: '/dashboard/patient/appointments' },
        { name: 'Search', icon: 'search', iconOutline: 'search-outline', route: '/dashboard/patient/search' },
        { name: 'Profile', icon: 'person', iconOutline: 'person-outline', route: '/dashboard/patient/profile' },
      ],
      dentist: [
        { name: 'Home', icon: 'home', iconOutline: 'home-outline', route: '/dashboard' },
        { name: 'Appointments', icon: 'calendar', iconOutline: 'calendar-outline', route: '/dashboard/dentist/appointments' },
        { name: 'Patients', icon: 'people', iconOutline: 'people-outline', route: '/dashboard/dentist/patients' },
        { name: 'Profile', icon: 'person', iconOutline: 'person-outline', route: '/dashboard/dentist/profile' },
      ],
      secretary: [
        { name: 'Home', icon: 'home', iconOutline: 'home-outline', route: '/dashboard' },
        { name: 'Appointments', icon: 'calendar', iconOutline: 'calendar-outline', route: '/dashboard/secretary/appointments' },
        { name: 'Patients', icon: 'people', iconOutline: 'people-outline', route: '/dashboard/secretary/patients' },
        { name: 'Profile', icon: 'person', iconOutline: 'person-outline', route: '/dashboard/secretary/profile' },
      ],
    };
    return navConfigs[userRole] || navConfigs.patient;
  };

  const navItems = getNavigationItems();

  const isActive = (route) => {
    if (route === '/dashboard') {
      return pathname === route || pathname === '/dashboard/';
    }
    return pathname.startsWith(route);
  };

  return (
    <View 
      className={`border-t ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
      style={{ 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: -4 }, 
        shadowOpacity: isDarkMode ? 0.3 : 0.08, 
        shadowRadius: 12,
        elevation: 20
      }}
    >
      <View className="flex-row justify-around items-center px-4 py-2">
        {navItems.map((item) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => router.push(item.route)}
              className="flex-1 items-center"
              activeOpacity={0.7}
            >
              <View className="items-center py-2">
                <View 
                  className={`w-12 h-12 rounded-2xl items-center justify-center ${
                    active ? 'bg-gradient-to-br from-teal-500 to-teal-600' : ''
                  }`}
                  style={active ? {
                    shadowColor: '#14B8A6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                    backgroundColor: '#14B8A6'
                  } : {}}
                >
                  <Ionicons 
                    name={active ? item.icon : item.iconOutline} 
                    size={26} 
                    color={active ? '#FFFFFF' : '#9CA3AF'} 
                  />
                </View>
                <Text 
                  className={`text-xs mt-1.5 font-semibold ${
                    active ? 'text-teal-600' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  style={{ letterSpacing: 0.2 }}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default MobileNavigation;
