// src/hooks/useRegistration.js
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

// Redux actions
import {
  // Navigation
  setCurrentStep,
  nextStep,
  previousStep,
  
  // Auth method
  setAuthMethod,
  clearAuthMethod,
  
  // User data
  updateUserData,
  setUserField,
  clearUserData,
  
  // Google auth
  setGoogleAuthLoading,
  setGoogleAuthData,
  setGoogleAuthError,
  clearGoogleAuthData,
  
  // Phone auth
  setPhoneAuthLoading,
  setPhoneVerificationId,
  setPhoneVerificationCode,
  setPhoneAuthError,
  clearPhoneAuthData,
  
  // Validation
  setFieldValidation,
  setStepValidation,
  clearValidation,
  
  // Step completion
  setStepCompleted,
  markStepCompleted,
  
  // Registration state
  setRegistrationLoading,
  setRegistrationError,
  setRegistrationSuccess,
  setRegistrationMode,
  
  // Sync status
  setSyncStatus,
  setSyncing,
  setSyncError,
  setSyncSuccess,
  setPendingSync,
  
  // Reset
  resetRegistration,
  resetToStep,
  
  // Async thunks
  registerUser,
  syncOfflineRegistrations
} from '../store/slices/registrationSlice';

// Action creators
import {
  initializeGoogleSignIn,
  signInWithGoogle,
  signOutGoogle,
  sendPhoneVerification,
  verifyPhoneCode,
  registerWithEmail,
  completeRegistration,
  validateEmail,
  validatePassword,
  validateUsername,
  triggerOfflineSync,
  clearRegistrationData
} from '../store/actions/registrationActions';

// Selectors
import {
  selectRegistration,
  selectCurrentStep,
  selectAuthMethod,
  selectUserData,
  selectRegistrationLoading,
  selectRegistrationError,
  selectSyncStatus,
  selectStepsCompleted,
  selectValidation,
  selectCanProceed,
  selectProgressPercentage,
  selectShouldSkipStep
} from '../store/slices/registrationSlice';

import { selectIsOnline, selectCanUseAuth } from '../store/slices/networkSlice';

/**
 * Custom hook for managing registration flow state and actions
 * Provides a complete interface for the registration process
 */
const useRegistration = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Selectors
  const registration = useSelector(selectRegistration);
  const currentStep = useSelector(selectCurrentStep);
  const authMethod = useSelector(selectAuthMethod);
  const userData = useSelector(selectUserData);
  const loading = useSelector(selectRegistrationLoading);
  const error = useSelector(selectRegistrationError);
  const syncStatus = useSelector(selectSyncStatus);
  const stepsCompleted = useSelector(selectStepsCompleted);
  const validation = useSelector(selectValidation);
  const canProceed = useSelector(selectCanProceed);
  const progressPercentage = useSelector(selectProgressPercentage);
  const isOnline = useSelector(selectIsOnline);
  const canUseAuth = useSelector(selectCanUseAuth);

  // Computed values
  const totalSteps = registration.totalSteps;
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const shouldSkipCurrentStep = selectShouldSkipStep(authMethod, currentStep);

  // Navigation helpers
  const navigateToStep = useCallback((step) => {
    if (step >= 1 && step <= totalSteps) {
      dispatch(setCurrentStep(step));
    }
  }, [dispatch, totalSteps]);

  const goToNextStep = useCallback(() => {
    if (shouldSkipCurrentStep) {
      // Skip current step and move to next
      const nextStep = currentStep + 1;
      if (nextStep <= totalSteps) {
        dispatch(setCurrentStep(nextStep));
      }
      return;
    }

    if (canProceed && currentStep < totalSteps) {
      dispatch(nextStep());
    } else if (!canProceed) {
      Alert.alert(
        'Incomplete Step',
        'Please complete the current step before proceeding.',
        [{ text: 'OK' }]
      );
    }
  }, [dispatch, canProceed, currentStep, totalSteps, shouldSkipCurrentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      dispatch(previousStep());
    }
  }, [dispatch, currentStep]);

  // Authentication method actions
  const selectAuthMethod = useCallback((method) => {
    dispatch(setAuthMethod(method));
  }, [dispatch]);

  const clearSelectedAuthMethod = useCallback(() => {
    dispatch(clearAuthMethod());
  }, [dispatch]);

  // User data actions
  const updateUserField = useCallback((field, value) => {
    dispatch(setUserField({ field, value }));
  }, [dispatch]);

  const updateMultipleUserFields = useCallback((fields) => {
    dispatch(updateUserData(fields));
  }, [dispatch]);

  const clearAllUserData = useCallback(() => {
    dispatch(clearUserData());
  }, [dispatch]);

  // Google authentication
  const initGoogle = useCallback(async () => {
    try {
      const result = await dispatch(initializeGoogleSignIn()).unwrap();
      return result;
    } catch (error) {
      console.error('Google initialization error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const signInGoogle = useCallback(async () => {
    try {
      if (!canUseAuth) {
        throw new Error('Authentication requires internet connection');
      }
      
      const result = await dispatch(signInWithGoogle()).unwrap();
      return result;
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch, canUseAuth]);

  const signOutGoogleAuth = useCallback(async () => {
    try {
      const result = await dispatch(signOutGoogle()).unwrap();
      return result;
    } catch (error) {
      console.error('Google sign-out error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Phone authentication
  const sendPhoneCode = useCallback(async (phoneNumber) => {
    try {
      if (!canUseAuth) {
        throw new Error('Phone verification requires internet connection');
      }
      
      const result = await dispatch(sendPhoneVerification(phoneNumber)).unwrap();
      return result;
    } catch (error) {
      console.error('Phone verification error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch, canUseAuth]);

  const verifyPhoneNumber = useCallback(async (verificationId, code) => {
    try {
      const result = await dispatch(verifyPhoneCode({
        verificationId,
        verificationCode: code
      })).unwrap();
      return result;
    } catch (error) {
      console.error('Phone code verification error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const updatePhoneCode = useCallback((code) => {
    dispatch(setPhoneVerificationCode(code));
  }, [dispatch]);

  // Email registration
  const registerWithEmailAuth = useCallback(async (emailData) => {
    try {
      const result = await dispatch(registerWithEmail(emailData)).unwrap();
      return result;
    } catch (error) {
      console.error('Email registration error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Complete registration
  const finishRegistration = useCallback(async () => {
    try {
      const result = await dispatch(completeRegistration()).unwrap();
      
      if (result.success) {
        // Show success message
        const mode = result.mode || 'unknown';
        const message = mode === 'offline' 
          ? 'Account created offline. Will sync when connected.'
          : 'Account created successfully!';
        
        Alert.alert('Registration Complete', message, [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to appropriate screen
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.replace('Dashboard'); // or appropriate screen
              }
            }
          }
        ]);
      }
      
      return result;
    } catch (error) {
      console.error('Registration completion error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch, navigation]);

  // Validation actions
  const validateEmailField = useCallback(async (email) => {
    try {
      const result = await dispatch(validateEmail(email)).unwrap();
      dispatch(setFieldValidation({
        field: 'email',
        isValid: true,
        error: null
      }));
      return result;
    } catch (error) {
      dispatch(setFieldValidation({
        field: 'email',
        isValid: false,
        error: error.message
      }));
      return { isValid: false, error: error.message };
    }
  }, [dispatch]);

  const validatePasswordField = useCallback(async (password, confirmPassword) => {
    try {
      const result = await dispatch(validatePassword({
        password,
        confirmPassword
      })).unwrap();
      dispatch(setFieldValidation({
        field: 'password',
        isValid: true,
        error: null
      }));
      return result;
    } catch (error) {
      dispatch(setFieldValidation({
        field: 'password',
        isValid: false,
        error: error.message
      }));
      return { isValid: false, error: error.message };
    }
  }, [dispatch]);

  const validateUsernameField = useCallback(async (username) => {
    try {
      const result = await dispatch(validateUsername(username)).unwrap();
      dispatch(setFieldValidation({
        field: 'username',
        isValid: true,
        error: null
      }));
      return result;
    } catch (error) {
      dispatch(setFieldValidation({
        field: 'username',
        isValid: false,
        error: error.message
      }));
      return { isValid: false, error: error.message };
    }
  }, [dispatch]);

  // Step completion
  const completeStep = useCallback((stepName) => {
    dispatch(markStepCompleted(stepName));
  }, [dispatch]);

  const setStepComplete = useCallback((stepName, completed) => {
    dispatch(setStepCompleted({ step: stepName, completed }));
  }, [dispatch]);

  // Step validation
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1: // Auth method selection
        return authMethod !== null;
      case 2: // Personal info
        const personalInfoValid = userData.firstName && userData.lastName && userData.email;
        return personalInfoValid;
      case 3: // Role selection
        return userData.userType !== null;
      case 4: // Security questions (skip for non-email)
        if (authMethod !== 'email') return true;
        return userData.securityQuestion && userData.securityAnswer;
      case 5: // Password creation (skip for non-email)
        if (authMethod !== 'email') return true;
        return userData.password && userData.confirmPassword && userData.password === userData.confirmPassword;
      default:
        return false;
    }
  }, [currentStep, authMethod, userData]);

  // Sync actions
  const syncOfflineData = useCallback(async () => {
    try {
      const result = await dispatch(syncOfflineRegistrations()).unwrap();
      return result;
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  const triggerSync = useCallback(async () => {
    try {
      const result = await dispatch(triggerOfflineSync()).unwrap();
      return result;
    } catch (error) {
      console.error('Trigger sync error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Reset actions
  const resetRegistrationFlow = useCallback(() => {
    dispatch(resetRegistration());
  }, [dispatch]);

  const resetToSpecificStep = useCallback((step) => {
    dispatch(resetToStep(step));
  }, [dispatch]);

  const clearRegistrationErrors = useCallback(() => {
    dispatch(setRegistrationError(null));
  }, [dispatch]);

  // Cleanup
  const cleanup = useCallback(async () => {
    try {
      await dispatch(clearRegistrationData()).unwrap();
      return { success: true };
    } catch (error) {
      console.error('Cleanup error:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncStatus.pendingSync && !syncStatus.syncing) {
      console.log('Device came online, triggering auto-sync...');
      syncOfflineData();
    }
  }, [isOnline, syncStatus.pendingSync, syncStatus.syncing, syncOfflineData]);

  // Auto-validate current step
  useEffect(() => {
    const isValid = validateCurrentStep();
    const stepNames = ['authMethodSelection', 'personalInfo', 'roleSelection', 'security', 'passwordCreation'];
    const currentStepName = stepNames[currentStep - 1];
    
    if (currentStepName) {
      dispatch(setStepCompleted({ step: currentStepName, completed: isValid }));
    }
  }, [currentStep, validateCurrentStep, dispatch]);

  // Memoized step information
  const stepInfo = useMemo(() => ({
    current: currentStep,
    total: totalSteps,
    isFirst: isFirstStep,
    isLast: isLastStep,
    canProceed,
    shouldSkip: shouldSkipCurrentStep,
    progress: progressPercentage
  }), [currentStep, totalSteps, isFirstStep, isLastStep, canProceed, shouldSkipCurrentStep, progressPercentage]);

  // Memoized auth status
  const authStatus = useMemo(() => ({
    method: authMethod,
    isOnline,
    canUseAuth,
    googleData: registration.googleAuthData,
    phoneData: registration.phoneAuthData
  }), [authMethod, isOnline, canUseAuth, registration.googleAuthData, registration.phoneAuthData]);

  // Return comprehensive hook interface
  return {
    // State
    registration,
    userData,
    loading,
    error,
    syncStatus,
    stepsCompleted,
    validation,
    stepInfo,
    authStatus,

    // Navigation
    navigateToStep,
    goToNextStep,
    goToPreviousStep,

    // Auth method
    selectAuthMethod,
    clearSelectedAuthMethod,

    // User data
    updateUserField,
    updateMultipleUserFields,
    clearAllUserData,

    // Google auth
    initGoogle,
    signInGoogle,
    signOutGoogleAuth,

    // Phone auth
    sendPhoneCode,
    verifyPhoneNumber,
    updatePhoneCode,

    // Email registration
    registerWithEmailAuth,

    // Complete registration
    finishRegistration,

    // Validation
    validateEmailField,
    validatePasswordField,
    validateUsernameField,
    validateCurrentStep,

    // Step management
    completeStep,
    setStepComplete,

    // Sync
    syncOfflineData,
    triggerSync,

    // Reset & cleanup
    resetRegistrationFlow,
    resetToSpecificStep,
    clearRegistrationErrors,
    cleanup,

    // Utilities
    isOnline,
    canUseAuth
  };
};

export default useRegistration;