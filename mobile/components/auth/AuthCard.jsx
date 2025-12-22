import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

const AuthCard = ({ title, subtitle, children, className = '' }) => {
  const { isDarkMode } = useTheme();
  return (
    <View style={[styles.card, isDarkMode && styles.cardDark]}>
      {/* Header */}
      <LinearGradient
        colors={['#14b8a6', '#06b6d4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </LinearGradient>

      {/* Content */}
      <View style={[styles.content, isDarkMode && styles.contentDark]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#14b8a6',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151',
  },
  header: {
    padding: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    color: '#ffffff',
    opacity: 0.95,
    letterSpacing: 0.2,
  },
  content: {
    padding: 28,
    backgroundColor: '#ffffff',
  },
  contentDark: {
    backgroundColor: '#1F2937',
  },
});

export default AuthCard;
