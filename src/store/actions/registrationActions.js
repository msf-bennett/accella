// src/store/actions/registrationActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { Platform } from 'react-native';
import FirebaseService from '../../services/FirebaseService';
import authUtils from '../../utils/authUtils';
import { 
  setGoogleAuthLoading, 
  setGoogleAuthData, 
  setGoogleAuthError,
  setPhoneAuthLoading,
  setPhoneVerificationId,
  setPhoneAuthError,
  updateUserData,
  setRegistrationError,
  clearGoogleAuthData
} from '../slices/registrationSlice';

// Google Authentication Actions
export const initializeGoogleSignIn = createAsyncThunk(
  'registration/initializeGoogleSignIn',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authUtils.initializeGoogleAuth();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return { initialized: true, platform: Platform.OS };
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  'registration/signInWithGoogle',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setGoogleAuthLoading(true));
      
      const result = await authUtils.signInWithGoogle();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Get user data from result
      const googleUser = result.user;
      
      // Update Redux store with Google auth data
      dispatch(setGoogleAuthData({
        idToken: result.idToken,
        accessToken: result.accessToken,
        user: {
          id: googleUser.id,
          email: googleUser.email,
          givenName: googleUser.givenName || googleUser.name?.split(' ')[0] || '',
          familyName: googleUser.familyName || googleUser.name?.split(' ').slice(1).join(' ') || '',
          photo: googleUser.photo,
          name: googleUser.name || `${googleUser.givenName} ${googleUser.familyName}`.trim()
        }
      }));
      
      // Pre-fill user data
      dispatch(updateUserData({
        email: googleUser.email,
        firstName: googleUser.givenName || googleUser.name?.split(' ')[0] || '',
        lastName: googleUser.familyName || googleUser.name?.split(' ').slice(1).join(' ') || '',
        profileImage: googleUser.photo || null
      }));
      
      return {
        success: true,
        user: googleUser,
        tokens: {
          idToken: result.idToken,
          accessToken: result.accessToken
        },
        platform: Platform.OS
      };
      
    } catch (error) {
      dispatch(setGoogleAuthError(error.message));
      
      let errorMessage = 'Google sign-in failed';
      
      if (Platform.OS === 'web') {
        if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Sign-in was cancelled';
        } else if (error.code === 'auth/popup-blocked') {
          errorMessage = 'Sign-in popup was blocked. Please allow popups for this site.';
        }
      } else {
        if (error.code === 'SIGN_IN_CANCELLED') {
          errorMessage = 'Sign-in was cancelled';
        } else if (error.code === 'IN_PROGRESS') {
          errorMessage = 'Sign-in is already in progress';
        } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
          errorMessage = 'Google Play Services not available';
        }
      }
      
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setGoogleAuthLoading(false));
    }
  }
);

export const signOutGoogle = createAsyncThunk(
  'registration/signOutGoogle',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await authUtils.signOutGoogle();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Clear Google auth data from store
      dispatch(clearGoogleAuthData());
      
      return { success: true };
    } catch (error) {
      console.warn('Google sign-out error:', error);
      // Don't fail sign-out, just clear the data
      dispatch(clearGoogleAuthData());
      return { success: true };
    }
  }
);

// Phone Authentication Actions
export const sendPhoneVerification = createAsyncThunk(
  'registration/sendPhoneVerification',
  async (phoneNumber, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setPhoneAuthLoading(true));
      
      // Validate phone number format
      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error('Please enter a valid phone number');
      }
      
      const result = await authUtils.sendPhoneVerification(phoneNumber);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      dispatch(setPhoneVerificationId(result.verificationId));
      
      return {
        success: true,
        verificationId: result.verificationId,
        phoneNumber: result.phoneNumber
      };
      
    } catch (error) {
      dispatch(setPhoneAuthError(error.message));
      
      let errorMessage = 'Failed to send verification code';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later';
      }
      
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setPhoneAuthLoading(false));
    }
  }
);

export const verifyPhoneCode = createAsyncThunk(
  'registration/verifyPhoneCode',
  async ({ verificationId, verificationCode }, { dispatch, rejectWithValue }) => {
    try {
      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code');
      }
      
      const result = await authUtils.verifyPhoneCode(verificationId, verificationCode);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      if (result.user) {
        // Update user data with phone information
        dispatch(updateUserData({
          phoneNumber: result.phoneNumber,
          phoneVerified: true
        }));
        
        return {
          success: true,
          user: result.user,
          phoneNumber: result.phoneNumber
        };
      }
      
      throw new Error('Verification failed');
      
    } catch (error) {
      dispatch(setPhoneAuthError(error.message));
      
      let errorMessage = 'Code verification failed';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Email Registration Actions
export const registerWithEmail = createAsyncThunk(
  'registration/registerWithEmail',
  async (userData, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const { authMethod } = state.registration;
      
      if (authMethod !== 'email') {
        throw new Error('Invalid authentication method for email registration');
      }
      
      // Validate required fields
      const requiredFields = ['email', 'password', 'firstName', 'lastName'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Register user through Firebase service
      const result = await FirebaseService.registerUser({
        ...userData,
        authMethod: 'email'
      });
      
      return result;
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Complete Registration Actions
export const completeRegistration = createAsyncThunk(
  'registration/completeRegistration',
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState();
      const { userData, authMethod, googleAuthData, phoneAuthData } = state.registration;
      const { isOnline } = state.network;
      
      // Prepare complete user data based on auth method
      let completeUserData = { ...userData };
      
      switch (authMethod) {
        case 'google':
          if (!googleAuthData.user) {
            throw new Error('Google authentication data not available');
          }
          completeUserData = {
            ...completeUserData,
            googleId: googleAuthData.user.id,
            idToken: googleAuthData.idToken,
            accessToken: googleAuthData.accessToken,
            emailVerified: true
          };
          break;
          
        case 'phone':
          if (!phoneAuthData.verificationId) {
            throw new Error('Phone verification not completed');
          }
          completeUserData = {
            ...completeUserData,
            phoneVerified: true
          };
          break;
          
        case 'email':
          if (!userData.password) {
            throw new Error('Password is required for email registration');
          }
          break;
          
        default:
          throw new Error('No authentication method selected');
      }
      
      // Add registration metadata
      completeUserData.authMethod = authMethod;
      completeUserData.registeredAt = new Date().toISOString();
      completeUserData.isOnlineRegistration = isOnline;
      completeUserData.platform = Platform.OS;
      
      // Register user
      const result = await FirebaseService.registerUser(completeUserData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return {
        ...result,
        userData: completeUserData
      };
      
    } catch (error) {
      dispatch(setRegistrationError(error.message));
      return rejectWithValue(error.message);
    }
  }
);

// Validation Actions
export const validateEmail = createAsyncThunk(
  'registration/validateEmail',
  async (email, { rejectWithValue }) => {
    try {
      const validation = authUtils.validateEmail(email);
      
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      // Check if email already exists (if online)
      const emailExists = await FirebaseService.checkEmailExistsInFirebase(email);
      if (emailExists) {
        throw new Error('This email is already registered');
      }
      
      return { isValid: true, email };
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const validatePassword = createAsyncThunk(
  'registration/validatePassword',
  async ({ password, confirmPassword }, { rejectWithValue }) => {
    try {
      const validation = authUtils.validatePassword(password, confirmPassword);
      
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      return { isValid: true };
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const validateUsername = createAsyncThunk(
  'registration/validateUsername',
  async (username, { rejectWithValue }) => {
    try {
      const validation = authUtils.validateUsername(username);
      
      if (!validation.isValid) {
        throw new Error(validation.error);
      }
      
      // Check if username already exists (if online)
      const usernameExists = await FirebaseService.checkUsernameExists(username);
      if (usernameExists) {
        throw new Error('This username is already taken');
      }
      
      return { isValid: true, username: validation.username };
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Sync Actions
export const triggerOfflineSync = createAsyncThunk(
  'registration/triggerOfflineSync',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { isOnline } = state.network;
      
      if (!isOnline) {
        throw new Error('Device is offline. Cannot sync at this time.');
      }
      
      // Trigger sync of offline registrations
      const syncResult = await FirebaseService.syncOfflineRegistrationsToFirebase();
      
      // Also process any queued operations
      const queueResult = await FirebaseService.processOfflineQueue();
      
      return {
        syncResult,
        queueResult,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Cleanup Actions
export const clearRegistrationData = createAsyncThunk(
  'registration/clearRegistrationData',
  async (_, { dispatch }) => {
    try {
      // Sign out from Google if signed in
      await authUtils.signOutGoogle();
      
      // Clear any Firebase auth state
      if (FirebaseService.auth.currentUser) {
        await FirebaseService.auth.signOut();
      }
      
      return { success: true };
      
    } catch (error) {
      console.warn('Error during registration cleanup:', error);
      return { success: true }; // Don't fail cleanup
    }
  }
);
