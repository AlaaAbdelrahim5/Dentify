import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AuthCard = ({ title, subtitle, children, className = '' }) => {
  return (
    <View style={styles.card} className={className}>
      {/* Header */}
      <LinearGradient
        colors={['#14b8a6', '#0ea5e9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text className="text-3xl font-bold text-center text-white">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-center mt-2 text-white opacity-90">
            {subtitle}
          </Text>
        )}
      </LinearGradient>

      {/* Content */}
      <View className="p-6 bg-white">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    padding: 24,
  },
});

export default AuthCard;
