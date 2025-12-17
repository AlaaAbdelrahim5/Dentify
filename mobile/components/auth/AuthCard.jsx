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
        colors={['#14b8a6', '#0ea5e9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    color: '#ffffff',
    opacity: 0.9,
  },
  content: {
    padding: 24,
    backgroundColor: '#ffffff',
  },
  contentDark: {
    backgroundColor: '#1F2937',
  },
});

export default AuthCard;
