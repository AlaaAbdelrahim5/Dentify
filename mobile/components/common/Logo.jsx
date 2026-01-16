import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Appearance, useColorScheme } from 'react-native';

const Logo = ({ size = 'md', showSubtitle = true, className = '', align = 'center' }) => {
  const sizes = {
    sm: { 
      icon: 40, 
      iconContainer: 64, 
      textSize: 24, 
      subtitleSize: 12,
      padding: 12 
    },
    md: { 
      icon: 48, 
      iconContainer: 72, 
      textSize: 30, 
      subtitleSize: 14,
      padding: 12 
    },
    lg: { 
      icon: 60, 
      iconContainer: 84, 
      textSize: 36, 
      subtitleSize: 16,
      padding: 12 
    },
  };

  const currentSize = sizes[size] || sizes.md;

  const colorScheme = useColorScheme() || Appearance.getColorScheme() || 'light';
  // Memoize subtitle style for performance
  const subtitleStyle = useMemo(() => [
    styles.subtitle,
    { fontSize: currentSize.subtitleSize },
    colorScheme === 'dark'
      ? { color: '#cbd5e1' } // softer gray for dark mode
      : { color: '##383838' } // softer gray for light mode
  ], [colorScheme, currentSize.subtitleSize]);

  return (
    <View style={[styles.container, { alignItems: align }]}> 
      <View style={styles.logoRow}>
        <View
          style={{
            width: currentSize.iconContainer,
            height: currentSize.iconContainer,
            marginRight: 12,
            position: 'relative',
          }}
        >
          <LinearGradient
            colors={['#14b8a6', '#06b6d4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.iconContainer,
              {
                width: currentSize.iconContainer,
                height: currentSize.iconContainer,
              }
            ]}
          >
            <Image
              source={require('../../assets/tooth_icon.png')}
              style={{ 
                width: currentSize.icon, 
                height: currentSize.icon,
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginLeft: -(currentSize.icon / 2) + 2.5,
                marginTop: -(currentSize.icon / 2),
              }}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: currentSize.textSize }]}> 
            Dentify
          </Text>
          {showSubtitle && (
            <Text style={subtitleStyle}> 
              DCMS
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#99F6E4',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  textContainer: {
    flexDirection: 'column',
  },
  title: {
    fontWeight: 'bold',
    color: '#14b8a6',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default Logo;
