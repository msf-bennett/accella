// src/utils/authUtils.js
import { Platform, Alert } from 'react-native';
import { auth } from '../config/firebase.config';

// Platform-specific imports
let GoogleSignIn;
let GoogleAuthProvider, signInWithPopup, signInWithCredential;

if (Platform.OS === 'web') {
  // Web imports - Firebase Auth
  const firebaseAuth = require('firebase/auth');
  GoogleAuthProvider = firebaseAuth.GoogleAuthProvider;
  signInWithPopup = firebaseAuth.signInWithPopup;
  signInWithCredential = firebaseAuth.signInWithCredential;
} else {
  // React Native imports
  GoogleSignIn = require('@react-native-google-signin/google-signin').default;
}

/**
 * Authentication utility functions
 * Handles Google OAuth, phone authentication, and validation
 */

// Google Sign-In Configuration
export const configureGoogleSignIn = () => {
  if (Platform.OS === 'web') {
    // Web doesn't need configuration - handled by Firebase
    return;
  }
  
  GoogleSignIn.configure({
    iosClientId: '497434151930-f5r2lef6pvlh5ptjlo08if5cb1adceop.apps.googleusercontent.com',
    androidClientId: '497434151930-3vme1r2sicp5vhve5450nke3evaiq2nf.apps.googleusercontent.com',
    webClientId: '497434151930-oq6o04sgmms52002jj4junb902ov29eo.apps.googleusercontent.com',
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
  });
};

// Google Authentication Functions
export const initializeGoogleAuth = async () => {
  try {
    if (Platform.OS === 'web') {
      // Web initialization is automatic with Firebase
      return { success: true };
    }
    
    configureGoogleSignIn();
    
    // Check if Google Play Services are available (Android only)
    if (Platform.OS === 'android') {
      await GoogleSignIn.hasPlayServices();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Google Auth initialization error:', error);
    return { 
      success: false, 
      error: getGoogleAuthError(error) 
    };
  }
};

export const signInWithGoogle = async () => {
  try {
    if (Platform.OS === 'web') {
      // Web Google Sign-In using Firebase Auth
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      return {
        success: true,
        user: {
          id: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          givenName: result.user.displayName?.split(' ')[0] || '',
          familyName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          photo: result.user.photoURL
        },
        idToken: credential?.idToken || await result.user.getIdToken(),
        accessToken: credential?.accessToken
      };
    } else {
      // React Native Google Sign-In
      const isSignedIn = await GoogleSignIn.isSignedIn();
      if (isSignedIn) {
        await GoogleSignIn.signOut();
      }
      
      const userInfo = await GoogleSignIn.signIn();
      const { idToken } = userInfo;
      
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }
      
      return {
        success: true,
        user: userInfo.user,
        idToken,
        accessToken: userInfo.accessToken
      };
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { 
      success: false, 
      error: getGoogleAuthError(error) 
    };
  }
};

export const signOutGoogle = async () => {
  try {
    if (Platform.OS === 'web') {
      await auth.signOut();
    } else {
      await GoogleSignIn.signOut();
    }
    return { success: true };
  } catch (error) {
    console.error('Google sign-out error:', error);
    return { success: false, error: error.message };
  }
};

export const getCurrentGoogleUser = async () => {
  try {
    if (Platform.OS === 'web') {
      return auth.currentUser;
    } else {
      const userInfo = await GoogleSignIn.getCurrentUser();
      return userInfo;
    }
  } catch (error) {
    console.error('Get current Google user error:', error);
    return null;
  }
};

// Phone Authentication Functions
export const sendPhoneVerification = async (phoneNumber) => {
  try {
    const cleanPhone = cleanPhoneNumber(phoneNumber);
    if (!isValidPhoneNumber(cleanPhone)) {
      throw new Error('Invalid phone number format');
    }
    
    let verificationId;
    
    if (Platform.OS === 'web') {
      const { RecaptchaVerifier, signInWithPhoneNumber } = require('firebase/auth');
      
      // Create recaptcha container if it doesn't exist
      if (!document.getElementById('recaptcha-container')) {
        const recaptchaDiv = document.createElement('div');
        recaptchaDiv.id = 'recaptcha-container';
        document.body.appendChild(recaptchaDiv);
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log('Recaptcha verified');
        }
      }, auth);
      
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, cleanPhone, appVerifier);
      verificationId = confirmationResult.verificationId;
      
      // Store confirmation result for later use
      window.phoneConfirmationResult = confirmationResult;
    } else {
      // React Native Firebase
      const confirmation = await auth().signInWithPhoneNumber(cleanPhone);
      verificationId = confirmation.verificationId;
    }
    
    return {
      success: true,
      verificationId,
      phoneNumber: cleanPhone
    };
  } catch (error) {
    console.error('Phone verification error:', error);
    return { 
      success: false, 
      error: getPhoneAuthError(error) 
    };
  }
};

export const verifyPhoneCode = async (verificationId, code) => {
  try {
    if (!verificationId) {
      throw new Error('No verification ID provided');
    }
    
    if (!code || code.length !== 6) {
      throw new Error('Invalid verification code');
    }
    
    if (Platform.OS === 'web') {
      // Use stored confirmation result
      if (!window.phoneConfirmationResult) {
        throw new Error('No phone confirmation result found');
      }
      
      const result = await window.phoneConfirmationResult.confirm(code);
      
      return {
        success: true,
        user: result.user,
        phoneNumber: result.user.phoneNumber
      };
    } else {
      // React Native Firebase
      const confirmation = auth().confirmationResult;
      const credential = auth.PhoneAuthProvider.credential(verificationId, code);
      const result = await auth().signInWithCredential(credential);
      
      return {
        success: true,
        user: result.user,
        phoneNumber: result.user.phoneNumber
      };
    }
  } catch (error) {
    console.error('Phone code verification error:', error);
    return { 
      success: false, 
      error: getPhoneAuthError(error) 
    };
  }
};

// Validation Functions (keeping existing validation functions as they are)
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

export const validatePassword = (password, confirmPassword = null) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (@$!%*?&)' };
  }
  
  if (confirmPassword && password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  const cleanUsername = username.trim().toLowerCase();
  
  if (cleanUsername.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (cleanUsername.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  const reserved = ['admin', 'root', 'user', 'test', 'guest', 'null', 'undefined'];
  if (reserved.includes(cleanUsername)) {
    return { isValid: false, error: 'This username is reserved' };
  }
  
  return { isValid: true, username: cleanUsername };
};

export const validatePhoneNumber = (phoneNumber) => {
  const cleanPhone = cleanPhoneNumber(phoneNumber);
  
  if (!isValidPhoneNumber(cleanPhone)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  
  return { isValid: true, phoneNumber: cleanPhone };
};

export const validatePersonalInfo = (data) => {
  const errors = [];
  
  if (!data.firstName?.trim()) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  
  if (!data.lastName?.trim()) {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.push({ field: 'email', message: emailValidation.error });
    }
  }
  
  if (data.username) {
    const usernameValidation = validateUsername(data.username);
    if (!usernameValidation.isValid) {
      errors.push({ field: 'username', message: usernameValidation.error });
    }
  }
  
  if (data.phoneNumber) {
    const phoneValidation = validatePhoneNumber(data.phoneNumber);
    if (!phoneValidation.isValid) {
      errors.push({ field: 'phoneNumber', message: phoneValidation.error });
    }
  }
  
  if (data.dateOfBirth) {
    const age = calculateAge(data.dateOfBirth);
    if (age < 13) {
      errors.push({ field: 'dateOfBirth', message: 'Must be at least 13 years old' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility Functions
export const cleanPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  } else if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  return `+${digits}`;
};

export const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const formatPhoneNumber = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    const number = cleaned.slice(1);
    return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  
  return phoneNumber;
};

// Error Handling
export const getGoogleAuthError = (error) => {
  if (Platform.OS === 'web') {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked. Please allow popups for this site.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return error.message || 'Google sign-in failed';
    }
  } else {
    switch (error.code) {
      case 'SIGN_IN_CANCELLED':
        return 'Sign-in was cancelled';
      case 'IN_PROGRESS':
        return 'Sign-in already in progress';
      case 'PLAY_SERVICES_NOT_AVAILABLE':
        return 'Google Play Services not available';
      case 'SIGN_IN_REQUIRED':
        return 'Sign-in required';
      default:
        return error.message || 'Google sign-in failed';
    }
  }
};

export const getPhoneAuthError = (error) => {
  switch (error.code) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again later';
    case 'auth/invalid-verification-code':
      return 'Invalid verification code';
    case 'auth/code-expired':
      return 'Verification code has expired';
    default:
      return error.message || 'Phone verification failed';
  }
};

export const getFirebaseAuthError = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/user-disabled':
      return 'Account has been disabled';
    default:
      return error.message || 'Authentication failed';
  }
};

export const prepareRegistrationData = (userData, authMethod) => {
  const baseData = {
    firstName: userData.firstName?.trim() || '',
    lastName: userData.lastName?.trim() || '',
    email: userData.email?.trim().toLowerCase() || '',
    username: userData.username?.trim().toLowerCase() || '',
    userType: userData.userType || 'PLAYER',
    sport: userData.sport?.trim() || '',
    authMethod,
    registeredAt: new Date().toISOString(),
    emailOptIn: userData.emailOptIn !== false,
    profileImage: userData.profileImage || null
  };

  switch (authMethod) {
    case 'google':
      return {
        ...baseData,
        googleId: userData.googleId || '',
        emailVerified: true
      };
    
    case 'phone':
      return {
        ...baseData,
        phoneNumber: userData.phoneNumber || '',
        phoneVerified: true
      };
    
    case 'email':
    default:
      return {
        ...baseData,
        securityQuestion: userData.securityQuestion?.trim() || '',
        securityAnswer: userData.securityAnswer ? 
          require('crypto-js').SHA256(userData.securityAnswer.toLowerCase().trim()).toString() : '',
        emailVerified: false
      };
  }
};

export default {
  // Google Auth
  initializeGoogleAuth,
  signInWithGoogle,
  signOutGoogle,
  getCurrentGoogleUser,
  
  // Phone Auth
  sendPhoneVerification,
  verifyPhoneCode,
  
  // Validation
  validateEmail,
  validatePassword,
  validateUsername,
  validatePhoneNumber,
  validatePersonalInfo,
  
  // Utilities
  cleanPhoneNumber,
  formatPhoneNumber,
  calculateAge,
  prepareRegistrationData,
  
  // Error handling
  getGoogleAuthError,
  getPhoneAuthError,
  getFirebaseAuthError
};