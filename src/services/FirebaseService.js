// src/services/FirebaseService.js
import { Platform } from 'react-native';
import { auth, db, storage } from '../config/firebase.config';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js';
import PasswordSecurityService from './PasswordSecurityService';

// Constants for better maintainability
const STORAGE_KEYS = {
  REGISTERED_USERS: 'registeredUsers', // Direct key, not prefixed
  AUTHENTICATED_USER: 'authenticatedUser', // Direct key, not prefixed
  OFFLINE_QUEUE: '@acceilla:offline_queue',
  SYNC_STATUS: '@acceilla:sync_status',
  USER_SESSION: '@acceilla:user_session'
};

const OPERATION_TYPES = {
  USER_REGISTRATION: 'user_registration',
  PROFILE_UPDATE: 'profile_update',
  IMAGE_UPLOAD: 'image_upload',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_UPDATE: 'PASSWORD_UPDATE',
  ACCOUNT_DELETION: 'account_deletion'
};

const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 30000, // 30 seconds
  BACKOFF_MULTIPLIER: 2
};

class FirebaseService {
  constructor() {
    this.auth = auth;
    this.firestore = db;
    this.storage = storage;
    this.isOnline = true;
    this.isInitialized = false;
    this.isWeb = Platform.OS === 'web';
    this.syncInProgress = false;
    this.eventListeners = new Set();
    
    this.setupNetworkListener();
    this.initialize();
  }

  // Event system for better component communication
  addEventListener(callback) {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  emitEvent(type, data) {
    this.eventListeners.forEach(listener => {
      try {
        listener({ type, data });
      } catch (error) {
        console.warn('Error in event listener:', error);
      }
    });
  }

  // Enhanced initialization with better error recovery
  async initialize() {
    try {
      console.log('🔥 Initializing Firebase Service...');
      
      // Test Firebase connection with timeout
      const connectionTest = await this.testConnectionWithTimeout(10000);
      const networkState = await NetInfo.fetch();
      this.isOnline = networkState.isConnected ?? false;
      
      this.isInitialized = true;
      
      if (!this.isOnline || !connectionTest.success) {
        console.log('📱 Firebase initialized in offline mode');
        this.emitEvent('initialization', { success: true, mode: 'offline', reason: connectionTest.error });
        return { success: true, offline: true, reason: connectionTest.error };
      }
      
      console.log('☁️ Firebase initialized with online connection');
      this.emitEvent('initialization', { success: true, mode: 'online' });
      
      // Start background sync process
      this.startBackgroundSync();
      
      return { success: true, offline: false };
      
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      this.isInitialized = false;
      this.emitEvent('initialization', { success: false, error: error.message });
      return { success: false, error: error.message };
    }
  }

  // Enhanced network monitoring
  setupNetworkListener() {
    NetInfo.addEventListener(async (state) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      console.log(`Network status changed: ${wasOnline ? 'Online' : 'Offline'} -> ${this.isOnline ? 'Online' : 'Offline'}`);
      
      this.emitEvent('networkChange', { 
        isOnline: this.isOnline, 
        wasOnline,
        connectionType: state.type 
      });
      
      // Auto-sync when coming online
      if (!wasOnline && this.isOnline && this.isInitialized) {
        setTimeout(() => {
          this.processOfflineQueue();
          this.syncOfflineRegistrationsToFirebase(); // Auto-sync offline registrations
        }, 2000); // Wait 2 seconds for connection to stabilize
      }
    });
  }

  // Connection test with timeout
  async testConnectionWithTimeout(timeout = 5000) {
    try {
      const testPromise = this.testFirebaseConnection();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), timeout)
      );
      
      await Promise.race([testPromise, timeoutPromise]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

async testFirebaseConnection() {
  try {
    if (this.isWeb) {
      const { collection, query, limit, getDocs } = require('firebase/firestore');
      const usersRef = collection(this.firestore, 'users');
      const testQuery = query(usersRef, limit(1));
      await getDocs(testQuery);
    } else {
      await this.firestore.collection('users').limit(1).get();
    }
  } catch (error) {
    //console.warn('Firebase connection test failed:', error);
    throw error;
  }
}

  // Check internet connection utility
  async checkInternetConnection() {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.warn('Error checking internet connection:', error);
      return false;
    }
  }

  // NEW: Sync individual user to Firebase
// Enhanced syncUserToFirebase method with proper undefined handling
async syncUserToFirebase(userData) {
  try {
    console.log('🔄 Starting user sync to Firebase for:', userData.email);
    
    const isOnline = await this.checkInternetConnection();
    if (!isOnline) {
      throw new Error('Device is offline');
    }

    // Prepare user data for Firestore
    const { password, confirmPassword, ...userDataForFirestore } = userData;
    
    const cleanedData = Object.fromEntries(
      Object.entries(userDataForFirestore).filter(([_, value]) => value !== undefined)
    );
    
    if (!cleanedData.email || !cleanedData.firstName || !cleanedData.lastName) {
      throw new Error('Missing required fields: email, firstName, or lastName');
    }

    let firebaseUid = userData.firebaseUid;
    let authUser = null;
    
    if (userData.authMethod === 'google' && userData.googleId) {
      console.log('🔐 Google auth user - attempting to link with Firebase Auth');
      
      try {
        if (!userData.password) {
          throw new Error('Google users must provide an offline password');
        }

        if (this.isWeb) {
          const { createUserWithEmailAndPassword } = require('firebase/auth');
          const userCredential = await createUserWithEmailAndPassword(
            this.auth, 
            userData.email, 
            userData.password
          );
          authUser = userCredential.user;
          firebaseUid = authUser.uid;
          
          const { updateProfile } = require('firebase/auth');
          await updateProfile(authUser, {
            displayName: `${userData.firstName} ${userData.lastName}`,
            photoURL: userData.profileImage
          });
          
        } else {
          const userCredential = await this.auth.createUserWithEmailAndPassword(
            userData.email, 
            userData.password
          );
          authUser = userCredential.user;
          firebaseUid = authUser.uid;
          
          await authUser.updateProfile({
            displayName: `${userData.firstName} ${userData.lastName}`,
            photoURL: userData.profileImage
          });
        }
        
        console.log('✅ Google user linked to Firebase Auth with real password:', firebaseUid);
        
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          console.log('📧 Email already has Firebase Auth - trying to sign in instead');
          
          try {
            if (this.isWeb) {
              const { signInWithEmailAndPassword } = require('firebase/auth');
              const signInResult = await signInWithEmailAndPassword(this.auth, userData.email, userData.password);
              authUser = signInResult.user;
              firebaseUid = authUser.uid;
            } else {
              const signInResult = await this.auth.signInWithEmailAndPassword(userData.email, userData.password);
              authUser = signInResult.user;
              firebaseUid = authUser.uid;
            }
            console.log('✅ Signed in to existing Firebase Auth account');
          } catch (signInError) {
            console.warn('⚠️ Could not sign in to existing account:', signInError.message);
            throw signInError;
          }
        } else {
          console.warn('⚠️ Could not create Firebase Auth for Google user:', authError.message);
          throw authError;
        }
      }
    } else if (!firebaseUid && userData.email && userData.password) {
      // Regular email/password users
      const authResult = await this.createFirebaseUser(userData);
      if (authResult.success) {
        firebaseUid = authResult.uid;
        authUser = authResult.user;
      } else {
        throw new Error(authResult.error || 'Failed to create Firebase user');
      }
    } else {
      firebaseUid = userData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Prepare Firestore data - now include hashed password
    const passwordData = userData.password ? 
      PasswordSecurityService.hashPassword(userData.password) : null;

    const firestoreUserData = {
      ...cleanedData,
      firebaseUid: firebaseUid,
      syncedToServer: true,
      lastSyncAt: new Date().toISOString(),
      uid: firebaseUid,
      email: cleanedData.email.toLowerCase().trim(),
      createdAt: cleanedData.createdAt || new Date().toISOString(),
      // Store hashed password in Firestore
      passwordHash: passwordData,
      hasPassword: !!passwordData,
      authMethod: cleanedData.authMethod
    };

    // Remove plain password from Firestore data
    delete firestoreUserData.password;
    delete firestoreUserData.confirmPassword;

    console.log('📝 Storing user data in Firestore with UID:', firebaseUid);

    // Store user data in Firestore
    if (this.isWeb) {
      const { doc, setDoc } = require('firebase/firestore');
      const userDocRef = doc(this.firestore, 'users', firebaseUid);
      await setDoc(userDocRef, firestoreUserData);
    } else {
      const userDocRef = this.firestore.collection('users').doc(firebaseUid);
      await userDocRef.set(firestoreUserData);
    }

    console.log('✅ User data synced to Firestore successfully');
    
    // Store password securely separate from user data
    if (passwordData) {
      const passwordStoreResult = await PasswordSecurityService.storePasswordSecurely(
        firebaseUid, 
        passwordData
      );
      
      if (!passwordStoreResult.success) {
        console.warn('⚠️ Failed to store password securely:', passwordStoreResult.error);
      } else {
        console.log('✅ Password stored securely');
      }
    }
    
    this.emitEvent('userSyncedToFirebase', { 
      userId: userData.id || firebaseUid,
      firebaseUid: firebaseUid 
    });
    
    return {
      success: true,
      firebaseUid: firebaseUid,
      firestoreId: firebaseUid,
      hasAuth: !!authUser,
      userData: firestoreUserData
    };
    
  } catch (error) {
    console.error('❌ Error syncing user to Firebase:', error);
    
    return {
      success: false,
      error: error.message,
      code: error.code || 'unknown_error'
    };
  }
}

// Real-time email validation during input
async validateEmailAvailability(email, excludeUserId = null) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    console.log('🔍 Validating email availability for:', cleanEmail);
    
    // Check locally first (faster)
    const localUsers = await this.getStoredUsers();
    const localConflict = localUsers.find(user => 
      user.email.toLowerCase() === cleanEmail && 
      user.id !== excludeUserId
    );
    
    if (localConflict) {
      console.log('❌ Email conflict found locally');
      return {
        available: false,
        source: 'local',
        message: 'This email is already registered on this device'
      };
    }
    
    // Check Firebase if online
    const isOnline = await this.checkInternetConnection();
    if (!isOnline) {
      console.log('📱 Device offline - local check only');
      return {
        available: true,
        source: 'local_only',
        message: 'Checked locally only (offline)'
      };
    }
    
    try {
      console.log('☁️ Checking email in Firebase...');
      const firebaseExists = await this.checkEmailExistsInFirebase(cleanEmail);
      if (firebaseExists) {
        console.log('❌ Email conflict found in Firebase');
        return {
          available: false,
          source: 'firebase',
          message: 'This email is already registered'
        };
      }
      console.log('✅ Email available in Firebase');
    } catch (firebaseError) {
      console.warn('Firebase email check failed:', firebaseError.message);
      // Continue with local-only validation
    }
    
    return {
      available: true,
      source: isOnline ? 'both' : 'local_only',
      message: 'Email is available'
    };
    
  } catch (error) {
    console.error('Email validation error:', error);
    return {
      available: true,
      source: 'error',
      message: 'Could not verify email availability'
    };
  }
}

// Real-time username validation during input
async validateUsernameAvailability(username, excludeUserId = null) {
  try {
    const cleanUsername = username.trim().toLowerCase();
    console.log('🔍 Validating username availability for:', cleanUsername);
    
    // Check locally first
    const localUsers = await this.getStoredUsers();
    const localConflict = localUsers.find(user => 
      user.username && user.username.toLowerCase() === cleanUsername && 
      user.id !== excludeUserId
    );
    
    if (localConflict) {
      console.log('❌ Username conflict found locally');
      return {
        available: false,
        source: 'local',
        message: 'This username is already taken on this device'
      };
    }
    
    // Check Firebase if online
    const isOnline = await this.checkInternetConnection();
    if (!isOnline) {
      return {
        available: true,
        source: 'local_only',
        message: 'Checked locally only (offline)'
      };
    }
    
    try {
      console.log('☁️ Checking username in Firebase...');
      const firebaseExists = await this.checkUsernameExists(cleanUsername);
      if (firebaseExists) {
        console.log('❌ Username conflict found in Firebase');
        return {
          available: false,
          source: 'firebase',
          message: 'This username is already taken'
        };
      }
      console.log('✅ Username available in Firebase');
    } catch (firebaseError) {
      console.warn('Firebase username check failed:', firebaseError.message);
    }
    
    return {
      available: true,
      source: isOnline ? 'both' : 'local_only',
      message: 'Username is available'
    };
    
  } catch (error) {
    console.error('Username validation error:', error);
    return {
      available: true,
      source: 'error',
      message: 'Could not verify username availability'
    };
  }
}

// Phone number validation (max 4 accounts per phone number)
async validatePhoneAvailability(phone, excludeUserId = null) {
  try {
    const cleanPhone = phone.trim();
    
    if (!cleanPhone) {
      return { available: true, count: 0, message: 'Phone number is optional' };
    }
    
    // Check locally first
    const localUsers = await this.getStoredUsers();
    const localMatches = localUsers.filter(user => 
      user.phone === cleanPhone && user.id !== excludeUserId
    );
    
    let totalCount = localMatches.length;
    
    // Check Firebase if online
    const isOnline = await this.checkInternetConnection();
    if (isOnline) {
      try {
        const firebaseCount = await this.checkPhoneUsageCount(cleanPhone);
        totalCount = Math.max(totalCount, firebaseCount); // Use higher count for safety
      } catch (firebaseError) {
        console.warn('Firebase phone check failed:', firebaseError.message);
      }
    }
    
    const maxAllowed = 4;
    const available = totalCount < maxAllowed;
    
    return {
      available,
      count: totalCount,
      maxAllowed,
      message: available 
        ? `Phone number can be used (${totalCount}/${maxAllowed} accounts)`
        : `Phone number limit reached (${totalCount}/${maxAllowed} accounts)`
    };
    
  } catch (error) {
    console.error('Phone validation error:', error);
    return {
      available: true,
      count: 0,
      message: 'Could not verify phone availability'
    };
  }
}

// Check phone usage count in Firebase
async checkPhoneUsageCount(phone) {
  try {
    if (this.isWeb) {
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } else {
      const querySnapshot = await this.firestore
        .collection('users')
        .where('phone', '==', phone)
        .get();
      return querySnapshot.size;
    }
  } catch (error) {
    console.warn('Phone count check error:', error);
    return 0;
  }
}

  // NEW: Sync all offline registrations to Firebase
  async syncOfflineRegistrationsToFirebase() {
    try {
      //console.log('🔄 Checking for offline registrations to sync...');
      
      const registeredUsers = await this.getStoredUsers();
      
      if (registeredUsers.length === 0) {
        return { success: true, syncedCount: 0 };
      }
      
      const unsynced = registeredUsers.filter(user => !user.syncedToServer);
      
      if (unsynced.length === 0) {
        //console.log('📱 No offline registrations to sync');
        return { success: true, syncedCount: 0 };
      }
      
     // console.log(`🔄 Found ${unsynced.length} offline registrations to sync`);
      
      let syncedCount = 0;
      const updatedUsers = [...registeredUsers];
      
      this.emitEvent('bulkSyncStarted', { 
        totalToSync: unsynced.length 
      });
      
      for (let i = 0; i < unsynced.length; i++) {
        const user = unsynced[i];
        
        try {
          const syncResult = await this.syncUserToFirebase(user);
          
          if (syncResult.success) {
            // Update the user in the array
            const userIndex = updatedUsers.findIndex(u => u.id === user.id || u.email === user.email);
            if (userIndex >= 0) {
              updatedUsers[userIndex] = {
                ...updatedUsers[userIndex],
                syncedToServer: true,
                firebaseUid: syncResult.firebaseUid,
                lastSyncAt: new Date().toISOString()
              };
            }
            
            syncedCount++;
            console.log(`✅ Synced user ${i + 1}/${unsynced.length}: ${user.email}`);
            
            this.emitEvent('userSyncProgress', { 
              current: i + 1,
              total: unsynced.length,
              email: user.email 
            });
          } else {
            console.warn(`⚠️ Failed to sync user ${user.email}:`, syncResult.error);
            
            this.emitEvent('userSyncFailed', { 
              email: user.email,
              error: syncResult.error 
            });
          }
        } catch (error) {
          console.error(`❌ Error syncing user ${user.email}:`, error);
          
          this.emitEvent('userSyncFailed', { 
            email: user.email,
            error: error.message 
          });
        }
      }
      
      // Update local storage with synced status
      if (syncedCount > 0) {
        await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(updatedUsers));
        console.log(`✅ Updated local storage with ${syncedCount} synced users`);
      }
      
      this.emitEvent('bulkSyncCompleted', { 
        syncedCount,
        totalUsers: unsynced.length,
        failedCount: unsynced.length - syncedCount
      });
      
      return {
        success: true,
        syncedCount,
        totalUsers: unsynced.length,
        failedCount: unsynced.length - syncedCount
      };
      
    } catch (error) {
      console.error('❌ Error syncing offline registrations:', error);
      
      this.emitEvent('bulkSyncError', { error: error.message });
      
      return {
        success: false,
        error: error.message,
        syncedCount: 0
      };
    }
  }

  // Add these methods to your FirebaseService.js class

// Phone Authentication Methods
async sendPhoneVerification(phoneNumber) {
  try {
    if (!this.isOnline) {
      throw new Error('Phone verification requires internet connection');
    }

    // Format phone number
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;

    let confirmation;
    
    if (this.isWeb) {
      const { getAuth, RecaptchaVerifier, signInWithPhoneNumber } = require('firebase/auth');
      
      // Set up reCAPTCHA for web
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            console.log('reCAPTCHA solved');
          }
        }, this.auth);
      }
      
      confirmation = await signInWithPhoneNumber(this.auth, formattedPhone, window.recaptchaVerifier);
    } else {
      // React Native implementation
      confirmation = await this.auth.signInWithPhoneNumber(formattedPhone);
    }

    console.log('📱 Phone verification sent to:', formattedPhone);
    
    return {
      success: true,
      verificationId: confirmation.verificationId,
      phoneNumber: formattedPhone
    };
    
  } catch (error) {
    console.error('Phone verification error:', error);
    throw error;
  }
}

async verifyPhoneCode(verificationId, verificationCode) {
  try {
    if (!this.isOnline) {
      throw new Error('Phone verification requires internet connection');
    }

    let credential;
    
    if (this.isWeb) {
      const { PhoneAuthProvider, signInWithCredential } = require('firebase/auth');
      
      const phoneCredential = PhoneAuthProvider.credential(verificationId, verificationCode);
      credential = await signInWithCredential(this.auth, phoneCredential);
    } else {
      // React Native implementation
      const phoneAuthCredential = this.auth.PhoneAuthProvider.credential(verificationId, verificationCode);
      credential = await this.auth.signInWithCredential(phoneAuthCredential);
    }

    console.log('✅ Phone verification successful:', credential.user.phoneNumber);
    
    return {
      success: true,
      user: credential.user,
      phoneNumber: credential.user.phoneNumber
    };
    
  } catch (error) {
    console.error('Phone code verification error:', error);
    throw error;
  }
}

// Username existence check
async checkUsernameExists(username) {
  try {
    if (!this.isOnline) {
      return false; // Assume available when offline
    }

    if (this.isWeb) {
      const { collection, query, where, limit, getDocs } = require('firebase/firestore');
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase()), limit(1));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } else {
      const usersQuery = await this.firestore
        .collection('users')
        .where('username', '==', username.toLowerCase())
        .limit(1)
        .get();
      return !usersQuery.empty;
    }
  } catch (error) {
    console.warn('Username check error:', error);
    return false; // Assume available on error
  }
}

// prevent duplicates from messaging system:
async preventDuplicateUser(userData) {
  try {
    const email = userData.email.toLowerCase().trim();
    
    // Check if user already exists with comprehensive search
    const existingLocal = await this.getStoredUsers();
    const localExists = existingLocal.find(user => 
      user.email.toLowerCase() === email
    );
    
    if (localExists) {
      console.log('🔍 User already exists locally, returning existing user');
      return {
        exists: true,
        user: localExists,
        source: 'local'
      };
    }
    
    // Check Firebase
    const isOnline = await this.checkInternetConnection();
    if (isOnline) {
      try {
        const firebaseUser = await this.findFirebaseUser(email, 'email');
        if (firebaseUser) {
          console.log('🔍 User already exists in Firebase, downloading to local');
          
          // Download Firebase user to local storage
          const downloadResult = await this.downloadCloudUserToLocal(firebaseUser);
          if (downloadResult.success) {
            return {
              exists: true,
              user: downloadResult.userData,
              source: 'firebase'
            };
          }
        }
      } catch (error) {
        console.warn('Could not check Firebase for existing user:', error.message);
      }
    }
    
    return {
      exists: false,
      user: null
    };
    
  } catch (error) {
    console.error('Error preventing duplicate user:', error);
    return {
      exists: false,
      user: null
    };
  }
}

//login search logic
// Add to FirebaseService.js
async searchUsers(searchTerm, limit = 10) {
  try {
    console.log('🔍 Searching Firebase users for:', searchTerm);
    
    if (!this.isOnline || !this.isInitialized) {
      return [];
    }

    const cleanTerm = searchTerm.toLowerCase().trim();
    let results = [];

    if (this.isWeb) {
      const { collection, query, where, limit: firestoreLimit, getDocs, orderBy } = require('firebase/firestore');
      const usersRef = collection(this.firestore, 'users');

      // Search by email
      const emailQuery = query(
        usersRef,
        where('email', '>=', cleanTerm),
        where('email', '<=', cleanTerm + '\uf8ff'),
        firestoreLimit(limit)
      );

      // Search by username  
      const usernameQuery = query(
        usersRef,
        where('username', '>=', cleanTerm),
        where('username', '<=', cleanTerm + '\uf8ff'),
        firestoreLimit(limit)
      );

      const [emailSnapshot, usernameSnapshot] = await Promise.all([
        getDocs(emailQuery),
        getDocs(usernameQuery)
      ]);

      // Combine results
      const emailResults = emailSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const usernameResults = usernameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Remove duplicates
      const combined = [...emailResults];
      usernameResults.forEach(user => {
        if (!combined.find(existingUser => existingUser.id === user.id)) {
          combined.push(user);
        }
      });

      results = combined;
      
    } else {
      // React Native Firestore
      const emailQuery = this.firestore
        .collection('users')
        .where('email', '>=', cleanTerm)
        .where('email', '<=', cleanTerm + '\uf8ff')
        .limit(limit);

      const usernameQuery = this.firestore
        .collection('users')
        .where('username', '>=', cleanTerm)
        .where('username', '<=', cleanTerm + '\uf8ff')
        .limit(limit);

      const [emailSnapshot, usernameSnapshot] = await Promise.all([
        emailQuery.get(),
        usernameQuery.get()
      ]);

      const emailResults = emailSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const usernameResults = usernameSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Remove duplicates
      const combined = [...emailResults];
      usernameResults.forEach(user => {
        if (!combined.find(existingUser => existingUser.id === user.id)) {
          combined.push(user);
        }
      });

      results = combined;
    }

    console.log(`☁️ Found ${results.length} online users matching: ${searchTerm}`);
    return results;

  } catch (error) {
    console.error('❌ Firebase user search error:', error);
    return [];
  }
}

  // Enhanced user registration with better error handling
async registerUser(userData) {
  const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log('🔄 Starting user registration for:', userData.email, 'Method:', userData.authMethod);
    
    // Validate input data
    const validationResult = this.validateRegistrationData(userData);
    if (!validationResult.valid) {
      return { success: false, error: validationResult.error };
    }

    // Clean and prepare user data
    const cleanedData = this.cleanUserData(userData);
    cleanedData.registrationId = registrationId;
    cleanedData.id = cleanedData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    cleanedData.createdAt = cleanedData.createdAt || new Date().toISOString();

    // Check if online
    const isOnline = await this.checkInternetConnection();
    
    if (!isOnline) {
      // Queue for sync when online
      await this.queueOperation({
        type: OPERATION_TYPES.USER_REGISTRATION,
        data: cleanedData,
        priority: 'high'
      });
      
      return {
        success: true,
        mode: 'offline',
        userData: cleanedData,
        message: 'Account created offline. Will sync when connected.'
      };
    }

    // Try immediate Firebase registration
    try {
      console.log('🔄 Attempting immediate Firebase sync...');
      
      // Handle different auth methods
      let firebaseResult;

      if (cleanedData.authMethod === 'google') {
        // For Google auth, user already authenticated, just store in Firestore
        // Make sure to include password for Google users too
        const googleDataWithPassword = {
          ...cleanedData,
          password: userData.password // Include original password
        };
        firebaseResult = await this.syncUserToFirebase(googleDataWithPassword);
      } else {
        // For email/phone auth, create Firebase Auth user
        // Make sure password is included
        const emailDataWithPassword = {
          ...cleanedData,
          password: userData.password // Include original password
        };
        firebaseResult = await this.createFirebaseUser(emailDataWithPassword);
      }
      
      if (firebaseResult.success) {
        console.log('✅ User immediately synced to Firebase:', firebaseResult.firebaseUid || firebaseResult.uid);
        
        this.emitEvent('userRegistered', { 
          success: true, 
          mode: 'online',
          uid: firebaseResult.firebaseUid || firebaseResult.uid
        });

        return {
          success: true,
          mode: 'online',
          uid: firebaseResult.firebaseUid || firebaseResult.uid,
          userData: { 
            ...cleanedData, 
            firebaseUid: firebaseResult.firebaseUid || firebaseResult.uid,
            syncedToServer: true,
            lastSyncAt: new Date().toISOString()
          }
        };
      } else {
        throw new Error(firebaseResult.error || 'Firebase sync failed');
      }
      
    } catch (firebaseError) {
      console.warn('Firebase registration failed, queuing for sync:', firebaseError.message);
      
      // Queue for later sync
      await this.queueOperation({
        type: OPERATION_TYPES.USER_REGISTRATION,
        data: cleanedData,
        priority: 'high'
      });

      this.emitEvent('userRegistered', { 
        success: true, 
        mode: 'queued',
        error: firebaseError.message 
      });

      return {
        success: true,
        mode: 'queued',
        userData: cleanedData,
        message: 'Account created. Firebase sync queued for retry.',
        error: firebaseError.message
      };
    }

  } catch (error) {
    console.error('Registration error:', error);
    this.emitEvent('registrationError', { error: error.message });
    return { success: false, error: this.getHumanReadableError(error) };
  }
}

  // New method: Delete user account from Firebase
async deleteUserAccount(userData) {
  try {
    console.log('🗑️ Starting Firebase account deletion for:', userData.email);
    
    const isOnline = await this.checkInternetConnection();
    if (!isOnline) {
      throw new Error('Device is offline');
    }

    const results = {
      firestoreDeleted: false,
      authDeleted: false,
      errors: []
    };

    // Delete from Firestore first
    try {
      const documentId = userData.firebaseUid || userData.uid || userData.id;
      
      if (documentId) {
        if (this.isWeb) {
          const { doc, deleteDoc } = require('firebase/firestore');
          const userDocRef = doc(this.firestore, 'users', documentId);
          await deleteDoc(userDocRef);
        } else {
          await this.firestore.collection('users').doc(documentId).delete();
        }
        
        results.firestoreDeleted = true;
        console.log('✅ User document deleted from Firestore');
      }
    } catch (firestoreError) {
      console.error('❌ Firestore deletion error:', firestoreError);
      results.errors.push(`Firestore: ${firestoreError.message}`);
    }

    // Delete from Firebase Auth if we have auth user
    try {
      if (userData.firebaseUid) {
        if (this.isWeb) {
          const { deleteUser } = require('firebase/auth');
          const currentUser = this.auth.currentUser;
          if (currentUser && currentUser.uid === userData.firebaseUid) {
            await deleteUser(currentUser);
            results.authDeleted = true;
            console.log('✅ User deleted from Firebase Auth');
          }
        } else {
          const currentUser = this.auth.currentUser;
          if (currentUser && currentUser.uid === userData.firebaseUid) {
            await currentUser.delete();
            results.authDeleted = true;
            console.log('✅ User deleted from Firebase Auth');
          }
        }
      }
    } catch (authError) {
      console.error('❌ Auth deletion error:', authError);
      results.errors.push(`Auth: ${authError.message}`);
    }

    this.emitEvent('userDeleted', { 
      userId: userData.id,
      firebaseUid: userData.firebaseUid,
      results 
    });

    return {
      success: results.firestoreDeleted || results.authDeleted,
      results,
      error: results.errors.length > 0 ? results.errors.join(', ') : null
    };

  } catch (error) {
    console.error('❌ Error deleting user account:', error);
    return {
      success: false,
      error: error.message,
      code: error.code || 'unknown_error'
    };
  }
}

// Enhanced method: Queue account deletion for offline processing
async queueAccountDeletion(userData) {
  try {
    const queueResult = await this.queueOperation({
      type: OPERATION_TYPES.ACCOUNT_DELETION,
      data: userData,
      priority: 'high',
      description: `Delete account for ${userData.email}`
    });

    this.emitEvent('accountDeletionQueued', { 
      userId: userData.id,
      email: userData.email,
      operationId: queueResult.operationId 
    });

    return queueResult;
  } catch (error) {
    console.error('❌ Error queuing account deletion:', error);
    return { success: false, error: error.message };
  }
}

  // Enhanced data validation
validateRegistrationData(userData) {
  // Required fields for all auth methods
  const requiredBase = ['email', 'firstName', 'lastName', 'username'];
  
  // Password required for email/phone auth, optional but recommended for Google
  const requiredFields = userData.authMethod === 'google' 
    ? requiredBase 
    : [...requiredBase, 'password'];
  
  const missing = requiredFields.filter(field => !userData[field]?.trim());
  
  if (missing.length > 0) {
    return { valid: false, error: `Missing required fields: ${missing.join(', ')}` };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Password validation (if provided)
  if (userData.password && userData.password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }

  // Username validation
  if (userData.username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long' };
  }

  return { valid: true };
}

  // Add this helper method to your FirebaseService class
validateFirestoreData(data) {
  const validatedData = {};
  const invalidFields = [];

  for (const [key, value] of Object.entries(data)) {
    // Skip undefined values
    if (value === undefined) {
      console.warn(`Skipping undefined field: ${key}`);
      continue;
    }

    // Handle different data types
    if (value === null) {
      validatedData[key] = null;
    } else if (typeof value === 'string') {
      validatedData[key] = value;
    } else if (typeof value === 'number') {
      if (isNaN(value) || !isFinite(value)) {
        console.warn(`Invalid number for field ${key}: ${value}`);
        invalidFields.push(key);
        continue;
      }
      validatedData[key] = value;
    } else if (typeof value === 'boolean') {
      validatedData[key] = value;
    } else if (value instanceof Date) {
      validatedData[key] = value;
    } else if (Array.isArray(value)) {
      validatedData[key] = value;
    } else if (typeof value === 'object') {
      // Recursively validate nested objects
      const nestedValidation = this.validateFirestoreData(value);
      if (nestedValidation.valid) {
        validatedData[key] = nestedValidation.data;
      } else {
        invalidFields.push(`${key}.${nestedValidation.invalidFields.join(', ')}`);
      }
    } else {
      console.warn(`Unsupported data type for field ${key}: ${typeof value}`);
      invalidFields.push(key);
    }
  }

  return {
    valid: invalidFields.length === 0,
    data: validatedData,
    invalidFields
  };
}

  // Clean and sanitize user data
  cleanUserData(userData) {
    return {
      email: userData.email.trim().toLowerCase(),
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      username: userData.username.trim().toLowerCase(),
      phone: userData.phone?.trim() || '',
      sport: userData.sport?.trim() || '',
      userType: userData.userType || 'PLAYER',
      customRole: userData.customRole?.trim() || '',
      securityQuestion: userData.securityQuestion?.trim() || '',
      securityAnswer: userData.securityAnswer ? this.hashSecurityAnswer(userData.securityAnswer) : '',
      dateOfBirth: userData.dateOfBirth || '',
      emailOptIn: userData.emailOptIn !== undefined ? userData.emailOptIn : true,
      profileImage: userData.profileImage || '',
      syncedToServer: false,
      firebaseUid: null,
      lastSyncAt: null
    };
  }

  // Store user data locally with duplicate checking
async storeUserLocally(userData) {
  try {
    const existingUsers = await this.getStoredUsers();
    
    const existingIndex = existingUsers.findIndex(user => 
      user.email === userData.email
    );
    
    // Hash and store password securely
    let passwordData = null;
    if (userData.password) {
      passwordData = PasswordSecurityService.hashPassword(userData.password);
      
      // Store password separately
      const userId = userData.id || userData.firebaseUid || `user_${Date.now()}`;
      await PasswordSecurityService.storePasswordSecurely(userId, passwordData);
    }
    
    // Prepare user data without plain password
    const secureUserData = {
      ...userData,
      hasPassword: !!passwordData,
      passwordHash: passwordData,
      updatedAt: new Date().toISOString()
    };
    
    // Remove plain password
    delete secureUserData.password;
    delete secureUserData.confirmPassword;
    
    if (existingIndex >= 0) {
      console.log('📝 Updating existing local user:', userData.email);
      existingUsers[existingIndex] = secureUserData;
    } else {
      console.log('➕ Adding new local user:', userData.email);
      
      const usernameConflict = existingUsers.find(user => 
        user.username === userData.username && user.email !== userData.email
      );
      
      if (usernameConflict) {
        return { 
          success: false, 
          error: 'Username already exists for a different account' 
        };
      }
      
      existingUsers.push({
        ...secureUserData,
        createdAt: userData.createdAt || new Date().toISOString(),
      });
    }

    await AsyncStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    // Set as current authenticated user (without password data)
    const sessionData = { ...secureUserData };
    delete sessionData.passwordHash;
    await AsyncStorage.setItem('authenticatedUser', JSON.stringify(sessionData));
    
    console.log('✅ User data stored locally securely');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error storing user locally:', error);
    return { success: false, error: 'Failed to store user data locally' };
  }
}

  // Enhanced Firebase user creation
async createFirebaseUser(userData) {
  try {
    console.log('🔍 Creating Firebase user with data:', {
      email: userData.email,
      hasPassword: !!userData.password,
      passwordLength: userData.password?.length || 0
    });

    // Validate that we have email and password
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required for Firebase Auth');
    }

    // Check if email already exists in Firebase
    const emailExists = await this.checkEmailExistsInFirebase(userData.email);
    if (emailExists) {
      throw new Error('Email already registered in Firebase');
    }

    // Create user with email and password
    let userCredential;
    
    if (this.isWeb) {
      const { createUserWithEmailAndPassword } = require('firebase/auth');
      userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email.trim(), 
        userData.password.trim()
      );
    } else {
      userCredential = await this.auth.createUserWithEmailAndPassword(
        userData.email.trim(), 
        userData.password.trim()
      );
    }

    const user = userCredential.user;
    console.log('✅ Firebase Auth user created successfully:', user.uid);

    // Prepare complete user data for Firestore
    const firestoreData = {
      ...userData,
      uid: user.uid,
      firebaseUid: user.uid,
      emailVerified: user.emailVerified,
      syncedToServer: true,
      lastSyncAt: new Date().toISOString()
    };

    // Remove password from Firestore data
    delete firestoreData.password;
    delete firestoreData.confirmPassword;

    // Add timestamps based on platform
    if (this.isWeb) {
      const { serverTimestamp } = require('firebase/firestore');
      firestoreData.createdAt = serverTimestamp();
      firestoreData.updatedAt = serverTimestamp();
    } else {
      firestoreData.createdAt = this.firestore.FieldValue.serverTimestamp();
      firestoreData.updatedAt = this.firestore.FieldValue.serverTimestamp();
    }

    // Store user data in Firestore
   // Hash the password before storing
const passwordData = userData.password ? 
  PasswordSecurityService.hashPassword(userData.password) : null;

// Update firestoreData to include hashed password
if (passwordData) {
  firestoreData.passwordHash = passwordData;
  firestoreData.hasPassword = true;
}

// Store user data in Firestore
if (this.isWeb) {
  const { doc, setDoc } = require('firebase/firestore');
  const userDocRef = doc(this.firestore, 'users', user.uid);
  await setDoc(userDocRef, firestoreData);
} else {
  await this.firestore.collection('users').doc(user.uid).set(firestoreData);
}

console.log('✅ User data stored in Firestore successfully');

// Store password securely separate from user data
if (passwordData) {
  const passwordStoreResult = await PasswordSecurityService.storePasswordSecurely(
    user.uid, 
    passwordData
  );
  
  if (!passwordStoreResult.success) {
    console.warn('⚠️ Failed to store password securely:', passwordStoreResult.error);
  } else {
    console.log('✅ Password stored securely');
  }
}

    return { 
      success: true, 
      uid: user.uid, 
      firebaseUid: user.uid,
      user,
      userData: firestoreData 
    };
    
  } catch (error) {
    console.error('❌ Firebase user creation error:', error);
    throw error;
  }
}

  // Enhanced offline queue management
  async queueOperation(operation) {
    try {
      const queue = await this.getOfflineQueue();
      
      const queuedOperation = {
        ...operation,
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        retryCount: 0,
        maxRetries: RETRY_CONFIG.MAX_RETRIES,
        nextRetry: new Date().toISOString()
      };
      
      queue.push(queuedOperation);
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      
      this.emitEvent('operationQueued', { 
        operationType: operation.type,
        queueLength: queue.length 
      });
      
      return { success: true, operationId: queuedOperation.id };
    } catch (error) {
      console.error('Error queuing operation:', error);
      return { success: false, error: error.message };
    }
  }

  // Enhanced queue processing with exponential backoff
  async processOfflineQueue() {
    if (this.syncInProgress || !this.isOnline) {
      console.log('Sync already in progress or device offline');
      return { success: false, reason: 'sync_in_progress_or_offline' };
    }

    this.syncInProgress = true;
    
    try {
      this.emitEvent('syncStarted', {});
      
      const queue = await this.getOfflineQueue();
      const pendingOperations = queue.filter(op => 
        op.retryCount < op.maxRetries && 
        new Date(op.nextRetry) <= new Date()
      );

      if (pendingOperations.length === 0) {
        this.emitEvent('syncCompleted', { processedCount: 0 });
        return { success: true, processedCount: 0 };
      }

      console.log(`🔄 Processing ${pendingOperations.length} queued operations`);
      
      const results = {
        processed: 0,
        failed: 0,
        errors: []
      };

      const remainingQueue = [...queue];

      for (const operation of pendingOperations) {
        try {
          const result = await this.processQueuedOperation(operation);
          
          if (result.success) {
            // Remove from queue
            const index = remainingQueue.findIndex(op => op.id === operation.id);
            if (index >= 0) {
              remainingQueue.splice(index, 1);
            }
            results.processed++;
          } else {
            // Update operation with retry info
            const index = remainingQueue.findIndex(op => op.id === operation.id);
            if (index >= 0) {
              const nextRetryDelay = Math.min(
                RETRY_CONFIG.BASE_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, operation.retryCount),
                RETRY_CONFIG.MAX_DELAY
              );
              
              remainingQueue[index] = {
                ...operation,
                retryCount: operation.retryCount + 1,
                lastError: result.error,
                lastAttempt: new Date().toISOString(),
                nextRetry: new Date(Date.now() + nextRetryDelay).toISOString()
              };
              
              if (operation.retryCount + 1 >= RETRY_CONFIG.MAX_RETRIES) {
                console.error(`Operation ${operation.id} exceeded max retries`);
                results.failed++;
                results.errors.push({ operationId: operation.id, error: result.error });
              }
            }
          }
        } catch (error) {
          console.error(`Error processing operation ${operation.id}:`, error);
          results.failed++;
          results.errors.push({ operationId: operation.id, error: error.message });
        }
      }

      // Save updated queue
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));
      
      this.emitEvent('syncCompleted', results);
      
      return { success: true, ...results };

    } catch (error) {
      console.error('Queue processing error:', error);
      this.emitEvent('syncError', { error: error.message });
      return { success: false, error: error.message };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Process individual queued operations
 async processQueuedOperation(operation) {
  switch (operation.type) {
    case OPERATION_TYPES.USER_REGISTRATION:
      return await this.syncUserRegistration(operation.data);
    
    case OPERATION_TYPES.PROFILE_UPDATE:
      return await this.syncProfileUpdate(operation.data);
    
    case OPERATION_TYPES.IMAGE_UPLOAD:
      return await this.syncImageUpload(operation.data);
    
    case OPERATION_TYPES.ACCOUNT_DELETION: // NEW
      return await this.syncAccountDeletion(operation.data);

    case 'PASSWORD_UPDATE':
      return await this.syncPasswordUpdate(operation.data);
    
    default:
      console.warn(`Unknown operation type: ${operation.type}`);
      return { success: false, error: 'Unknown operation type' };
  }
}

// Add new sync method for account deletion
async syncAccountDeletion(userData) {
  try {
    console.log('🔄 Processing queued account deletion for:', userData.email);
    const result = await this.deleteUserAccount(userData);
    
    if (result.success) {
      this.emitEvent('queuedAccountDeleted', { 
        email: userData.email,
        results: result.results 
      });
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

  // Sync user registration to Firebase
  async syncUserRegistration(userData) {
    try {
      const result = await this.syncUserToFirebase(userData);
      
      if (result.success) {
        // Update local user data
        await this.updateLocalUserWithFirebaseData(userData.email, {
          firebaseUid: result.firebaseUid,
          syncedToServer: true,
          lastSyncAt: new Date().toISOString()
        });
        
        this.emitEvent('userSynced', { 
          email: userData.email, 
          firebaseUid: result.firebaseUid 
        });
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Placeholder for profile update sync
  async syncProfileUpdate(updateData) {
    try {
      // Implement profile update sync logic
      console.log('Syncing profile update:', updateData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Placeholder for image upload sync
  async syncImageUpload(imageData) {
    try {
      // Implement image upload sync logic
      console.log('Syncing image upload:', imageData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper methods
async getStoredUsers() {
  try {
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    const users = usersJson ? JSON.parse(usersJson) : [];
    //console.log('📱 getStoredUsers found:', users.length, 'users');
    return users;
  } catch (error) {
    console.error('Error getting stored users:', error);
    return [];
  }
}

  async getOfflineQueue() {
    try {
      const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

async updateLocalUserWithFirebaseData(email, updates) {
  try {
    const users = await this.getStoredUsers();
    const userIndex = users.findIndex(user => user.email === email);
    
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates };
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(users)); // Use direct key
      
      // Update session data if it's the current user
      const sessionData = await AsyncStorage.getItem('authenticatedUser'); // Use direct key
      if (sessionData) {
        const currentUser = JSON.parse(sessionData);
        if (currentUser.email === email) {
          await AsyncStorage.setItem('authenticatedUser', JSON.stringify({ // Use direct key
            ...currentUser,
            ...updates
          }));
        }
      }
    }
  } catch (error) {
    console.error('Error updating local user data:', error);
  }
}

  hashSecurityAnswer(answer) {
    return CryptoJS.SHA256(answer.toLowerCase().trim()).toString();
  }

  async checkEmailExistsInFirebase(email) {
  try {
    console.log('🔍 Checking email in Firebase:', email);
    
    if (this.isWeb) {
      const { collection, query, where, limit, getDocs } = require('firebase/firestore');
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()), limit(1));
      
      // Add timeout for web requests
      const querySnapshot = await Promise.race([
        getDocs(q),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase query timeout')), 5000)
        )
      ]);
      
      return !querySnapshot.empty;
    } else {
      const usersQuery = await this.firestore
        .collection('users')
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();
      return !usersQuery.empty;
    }
  } catch (error) {
    console.error('Email check error:', error);
    throw error; // Let the caller handle the error
  }
}

  //Login Logic
  // Enhanced login method with conflict resolution
// Enhanced login method with conflict resolution
// Enhanced login method with conflict resolution and better Firebase error handling
async loginWithConflictResolution(loginInput, password, loginMethod) {
  try {
    console.log('🔐 Starting enhanced login process with conflict resolution...');
    console.log('📱 Login method detected:', loginMethod);
    
    const isOnline = await this.checkInternetConnection();
    console.log('🌐 Network status:', isOnline ? 'Online' : 'Offline');
    
    // Step 1: Always check local user first (fastest and most reliable)
    console.log('🔍 Step 1: Checking local user...');
    const localUser = await this.findLocalUser(loginInput, loginMethod);
    console.log('📱 Local user found:', !!localUser);
    
    let firebaseUser = null;
    let firebaseAccessible = false;
    
    // Step 2: Check Firebase only if online and skip if we expect it to fail
    if (isOnline) {
      try {
        console.log('🔍 Step 2: Attempting Firebase user check...');
        
        // Set a flag to track if Firebase is accessible
        firebaseAccessible = true;
        
        // Try Firebase with timeout to avoid long delays
        firebaseUser = await Promise.race([
          this.findFirebaseUser(loginInput, loginMethod),
          new Promise((resolve) => 
            setTimeout(() => {
              console.log('⏰ Firebase query timeout - continuing with local data');
              resolve(null);
            }, 5000) // 5 second timeout for login
          )
        ]);
        
        console.log('☁️ Firebase user found:', !!firebaseUser);
        
      } catch (error) {
        console.warn('⚠️ Firebase user lookup failed during login:', error.message);
        firebaseAccessible = false;
        firebaseUser = null;
        // Don't throw - continue with local-only logic
      }
    } else {
      console.log('📱 Step 2: Skipping Firebase check (offline)');
    }
    
    // Step 3: Determine login scenario with Firebase accessibility consideration
    console.log('🔍 Step 3: Determining login scenario...');
    const scenario = this.determineLoginScenarioForLogin(
      localUser, 
      firebaseUser, 
      isOnline, 
      firebaseAccessible
    );
    console.log('📊 Login scenario detected:', scenario.type);
    
    // Step 4: Handle the scenario
    console.log('🔄 Step 4: Handling login scenario...');
    const result = await this.handleLoginScenario(
      scenario, 
      localUser, 
      firebaseUser, 
      password, 
      loginInput, 
      loginMethod
    );
    
    console.log('✅ Login process completed:', {
      success: result.success,
      mode: result.mode,
      requiresResolution: result.requiresResolution
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ Enhanced login error:', error);
    throw error;
  }
}


// Determine login scenario with Firebase accessibility consideration
determineLoginScenarioForLogin(localUser, firebaseUser, isOnline, firebaseAccessible) {
  console.log('🔍 Determining login scenario for login flow...');
  console.log('📊 Scenario inputs:', {
    localUserExists: !!localUser,
    firebaseUserExists: !!firebaseUser,
    deviceOnline: isOnline,
    firebaseAccessible: firebaseAccessible
  });
  
  // Handle offline scenarios first
  if (!isOnline) {
    console.log('📱 Scenario: OFFLINE_ONLY');
    return {
      type: 'OFFLINE_ONLY',
      description: 'Device offline, checking local storage only'
    };
  }
  
  // Handle Firebase inaccessible but online
  if (isOnline && !firebaseAccessible && localUser) {
    console.log('📱 Scenario: LOCAL_ONLY_FIREBASE_INACCESSIBLE');
    return {
      type: 'LOCAL_ONLY_FIREBASE_INACCESSIBLE',
      description: 'Firebase not accessible but local user exists'
    };
  }
  
  if (isOnline && !firebaseAccessible && !localUser) {
    console.log('❌ Scenario: NO_ACCESS_TO_DATA');
    return {
      type: 'NO_ACCESS_TO_DATA',
      description: 'Firebase not accessible and no local user'
    };
  }
  
  // Handle normal scenarios when Firebase is accessible
  if (localUser && firebaseUser) {
    // Check if these are actually the same user (same email)
    const sameEmail = localUser.email?.toLowerCase() === firebaseUser.email?.toLowerCase();
    
    if (!sameEmail) {
      console.log('❌ Scenario: DIFFERENT_USERS');
      return {
        type: 'DIFFERENT_USERS',
        description: 'Local and Firebase users are different people'
      };
    }
    
    // If same email, check for data conflicts
    const hasDataConflict = this.checkDataConflicts(localUser, firebaseUser);
    const hasCredentialConflict = this.checkCredentialConflicts(localUser, firebaseUser);
    
    if (hasCredentialConflict) {
      console.log('⚠️ Scenario: CREDENTIAL_CONFLICT');
      return {
        type: 'CREDENTIAL_CONFLICT',
        description: 'User exists in both places with different credentials',
        conflicts: hasCredentialConflict
      };
    } else if (hasDataConflict) {
      console.log('⚠️ Scenario: DATA_CONFLICT');
      return {
        type: 'DATA_CONFLICT',
        description: 'User exists in both places with different data',
        conflicts: hasDataConflict
      };
    } else {
      console.log('✅ Scenario: BOTH_EXIST_SYNC');
      return {
        type: 'BOTH_EXIST_SYNC',
        description: 'User exists in both places, data matches'
      };
    }
  } else if (localUser && !firebaseUser) {
    console.log('📱 Scenario: LOCAL_ONLY');
    return {
      type: 'LOCAL_ONLY',
      description: 'User exists locally but not in Firebase'
    };
  } else if (!localUser && firebaseUser) {
    console.log('☁️ Scenario: FIREBASE_ONLY');
    return {
      type: 'FIREBASE_ONLY',
      description: 'User exists in Firebase but not locally'
    };
  } else {
    console.log('❌ Scenario: USER_NOT_FOUND');
    return {
      type: 'USER_NOT_FOUND',
      description: 'User not found anywhere'
    };
  }
}

// Find user in local storage
// Find user in local storage
async findLocalUser(loginInput, loginMethod) {
  try {
    console.log('🔍 Finding local user for:', loginInput, 'method:', loginMethod);
    
    // Use the correct storage key that matches your LoginScreen
    const users = await AsyncStorage.getItem('registeredUsers'); // Direct key, not STORAGE_KEYS.REGISTERED_USERS
    console.log('📱 Raw users from AsyncStorage:', users ? 'Found data' : 'No data');
    
    if (!users) {
      console.log('📱 Found 0 local users - no registeredUsers key');
      return null;
    }
    
    const parsedUsers = JSON.parse(users);
    console.log('📱 Found', parsedUsers.length, 'local users');
    console.log('📱 Users list:', parsedUsers.map(u => ({ email: u.email, username: u.username, firstName: u.firstName })));
    
    const inputValue = loginInput.trim().toLowerCase();
    console.log('🔍 Searching for input:', inputValue, 'with method:', loginMethod);
    
    const foundUser = parsedUsers.find(user => {
      console.log('🔍 Checking user:', { 
        email: user.email, 
        username: user.username, 
        phone: user.phone 
      });
      
      if (loginMethod === 'email' || loginInput.includes('@')) {
        const match = user.email && user.email.toLowerCase() === inputValue;
        console.log('📧 Email match:', user.email?.toLowerCase(), '===', inputValue, '→', match);
        return match;
      } else if (loginMethod === 'phone') {
        const match = user.phone === loginInput.trim();
        console.log('📞 Phone match:', user.phone, '===', loginInput.trim(), '→', match);
        return match;
      } else if (loginMethod === 'username') {
        const match = user.username && user.username.toLowerCase() === inputValue;
        console.log('👤 Username match:', user.username?.toLowerCase(), '===', inputValue, '→', match);
        return match;
      }
      
      // Fallback: check all fields
      const emailMatch = user.email && user.email.toLowerCase() === inputValue;
      const usernameMatch = user.username && user.username.toLowerCase() === inputValue;
      const phoneMatch = user.phone === loginInput.trim();
      const anyMatch = emailMatch || usernameMatch || phoneMatch;
      
      console.log('🔍 Fallback check - email:', emailMatch, 'username:', usernameMatch, 'phone:', phoneMatch, 'any:', anyMatch);
      return anyMatch;
    });
    
    if (foundUser) {
      console.log('✅ Local user found:', foundUser.email);
    } else {
      console.log('❌ No local user found for:', loginInput);
      console.log('📋 Available usernames:', parsedUsers.map(u => u.username));
      console.log('📋 Available emails:', parsedUsers.map(u => u.email));
    }
    
    return foundUser;
  } catch (error) {
    console.error('❌ Error finding local user:', error);
    return null;
  }
}

// Find user in Firebase with better error handling
async findFirebaseUser(loginInput, loginMethod) {
  try {
    //console.log('🔍 Finding Firebase user for:', loginInput, 'method:', loginMethod);
    
    if (!this.isInitialized) {
      console.warn('Firebase not initialized');
      return null;
    }

    // Quick connection test
    try {
      await this.testConnectionWithTimeout(3000);
    } catch (connectionError) {
      console.warn('Firebase connection test failed:', connectionError.message);
      return null;
    }

    let inputValue = loginInput.trim();
    let queryField = 'email';
    
    if (loginMethod === 'phone') {
      queryField = 'phone';
    } else if (loginMethod === 'username') {
      queryField = 'username';
      inputValue = inputValue.toLowerCase();
    } else if (loginInput.includes('@')) {
      queryField = 'email';
      inputValue = inputValue.toLowerCase();
    }
    
    //console.log('🔍 Querying Firebase field:', queryField, 'value:', inputValue);
    
    let userData = null;
    
    try {
      if (this.isWeb) {
        const { collection, query, where, limit, getDocs } = require('firebase/firestore');
        const usersRef = collection(this.firestore, 'users');
        const q = query(usersRef, where(queryField, '==', inputValue), limit(1));
        
        const querySnapshot = await Promise.race([
          getDocs(q),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore query timeout')), 8000)
          )
        ]);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          userData = { id: doc.id, ...doc.data() };
          //console.log('✅ Firebase user found:', userData.email);
          return userData;
        }
      } else {
        const querySnapshot = await Promise.race([
          this.firestore
            .collection('users')
            .where(queryField, '==', inputValue)
            .limit(1)
            .get(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firestore query timeout')), 8000)
          )
        ]);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          userData = { id: doc.id, ...doc.data() };
          console.log('✅ Firebase user found:', userData.email);
          return userData;
        }
      }
      
      //console.log('❌ No Firebase user found for:', loginInput);
      return null;
      
    } catch (firestoreError) {
      if (firestoreError.code === 'permission-denied' || 
          firestoreError.message.includes('Missing or insufficient permissions')) {
        console.error('🔒 Firebase permissions error - update Firestore rules');
        throw new Error('Database permissions error. Please check Firestore rules.');
      }
      throw firestoreError;
    }
    
  } catch (error) {
    console.error('❌ Firebase user search failed:', error.message);
    throw error;
  }
}

// Determine login scenario
// Determine login scenario with better error handling
determineLoginScenario(localUser, firebaseUser, isOnline, firebaseError = null) {
  console.log('🔍 Determining login scenario...');
  console.log('📊 Scenario inputs:', {
    localUserExists: !!localUser,
    firebaseUserExists: !!firebaseUser,
    deviceOnline: isOnline,
    firebaseError: !!firebaseError
  });
  
  // Handle offline scenarios first
  if (!isOnline) {
    console.log('📱 Scenario: OFFLINE_ONLY');
    return {
      type: 'OFFLINE_ONLY',
      description: 'Device offline, checking local storage only'
    };
  }
  
  // Handle Firebase connection/permission errors
  if (isOnline && firebaseError && !firebaseUser) {
    if (localUser) {
      console.log('⚠️ Scenario: LOCAL_ONLY_FIREBASE_ERROR');
      return {
        type: 'LOCAL_ONLY_FIREBASE_ERROR',
        description: 'Firebase error but local user exists',
        firebaseError: firebaseError.message
      };
    } else {
      console.log('❌ Scenario: FIREBASE_ERROR_NO_LOCAL');
      return {
        type: 'FIREBASE_ERROR_NO_LOCAL',
        description: 'Firebase error and no local user',
        firebaseError: firebaseError.message
      };
    }
  }
  
  // Handle normal conflict scenarios
  if (localUser && firebaseUser) {
    // Check for data conflicts
    const hasDataConflict = this.checkDataConflicts(localUser, firebaseUser);
    const hasCredentialConflict = this.checkCredentialConflicts(localUser, firebaseUser);
    
    if (hasCredentialConflict) {
      console.log('⚠️ Scenario: CREDENTIAL_CONFLICT');
      return {
        type: 'CREDENTIAL_CONFLICT',
        description: 'User exists in both places with different credentials',
        conflicts: hasCredentialConflict
      };
    } else if (hasDataConflict) {
      console.log('⚠️ Scenario: DATA_CONFLICT');
      return {
        type: 'DATA_CONFLICT',
        description: 'User exists in both places with different data',
        conflicts: hasDataConflict
      };
    } else {
      console.log('✅ Scenario: BOTH_EXIST_SYNC');
      return {
        type: 'BOTH_EXIST_SYNC',
        description: 'User exists in both places, data matches'
      };
    }
  } else if (localUser && !firebaseUser) {
    console.log('📱 Scenario: LOCAL_ONLY');
    return {
      type: 'LOCAL_ONLY',
      description: 'User exists locally but not in Firebase'
    };
  } else if (!localUser && firebaseUser) {
    console.log('☁️ Scenario: FIREBASE_ONLY');
    return {
      type: 'FIREBASE_ONLY',
      description: 'User exists in Firebase but not locally'
    };
  } else {
    console.log('❌ Scenario: USER_NOT_FOUND');
    return {
      type: 'USER_NOT_FOUND',
      description: 'User not found anywhere'
    };
  }
}

// Check for data conflicts
checkDataConflicts(localUser, firebaseUser) {
  console.log('🔍 Checking for data conflicts between local and Firebase user');
  
  const conflicts = [];
  const fieldsToCheck = ['firstName', 'lastName', 'phone', 'sport', 'userType', 'customRole'];
  
  fieldsToCheck.forEach(field => {
    const localValue = localUser[field]?.toString().trim() || '';
    const firebaseValue = firebaseUser[field]?.toString().trim() || '';
    
    if (localValue !== firebaseValue && (localValue || firebaseValue)) {
      console.log(`⚠️ Data conflict in field '${field}': local='${localValue}' vs firebase='${firebaseValue}'`);
      conflicts.push({
        field,
        local: localValue,
        firebase: firebaseValue
      });
    }
  });
  
  if (conflicts.length > 0) {
    console.log('🔍 Found', conflicts.length, 'data conflicts');
  } else {
    console.log('✅ No data conflicts found');
  }
  
  return conflicts.length > 0 ? conflicts : null;
}

// Check for credential conflicts
checkCredentialConflicts(localUser, firebaseUser) {
  console.log('🔍 Checking for credential conflicts between local and Firebase user');
  console.log('📊 Local user:', { email: localUser.email, username: localUser.username });
  console.log('📊 Firebase user:', { email: firebaseUser.email, username: firebaseUser.username });
  
  const conflicts = [];
  
  // Only consider it a credential conflict if:
  // 1. They have the same primary identifier (email) but different secondary identifiers, OR
  // 2. They have the same username but completely different emails (indicating potential duplicate accounts)
  
  const sameEmail = localUser.email?.toLowerCase() === firebaseUser.email?.toLowerCase();
  const sameUsername = localUser.username?.toLowerCase() === firebaseUser.username?.toLowerCase();
  
  console.log('🔍 Credential comparison:', { sameEmail, sameUsername });
  
  // If emails are different but usernames are the same, this indicates different users
  // with the same username - this should be treated as "user not found" not "credential conflict"
  if (!sameEmail && sameUsername) {
    console.log('⚠️ Different users with same username - treating as separate accounts');
    return null; // No conflict - these are different users
  }
  
  // Only flag as credential conflict if emails match but other credentials don't
  if (sameEmail && localUser.username !== firebaseUser.username) {
    console.log('⚠️ Same email, different username - credential conflict');
    conflicts.push({
      field: 'username',
      local: localUser.username,
      firebase: firebaseUser.username
    });
  }
  
  if (conflicts.length > 0) {
    console.log('🔍 Found', conflicts.length, 'credential conflicts');
  } else {
    console.log('✅ No credential conflicts found');
  }
  
  return conflicts.length > 0 ? conflicts : null;
}

// Handle different login scenarios
// Handle different login scenarios
async handleLoginScenario(scenario, localUser, firebaseUser, password, loginInput, loginMethod) {
  console.log('🎯 Handling scenario:', scenario.type);
  
  switch (scenario.type) {
    case 'OFFLINE_ONLY':
      return await this.handleOfflineLogin(localUser, password);
    
    case 'LOCAL_ONLY':
      return await this.handleLocalOnlyLogin(localUser, password);
    
    case 'LOCAL_ONLY_FIREBASE_INACCESSIBLE':
      console.log('📱 Firebase inaccessible, proceeding with local login');
      return await this.handleOfflineLogin(localUser, password);
    
    case 'NO_ACCESS_TO_DATA':
      throw new Error('Unable to access your account data. Please check your internet connection or try again later.');
    
    case 'LOCAL_ONLY_FIREBASE_ERROR':
      console.log('⚠️ Firebase error detected, proceeding with local login only');
      return await this.handleOfflineLogin(localUser, password);
    
    case 'FIREBASE_ERROR_NO_LOCAL':
      throw new Error(`Unable to verify your account. ${scenario.firebaseError}. Please ensure you have an internet connection or have previously logged in on this device.`);

    case 'DIFFERENT_USERS':
      console.log('🔄 Different users detected - proceeding with Firebase user');
      return await this.handleFirebaseOnlyLogin(firebaseUser, password, loginInput);
    
    case 'FIREBASE_ONLY':
      return await this.handleFirebaseOnlyLogin(firebaseUser, password, loginInput);
    
    case 'BOTH_EXIST_SYNC':
      return await this.handleSyncedLogin(localUser, firebaseUser, password);
    
    case 'DATA_CONFLICT':
      return {
        success: false,
        requiresResolution: true,
        conflictType: 'DATA_CONFLICT',
        conflicts: scenario.conflicts,
        localUser,
        firebaseUser
      };
    
    case 'CREDENTIAL_CONFLICT':
      return {
        success: false,
        requiresResolution: true,
        conflictType: 'CREDENTIAL_CONFLICT',
        conflicts: scenario.conflicts,
        localUser,
        firebaseUser
      };
    
    case 'USER_NOT_FOUND':
    default:
      throw new Error('User not found. Please check your credentials or create an account.');
  }
}

// Missing sync methods - add these to FirebaseService.js

async syncLocalUserToCloud(localUser) {
  try {
    console.log('☁️ Syncing local user to cloud:', localUser.email);
    
    const isOnline = await this.checkInternetConnection();
    if (!isOnline) {
      throw new Error('Device is offline');
    }
    
    // Check if email/username already exists in Firebase
    const emailExists = await this.checkEmailExistsInFirebase(localUser.email);
    const usernameExists = await this.checkUsernameExists(localUser.username);
    
    if (emailExists || usernameExists) {
      return {
        success: false,
        requiresCredentialChange: true,
        conflictField: emailExists ? 'email' : 'username',
        error: `${emailExists ? 'Email' : 'Username'} already exists in cloud`
      };
    }
    
    // Sync to Firebase
    const syncResult = await this.syncUserToFirebase(localUser);
    
    if (syncResult.success) {
      return {
        success: true,
        userData: {
          ...localUser,
          firebaseUid: syncResult.firebaseUid,
          syncedToServer: true,
          lastSyncAt: new Date().toISOString()
        }
      };
    } else {
      throw new Error(syncResult.error || 'Sync failed');
    }
    
  } catch (error) {
    console.error('❌ Sync local user to cloud error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async downloadCloudUserToLocal(firebaseUser) {
  try {
    console.log('📥 Downloading cloud user to local:', firebaseUser.email);
    
    // Prepare user data for local storage (add missing password)
    const localUserData = {
      ...firebaseUser,
      password: 'temp_password', // You'll need to handle this properly
      syncedToServer: true,
      lastSyncAt: new Date().toISOString()
    };
    
    // Store locally
    const storeResult = await this.storeUserLocally(localUserData);
    
    if (storeResult.success) {
      return {
        success: true,
        userData: localUserData
      };
    } else {
      throw new Error(storeResult.error || 'Failed to store user locally');
    }
    
  } catch (error) {
    console.error('❌ Download cloud user to local error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Handle offline login
async handleOfflineLogin(localUser, password) {
  if (!localUser) {
    throw new Error('User not found offline. Please connect to internet or check credentials.');
  }
  
  let passwordValid = false;
  
  // Check if user has new secure password system
  if (localUser.passwordHash) {
    passwordValid = PasswordSecurityService.verifyPassword(password, localUser.passwordHash);
  } else if (localUser.hasPassword) {
    // Try to get password from secure storage
    const userId = localUser.id || localUser.firebaseUid;
    const storedPasswordData = await PasswordSecurityService.getPasswordSecurely(userId);
    
    if (storedPasswordData) {
      passwordValid = PasswordSecurityService.verifyPassword(password, storedPasswordData);
    }
  } else if (localUser.password) {
    // Legacy plain password check (migrate these)
    passwordValid = localUser.password === password;
    
    // Migrate to secure storage
    if (passwordValid) {
      const hashedPassword = PasswordSecurityService.hashPassword(password);
      const userId = localUser.id || localUser.firebaseUid;
      await PasswordSecurityService.storePasswordSecurely(userId, hashedPassword);
      
      // Update local user record
      await this.updateLocalUserWithFirebaseData(localUser.email, {
        passwordHash: hashedPassword,
        hasPassword: true
      });
    }
  }
  
  if (!passwordValid) {
    throw new Error('Incorrect password');
  }
  
  const userData = { ...localUser };
  delete userData.password;
  delete userData.passwordHash;
  
  return {
    success: true,
    mode: 'offline',
    userData,
    message: 'Logged in offline. Will sync when connected.'
  };
}

// Handle local-only login (attempt sync)
async handleLocalOnlyLogin(localUser, password) {
  let passwordValid = false;
  
  // Use the same password verification logic as handleOfflineLogin
  if (localUser.passwordHash) {
    passwordValid = PasswordSecurityService.verifyPassword(password, localUser.passwordHash);
  } else if (localUser.hasPassword) {
    const userId = localUser.id || localUser.firebaseUid;
    const storedPasswordData = await PasswordSecurityService.getPasswordSecurely(userId);
    
    if (storedPasswordData) {
      passwordValid = PasswordSecurityService.verifyPassword(password, storedPasswordData);
    }
  } else if (localUser.password) {
    // Legacy plain password check
    passwordValid = localUser.password === password;
    
    // Migrate to secure storage
    if (passwordValid) {
      const hashedPassword = PasswordSecurityService.hashPassword(password);
      const userId = localUser.id || localUser.firebaseUid;
      await PasswordSecurityService.storePasswordSecurely(userId, hashedPassword);
      
      await this.updateLocalUserWithFirebaseData(localUser.email, {
        passwordHash: hashedPassword,
        hasPassword: true
      });
    }
  }
  
  if (!passwordValid) {
    throw new Error('Incorrect password');
  }
  
  // Attempt to sync to Firebase
  try {
    const syncResult = await this.syncUserToFirebase(localUser);
    
    if (syncResult.success) {
      // Update local user with Firebase UID
      await this.updateLocalUserWithFirebaseData(localUser.email, {
        firebaseUid: syncResult.firebaseUid,
        syncedToServer: true,
        lastSyncAt: new Date().toISOString()
      });
      
      const { password: _, ...userData } = localUser;
      return {
        success: true,
        mode: 'synced',
        userData: { ...userData, firebaseUid: syncResult.firebaseUid },
        message: 'Account synced successfully!'
      };
    }
  } catch (syncError) {
    console.warn('Failed to sync local user to Firebase:', syncError.message);
  }
  
  // Continue offline if sync fails
  const { password: _, ...userData } = localUser;
  return {
    success: true,
    mode: 'offline',
    userData,
    message: 'Logged in offline. Sync will retry later.'
  };
}

// Handle Firebase-only login
// Handle Firebase-only login
async handleFirebaseOnlyLogin(firebaseUser, password, loginInput) {
  try {
    console.log('🔐 Starting Firebase-only login process');
    console.log('📧 Using email for Firebase Auth:', firebaseUser.email);
    console.log('👤 Original login input was:', loginInput);
    
    // Firebase Auth ALWAYS requires email, but we already have it from firebaseUser
    const emailForAuth = firebaseUser.email;
    
    if (!emailForAuth) {
      throw new Error('No email found in user data for authentication');
    }
    
    let userCredential;
    
    if (this.isWeb) {
      const { signInWithEmailAndPassword } = require('firebase/auth');
      // Use the email from Firestore document, NOT the login input
      userCredential = await signInWithEmailAndPassword(this.auth, emailForAuth, password);
    } else {
      // Use the email from Firestore document, NOT the login input
      userCredential = await this.auth.signInWithEmailAndPassword(emailForAuth, password);
    }
    
    // Verify password hash if available
    if (firebaseUser.passwordHash) {
      const isValidHash = PasswordSecurityService.verifyPassword(password, firebaseUser.passwordHash);
      if (!isValidHash) {
        console.warn('⚠️ Password hash mismatch detected');
      }
    }
    
    console.log('✅ Firebase Auth successful for:', userCredential.user.email);
    
    // Prepare user data for local storage (include password for offline access)
    const userData = { 
      ...firebaseUser, 
      syncedToServer: true,
      password: password, // Store for offline access
      lastLoginAt: new Date().toISOString()
    };
    
    // Store user data locally for future offline access
    console.log('💾 Storing user data locally for offline access');
    const storeResult = await this.storeUserLocally(userData);
    if (!storeResult.success) {
      console.warn('⚠️ Failed to store user data locally:', storeResult.error);
      // Continue anyway since Firebase auth was successful
    } else {
      console.log('✅ User data stored locally successfully');
    }
    
    // Return clean user data (without password)
    const { password: _, ...cleanUserData } = userData;
    return {
      success: true,
      mode: 'online',
      userData: cleanUserData,
      message: 'Logged in successfully and data downloaded!'
    };
    
  } catch (authError) {
    console.error('❌ Firebase Auth failed:', {
      code: authError.code,
      message: authError.message,
      emailUsed: firebaseUser.email,
      originalInput: loginInput
    });
    
    // Provide specific error messages based on Firebase Auth error codes
    if (authError.code === 'auth/wrong-password') {
      throw new Error('Incorrect password');
    } else if (authError.code === 'auth/user-not-found') {
      throw new Error('User account not found in authentication system. The account may need to be recreated.');
    } else if (authError.code === 'auth/user-disabled') {
      throw new Error('User account has been disabled. Please contact support.');
    } else if (authError.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please wait before trying again.');
    } else if (authError.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (authError.code === 'auth/invalid-email') {
      throw new Error('Invalid email format found in user data. Please contact support.');
    } else {
      // Generic fallback
      throw new Error('Authentication failed. Please check your password and try again.');
    }
  }
}

//Password change Update password
async updateUserPassword(userId, hashedPassword, passwordHistory = []) {
  try {
    console.log('🔐 Updating user password in Firebase for:', userId);
    
    const isOnline = await this.checkInternetConnection();
    if (!isOnline) {
      throw new Error('Device is offline');
    }

    const updateData = {
      passwordHash: hashedPassword,
      hasPassword: true,
      passwordUpdatedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
      syncedToServer: true,
      passwordHistoryCount: passwordHistory.length // Store count for security audit
    };

    if (this.isWeb) {
      const { doc, updateDoc } = require('firebase/firestore');
      const userDocRef = doc(this.firestore, 'users', userId);
      await updateDoc(userDocRef, updateData);
    } else {
      const userDocRef = this.firestore.collection('users').doc(userId);
      await userDocRef.update(updateData);
    }

    // Store password and history securely
    await PasswordSecurityService.storePasswordSecurely(userId, hashedPassword);
    await PasswordSecurityService.storePasswordHistory(userId, passwordHistory);

    console.log('✅ Password and history updated in Firebase and secure storage');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error updating user password in Firebase:', error);
    return { success: false, error: error.message };
  }
}

async syncPasswordUpdate(passwordData) {
  try {
    console.log('🔄 Processing queued password update for:', passwordData.email);
    const result = await this.updateUserPassword(passwordData.userId, passwordData.passwordHash);
    
    if (result.success) {
      this.emitEvent('passwordUpdated', { 
        userId: passwordData.userId,
        email: passwordData.email,
        updatedAt: passwordData.updatedAt
      });
    }
    
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Handle synced login
async handleSyncedLogin(localUser, firebaseUser, password) {
  // Use secure password verification
  let passwordValid = false;
  
  if (localUser.passwordHash) {
    passwordValid = PasswordSecurityService.verifyPassword(password, localUser.passwordHash);
  } else if (localUser.hasPassword) {
    const userId = localUser.id || localUser.firebaseUid;
    const storedPasswordData = await PasswordSecurityService.getPasswordSecurely(userId);
    
    if (storedPasswordData) {
      passwordValid = PasswordSecurityService.verifyPassword(password, storedPasswordData);
    }
  } else if (localUser.password) {
    passwordValid = localUser.password === password;
  }
  
  if (!passwordValid) {
    throw new Error('Incorrect password');
  }
  
  // Use Firebase data as source of truth, but keep local password
  const mergedUser = {
    ...firebaseUser,
    password: localUser.password, // Keep local password
    syncedToServer: true,
    lastSyncAt: new Date().toISOString()
  };
  
  // Update local storage
  await this.updateLocalUserWithFirebaseData(localUser.email, mergedUser);
  
  const { password: _, ...userData } = mergedUser;
  return {
    success: true,
    mode: 'synced',
    userData,
    message: 'Welcome back!'
  };
}

// Resolve data conflicts
async resolveDataConflicts(localUser, firebaseUser, resolutions) {
  try {
    console.log('🔄 Resolving data conflicts with', resolutions.length, 'resolutions');
    
    const mergedUser = { ...localUser };
    
    // Apply user's conflict resolutions
    resolutions.forEach(resolution => {
      console.log(`📝 Applying resolution for ${resolution.field}: ${resolution.choice}`);
      
      if (resolution.choice === 'local') {
        mergedUser[resolution.field] = localUser[resolution.field];
      } else if (resolution.choice === 'firebase') {
        mergedUser[resolution.field] = firebaseUser[resolution.field];
      } else if (resolution.choice === 'custom') {
        mergedUser[resolution.field] = resolution.customValue;
      }
    });
    
    // Update timestamps and sync status
    mergedUser.lastSyncAt = new Date().toISOString();
    mergedUser.syncedToServer = true;
    
    // Update Firebase first
    console.log('☁️ Syncing resolved data to Firebase...');
    const syncResult = await this.syncUserToFirebase(mergedUser);
    if (!syncResult.success) {
      throw new Error('Failed to sync resolved data to Firebase');
    }
    
    // Update local storage
    console.log('📱 Updating local storage with resolved data...');
    await this.updateLocalUserWithFirebaseData(mergedUser.email, mergedUser);
    
    console.log('✅ Data conflicts resolved successfully');
    
    return {
      success: true,
      userData: mergedUser,
      message: 'Conflicts resolved successfully!'
    };
    
  } catch (error) {
    console.error('❌ Error resolving conflicts:', error);
    throw error;
  }
}

  // Start background sync process
  startBackgroundSync() {
    // Process queue every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.processOfflineQueue();
        // Also check for unsynced users periodically
        this.syncOfflineRegistrationsToFirebase();
      }
    }, 30000);
  }

  // Convert technical errors to user-friendly messages
  getHumanReadableError(error) {
    const errorMap = {
      'auth/email-already-in-use': 'This email is already registered. Please try signing in instead.',
      'auth/weak-password': 'Please choose a stronger password (at least 8 characters).',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/network-request-failed': 'Network error. Please check your connection and try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    };

    if (error.code && errorMap[error.code]) {
      return errorMap[error.code];
    }

    if (error.message) {
      if (error.message.includes('network') || error.message.includes('timeout')) {
        return 'Network error. Your data has been saved locally and will sync when you\'re back online.';
      }
      if (error.message.includes('storage')) {
        return 'Storage error. Please check your device storage and try again.';
      }
    }

    return 'Something went wrong. Please try again.';
  }

  // Get sync statistics
  async getSyncStatus() {
    try {
      const queue = await this.getOfflineQueue();
      const users = await this.getStoredUsers();
      const unsyncedUsers = users.filter(user => !user.syncedToServer);
      
      return {
        isOnline: this.isOnline,
        isInitialized: this.isInitialized,
        syncInProgress: this.syncInProgress,
        pendingOperations: queue.length,
        unsyncedUsers: unsyncedUsers.length,
        totalUsers: users.length
      };
    } catch (error) {
      return {
        isOnline: this.isOnline,
        isInitialized: this.isInitialized,
        syncInProgress: this.syncInProgress,
        error: error.message
      };
    }
  }
}


// Export singleton instance
export default new FirebaseService();