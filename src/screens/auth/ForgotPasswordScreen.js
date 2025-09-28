import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Button, TextInput, Text, Surface, Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';

import NetInfo from '@react-native-community/netinfo';
import FirebaseService from '../../services/FirebaseService';
import PasswordSecurityService from '../../services/PasswordSecurityService';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase.config';

// Enhanced Color Palette
const ENHANCED_COLORS = {
  primary: '#5B9BD5',
  primaryLight: '#7BAEE0',
  primaryDark: '#4A7FB8',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  onSurface: '#1E293B',
  onSurfaceVariant: '#64748B',
  onSurfaceDisabled: '#94A3B8',
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputBorderFocused: '#5B9BD5',
  inputText: '#1E293B',
  inputPlaceholder: '#64748B',
  inputLabel: '#475569',
  inputLabelFocused: '#5B9BD5',
  success: '#059669',
  successLight: '#10B981',
  error: '#DC2626',
  warning: '#D97706',
  ripple: 'rgba(37, 99, 235, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

const ForgotPasswordScreen = ({ navigation, route }) => {
  // Get suggested email from login screen
  const { suggestedEmail, suggestedUser } = route.params || {};
  
  const [step, setStep] = useState(1); // 1: User ID, 2: Choose Method, 3: Security/Firebase, 4: New Password
  const [userInput, setUserInput] = useState(suggestedEmail || '');
  const [foundUser, setFoundUser] = useState(suggestedUser || null);
  const [isOnline, setIsOnline] = useState(false);
  const [resetMethod, setResetMethod] = useState(''); // 'security', 'firebase', 'device'
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceAuthAvailable, setDeviceAuthAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [userExists, setUserExists] = useState(null);
  const [showUserNotFound, setShowUserNotFound] = useState(false);
  const [securityAnswerCorrect, setSecurityAnswerCorrect] = useState(null);
  const [firebaseEmailSent, setFirebaseEmailSent] = useState(false);
  const [availableMethods, setAvailableMethods] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordValidationInProgress, setPasswordValidationInProgress] = useState(false);

  useEffect(() => {
    checkDeviceAuthAvailability();
    if (suggestedUser) {
      setFoundUser(suggestedUser);
      setStep(2); // Skip to security question if user already found
    }
  }, []);

  // Check user exisen input changes
  useEffect(() => {
    if (userInput.trim().length > 2) {
      checkUserExists(userInput);
    } else {
      setUserExists(null);
      setShowUserNotFound(false);
    }
  }, [userInput]);

  // Check security answer in real-time
  useEffect(() => {
    if (foundUser && securityAnswer.trim().length > 0) {
      const isCorrect = foundUser.securityAnswer.toLowerCase() === securityAnswer.toLowerCase().trim();
      setSecurityAnswerCorrect(isCorrect);
    } else {
      setSecurityAnswerCorrect(null);
    }
  }, [securityAnswer, foundUser]);

  useEffect(() => {
  const initializeScreen = async () => {
    await checkNetworkStatus();
    await checkDeviceAuthAvailability();
    
    if (suggestedUser) {
      setFoundUser(suggestedUser);
      await determineAvailableMethods(suggestedUser);
      setStep(2); // Skip to method selection
    }
  };
  
  initializeScreen();
}, []);

// Network status monitoring
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected ?? false);
  });
  
  return unsubscribe;
}, []);

// Validate new password in real-time
useEffect(() => {
  const validatePassword = async () => {
    if (newPassword.length > 0) {
      const validation = await validatePasswordWithFeedback(newPassword, confirmPassword);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength({ score: 0, feedback: '', isValid: false });
      setPasswordError('');
    }
  };
  
  // Debounce password validation to avoid too many checks
  const timeoutId = setTimeout(validatePassword, 300);
  
  return () => clearTimeout(timeoutId);
}, [newPassword, foundUser]);

// Validate confirm password
useEffect(() => {
  if (confirmPassword.length > 0) {
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  } else {
    setConfirmPasswordError('');
  }
}, [confirmPassword, newPassword]);

const validatePasswordWithFeedback = async (password, confirmPass = '') => {
  setPasswordValidationInProgress(true);
  
  let errors = [];
  let score = 0;
  
  // Basic strength checks
  if (password.length === 0) {
    setPasswordError('');
    setPasswordValidationInProgress(false);
    return { score: 0, feedback: '' };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Include lowercase letters');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Include uppercase letters');
  } else {
    score += 1;
  }
  
  if (!/\d/.test(password)) {
    errors.push('Include numbers');
  } else {
    score += 1;
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Include special characters (!@#$%^&*)');
  } else {
    score += 1;
  }
  
  // Check against previous passwords if user is found and password is long enough
  if (foundUser && password.length >= 6) {
    try {
      const isPrevious = await checkAgainstPreviousPasswords(foundUser, password);
      if (isPrevious) {
        errors.unshift('This password has been used before. Please choose a different password.');
        score = 0; // Force failure for reused password
      }
    } catch (error) {
      console.warn('Previous password check failed:', error);
    }
  }
  
  // Set error message based on validation
  if (errors.length > 0) {
    if (score === 0 && errors[0].includes('used before')) {
      setPasswordError(errors[0]); // Show reuse error prominently
    } else if (score < 2) {
      setPasswordError('Weak password: ' + errors.join(', '));
    } else if (score < 4) {
      setPasswordError('Password could be stronger: ' + errors.slice(0, 2).join(', '));
    } else {
      setPasswordError(''); // Strong enough
    }
  } else {
    setPasswordError(''); // No errors
  }
  
  // Validate confirm password if provided
  if (confirmPass.length > 0 && password !== confirmPass) {
    setConfirmPasswordError('Passwords do not match');
  } else {
    setConfirmPasswordError('');
  }
  
  setPasswordValidationInProgress(false);
  
  return {
    score,
    feedback: errors.join(', '),
    isValid: errors.length === 0 && score >= 3
  };
};

const checkNetworkStatus = async () => {
  try {
    const networkState = await NetInfo.fetch();
    setIsOnline(networkState.isConnected ?? false);
  } catch (error) {
    console.error('Network check error:', error);
    setIsOnline(false);
  }
};

const determineAvailableMethods = async (user) => {
  const methods = [];
  
  // Security question method (offline)
  if (user.securityQuestion && user.securityAnswer) {
    methods.push({
      id: 'security',
      title: 'Security Question',
      description: 'Answer your security question',
      icon: 'help-circle',
      offline: true,
      available: true
    });
  }
  
  // Firebase email reset (online only)
  if (isOnline && user.firebaseUid) {
    methods.push({
      id: 'firebase',
      title: 'Email Reset',
      description: 'Get reset link via email',
      icon: 'email',
      offline: false,
      available: true
    });
  }
  
  // Device authentication (if available)
  if (deviceAuthAvailable) {
    methods.push({
      id: 'device',
      title: `Device ${biometricType}`,
      description: 'Use your device security',
      icon: 'fingerprint',
      offline: true,
      available: true
    });
  }
  
  setAvailableMethods(methods);
};

  const checkDeviceAuthAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (compatible && enrolled) {
        setDeviceAuthAvailable(true);
        
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Fingerprint');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Iris');
        } else {
          setBiometricType('PIN/Password/Pattern');
        }
      }
    } catch (error) {
      console.error('Error checking device auth:', error);
      setDeviceAuthAvailable(false);
    }
  };

const checkUserExists = async (input) => {
  try {
    console.log('🔍 Searching for user:', input);
    let foundUser = null;
    
    // Check locally first
    const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
    if (registeredUsersJson) {
      const registeredUsers = JSON.parse(registeredUsersJson);
      const inputValue = input.trim().toLowerCase();
      
      foundUser = registeredUsers.find(user => {
        return user.email.toLowerCase() === inputValue ||
               user.username.toLowerCase() === inputValue ||
               user.phone === input.trim();
      });
    }
    
    // If not found locally and online, search Firebase
    if (!foundUser && isOnline) {
      try {
        console.log('☁️ Searching Firebase for user...');
        const firebaseUser = await FirebaseService.searchUsers(input.trim(), 1);
        if (firebaseUser.length > 0) {
          foundUser = firebaseUser[0];
          foundUser.isOnlineOnly = true;
        }
      } catch (error) {
        console.warn('Firebase search failed:', error.message);
      }
    }

    setFoundUser(foundUser);
    setUserExists(!!foundUser);
    setShowUserNotFound(!foundUser && input.trim().length > 2);
    
    if (foundUser) {
      await determineAvailableMethods(foundUser);
    }
    
    return foundUser;
  } catch (error) {
    console.error('Error checking user exists:', error);
    return null;
  }
};

  const handleStepOne = () => {
    if (!userInput.trim()) {
      Alert.alert('Error', 'Please enter your email, username, or phone number');
      return;
    }

    if (!foundUser) {
      Alert.alert('User Not Found', 'No account found with these credentials. Please check your input or create a new account.');
      return;
    }

    if (!foundUser.securityQuestion || !foundUser.securityAnswer) {
      Alert.alert(
        'Security Question Not Set', 
        'This account was created before security questions were implemented. Please contact support for password reset assistance.',
        [
          { text: 'Contact Support', onPress: () => handleContactSupport() },
          { text: 'Back', style: 'cancel' }
        ]
      );
      return;
    }

    setStep(2);
  };

  const handleSecurityQuestion = () => {
    if (!securityAnswer.trim()) {
      Alert.alert('Error', 'Please answer the security question');
      return;
    }

    if (!securityAnswerCorrect) {
      Alert.alert('Incorrect Answer', 'The answer to your security question is incorrect. Please try again.');
      return;
    }

    if (deviceAuthAvailable) {
      setStep(3);
    } else {
      setStep(4);
    }
  };

//
const handleFirebasePasswordReset = async () => {
  if (!foundUser?.email) {
    Alert.alert('Error', 'No email address found for this user.');
    return;
  }

  setLoading(true);

  try {
    console.log('📧 Sending Firebase password reset email to:', foundUser.email);
    
    // Use Firebase Auth to send password reset email
    await sendPasswordResetEmail(auth, foundUser.email);
    
    setFirebaseEmailSent(true);
    
    Alert.alert(
      'Reset Email Sent',
      `A password reset link has been sent to ${foundUser.email}. Please check your inbox and follow the instructions.`,
      [
        {
          text: 'Open Email App',
          onPress: () => {
            // Optional: Deep link to email app
          }
        },
        {
          text: 'OK',
          style: 'default'
        }
      ]
    );
    
  } catch (error) {
    console.error('Firebase password reset error:', error);
    
    let errorMessage = 'Failed to send reset email. Please try again.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'This email is not registered with Firebase. Try using the security question method instead.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address format.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many reset attempts. Please wait before trying again.';
    }
    
    Alert.alert('Reset Failed', errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleDeviceAuthentication = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to reset password',
        subtitle: 'Use your device security to continue',
        fallbackLabel: 'Use PIN/Password',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        setStep(4);
      } else {
        Alert.alert('Authentication Failed', 'Please try again or use a different method.');
      }
    } catch (error) {
      console.error('Device auth error:', error);
      Alert.alert('Error', 'Authentication failed. Please try again.');
    }
  };

const handlePasswordReset = async () => {
  if (!newPassword.trim() || !confirmPassword.trim()) {
    Alert.alert('Error', 'Please fill in all password fields');
    return;
  }

  if (passwordStrength.score < 2) {
    Alert.alert('Weak Password', 'Please choose a stronger password. ' + passwordStrength.feedback);
    return;
  }

  if (newPassword !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match');
    return;
  }

  // CHECK AGAINST PREVIOUS PASSWORDS
  const isPreviousPassword = await checkAgainstPreviousPasswords(foundUser, newPassword);
  if (isPreviousPassword) {
    Alert.alert(
      'Password Previously Used', 
      'You cannot reuse a previous password. Please choose a different password.',
      [{ text: 'OK' }]
    );
    return;
  }

  setLoading(true);

  try {
    console.log('🔐 Resetting password with secure storage...');
    
    // Hash the new password
    const hashedPassword = PasswordSecurityService.hashPassword(newPassword);
    
    // Store previous password in history before updating
    await storePreviousPassword(foundUser, foundUser.passwordHash || foundUser.password);
    
    // Rest of your existing password reset logic...
    const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
    let updatedUser = null;
    
    if (registeredUsersJson) {
      const registeredUsers = JSON.parse(registeredUsersJson);
      const userIndex = registeredUsers.findIndex(user => 
        user.id === foundUser.id || user.email === foundUser.email
      );
      
      if (userIndex !== -1) {
        // Remove old password and add hashed password
        delete registeredUsers[userIndex].password;
        registeredUsers[userIndex].passwordHash = hashedPassword;
        registeredUsers[userIndex].hasPassword = true;
        registeredUsers[userIndex].passwordResetAt = new Date().toISOString();
        registeredUsers[userIndex].lastSyncAt = new Date().toISOString();
        
        updatedUser = registeredUsers[userIndex];
        
        // Continue with rest of your existing logic...
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Update secure storage
        const userId = updatedUser.id || updatedUser.firebaseUid;
        await PasswordSecurityService.storePasswordSecurely(userId, hashedPassword);
        
        // Update current authenticated user if applicable
        try {
          const currentUserJson = await AsyncStorage.getItem('authenticatedUser');
          if (currentUserJson) {
            const currentUser = JSON.parse(currentUserJson);
            if (currentUser.id === updatedUser.id || currentUser.email === updatedUser.email) {
              const updatedCurrentUser = {
                ...currentUser,
                passwordHash: hashedPassword,
                hasPassword: true,
                passwordResetAt: new Date().toISOString()
              };
              delete updatedCurrentUser.password;
              
              await AsyncStorage.setItem('authenticatedUser', JSON.stringify(updatedCurrentUser));
            }
          }
        } catch (sessionError) {
          console.warn('Session update failed:', sessionError.message);
        }
        
        // Firebase sync logic (your existing code)...
        if (isOnline && foundUser.firebaseUid) {
          try {
            const updateResult = await FirebaseService.updateUserPassword(foundUser.firebaseUid, hashedPassword);
            
            if (updateResult.success) {
              updatedUser.syncedToServer = true;
              updatedUser.lastSyncAt = new Date().toISOString();
              registeredUsers[userIndex] = updatedUser;
              await AsyncStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            } else {
              throw new Error(updateResult.error || 'Immediate update failed');
            }
            
          } catch (firebaseError) {
            await FirebaseService.queueOperation({
              type: 'PASSWORD_UPDATE',
              data: {
                userId: foundUser.firebaseUid,
                passwordHash: hashedPassword,
                updatedAt: new Date().toISOString(),
                email: foundUser.email
              },
              priority: 'high',
              description: `Password reset for ${foundUser.email}`
            });
          }
        } else if (foundUser.firebaseUid) {
          await FirebaseService.queueOperation({
            type: 'PASSWORD_UPDATE', 
            data: {
              userId: foundUser.firebaseUid,
              passwordHash: hashedPassword,
              updatedAt: new Date().toISOString(),
              email: foundUser.email
            },
            priority: 'high',
            description: `Password reset for ${foundUser.email} (offline)`
          });
        }
        
        // Replace the success Alert with this enhanced version:
          const syncStatus = isOnline && foundUser.firebaseUid ? 'synced' : 'queued for sync';

          // Show success message with auto-redirect
          Alert.alert(
            'Password Reset Successful!',
            `Your password has been reset successfully and ${syncStatus}.\n\nRedirecting to login in 3 seconds...`,
            [
              {
                text: 'Sign In Now',
                onPress: () => {
                  navigation.navigate('Login', { 
                    resetEmail: foundUser.email,
                    resetSuccess: true,
                    successMessage: 'Password reset successful! Please sign in with your new password.'
                  });
                }
              },
              {
                text: 'Wait',
                style: 'cancel'
              }
            ]
          );

          // Auto-redirect after 3 seconds
          setTimeout(() => {
            navigation.navigate('Login', { 
              resetEmail: foundUser.email,
              resetSuccess: true,
              successMessage: 'Password reset successful! Please sign in with your new password.'
            });
          }, 3000);


      }
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
    Alert.alert('Password Reset Failed', `Failed to reset password: ${error.message}. Please try again.`);
  } finally {
    setLoading(false);
  }
};

const checkAgainstPreviousPasswords = async (user, newPassword) => {
  try {
    const userId = user.id || user.firebaseUid;
    
    // Check current password
    if (user.passwordHash) {
      const matchesCurrent = PasswordSecurityService.verifyPassword(newPassword, user.passwordHash);
      if (matchesCurrent) {
        return true;
      }
    } else if (user.password) {
      // Legacy password check
      if (user.password === newPassword) {
        return true;
      }
    }
    
    // Check against stored password history
    const passwordHistory = await getPasswordHistory(userId);
    
    for (const historicalPassword of passwordHistory) {
      const matches = PasswordSecurityService.verifyPassword(newPassword, historicalPassword);
      if (matches) {
        return true;
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('Error checking previous passwords:', error);
    return false; // Allow password change if check fails
  }
};

const storePreviousPassword = async (user, currentPasswordHash) => {
  try {
    const userId = user.id || user.firebaseUid;
    
    if (!currentPasswordHash) {
      return; // No current password to store
    }
    
    // Get existing history
    const history = await getPasswordHistory(userId);
    
    // Add current password to history
    const updatedHistory = [currentPasswordHash, ...history];
    
    // Keep only last 5 passwords (adjust as needed)
    const limitedHistory = updatedHistory.slice(0, 5);
    
    // Store updated history
    await AsyncStorage.setItem(`password_history_${userId}`, JSON.stringify(limitedHistory));
    
    console.log(`Password history updated for user ${userId}, storing ${limitedHistory.length} previous passwords`);
    
  } catch (error) {
    console.error('Error storing previous password:', error);
  }
};

const getPasswordHistory = async (userId) => {
  try {
    const historyJson = await AsyncStorage.getItem(`password_history_${userId}`);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting password history:', error);
    return [];
  }
};


  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'For security reasons, password reset support is available through:\n\n• Email: support@yourapp.com\n• Phone: +1-234-567-8900\n\nPlease provide your account details for assistance.',
      [{ text: 'OK' }]
    );
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Find Your Account';
      case 2: return 'Security Question';
      case 3: return 'Verify Identity';
      case 4: return 'Create New Password';
      default: return 'Reset Password';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 1: return foundUser ? `Account found: ${foundUser.firstName} ${foundUser.lastName}` : 'Enter your email, username, or phone number';
      case 2: return 'Answer your security question to verify your identity';
      case 3: return `Use your device ${biometricType} to verify your identity`;
      case 4: return 'Enter your new password';
      default: return '';
    }
  };

  const renderStepOne = () => (
    <>
      <TextInput
        label="Email, Username, or Phone"
        value={userInput}
        onChangeText={setUserInput}
        mode="outlined"
        keyboardType="default"
        autoCapitalize="none"
        style={styles.input}
        error={showUserNotFound}
        theme={{
          colors: {
            primary: ENHANCED_COLORS.inputBorderFocused,
            onSurface: ENHANCED_COLORS.inputText,
            onSurfaceVariant: ENHANCED_COLORS.inputPlaceholder,
            outline: ENHANCED_COLORS.inputBorder,
            background: ENHANCED_COLORS.inputBackground,
          },
        }}
        left={<TextInput.Icon icon="account-search" />}
        right={userInput.length > 0 ? (
          <TextInput.Icon 
            icon={userExists === true ? "check-circle" : userExists === false ? "close-circle" : "close"} 
            iconColor={userExists === true ? ENHANCED_COLORS.success : userExists === false ? ENHANCED_COLORS.error : ENHANCED_COLORS.onSurfaceVariant}
          />
        ) : null}
      />

      {showUserNotFound && (
        <Text style={styles.helperTextError}>
          User not found. Please check your credentials or create an account.
        </Text>
      )}

      {foundUser && (
        <View style={styles.userFoundContainer}>
          <Chip 
            icon="check-circle" 
            style={styles.userFoundChip}
            textStyle={styles.userFoundText}>
            Account found: {foundUser.firstName} {foundUser.lastName}
          </Chip>
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleStepOne}
        disabled={!foundUser}
        style={[styles.continueButton, !foundUser && styles.disabledButton]}
        contentStyle={styles.buttonContent}>
        Continue
      </Button>
    </>
  );

  const renderStepTwo = () => (
  <>
    <View style={styles.methodSelectionContainer}>
      <Text style={styles.methodSelectionTitle}>Choose Reset Method</Text>
      <Text style={styles.methodSelectionSubtitle}>
        How would you like to reset your password?
      </Text>
      
      {availableMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodOption,
            !method.available && styles.methodOptionDisabled,
            !isOnline && !method.offline && styles.methodOptionOffline
          ]}
          onPress={() => {
            if (method.available && (isOnline || method.offline)) {
              setResetMethod(method.id);
              setStep(3);
            }
          }}
          disabled={!method.available || (!isOnline && !method.offline)}
        >
          <View style={styles.methodOptionContent}>
            <Icon 
              name={method.icon} 
              size={24} 
              color={
                method.available && (isOnline || method.offline)
                  ? ENHANCED_COLORS.primary
                  : ENHANCED_COLORS.onSurfaceDisabled
              } 
            />
            <View style={styles.methodOptionText}>
              <Text style={[
                styles.methodOptionTitle,
                (!method.available || (!isOnline && !method.offline)) && styles.methodOptionTitleDisabled
              ]}>
                {method.title}
              </Text>
              <Text style={[
                styles.methodOptionDescription,
                (!method.available || (!isOnline && !method.offline)) && styles.methodOptionDescriptionDisabled
              ]}>
                {method.description}
                {!isOnline && !method.offline && ' (Requires internet)'}
              </Text>
            </View>
            <Icon 
              name="chevron-right" 
              size={20} 
              color={ENHANCED_COLORS.onSurfaceVariant} 
            />
          </View>
        </TouchableOpacity>
      ))}
      
      {!isOnline && (
        <View style={styles.offlineNotice}>
          <Icon name="wifi-off" size={16} color={ENHANCED_COLORS.warning} />
          <Text style={styles.offlineNoticeText}>
            You're offline. Only local methods are available.
          </Text>
        </View>
      )}
    </View>
  </>
);


  const renderStepThree = () => {
  switch (resetMethod) {
    case 'security':
      return renderSecurityQuestionStep();
    case 'firebase':
      return renderFirebaseEmailStep();
    case 'device':
      return renderDeviceAuthStep();
    default:
      return <Text>Invalid method selected</Text>;
  }
};

const renderSecurityQuestionStep = () => (
  <>
    <View style={styles.securityQuestionContainer}>
      <Text style={styles.securityQuestionLabel}>Security Question:</Text>
      <Text style={styles.securityQuestionText}>{foundUser?.securityQuestion}</Text>
    </View>

    <TextInput
      label="Your Answer"
      value={securityAnswer}
      onChangeText={setSecurityAnswer}
      mode="outlined"
      autoCapitalize="words"
      style={styles.input}
      error={securityAnswerCorrect === false}
      theme={{
        colors: {
          primary: ENHANCED_COLORS.inputBorderFocused,
          onSurface: ENHANCED_COLORS.inputText,
          onSurfaceVariant: ENHANCED_COLORS.inputPlaceholder,
          outline: ENHANCED_COLORS.inputBorder,
          background: ENHANCED_COLORS.inputBackground,
        },
      }}
      left={<TextInput.Icon icon="help-circle" />}
      right={securityAnswer.length > 0 ? (
        <TextInput.Icon 
          icon={securityAnswerCorrect === true ? "check-circle" : securityAnswerCorrect === false ? "close-circle" : "help"} 
          iconColor={securityAnswerCorrect === true ? ENHANCED_COLORS.success : securityAnswerCorrect === false ? ENHANCED_COLORS.error : ENHANCED_COLORS.onSurfaceVariant}
        />
      ) : null}
    />

    {securityAnswerCorrect === false && (
      <Text style={styles.helperTextError}>
        Incorrect answer. Please try again.
      </Text>
    )}

    <Button
      mode="contained"
      onPress={() => {
        if (securityAnswerCorrect) {
          setStep(4);
        } else {
          Alert.alert('Incorrect Answer', 'The answer to your security question is incorrect. Please try again.');
        }
      }}
      disabled={!securityAnswerCorrect}
      style={[styles.continueButton, !securityAnswerCorrect && styles.disabledButton]}
      contentStyle={styles.buttonContent}>
      Continue
    </Button>
  </>
);

const renderFirebaseEmailStep = () => (
  <>
    <View style={styles.firebaseContainer}>
      <Icon name="email" size={64} color={ENHANCED_COLORS.primary} />
      <Text style={styles.firebaseTitle}>Email Reset Link</Text>
      <Text style={styles.firebaseSubtitle}>
        We'll send a password reset link to {foundUser?.email}
      </Text>
      
      {firebaseEmailSent && (
        <View style={styles.emailSentNotice}>
          <Icon name="check-circle" size={20} color={ENHANCED_COLORS.success} />
          <Text style={styles.emailSentText}>Reset email sent! Check your inbox.</Text>
        </View>
      )}
    </View>

    <Button
      mode="contained"
      onPress={handleFirebasePasswordReset}
      loading={loading}
      disabled={loading || firebaseEmailSent}
      style={styles.continueButton}
      contentStyle={styles.buttonContent}
      icon="email-send">
      {firebaseEmailSent ? 'Email Sent' : 'Send Reset Email'}
    </Button>

    {firebaseEmailSent && (
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Login')}
        style={styles.backToLoginButton}
        labelStyle={styles.backToLoginLabel}
        icon="login">
        Back to Login
      </Button>
    )}
  </>
);

  const renderStepFour = () => (
  <>
    {/* New Password Input */}
    <TextInput
      label="New Password"
      value={newPassword}
      onChangeText={setNewPassword}
      mode="outlined"
      secureTextEntry={!showNewPassword}
      autoComplete="new-password"
      style={styles.input}
      error={passwordError.length > 0}
      theme={{
        colors: {
          primary: passwordError.length > 0 ? ENHANCED_COLORS.error : ENHANCED_COLORS.inputBorderFocused,
          onSurface: ENHANCED_COLORS.inputText,
          onSurfaceVariant: ENHANCED_COLORS.inputPlaceholder,
          outline: passwordError.length > 0 ? ENHANCED_COLORS.error : ENHANCED_COLORS.inputBorder,
          background: ENHANCED_COLORS.inputBackground,
        },
      }}
      left={<TextInput.Icon icon="lock" />}
      right={
        <TextInput.Icon 
          icon={showNewPassword ? "eye-off" : "eye"} 
          onPress={() => setShowNewPassword(!showNewPassword)}
        />
      }
    />

    {/* Password Error Message */}
    {passwordError.length > 0 && (
      <View style={styles.errorContainer}>
        <Icon name="error" size={16} color={ENHANCED_COLORS.error} />
        <Text style={styles.errorText}>{passwordError}</Text>
      </View>
    )}

    {/* Password Strength Indicator */}
    {newPassword.length > 0 && passwordError.length === 0 && (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthBar}>
          <View 
            style={[
              styles.strengthFill, 
              { 
                width: `${(passwordStrength.score / 5) * 100}%`,
                backgroundColor: 
                  passwordStrength.score < 2 ? ENHANCED_COLORS.error :
                  passwordStrength.score < 4 ? ENHANCED_COLORS.warning :
                  ENHANCED_COLORS.success
              }
            ]} 
          />
        </View>
        <Text style={[
          styles.strengthText,
          { 
            color: 
              passwordStrength.score < 2 ? ENHANCED_COLORS.error :
              passwordStrength.score < 4 ? ENHANCED_COLORS.warning :
              ENHANCED_COLORS.success
          }
        ]}>
          {passwordStrength.score < 2 ? 'Weak' :
           passwordStrength.score < 4 ? 'Good' : 'Strong'}
        </Text>
      </View>
    )}

    {/* Confirm Password Input */}
    <TextInput
      label="Confirm New Password"
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      mode="outlined"
      secureTextEntry={!showConfirmPassword}
      style={[styles.input, { marginTop: SPACING.md }]}
      error={confirmPasswordError.length > 0}
      theme={{
        colors: {
          primary: confirmPasswordError.length > 0 ? ENHANCED_COLORS.error : ENHANCED_COLORS.inputBorderFocused,
          onSurface: ENHANCED_COLORS.inputText,
          onSurfaceVariant: ENHANCED_COLORS.inputPlaceholder,
          outline: confirmPasswordError.length > 0 ? ENHANCED_COLORS.error : ENHANCED_COLORS.inputBorder,
          background: ENHANCED_COLORS.inputBackground,
        },
      }}
      left={<TextInput.Icon icon="lock-check" />}
      right={
        <TextInput.Icon 
          icon={
            showConfirmPassword ? "eye-off" : 
            confirmPassword.length > 0 && newPassword === confirmPassword ? "check-circle" : 
            "eye"
          } 
          iconColor={
            confirmPassword.length > 0 && newPassword === confirmPassword ? 
            ENHANCED_COLORS.success : ENHANCED_COLORS.onSurfaceVariant
          }
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      }
    />

    {/* Confirm Password Error Message */}
    {confirmPasswordError.length > 0 && (
      <View style={styles.errorContainer}>
        <Icon name="error" size={16} color={ENHANCED_COLORS.error} />
        <Text style={styles.errorText}>{confirmPasswordError}</Text>
      </View>
    )}

    {/* Validation in Progress Indicator */}
    {passwordValidationInProgress && (
      <View style={styles.validationContainer}>
        <Text style={styles.validationText}>Checking password...</Text>
      </View>
    )}

    <Button
      mode="contained"
      onPress={handlePasswordReset}
      loading={loading}
      disabled={
        loading || 
        passwordError.length > 0 || 
        confirmPasswordError.length > 0 ||
        newPassword.length < 8 || 
        newPassword !== confirmPassword ||
        passwordValidationInProgress
      }
      style={[
        styles.continueButton, 
        (loading || 
         passwordError.length > 0 || 
         confirmPasswordError.length > 0 ||
         newPassword.length < 8 || 
         newPassword !== confirmPassword) && styles.disabledButton
      ]}
      contentStyle={styles.buttonContent}>
      {loading ? 'Resetting Password...' : 'Reset Password'}
    </Button>
  </>
);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Surface style={styles.surface}>
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4].map((stepNumber) => (
                <View key={stepNumber} style={styles.progressStepContainer}>
                  <View style={[
                    styles.progressStep,
                    step >= stepNumber && styles.progressStepActive,
                    step > stepNumber && styles.progressStepCompleted
                  ]}>
                    <Text style={[
                      styles.progressStepText,
                      step >= stepNumber && styles.progressStepTextActive
                    ]}>
                      {step > stepNumber ? '✓' : stepNumber}
                    </Text>
                  </View>
                  {stepNumber < 4 && (
                    <View style={[
                      styles.progressLine,
                      step > stepNumber && styles.progressLineCompleted
                    ]} />
                  )}
                </View>
              ))}
            </View>

            <Text style={styles.title}>{getStepTitle()}</Text>
            <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
          </View>

          {step === 1 && renderStepOne()}
          {step === 2 && renderStepTwo()}
          {step === 3 && renderStepThree()}
          {step === 4 && renderStepFour()}

          <View style={styles.bottomActions}>
            {step > 1 && (
              <Button
                mode="text"
                onPress={() => setStep(step - 1)}
                style={styles.backButton}
                labelStyle={styles.backButtonLabel}
                icon="arrow-left">
                Back
              </Button>
            )}

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.backToLoginButton}
              labelStyle={styles.backToLoginLabel}>
              Remember your password?
            </Button>

            <TouchableOpacity onPress={handleContactSupport}>
              <Text style={styles.supportText}>
                Need help? Contact Support
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ENHANCED_COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  surface: {
    padding: SPACING.xl,
    borderRadius: 16,
    elevation: 4,
    shadowColor: ENHANCED_COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ENHANCED_COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: ENHANCED_COLORS.primary,
  },
  progressStepCompleted: {
    backgroundColor: ENHANCED_COLORS.success,
  },
  progressStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: ENHANCED_COLORS.onSurfaceVariant,
  },
  progressStepTextActive: {
    color: '#FFFFFF',
  },
  progressLine: {
    width: 24,
    height: 2,
    backgroundColor: ENHANCED_COLORS.border,
    marginHorizontal: 4,
  },
  progressLineCompleted: {
    backgroundColor: ENHANCED_COLORS.success,
  },
  title: {
    ...TEXT_STYLES.h1,
    textAlign: 'center',
    color: ENHANCED_COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: ENHANCED_COLORS.onSurfaceVariant,
    lineHeight: 22,
  },
  input: {
    marginBottom: SPACING.md,
  },
  helperTextError: {
    color: ENHANCED_COLORS.error,
    fontSize: 12,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
    marginLeft: 12,
    fontWeight: '400',
  },
  userFoundContainer: {
    marginBottom: SPACING.md,
  },
  userFoundChip: {
    backgroundColor: ENHANCED_COLORS.successLight,
    alignSelf: 'flex-start',
  },
  userFoundText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  securityQuestionContainer: {
    backgroundColor: ENHANCED_COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  securityQuestionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: ENHANCED_COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },
  securityQuestionText: {
    fontSize: 16,
    color: ENHANCED_COLORS.onSurface,
    fontWeight: '500',
  },
  biometricContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  biometricTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ENHANCED_COLORS.onSurface,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  biometricSubtitle: {
    fontSize: 14,
    color: ENHANCED_COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: ENHANCED_COLORS.primary,
    marginBottom: SPACING.md,
  },
  disabledButton: {
    backgroundColor: ENHANCED_COLORS.onSurfaceDisabled,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  skipButton: {
    borderColor: ENHANCED_COLORS.primary,
    marginBottom: SPACING.md,
  },
  skipButtonLabel: {
    color: ENHANCED_COLORS.primary,
  },
  bottomActions: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.sm,
  },
  backButtonLabel: {
    color: ENHANCED_COLORS.primary,
  },
  backToLoginButton: {
    marginBottom: SPACING.sm,
  },
  backToLoginLabel: {
    color: ENHANCED_COLORS.primary,
    textDecorationLine: 'underline',
  },
  supportText: {
    fontSize: 14,
    color: ENHANCED_COLORS.onSurfaceVariant,
    textDecorationLine: 'underline',
  },

  methodSelectionContainer: {
  marginBottom: SPACING.lg,
},
methodSelectionTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: ENHANCED_COLORS.onSurface,
  textAlign: 'center',
  marginBottom: SPACING.sm,
},
methodSelectionSubtitle: {
  fontSize: 14,
  color: ENHANCED_COLORS.onSurfaceVariant,
  textAlign: 'center',
  marginBottom: SPACING.lg,
},
methodOption: {
  backgroundColor: ENHANCED_COLORS.surfaceVariant,
  borderRadius: 12,
  marginBottom: SPACING.md,
  borderWidth: 1,
  borderColor: ENHANCED_COLORS.border,
},
methodOptionDisabled: {
  opacity: 0.6,
},
methodOptionOffline: {
  backgroundColor: ENHANCED_COLORS.onSurfaceDisabled + '20',
},
methodOptionContent: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: SPACING.md,
},
methodOptionText: {
  flex: 1,
  marginLeft: SPACING.md,
},
methodOptionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: ENHANCED_COLORS.onSurface,
},
methodOptionTitleDisabled: {
  color: ENHANCED_COLORS.onSurfaceDisabled,
},
methodOptionDescription: {
  fontSize: 14,
  color: ENHANCED_COLORS.onSurfaceVariant,
  marginTop: 2,
},
methodOptionDescriptionDisabled: {
  color: ENHANCED_COLORS.onSurfaceDisabled,
},
offlineNotice: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: ENHANCED_COLORS.warning + '20',
  padding: SPACING.md,
  borderRadius: 8,
  marginTop: SPACING.md,
},
offlineNoticeText: {
  color: ENHANCED_COLORS.warning,
  marginLeft: SPACING.sm,
  fontSize: 14,
  fontWeight: '500',
},
firebaseContainer: {
  alignItems: 'center',
  marginBottom: SPACING.xl,
},
firebaseTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: ENHANCED_COLORS.onSurface,
  marginTop: SPACING.md,
  marginBottom: SPACING.sm,
},
firebaseSubtitle: {
  fontSize: 14,
  color: ENHANCED_COLORS.onSurfaceVariant,
  textAlign: 'center',
  lineHeight: 20,
},
emailSentNotice: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: ENHANCED_COLORS.success + '20',
  padding: SPACING.md,
  borderRadius: 8,
  marginTop: SPACING.md,
},
emailSentText: {
  color: ENHANCED_COLORS.success,
  marginLeft: SPACING.sm,
  fontSize: 14,
  fontWeight: '500',
},
errorContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: -SPACING.sm,
  marginBottom: SPACING.md,
  marginLeft: SPACING.sm,
},
errorText: {
  color: ENHANCED_COLORS.error,
  fontSize: 12,
  marginLeft: SPACING.xs,
  flex: 1,
  fontWeight: '500',
},
strengthContainer: {
  marginTop: -SPACING.sm,
  marginBottom: SPACING.md,
  marginHorizontal: SPACING.sm,
},
strengthBar: {
  height: 4,
  backgroundColor: ENHANCED_COLORS.border,
  borderRadius: 2,
  overflow: 'hidden',
  marginBottom: SPACING.xs,
},
strengthFill: {
  height: '100%',
  borderRadius: 2,
  transition: 'width 0.3s ease',
},
strengthText: {
  fontSize: 12,
  fontWeight: '500',
  textAlign: 'right',
},
validationContainer: {
  alignItems: 'center',
  marginVertical: SPACING.sm,
},
validationText: {
  fontSize: 12,
  color: ENHANCED_COLORS.onSurfaceVariant,
  fontStyle: 'italic',
},
});

export default ForgotPasswordScreen;