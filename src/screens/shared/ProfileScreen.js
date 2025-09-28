import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Modal, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useSelector, useDispatch } from 'react-redux';
import { Button, TextInput, Text, Surface, Avatar, Divider, Image, List, Switch, ActivityIndicator, Menu, IconButton, Chip, ProgressBar } from 'react-native-paper';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { logout } from '../../store/reducers/authReducer';
import { updateProfile } from '../../store/reducers/userReducer';
import { setUser } from '../../store/reducers/authReducer';
import AuthService from '../../services/AuthService';
import FirebaseService from '../../services/FirebaseService';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import NotificationSettings from '../parent/settings/NotificationSettings';
import { TEXT_STYLES } from '../../styles/typography';
import { USER_TYPES } from '../../utils/constants';
import * as LocalAuthentication from 'expo-local-authentication';
const { width } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('window');

// Constants for AsyncStorage keys
const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  AUTHENTICATED_USER: 'authenticatedUser',
  REGISTERED_USERS: 'registeredUsers',
  USER_PREFERENCES: 'user_preferences',
  USER_STATS: 'user_stats'
};

  const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    sport: '',
    dateOfBirth: '',
    profileImage: null,
    username: '',
    customRole: '',
    emailOptIn: false,
  });
  
const [preferences, setPreferences] = useState({
  notifications: true,
  emailUpdates: false,
  darkMode: false,
  // Add new notification preferences
  emailNotifications: true,
  pushNotifications: true,
  sessionReminders: true,
  progressUpdates: true,
  marketingEmails: false,
  weeklyReports: true,
});

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [validFields, setValidFields] = useState({});
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changePasswordErrors, setChangePasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [showSwitchAccountsModal, setShowSwitchAccountsModal] = useState(false);
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Security Question, 2: Device Auth, 3: New Password
  const [resetSecurityAnswer, setResetSecurityAnswer] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetSecurityAnswerCorrect, setResetSecurityAnswerCorrect] = useState(null);
  const [deviceAuthAvailable, setDeviceAuthAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordValid, setResetPasswordValid] = useState(true);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingDeletions, setPendingDeletions] = useState(0);

  // User stats with persistence
  const [userStats, setUserStats] = useState({
    completedSessions: 24,
    pendingSessions: 3,
    goalsAchieved: 8,
    totalGoals: 12,
    weeklyStreak: 5,
    totalPoints: 2847
  });


const [children, setChildren] = useState([
  {
    id: 'child_001',
    name: 'Emma Johnson',
    age: 12,
    sport: 'Football',
    level: 'Intermediate',
    academy: 'Elite Sports Academy',
    profileImage: 'https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=EJ',
    activeSessions: 3,
    nextSession: '2024-01-15T16:00:00',
  },
  {
    id: 'child_002',
    name: 'Jake Johnson',
    age: 9,
    sport: 'Basketball',
    level: 'Beginner',
    academy: 'Young Athletes Club',
    profileImage: 'https://via.placeholder.com/80x80/4ECDC4/FFFFFF?text=JJ',
    activeSessions: 2,
    nextSession: '2024-01-16T14:00:00',
  },
]);



  

  // Enhanced data loading function
  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading user data...');
      
      // Try multiple storage keys to find user data
      const storageKeys = [
        STORAGE_KEYS.AUTHENTICATED_USER,
        STORAGE_KEYS.USER_DATA,
      ];
      
      let userData = null;
      
      // Try each storage key until we find user data
      for (const key of storageKeys) {
        try {
          const storedData = await AsyncStorage.getItem(key);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData && (parsedData.id || parsedData.email)) {
              userData = parsedData;
              console.log(`Found user data in ${key}:`, userData);
              break;
            }
          }
        } catch (keyError) {
          console.warn(`Error reading ${key}:`, keyError);
        }
      }
      
      // If no user data found in individual keys, try registered users array
      if (!userData) {
        try {
          const registeredUsersData = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
          if (registeredUsersData) {
            const registeredUsers = JSON.parse(registeredUsersData);
            if (registeredUsers && registeredUsers.length > 0) {
              // Try to find the most recently created user or match with Redux user
              if (user && user.email) {
                userData = registeredUsers.find(u => u.email === user.email);
              }
              if (!userData) {
                // Get the most recent user
                userData = registeredUsers.reduce((latest, current) => {
                  const latestDate = new Date(latest.createdAt || 0);
                  const currentDate = new Date(current.createdAt || 0);
                  return currentDate > latestDate ? current : latest;
                });
              }
              console.log('Found user data in registered users:', userData);
            }
          }
        } catch (registeredError) {
          console.warn('Error reading registered users:', registeredError);
        }
      }
      
      if (userData) {
        // Update form data with loaded user data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          sport: userData.sport || '',
          dateOfBirth: userData.dateOfBirth || '',
          profileImage: userData.profileImage || null,
          username: userData.username || '',
          customRole: userData.customRole || '',
          emailOptIn: userData.emailOptIn || false,
        });
        
        // Update Redux if needed
        if (!user || Object.keys(user).length === 0) {
          console.log('Updating Redux with loaded user data');
          dispatch(setUser(userData));
        }
        
        // Ensure data is saved consistently across all storage keys
        await saveUserDataToStorage(userData);
        
      } else if (user && Object.keys(user).length > 0) {
        // Use Redux user data as fallback
        console.log('Using Redux user data as fallback');
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          sport: user.sport || '',
          dateOfBirth: user.dateOfBirth || '',
          profileImage: user.profileImage || null,
          username: user.username || '',
          customRole: user.customRole || '',
          emailOptIn: user.emailOptIn || false,
        });
        
        await saveUserDataToStorage(user);
      } else {
        console.log('No user data found');
      }

      await loadPasswordHistory();
      
      // Load preferences
      await loadPreferences();
      
      // Load user stats
      await loadUserStats();
      
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  }, [user, dispatch]);

  // Save user data consistently across all storage keys
const saveUserDataToStorage = async (userData) => {
  try {
    const userDataString = JSON.stringify(userData);
    
    // Save to all relevant storage keys
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.USER_DATA, userDataString],
      [STORAGE_KEYS.AUTHENTICATED_USER, userDataString]
    ]);
    
    // Update registered users array - PRESERVE PASSWORD
    try {
      const registeredUsersData = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      let registeredUsers = registeredUsersData ? JSON.parse(registeredUsersData) : [];
      
      const userIndex = registeredUsers.findIndex(u => 
        (u.id && userData.id && u.id === userData.id) || 
        (u.email && userData.email && u.email === userData.email)
      );
      
      if (userIndex !== -1) {
        // ✅ PRESERVE THE PASSWORD when updating
        const existingUser = registeredUsers[userIndex];
        registeredUsers[userIndex] = {
          ...userData,
          password: existingUser.password // Keep the original password!
        };
      } else {
        registeredUsers.push(userData);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));
      console.log('Updated registered users array (password preserved)');
    } catch (registeredError) {
      console.warn('Error updating registered users:', registeredError);
    }
    
    console.log('User data saved successfully');
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

  // Load preferences from storage
// Update your existing loadPreferences function to include default values for new keys
const loadPreferences = async () => {
  try {
    const preferencesData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (preferencesData) {
      const parsedPreferences = JSON.parse(preferencesData);
      setPreferences({
        notifications: true,
        emailUpdates: false,
        darkMode: false,
        emailNotifications: true,
        pushNotifications: true,
        sessionReminders: true,
        progressUpdates: true,
        marketingEmails: false,
        weeklyReports: true,
        ...parsedPreferences // Override with saved preferences
      });
      console.log('Loaded preferences:', parsedPreferences);
    }
  } catch (error) {
    console.warn('Error loading preferences:', error);
  }
};

  // Save preferences to storage
  const savePreferences = async (newPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(newPreferences));
      console.log('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Load user stats from storage
  const loadUserStats = async () => {
    try {
      const statsData = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
      if (statsData) {
        const parsedStats = JSON.parse(statsData);
        setUserStats(parsedStats);
        console.log('Loaded user stats:', parsedStats);
      }
    } catch (error) {
      console.warn('Error loading user stats:', error);
    }
  };

  

  // Load password history from storage
const loadPasswordHistory = async () => {
  try {
    const historyData = await AsyncStorage.getItem('passwordHistory_' + user?.id);
    if (historyData) {
      const parsedHistory = JSON.parse(historyData);
      setPasswordHistory(parsedHistory);
    }
  } catch (error) {
    console.warn('Error loading password history:', error);
  }
};

  // Save user stats to storage
  const saveUserStats = async (newStats) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(newStats));
      console.log('User stats saved successfully');
    } catch (error) {
      console.error('Error saving user stats:', error);
    }
  };

  // Initial load effect
  useEffect(() => {
    loadUserData();
    loadSavedAccounts(); 
  }, [loadUserData]);

  // Check reset security answer in real-time
  useEffect(() => {
    if (resetSecurityAnswer) {
      checkResetSecurityAnswer(resetSecurityAnswer);
    }
  }, [resetSecurityAnswer, user]);

  // Real-time validation for reset password
  useEffect(() => {
    const validatePassword = async () => {
      if (resetNewPassword.trim().length > 0) {
        const validation = await validateResetPassword(resetNewPassword);
        setResetPasswordValid(validation.isValid);
        setResetPasswordError(validation.error);
      } else {
        setResetPasswordValid(true);
        setResetPasswordError('');
      }
    };
    
    validatePassword();
  }, [resetNewPassword, passwordHistory, user]);

  // Add this effect to monitor queue
    useEffect(() => {
      const checkPendingDeletions = async () => {
        try {
          const syncStatus = await FirebaseService.getSyncStatus();
          const queue = await FirebaseService.getOfflineQueue();
          const deletionOps = queue.filter(op => op.type === 'account_deletion');
          setPendingDeletions(deletionOps.length);
        } catch (error) {
          console.warn('Error checking pending deletions:', error);
        }
      };

      checkPendingDeletions();
      const interval = setInterval(checkPendingDeletions, 10000); // Check every 10s
      return () => clearInterval(interval);
    }, []);

  // Sync with Redux user changes (but don't override during editing)
  useEffect(() => {
    if (user && Object.keys(user).length > 0 && !isEditing && !isLoading) {
      console.log('Syncing Redux user to form data:', user);
      setFormData(prevData => ({
        firstName: user.firstName || prevData.firstName,
        lastName: user.lastName || prevData.lastName,
        email: user.email || prevData.email,
        phone: user.phone || prevData.phone,
        sport: user.sport || prevData.sport,
        dateOfBirth: user.dateOfBirth || prevData.dateOfBirth,
        profileImage: user.profileImage || prevData.profileImage,
        username: user.username || prevData.username,
        customRole: user.customRole || prevData.customRole,
        emailOptIn: user.emailOptIn !== undefined ? user.emailOptIn : prevData.emailOptIn,
      }));
    }
  }, [user, isEditing, isLoading]);

  // Validation functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\+]?[0-9][\d]{6,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const isValidName = (name) => {
    return name.trim().length >= 2;
  };

  const isValidUsername = (username) => {
    return username.trim().length >= 3;
  };

  const validateField = (field, value) => {
    console.log(`Validating field: ${field}, value: ${value}`);

    let isValid = false;
    let errorMessage = '';

    switch (field) {
      case 'firstName':
        isValid = isValidName(value);
        if (!isValid && value) errorMessage = 'First name must be at least 2 characters';
        if (!value) errorMessage = 'First name is required';
        break;
      case 'lastName':
        isValid = isValidName(value);
        if (!isValid && value) errorMessage = 'Last name must be at least 2 characters';
        if (!value) errorMessage = 'Last name is required';
        break;
      case 'email':
        isValid = isValidEmail(value);
        if (!isValid && value) errorMessage = 'Please enter a valid email address';
        if (!value) errorMessage = 'Email is required';
        break;
      case 'username':
        isValid = isValidUsername(value);
        if (!isValid && value) errorMessage = 'Username must be at least 3 characters';
        if (!value) errorMessage = 'Username is required';
        break;
      case 'phone':
        isValid = isValidPhone(value);
        if (!isValid && value) errorMessage = 'Please enter a valid phone number';
        break;
      case 'sport':
        isValid = true; // Sport is optional
        break;
      default:
        break;
    }

    setValidFields(prev => ({ ...prev, [field]: isValid && value }));
    setErrors(prev => ({ ...prev, [field]: errorMessage }));

    console.log(`Validation result for ${field}: isValid=${isValid}, error=${errorMessage}`);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  // Password validation for change password
const validateChangePasswordField = async (field, value) => {
  let isValid = false;
  let errorMessage = '';

  switch (field) {
    case 'currentPassword':
      if (!value) {
        errorMessage = 'Current password is required';
      } else {
        // Verify current password against stored password
        const isCurrentPasswordValid = await verifyCurrentPassword(value);
        if (!isCurrentPasswordValid) {
          errorMessage = 'Current password is incorrect';
        } else {
          isValid = true;
        }
      }
      break;
      
    case 'newPassword':
      if (!value) {
        errorMessage = 'New password is required';
      } else if (value.length < 6) {
        errorMessage = 'Password must be at least 6 characters';
      } else if (value === changePasswordData.currentPassword) {
        errorMessage = 'New password must be different from current password';
      } else if (passwordHistory.includes(value)) {
        errorMessage = 'Cannot reuse a previously used password';
      } else {
        isValid = true;
      }
      break;
      
    case 'confirmNewPassword':
      if (!value) {
        errorMessage = 'Please confirm your new password';
      } else if (value !== changePasswordData.newPassword) {
        errorMessage = 'Passwords do not match';
      } else {
        isValid = true;
      }
      break;
  }

  setChangePasswordErrors(prev => ({ ...prev, [field]: errorMessage }));
  return isValid;
};

// Verify current password against stored password
const verifyCurrentPassword = async (enteredPassword) => {
  try {
    const registeredUsersData = await AsyncStorage.getItem('registeredUsers');
    if (registeredUsersData) {
      const users = JSON.parse(registeredUsersData);
      const currentUser = users.find(u => u.id === user?.id || u.email === user?.email);
      return currentUser && currentUser.password === enteredPassword;
    }
    return false;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

// Handle change password input change
const handleChangePasswordInputChange = (field, value) => {
  setChangePasswordData(prev => ({ ...prev, [field]: value }));
  validateChangePasswordField(field, value);
};

// Handle change password save
const handleChangePassword = async () => {
  try {
    // Validate all fields
    const currentPasswordValid = await validateChangePasswordField('currentPassword', changePasswordData.currentPassword);
    const newPasswordValid = await validateChangePasswordField('newPassword', changePasswordData.newPassword);
    const confirmPasswordValid = await validateChangePasswordField('confirmNewPassword', changePasswordData.confirmNewPassword);

    if (!currentPasswordValid || !newPasswordValid || !confirmPasswordValid) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    // Update password in registered users
    const registeredUsersData = await AsyncStorage.getItem('registeredUsers');
    if (registeredUsersData) {
      const users = JSON.parse(registeredUsersData);
      const userIndex = users.findIndex(u => u.id === user?.id || u.email === user?.email);
      
      if (userIndex !== -1) {
        // Update password
        users[userIndex].password = changePasswordData.newPassword;
        users[userIndex].updatedAt = new Date().toISOString();
        
        // Save updated users
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // Update password history
        const newHistory = [changePasswordData.currentPassword, ...passwordHistory].slice(0, 5); // Keep last 5 passwords
        await AsyncStorage.setItem('passwordHistory_' + user?.id, JSON.stringify(newHistory));
        setPasswordHistory(newHistory);
      }
    }

    // Reset form and close modal
    setChangePasswordData({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
    setChangePasswordErrors({});
    setShowChangePasswordModal(false);

    Alert.alert('Success', 'Password changed successfully!');
  } catch (error) {
    console.error('Change password error:', error);
    Alert.alert('Error', 'Failed to change password. Please try again.');
  }
};

// Handle forgot password
// Handle forgot password - Updated to use in-app modal
// Handle forgot password - Updated to clear validation states
const handleForgotPassword = async () => {
  setShowChangePasswordModal(false);
  
  // Check if user has security question set up
  if (!user?.securityQuestion || !user?.securityAnswer) {
    Alert.alert(
      'Security Question Required',
      'To reset your password, you need to have a security question set up. Please contact support for assistance.',
      [
        { text: 'Contact Support', onPress: () => handleContactSupport() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
    return;
  }

  // Check device authentication availability
  await checkResetDeviceAuthAvailability();
  
  // Reset modal state and show
  setResetStep(1);
  setResetSecurityAnswer('');
  setResetNewPassword('');
  setResetConfirmPassword('');
  setResetSecurityAnswerCorrect(null);
  setResetPasswordError(''); // NEW
  setResetPasswordValid(true); // NEW
  setShowPasswordResetModal(true);
};

  const getInputTheme = (field) => {
    const hasError = !!errors[field];
    const isValid = validFields[field];
    
    return {
      colors: {
        primary: isValid ? '#10B981' : hasError ? '#EF4444' : COLORS.primary,
        outline: isValid ? '#10B981' : hasError ? '#EF4444' : COLORS.border,
        onSurfaceVariant: COLORS.textSecondary,
        onSurface: COLORS.inputText 
      }
    };
  };

  const handleImageUpload = () => {
    setShowImageModal(true);
  };

  const selectImageFromGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.error) {
        console.log('ImagePicker cancelled or error');
      } else if (response.assets && response.assets[0]) {
        setFormData(prev => ({
          ...prev,
          profileImage: response.assets[0].uri
        }));
      }
    });
    setShowImageModal(false);
  };

  const selectImageFromCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel || response.error) {
        console.log('Camera cancelled or error');
      } else if (response.assets && response.assets[0]) {
        setFormData(prev => ({
          ...prev,
          profileImage: response.assets[0].uri
        }));
      }
    });
    setShowImageModal(false);
  };

  const handleSave = async () => {
    console.log('Save button clicked, form data:', formData);
    
    // Validate all fields before saving
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'username', 'phone'];
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field])) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      console.log('Validation passed, saving...');
      
      // Get current user data (either from Redux or formData)
      const currentUser = user && Object.keys(user).length > 0 ? user : {};
      
      // Create updated user object
      const updatedUser = { 
        ...currentUser,
        ...formData,
        // Ensure we keep important fields
        id: currentUser.id || Date.now().toString(),
        createdAt: currentUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userType: currentUser.userType || '',
      };

      console.log('Updated user object:', updatedUser);
      
      // Save to storage with enhanced persistence
      await saveUserDataToStorage(updatedUser);
      
      // Update Redux store
      dispatch(updateProfile(formData));
      dispatch(setUser(updatedUser));
      console.log('Redux store updated');
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile: ' + error.message);
    }
  };

  // Check device authentication availability for password reset
const checkResetDeviceAuthAvailability = async () => {
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
    } else {
      setDeviceAuthAvailable(false);
    }
  } catch (error) {
    console.error('Error checking device auth:', error);
    setDeviceAuthAvailable(false);
  }
};

// Check security answer in real-time for password reset
const checkResetSecurityAnswer = (answer) => {
  if (user && answer.trim().length > 0) {
    const isCorrect = user.securityAnswer.toLowerCase() === answer.toLowerCase().trim();
    setResetSecurityAnswerCorrect(isCorrect);
  } else {
    setResetSecurityAnswerCorrect(null);
  }
};

// Handle security question step
const handleResetSecurityQuestion = () => {
  if (!resetSecurityAnswer.trim()) {
    Alert.alert('Error', 'Please answer the security question');
    return;
  }

  if (!resetSecurityAnswerCorrect) {
    Alert.alert('Incorrect Answer', 'The answer to your security question is incorrect. Please try again.');
    return;
  }

  if (deviceAuthAvailable) {
    setResetStep(2); // Go to device authentication
  } else {
    setResetStep(3); // Skip to new password
  }
};

// Handle device authentication for password reset
const handleResetDeviceAuthentication = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity to reset password',
      subtitle: 'Use your device security to continue',
      fallbackLabel: 'Use PIN/Password',
      cancelLabel: 'Cancel',
    });

    if (result.success) {
      setResetStep(3); // Go to new password step
    } else {
      Alert.alert('Authentication Failed', 'Please try again or skip this step.');
    }
  } catch (error) {
    console.error('Device auth error:', error);
    Alert.alert('Error', 'Authentication failed. Please try again.');
  }
};

// Handle password reset completion
// Handle password reset completion - Updated with password history validation
const handlePasswordResetComplete = async () => {
  if (!resetNewPassword.trim() || !resetConfirmPassword.trim()) {
    Alert.alert('Error', 'Please fill in all password fields');
    return;
  }

  if (resetNewPassword.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters long');
    return;
  }

  if (resetNewPassword !== resetConfirmPassword) {
    Alert.alert('Error', 'Passwords do not match');
    return;
  }

  // NEW: Check if password is same as current password
  try {
    const registeredUsersData = await AsyncStorage.getItem('registeredUsers');
    if (registeredUsersData) {
      const users = JSON.parse(registeredUsersData);
      const currentUser = users.find(u => u.id === user?.id || u.email === user?.email);
      
      if (currentUser && currentUser.password === resetNewPassword) {
        Alert.alert('Error', 'New password cannot be the same as your current password. Please choose a different password.');
        return;
      }
    }
  } catch (error) {
    console.error('Error checking current password:', error);
  }

  // NEW: Check against password history
  if (passwordHistory.includes(resetNewPassword)) {
    Alert.alert(
      'Password Previously Used', 
      'You cannot reuse a previously used password. Please choose a different password.',
      [{ text: 'OK' }]
    );
    return;
  }

  setResetLoading(true);

  try {
    // Update password in registered users
    const registeredUsersData = await AsyncStorage.getItem('registeredUsers');
    if (registeredUsersData) {
      const users = JSON.parse(registeredUsersData);
      const userIndex = users.findIndex(u => u.id === user?.id || u.email === user?.email);
      
      if (userIndex !== -1) {
        // Get the current password before updating
        const currentPassword = users[userIndex].password;
        
        // Update password and preserve other data
        users[userIndex] = {
          ...users[userIndex],
          password: resetNewPassword,
          updatedAt: new Date().toISOString()
        };
        
        // Save updated users
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
        
        // NEW: Update password history with current password
        const newHistory = [currentPassword, ...passwordHistory].slice(0, 5); // Keep last 5 passwords
        await AsyncStorage.setItem('passwordHistory_' + user?.id, JSON.stringify(newHistory));
        setPasswordHistory(newHistory);
        
        // Update current user data
        const updatedUser = users[userIndex];
        await saveUserDataToStorage(updatedUser);
        dispatch(setUser(updatedUser));
      }
    }

    // Close modal and show success
    setShowPasswordResetModal(false);
    
    Alert.alert(
      'Password Reset Successful',
      'Your password has been reset successfully!',
      [{ text: 'OK' }]
    );
    
  } catch (error) {
    console.error('Error resetting password:', error);
    Alert.alert('Error', 'Failed to reset password. Please try again.');
  } finally {
    setResetLoading(false);
  }
};

// NEW: Real-time password validation for reset
const validateResetPassword = async (password) => {
  if (!password) return { isValid: true, error: '' };
  
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  // Check against current password
  try {
    const registeredUsersData = await AsyncStorage.getItem('registeredUsers');
    if (registeredUsersData) {
      const users = JSON.parse(registeredUsersData);
      const currentUser = users.find(u => u.id === user?.id || u.email === user?.email);
      
      if (currentUser && currentUser.password === password) {
        return { isValid: false, error: 'Cannot use your current password' };
      }
    }
  } catch (error) {
    console.error('Error checking current password:', error);
  }

  // Check against password history
  if (passwordHistory.includes(password)) {
    return { isValid: false, error: 'Cannot reuse a previously used password' };
  }

  return { isValid: true, error: '' };
};

// Handle contact support
const handleContactSupport = () => {
  Alert.alert(
    'Contact Support',
    'For password reset assistance, please contact:\n\n• Email: support@yourapp.com\n• Phone: +1-234-567-8900\n\nPlease provide your account details.',
    [{ text: 'OK' }]
  );
};

  const handleEditClick = () => {
    console.log('Edit button clicked');
    console.log('Current isEditing state:', isEditing);
    console.log('Current user:', user);
    console.log('Current formData:', formData);
    setIsEditing(true);
  };


// Helper function for notification preference descriptions
const getPreferenceDescription = (key) => {
  const descriptions = {
    emailNotifications: 'Receive notifications via email',
    pushNotifications: 'Get push notifications on your device',
    sessionReminders: 'Reminders before scheduled sessions',
    progressUpdates: 'Updates about your children\'s progress',
    marketingEmails: 'Promotional offers and updates',
    weeklyReports: 'Weekly summary of activities',
  };
  return descriptions[key] || '';
};

// Children Section Component
const ChildrenSection = () => (
  <Surface style={styles.infoCard}>
    <View style={styles.sectionHeader}>
      <Text style={styles.cardTitle}>My Children</Text>
      <TouchableOpacity onPress={() => navigation?.navigate('ChildrenOverview')}>
        <Text style={styles.viewAllText}>View All</Text>
      </TouchableOpacity>
    </View>
    
    {children.map(child => (
      <TouchableOpacity 
        key={child.id} 
        style={styles.childCard}
        onPress={() => navigation?.navigate('ChildProgress', { childId: child.id })}
      >
        <Avatar.Image source={{ uri: child.profileImage }} size={60} style={styles.childImage} />
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childDetails}>{child.age} years • {child.sport}</Text>
          <Text style={styles.academyName}>{child.academy}</Text>
        </View>
        <View style={styles.childStats}>
          <Text style={styles.sessionsCount}>{child.activeSessions}</Text>
          <Text style={styles.sessionsLabel}>Sessions</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#64748B" />
      </TouchableOpacity>
    ))}
  </Surface>
);

// Enhanced Notification Preferences Component
const NotificationPreferences = () => (
  <Surface style={styles.infoCard}>
    <Text style={styles.cardTitle}>Notification Preferences</Text>
    
    {Object.entries(preferences).filter(([key]) => 
      ['emailNotifications', 'pushNotifications', 'sessionReminders', 'progressUpdates', 'marketingEmails', 'weeklyReports'].includes(key)
    ).map(([key, value]) => (
      <View key={key} style={styles.preferenceItem}>
        <View style={styles.preferenceIcon}>
          <Icon 
            name={key === 'emailNotifications' ? 'email' : 
                  key === 'pushNotifications' ? 'notifications' :
                  key === 'sessionReminders' ? 'alarm' :
                  key === 'progressUpdates' ? 'trending-up' :
                  key === 'marketingEmails' ? 'campaign' :
                  'assessment'} 
            size={20} 
            color="#3B82F6" 
          />
        </View>
        <View style={styles.preferenceContent}>
          <Text style={styles.preferenceTitle}>
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </Text>
          <Text style={styles.preferenceDescription}>
            {getPreferenceDescription(key)}
          </Text>
        </View>
        <Switch
          value={value}
          onValueChange={(newValue) => handlePreferenceChange(key, newValue)}
          thumbColor={value ? '#10B981' : '#CBD5E1'}
          trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
        />
      </View>
    ))}
  </Surface>
);

// Enhanced Menu Section Component
const MenuSection = () => {
  const menuItems = [
    { icon: 'payment', title: 'Payment History', screen: 'PaymentHistory' },
    { icon: 'star', title: 'Rate Academies', screen: 'FeedbackScreen' },
    { icon: 'help', title: 'Support', screen: 'SupportScreen' },
    { icon: 'settings', title: 'Settings', screen: 'SettingsScreen' },
    { icon: 'privacy-tip', title: 'Child Protection', screen: 'ChildProtection' },
    { icon: 'payment', title: 'Add Payment Method', screen: 'AddPaymentMethod' },
    { icon: 'description', title: 'Terms of Service', screen: null },
  ];

  return (
    <Surface style={styles.infoCard}>
      <Text style={styles.cardTitle}>Account</Text>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.accountItem}
          onPress={() => item.screen ? navigation?.navigate(item.screen) : null}
        >
          <View style={styles.accountIcon}>
            <Icon name={item.icon} size={20} color="#3B82F6" />
          </View>
          <View style={styles.accountContent}>
            <Text style={styles.accountTitle}>{item.title}</Text>
          </View>
          <Icon name="chevron-right" size={16} color="#64748B" />
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity 
        style={[styles.accountItem, styles.dangerItem]} 
        onPress={() => setShowLogoutModal(true)}
      >
        <View style={styles.accountIcon}>
          <Icon name="logout" size={20} color="#EF4444" />
        </View>
        <View style={styles.accountContent}>
          <Text style={[styles.accountTitle, styles.dangerText]}>Logout</Text>
          <Text style={styles.accountDescription}>Sign out of your account</Text>
        </View>
      </TouchableOpacity>
    </Surface>
  );
};



  // Load all saved accounts
const loadSavedAccounts = async () => {
  try {
    const registeredUsersData = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (registeredUsersData) {
      const users = JSON.parse(registeredUsersData);
      setSavedAccounts(users || []);
    }
  } catch (error) {
    console.error('Error loading saved accounts:', error);
  }
};

// Handle add new account
const handleAddNewAccount = () => {
  setShowSettingsMenu(false);
  setShowSwitchAccountsModal(false);
  setShowAddAccountModal(true);
};

// Handle switch to different account
const handleSwitchAccount = async (selectedUser) => {
  try {
    // Save the selected user as authenticated user
    await saveUserDataToStorage(selectedUser);
    
    // Update Redux store
    dispatch(setUser(selectedUser));
    
    // Close modal
    setShowSwitchAccountsModal(false);
    
    // Reload user data
    await loadUserData();
    
    Alert.alert('Success', `Switched to ${selectedUser.firstName} ${selectedUser.lastName}'s account`);
  } catch (error) {
    console.error('Error switching account:', error);
    Alert.alert('Error', 'Failed to switch account');
  }
};

// Handle logout from all accounts
const handleLogoutAll = async () => {
  try {
    console.log('Logging out of all accounts...');
    
    // Clear all authentication and user data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTHENTICATED_USER,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.REGISTERED_USERS,
      STORAGE_KEYS.USER_PREFERENCES,
      STORAGE_KEYS.USER_STATS,
      'autoLoginEnabled',
      'recentLogins'
    ]);
    
    // Clear Redux state
    dispatch(logout());
    
    // Close modals
    setShowLogoutAllModal(false);
    setShowSwitchAccountsModal(false);
    
    // Navigate to login
    navigation?.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
    
    setTimeout(() => {
      Alert.alert('Success', 'Logged out of all accounts successfully');
    }, 500);
    
  } catch (error) {
    console.error('Logout all error:', error);
    setShowLogoutAllModal(false);
    Alert.alert('Error', 'Failed to logout of all accounts');
  }
};

  // Update your existing handleLogout function to include debug logging:
    const handleLogout = async () => {     
      try {
        console.log('Starting logout process...');
        
        // Clear all authentication related data from AsyncStorage       
        await AsyncStorage.multiRemove([         
          STORAGE_KEYS.AUTHENTICATED_USER,         
          'autoLoginEnabled', // This is the key line that prevents auto-login
          STORAGE_KEYS.USER_DATA,         
          STORAGE_KEYS.USER_PREFERENCES,         
          STORAGE_KEYS.USER_STATS       
        ]);
        
        console.log('Cleared AsyncStorage data');
                
        // Call AuthService logout (if it exists and has cleanup logic)       
        try {         
          await AuthService.logout();       
        } catch (serviceError) {         
          console.warn('AuthService logout warning:', serviceError);         
          // Continue with logout even if service fails       
        }
        
        console.log('AuthService logout completed');
                
        // Clear Redux state       
        dispatch(logout());
        
        console.log('Redux state cleared');
                
        // Close the modal first       
        setShowLogoutModal(false);
                
        // Navigate to login screen       
        if (navigation) {         
          // Use reset to clear the navigation stack         
          navigation.reset({           
            index: 0,           
            routes: [{ name: 'Login' }],         
          });
          console.log('Navigation reset to Login screen');       
        }
                
        // Show success message after navigation       
        setTimeout(() => {         
          Alert.alert('Success', 'You have been logged out successfully');       
        }, 500);
              
      } catch (error) {       
        console.error('Logout error:', error);       
        setShowLogoutModal(false);       
        Alert.alert('Error', 'Failed to logout. Please try again.');     
      }   
    };

  const handleSyncWithServer = async () => {
    try {
      await AuthService.syncWithServer();
      Alert.alert('Success', 'Data synced successfully');
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const handleDelete = async () => {
  try {
    setIsDeleting(true);
    setDeleteStatus('Preparing account deletion...');
    
    // Get current user data
    const currentUserData = user || formData;
    const isOnline = await checkInternetConnection();
    
    if (isOnline) {
      setDeleteStatus('Deleting from server...');
      
      // Try to delete from Firebase first
      const firebaseResult = await FirebaseService.deleteUserAccount(currentUserData);
      
      if (firebaseResult.success) {
        setDeleteStatus('Server deletion completed. Cleaning local data...');
      } else {
        // If Firebase deletion fails but we're online, still proceed with local deletion
        // but queue for retry
        console.warn('Firebase deletion failed:', firebaseResult.error);
        await FirebaseService.queueAccountDeletion(currentUserData);
        setDeleteStatus('Server deletion queued. Cleaning local data...');
      }
    } else {
      // Offline: Queue for later and inform user
      setDeleteStatus('Offline detected. Queuing deletion...');
      await FirebaseService.queueAccountDeletion(currentUserData);
    }
    
    // Always clear local data regardless of online status
    setDeleteStatus('Clearing local data...');
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_DATA, 
      STORAGE_KEYS.REGISTERED_USERS, 
      'recentLogins',
      STORAGE_KEYS.AUTHENTICATED_USER,
      'autoLoginEnabled',
      STORAGE_KEYS.USER_PREFERENCES,
      STORAGE_KEYS.USER_STATS
    ]);
    
    // Clear Redux store
    dispatch(logout());
    setShowDeleteModal(false);
    
    // Show appropriate success message based on online status
    const successMessage = isOnline 
      ? 'Your account has been permanently deleted from all systems.'
      : 'Your account has been deleted locally and will be permanently removed from our servers when you reconnect to the internet.';
    
    Alert.alert(
      'Account Deleted', 
      successMessage,
      [{ 
        text: 'OK', 
        onPress: () => {
          // Navigate to login screen
          if (navigation) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      }]
    );
    
  } catch (error) {
    console.error('Account deletion error:', error);
    setIsDeleting(false);
    setDeleteStatus('');
    
    Alert.alert(
      'Deletion Error', 
      'Failed to delete account completely. Please try again or contact support.',
      [
        { text: 'Retry', onPress: () => handleDelete() },
        { text: 'Cancel', style: 'cancel', onPress: () => setShowDeleteModal(false) }
      ]
    );
  } finally {
    setIsDeleting(false);
    setDeleteStatus('');
  }
};

// Add helper function for connection check
const checkInternetConnection = async () => {
  try {
    return await FirebaseService.checkInternetConnection();
  } catch {
    return false;
  }
};

  // Handle preference changes with persistence
  const handlePreferenceChange = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const getUserTypeLabel = (userData = null) => {
    const currentUser = userData || displayUser || user;
    
    // If userType is 'OTHER', use the customRole
    if (currentUser?.userType === 'OTHER') {
      return currentUser?.customRole || 'User';
    }
    
    // Map the userType values from registration to display labels
    switch (currentUser?.userType) {
      case 'COACH':
      case 'coach':
        return 'Coach';
      case 'TRAINER':
      case 'trainer':
        return 'Personal Trainer';
      case 'PLAYER':
      case 'player':
      case 'ATHLETE':
      case 'athlete':
        return 'Player/Athlete';
      case 'PARENT':
      case 'parent':
        return 'Parent';
      default:
        // Fallback: use the userType as-is if it's not empty, otherwise 'User'
        return currentUser?.userType || 'User';
    }
  };

  const getInitials = () => {
    const first = formData.firstName?.charAt(0) || user?.firstName?.charAt(0) || '';
    const last = formData.lastName?.charAt(0) || user?.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  };

  // Get display user data (prioritize formData over user for current session)
  const displayUser = {
    ...user,
    ...formData
  };

  // Helper function to format member since date
  const formatMemberSince = (userData = null) => {
    const currentUser = userData || displayUser || user;
    
    if (!currentUser?.createdAt) {
      return 'N/A';
    }
    
    try {
      const createdDate = new Date(currentUser.createdAt);
      
      // Check if the date is valid
      if (isNaN(createdDate.getTime())) {
        return 'N/A';
      }
      
      // Format options for a more user-friendly display
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      return createdDate.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting member since date:', error);
      return 'N/A';
    }
  };

  // Helper function to get role display with proper hierarchy
  const getRoleDisplay = (userData = null) => {
    const currentUser = userData || displayUser || user;
    
    // Debug logging to understand the data structure
    console.log('getRoleDisplay - currentUser:', {
      userType: currentUser?.userType,
      customRole: currentUser?.customRole,
      firstName: currentUser?.firstName
    });
    
    // For 'OTHER' userType, always use customRole
    if (currentUser?.userType === 'OTHER') {
      return currentUser?.customRole || 'Custom Role';
    }
    
    // For predefined userTypes, use the standard labels
    return getUserTypeLabel(currentUser);
  };

const settingsOptions = [
  { title: 'Settings', icon: 'settings', action: () => navigation?.navigate('Settings') },
  { title: 'Activities', icon: 'history', action: () => navigation?.navigate('Activities') },
  { title: 'Add New Account', icon: 'person-add', action: () => handleAddNewAccount() },
  { title: 'Switch Accounts', icon: 'swap-horiz', action: () => setShowSwitchAccountsModal(true) },
  { title: 'Create account for my child', icon: 'child-care', action: () => navigation?.navigate('ChildRegister') },
  { title: 'Connect to smartwatch', icon: 'watch', action: () => console.log('Connect smartwatch') },
  { title: 'Change password', icon: 'lock', action: () => setShowChangePasswordModal(true) },
  { title: 'Log out', icon: 'logout', action: () => setShowLogoutModal(true) },
  { title: 'Log out of all accounts', icon: 'exit-to-app', action: () => setShowLogoutAllModal(true) },
  { title: 'Delete account', icon: 'delete-forever', action: () => setShowDeleteModal(true), danger: true },
];

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }





  return (
    <View style={styles.container}>
      {/* Modern Header */}
{/* Themed Header */}
<View style={styles.themedHeader}>
  <TouchableOpacity style={styles.headerLeft} onPress={() => setShowSwitchAccountsModal(true)}>
    <Text style={styles.themedHeaderUsername}>{displayUser?.firstName} {displayUser?.lastName}</Text>
    <View style={styles.headerRoleRow}>
      <Text style={styles.themedHeaderRole}>{getRoleDisplay()}</Text>
      <Icon name="keyboard-arrow-down" size={18} color="#FFFFFF" style={styles.dropdownIcon} />
    </View>
  </TouchableOpacity>
  <View style={styles.headerRight}>
    <IconButton icon="magnify" size={24} iconColor="#FFFFFF" onPress={() => console.log('Search')} />
    <IconButton icon="plus-box-outline" size={24} iconColor="#FFFFFF" onPress={() => console.log('Add')} />
    <Menu
      visible={showSettingsMenu}
      onDismiss={() => setShowSettingsMenu(false)}
      anchor={
        <IconButton 
          icon="dots-vertical" 
          size={24}
          iconColor="#FFFFFF"
          onPress={() => setShowSettingsMenu(true)}
        />
      }>
      {settingsOptions.map((option, index) => (
        <Menu.Item 
          key={index}
          leadingIcon={option.icon}
          onPress={() => {
            option.action();
            setShowSettingsMenu(false);
          }}
          title={option.title}
          titleStyle={option.danger ? { color: COLORS.error } : {}}
        />
      ))}
    </Menu>
  </View>
</View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

{/* Improved Profile Section */}
<View style={styles.improvedProfileSection}>
  <View style={styles.profileContentRow}>
    {/* Left side - Profile Image and Username */}
    <View style={styles.profileLeftColumn}>
      <TouchableOpacity 
        onPress={isEditing ? handleImageUpload : undefined} 
        style={styles.profileImageContainer}
        activeOpacity={isEditing ? 0.7 : 1}>
        {displayUser.profileImage ? (
          <Avatar.Image 
            size={80} 
            source={{ uri: displayUser.profileImage }}
            style={styles.improvedAvatar}
          />
        ) : (
          <Avatar.Text 
            size={80} 
            label={getInitials()}
            style={styles.improvedAvatar}
          />
        )}
        {isEditing && (
          <View style={styles.improvedCameraIcon}>
            <Icon name="camera-alt" size={16} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
      <Text style={styles.improvedUsername}>{displayUser?.username}</Text>
    </View>

    {/* Right side - Stats and Progress */}
    <View style={styles.profileRightColumn}>
      {/* Stats Row */}
      <View style={styles.rightStatsRow}>
        <TouchableOpacity 
          style={styles.rightStatItem}
          onPress={() => setActiveTab('sessions')}>
          <Text style={styles.improvedStatNumber}>{userStats.completedSessions}</Text>
          <Text style={styles.improvedStatLabel}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.rightStatItem}
          onPress={() => setActiveTab('sessions')}>
          <Text style={styles.improvedStatNumber}>{userStats.weeklyStreak}</Text>
          <Text style={styles.improvedStatLabel}>Week Streak</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.rightStatItem}
          onPress={() => setActiveTab('stats')}>
          <Text style={styles.improvedStatNumber}>{userStats.goalsAchieved}</Text>
          <Text style={styles.improvedStatLabel}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.rightStatItem}
          onPress={() => setActiveTab('stats')}>
          <Text style={styles.improvedStatNumber}>{userStats.totalPoints}</Text>
          <Text style={styles.improvedStatLabel}>Points</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.rightProgressSection}>
        <ProgressBar 
          progress={userStats.goalsAchieved / userStats.totalGoals} 
          color="#10B981"
          style={styles.improvedProgressBar}
        />
        <Text style={styles.improvedProgressText}>
          {Math.round((userStats.goalsAchieved / userStats.totalGoals) * 100)}% Complete
        </Text>
      </View>
    </View>
  </View>

  {/* Action Buttons Row */}
  <View style={styles.improvedActionButtons}>
    <TouchableOpacity 
      style={[styles.improvedButton, styles.improvedEditButton]}
      onPress={isEditing ? handleSave : handleEditClick}>
      <Text style={styles.improvedEditButtonText}>
        {isEditing ? 'Save Profile' : 'Edit Profile'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={[styles.improvedButton, styles.improvedShareButton]}
      onPress={() => console.log('Share profile')}>
      <Text style={styles.improvedShareButtonText}>Share Profile</Text>
    </TouchableOpacity>

    <TouchableOpacity 
      style={styles.improvedIconButton}
      onPress={() => setShowSwitchAccountsModal(true)}>
      <Icon name="person-add" size={22} color="#3B82F6" />
    </TouchableOpacity>
  </View>
</View>

{/* Horizontal Tabs */}
{/* Improved Horizontal Tabs */}
<View style={styles.improvedTabs}>
  <TouchableOpacity 
    style={[styles.improvedTabItem, activeTab === 'overview' && styles.improvedActiveTab]}
    onPress={() => setActiveTab('overview')}>
    <View style={[styles.tabIconContainer, activeTab === 'overview' && styles.activeTabIconContainer]}>
      <Icon name="person" size={22} color={activeTab === 'overview' ? '#FFFFFF' : '#64748B'} />
    </View>
    <Text style={[styles.improvedTabText, activeTab === 'overview' && styles.improvedActiveTabText]}>Overview</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.improvedTabItem, activeTab === 'stats' && styles.improvedActiveTab]}
    onPress={() => setActiveTab('stats')}>
    <View style={[styles.tabIconContainer, activeTab === 'stats' && styles.activeTabIconContainer]}>
      <Icon name="trending-up" size={22} color={activeTab === 'stats' ? '#FFFFFF' : '#64748B'} />
    </View>
    <Text style={[styles.improvedTabText, activeTab === 'stats' && styles.improvedActiveTabText]}>Stats</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.improvedTabItem, activeTab === 'sessions' && styles.improvedActiveTab]}
    onPress={() => setActiveTab('sessions')}>
    <View style={[styles.tabIconContainer, activeTab === 'sessions' && styles.activeTabIconContainer]}>
      <Icon name="fitness-center" size={22} color={activeTab === 'sessions' ? '#FFFFFF' : '#64748B'} />
    </View>
    <Text style={[styles.improvedTabText, activeTab === 'sessions' && styles.improvedActiveTabText]}>Sessions</Text>
  </TouchableOpacity>

  <TouchableOpacity 
    style={[styles.improvedTabItem, activeTab === 'followers' && styles.improvedActiveTab]}
    onPress={() => setActiveTab('followers')}>
    <View style={[styles.tabIconContainer, activeTab === 'followers' && styles.activeTabIconContainer]}>
      <Icon name="people" size={22} color={activeTab === 'followers' ? '#FFFFFF' : '#64748B'} />
    </View>
    <Text style={[styles.improvedTabText, activeTab === 'followers' && styles.improvedActiveTabText]}>Followers</Text>
  </TouchableOpacity>
</View>

{/* Tab Content */}
<View style={styles.tabContent}>
  {activeTab === 'overview' && (
  <Surface style={styles.enhancedTabContentCard}>
    <Text style={styles.enhancedTabContentTitle}>Personal Information</Text>
    
    {isEditing ? (
      <View style={styles.editForm}>
        <View style={styles.nameRow}>
          <TextInput
            label="First Name *"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
            mode="outlined"
            style={[styles.input, styles.halfInput]}
            error={!!errors.firstName}
            theme={getInputTheme('firstName')}
            right={validFields.firstName && (
              <TextInput.Icon 
                icon="check-circle" 
                iconColor="#10B981"
                size={20}
              />
            )}
          />
          <TextInput
            label="Last Name *"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
            mode="outlined"
            style={[styles.input, styles.halfInput]}
            error={!!errors.lastName}
            theme={getInputTheme('lastName')}
            right={validFields.lastName && (
              <TextInput.Icon 
                icon="check-circle" 
                iconColor="#10B981"
                size={20}
              />
            )}
          />
        </View>
        {(errors.firstName || errors.lastName) && (
          <View style={styles.errorRow}>
            {errors.firstName && <Text style={[styles.errorText, styles.halfError]}>{errors.firstName}</Text>}
            {errors.lastName && <Text style={[styles.errorText, styles.halfError]}>{errors.lastName}</Text>}
          </View>
        )}

        <TextInput
          label="Username *"
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
          mode="outlined"
          autoCapitalize="none"
          style={styles.input}
          right={validFields.username && (
            <TextInput.Icon 
              icon="check-circle" 
              iconColor="#10B981"
              size={20}
            />
          )}
          error={!!errors.username}
          theme={getInputTheme('username')}
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
        
        <TextInput
          label="Email Address *"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
          right={validFields.email && (
            <TextInput.Icon 
              icon="check-circle" 
              iconColor="#10B981"
              size={20}
            />
          )}
          error={!!errors.email}
          theme={getInputTheme('email')}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TextInput
          label="Phone Number"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
          placeholder="0123456789 or +254712345678"
          right={validFields.phone && (
            <TextInput.Icon 
              icon="check-circle" 
              iconColor="#10B981"
              size={20}
            />
          )}
          error={!!errors.phone}
          theme={getInputTheme('phone')}
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

        <TextInput
          label="Sport/Activity"
          value={formData.sport}
          onChangeText={(value) => handleInputChange('sport', value)}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Football, Basketball, Running"
          theme={getInputTheme('sport')}
        />

      </View>
    ) : (
      <View style={styles.infoDisplay}>
        <View style={styles.infoRow}>
          <Icon name="person" size={20} color="#64748B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{displayUser?.firstName} {displayUser?.lastName}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="alternate-email" size={20} color="#64748B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{displayUser?.username}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="email" size={20} color="#64748B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{displayUser?.email}</Text>
          </View>
        </View>

        {displayUser?.phone && (
          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{displayUser.phone}</Text>
            </View>
          </View>
        )}

        {displayUser?.sport && (
          <View style={styles.infoRow}>
            <Icon name="sports" size={20} color="#64748B" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Sport/Activity</Text>
              <Text style={styles.infoValue}>{displayUser.sport}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoRow}>
          <Icon name="category" size={20} color="#64748B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <Text style={styles.infoValue}>{getRoleDisplay()}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Icon name="schedule" size={20} color="#64748B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{formatMemberSince()}</Text>
          </View>
        </View>
      </View>
    )}
  </Surface>
)}

  {activeTab === 'stats' && (
    <Surface style={styles.enhancedTabContentCard}>
      <Text style={styles.enhancedTabContentTitle}>Fitness Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Icon name="favorite" size={24} color="#EF4444" />
          <Text style={styles.statCardTitle}>Heart Rate</Text>
          <Text style={styles.statCardValue}>72 bpm</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="show-chart" size={24} color="#10B981" />
          <Text style={styles.statCardTitle}>Fitness Level</Text>
          <Text style={styles.statCardValue}>Advanced</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="opacity" size={24} color="#3B82F6" />
          <Text style={styles.statCardTitle}>Hydration</Text>
          <Text style={styles.statCardValue}>85%</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="restaurant" size={24} color="#F59E0B" />
          <Text style={styles.statCardTitle}>Nutrition</Text>
          <Text style={styles.statCardValue}>Good</Text>
        </View>
      </View>
    </Surface>
  )}

  {activeTab === 'sessions' && (
    <Surface style={styles.enhancedTabContentCard}>
      <Text style={styles.enhancedTabContentTitle}>My Sessions</Text>
      
      {/* Session Sub-tabs */}
      <View style={styles.subTabs}>
        <TouchableOpacity style={styles.subTab}>
          <Text style={styles.subTabText}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTab}>
          <Text style={styles.subTabText}>Weekly</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTab}>
          <Text style={styles.subTabText}>Term</Text>
        </TouchableOpacity>
      </View>
      
      {/* Session List */}
      <View style={styles.sessionList}>
        <View style={styles.sessionItem}>
          <Icon name="check-circle" size={20} color="#10B981" />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>Morning Cardio</Text>
            <Text style={styles.sessionTime}>Today 8:00 AM - Completed</Text>
          </View>
        </View>
        
        <View style={styles.sessionItem}>
          <Icon name="play-circle-outline" size={20} color="#F59E0B" />
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle}>Strength Training</Text>
            <Text style={styles.sessionTime}>Today 6:00 PM - Scheduled</Text>
          </View>
          <TouchableOpacity style={styles.startButton}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  )}

  {activeTab === 'followers' && (
    <Surface style={styles.enhancedTabContentCard}>
      <Text style={styles.enhancedTabContentTitle}>Connections</Text>
      
      {/* Followers Sub-tabs */}
      <View style={styles.subTabs}>
        <TouchableOpacity style={styles.subTab}>
          <Text style={styles.subTabText}>Connected</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.subTab}>
          <Text style={styles.subTabText}>Connect</Text>
        </TouchableOpacity>
      </View>
      
      {/* Followers List */}
      <View style={styles.followersList}>
        <View style={styles.followerItem}>
          <Avatar.Text size={40} label="JD" />
          <View style={styles.followerInfo}>
            <Text style={styles.followerName}>John Doe</Text>
            <Text style={styles.followerRole}>Personal Trainer</Text>
          </View>
          <TouchableOpacity style={styles.connectedButton}>
            <Text style={styles.connectedButtonText}>Connected</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.followerItem}>
          <Avatar.Text size={40} label="SM" />
          <View style={styles.followerInfo}>
            <Text style={styles.followerName}>Sarah Miller</Text>
            <Text style={styles.followerRole}>Fitness Coach</Text>
          </View>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  )}
</View>


{/* Show children section only for parents */}
        {user?.userType === 'PARENT' && <ChildrenSection />}
        
        {/* Enhanced Notification Preferences */}
        <NotificationPreferences />
        
        {/* Enhanced Menu Section */}
        <MenuSection />

        {/* Account Section */}
        <Surface style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account</Text>
          
          <TouchableOpacity style={styles.accountItem} onPress={handleSyncWithServer}>
            <View style={styles.accountIcon}>
              <Icon name={displayUser?.syncedToServer ? "cloud-done" : "cloud-off"} size={20} color="#3B82F6" />
            </View>
            <View style={styles.accountContent}>
              <Text style={styles.accountTitle}>Sync Status</Text>
              <Text style={styles.accountDescription}>
                {displayUser?.syncedToServer ? "Synced with server" : "Local data only"}
              </Text>
            </View>
            <Icon name="refresh" size={20} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.accountItem, styles.dangerItem]} 
            onPress={() => setShowLogoutModal(true)}>
            <View style={styles.accountIcon}>
              <Icon name="logout" size={20} color="#EF4444" />
            </View>
            <View style={styles.accountContent}>
              <Text style={[styles.accountTitle, styles.dangerText]}>Logout</Text>
              <Text style={styles.accountDescription}>Sign out of your account</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#EF4444" />
          </TouchableOpacity>
        </Surface>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Image Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageModal}
        onRequestClose={() => setShowImageModal(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageModal(false)}>
          
          <View style={styles.grassBackground} />
          
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}>
            
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Update Profile Image</Text>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={Platform.OS === 'web'}
              nestedScrollEnabled={true}>
              
              <View style={styles.modalOptionsContainer}>
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={selectImageFromCamera}
                  activeOpacity={0.7}>
                  <View style={styles.modalOptionIconContainer}>
                    <Icon name="camera-alt" size={28} color={COLORS.primary} />
                  </View>
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>Take Photo</Text>
                    <Text style={styles.modalOptionDescription}>Use your camera to take a new photo</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={selectImageFromGallery}
                  activeOpacity={0.7}>
                  <View style={styles.modalOptionIconContainer}>
                    <Icon name="photo-library" size={28} color={COLORS.primary} />
                  </View>
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>Choose from Gallery</Text>
                    <Text style={styles.modalOptionDescription}>Select an existing photo from your gallery</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, profileImage: null }));
                    setShowImageModal(false);
                  }}
                  activeOpacity={0.7}>
                  <View style={styles.modalOptionIconContainer}>
                    <Icon name="person" size={28} color={COLORS.primary} />
                  </View>
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>Use Avatar</Text>
                    <Text style={styles.modalOptionDescription}>Create a custom avatar with your initials</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={styles.modalCancel}
                onPress={() => setShowImageModal(false)}
                activeOpacity={0.7}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <View style={styles.modalBottomSpace} />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      

      {/* Password Reset Modal */}
<Modal
  animationType="slide"
  transparent={true}
  visible={showPasswordResetModal}
  onRequestClose={() => setShowPasswordResetModal(false)}>
  <TouchableOpacity 
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() => setShowPasswordResetModal(false)}>
    
    <TouchableOpacity 
      style={[styles.modalContainer, { maxHeight: screenHeight * 0.9 }]}
      activeOpacity={1}
      onPress={(e) => e.stopPropagation()}>
      
      <View style={styles.modalHeader}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>
          {resetStep === 1 ? 'Security Question' : resetStep === 2 ? 'Verify Identity' : 'Reset Password'}
        </Text>
      </View>
      
      <ScrollView 
        style={styles.modalScrollView}
        contentContainerStyle={styles.modalScrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}>
        
        <View style={styles.changePasswordContainer}>
          {/* Step 1: Security Question */}
          {resetStep === 1 && (
            <>
              <View style={styles.securityQuestionContainer}>
                <Text style={styles.securityQuestionLabel}>Security Question:</Text>
                <Text style={styles.securityQuestionText}>{user?.securityQuestion}</Text>
              </View>

              <TextInput
                label="Your Answer *"
                value={resetSecurityAnswer}
                onChangeText={(value) => {
                  setResetSecurityAnswer(value);
                  checkResetSecurityAnswer(value);
                }}
                mode="outlined"
                autoCapitalize="words"
                style={styles.input}
                error={resetSecurityAnswerCorrect === false}
                theme={getInputTheme('resetSecurityAnswer')}
                left={<TextInput.Icon icon="help-circle" />}
                right={resetSecurityAnswer.length > 0 ? (
                  <TextInput.Icon 
                    icon={resetSecurityAnswerCorrect === true ? "check-circle" : resetSecurityAnswerCorrect === false ? "close-circle" : "help"} 
                    iconColor={resetSecurityAnswerCorrect === true ? '#10B981' : resetSecurityAnswerCorrect === false ? '#EF4444' : '#64748B'}
                  />
                ) : null}
              />

              {resetSecurityAnswerCorrect === false && (
                <Text style={styles.errorText}>Incorrect answer. Please try again.</Text>
              )}

              <TouchableOpacity 
                style={[styles.changePasswordSaveButton, !resetSecurityAnswerCorrect && styles.disabledButton]}
                onPress={handleResetSecurityQuestion}
                disabled={!resetSecurityAnswerCorrect}>
                <Text style={styles.changePasswordSaveButtonText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Step 2: Device Authentication */}
          {resetStep === 2 && (
            <>
              <View style={styles.biometricContainer}>
                <Icon name="security" size={64} color="#3B82F6" />
                <Text style={styles.biometricTitle}>Verify Your Identity</Text>
                <Text style={styles.biometricSubtitle}>
                  Use your device {biometricType} to continue with password reset
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.changePasswordSaveButton}
                onPress={handleResetDeviceAuthentication}>
                <Text style={styles.changePasswordSaveButtonText}>Use {biometricType}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.changePasswordCancelButton}
                onPress={() => setResetStep(3)}>
                <Text style={styles.changePasswordCancelButtonText}>Skip Device Authentication</Text>
              </TouchableOpacity>
            </>
          )}

{/* Step 3: New Password - Updated with validation */}
{resetStep === 3 && (
  <>
    <TextInput
      label="New Password *"
      value={resetNewPassword}
      onChangeText={setResetNewPassword}
      mode="outlined"
      secureTextEntry={!showResetNewPassword}
      style={styles.input}
      error={!resetPasswordValid}
      theme={getInputTheme('resetNewPassword')}
      left={<TextInput.Icon icon="lock" />}
      right={
        <TextInput.Icon 
          icon={showResetNewPassword ? "eye-off" : "eye"} 
          onPress={() => setShowResetNewPassword(!showResetNewPassword)}
          iconColor={COLORS.primary}
        />
      }
    />
    
    {/* NEW: Password validation error */}
    {resetPasswordError && (
      <Text style={styles.errorText}>{resetPasswordError}</Text>
    )}

    <TextInput
      label="Confirm New Password *"
      value={resetConfirmPassword}
      onChangeText={setResetConfirmPassword}
      mode="outlined"
      secureTextEntry={!showResetConfirmPassword}
      style={styles.input}
      error={resetConfirmPassword.length > 0 && resetNewPassword !== resetConfirmPassword}
      theme={getInputTheme('resetConfirmPassword')}
      left={<TextInput.Icon icon="lock-check" />}
      right={
        <TextInput.Icon 
          icon={showResetConfirmPassword ? "eye-off" : resetConfirmPassword.length > 0 && resetNewPassword === resetConfirmPassword ? "check-circle" : "eye"} 
          iconColor={resetConfirmPassword.length > 0 && resetNewPassword === resetConfirmPassword ? '#10B981' : '#64748B'}
          onPress={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
        />
      }
    />

    {resetConfirmPassword.length > 0 && resetNewPassword !== resetConfirmPassword && (
      <Text style={styles.errorText}>Passwords do not match</Text>
    )}

    {/* NEW: Password Requirements Display */}
    <View style={styles.passwordRequirements}>
      <Text style={styles.requirementsTitle}>Password Requirements:</Text>
      <View style={styles.requirement}>
        <Icon 
          name={resetNewPassword.length >= 6 ? "check-circle" : "radio-button-unchecked"} 
          size={16} 
          color={resetNewPassword.length >= 6 ? '#10B981' : '#64748B'} 
        />
        <Text style={styles.requirementText}>At least 6 characters</Text>
      </View>
      <View style={styles.requirement}>
        <Icon 
          name={resetPasswordValid && resetNewPassword ? "check-circle" : "radio-button-unchecked"} 
          size={16} 
          color={resetPasswordValid && resetNewPassword ? '#10B981' : '#64748B'} 
        />
        <Text style={styles.requirementText}>Different from current and previous passwords</Text>
      </View>
      <View style={styles.requirement}>
        <Icon 
          name={resetNewPassword === resetConfirmPassword && resetNewPassword ? "check-circle" : "radio-button-unchecked"} 
          size={16} 
          color={resetNewPassword === resetConfirmPassword && resetNewPassword ? '#10B981' : '#64748B'} 
        />
        <Text style={styles.requirementText}>Passwords match</Text>
      </View>
    </View>

    <TouchableOpacity 
      style={[
        styles.changePasswordSaveButton, 
        (resetLoading || resetNewPassword.length < 6 || resetNewPassword !== resetConfirmPassword || !resetPasswordValid) && styles.disabledButton
      ]}
      onPress={handlePasswordResetComplete}
      disabled={resetLoading || resetNewPassword.length < 6 || resetNewPassword !== resetConfirmPassword || !resetPasswordValid}>
      <Text style={styles.changePasswordSaveButtonText}>
        {resetLoading ? 'Resetting Password...' : 'Reset Password'}
      </Text>
    </TouchableOpacity>
  </>
)}

          {/* Navigation buttons */}
          <View style={styles.changePasswordActions}>
            {resetStep > 1 && (
              <TouchableOpacity 
                style={styles.forgotPasswordButton}
                onPress={() => setResetStep(resetStep - 1)}>
                <Text style={styles.forgotPasswordButtonText}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.changePasswordCancelButton}
              onPress={() => setShowPasswordResetModal(false)}>
              <Text style={styles.changePasswordCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableOpacity>
  </TouchableOpacity>
</Modal>

      {/* Switch Accounts Modal */}
<Modal
  animationType="slide"
  transparent={true}
  visible={showSwitchAccountsModal}
  onRequestClose={() => setShowSwitchAccountsModal(false)}>
  <TouchableOpacity 
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() => setShowSwitchAccountsModal(false)}>
    
    <TouchableOpacity 
      style={[styles.modalContainer, { maxHeight: screenHeight * 0.8 }]}
      activeOpacity={1}
      onPress={(e) => e.stopPropagation()}>
      
      <View style={styles.modalHeader}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Switch Accounts</Text>
      </View>
      
      <ScrollView 
        style={styles.modalScrollView}
        contentContainerStyle={styles.modalScrollContent}
        showsVerticalScrollIndicator={false}>
        
        <View style={styles.accountsList}>
          {savedAccounts.map((account, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.accountItem,
                account.email === user?.email && styles.currentAccountItem
              ]}
              onPress={() => handleSwitchAccount(account)}>
              
              <View style={styles.accountAvatar}>
                {account.profileImage ? (
                  <Avatar.Image size={40} source={{ uri: account.profileImage }} />
                ) : (
                  <Avatar.Text 
                    size={40} 
                    label={`${account.firstName?.[0] || ''}${account.lastName?.[0] || ''}`} 
                  />
                )}
              </View>
              
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {account.firstName} {account.lastName}
                </Text>
                <Text style={styles.accountEmail}>{account.email}</Text>
                {account.email === user?.email && (
                  <Text style={styles.currentAccountLabel}>Current Account</Text>
                )}
              </View>
              
              {account.email === user?.email && (
                <Icon name="check-circle" size={20} color="#10B981" />
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={styles.addAccountButton}
            onPress={handleAddNewAccount}>
            <Icon name="add-circle" size={24} color={COLORS.primary} />
            <Text style={styles.addAccountText}>Add New Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.modalCancel}
            onPress={() => setShowSwitchAccountsModal(false)}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableOpacity>
  </TouchableOpacity>
</Modal>

{/* Logout All Confirmation Dialog */}
<ConfirmDialog
  visible={showLogoutAllModal}
  title="Logout All Accounts"
  message="Are you sure you want to logout of all accounts? You will need to sign in again to access any account."
  onCancel={() => setShowLogoutAllModal(false)}
  onConfirm={handleLogoutAll}
  confirmLabel="Logout All"
  cancelLabel="Cancel"
  confirmColor={COLORS.error}
  icon={<Icon name="exit-to-app" size={48} color={COLORS.error} />}
/>

{/* Add Account Confirmation Dialog */}
<ConfirmDialog
  visible={showAddAccountModal}
  title="Add New Account"
  message="To add a new account, you need to logout first. You will be redirected to the login screen where you can create or sign into a different account."
  onCancel={() => setShowAddAccountModal(false)}
  onConfirm={() => {
    setShowAddAccountModal(false);
    handleLogout();
  }}
  confirmLabel="Logout & Add Account"
  cancelLabel="Cancel"
  confirmColor={COLORS.primary} // Use primary color instead of error
  icon={<Icon name="person-add" size={48} color={COLORS.primary} />}
/>

      {/* Change Password Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showChangePasswordModal}
        onRequestClose={() => setShowChangePasswordModal(false)}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowChangePasswordModal(false)}>
          
          <TouchableOpacity 
            style={[styles.modalContainer, { maxHeight: screenHeight * 0.9 }]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}>
            
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Change Password</Text>
            </View>
            
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}>
              
              <View style={styles.changePasswordContainer}>
                {/* Current Password */}
                <TextInput
                  label="Current Password *"
                  value={changePasswordData.currentPassword}
                  onChangeText={(value) => handleChangePasswordInputChange('currentPassword', value)}
                  mode="outlined"
                  secureTextEntry={!showCurrentPassword}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showCurrentPassword ? "eye-off" : "eye"}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      iconColor={COLORS.primary}
                    />
                  }
                  error={!!changePasswordErrors.currentPassword}
                  theme={getInputTheme('currentPassword')}
                />
                {changePasswordErrors.currentPassword && 
                  <Text style={styles.errorText}>{changePasswordErrors.currentPassword}</Text>
                }

                {/* New Password */}
                <TextInput
                  label="New Password *"
                  value={changePasswordData.newPassword}
                  onChangeText={(value) => handleChangePasswordInputChange('newPassword', value)}
                  mode="outlined"
                  secureTextEntry={!showNewPassword}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showNewPassword ? "eye-off" : "eye"}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      iconColor={COLORS.primary}
                    />
                  }
                  error={!!changePasswordErrors.newPassword}
                  theme={getInputTheme('newPassword')}
                />
                {changePasswordErrors.newPassword && 
                  <Text style={styles.errorText}>{changePasswordErrors.newPassword}</Text>
                }

                {/* Confirm New Password */}
                <TextInput
                  label="Confirm New Password *"
                  value={changePasswordData.confirmNewPassword}
                  onChangeText={(value) => handleChangePasswordInputChange('confirmNewPassword', value)}
                  mode="outlined"
                  secureTextEntry={!showConfirmNewPassword}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showConfirmNewPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      iconColor={COLORS.primary}
                    />
                  }
                  error={!!changePasswordErrors.confirmNewPassword}
                  theme={getInputTheme('confirmNewPassword')}
                />
                {changePasswordErrors.confirmNewPassword && 
                  <Text style={styles.errorText}>{changePasswordErrors.confirmNewPassword}</Text>
                }

                {/* Password Requirements */}
                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <View style={styles.requirement}>
                    <Icon 
                      name={changePasswordData.newPassword.length >= 6 ? "check-circle" : "radio-button-unchecked"} 
                      size={16} 
                      color={changePasswordData.newPassword.length >= 6 ? '#10B981' : '#64748B'} 
                    />
                    <Text style={styles.requirementText}>At least 6 characters</Text>
                  </View>
                  <View style={styles.requirement}>
                    <Icon 
                      name={changePasswordData.newPassword !== changePasswordData.currentPassword && changePasswordData.newPassword ? "check-circle" : "radio-button-unchecked"} 
                      size={16} 
                      color={changePasswordData.newPassword !== changePasswordData.currentPassword && changePasswordData.newPassword ? '#10B981' : '#64748B'} 
                    />
                    <Text style={styles.requirementText}>Different from current password</Text>
                  </View>
                  <View style={styles.requirement}>
                    <Icon 
                      name={changePasswordData.newPassword === changePasswordData.confirmNewPassword && changePasswordData.newPassword ? "check-circle" : "radio-button-unchecked"} 
                      size={16} 
                      color={changePasswordData.newPassword === changePasswordData.confirmNewPassword && changePasswordData.newPassword ? '#10B981' : '#64748B'} 
                    />
                    <Text style={styles.requirementText}>Passwords match</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.changePasswordActions}>
                  <TouchableOpacity 
                    style={styles.changePasswordSaveButton}
                    onPress={handleChangePassword}>
                    <Text style={styles.changePasswordSaveButtonText}>Change Password</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.forgotPasswordButton}
                    onPress={handleForgotPassword}>
                    <Text style={styles.forgotPasswordButtonText}>Forgot current password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.changePasswordCancelButton}
                    onPress={() => setShowChangePasswordModal(false)}>
                    <Text style={styles.changePasswordCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        confirmLabel="Logout"
        cancelLabel="Cancel"
        confirmColor={COLORS.error}
        icon={<Icon name="logout" size={48} color={COLORS.error} />}
      />

      {/* Enhanced Delete Account Confirmation Dialog */}
        <ConfirmDialog 
          visible={showDeleteModal}
          title="Delete Account"
          message={
            isDeleting 
              ? `${deleteStatus}\n\nPlease wait while we process your request...`
              : "⚠️ This action cannot be undone. All your data, progress, and account information will be permanently deleted. Are you absolutely sure?"
          }
          onCancel={isDeleting ? undefined : () => setShowDeleteModal(false)}
          onConfirm={isDeleting ? undefined : handleDelete}
          confirmLabel={isDeleting ? "Deleting..." : "Delete Forever"}
          cancelLabel="Keep Account"
          confirmColor={COLORS.error}
          confirmDisabled={isDeleting}
          icon={
            isDeleting ? (
              <ActivityIndicator size="large" color={COLORS.error} />
            ) : (
              <Icon name="delete-forever" size={48} color={COLORS.error} />
            )
          }
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Loading state styles
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Modern Header Styles
  modernHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingTop: Platform.OS === 'ios' ? 50 : SPACING.sm,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    width: 40,
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    color: '#1E293B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },

  instagramHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.sm,
  paddingTop: Platform.OS === 'ios' ? 50 : SPACING.sm,
  backgroundColor: '#FFFFFF',
  elevation: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  borderBottomWidth: 0.5,
  borderBottomColor: '#E2E8F0',
},
headerLeft: {
  flex: 1,
},
headerUsername: {
  fontSize: 22,
  fontWeight: '600',
  color: '#1E293B',
},
headerRole: {
  fontSize: 14,
  color: '#64748B',
  marginTop: 2,
},
headerRight: {
  flexDirection: 'row',
  alignItems: 'center',
},

// Instagram-style Profile Section
instagramProfileSection: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.lg,
},
profileTopRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SPACING.md,
},
// Updated Header Styles
headerRoleRow: {
  flexDirection: 'row',
  alignItems: 'center',
},
dropdownIcon: {
  marginLeft: 4,
},

// Updated Profile Section
statsColumn: {
  flex: 1,
  marginLeft: SPACING.xl,
},
instagramUsername: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1E293B',
  marginBottom: SPACING.sm,
},

// Horizontal Tabs
horizontalTabs: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.sm,
  borderBottomWidth: 1,
  borderBottomColor: '#E2E8F0',
},
tabItem: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: SPACING.sm,
  borderBottomWidth: 2,
  borderBottomColor: 'transparent',
},
activeTab: {
  borderBottomColor: '#3B82F6',
},
tabText: {
  fontSize: 12,
  fontWeight: '500',
  color: '#64748B',
  marginTop: SPACING.xs,
},
activeTabText: {
  color: '#3B82F6',
  fontWeight: '600',
},

// Tab Content
tabContent: {
  flex: 1,
},
tabContentCard: {
  margin: SPACING.lg,
  padding: SPACING.xl,
  borderRadius: 16,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  backgroundColor: '#FFFFFF',
},
tabContentTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1E293B',
  marginBottom: SPACING.lg,
},

// Stats Grid
statsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: SPACING.md,
},
statCard: {
  width: '48%',
  backgroundColor: '#F8FAFC',
  padding: SPACING.md,
  borderRadius: 12,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E2E8F0',
},
profileContentRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: SPACING.xl,
  paddingHorizontal: SPACING.sm,
},
profileLeftColumn: {
  alignItems: 'center',
  marginRight: SPACING.lg,
  minWidth: 100,
  flex: 0,
},
profileRightColumn: {
  flex: 1,
  justifyContent: 'flex-start',
  paddingTop: SPACING.xs,
},
rightStatsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: SPACING.md,
  paddingHorizontal: 0,
},
rightStatItem: {
  alignItems: 'center',
  flex: 1,
  paddingVertical: 4,
  paddingHorizontal: 2,
},
rightProgressSection: {
  paddingHorizontal: 4,
  marginTop: 4,
},
statCardTitle: {
  fontSize: 12,
  fontWeight: '500',
  color: '#64748B',
  marginTop: SPACING.xs,
},
statCardValue: {
  fontSize: 16,
  fontWeight: '700',
  color: '#1E293B',
  marginTop: SPACING.xs,
},

// Sub Tabs
subTabs: {
  flexDirection: 'row',
  marginBottom: SPACING.lg,
  backgroundColor: '#F1F5F9',
  borderRadius: 8,
  padding: 4,
},
subTab: {
  flex: 1,
  paddingVertical: SPACING.sm,
  alignItems: 'center',
  borderRadius: 6,
  backgroundColor: '#FFFFFF',
  marginHorizontal: 2,
},
subTabText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#64748B',
},

// Session List
sessionList: {
  gap: SPACING.md,
},
sessionItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: SPACING.md,
  borderBottomWidth: 1,
  borderBottomColor: '#F1F5F9',
},
sessionInfo: {
  flex: 1,
  marginLeft: SPACING.md,
},
sessionTitle: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1E293B',
},
securityQuestionContainer: {
  backgroundColor: '#F1F5F9',
  padding: SPACING.md,
  borderRadius: 8,
  marginBottom: SPACING.lg,
},
securityQuestionLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#64748B',
  marginBottom: SPACING.xs,
},
securityQuestionText: {
  fontSize: 16,
  color: '#1E293B',
  fontWeight: '500',
},
biometricContainer: {
  alignItems: 'center',
  marginBottom: SPACING.xl,
},
biometricTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: '#1E293B',
  marginTop: SPACING.md,
  marginBottom: SPACING.sm,
  textAlign: 'center',
},
biometricSubtitle: {
  fontSize: 14,
  color: '#64748B',
  textAlign: 'center',
  lineHeight: 20,
  paddingHorizontal: SPACING.md,
},
disabledButton: {
  backgroundColor: '#94A3B8',
  opacity: 0.6,
},
sessionTime: {
  fontSize: 14,
  color: '#64748B',
  marginTop: 2,
},
startButton: {
  backgroundColor: '#3B82F6',
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  borderRadius: 8,
},
startButtonText: {
  color: '#FFFFFF',
  fontWeight: '600',
  fontSize: 14,
},

// Followers List
followersList: {
  gap: SPACING.md,
},
followerItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: SPACING.md,
  borderBottomWidth: 1,
  borderBottomColor: '#F1F5F9',
},
followerInfo: {
  flex: 1,
  marginLeft: SPACING.md,
},
followerName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1E293B',
},
followerRole: {
  fontSize: 14,
  color: '#64748B',
  marginTop: 2,
},
connectedButton: {
  backgroundColor: '#10B981',
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  borderRadius: 8,
},
connectedButtonText: {
  color: '#FFFFFF',
  fontWeight: '600',
  fontSize: 14,
},
connectButton: {
  backgroundColor: '#3B82F6',
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  borderRadius: 8,
},
connectButtonText: {
  color: '#FFFFFF',
  fontWeight: '600',
  fontSize: 14,
},
editButtonText: {
  color: '#FFFFFF',
},
// Themed Header
themedHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.md,
  paddingTop: Platform.OS === 'ios' ? 50 : SPACING.md,
  backgroundColor: COLORS.primary,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
},
themedHeaderUsername: {
  fontSize: 22,
  fontWeight: '700',
  color: '#FFFFFF',
  letterSpacing: 0.5,
},
themedHeaderRole: {
  fontSize: 14,
  color: 'rgba(255, 255, 255, 0.9)',
  marginTop: 2,
  fontWeight: '500',
},

// Improved Profile Section
improvedProfileSection: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.xl,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
},
improvedAvatar: {
  backgroundColor: COLORS.primary,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
},
improvedCameraIcon: {
  position: 'absolute',
  bottom: 0,
  right: 0,
  backgroundColor: COLORS.primary,
  borderRadius: 14,
  padding: 6,
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  borderWidth: 2,
  borderColor: '#FFFFFF',
},
improvedUsername: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1E293B',
  textAlign: 'center',
  maxWidth: 90,
},
improvedStatItem: {
  alignItems: 'center',
  paddingVertical: SPACING.sm,
},
improvedStatNumber: {
  fontSize: 18,
  fontWeight: '650',
  color: '#1E293B',
  marginBottom: 4,
},
improvedStatLabel: {
  fontSize: 12.5,
  color: '#0a0a0aff',
  fontWeight: '500',
  textAlign: 'center',
  letterSpacing: 0.2,
  lineHeight: 12,
},
improvedProgressBar: {
  height: 4,
  borderRadius: 2,
  backgroundColor: '#E5E7EB',
  elevation: 1,
},
improvedProgressText: {
  fontSize: 11,
  color: '#10B981',
  fontWeight: '500',
  textAlign: 'center',
  marginTop: 6,
  letterSpacing: 0.1,
},

// Improved Action Buttons
improvedActionButtons: {
  flexDirection: 'row',
  gap: SPACING.sm,
  alignItems: 'center',
  paddingHorizontal: SPACING.sm,
  marginTop: SPACING.md,
},

improvedButton: {
  flex: 1,
  paddingVertical: SPACING.md,
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},

improvedEditButton: {
  backgroundColor: COLORS.primary,
},

improvedShareButton: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1.5,
  borderColor: '#E2E8F0',
},

improvedEditButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
  letterSpacing: 0.2,
},

improvedShareButtonText: {
  color: '#64748B',
  fontSize: 14,
  fontWeight: '600',
  letterSpacing: 0.2,
},

improvedIconButton: {
  width: 42,
  height: 42,
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: '#E2E8F0',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFFFFF',
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},

// Improved Tabs
improvedTabs: {
  flexDirection: 'row',
  backgroundColor: '#FFFFFF',
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.md,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
},
improvedTabItem: {
  flex: 1,
  alignItems: 'center',
  paddingVertical: SPACING.sm,
  borderRadius: 12,
  marginHorizontal: SPACING.xs,
},
improvedActiveTab: {
  backgroundColor: COLORS.primary,
  elevation: 4,
  shadowColor: COLORS.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
},
tabIconContainer: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#F1F5F9',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: SPACING.xs,
},
activeTabIconContainer: {
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
},
improvedTabText: {
  fontSize: 12,
  fontWeight: '600',
  color: '#64748B',
  textAlign: 'center',
  letterSpacing: 0.3,
},
improvedActiveTabText: {
  color: '#FFFFFF',
  fontWeight: '700',
},

// Enhanced Tab Content
enhancedTabContentCard: {
  margin: SPACING.lg,
  padding: SPACING.xl,
  borderRadius: 20,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.1,
  shadowRadius: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#F1F5F9',
},
enhancedTabContentTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#1E293B',
  marginBottom: SPACING.xl,
  letterSpacing: 0.3,
},
instagramProfileImageContainer: {
  position: 'relative',
  marginRight: SPACING.xl,
},
instagramAvatar: {
  backgroundColor: COLORS.primary,
},
instagramStatsRow: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-around',
},
instagramStatItem: {
  alignItems: 'center',
},
instagramStatNumber: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1E293B',
},
instagramStatLabel: {
  fontSize: 12,
  color: '#64748B',
  fontWeight: '500',
  marginTop: 2,
},

// Username and Progress
usernameSection: {
  marginBottom: SPACING.lg,
},
instagramUsername: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1E293B',
  marginBottom: SPACING.sm,
},
instagramProgressSection: {
  marginTop: SPACING.sm,
},
instagramProgressBar: {
  height: 4,
  borderRadius: 2,
  backgroundColor: '#E5E7EB',
},
instagramProgressText: {
  fontSize: 12,
  color: '#10B981',
  fontWeight: '600',
  marginTop: SPACING.xs,
},

// Action Buttons
instagramActionButtons: {
  flexDirection: 'row',
  gap: SPACING.sm,
  alignItems: 'center',
},
instagramButton: {
  flex: 1,
  paddingVertical: SPACING.sm,
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#E2E8F0',
},
instagramButtonText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#1E293B',
},
editButtonText: {
  color: '#098d09ff',
},
shareButton: {
  backgroundColor: '#FFFFFF',
},
instagramButtonText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#1E293B',
},
instagramIconButton: {
  width: 32,
  height: 32,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#E2E8F0',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFFFFF',
},

// Quick Access Tiles
quickAccessSection: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  paddingHorizontal: SPACING.lg,
  paddingVertical: SPACING.md,
  gap: SPACING.sm,
  backgroundColor: '#FFFFFF',
  marginBottom: SPACING.sm,
},
quickAccessTile: {
  width: '48%',
  backgroundColor: '#F8FAFC',
  borderRadius: 12,
  padding: SPACING.md,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#E2E8F0',
},
tileIconContainer: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: SPACING.sm,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
},
tileTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#1E293B',
  marginBottom: SPACING.xs,
  textAlign: 'center',
},
tileSubtitle: {
  fontSize: 12,
  color: '#64748B',
  textAlign: 'center',
  lineHeight: 16,
},

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Profile Hero Card
  profileHeroCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.xl,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  profileHeroContent: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  profileImageContainer: {
  position: 'relative',
  marginBottom: SPACING.md,
  alignItems: 'center',
},
  profileAvatar: {
    backgroundColor: COLORS.primary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  profileCameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.sm,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profileHeroInfo: {
    alignItems: 'center',
  },
  changePasswordContainer: {
  paddingVertical: SPACING.lg,
},
passwordRequirements: {
  marginTop: SPACING.md,
  padding: SPACING.md,
  backgroundColor: '#F8FAFC',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#E2E8F0',
},
requirementsTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#1E293B',
  marginBottom: SPACING.sm,
},
requirement: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: SPACING.xs,
},
requirementText: {
  fontSize: 14,
  color: '#64748B',
  marginLeft: SPACING.sm,
},
changePasswordActions: {
  marginTop: SPACING.xl,
  gap: SPACING.md,
},
changePasswordSaveButton: {
  backgroundColor: COLORS.primary,
  paddingVertical: SPACING.md,
  borderRadius: 16,
  alignItems: 'center',
},
changePasswordSaveButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '700',
},
forgotPasswordButton: {
  alignItems: 'center',
  paddingVertical: SPACING.sm,
},
forgotPasswordButtonText: {
  color: COLORS.primary,
  fontSize: 14,
  fontWeight: '600',
  textDecorationLine: 'underline',
},
changePasswordCancelButton: {
  alignItems: 'center',
  paddingVertical: SPACING.md,
  borderRadius: 16,
  backgroundColor: '#F1F5F9',
},
changePasswordCancelButtonText: {
  color: '#64748B',
  fontSize: 16,
  fontWeight: '600',
},
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  profileRoleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginBottom: SPACING.xs,
  },
  profileRoleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  profileSportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  profileSportText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: SPACING.xs,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },

  // Progress Section
  progressSection: {
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  progressText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: SPACING.sm,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveActionButton: {
    backgroundColor: '#10B981',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: SPACING.xs,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryActionButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },

  // Info Card
  infoCard: {
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.xl,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: SPACING.lg,
  },
accountsList: {
  paddingVertical: SPACING.md,
},
accountAvatar: {
  marginRight: SPACING.md,
},
accountInfo: {
  flex: 1,
},
accountName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1E293B',
  marginBottom: SPACING.xs,
},
accountEmail: {
  fontSize: 14,
  color: '#64748B',
  marginBottom: SPACING.xs,
},
currentAccountItem: {
  backgroundColor: '#F0FDF4',
  borderColor: '#10B981',
  borderWidth: 1,
},
currentAccountLabel: {
  fontSize: 12,
  color: '#10B981',
  fontWeight: '600',
},
addAccountButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: SPACING.lg,
  marginTop: SPACING.md,
  borderRadius: 16,
  backgroundColor: '#F8FAFC',
  borderWidth: 2,
  borderColor: COLORS.primary,
  borderStyle: 'dashed',
},
addAccountText: {
  fontSize: 16,
  color: COLORS.primary,
  fontWeight: '600',
  marginLeft: SPACING.sm,
},
  editForm: {
    gap: SPACING.sm,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: '#F8FAFC',
    marginBottom: SPACING.sm,
  },
  halfInput: {
    width: '48%',
  },
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -SPACING.sm,
    marginBottom: SPACING.sm,
  },
  halfError: {
    width: '48%',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -SPACING.xs,
    marginBottom: SPACING.xs,
  },

  // Info Display
  infoDisplay: {
    gap: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },

  // Preference Items
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING.xs,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#64748B',
  },

  // Account Items
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: SPACING.xs,
  },
  dangerText: {
    color: '#EF4444',
  },
  accountDescription: {
    fontSize: 14,
    color: '#64748B',
  },

  bottomSpacing: {
    height: 20,
  },

  // Modal Styles (Enhanced from registration screen)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  grassBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(34, 139, 34, 0.15)',
    ...(Platform.OS === 'web' && {
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(34, 139, 34, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(50, 205, 50, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 75% 25%, rgba(34, 139, 34, 0.06) 0%, transparent 50%),
        radial-gradient(circle at 25% 75%, rgba(107, 142, 35, 0.1) 0%, transparent 50%)
      `,
      backgroundSize: '40px 40px, 60px 60px, 80px 80px, 100px 100px',
    }),
  },
  modalContainer: {
    width: Platform.OS === 'web' ? '90%' : '100%',
    maxWidth: Platform.OS === 'web' ? 500 : undefined,
    maxHeight: screenHeight * 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Platform.OS === 'web' ? 20 : undefined,
    borderTopLeftRadius: Platform.OS !== 'web' ? 25 : undefined,
    borderTopRightRadius: Platform.OS !== 'web' ? 25 : undefined,
    marginBottom: Platform.OS === 'web' ? 20 : 0,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    }),
    elevation: 10,
  },
  modalScrollView: {
    flex: 1,
    maxHeight: screenHeight * 0.7,
  },
  modalScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: Platform.OS === 'web' ? 20 : (Platform.OS === 'ios' ? 40 : 20),
    flexGrow: 1,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 2,
    marginBottom: SPACING.md,
    opacity: 0.3,
  },
  modalTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalOptionsContainer: {
    marginBottom: SPACING.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalOptionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionTextContainer: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  modalOptionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  modalCancel: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  modalBottomSpace: {
    height: 40,
  },



// Add these to your existing styles object
sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SPACING.md,
},
viewAllText: {
  color: '#3B82F6',
  fontSize: 14,
  fontWeight: '500',
},
childCard: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: SPACING.sm,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
childImage: {
  marginRight: SPACING.md,
},
childInfo: {
  flex: 1,
},
childName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1F2937',
  marginBottom: 2,
},
childDetails: {
  fontSize: 14,
  color: '#64748B',
  marginBottom: 2,
},
academyName: {
  fontSize: 12,
  color: '#9CA3AF',
},
childStats: {
  alignItems: 'center',
  marginRight: SPACING.sm,
},
sessionsCount: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#3B82F6',
},
sessionsLabel: {
  fontSize: 12,
  color: '#64748B',
},
deleteStatus: {
  fontSize: 14,
  color: COLORS.textSecondary,
  textAlign: 'center',
  marginTop: 10,
  fontStyle: 'italic',
},
deletingContainer: {
  alignItems: 'center',
  padding: 20,
},
});



export default ProfileScreen;