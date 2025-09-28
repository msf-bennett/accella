// src/screens/RegistrationScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Alert,
  StyleSheet,
  Animated,
  BackHandler,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
//import GoogleSignIn from '@react-native-google-signin/google-signin';

// Components
import RegistrationContainer from '../components/registration/RegistrationContainer';
import ReduxProvider from '../components/providers/ReduxProvider';

// Hooks
import useRegistration from '../hooks/useRegistration';
import useNetworkStatus from '../hooks/useNetworkStatus';

// Utils
import authUtils from '../utils/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Main Registration Screen with Google OAuth Integration
 * Handles the complete registration flow with offline-first approach
 */
const RegistrationScreenContent = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const {
    stepInfo,
    authStatus,
    userData,
    loading,
    error,
    
    // Actions
    selectAuthMethod,
    updateUserField,
    updateMultipleUserFields,
    finishRegistration,
    resetRegistrationFlow,
    
    // Utilities
    isOnline
  } = useRegistration();

  const { isInitialized: networkInitialized } = useNetworkStatus();
  
  // Local state for Google auth
  const [googleAuthInProgress, setGoogleAuthInProgress] = useState(false);
  const [formAnimation] = useState(new Animated.Value(0));

// Configure Google Sign-In on mount
  useEffect(() => {
    const initGoogleAuth = async () => {
      try {
        const result = await authUtils.initializeGoogleAuth();
        if (result.success) {
          console.log(`Google Auth initialized successfully for ${Platform.OS}`);
        } else {
          console.warn('Google Auth initialization failed:', result.error);
        }
      } catch (error) {
        console.warn('Google Auth initialization failed:', error);
      }
    };

    initGoogleAuth();
  }, []);

// Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (stepInfo.current === 1) {
          Alert.alert(
            'Exit Registration',
            'Are you sure you want to exit? Your progress will be saved.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Exit',
                style: 'destructive',
                onPress: () => {
                  resetRegistrationFlow();
                  navigation.goBack();
                },
              },
            ]
          );
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [stepInfo.current, resetRegistrationFlow, navigation])
  );

 // Enhanced Google authentication handler
  const handleGoogleAuth = useCallback(async () => {
    if (!isOnline) {
      Alert.alert(
        'No Internet Connection',
        'Google Sign-In requires an internet connection. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      return { success: false, error: 'No internet connection' };
    }

    setGoogleAuthInProgress(true);

    try {
      // Use the centralized auth utils
      const result = await authUtils.signInWithGoogle();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('Google Sign-In successful:', result.user.email);

      // Generate username from Google name
      const generateUsername = (firstName, lastName) => {
        const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        const random = Math.floor(Math.random() * 999);
        return `${base}${random}`;
      };

      // Prepare user data from Google response
      const googleUserData = {
        authMethod: 'google',
        email: result.user.email,
        firstName: result.user.givenName || result.user.name?.split(' ')[0] || '',
        lastName: result.user.familyName || result.user.name?.split(' ').slice(1).join(' ') || '',
        username: generateUsername(
          result.user.givenName || result.user.name?.split(' ')[0] || '',
          result.user.familyName || result.user.name?.split(' ').slice(1).join(' ') || ''
        ),
        profileImage: result.user.photo || '',
        googleId: result.user.id,
        idToken: result.idToken,
        accessToken: result.accessToken,
        emailVerified: true,
        syncedToServer: true, // Google users are pre-authenticated
        firebaseUid: null, // Will be set during Firebase sync
        lastSyncAt: new Date().toISOString(),
        platform: Platform.OS
      };

      // Update registration state
      selectAuthMethod('google');
      updateMultipleUserFields(googleUserData);

        // Show success message
        Alert.alert(
          'Google Sign-In Successful',
          `Welcome ${result.user.name || result.user.email}! Your information has been pre-filled. Please review and complete your profile.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Animate to next step
                Animated.timing(formAnimation, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }
            }
          ]
        );

      return {
        success: true,
        userData: googleUserData
      };

        } catch (error) {
      console.error('Google Sign-In Error:', error);

      let errorMessage = 'Failed to sign in with Google';
      
      if (Platform.OS === 'web') {
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Sign-in was cancelled';
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your connection.';
        }
      } else {
        if (error.code === 'SIGN_IN_CANCELLED') {
          errorMessage = 'Sign-in was cancelled';
        } else if (error.code === 'IN_PROGRESS') {
          errorMessage = 'Sign-in already in progress';
        } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
          errorMessage = 'Google Play Services not available';
        }
      }
      
      if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }

      Alert.alert('Sign-In Failed', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setGoogleAuthInProgress(false);
    }
  }, [isOnline, selectAuthMethod, updateMultipleUserFields, formAnimation]);

  // Enhanced auth method selection handler
  const handleAuthMethodSelect = useCallback(async (method) => {
    const methodId = typeof method === 'string' ? method : method.id;

    console.log('Auth method selected:', methodId);

    if (methodId === 'google') {
      const result = await handleGoogleAuth();
      
      if (result.success) {
        // Google auth successful, advance to personal info step
        // The form will be pre-filled with Google data
        return {
          id: 'google',
          userData: result.userData,
          autoAdvance: true
        };
      } else {
        // Google auth failed, stay on current step
        return {
          id: null,
          userData: null,
          autoAdvance: false
        };
      }
    } else {
      // For email and phone, just set the method and advance
      selectAuthMethod(methodId);
      
      // Clear any existing Google data
      updateMultipleUserFields({
        authMethod: methodId,
        googleId: null,
        idToken: null,
        accessToken: null,
        emailVerified: methodId === 'phone' // Phone auth provides email verification
      });

      return {
        id: methodId,
        userData: { authMethod: methodId },
        autoAdvance: true
      };
    }
  }, [handleGoogleAuth, selectAuthMethod, updateMultipleUserFields]);

  // Enhanced registration completion
  const handleRegistrationComplete = useCallback(async () => {
    try {
      console.log('Starting registration completion for auth method:', authStatus.method);

      // Prepare final registration data
      const registrationData = {
        ...userData,
        id: userData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: userData.createdAt || new Date().toISOString(),
        isOnlineRegistration: isOnline,
        completedSteps: stepInfo.current
      };

      // Different handling based on auth method
      if (authStatus.method === 'google') {
        // Google users are already authenticated, just need to store locally
        const result = await finishRegistration();
        
        if (result.success) {
          Alert.alert(
            'Welcome to Acceilla!',
            `Your Google account has been linked successfully, ${registrationData.firstName}!`,
            [
              {
                text: 'Get Started',
                onPress: () => navigation.replace('Main')
              }
            ]
          );
        }
        
      } else if (authStatus.method === 'email') {
        // Email users need password validation
        if (!registrationData.password || registrationData.password !== registrationData.confirmPassword) {
          Alert.alert('Password Required', 'Please complete the password creation step.');
          return { success: false, error: 'Password required' };
        }
        
        const result = await finishRegistration();
        
        if (result.success) {
          const mode = result.mode || 'unknown';
          const message = mode === 'offline' 
            ? `Your account has been created offline, ${registrationData.firstName}! It will sync when you're connected to the internet.`
            : `Your account has been created successfully, ${registrationData.firstName}!`;
          
          Alert.alert('Welcome to Acceilla!', message, [
            {
              text: 'Get Started',
              onPress: () => navigation.replace('Main')
            }
          ]);
        }
        
      } else if (authStatus.method === 'phone') {
        // Phone users need phone verification
        if (!registrationData.phoneVerified) {
          Alert.alert('Phone Verification Required', 'Please complete phone verification.');
          return { success: false, error: 'Phone verification required' };
        }
        
        const result = await finishRegistration();
        
        if (result.success) {
          Alert.alert(
            'Welcome to Acceilla!',
            `Your phone number has been verified successfully, ${registrationData.firstName}!`,
            [
              {
                text: 'Get Started',
                onPress: () => navigation.replace('Main')
              }
            ]
          );
        }
      }

      return { success: true };

    } catch (error) {
      console.error('Registration completion error:', error);
      
      Alert.alert(
        'Registration Error',
        error.message || 'An error occurred during registration. Please try again.',
        [{ text: 'OK' }]
      );
      
      return { success: false, error: error.message };
    }
  }, [userData, authStatus.method, isOnline, stepInfo.current, finishRegistration, navigation]);

  // Custom container props
  const containerProps = {
    theme: 'light',
    showNetworkStatus: true,
    enableOfflineMode: true,
    onAuthMethodSelect: handleAuthMethodSelect,
    onRegistrationComplete: handleRegistrationComplete,
    googleAuthInProgress,
    networkInitialized,
    autoAdvanceAfterGoogleAuth: true
  };

  

  return (
    <View style={styles.container}>
      <RegistrationContainer {...containerProps} />
    </View>
  );
};

// Main Registration Screen with Redux Provider
const RegistrationScreen = ({ navigation, route }) => {
  return (
    <ReduxProvider>
      <RegistrationScreenContent navigation={navigation} route={route} />
    </ReduxProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default RegistrationScreen;