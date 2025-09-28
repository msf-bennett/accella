import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info'; // or similar

class SecureStorage {
  constructor() {
    // Don't use a fixed key - generate device-specific key
    this.encryptionKey = null;
  }

  // Generate device-specific encryption key
  async getOrCreateEncryptionKey() {
    if (this.encryptionKey) return this.encryptionKey;

    try {
      // Try to get existing key first
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      let savedKey = await AsyncStorage.getItem('app_encryption_salt');
      
      if (!savedKey) {
        // Generate new device-specific key
        const deviceId = await this.getDeviceIdentifier();
        const randomSalt = CryptoJS.lib.WordArray.random(128/8).toString();
        
        // Combine device info with random salt
        savedKey = CryptoJS.SHA256(deviceId + randomSalt + 'AccellaWellness2024').toString();
        
        // Store the salt portion only (not the full key)
        await AsyncStorage.setItem('app_encryption_salt', randomSalt);
      }
      
      // Recreate key from device info + stored salt
      const deviceId = await this.getDeviceIdentifier();
      this.encryptionKey = CryptoJS.SHA256(deviceId + savedKey + 'AccellaWellness2024').toString();
      
      return this.encryptionKey;
      
    } catch (error) {
      console.warn('Failed to generate device key, using fallback');
      // Fallback to a more complex fixed key (less secure but works)
      this.encryptionKey = CryptoJS.SHA256('AccellaWellnessApp2024SecureKey!@#$' + Date.now()).toString();
      return this.encryptionKey;
    }
  }

  async getDeviceIdentifier() {
    try {
      // Use multiple device characteristics for uniqueness
      const characteristics = [
        Platform.OS,
        Platform.Version,
        await DeviceInfo.getUniqueId(),
        await DeviceInfo.getModel(),
        await DeviceInfo.getSystemVersion()
      ];
      
      return characteristics.join('|');
    } catch (error) {
      // Fallback device identifier
      return `${Platform.OS}|${Platform.Version}|${Date.now()}`;
    }
  }

  async storeSecurely(key, value, options = {}) {
    try {
      const encryptionKey = await this.getOrCreateEncryptionKey();
      
      // Add integrity check
      const dataWithHash = {
        value: value,
        timestamp: Date.now(),
        hash: CryptoJS.SHA256(value).toString() // For integrity verification
      };
      
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(dataWithHash), 
        encryptionKey
      ).toString();
      
      if (Platform.OS === 'web') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem(`secure_${key}`, encrypted);
        return { success: true, platform: 'web' };
      } else {
        // Try native secure storage first
        try {
          const SecureStore = require('expo-secure-store');
          await SecureStore.setItemAsync(key, encrypted, {
            requireAuthentication: options.requireAuth || false,
            accessGroup: options.accessGroup || undefined
          });
          return { success: true, platform: 'secure' };
        } catch (secureStoreError) {
          console.warn('SecureStore failed, using encrypted AsyncStorage:', secureStoreError);
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem(`secure_${key}`, encrypted);
          return { success: true, platform: 'encrypted_fallback' };
        }
      }
    } catch (error) {
      console.error('Secure storage failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getSecurely(key, options = {}) {
    try {
      const encryptionKey = await this.getOrCreateEncryptionKey();
      let encrypted = null;
      
      if (Platform.OS === 'web') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        encrypted = await AsyncStorage.getItem(`secure_${key}`);
      } else {
        try {
          const SecureStore = require('expo-secure-store');
          encrypted = await SecureStore.getItemAsync(key, {
            requireAuthentication: options.requireAuth || false
          });
        } catch (secureStoreError) {
          console.warn('SecureStore failed, trying AsyncStorage fallback');
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          encrypted = await AsyncStorage.getItem(`secure_${key}`);
        }
      }
      
      if (!encrypted) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedString) return null;
      
      // Parse and verify integrity
      try {
        const dataWithHash = JSON.parse(decryptedString);
        const computedHash = CryptoJS.SHA256(dataWithHash.value).toString();
        
        if (computedHash !== dataWithHash.hash) {
          console.warn('Data integrity check failed');
          return null;
        }
        
        // Check if data is too old (optional expiration)
        if (options.maxAge) {
          const age = Date.now() - dataWithHash.timestamp;
          if (age > options.maxAge) {
            console.warn('Stored data has expired');
            return null;
          }
        }
        
        return dataWithHash.value;
      } catch (parseError) {
        // Handle legacy data format (backward compatibility)
        console.warn('Legacy data format detected');
        return decryptedString;
      }
      
    } catch (error) {
      console.error('Secure retrieval failed:', error);
      return null;
    }
  }

  async removeSecurely(key) {
    try {
      if (Platform.OS === 'web') {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem(`secure_${key}`);
      } else {
        try {
          const SecureStore = require('expo-secure-store');
          await SecureStore.deleteItemAsync(key);
        } catch (secureStoreError) {
          console.warn('SecureStore removal failed:', secureStoreError);
        }
        // Also clean up AsyncStorage fallback
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem(`secure_${key}`);
      }
      return { success: true };
    } catch (error) {
      console.error('Secure removal failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility method to check if data exists
  async hasSecureItem(key) {
    const value = await this.getSecurely(key);
    return value !== null;
  }

  // Utility method to clear all secure data
  async clearAllSecureData() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const allKeys = await AsyncStorage.getAllKeys();
      const secureKeys = allKeys.filter(key => key.startsWith('secure_'));
      
      await AsyncStorage.multiRemove(secureKeys);
      
      if (Platform.OS !== 'web') {
        // Clear known secure store items (you'd need to track these)
        const knownSecureKeys = ['huggingface_api_key', 'user_credentials'];
        for (const key of knownSecureKeys) {
          try {
            const SecureStore = require('expo-secure-store');
            await SecureStore.deleteItemAsync(key);
          } catch (error) {
            // Ignore errors for non-existent keys
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new SecureStorage();