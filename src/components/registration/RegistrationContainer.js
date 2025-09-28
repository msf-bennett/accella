// src/components/registration/RegistrationContainer.js
import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

// Components
import AuthMethodSelection from '../auth/AuthMethodSelection';
import PersonalInfoForm from './PersonalInfoForm';
//create this files
import RoleSelectionForm from './RoleSelectionForm';
import SecurityQuestionsForm from './SecurityQuestionsForm';
import PasswordCreationForm from './PasswordCreationForm';
import RegistrationProgress from './RegistrationProgress';

//check if the offlinesyncmanager needs update
import NetworkStatus from '../auth/NetworkStatus';
import OfflineSyncManager from '../offlinemanager/OfflineSyncManager';

// Hooks
import useRegistration from '../../hooks/useRegistration';
import useNetworkStatus from '../../hooks/useNetworkStatus';

/**
 * Main Registration Container Component
 * Manages the entire registration flow with step-by-step navigation
 * Handles offline-first registration with sync capabilities
 */
const RegistrationContainer = ({
  theme = 'light',
  showNetworkStatus = true,
  enableOfflineMode = true
}) => {
  const navigation = useNavigation();
  const {
    stepInfo,
    authStatus,
    userData,
    loading,
    error,
    syncStatus,
    
    // Navigation
    goToNextStep,
    goToPreviousStep,
    navigateToStep,
    
    // Auth method
    selectAuthMethod,
    
    // User data
    updateUserField,
    updateMultipleUserFields,
    
    // Auth actions
    signInGoogle,
    sendPhoneCode,
    verifyPhoneNumber,
    
    // Completion
    finishRegistration,
    
    // Validation
    validateCurrentStep,
    
    // Reset
    resetRegistrationFlow,
    clearRegistrationErrors,
    
    // Utilities
    isOnline,
    canUseAuth
  } = useRegistration();

  const { isInitialized: networkInitialized } = useNetworkStatus();

  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (stepInfo.current === 1) {
          // On first step, show exit confirmation
          Alert.alert(
            'Exit Registration',
            'Are you sure you want to exit? Your progress will be saved.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Exit',
                style: 'destructive',
                onPress: () => navigation.goBack(),
              },
            ]
          );
          return true;
        } else {
          // Go to previous step
          goToPreviousStep();
          return true;
        }
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [stepInfo.current, goToPreviousStep, navigation])
  );

  // Clear errors when step changes
  useEffect(() => {
    if (error) {
      clearRegistrationErrors();
    }
  }, [stepInfo.current, error, clearRegistrationErrors]);

  // Handle step navigation with validation
  const handleNext = useCallback(async () => {
    const isValid = validateCurrentStep();
    
    if (!isValid) {
      Alert.alert(
        'Incomplete Step',
        'Please complete all required fields before proceeding.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Special handling for final step
    if (stepInfo.isLast) {
      try {
        const result = await finishRegistration();
        if (result.success) {
          // Registration completed successfully
          return;
        } else {
          Alert.alert(
            'Registration Error',
            result.error || 'Failed to complete registration. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        Alert.alert(
          'Registration Error',
          'An unexpected error occurred. Please try again.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    goToNextStep();
  }, [validateCurrentStep, stepInfo.isLast, finishRegistration, goToNextStep]);

  const handleBack = useCallback(() => {
    if (stepInfo.isFirst) {
      Alert.alert(
        'Exit Registration',
        'Are you sure you want to exit? Your progress will be saved.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      goToPreviousStep();
    }
  }, [stepInfo.isFirst, goToPreviousStep, navigation]);

  // Auth method selection handler
// In your RegistrationContainer, modify the auth method selection handler:

const handleAuthMethodSelect = useCallback((methodData) => {
  const method = methodData.id || methodData;
  
  // Update form data with auth method
  updateUserField('authMethod', method);
  
  // If Google auth, also update with Google user data
  if (method === 'google' && methodData.userData) {
    updateMultipleUserFields({
      ...methodData.userData,
      // Ensure required fields are filled
      username: methodData.userData.username || generateUsername(
        methodData.userData.firstName,
        methodData.userData.lastName
      )
    });
  }
  
  // Set the auth method in Redux
  selectAuthMethod(method);
  
}, [updateUserField, updateMultipleUserFields, selectAuthMethod]);

// Helper function to generate username from name
const generateUsername = (firstName, lastName) => {
  const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  const random = Math.floor(Math.random() * 999);
  return `${base}${random}`;
};

  // Google authentication handler
  const handleGoogleAuth = useCallback(async () => {
    try {
      const result = await signInGoogle();
      if (result.success) {
        // Google auth successful, move to role selection (skip personal info)
        navigateToStep(3);
      }
    } catch (error) {
      Alert.alert(
        'Google Sign-In Failed',
        error.message || 'Failed to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [signInGoogle, navigateToStep]);

  // Personal info form handler
  const handlePersonalInfoSubmit = useCallback((personalData) => {
    updateMultipleUserFields(personalData);
    goToNextStep();
  }, [updateMultipleUserFields, goToNextStep]);

  // Role selection handler
  const handleRoleSelect = useCallback((roleData) => {
    updateMultipleUserFields(roleData);
    
    // Skip security questions for non-email auth
    if (authStatus.method !== 'email') {
      navigateToStep(5); // Skip to password creation or completion
    } else {
      goToNextStep();
    }
  }, [updateMultipleUserFields, authStatus.method, goToNextStep, navigateToStep]);

  // Security questions handler
  const handleSecuritySubmit = useCallback((securityData) => {
    updateMultipleUserFields(securityData);
    goToNextStep();
  }, [updateMultipleUserFields, goToNextStep]);

  // Password creation handler
  const handlePasswordSubmit = useCallback((passwordData) => {
    updateMultipleUserFields(passwordData);
    // This will trigger completion in handleNext
    handleNext();
  }, [updateMultipleUserFields, handleNext]);

  // Render current step
  const renderCurrentStep = useMemo(() => {
    const commonProps = {
      theme,
      onNext: handleNext,
      onBack: handleBack,
      loading,
      error
    };

    switch (stepInfo.current) {
      case 1: // Auth Method Selection
        return (
          <AuthMethodSelection
            {...commonProps}
            onMethodSelect={handleAuthMethodSelect}
            selectedMethod={authStatus.method}
            networkStatus={{ isOnline, canUseAuth }}
            showNetworkStatus={showNetworkStatus}
          />
        );

      case 2: // Personal Information
        return (
          <PersonalInfoForm
            {...commonProps}
            userData={userData}
            authMethod={authStatus.method}
            onSubmit={handlePersonalInfoSubmit}
            onFieldChange={updateUserField}
          />
        );

      case 3: // Role Selection
        return (
          <RoleSelectionForm
            {...commonProps}
            userData={userData}
            onSubmit={handleRoleSelect}
            onFieldChange={updateUserField}
          />
        );

      case 4: // Security Questions (Email only)
        return (
          <SecurityQuestionsForm
            {...commonProps}
            userData={userData}
            onSubmit={handleSecuritySubmit}
            onFieldChange={updateUserField}
            skip={authStatus.method !== 'email'}
          />
        );

      case 5: // Password Creation (Email only)
        return (
          <PasswordCreationForm
            {...commonProps}
            userData={userData}
            onSubmit={handlePasswordSubmit}
            onFieldChange={updateUserField}
            skip={authStatus.method !== 'email'}
          />
        );

      default:
        return null;
    }
  }, [
    stepInfo.current,
    theme,
    handleNext,
    handleBack,
    loading,
    error,
    handleAuthMethodSelect,
    authStatus.method,
    isOnline,
    canUseAuth,
    showNetworkStatus,
    userData,
    handlePersonalInfoSubmit,
    updateUserField,
    handleRoleSelect,
    handleSecuritySubmit,
    handlePasswordSubmit
  ]);

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1a1a1a' : '#ffffff'}
      />
      
      {/* Network Status */}
      {showNetworkStatus && (
        <NetworkStatus
          isOnline={isOnline}
          syncStatus={syncStatus}
          theme={theme}
        />
      )}
      
      {/* Registration Progress */}
      <RegistrationProgress
        currentStep={stepInfo.current}
        totalSteps={stepInfo.total}
        completedSteps={stepInfo.completed}
        theme={theme}
      />
      
      {/* Main Content */}
      <View style={styles.content}>
        {renderCurrentStep}
      </View>
      
      {/* Offline Sync Manager */}
      {enableOfflineMode && (
        <OfflineSyncManager
          visible={syncStatus?.pending > 0}
          pendingCount={syncStatus?.pending || 0}
          onSync={() => {/* Handle manual sync if needed */}}
          theme={theme}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

export default RegistrationContainer;