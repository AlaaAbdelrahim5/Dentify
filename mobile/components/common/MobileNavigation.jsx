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
    <View className="absolute bottom-0 left-0 right-0" style={{ paddingBottom: 16, paddingHorizontal: 16 }}>
      {/* Gradient backdrop blur effect */}
      <View 
        className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
        style={{ 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: -6 }, 
          shadowOpacity: isDarkMode ? 0.5 : 0.15, 
          shadowRadius: 16,
          elevation: 16,
          borderRadius: 28,
          borderWidth: 1.5,
          borderColor: isDarkMode ? '#374151' : '#14B8A6',
          overflow: 'hidden'
        }}
      >
        {/* Top accent gradient line */}
        <View 
          style={{
            height: 3,
            width: '100%',
            backgroundColor: '#14B8A6',
            shadowColor: '#14B8A6',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 6,
            elevation: 3
          }}
        />
        
        <View className="flex-row justify-around items-center px-2" style={{ paddingTop: 14, paddingBottom: 14 }}>
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
              <View className="items-center" style={{ paddingVertical: 6 }}>
                {/* Icon container with active state */}
                {isProfile ? (
                  // Profile Image
                  <View 
                    className={`items-center justify-center overflow-hidden`}
                    style={[
                      { 
                        width: 52, 
                        height: 52, 
                        borderRadius: 26,
                        backgroundColor: active ? '#14B8A6' : (isDarkMode ? '#1F2937' : '#F0FDFA'),
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? '#10B981' : (isDarkMode ? '#374151' : '#99F6E4')
                      },
                      active && {
                        shadowColor: '#14B8A6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8
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
                          width: 52, 
                          height: 52, 
                          borderRadius: 26
                        }}
                      />
                    ) : (
                      <Ionicons 
                        name="person" 
                        size={26} 
                        color={active ? '#FFFFFF' : (isDarkMode ? '#10B981' : '#14B8A6')} 
                      />
                    )}
                  </View>
                ) : (
                  // Regular Icon
                  <View 
                    className={`items-center justify-center`}
                    style={[
                      { 
                        width: 52, 
                        height: 52, 
                        borderRadius: 26,
                        backgroundColor: active ? '#14B8A6' : (isDarkMode ? '#1F2937' : '#F0FDFA'),
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? '#10B981' : (isDarkMode ? '#374151' : '#99F6E4')
                      },
                      active && {
                        shadowColor: '#14B8A6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 8
                      }
                    ]}
                  >
                    <Ionicons 
                      name={active ? item.icon : item.iconOutline} 
                      size={26} 
                      color={active ? '#FFFFFF' : (isDarkMode ? '#10B981' : '#14B8A6')} 
                    />
                  </View>
                )}
                {/* Active indicator dot */}
                {active && (
                  <View 
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#14B8A6',
                      marginTop: 4,
                      shadowColor: '#14B8A6',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 4,
                      elevation: 4
                    }}
                  />
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
