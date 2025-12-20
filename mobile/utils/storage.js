import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage utility for React Native using AsyncStorage
export const storage = {
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },

  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // Silent fail
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Silent fail
    }
  },

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      // Silent fail
    }
  }
};
