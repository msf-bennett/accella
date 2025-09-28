// Install Firebase Auth Web SDK
// npm install firebase
// or 
// yarn add firebase

// src/services/firebaseAuth.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { Platform } from 'react-native';

// Your Firebase config (from your Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyCGlmciUps6QR1VjCjOKYcqBoJrwVXJdeQ",
    authDomain: "athletiq-37e35.firebaseapp.com",
    projectId: "athletiq-37e35",
    storageBucket: "athletiq-37e35.firebasestorage.app",
    messagingSenderId: "497434151930",
    appId: "1:497434151930:ios:dd0a36b3faec520cf6f243",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

class FirebaseAuthService {
  constructor() {
    this.auth = auth;
  }

  // Google Sign-In with better error handling
  async signInWithGoogle() {
    try {
      console.log('🚀 Starting Firebase Google authentication...');
      
      let result;
      
      if (Platform.OS === 'web') {
        // For web, try popup first, fallback to redirect
        try {
          result = await signInWithPopup(auth, googleProvider);
          console.log('✅ Popup authentication successful');
        } catch (popupError) {
          console.log('⚠️ Popup blocked, trying redirect...', popupError.code);
          
          if (popupError.code === 'auth/popup-blocked' || 
              popupError.code === 'auth/popup-closed-by-user') {
            // Fallback to redirect
            await signInWithRedirect(auth, googleProvider);
            return { type: 'redirect' };
          } else {
            throw popupError;
          }
        }
      } else {
        // For mobile, use popup (which opens native flow)
        result = await signInWithPopup(auth, googleProvider);
      }
      
      // Extract user data
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      return {
        type: 'success',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        },
        credential: {
          accessToken: credential?.accessToken,
          idToken: credential?.idToken,
        }
      };
      
    } catch (error) {
      console.error('❌ Firebase Google auth error:', error);
      
      // Handle specific error codes
      switch (error.code) {
        case 'auth/cancelled-popup-request':
        case 'auth/popup-closed-by-user':
          return { type: 'cancelled' };
          
        case 'auth/popup-blocked':
          throw new Error('Popup blocked. Please allow popups and try again.');
          
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your connection.');
          
        case 'auth/too-many-requests':
          throw new Error('Too many requests. Please try again later.');
          
        default:
          throw new Error(error.message || 'Authentication failed');
      }
    }
  }

  // Check for redirect result on page load (web only)
  async checkRedirectResult() {
    if (Platform.OS !== 'web') return null;
    
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        console.log('✅ Redirect authentication successful');
        const user = result.user;
        const credential = GoogleAuthProvider.credentialFromResult(result);
        
        return {
          type: 'success',
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          },
          credential: {
            accessToken: credential?.accessToken,
            idToken: credential?.idToken,
          }
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Redirect result error:', error);
      throw new Error(error.message || 'Authentication failed');
    }
  }

  // Sign out
  async signOut() {
    try {
      await auth.signOut();
      console.log('✅ User signed out');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }
}

export default new FirebaseAuthService();

// src/hooks/useFirebaseAuth.js
import { useState, useEffect } from 'react';
import FirebaseAuthService from '../services/firebaseAuth';
import { Platform } from 'react-native';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    // Check for redirect result on web
    if (Platform.OS === 'web') {
      FirebaseAuthService.checkRedirectResult()
        .then((result) => {
          if (result && result.type === 'success') {
            console.log('✅ Redirect auth completed');
            // Handle successful authentication
            setUser(result.user);
          }
        })
        .catch((error) => {
          console.error('❌ Redirect auth error:', error);
        });
    }

    return unsubscribe;
  }, [initializing]);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await FirebaseAuthService.signInWithGoogle();
      
      if (result.type === 'success') {
        return result;
      } else if (result.type === 'redirect') {
        // Redirect initiated, wait for page reload
        return result;
      } else if (result.type === 'cancelled') {
        return null;
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await FirebaseAuthService.signOut();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    initializing,
    signInWithGoogle,
    signOut,
  };
};

// Usage in your AuthMethodSelection component
// Replace the Google auth handler with:

const { signInWithGoogle, loading: firebaseLoading } = useFirebaseAuth();

const handleGoogleAuth = async () => {
  if (!canUseOnlineFeatures) {
    Alert.alert(
      'No Internet Connection',
      'Google Sign-In requires an internet connection.',
      [{ text: 'OK' }]
    );
    return;
  }

  try {
    setGoogleLoading(true);
    setLocalSelection('google');
    
    const result = await signInWithGoogle();
    
    if (result && result.type === 'success') {
      // Process the Firebase user data
      const { user } = result;
      
      const googleUserData = {
        authMethod: 'google',
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        profileImage: user.photoURL || '',
        googleId: user.uid,
        emailVerified: user.emailVerified,
        username: generateUsername(
          user.displayName?.split(' ')[0] || '', 
          user.displayName?.split(' ').slice(1).join(' ') || ''
        )
      };
      
      console.log('✅ Firebase Google User Data:', googleUserData);
      
      // Call parent callback
      if (onMethodSelect) {
        onMethodSelect({
          id: 'google',
          userData: googleUserData
        });
      }
      
      Alert.alert(
        'Google Sign-In Successful',
        `Welcome ${user.displayName || user.email}!`,
        [{ 
          text: 'Continue', 
          onPress: () => onNext?.() 
        }]
      );
      
    } else if (result && result.type === 'redirect') {
      // Redirect initiated, page will reload
      console.log('🔄 Redirect initiated...');
    }
    // If result is null, user cancelled
    
  } catch (error) {
    console.error('❌ Firebase Google auth error:', error);
    Alert.alert('Authentication Failed', error.message);
  } finally {
    setGoogleLoading(false);
  }
};