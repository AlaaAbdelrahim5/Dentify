import React from 'react';
import { View, StyleSheet } from 'react-native';

const AuthBackground = () => {
  return (
    <>
      <View style={[styles.circle, styles.topCircle]} />
      <View style={[styles.circle, styles.bottomCircle]} />
    </>
  );
};

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.2,
  },
  topCircle: {
    top: 80,
    right: 80,
    width: 288,
    height: 288,
    backgroundColor: '#5eead4', // primary-300
  },
  bottomCircle: {
    bottom: 80,
    left: 80,
    width: 384,
    height: 384,
    backgroundColor: '#7dd3fc', // secondary-300
  },
});

export default AuthBackground;
