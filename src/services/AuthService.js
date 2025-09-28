// Enhanced AuthService.js to bridge local and Firebase authentication

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native'; // Add this import
import { STORAGE_KEYS, USER_TYPES } from '../utils/constants';
import { auth } from '../config/firebase.config';
import PasswordSecurityService from './PasswordSecurityService';


class AuthService {
  constructor() {
    this.isWeb = Platform.OS === 'web';
    this.auth = auth;

    setTimeout(() => {
    this.initializeAuth();
  }, 2000);
  }

  // Enhanced login method that properly sets Firebase auth state
  async login(loginInput, password, loginMethod = 'email') {
    try {
      console.log('AuthService: Starting login for:', loginInput);
      
      // First, get the user data from local storage
      const storedUsers = await this.getStoredUsers();
      const localUser = this.findUserByInput(storedUsers, loginInput, loginMethod);
      
      if (!localUser) {
        throw new Error('User not found. Please check your credentials.');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(localUser, password);
      if (!isValidPassword) {
        throw new Error('Incorrect password');
      }

      // Set local authentication
      const token = this.generateToken();
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(localUser));
      await AsyncStorage.setItem('authenticatedUser', JSON.stringify(localUser));

      // CRUCIAL: Also authenticate with Firebase if user has Firebase credentials
      await this.ensureFirebaseAuth(localUser, password);

      console.log('AuthService: Login successful for:', localUser.email);
      return { user: localUser, token };

    } catch (error) {
      console.error('AuthService: Login failed:', error.message);
      throw error;
    }
  }

  // Ensure Firebase authentication matches local authentication
  async ensureFirebaseAuth(localUser, password) {
    try {
      // Skip if no Firebase UID or if already authenticated
      if (!localUser.firebaseUid && !localUser.email) {
        console.log('No Firebase credentials, skipping Firebase auth');
        return;
      }

      // Check if already authenticated with correct user
      if (auth.currentUser && auth.currentUser.uid === localUser.firebaseUid) {
        console.log('Already authenticated with Firebase');
        return;
      }

      // Try to authenticate with Firebase
      if (localUser.email && password) {
        try {
          let userCredential;
          
          if (this.isWeb) {
            const { signInWithEmailAndPassword } = require('firebase/auth');
            userCredential = await signInWithEmailAndPassword(auth, localUser.email, password);
          } else {
            userCredential = await auth.signInWithEmailAndPassword(localUser.email, password);
          }

          console.log('Successfully authenticated with Firebase:', userCredential.user.uid);
          
          // Update local user with Firebase UID if it was missing
          if (!localUser.firebaseUid) {
            localUser.firebaseUid = userCredential.user.uid;
            await this.updateStoredUser(localUser);
          }

        } catch (firebaseError) {
          console.warn('Firebase authentication failed:', firebaseError.message);
          
          // If it's a "user not found" error, the user exists locally but not in Firebase
          if (firebaseError.code === 'auth/user-not-found') {
            console.log('User exists locally but not in Firebase - this is okay for offline users');
          }
          // Don't throw error - local authentication is sufficient
        }
      }
    } catch (error) {
      console.warn('Error ensuring Firebase auth:', error.message);
      // Don't throw - local auth is sufficient
    }
  }

  // Find user by login input (email, username, or phone)
  findUserByInput(users, loginInput, loginMethod) {
    const input = loginInput.trim().toLowerCase();
    
    return users.find(user => {
      if (loginMethod === 'email' || loginInput.includes('@')) {
        return user.email && user.email.toLowerCase() === input;
      } else if (loginMethod === 'phone') {
        return user.phone === loginInput.trim();
      } else if (loginMethod === 'username') {
        return user.username && user.username.toLowerCase() === input;
      }
      
      // Fallback: check all fields
      return (user.email && user.email.toLowerCase() === input) ||
             (user.username && user.username.toLowerCase() === input) ||
             (user.phone === loginInput.trim());
    });
  }

  //Auth Bridge
  // Add this method to AuthService.js
async ensureFirebaseAuth(localUser, password = null) {
  try {
    // Skip if no Firebase UID or if already authenticated
    if (!localUser.email) {
      console.log('No email available for Firebase auth');
      return { success: false, reason: 'no_email' };
    }

    // Check if already authenticated with correct user
    if (auth.currentUser && auth.currentUser.email === localUser.email) {
      console.log('Already authenticated with Firebase');
      return { success: true, user: auth.currentUser };
    }

    // If we have a password, try to authenticate
    if (password) {
      try {
        let userCredential;
        
        if (this.isWeb) {
          const { signInWithEmailAndPassword } = require('firebase/auth');
          userCredential = await signInWithEmailAndPassword(auth, localUser.email, password);
        } else {
          userCredential = await auth.signInWithEmailAndPassword(localUser.email, password);
        }

        console.log('Successfully authenticated with Firebase:', userCredential.user.uid);
        return { success: true, user: userCredential.user };

      } catch (firebaseError) {
        console.warn('Firebase authentication failed:', firebaseError.message);
        
        if (firebaseError.code === 'auth/user-not-found') {
          // User exists locally but not in Firebase - create Firebase account
          try {
            const createResult = await this.createFirebaseAccountFromLocal(localUser, password);
            return createResult;
          } catch (createError) {
            return { success: false, reason: 'create_failed', error: createError.message };
          }
        }
        
        return { success: false, reason: 'auth_failed', error: firebaseError.message };
      }
    }

    // No password available - return pseudo-auth for offline mode
    return { 
      success: true, 
      user: { 
        uid: localUser.firebaseUid || localUser.id, 
        email: localUser.email,
        isOfflineMode: true
      }
    };

  } catch (error) {
    console.error('Error ensuring Firebase auth:', error);
    return { success: false, reason: 'error', error: error.message };
  }
}

// Helper method to create Firebase account from local user
async createFirebaseAccountFromLocal(localUser, password) {
  try {
    console.log('Creating Firebase account for local user:', localUser.email);
    
    let userCredential;
    if (this.isWeb) {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      userCredential = await createUserWithEmailAndPassword(auth, localUser.email, password);
    } else {
      userCredential = await auth.createUserWithEmailAndPassword(localUser.email, password);
    }

    // Update local user with Firebase UID
    await this.updateStoredUser({
      ...localUser,
      firebaseUid: userCredential.user.uid,
      syncedToServer: true
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error creating Firebase account:', error);
    return { success: false, reason: 'create_failed', error: error.message };
  }
}

// In AuthService.js - add this method
async createFirebaseSession(email, password) {
  try {
    let userCredential;
    if (this.isWeb) {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } else {
      userCredential = await auth.signInWithEmailAndPassword(email, password);
    }
    
    // Store session info
    await AsyncStorage.setItem('firebaseSession', JSON.stringify({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      authenticated: true,
      timestamp: Date.now()
    }));
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Add this method to your AuthService.js
// This will bridge local authentication to Firebase

async bridgeLocalToFirebase() {
  try {
    console.log('🔗 Starting authentication bridge...');
    
    // Get local user
    const localUserJson = await AsyncStorage.getItem('authenticatedUser');
    if (!localUserJson) {
      console.log('❌ No local user found');
      return { success: false, reason: 'no_local_user' };
    }
    
    const localUser = JSON.parse(localUserJson);
    console.log('📱 Local user found:', localUser.email);
    
    // Check if already authenticated with Firebase
    if (this.auth.currentUser && this.auth.currentUser.email === localUser.email) {
      console.log('✅ Already authenticated with Firebase');
      return { success: true, user: this.auth.currentUser };
    }
    
    // Try to authenticate with Firebase using stored password
    let password = null;
    
    // Get password from different sources
    if (localUser.password) {
      password = localUser.password;
    } else {
      // Try to get from secure storage
      try {
        const userId = localUser.firebaseUid || localUser.id;
        const passwordData = await PasswordSecurityService.getPasswordSecurely(userId);
        
        // If stored as plain text (legacy)
        if (passwordData && typeof passwordData === 'string') {
          password = passwordData;
        }
      } catch (secureError) {
        console.warn('Could not retrieve password:', secureError);
      }
    }
    
    if (password) {
      console.log('🔐 Attempting Firebase authentication with stored password...');
      
      try {
        let userCredential;
        
        if (this.isWeb) {
          const { signInWithEmailAndPassword } = require('firebase/auth');
          userCredential = await signInWithEmailAndPassword(this.auth, localUser.email, password);
        } else {
          userCredential = await this.auth.signInWithEmailAndPassword(localUser.email, password);
        }
        
        console.log('✅ Firebase authentication successful:', userCredential.user.uid);
        
        // Update local user with Firebase UID if missing
        if (!localUser.firebaseUid) {
          await this.updateStoredUser({
            ...localUser,
            firebaseUid: userCredential.user.uid,
            syncedToServer: true
          });
        }
        
        return { success: true, user: userCredential.user };
        
      } catch (authError) {
        console.log('❌ Firebase authentication failed:', authError.message);
        
        // If user not found in Firebase, create account
        if (authError.code === 'auth/user-not-found') {
          console.log('🆕 Creating Firebase account for local user...');
          
          try {
            let userCredential;
            
            if (this.isWeb) {
              const { createUserWithEmailAndPassword } = require('firebase/auth');
              userCredential = await createUserWithEmailAndPassword(this.auth, localUser.email, password);
            } else {
              userCredential = await this.auth.createUserWithEmailAndPassword(localUser.email, password);
            }
            
            console.log('✅ Firebase account created:', userCredential.user.uid);
            
            // Update local user
            await this.updateStoredUser({
              ...localUser,
              firebaseUid: userCredential.user.uid,
              syncedToServer: true
            });
            
            return { success: true, user: userCredential.user, created: true };
            
          } catch (createError) {
            console.log('❌ Failed to create Firebase account:', createError.message);
            return { success: false, reason: 'create_failed', error: createError.message };
          }
        }
        
        return { success: false, reason: 'auth_failed', error: authError.message };
      }
    }
    
    // No password available - return pseudo-auth for offline mode
    console.log('⚠️ No password available, using offline mode');
    return { 
      success: true, 
      user: { 
        uid: localUser.firebaseUid || localUser.id, 
        email: localUser.email,
        isOfflineMode: true
      }
    };
    
  } catch (error) {
    console.error('❌ Authentication bridge error:', error);
    return { success: false, reason: 'bridge_error', error: error.message };
  }
}

// Call this method during app initialization
// Add to your app's initialization sequence (App.js or main component)
async initializeAuth() {
  try {
    console.log('🚀 Initializing AuthService authentication...');
    
    const bridgeResult = await this.bridgeLocalToFirebase();
    
    if (bridgeResult.success) {
      console.log('✅ AuthService authentication bridge successful');
      if (bridgeResult.user.isOfflineMode) {
        console.log('📱 Operating in offline mode');
      } else {
        console.log('☁️ Connected to Firebase');
      }
    } else {
      console.log('⚠️ AuthService authentication bridge failed:', bridgeResult.reason);
    }
    
    return bridgeResult;
    
  } catch (error) {
    console.error('❌ AuthService auth initialization error:', error);
    return { success: false, error: error.message };
  }
}

// 4. Emergency Password Recovery for Firebase Auth
// Add this method to AuthService.js to handle password issues

async recoverPasswordForFirebase(userEmail) {
  try {
    console.log('🔐 Attempting password recovery for Firebase auth');
    
    // Check if user has a security question/answer
    const users = await this.getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    
    if (!user) {
      throw new Error('User not found locally');
    }
    
    // If user has security question, they can reset locally
    if (user.securityQuestion && user.securityAnswer) {
      return {
        success: true,
        hasSecurityQuestion: true,
        securityQuestion: user.securityQuestion,
        userId: user.id
      };
    }
    
    // Otherwise, suggest creating a new Firebase account
    return {
      success: false,
      reason: 'no_security_question',
      suggestion: 'create_new_firebase_account'
    };
    
  } catch (error) {
    console.error('Password recovery error:', error);
    return { success: false, error: error.message };
  }
}

// 5. Quick fix to get messaging working immediately
// Add this temporary method to ChatService.js

async enableMessagingFallback() {
  try {
    console.log('🔧 Enabling messaging fallback mode');
    
    // Get local user
    const localUserJson = await AsyncStorage.getItem('authenticatedUser');
    if (!localUserJson) {
      throw new Error('No local user found');
    }
    
    const localUser = JSON.parse(localUserJson);
    
    // Create a pseudo Firebase user for messaging
    this.fallbackUser = {
      uid: localUser.firebaseUid || localUser.id || `fallback_${Date.now()}`,
      email: localUser.email,
      displayName: `${localUser.firstName} ${localUser.lastName}`,
      isFallbackMode: true,
      localUser: localUser
    };
    
    console.log('✅ Messaging fallback enabled for:', this.fallbackUser.email);
    
    this.emitEvent('authFallbackEnabled', { user: this.fallbackUser });
    
    return { success: true, user: this.fallbackUser };
    
  } catch (error) {
    console.error('Messaging fallback error:', error);
    return { success: false, error: error.message };
  }
}


  // Verify password using secure password service
  async verifyPassword(user, password) {
    try {
      // Use secure password verification if available
      if (user.passwordHash) {
        return PasswordSecurityService.verifyPassword(password, user.passwordHash);
      }
      
      // Try to get from secure storage
      if (user.hasPassword) {
        const userId = user.id || user.firebaseUid;
        const storedPasswordData = await PasswordSecurityService.getPasswordSecurely(userId);
        
        if (storedPasswordData) {
          return PasswordSecurityService.verifyPassword(password, storedPasswordData);
        }
      }
      
      // Legacy plain text password check (should be migrated)
      if (user.password) {
        const isValid = user.password === password;
        
        // Migrate to secure storage if valid
        if (isValid) {
          await this.migrateToSecurePassword(user, password);
        }
        
        return isValid;
      }
      
      return false;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  // Migrate legacy passwords to secure storage
  async migrateToSecurePassword(user, password) {
    try {
      const hashedPassword = PasswordSecurityService.hashPassword(password);
      const userId = user.id || user.firebaseUid;
      
      // Store securely
      await PasswordSecurityService.storePasswordSecurely(userId, hashedPassword);
      
      // Update user record
      user.passwordHash = hashedPassword;
      user.hasPassword = true;
      delete user.password; // Remove plain text password
      
      await this.updateStoredUser(user);
      
      console.log('Password migrated to secure storage for user:', user.email);
    } catch (error) {
      console.error('Password migration failed:', error);
    }
  }

  // Update stored user in the users array
  async updateStoredUser(updatedUser) {
    try {
      const storedUsers = await this.getStoredUsers();
      const userIndex = storedUsers.findIndex(user => 
        user.id === updatedUser.id || user.email === updatedUser.email
      );
      
      if (userIndex >= 0) {
        storedUsers[userIndex] = updatedUser;
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(storedUsers));
        
        // Also update authenticated user if it's the current user
        const currentUserData = await AsyncStorage.getItem('authenticatedUser');
        if (currentUserData) {
          const currentUser = JSON.parse(currentUserData);
          if (currentUser.id === updatedUser.id || currentUser.email === updatedUser.email) {
            await AsyncStorage.setItem('authenticatedUser', JSON.stringify(updatedUser));
          }
        }
      }
    } catch (error) {
      console.error('Error updating stored user:', error);
    }
  }

  // Get current authentication status for both local and Firebase
  async getAuthenticationStatus() {
    try {
      const localUser = await this.getCurrentUser();
      const firebaseUser = auth.currentUser;
      
      return {
        isAuthenticated: !!localUser,
        localUser: localUser?.user || null,
        firebaseUser: firebaseUser,
        authMatched: !!(localUser && firebaseUser && 
                       (localUser.user.firebaseUid === firebaseUser.uid || 
                        localUser.user.email === firebaseUser.email))
      };
    } catch (error) {
      console.error('Error getting auth status:', error);
      return {
        isAuthenticated: false,
        localUser: null,
        firebaseUser: null,
        authMatched: false
      };
    }
  }

  // Enhanced logout to clear both local and Firebase auth
  async logout() {
    try {
      console.log('AuthService: Starting logout...');
      
      // Clear local authentication
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem('authenticatedUser');
      
      // Sign out from Firebase
      if (auth.currentUser) {
        try {
          if (this.isWeb) {
            const { signOut } = require('firebase/auth');
            await signOut(auth);
          } else {
            await auth.signOut();
          }
          console.log('Signed out from Firebase');
        } catch (firebaseError) {
          console.warn('Firebase signout error:', firebaseError.message);
        }
      }
      
      console.log('AuthService: Logout complete');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Check if user is authenticated (checks both local and ideally Firebase)
  async isAuthenticated() {
    try {
      const authStatus = await this.getAuthenticationStatus();
      return authStatus.isAuthenticated;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Get user ID that works with ChatService
async getUserIdForChat() {
  try {
    // Try normal auth first
    const authStatus = await this.getAuthenticationStatus();
    
    if (authStatus.firebaseUser) {
      return authStatus.firebaseUser.uid;
    } else if (authStatus.localUser) {
      return authStatus.localUser.firebaseUid || authStatus.localUser.id;
    }
    
    // Use fallback if available
    if (this.fallbackUser) {
      return this.fallbackUser.uid;
    }
    
    // Create fallback as last resort
    const fallbackResult = await this.enableMessagingFallback();
    if (fallbackResult.success) {
      return fallbackResult.user.uid;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user ID for chat:', error);
    return null;
  }
}

  // Existing methods (keeping for compatibility)
  static async register(userData) {
    try {
      const processedUser = {
        ...userData,
        syncedToServer: false,
        lastSyncDate: null,
      };
      
      return processedUser;
    } catch (error) {
      throw new Error('Registration failed: ' + error.message);
    }
  }
  
  static async syncWithServer() {
    try {
      const userData = await AsyncStorage.getItem('authenticatedUser');
      if (userData) {
        const user = JSON.parse(userData);
        user.syncedToServer = true;
        user.lastSyncDate = new Date().toISOString();
        await AsyncStorage.setItem('authenticatedUser', JSON.stringify(user));
        return user;
      }
    } catch (error) {
      throw new Error('Sync failed: ' + error.message);
    }
  }

  async register(userData) {
    try {
      const storedUsers = await this.getStoredUsers();
      
      const existingUser = storedUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString(),
        syncedToServer: false,
      };

      storedUsers.push(newUser);
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(storedUsers));

      const token = this.generateToken();
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser));
      await AsyncStorage.setItem('authenticatedUser', JSON.stringify(newUser));

      await this.markForSync('register', newUser);

      return { user: newUser, token };
    } catch (error) {
      throw error;
    }
  }

  async getStoredUsers() {
    try {
      const users = await AsyncStorage.getItem('registeredUsers');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      return [];
    }
  }

  async getCurrentUser() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        return {
          user: JSON.parse(userData),
          token,
        };
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async setAddNewAccountMode() {
    try {
      await AsyncStorage.setItem('addNewAccountMode', 'true');
      console.log('Add new account mode set');
    } catch (error) {
      console.error('Error setting add new account mode:', error);
    }
  }

  async isAddNewAccountMode() {
    try {
      const mode = await AsyncStorage.getItem('addNewAccountMode');
      return mode === 'true';
    } catch (error) {
      console.error('Error checking add new account mode:', error);
      return false;
    }
  }

  async clearAddNewAccountMode() {
    try {
      await AsyncStorage.removeItem('addNewAccountMode');
      console.log('Add new account mode cleared');
    } catch (error) {
      console.error('Error clearing add new account mode:', error);
    }
  }

  generateToken() {
    return 'local_token_' + Date.now() + '_' + Math.random().toString(36).substring(7);
  }

  async markForSync(action, data) {
    try {
      const pendingSync = await AsyncStorage.getItem('pending_sync');
      const syncData = pendingSync ? JSON.parse(pendingSync) : [];
      
      syncData.push({
        id: Date.now().toString(),
        action,
        data,
        timestamp: new Date().toISOString(),
        synced: false,
      });

      await AsyncStorage.setItem('pending_sync', JSON.stringify(syncData));
    } catch (error) {
      console.error('Mark for sync error:', error);
    }
  }

  async syncWithServer() {
    try {
      const pendingSync = await AsyncStorage.getItem('pending_sync');
      if (!pendingSync) return;

      const syncData = JSON.parse(pendingSync);
      const unsynced = syncData.filter(item => !item.synced);

      console.log('Sync with server - Ready for implementation');
    } catch (error) {
      console.error('Sync error:', error);
    }
  }
}

export default new AuthService();
