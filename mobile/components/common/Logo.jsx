import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Logo = ({ size = 'md', showSubtitle = true, className = '' }) => {
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

  return (
    <View style={styles.container}>
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
            colors={['#14b8a6', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
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
                marginLeft: -(currentSize.icon / 2) + 3.5,
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
            <Text style={[styles.subtitle, { fontSize: currentSize.subtitleSize }]}>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  textContainer: {
    flexDirection: 'column',
  },
  title: {
    fontWeight: 'bold',
    color: '#0d9488',
  },
  subtitle: {
    color: '#4b5563',
    fontWeight: '500',
  },
});

export default Logo;
