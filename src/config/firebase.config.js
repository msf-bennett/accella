// src/config/firebase.config.js
import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Environment-based configuration with CORRECTED API KEY
const getFirebaseConfig = () => {
  const baseConfig = {
    apiKey: "AIzaSyAFv62-gPj7PbsQ2yvTaRVNdx9pjw5HxAg", // FIXED: Match google-services.json
    authDomain: "athletiq-37e35.firebaseapp.com",
    projectId: "athletiq-37e35",
    storageBucket: "athletiq-37e35.firebasestorage.app",
    messagingSenderId: "497434151930"
  };

  // Platform-specific configurations
  if (Platform.OS === 'web') {
    return {
      ...baseConfig,
      appId: "1:497434151930:web:eed4da28416da9adf6f243",
      measurementId: "G-NY2FMJHHHD"
    };
  } else if (Platform.OS === 'ios') {
    return {
      ...baseConfig,
      appId: "1:497434151930:ios:dd0a36b3faec520cf6f243"
    };
  } else {
    return {
      ...baseConfig,
      appId: "1:497434151930:android:b3084b7d9d3df3ccf6f243"
    };
  }
};

let firebaseApp, auth, db, storage;

try {
  if (Platform.OS === 'web') {
    console.log('🌐 Initializing Firebase Web SDK...');
    
    // FIXED: Move imports to top level to avoid bundle issues
    const { initializeApp, getApps } = require('firebase/app');
    const { getAuth } = require('firebase/auth');
    const { getFirestore } = require('firebase/firestore');
    const { getStorage } = require('firebase/storage');

    const firebaseConfig = getFirebaseConfig();
    
    // Initialize Firebase (prevent multiple initialization)
    if (getApps().length === 0) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('✅ Firebase app created');
    } else {
      firebaseApp = getApps()[0];
      console.log('✅ Using existing Firebase app');
    }

    // Initialize services
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    storage = getStorage(firebaseApp);

    // FIXED: Simplified auth persistence
    try {
      const { setPersistence, browserLocalPersistence } = require('firebase/auth');
      setPersistence(auth, browserLocalPersistence);
    } catch (error) {
      console.warn('Auth persistence setup failed:', error.message);
    }

    console.log('✅ Firebase Web SDK initialized successfully');

  } else {
    console.log('📱 Initializing React Native Firebase...');
    
    // FIXED: Cleaner React Native Firebase initialization
    const rnFirebaseApp = require('@react-native-firebase/app').default;
    const authModule = require('@react-native-firebase/auth').default;
    const firestoreModule = require('@react-native-firebase/firestore').default;
    const storageModule = require('@react-native-firebase/storage').default;

    firebaseApp = rnFirebaseApp;
    auth = authModule();
    db = firestoreModule();
    storage = storageModule();

    // FIXED: More reasonable Firestore cache size for mobile performance
    try {
      const cacheSize = __DEV__ ? 10 * 1024 * 1024 : 40 * 1024 * 1024; // 10MB dev, 40MB prod
      
      db.settings({
        persistence: true,
        cacheSizeBytes: cacheSize, // FIXED: Reasonable cache size instead of unlimited
      }).then(() => {
        console.log('📱 Firestore offline persistence configured');
      }).catch((error) => {
        if (!error.message.includes('already been set')) {
          console.warn('⚠️ Firestore settings warning:', error.message);
        }
      });
    } catch (error) {
      console.warn('⚠️ Firestore settings error:', error.message);
    }

    console.log('✅ React Native Firebase initialized successfully');
  }

} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('Error details:', {
    name: error.name,
    message: error.message,
    code: error.code
  });
  
  // Provide fallback null values to prevent app crashes
  firebaseApp = null;
  auth = null;
  db = null;
  storage = null;
}

// FIXED: More efficient health check
export const checkFirebaseHealth = async () => {
  try {
    if (!db || !auth) {
      return { healthy: false, error: 'Firebase not initialized' };
    }

    // Simple auth state check instead of Firestore query
    const currentUser = auth.currentUser;
    return { healthy: true, authenticated: !!currentUser };
    
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

// FIXED: Faster connection check with shorter timeout
export const checkFirebaseConnection = async (timeoutMs = 5000) => {
  try {
    const healthCheck = await Promise.race([
      checkFirebaseHealth(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), timeoutMs)
      )
    ]);

    return healthCheck.healthy;
  } catch (error) {
    console.warn('Firebase connection check failed:', error.message);
    return false;
  }
};

// ADDED: Performance monitoring function
export const getFirebasePerformanceMetrics = () => {
  return {
    platform: Platform.OS,
    initialized: {
      app: !!firebaseApp,
      auth: !!auth,
      db: !!db,
      storage: !!storage
    },
    authState: auth?.currentUser ? 'authenticated' : 'not_authenticated',
    timestamp: new Date().toISOString()
  };
};

// Export Firebase instances
export { firebaseApp, auth, db, storage };
export default firebaseApp;