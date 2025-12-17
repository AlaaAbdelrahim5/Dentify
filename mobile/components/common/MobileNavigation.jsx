import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const MobileNavigation = ({ userRole = 'patient', activeTab = 'overview', onTabChange = () => {} }) => {
  const { isDarkMode } = useTheme();

  const handleTabPress = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Navigation configuration based on user role (similar to web Sidebar)
  const getNavigationItems = () => {
    const navConfigs = {
      patient: [
        { name: 'Home', icon: 'home', iconOutline: 'home-outline', id: 'overview' },
        { name: 'Appointments', icon: 'calendar', iconOutline: 'calendar-outline', id: 'appointments' },
        { name: 'Search', icon: 'search', iconOutline: 'search-outline', id: 'search' },
        { name: 'Profile', icon: 'person', iconOutline: 'person-outline', id: 'settings' },
      ],
      dentist: [
        { name: 'Home', icon: 'home', iconOutline: 'home-outline', id: 'overview' },
        { name: 'Appointments', icon: 'calendar', iconOutline: 'calendar-outline', id: 'appointments' },
        { name: 'Patients', icon: 'people', iconOutline: 'people-outline', id: 'patients' },
        { name: 'Reports', icon: 'document-text', iconOutline: 'document-text-outline', id: 'reports' },
      ],
      secretary: [
        { name: 'Home', icon: 'home', iconOutline: 'home-outline', id: 'overview' },
        { name: 'Appointments', icon: 'calendar', iconOutline: 'calendar-outline', id: 'appointments' },
        { name: 'Patients', icon: 'people', iconOutline: 'people-outline', id: 'patients' },
        { name: 'Reports', icon: 'bar-chart', iconOutline: 'bar-chart-outline', id: 'reports' },
      ],
    };
    return navConfigs[userRole] || navConfigs.patient;
  };

  const navItems = getNavigationItems();

  const isActive = (tabId) => {
    return activeTab === tabId;
  };

  return (
    <View className="absolute bottom-0 left-0 right-0" style={{ paddingBottom: 12, paddingHorizontal: 16 }}>
      <View 
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
        style={{ 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -4 }, 
          shadowOpacity: isDarkMode ? 0.4 : 0.1, 
          shadowRadius: 12,
          elevation: 12,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: isDarkMode ? '#1F2937' : '#E5E7EB'
        }}
      >
        <View className="flex-row justify-around items-center px-2" style={{ paddingTop: 12, paddingBottom: 12 }}>
        {navItems.map((item) => {
          const active = isActive(item.id);
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleTabPress(item.id)}
              className="flex-1 items-center"
              activeOpacity={0.6}
            >
              <View className="items-center" style={{ paddingVertical: 8 }}>
                {/* Icon container with active state */}
                <View 
                  className={`items-center justify-center ${
                    active ? 'bg-teal-500' : ''
                  }`}
                  style={[
                    { width: 48, height: 48, borderRadius: 24 },
                    active && {
                      shadowColor: '#14B8A6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 6,
                      elevation: 6
                    }
                  ]}
                >
                  <Ionicons 
                    name={active ? item.icon : item.iconOutline} 
                    size={24} 
                    color={active ? '#FFFFFF' : (isDarkMode ? '#9CA3AF' : '#6B7280')} 
                  />
                </View>
                
                {/* Label */}
                <Text 
                  className={`text-xs mt-1 ${
                    active 
                      ? 'text-teal-600 font-semibold' 
                      : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                  }`}
                  style={{ letterSpacing: 0.1 }}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        </View>
      </View>
    </View>
  );
};

export default MobileNavigation;
