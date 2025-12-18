import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { getImageUrl } from '../../utils/imageUtils';

const MobileNavigation = ({ userRole = 'patient', activeTab = 'overview', onTabChange = () => {}, userData = null }) => {
  const { isDarkMode } = useTheme();

  const handleTabPress = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Navigation configuration - common tabs for all user types
  const getNavigationItems = () => {
    return [
      { name: 'Home', icon: 'home', iconOutline: 'home-outline', id: 'overview' },
      { name: 'Appointments', icon: 'calendar', iconOutline: 'calendar-outline', id: 'appointments' },
      { name: 'Treatments', icon: 'medical', iconOutline: 'medical-outline', id: 'treatments' },
      { name: 'Payments', icon: 'card', iconOutline: 'card-outline', id: 'payments' },
      { name: 'Settings', icon: 'settings', iconOutline: 'settings-outline', id: 'settings' },
    ];
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
          const isProfile = item.id === 'settings';
          
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => handleTabPress(item.id)}
              className="flex-1 items-center"
              activeOpacity={0.6}
            >
              <View className="items-center" style={{ paddingVertical: 8 }}>
                {/* Icon container with active state */}
                {isProfile ? (
                  // Profile Image
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
                    {userData?.profileImage ? (
                      <Image
                        key={userData.profileImage?.substring(0, 50)}
                        source={{ 
                          uri: getImageUrl(userData.profileImage),
                          cache: 'reload'
                        }}
                        style={{ 
                          width: 30, 
                          height: 30, 
                          borderRadius: 15,
                          borderWidth: 2,
                          borderColor: '#FFF'
                        }}
                      />
                    ) : (
                      <Ionicons 
                        name="person" 
                        size={24} 
                        color={active ? '#FFFFFF' : (isDarkMode ? '#9CA3AF' : '#6B7280')} 
                      />
                    )}
                  </View>
                ) : (
                  // Regular Icon
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
                )}
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
