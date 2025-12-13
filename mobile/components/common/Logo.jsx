import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Logo = ({ size = 'md', showSubtitle = true, className = '' }) => {
  const sizes = {
    sm: { icon: 40, text: 'text-2xl', subtitle: 'text-xs' },
    md: { icon: 48, text: 'text-3xl', subtitle: 'text-sm' },
    lg: { icon: 60, text: 'text-4xl', subtitle: 'text-base' },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <View style={styles.container} className={`items-center ${className}`}>
      <View style={styles.logoRow}>
        <LinearGradient
          colors={['#14b8a6', '#0ea5e9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.iconContainer, { width: currentSize.icon + 24, height: currentSize.icon + 24 }]}
        >
          <Image
            source={require('../../assets/tooth_icon.png')}
            style={{ width: currentSize.icon, height: currentSize.icon }}
            resizeMode="contain"
          />
        </LinearGradient>
        <View style={styles.textContainer}>
          <Text className={`${currentSize.text} font-bold text-primary-600`}>
            Dentify
          </Text>
          {showSubtitle && (
            <Text className={`${currentSize.subtitle} text-gray-600 font-medium`}>
              Dental Clinic Management
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginRight: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
});

export default Logo;
