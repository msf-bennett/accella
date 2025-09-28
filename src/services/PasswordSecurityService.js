import CryptoJS from 'crypto-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

// Only import Keychain on mobile platforms
let Keychain;
if (Platform.OS !== 'web') {
  try {
    Keychain = require('react-native-keychain');
  } catch (error) {
    console.warn('Keychain not available:', error);
  }
}

class PasswordSecurityService {
  constructor() {
    this.saltRounds = 10;
    this.encryptionKey = null;
    this.initializeEncryptionKey();
  }

  // Initialize encryption key asynchronously
  async initializeEncryptionKey() {
    this.encryptionKey = await this.generateEncryptionKey();
  }

  // Method 1: Generate and store a random key (Recommended)
  async generateEncryptionKey() {
    try {
      const keyStorageKey = 'acceilla_encryption_master_key';
      
      // Try to get existing key first
      let existingKey;
      
      if (Platform.OS === 'web') {
        existingKey = localStorage.getItem(keyStorageKey);
      } else {
        existingKey = await SecureStore.getItemAsync(keyStorageKey);
      }
      
      if (existingKey) {
        return existingKey;
      }
      
      // Generate new random key if none exists
      const randomBytes = await Crypto.getRandomBytesAsync(32); // 256-bit key
      const newKey = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      
      // Store the key securely
      if (Platform.OS === 'web') {
        localStorage.setItem(keyStorageKey, newKey);
      } else {
        await SecureStore.setItemAsync(keyStorageKey, newKey);
      }
      
      return newKey;
    } catch (error) {
      console.error('Error generating encryption key:', error);
      // Fallback to a hash-based key if random generation fails
      return CryptoJS.SHA256('acceilla-fallback-key-2024').toString();
    }
  }

  // Ensure encryption key is available before use
  async ensureEncryptionKey() {
    if (!this.encryptionKey) {
      this.encryptionKey = await this.generateEncryptionKey();
    }
    return this.encryptionKey;
  }

  // Hash password for storage (both local and Firestore)
  hashPassword(plainPassword) {
    const salt = CryptoJS.lib.WordArray.random(128/8).toString();
    const hash = CryptoJS.PBKDF2(plainPassword, salt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();
    
    return {
      hash: hash,
      salt: salt,
      algorithm: 'PBKDF2'
    };
  }

  // Verify password against hash
  verifyPassword(plainPassword, storedPasswordData) {
    if (!storedPasswordData || !storedPasswordData.hash || !storedPasswordData.salt) {
      return false;
    }

    const hash = CryptoJS.PBKDF2(plainPassword, storedPasswordData.salt, {
      keySize: 256/32,
      iterations: 10000
    }).toString();

    return hash === storedPasswordData.hash;
  }

  // Store password securely using Keychain (separate from user data)
  async storePasswordSecurely(userId, passwordHash) {
    try {
      const encryptionKey = await this.ensureEncryptionKey();
      const passwordData = JSON.stringify(passwordHash);
      
      if (Platform.OS === 'web') {
        // For web, use encrypted localStorage
        const encrypted = CryptoJS.AES.encrypt(passwordData, encryptionKey).toString();
        localStorage.setItem(`password_${userId}`, encrypted);
      } else {
        // For mobile, use Keychain if available
        if (Keychain && Keychain.setInternetCredentials) {
          await Keychain.setInternetCredentials(
            `acceilla_password_${userId}`,
            userId,
            passwordData
          );
        } else {
          // Fallback to encrypted AsyncStorage for mobile if Keychain fails
          const AsyncStorage = require('@react-native-async-storage/async-storage').default;
          const encrypted = CryptoJS.AES.encrypt(passwordData, encryptionKey).toString();
          await AsyncStorage.setItem(`secure_password_${userId}`, encrypted);
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error storing password:', error);
      return { success: false, error: error.message };
    }
  }

  // Retrieve password securely
  async getPasswordSecurely(userId) {
    try {
      const encryptionKey = await this.ensureEncryptionKey();
      
      if (Platform.OS === 'web') {
        const encrypted = localStorage.getItem(`password_${userId}`);
        if (!encrypted) return null;
        
        const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
      } else {
        // Try Keychain first
        if (Keychain && Keychain.getInternetCredentials) {
          try {
            const credentials = await Keychain.getInternetCredentials(`acceilla_password_${userId}`);
            if (credentials && credentials !== false && credentials.password) {
              return JSON.parse(credentials.password);
            }
          } catch (keychainError) {
            console.warn('Keychain retrieval failed, trying AsyncStorage fallback:', keychainError);
          }
        }
        
        // Fallback to AsyncStorage
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const encrypted = await AsyncStorage.getItem(`secure_password_${userId}`);
        if (!encrypted) return null;
        
        const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
      }
    } catch (error) {
      console.error('Error retrieving password:', error);
      return null;
    }
  }

  // Delete stored password
  async deletePasswordSecurely(userId) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(`password_${userId}`);
      } else {
        // Try Keychain first
        if (Keychain && Keychain.resetInternetCredentials) {
          try {
            await Keychain.resetInternetCredentials(`acceilla_password_${userId}`);
          } catch (keychainError) {
            console.warn('Keychain deletion failed:', keychainError);
          }
        }
        
        // Also clean up AsyncStorage fallback
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.removeItem(`secure_password_${userId}`);
      }
      return { success: true };
    } catch (error) {
      console.error('Error deleting password:', error);
      return { success: false, error: error.message };
    }
  }

  // Check Password History
  async getPasswordHistory(userId) {
    try {
      const encryptionKey = await this.ensureEncryptionKey();
      
      if (Platform.OS === 'web') {
        const encrypted = localStorage.getItem(`password_history_${userId}`);
        if (!encrypted) return [];
        
        const decrypted = CryptoJS.AES.decrypt(encrypted, encryptionKey).toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
      } else {
        const historyData = await SecureStore.getItemAsync(`password_history_${userId}`);
        if (!historyData) return [];
        
        return JSON.parse(historyData);
      }
    } catch (error) {
      console.error('Error retrieving password history:', error);
      return [];
    }
  }

  async storePasswordHistory(userId, passwordHistoryArray) {
    try {
      const encryptionKey = await this.ensureEncryptionKey();
      const historyData = JSON.stringify(passwordHistoryArray);
      
      if (Platform.OS === 'web') {
        const encrypted = CryptoJS.AES.encrypt(historyData, encryptionKey).toString();
        localStorage.setItem(`password_history_${userId}`, encrypted);
      } else {
        await SecureStore.setItemAsync(`password_history_${userId}`, historyData);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error storing password history:', error);
      return { success: false, error: error.message };
    }
  }

  // Key rotation method (optional - for enhanced security)
  async rotateEncryptionKey() {
    try {
      // Generate new key
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const newKey = Array.from(randomBytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      
      const keyStorageKey = 'acceilla_encryption_master_key';
      
      // Store new key
      if (Platform.OS === 'web') {
        localStorage.setItem(keyStorageKey, newKey);
      } else {
        await SecureStore.setItemAsync(keyStorageKey, newKey);
      }
      
      // Update instance
      this.encryptionKey = newKey;
      
      console.log('Encryption key rotated successfully');
      return { success: true, newKey };
    } catch (error) {
      console.error('Error rotating encryption key:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up all stored keys (useful for logout or data reset)
  async clearAllKeys() {
    try {
      const keyStorageKey = 'acceilla_encryption_master_key';
      
      if (Platform.OS === 'web') {
        localStorage.removeItem(keyStorageKey);
        // Clear all password-related items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('password_') || key.startsWith('password_history_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } else {
        await SecureStore.deleteItemAsync(keyStorageKey);
        // Note: SecureStore doesn't have a way to list all keys, 
        // so individual deletion is needed per user
      }
      
      this.encryptionKey = null;
      return { success: true };
    } catch (error) {
      console.error('Error clearing keys:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PasswordSecurityService();