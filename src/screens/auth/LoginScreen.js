import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { Button, TextInput, Text, Surface, Avatar, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { loginStart, loginSuccess, loginFailure } from '../../store/reducers/authReducer';
import AuthService from '../../services/AuthService';
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/layout';
import { TEXT_STYLES } from '../../styles/typography';
import FirebaseService from '../../services/FirebaseService';
import PasswordSecurityService from '../../services/PasswordSecurityService';
import { useGoogleAuth } from '../../config/googleAuth';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Enhanced Color Palette for better UI/UX
const ENHANCED_COLORS = {
  // Primary colors - Match header theme
  primary: '#5B9BD5', // Header blue color
  primaryLight: '#7BAEE0',
  primaryDark: '#4A7FB8',
  
  // Background colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  
  // Text colors
  onSurface: '#1E293B', // Dark gray for primary text
  onSurfaceVariant: '#64748B', // Medium gray for secondary text
  onSurfaceDisabled: '#94A3B8', // Light gray for disabled text
  
  // Input field colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputBorderFocused: '#5B9BD5', // Match header color
  inputText: '#1E293B',
  inputPlaceholder: '#64748B',
  inputLabel: '#475569',
  inputLabelFocused: '#5B9BD5', // Match header color
  
  // Status colors
  success: '#059669',
  successLight: '#10B981',
  error: '#DC2626',
  warning: '#D97706',
  
  // Interactive colors
  ripple: 'rgba(37, 99, 235, 0.12)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Border and divider
  border: '#E2E8F0',
  divider: '#F1F5F9',
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Cleanup function at the component level
const cleanupDuplicateUsers = async () => {
  try {
    const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
    if (registeredUsersJson) {
      const users = JSON.parse(registeredUsersJson);
      
      // Remove duplicates based on email (keep the first occurrence)
      const uniqueUsers = users.filter((user, index, array) => 
        array.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase()) === index
      );
      
      if (uniqueUsers.length !== users.length) {
        console.log(`Removed ${users.length - uniqueUsers.length} duplicate users`);
        await AsyncStorage.setItem('registeredUsers', JSON.stringify(uniqueUsers));
      }
    }
  } catch (error) {
    console.error('Error cleaning up duplicate users:', error);
  }
};

  // Configure WebBrowser
  WebBrowser.maybeCompleteAuthSession();

  const LoginScreen = ({ navigation, route }) => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [matchedUser, setMatchedUser] = useState(null);
  const [smartAutofillEnabled, setSmartAutofillEnabled] = useState(false);
  const [quickLoginScrollPosition, setQuickLoginScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [userExists, setUserExists] = useState(null);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [showUserNotFound, setShowUserNotFound] = useState(false);
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [conflictResolution, setConflictResolution] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const [availableAuthMethods, setAvailableAuthMethods] = useState(['google', 'phone', 'email']);
  const [detectedAuthMethod, setDetectedAuthMethod] = useState(null);
  const [showGoogleButton, setShowGoogleButton] = useState(true);
  const [showPhoneButton, setShowPhoneButton] = useState(true);
  const [authMethodMessage, setAuthMethodMessage] = useState('');

  const logoScaleAnim = useRef(new Animated.Value(1)).current;
  const quickLoginScrollRef = useRef(null);
  const dispatch = useDispatch();
  const { loading, error, user } = useSelector(state => state.auth);

  const [request, response, promptAsync] = useGoogleAuth();

    console.log('🔍 MOBILE DEBUG - Google Auth initialized:', {
      platform: Platform.OS,
      requestReady: !!request
    });

  // Check for existing authentication on component mount
  useEffect(() => {
    const initializeLogin = async () => {
      await cleanupDuplicateUsers();
      await checkExistingAuth();
    };
    initializeLogin();
  }, []);

  // Navigate to main screen if user is authenticated
  useEffect(() => {
    if (user && !loading) {
      navigation.replace('Main');
    }
  }, [user, loading, navigation]);

  // check for the success message parameter from forgot password:
    useEffect(() => {
      if (route.params?.successMessage) {
        Alert.alert('Success', route.params.successMessage);
        // Clear the params to avoid showing again
        navigation.setParams({ successMessage: null });
      }
      if (route.params?.resetEmail) {
        setLoginInput(route.params.resetEmail);
      }
    }, [route.params]);

   // Handle Google auth response
  React.useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleAuthResponse(response.authentication);
    } else if (response?.type === 'error') {
      console.error('Google auth error:', response.error);
      dispatch(loginFailure('Google sign-in failed'));
    }
  }, [response]);



  const checkExistingAuth = async () => {
    try {
      setIsCheckingAuth(true);
      
      // Check if there's a stored authenticated user
      const storedUserJson = await AsyncStorage.getItem('authenticatedUser');
      const autoLoginEnabledJson = await AsyncStorage.getItem('autoLoginEnabled');
      
      if (storedUserJson && autoLoginEnabledJson !== 'false') {
        const storedUser = JSON.parse(storedUserJson);
        
        // Verify the user still exists in registered users (in case they were deleted)
        const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
        if (registeredUsersJson) {
          const registeredUsers = JSON.parse(registeredUsersJson);
          const userExists = registeredUsers.find(user => user.id === storedUser.id);
          
          if (userExists) {
            // User is valid, restore authentication
            dispatch(loginSuccess(storedUser));
            return;
          } else {
            // User no longer exists, clear stored data
            await AsyncStorage.removeItem('authenticatedUser');
          }
        }
      }
      
      // Load recent users after checking auth
      await loadRecentUsers();
    } catch (error) {
      console.error('Error checking existing auth:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadRecentUsers = async () => {
    try {
      // Load all registered users from AsyncStorage
      const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
      const recentLoginsJson = await AsyncStorage.getItem('recentLogins');
      
      let allUsers = [];
      let recentLoginIds = [];

      // Get all registered users
      if (registeredUsersJson) {
        allUsers = JSON.parse(registeredUsersJson);
      }

      // Get recent login history (user IDs in order of recent login)
      if (recentLoginsJson) {
        recentLoginIds = JSON.parse(recentLoginsJson);
      }

      // Sort users by recent login history, then by registration date
      const sortedUsers = allUsers.sort((a, b) => {
        const aIndex = recentLoginIds.indexOf(a.id);
        const bIndex = recentLoginIds.indexOf(b.id);
        
        // If both users have recent logins, sort by recent login order
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // If only one has recent logins, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // If neither has recent logins, sort by creation date (most recent first)
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });

      setRecentUsers(sortedUsers.slice(0, 10)); // Keep only top 10 recent users
      
      // Check if we need arrows for quick login
      setTimeout(() => {
        checkQuickLoginArrows(sortedUsers.slice(0, 10));
      }, 100);
    } catch (error) {
      console.error('Error loading recent users:', error);
      // If there's an error, keep empty array
      setRecentUsers([]);
    }
  };

  const checkQuickLoginArrows = (users) => {
    if (users.length > 3) {
      setShowRightArrow(true);
    } else {
      setShowRightArrow(false);
      setShowLeftArrow(false);
    }
  };

  const handleQuickLoginScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const layoutWidth = event.nativeEvent.layoutMeasurement.width;
    
    setQuickLoginScrollPosition(scrollX);
    setShowLeftArrow(scrollX > 20);
    setShowRightArrow(scrollX < contentWidth - layoutWidth - 20);
  };

  const scrollQuickLogin = (direction) => {
    if (quickLoginScrollRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? quickLoginScrollPosition - scrollAmount 
        : quickLoginScrollPosition + scrollAmount;
      
      quickLoginScrollRef.current.scrollTo({
        x: Math.max(0, newPosition),
        animated: true
      });
    }
  };

  const saveRecentLogin = async (userId) => {
    try {
      const recentLoginsJson = await AsyncStorage.getItem('recentLogins');
      let recentLogins = [];
      
      if (recentLoginsJson) {
        recentLogins = JSON.parse(recentLoginsJson);
      }
      
      // Remove userId if it already exists
      recentLogins = recentLogins.filter(id => id !== userId);
      
      // Add userId to the beginning
      recentLogins.unshift(userId);
      
      // Keep only last 10 recent logins
      recentLogins = recentLogins.slice(0, 10);
      
      await AsyncStorage.setItem('recentLogins', JSON.stringify(recentLogins));
    } catch (error) {
      console.error('Error saving recent login:', error);
    }
  };

  const saveAuthenticatedUser = async (userData) => {
    try {
      // Store the authenticated user for persistent login
      await AsyncStorage.setItem('authenticatedUser', JSON.stringify(userData));
      // Also store that auto-login is enabled (can be disabled by user later)
      await AsyncStorage.setItem('autoLoginEnabled', 'true');
    } catch (error) {
      console.error('Error saving authenticated user:', error);
    }
  };

  // Enhanced smart matching function
  const findMatchingUser = (input) => {
    if (!input || input.length < 2) return null;
    
    const searchTerm = input.toLowerCase().trim();
    return recentUsers.find(user => {
      return (
        user.email.toLowerCase().startsWith(searchTerm) ||
        user.username.toLowerCase().startsWith(searchTerm) ||
        user.phone.replace(/[\s\-\(\)]/g, '').startsWith(searchTerm.replace(/[\s\-\(\)]/g, '')) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)
      );
    });
  };

  // Realtime user validation
  const checkUserExists = async (input) => {
    if (!input || input.trim().length < 3) {
      setUserExists(null);
      setShowUserNotFound(false);
      return null;
    }

    try {
      const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
      if (registeredUsersJson) {
        const registeredUsers = JSON.parse(registeredUsersJson);
        const inputValue = input.trim();
        
        const foundUser = registeredUsers.find(user => {
          if (loginMethod === 'email') {
            return user.email.toLowerCase() === inputValue.toLowerCase();
          } else if (loginMethod === 'phone') {
            return user.phone === inputValue;
          } else if (loginMethod === 'username') {
            return user.username.toLowerCase() === inputValue.toLowerCase();
          }
          return user.email.toLowerCase() === inputValue.toLowerCase() ||
                user.username.toLowerCase() === inputValue.toLowerCase() ||
                user.phone === inputValue;
        });

        setUserExists(!!foundUser);
        return foundUser;
      }
    } catch (error) {
      console.error('Error checking user exists:', error);
    }
    return null;
  };

  // Real-time password validation function
 // Real-time password validation function
const checkPasswordMatch = async (user, passwordInput) => {
  if (!user || !passwordInput) {
    setPasswordMatch(null);
    setShowPasswordMismatch(false);
    return;
  }
  
  let isValid = false;
  
  // Use secure password verification
  if (user.passwordHash) {
    isValid = PasswordSecurityService.verifyPassword(passwordInput, user.passwordHash);
  } else if (user.hasPassword) {
    // Try to get password from secure storage
    const userId = user.id || user.firebaseUid;
    const storedPasswordData = await PasswordSecurityService.getPasswordSecurely(userId);
    
    if (storedPasswordData) {
      isValid = PasswordSecurityService.verifyPassword(passwordInput, storedPasswordData);
    }
  } else if (user.password) {
    // Legacy plain password check
    isValid = user.password === passwordInput;
  }
  
  setPasswordMatch(isValid);
  setShowPasswordMismatch(!isValid && passwordInput.length > 0);
};

  //Auth Method Detection Function
  const detectUserAuthMethod = async (input) => {
  if (!input || input.trim().length < 3) {
    setDetectedAuthMethod(null);
    setAvailableAuthMethods(['google', 'phone', 'email']);
    setShowGoogleButton(true);
    setShowPhoneButton(true);
    setAuthMethodMessage('');
    return;
  }

  try {
    // Check Firebase for user's auth method
    const firebaseUser = await FirebaseService.findFirebaseUser(input.trim(), loginMethod);
    
    //detectUserAuthMethod(input);
    
    if (firebaseUser) {
      const authMethod = firebaseUser.authMethod;
      const linkedMethods = firebaseUser.linkedAuthMethods || [authMethod];
      
      setDetectedAuthMethod(authMethod);
      setAvailableAuthMethods(linkedMethods);
      
      // Update UI based on available auth methods
      if (linkedMethods.includes('email')) {
        setShowGoogleButton(linkedMethods.includes('google'));
        setShowPhoneButton(linkedMethods.includes('phone'));
        setAuthMethodMessage('');
      } else if (authMethod === 'google') {
        setShowGoogleButton(true);
        setShowPhoneButton(false);
        setAuthMethodMessage('This account uses Google Sign-In');
      } else if (authMethod === 'phone') {
        setShowGoogleButton(false);
        setShowPhoneButton(true);
        setAuthMethodMessage('This account uses Phone Sign-In');
      }
    } else {
      // User not found, show all options
      setDetectedAuthMethod(null);
      setAvailableAuthMethods(['google', 'phone', 'email']);
      setShowGoogleButton(true);
      setShowPhoneButton(true);
      setAuthMethodMessage('');
    }
  } catch (error) {
    console.warn('Error detecting auth method:', error);
    // Keep default state on error
  }
};

  // Smart autofill password when user is matched
  const handleSmartAutofill = (user) => {
    if (user && smartAutofillEnabled) {
      // Don't autofill password for security, but prepare for quick login
      setMatchedUser(user);
      animateLogo();
    }
  };

  const animateLogo = () => {
    Animated.sequence([
      Animated.timing(logoScaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(logoScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Detect login method and find matching users
  useEffect(() => {
    const input = loginInput.trim();
    
    if (!input) {
      setLoginMethod('');
      setShowSuggestions(false);
      setMatchedUser(null);
      setUserExists(null);
      setShowUserNotFound(false);
      return;
    }

    // Detect login method (keep existing logic)
    if (input.includes('@')) {
      const emailParts = input.split('@');
      if (emailParts.length === 2 && emailParts[1].includes('.')) {
        setLoginMethod('email');
      } else {
        setLoginMethod('username');
      }
    }
    else if (/^[\+]?[0-9\s\-\(\)]+$/.test(input) && input.replace(/[\s\-\(\)]/g, '').length >= 7) {
      setLoginMethod('phone');
    }
    else {
      setLoginMethod('username');
    }

    // Check if user exists and update matched user
    checkUserExists(input).then(foundUser => {
      setMatchedUser(foundUser);
      
      // If user exists, check password match
      if (foundUser && password) {
        checkPasswordMatch(foundUser, password);
      }
      
      // Handle smart autofill
      if (foundUser) {
        handleSmartAutofill(foundUser);
      }
    });


  // Add this line after checkUserExists call
    detectUserAuthMethod(input);

    // Show suggestions if input is more than 2 characters
    if (input.length > 2) {
      generateSuggestions(input);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [loginInput, recentUsers]);

// Check password match when password changes
useEffect(() => {
  if (matchedUser && password) {
    // Make this async since we now use async password checking
    checkPasswordMatch(matchedUser, password);
  } else {
    setPasswordMatch(null);
    setShowPasswordMismatch(false);
  }
}, [password, matchedUser]);


  // Show user not found when user focuses on password but user doesn't exist
  useEffect(() => {
    if (userExists === false && loginInput.trim().length > 0) {
      setShowUserNotFound(true);
    } else {
      setShowUserNotFound(false);
    }
  }, [userExists, loginInput]);

const generateSuggestions = async (input) => {
  if (input.length < 3) {
    setSuggestions([]);
    return;
  }

  try {
    console.log('🔍 Generating suggestions for:', input);
    const searchTerm = input.toLowerCase().trim();
    let allSuggestions = [];

    // Local search first (faster)
    const localFiltered = recentUsers.filter(user => {
      return (
        user.email.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        user.phone.includes(input.replace(/[\s\-\(\)]/g, '')) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm)
      );
    });

    allSuggestions = [...localFiltered];
    console.log('📱 Local suggestions:', allSuggestions.length);

    // Online search if connected
    try {
      const isOnline = await NetInfo.fetch().then(state => state.isConnected);
      if (isOnline) {
        console.log('🌐 Searching online...');
        
        // Search Firebase users
        const onlineUsers = await FirebaseService.searchUsers(searchTerm);
        console.log('☁️ Online suggestions:', onlineUsers.length);
        
        // Merge results, avoiding duplicates
        onlineUsers.forEach(onlineUser => {
          const exists = allSuggestions.find(localUser => 
            localUser.email.toLowerCase() === onlineUser.email.toLowerCase()
          );
          if (!exists) {
            allSuggestions.push({ ...onlineUser, isOnline: true });
          }
        });
      }
    } catch (onlineError) {
      console.warn('Online search failed:', onlineError.message);
      // Continue with local results only
    }

    // Sort by relevance
    const sorted = allSuggestions.sort((a, b) => {
      // Prioritize exact email matches
      const aEmailExact = a.email.toLowerCase() === searchTerm;
      const bEmailExact = b.email.toLowerCase() === searchTerm;
      if (aEmailExact && !bEmailExact) return -1;
      if (!aEmailExact && bEmailExact) return 1;
      
      // Then username matches
      const aUsernameExact = a.username.toLowerCase() === searchTerm;
      const bUsernameExact = b.username.toLowerCase() === searchTerm;
      if (aUsernameExact && !bUsernameExact) return -1;
      if (!aUsernameExact && bUsernameExact) return 1;
      
      // Prioritize local users over online-only users
      if (!a.isOnline && b.isOnline) return -1;
      if (a.isOnline && !b.isOnline) return 1;
      
      return 0;
    });

    setSuggestions(sorted.slice(0, 8)); // Limit to 8 suggestions
    console.log('✅ Total suggestions generated:', sorted.length);
    
  } catch (error) {
    console.error('❌ Error generating suggestions:', error);
    setSuggestions(recentUsers.filter(user => {
      const searchTerm = input.toLowerCase();
      return user.email.toLowerCase().includes(searchTerm) ||
             user.username.toLowerCase().includes(searchTerm);
    }).slice(0, 5));
  }
};

  const handleSuggestionSelect = (user) => {
    // Determine which field to use based on current input pattern
    let selectedValue = '';
    
    if (loginMethod === 'email' || loginInput.includes('@')) {
      selectedValue = user.email;
    } else if (loginMethod === 'phone' || /^[\+0-9]/.test(loginInput)) {
      selectedValue = user.phone;
    } else {
      selectedValue = user.username;
    }
    
    setLoginInput(selectedValue);
    setMatchedUser(user);
    setShowSuggestions(false);
    setSmartAutofillEnabled(true);
    
    // Optional: Auto-focus password field
    // You can add a ref to password input and focus it here
    animateLogo();
  };

  const handleQuickLogin = async (user) => {
    setLoginInput(user.email); // Default to email for quick login
    setMatchedUser(user);
    setSmartAutofillEnabled(true);
    setShowSuggestions(false);
    
    //Uncomment-remove password autofil
    // Auto-fill password if available (for demo purposes - in production, use secure storage)
    if (user.password) {
      setPassword(user.password);
    }
    
    animateLogo();
  };

  //google sign in handler
  const handleGoogleSignIn = async () => {
    try {
      console.log('🔐 Google Sign-In initiated');
      dispatch(loginStart());
      
      if (!request) {
        throw new Error('Google auth request not ready');
      }
      
      console.log('🚀 Triggering Google auth prompt...');
      const result = await promptAsync();
      
      if (result.type === 'cancel') {
      dispatch(loginFailure('Google sign-in cancelled'));
      console.log('⚠️ Google sign-in cancelled');
      return; // Add this return
    }
      
    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);
      dispatch(loginFailure(error.message));
      Alert.alert('Sign-In Error', `Failed to sign in with Google: ${error.message}`);
    }
  };

  // Add this function to handle the Google auth response
  const handleGoogleAuthResponse = async (authentication) => {
    try {
      console.log('✅ Google Auth successful, processing user data...');
      
      // Get user info from Google
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authentication.accessToken}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!userInfoResponse.ok) {
        throw new Error(`Failed to fetch user info: ${userInfoResponse.status}`);
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('📧 Google user email:', userInfo.email);
      
      // Check if user exists locally first
      const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
      let localUser = null;
      
      if (registeredUsersJson) {
        const registeredUsers = JSON.parse(registeredUsersJson);
        localUser = registeredUsers.find(user => 
          user.email.toLowerCase() === userInfo.email.toLowerCase() &&
          user.authMethod === 'google'
        );
      }
      
      // Check Firebase for user
      let firebaseUser = null;
      try {
        const isOnline = await NetInfo.fetch().then(state => state.isConnected);
        if (isOnline) {
          firebaseUser = await FirebaseService.findFirebaseUser(userInfo.email, 'email');
          console.log('☁️ Firebase user found:', !!firebaseUser);
        }
      } catch (error) {
        console.warn('Firebase check failed during Google login:', error.message);
      }
      
      // Determine login scenario
      const userData = firebaseUser || localUser;
      
      if (userData) {
        console.log('✅ User account found, logging in...');
        
        // Verify this is actually a Google auth user
        if (userData.authMethod !== 'google') {
          dispatch(loginFailure('Account exists with different auth method'));
          Alert.alert(
            'Different Authentication Method',
            `An account with this email exists but uses ${userData.authMethod} authentication. Please sign in using ${userData.authMethod} instead.`,
            [
              { text: 'OK' },
              { 
                text: 'Go to Email Sign-In', 
                onPress: () => {
                  setLoginInput(userInfo.email);
                  setLoginMethod('email');
                }
              }
            ]
          );
          return;
        }
        
        // Update user data with fresh Google tokens
        const updatedUserData = {
          ...userData,
          idToken: authentication.idToken,
          accessToken: authentication.accessToken,
          profileImage: userInfo.picture || userData.profileImage,
          lastLoginAt: new Date().toISOString()
        };
        
        // Save login history
        await saveRecentLogin(userData.id || userData.firebaseUid);
        await saveAuthenticatedUser(updatedUserData);
        
        // Update local storage if this was a local user
        if (localUser && !firebaseUser) {
          const registeredUsers = JSON.parse(registeredUsersJson);
          const userIndex = registeredUsers.findIndex(u => u.id === localUser.id);
          if (userIndex !== -1) {
            registeredUsers[userIndex] = updatedUserData;
            await AsyncStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
          }
        }
        
        dispatch(loginSuccess(updatedUserData));
        await loadRecentUsers();
        
        Alert.alert(
          'Welcome Back!',
          `Signed in successfully with Google, ${userInfo.given_name || userInfo.name}!`,
          [{ text: 'Continue', onPress: () => navigation.replace('Main') }]
        );
        
      } else {
        console.log('❌ No account found for this email');
        dispatch(loginFailure('Account not found'));
        
        // Offer to create account
        Alert.alert(
          'Account Not Found',
          `No account found for ${userInfo.email}. Would you like to create an account instead?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Create Account', 
              onPress: () => {
                navigation.navigate('Register', {
                  prefilledData: {
                    authMethod: 'google',
                    email: userInfo.email,
                    firstName: userInfo.given_name || '',
                    lastName: userInfo.family_name || '',
                    profileImage: userInfo.picture || '',
                    googleId: userInfo.id,
                    idToken: authentication.idToken,
                    accessToken: authentication.accessToken,
                    emailVerified: userInfo.verified_email || true,
                    username: `${(userInfo.given_name || '').toLowerCase()}${(userInfo.family_name || '').toLowerCase()}${Math.floor(Math.random() * 999)}`
                  }
                });
              }
            }
          ]
        );
      }
      
    } catch (error) {
      console.error('❌ Error handling Google auth response:', error);
      dispatch(loginFailure(error.message));
      Alert.alert('Authentication Error', `Failed to process Google sign-in: ${error.message}`);
    }
  };

//phone Sign in handler
const handlePhoneSignIn = async () => {
  try {
    dispatch(loginStart());
    
    Alert.alert(
      'Phone Sign-In',
      'You will receive an SMS verification code.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => dispatch(loginFailure('Cancelled')) },
        { 
          text: 'Send Code', 
          onPress: async () => {
            try {
              // Implement phone verification flow here
              console.log('Phone sign-in initiated for:', loginInput);
              
              // For now, show that feature is coming
              dispatch(loginFailure('Feature coming soon'));
              Alert.alert('Coming Soon', 'Phone Sign-In will be available in the next update.');
            } catch (error) {
              dispatch(loginFailure(error.message));
              Alert.alert('Phone Sign-In Failed', error.message);
            }
          }
        }
      ]
    );
  } catch (error) {
    dispatch(loginFailure(error.message));
    Alert.alert('Error', 'Failed to initiate phone sign-in');
  }
};

  const getLoginMethodIcon = () => {
    switch (loginMethod) {
      case 'email':
        return 'email';
      case 'phone':
        return 'phone';
      case 'username':
        return 'account-circle';
      default:
        return 'login';
    }
  };

  const getLoginMethodLabel = () => {
    if (matchedUser && smartAutofillEnabled) {
      return `Welcome back, ${matchedUser.firstName}`;
    }
    
    switch (loginMethod) {
      case 'email':
        return 'Email Address';
      case 'phone':
        return 'Phone Number';
      case 'username':
        return 'Username';
      default:
        return 'Email, Username, or Phone';
    }
  };

// Enhanced Login Handler for LoginScreen.js
//debug
// Add this function inside LoginScreen component, before the handleLogin function
const debugAsyncStorage = async () => {
  try {
    console.log('🔍 Debugging AsyncStorage contents...');
    
    // Check all possible keys
    const keys = ['registeredUsers', '@acceilla:registered_users', 'user_data', 'authenticatedUser'];
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`📱 AsyncStorage[${key}]:`, value ? JSON.parse(value) : null);
    }
  } catch (error) {
    console.error('❌ Error debugging AsyncStorage:', error);
  }
};

// Hhe existing handleLogin function with this implementation

// Replace the validation section in handleLogin
const handleLogin = async () => {
  console.log('🚀 LOGIN FUNCTION CALLED!');
  console.log('Login input:', loginInput, 'Password length:', password.length);
  
  if (!loginInput.trim()) {
    Alert.alert('Error', 'Please enter your email, username, or phone number');
    return;
  }

  // For Google auth method, password is optional
  if (detectedAuthMethod !== 'google' && !password.trim()) {
    Alert.alert('Error', 'Please enter your password');
    return;
  }

  // Show immediate feedback for known invalid credentials
  if (userExists === false) {
    Alert.alert(
      'User Not Found', 
      'This user does not exist. Please check your credentials or create an account.',
      [
        { text: 'Try Again', style: 'cancel' },
        { text: 'Create Account', onPress: () => navigation.navigate('Register') }
      ]
    );
    return;
  }

  if (passwordMatch === false) {
    Alert.alert('Incorrect Password', 'The password you entered is incorrect.', [
      { text: 'Try Again', style: 'cancel' },
      { text: 'Recover Password', onPress: () => navigation.navigate('ForgotPassword', { 
        suggestedEmail: loginInput, 
        suggestedUser: matchedUser 
      }) }
    ]);
    return;
  }

  // Validate input format
  if (loginMethod === 'email' && !isValidEmail(loginInput)) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  if (loginMethod === 'phone' && !isValidPhone(loginInput)) {
    Alert.alert('Error', 'Please enter a valid phone number');
    return;
  }

  if (loginMethod === 'username' && loginInput.length < 3) {
    Alert.alert('Error', 'Username must be at least 3 characters');
    return;
  }

  dispatch(loginStart());
  
  try {
    console.log('🔐 Starting enhanced login with improved online/offline flow...');
    
    const networkState = await NetInfo.fetch();
    const isOnline = networkState.isConnected;
    
    let loginResult;

    if (isOnline) {
      // ENHANCED ONLINE LOGIN WITH CONFLICT RESOLUTION
      console.log('🌐 Executing enhanced online login with conflict resolution...');
      
      try {
        // Use the enhanced conflict resolution login from FirebaseService
        loginResult = await FirebaseService.loginWithConflictResolution(
          loginInput.trim(), 
          password, 
          loginMethod
        );
        
        console.log('📊 Enhanced login result:', {
          success: loginResult.success,
          mode: loginResult.mode,
          requiresResolution: loginResult.requiresResolution
        });
        
      } catch (firebaseError) {
        console.warn('⚠️ Enhanced Firebase login failed:', firebaseError.message);
        
        if (firebaseError.message.includes('permissions') || 
            firebaseError.message.includes('Missing or insufficient permissions')) {
          Alert.alert(
            'Database Access Error', 
            'Cannot access online accounts. Trying offline login...',
            [{ text: 'OK' }]
          );
          
          // Fallback to offline login
          loginResult = await executeOfflineLogin(loginInput.trim(), password, loginMethod);
        } else {
          loginResult = {
            success: false,
            error: firebaseError.message
          };
        }
      }
    } else {
      // OFFLINE LOGIN
      console.log('📱 Device offline - using offline login...');
      loginResult = await executeOfflineLogin(loginInput.trim(), password, loginMethod);
    }

    // Handle login result
    if (loginResult?.requiresResolution) {
      console.log('🔄 Conflict resolution required:', loginResult.conflictType);
      dispatch(loginFailure('Conflict resolution required'));
      await handleConflictResolution(loginResult);
      return;
    }

    if (loginResult?.success) {
      console.log('✅ Login successful, proceeding with user data setup...');
      
      // Save login data and continue
      await saveRecentLogin(loginResult.userData.id || loginResult.userData.firebaseUid);
      await saveAuthenticatedUser(loginResult.userData);
      
      await AsyncStorage.multiSet([
        ['user_data', JSON.stringify(loginResult.userData)],
        ['authenticatedUser', JSON.stringify(loginResult.userData)],
        ['lastLoginMode', isOnline ? 'online' : 'offline'],
        ['lastLoginTimestamp', new Date().toISOString()]
      ]);
      
      dispatch(loginSuccess(loginResult.userData));
      await loadRecentUsers();
      
      const message = loginResult.message || `Welcome back, ${loginResult.userData.firstName}!`;
      
      Alert.alert('Login Successful', message, [
        { text: 'Continue', onPress: () => navigation.replace('Main') }
      ]);
      return;
    }

    throw new Error(loginResult?.error || 'Login failed');

  } catch (error) {
    console.error('❌ Enhanced login error:', error);
    dispatch(loginFailure(error.message || 'Login failed'));
    
    // Show user-friendly error messages
    if (error.message.includes('User not found')) {
      Alert.alert('User Not Found', 'This user does not exist. Please check your credentials or create an account.');
    } else if (error.message.includes('Incorrect password')) {
      Alert.alert('Login Failed', 'Incorrect password. Please try again.', [
        { text: 'Try Again', style: 'cancel' },
        { text: 'Recover Password', onPress: () => navigation.navigate('ForgotPassword', { 
          suggestedEmail: loginInput, 
          suggestedUser: matchedUser 
        }) }
      ]);
    } else {
      Alert.alert('Login Failed', error.message || 'Unable to sign in. Please try again.');
    }
  }
};

// Helper function for offline-only login
const executeOfflineLogin = async (loginInput, password, loginMethod) => {
  console.log('📱 Executing offline login validation...');
  console.log('🔍 Login parameters:', { loginInput, loginMethod, passwordLength: password.length });
  
  try {
    // First, let's see what's actually in AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📱 All AsyncStorage keys:', allKeys);
    
    const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
    console.log('📱 Raw registeredUsers from AsyncStorage:', registeredUsersJson);
    
    if (!registeredUsersJson) {
      console.log('❌ No registeredUsers key found in AsyncStorage');
      return {
        success: false,
        error: 'No offline users found. Please connect to internet or create an account offline.'
      };
    }

    const registeredUsers = JSON.parse(registeredUsersJson);
    console.log(`🔍 Parsed ${registeredUsers.length} offline users:`, registeredUsers.map(u => ({
      email: u.email,
      username: u.username,
      firstName: u.firstName,
      syncedToServer: u.syncedToServer
    })));

    const inputValue = loginInput.toLowerCase();
    console.log('🔍 Searching for user with input:', inputValue, 'method:', loginMethod);

    const foundUser = registeredUsers.find(user => {
      console.log('🔍 Checking user:', {
        email: user.email?.toLowerCase(),
        username: user.username?.toLowerCase(),
        phone: user.phone
      });
      
      switch (loginMethod) {
        case 'email':
          const emailMatch = user.email?.toLowerCase() === inputValue;
          console.log('📧 Email match check:', user.email?.toLowerCase(), '===', inputValue, '→', emailMatch);
          return emailMatch;
        case 'phone':
          const phoneMatch = user.phone === loginInput; // Phone should match exactly
          console.log('📞 Phone match check:', user.phone, '===', loginInput, '→', phoneMatch);
          return phoneMatch;
        case 'username':
          const usernameMatch = user.username?.toLowerCase() === inputValue;
          console.log('👤 Username match check:', user.username?.toLowerCase(), '===', inputValue, '→', usernameMatch);
          return usernameMatch;
        default:
          // Try all methods
          const anyMatch = (
            user.email?.toLowerCase() === inputValue ||
            user.username?.toLowerCase() === inputValue ||
            user.phone === loginInput
          );
          console.log('🔍 Any field match check:', anyMatch);
          return anyMatch;
      }
    });

    if (!foundUser) {
      console.log('❌ User not found in offline storage');
      console.log('🔍 Available users for debugging:', registeredUsers.map(u => ({
        email: u.email,
        username: u.username,
        phone: u.phone
      })));
      return {
        success: false,
        error: 'User not found in offline storage'
      };
    }

    console.log('✅ Found user:', foundUser.email);

    // Validate password
    console.log('🔐 Password validation:', {
      storedLength: foundUser.password?.length,
      inputLength: password.length,
      match: foundUser.password === password
    });

    // With this secure verification:
    let passwordValid = false;

    if (foundUser.passwordHash) {
      passwordValid = PasswordSecurityService.verifyPassword(password, foundUser.passwordHash);
    } else if (foundUser.hasPassword) {
      const userId = foundUser.id || foundUser.firebaseUid;
      const storedPasswordData = await PasswordSecurityService.getPasswordSecurely(userId);
      
      if (storedPasswordData) {
        passwordValid = PasswordSecurityService.verifyPassword(password, storedPasswordData);
      }
    } else if (foundUser.password) {
      // Legacy plain password check (migrate automatically)
      passwordValid = foundUser.password === password;
      
      // Migrate to secure storage
      if (passwordValid) {
        const hashedPassword = PasswordSecurityService.hashPassword(password);
        const userId = foundUser.id || foundUser.firebaseUid;
        await PasswordSecurityService.storePasswordSecurely(userId, hashedPassword);
        
        // Update user record
        foundUser.passwordHash = hashedPassword;
        foundUser.hasPassword = true;
        delete foundUser.password;
        
        // Update AsyncStorage
        const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
        if (registeredUsersJson) {
          const registeredUsers = JSON.parse(registeredUsersJson);
          const userIndex = registeredUsers.findIndex(u => u.id === foundUser.id);
          if (userIndex >= 0) {
            registeredUsers[userIndex] = foundUser;
            await AsyncStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
          }
        }
      }
    }

    if (!passwordValid) {
      console.log('❌ Password mismatch for offline user');
      return {
        success: false,
        error: 'Incorrect password'
      };
    }

    console.log('✅ Offline login validation successful');
    
    return {
      success: true,
      userData: {
        ...foundUser,
        syncStatus: 'offline',
        lastLoginMode: 'offline'
      },
      mode: 'offline',
      message: `Welcome back, ${foundUser.firstName}! (Offline mode)`
    };

  } catch (error) {
    console.error('❌ Offline login error:', error);
    return {
      success: false,
      error: 'Failed to validate offline credentials'
    };
  }
};


// Enhanced conflict resolution handler

const handleConflictResolution = async (conflictResult) => {
  console.log('🔄 Handling conflict resolution:', conflictResult.conflictType);
  console.log('📊 Conflict details:', conflictResult.conflicts);
  
  if (conflictResult.conflictType === 'DATA_CONFLICT') {
    // Show data conflict resolution modal
    Alert.alert(
      'Account Data Conflict Detected',
      `We found different information for your account between your device and the cloud. This needs to be resolved before signing in.\n\nConflicts found in: ${conflictResult.conflicts.map(c => c.field).join(', ')}`,
      [
        {
          text: 'Use My Device Data',
          style: 'default',
          onPress: () => {
            console.log('👤 User chose local data priority');
            resolveConflictsAutomatically(conflictResult, 'local');
          }
        },
        {
          text: 'Use Cloud Data', 
          style: 'default',
          onPress: () => {
            console.log('☁️ User chose Firebase data priority');
            resolveConflictsAutomatically(conflictResult, 'firebase');
          }
        },
        {
          text: 'Review Each Field',
          style: 'cancel',
          onPress: () => {
            console.log('📋 User wants detailed conflict review');
            showDetailedConflictModal(conflictResult);
          }
        }
      ]
    );
  } else if (conflictResult.conflictType === 'CREDENTIAL_CONFLICT') {
    // Show credential conflict resolution
    Alert.alert(
      'Account Credential Conflict',
      'Your email or username conflicts with existing data. This needs to be resolved before you can sign in.',
      [
        {
          text: 'Contact Support',
          onPress: () => {
            console.log('📞 User requested support for credential conflict');
            Alert.alert('Support', 'Please contact support to resolve this credential conflict.\n\nEmail: support@yourapp.com');
          }
        },
        {
          text: 'Try Different Account',
          style: 'cancel',
          onPress: () => {
            console.log('🔄 User chose to try different account');
            setLoginInput('');
            setPassword('');
            setMatchedUser(null);
            setUserExists(null);
            setPasswordMatch(null);
          }
        }
      ]
    );
  } else if (conflictResult.conflictType === 'USER_EXISTS_LOCALLY_ONLY') {
    Alert.alert(
      'Sync Your Account',
      'Your account exists on this device but not in the cloud. Would you like to sync it online?',
      [
        {
          text: 'Continue Offline',
          style: 'cancel',
          onPress: () => {
            console.log('📱 User chose to continue offline only');
            proceedWithOfflineLogin(conflictResult.localUser);
          }
        },
        {
          text: 'Sync to Cloud',
          onPress: () => {
            console.log('☁️ User chose to sync local account to cloud');
            syncLocalUserToCloud(conflictResult.localUser);
          }
        }
      ]
    );
  } else if (conflictResult.conflictType === 'USER_EXISTS_ONLINE_ONLY') {
    Alert.alert(
      'Download Your Account',
      'Your account exists in the cloud but not on this device. Would you like to download it?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Download Account',
          onPress: () => {
            console.log('📥 User chose to download cloud account');
            downloadCloudUserToLocal(conflictResult.firebaseUser);
          }
        }
      ]
    );
  }
};

const resolveConflictsAutomatically = async (conflictResult, choice) => {
  try {
    console.log(`🔄 Resolving conflicts automatically with choice: ${choice}`);
    console.log('📊 Conflicts to resolve:', conflictResult.conflicts);
    
    dispatch(loginStart());
    
    const resolutions = conflictResult.conflicts.map(conflict => ({
      field: conflict.field,
      choice: choice // 'local' or 'firebase'
    }));
    
    console.log('📝 Resolution mapping:', resolutions);
    
    const resolvedResult = await FirebaseService.resolveDataConflicts(
      conflictResult.localUser,
      conflictResult.firebaseUser, 
      resolutions
    );
    
    console.log('✅ Conflict resolution result:', {
      success: resolvedResult.success,
      message: resolvedResult.message
    });
    
    if (resolvedResult.success) {
      // Continue with login
      await saveRecentLogin(resolvedResult.userData.id);
      await saveAuthenticatedUser(resolvedResult.userData);
      
      await AsyncStorage.multiSet([
        ['user_data', JSON.stringify(resolvedResult.userData)],
        ['authenticatedUser', JSON.stringify(resolvedResult.userData)],
        ['lastConflictResolution', choice],
        ['lastConflictResolvedAt', new Date().toISOString()]
      ]);
      
      console.log('💾 Resolved user data saved');
      
      dispatch(loginSuccess(resolvedResult.userData));
      loadRecentUsers();
      
      Alert.alert(
        'Conflicts Resolved Successfully!', 
        resolvedResult.message || `Account data has been synchronized using your ${choice === 'local' ? 'device' : 'cloud'} data.`,
        [{ text: 'Continue', onPress: () => navigation.replace('Main') }]
      );
    } else {
      dispatch(loginFailure('Failed to resolve conflicts'));
      Alert.alert('Resolution Failed', resolvedResult.error || 'Failed to resolve conflicts. Please try again.');
    }
    
  } catch (error) {
    console.error('❌ Conflict resolution error:', error);
    dispatch(loginFailure(error.message));
    Alert.alert('Resolution Failed', 'Failed to resolve conflicts. Please try again.');
  }
};

const showDetailedConflictModal = (conflictResult) => {
  console.log('📋 Showing detailed conflict modal');
  
  const conflictSummary = conflictResult.conflicts.map(conflict => 
    `• ${conflict.field}: Device(${conflict.local}) vs Cloud(${conflict.firebase})`
  ).join('\n');
  
  Alert.alert(
    'Detailed Account Conflicts',
    `The following fields have different values:\n\n${conflictSummary}\n\nPlease choose which data set to use. You can review individual fields later in your profile settings.`,
    [
      {
        text: 'Use Device Data',
        onPress: () => {
          console.log('👤 User chose device data in detailed view');
          resolveConflictsAutomatically(conflictResult, 'local');
        }
      },
      {
        text: 'Use Cloud Data',
        onPress: () => {
          console.log('☁️ User chose cloud data in detailed view');
          resolveConflictsAutomatically(conflictResult, 'firebase');
        }
      }
    ]
  );
};

const proceedWithOfflineLogin = async (localUser) => {
  try {
    console.log('📱 Proceeding with offline-only login');
    
    await saveRecentLogin(localUser.id);
    await saveAuthenticatedUser(localUser);
    
    await AsyncStorage.multiSet([
      ['user_data', JSON.stringify(localUser)],
      ['authenticatedUser', JSON.stringify(localUser)],
      ['lastLoginMode', 'offline_only']
    ]);
    
    dispatch(loginSuccess({
      ...localUser,
      syncStatus: 'offline_only',
      lastLoginMode: 'offline'
    }));
    
    loadRecentUsers();
    
    Alert.alert(
      'Signed In Offline', 
      `Welcome back, ${localUser.firstName}! You're using offline mode. Your data will sync when you're back online.`,
      [{ text: 'Continue', onPress: () => navigation.replace('Main') }]
    );
    
  } catch (error) {
    console.error('❌ Offline login error:', error);
    Alert.alert('Login Failed', 'Failed to sign in offline. Please try again.');
  }
};

const syncLocalUserToCloud = async (localUser) => {
  try {
    console.log('☁️ Attempting to sync local user to cloud');
    
    dispatch(loginStart());
    
    const syncResult = await FirebaseService.syncLocalUserToCloud(localUser);
    
    console.log('📊 Sync result:', {
      success: syncResult.success,
      conflictType: syncResult.conflictType
    });
    
    if (syncResult.success) {
      await saveRecentLogin(syncResult.userData.id);
      await saveAuthenticatedUser(syncResult.userData);
      
      await AsyncStorage.multiSet([
        ['user_data', JSON.stringify(syncResult.userData)],
        ['authenticatedUser', JSON.stringify(syncResult.userData)],
        ['lastSyncMode', 'local_to_cloud'],
        ['lastSyncedAt', new Date().toISOString()]
      ]);
      
      dispatch(loginSuccess(syncResult.userData));
      loadRecentUsers();
      
      Alert.alert(
        'Account Synced Successfully!', 
        `Welcome back, ${syncResult.userData.firstName}! Your account has been synced to the cloud.`,
        [{ text: 'Continue', onPress: () => navigation.replace('Main') }]
      );
      
    } else if (syncResult.requiresCredentialChange) {
      // Handle credential conflicts
      Alert.alert(
        'Email/Username Already Taken',
        `Your ${syncResult.conflictField} is already taken online. Please choose a different one to sync your account.`,
        [
          {
            text: 'Choose Different Email',
            onPress: () => showCredentialChangeDialog(localUser, 'email')
          },
          {
            text: 'Choose Different Username', 
            onPress: () => showCredentialChangeDialog(localUser, 'username')
          },
          {
            text: 'Continue Offline',
            style: 'cancel',
            onPress: () => proceedWithOfflineLogin(localUser)
          }
        ]
      );
    } else {
      throw new Error(syncResult.error || 'Sync failed');
    }
    
  } catch (error) {
    console.error('❌ Sync to cloud error:', error);
    dispatch(loginFailure(error.message));
    
    Alert.alert(
      'Sync Failed',
      'Failed to sync your account to the cloud. Would you like to continue offline?',
      [
        {
          text: 'Try Again',
          onPress: () => syncLocalUserToCloud(localUser)
        },
        {
          text: 'Continue Offline',
          style: 'cancel',
          onPress: () => proceedWithOfflineLogin(localUser)
        }
      ]
    );
  }
};

const downloadCloudUserToLocal = async (firebaseUser) => {
  try {
    console.log('📥 Downloading cloud user to local storage');
    
    dispatch(loginStart());
    
    const downloadResult = await FirebaseService.downloadCloudUserToLocal(firebaseUser);
    
    console.log('📊 Download result:', {
      success: downloadResult.success
    });
    
    if (downloadResult.success) {
      await saveRecentLogin(downloadResult.userData.id);
      await saveAuthenticatedUser(downloadResult.userData);
      
      await AsyncStorage.multiSet([
        ['user_data', JSON.stringify(downloadResult.userData)],
        ['authenticatedUser', JSON.stringify(downloadResult.userData)],
        ['lastSyncMode', 'cloud_to_local'],
        ['lastDownloadedAt', new Date().toISOString()]
      ]);
      
      // Also add to registered users for offline access
      const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
      let registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
      
      // Remove any existing user with same ID and add the new one
      registeredUsers = registeredUsers.filter(user => user.id !== downloadResult.userData.id);
      registeredUsers.push(downloadResult.userData);
      
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      
      console.log('💾 Cloud user downloaded and saved locally');
      
      dispatch(loginSuccess(downloadResult.userData));
      loadRecentUsers();
      
      Alert.alert(
        'Account Downloaded Successfully!', 
        `Welcome back, ${downloadResult.userData.firstName}! Your account has been downloaded from the cloud.`,
        [{ text: 'Continue', onPress: () => navigation.replace('Main') }]
      );
      
    } else {
      throw new Error(downloadResult.error || 'Download failed');
    }
    
  } catch (error) {
    console.error('❌ Download from cloud error:', error);
    dispatch(loginFailure(error.message));
    Alert.alert('Download Failed', 'Failed to download your account from the cloud. Please try again.');
  }
};

const showCredentialChangeDialog = (localUser, fieldType) => {
  console.log(`📝 Showing credential change dialog for: ${fieldType}`);
  
  Alert.prompt(
    `Choose New ${fieldType === 'email' ? 'Email' : 'Username'}`,
    `Your current ${fieldType} is already taken online. Please enter a new ${fieldType}:`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => proceedWithOfflineLogin(localUser)
      },
      {
        text: 'Update & Sync',
        onPress: async (newValue) => {
          if (!newValue || newValue.trim().length === 0) {
            Alert.alert('Invalid Input', `Please enter a valid ${fieldType}`);
            return;
          }
          
          try {
            console.log(`🔄 Updating ${fieldType} to: ${newValue}`);
            
            const updatedUser = {
              ...localUser,
              [fieldType]: newValue.trim(),
              updatedAt: new Date().toISOString()
            };
            
            // Update local storage
            const registeredUsersJson = await AsyncStorage.getItem('registeredUsers');
            let registeredUsers = registeredUsersJson ? JSON.parse(registeredUsersJson) : [];
            
            const userIndex = registeredUsers.findIndex(u => u.id === localUser.id);
            if (userIndex !== -1) {
              registeredUsers[userIndex] = updatedUser;
              await AsyncStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
            }
            
            // Try sync again with updated credentials
            await syncLocalUserToCloud(updatedUser);
            
          } catch (error) {
            console.error(`❌ Error updating ${fieldType}:`, error);
            Alert.alert('Update Failed', `Failed to update ${fieldType}. Please try again.`);
          }
        }
      }
    ],
    'plain-text',
    localUser[fieldType]
  );
};

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    // Updated to match registration validation
    const phoneRegex = /^[\+]?[0-9][\d]{6,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const getUserInitials = (user) => {
    return `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
      activeOpacity={0.7}>
      <View style={styles.suggestionContent}>
        {item.profileImage ? (
          <Avatar.Image 
            size={40} 
            source={{ uri: item.profileImage }}
            style={styles.suggestionAvatar}
          />
        ) : (
          <Avatar.Text 
            size={40} 
            label={getUserInitials(item)}
            style={styles.suggestionAvatar}
          />
        )}
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.suggestionDetail}>
            {loginMethod === 'phone' ? item.phone : 
             loginMethod === 'email' ? item.email : 
             item.username}
          </Text>
          {item.sport && (
            <Text style={styles.suggestionSport}>{item.sport}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderQuickLoginUser = ({ item }) => (
    <TouchableOpacity
      style={styles.quickLoginItem}
      onPress={() => handleQuickLogin(item)}
      activeOpacity={0.7}>
      {item.profileImage ? (
        <Avatar.Image 
          size={60} 
          source={{ uri: item.profileImage }}
          style={styles.quickLoginAvatar}
        />
      ) : (
        <Avatar.Text 
          size={60} 
          label={getUserInitials(item)}
          style={styles.quickLoginAvatar}
        />
      )}
      <Text style={styles.quickLoginName} numberOfLines={1}>
        {item.firstName}
      </Text>
      {item.sport && (
        <Text style={styles.quickLoginSport} numberOfLines={1}>
          {item.sport}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logoWrapper}>
          <Icon name="flash-on" size={48} color={ENHANCED_COLORS.primary} />
        </View>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        
        {/* Animated Background */}
        <View style={styles.backgroundPattern} />
        
        <View style={styles.content}>
          <Surface style={styles.surface}>
            <View style={styles.logoContainer}>
              <Animated.View 
                style={[
                  styles.logoWrapper,
                  { transform: [{ scale: logoScaleAnim }] }
                ]}>
                {/* Smart logo that shows matched user image or default icon */}
                {matchedUser?.profileImage ? (
                  <Avatar.Image 
                    size={64} 
                    source={{ uri: matchedUser.profileImage }}
                    style={styles.logoUserImage}
                  />
                ) : matchedUser ? (
                  <Avatar.Text 
                    size={64} 
                    label={getUserInitials(matchedUser)}
                    style={[styles.logoUserImage, { backgroundColor: ENHANCED_COLORS.primary }]}
                  />
                ) : (
                  <Icon name="flash-on" size={48} color={ENHANCED_COLORS.primary} />
                )}
              </Animated.View>
              <Text style={styles.title}>
                {matchedUser ? `Welcome Back, ${matchedUser.firstName}!` : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {matchedUser ? 
                  `Continue your ${matchedUser.sport || 'training'} journey` : 
                  'Sign in to continue your training journey'
                }
              </Text>
            </View>

            <View style={styles.formContainer}>
              {/* Authentication Methods Section */}
              {(showGoogleButton || showPhoneButton) && (
                <View style={styles.authMethodsContainer}>
                  <View style={styles.socialButtonsContainer}>
                    {showGoogleButton && (
                      <Button
                        mode="outlined"
                        onPress={handleGoogleSignIn}
                        disabled={detectedAuthMethod && detectedAuthMethod !== 'google' && !availableAuthMethods.includes('google')}
                        style={[
                          styles.socialButton,
                          !availableAuthMethods.includes('google') && detectedAuthMethod ? styles.socialButtonDisabled : null
                        ]}
                        labelStyle={[
                          styles.socialButtonLabel,
                          !availableAuthMethods.includes('google') && detectedAuthMethod ? styles.socialButtonLabelDisabled : null
                        ]}
                        icon="google">
                        Google
                      </Button>
                    )}
                    
                    {showPhoneButton && (
                      <Button
                        mode="outlined"
                        onPress={handlePhoneSignIn}
                        disabled={detectedAuthMethod && detectedAuthMethod !== 'phone' && !availableAuthMethods.includes('phone')}
                        style={[
                          styles.socialButton,
                          !availableAuthMethods.includes('phone') && detectedAuthMethod ? styles.socialButtonDisabled : null
                        ]}
                        labelStyle={[
                          styles.socialButtonLabel,
                          !availableAuthMethods.includes('phone') && detectedAuthMethod ? styles.socialButtonLabelDisabled : null
                        ]}
                        icon="phone">
                        Phone
                      </Button>
                    )}
                  </View>
                  
                  {authMethodMessage && (
                    <Text style={styles.authMethodMessage}>{authMethodMessage}</Text>
                  )}
                  
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>
                </View>
              )}

              {/* Login Method Indicator */}
              {loginMethod && (
                <View style={styles.methodIndicator}>
                  <Chip 
                    icon={getLoginMethodIcon()} 
                    style={styles.methodChip}
                    textStyle={styles.methodChipText}>
                    {getLoginMethodLabel()}
                  </Chip>
                  {matchedUser && (
                    <Chip 
                      icon="star" 
                      style={styles.smartChip}
                      textStyle={styles.smartChipText}>
                      Smart Match
                    </Chip>
                  )}
                </View>
              )}

              {/* Login Input with Suggestions */}
              <View style={styles.inputContainer}>
                <TextInput
                  label={getLoginMethodLabel()}
                  value={loginInput}
                  onChangeText={setLoginInput}
                  mode="outlined"
                  keyboardType={loginMethod === 'phone' ? 'phone-pad' : loginMethod === 'email' ? 'email-address' : 'default'}
                  autoCapitalize={loginMethod === 'email' ? 'none' : 'words'}
                  autoComplete={loginMethod === 'email' ? 'email' : loginMethod === 'phone' ? 'tel' : 'username'}
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
                  outlineStyle={styles.inputOutline}
                  contentStyle={styles.inputContent}
                  right={loginInput.length > 0 ? (
                    <TextInput.Icon 
                      icon={userExists === true ? "check-circle" : userExists === false ? "close-circle" : "close"} 
                      iconColor={userExists === true ? ENHANCED_COLORS.success : userExists === false ? ENHANCED_COLORS.error : ENHANCED_COLORS.onSurfaceVariant}
                      onPress={() => {
                        if (userExists !== null) {
                          return;
                        }
                        setLoginInput('');
                        setShowSuggestions(false);
                        setMatchedUser(null);
                      }}
                    />
                  ) : null}
                />

                {showUserNotFound && (
                  <Text style={styles.helperTextError}>
                    User not found. Please check your {loginMethod || 'credentials'} or create an account.
                  </Text>
                )}

                {/* Enhanced Suggestions List */}
                {showSuggestions && suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <FlatList
                      data={suggestions}
                      keyExtractor={(item, index) => `suggestion-${item.id || item.email}-${index}`}
                      renderItem={renderSuggestion}
                      style={styles.suggestionsList}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    />
                  </View>
                )}
              </View>

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="password"
                style={[
                  styles.input,
                  detectedAuthMethod && detectedAuthMethod !== 'email' && !availableAuthMethods.includes('email')
                    ? styles.inputDisabled
                    : null
                ]}
                error={showPasswordMismatch}
                placeholder={
                  detectedAuthMethod && detectedAuthMethod !== 'email' && !availableAuthMethods.includes('email')
                    ? `Use ${detectedAuthMethod === 'google' ? 'Google' : 'Phone'} Sign-In button above`
                    : matchedUser && smartAutofillEnabled 
                      ? "Password auto-filled" 
                      : "Enter your password"
                }
                theme={{
                  colors: {
                    primary: ENHANCED_COLORS.inputBorderFocused,
                    onSurface: ENHANCED_COLORS.inputText,
                    onSurfaceVariant: ENHANCED_COLORS.inputPlaceholder,
                    outline: ENHANCED_COLORS.inputBorder,
                    background: ENHANCED_COLORS.inputBackground,
                  },
                }}
                outlineStyle={styles.inputOutline}
                contentStyle={styles.inputContent}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : passwordMatch === true ? "eye" : passwordMatch === false ? "eye-off" : "eye"} 
                    iconColor={passwordMatch === true ? ENHANCED_COLORS.success : passwordMatch === false ? ENHANCED_COLORS.error : ENHANCED_COLORS.onSurfaceVariant}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />

              {showPasswordMismatch && (
                <View style={styles.passwordMismatchContainer}>
                  <Text style={styles.helperTextError}>
                    Password doesn't match. 
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('ForgotPassword', { 
                      suggestedEmail: loginInput, 
                      suggestedUser: matchedUser 
                    })}
                  >
                    <Text style={styles.recoverPasswordText}>Recover password instead?</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Smart autofill indicator */}
              {matchedUser && smartAutofillEnabled && (
                <View style={styles.smartAutofillIndicator}>
                  <Icon name="auto-awesome" size={16} color={ENHANCED_COLORS.success} />
                  <Text style={styles.smartAutofillText}>
                    Smart login enabled for {matchedUser.firstName}
                  </Text>
                </View>
              )}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon="login">
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <View style={styles.divider}>
                <Text style={styles.dividerText}>Don't have an account?</Text>
              </View>

              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Register')}
                style={styles.registerButton}
                labelStyle={styles.registerButtonLabel}
                icon="account-plus">
                Create Account
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('ForgotPassword', { 
                  suggestedEmail: loginInput, 
                  suggestedUser: matchedUser 
                })}
                style={styles.forgotButton}
                labelStyle={styles.forgotButtonLabel}
                icon="lock-reset"
              >
                Forgot Password?
              </Button>
            </View>
          </Surface>

          {/* Enhanced Quick Login Section - Horizontal Scroll with Arrows */}
          {recentUsers.length > 0 && !showSuggestions && loginInput.length === 0 && (
            <Surface style={styles.quickLoginSection}>
              <View style={styles.quickLoginHeader}>
                {showLeftArrow && (
                  <TouchableOpacity 
                    style={[styles.arrowButton, styles.leftArrow]}
                    onPress={() => scrollQuickLogin('left')}>
                    <Icon name="chevron-left" size={24} color={ENHANCED_COLORS.primary} />
                  </TouchableOpacity>
                )}
                <Text style={styles.quickLoginTitle}>Quick Login</Text>
                {showRightArrow && (
                  <TouchableOpacity 
                    style={[styles.arrowButton, styles.rightArrow]}
                    onPress={() => scrollQuickLogin('right')}>
                    <Icon name="chevron-right" size={24} color={ENHANCED_COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>
              <FlatList
                ref={quickLoginScrollRef}
                data={recentUsers}
                keyExtractor={(item, index) => `quicklogin-${item.id || item.email}-${index}`}
                renderItem={renderQuickLoginUser}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickLoginContainer}
                ItemSeparatorComponent={() => <View style={{ width: SPACING.md }} />}
                onScroll={handleQuickLoginScroll}
                scrollEventThrottle={16}
              />
            </Surface>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ENHANCED_COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ENHANCED_COLORS.background,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    color: ENHANCED_COLORS.onSurfaceVariant,
    marginTop: SPACING.md,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
    minHeight: screenHeight,
  },
  helperTextError: {
    color: ENHANCED_COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
    fontWeight: '400',
  },
  passwordMismatchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 12,
  },
  recoverPasswordText: {
    color: ENHANCED_COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textDecorationLine: 'underline',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ENHANCED_COLORS.background,
    ...(Platform.OS === 'web' && {
      backgroundImage: `
        radial-gradient(circle at 20% 20%, ${ENHANCED_COLORS.primaryDark}10 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, ${ENHANCED_COLORS.primary}08 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${ENHANCED_COLORS.primaryDark}06 0%, transparent 50%)
      `,
      backgroundSize: '600px 600px',
    }),
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start', // Changed from 'center'
    padding: SPACING.md,
    paddingTop: Platform.OS === 'web' ? SPACING.md : SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  surface: {
    padding: SPACING.lg, // Reduced from SPACING.xl
    borderRadius: 24,
    elevation: 8,
    backgroundColor: ENHANCED_COLORS.surface,
    flex: 1,
    maxHeight: screenHeight * 0.85, // Add max height constraint
    ...(Platform.OS === 'web' && {
      boxShadow: `0 20px 60px ${ENHANCED_COLORS.shadow}`,
    }),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${ENHANCED_COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  logoUserImage: {
    borderRadius: 40,
  },
  title: {
    ...TEXT_STYLES.h1,
    textAlign: 'center',
    color: ENHANCED_COLORS.primary,
    marginBottom: SPACING.sm,
    fontWeight: '700',
  },
  subtitle: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: ENHANCED_COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
    flex: 1,
  },
  methodIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm, // Reduced from SPACING.md
    flexWrap: 'wrap',
  },
  methodChip: {
    backgroundColor: `${ENHANCED_COLORS.primary}12`,
    marginRight: SPACING.sm,
    borderColor: `${ENHANCED_COLORS.primary}20`,
    borderWidth: 1,
  },
  methodChipText: {
    color: ENHANCED_COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  smartChip: {
    backgroundColor: `${ENHANCED_COLORS.success}12`,
    borderColor: `${ENHANCED_COLORS.success}20`,
    borderWidth: 1,
  },
  smartChipText: {
    color: ENHANCED_COLORS.success,
    fontWeight: '600',
    fontSize: 12,
  },
  inputContainer: {
    position: 'relative',
    zIndex: 1000,
    marginBottom: SPACING.sm, // Reduced spacing
  },
  input: {
    marginBottom: SPACING.sm,
    backgroundColor: ENHANCED_COLORS.inputBackground,
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ENHANCED_COLORS.inputBorder,
  },
  inputContent: {
    color: ENHANCED_COLORS.inputText,
    fontSize: 16,
    paddingHorizontal: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: ENHANCED_COLORS.surface,
    borderRadius: 12,
    elevation: 12,
    maxHeight: Math.min(200, screenHeight * 0.25), // Responsive max height
    zIndex: 1001,
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.border,
    ...(Platform.OS === 'web' && {
      boxShadow: `0 12px 40px ${ENHANCED_COLORS.shadow}`,
    }),
  },
  suggestionsList: {
    borderRadius: 12,
  },
  suggestionItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: ENHANCED_COLORS.divider,
    backgroundColor: ENHANCED_COLORS.surface,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionAvatar: {
    backgroundColor: ENHANCED_COLORS.primary,
  },
  suggestionTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  suggestionName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: ENHANCED_COLORS.onSurface,
    fontSize: 15,
  },
  suggestionDetail: {
    ...TEXT_STYLES.caption,
    color: ENHANCED_COLORS.onSurfaceVariant,
    marginTop: 2,
    fontSize: 13,
  },
  suggestionSport: {
    ...TEXT_STYLES.caption,
    color: ENHANCED_COLORS.primary,
    fontStyle: 'italic',
    marginTop: 1,
    fontSize: 12,
  },
  smartAutofillIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${ENHANCED_COLORS.success}10`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: `${ENHANCED_COLORS.success}20`,
  },
  smartAutofillText: {
    ...TEXT_STYLES.caption,
    color: ENHANCED_COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: '600',
    fontSize: 13,
  },
  loginButton: {
    marginTop: SPACING.sm, // Reduced from SPACING.md
    backgroundColor: ENHANCED_COLORS.primary,
    borderRadius: 12,
    elevation: 2,
    ...(Platform.OS === 'web' && {
      boxShadow: `0 4px 12px ${ENHANCED_COLORS.primary}30`,
    }),
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  divider: {
    alignItems: 'center',
    marginVertical: SPACING.sm, // Reduced from SPACING.lg
  },
  dividerText: {
    ...TEXT_STYLES.body,
    color: ENHANCED_COLORS.onSurfaceVariant,
    fontSize: 14,
  },
  registerButton: {
    borderColor: ENHANCED_COLORS.primary,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  registerButtonLabel: {
    color: ENHANCED_COLORS.primary,
    fontWeight: '600',
  },
  forgotButton: {
    marginTop: SPACING.md,
  },
  forgotButtonLabel: {
    color: ENHANCED_COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  quickLoginSection: {
    marginTop: SPACING.md, // Reduced from SPACING.lg
    padding: SPACING.md, // Reduced from SPACING.lg
    borderRadius: 20,
    elevation: 6,
    backgroundColor: ENHANCED_COLORS.surface,
    maxHeight: screenHeight * 0.2, // Add height constraint
    ...(Platform.OS === 'web' && {
      boxShadow: `0 8px 24px ${ENHANCED_COLORS.shadow}`,
    }),
  },
  authMethodsContainer: {
    marginBottom: SPACING.sm, // Reduced spacing
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm, // Reduced spacing
  },
  socialButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderColor: ENHANCED_COLORS.primary,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm, // Reduced spacing
  },
  quickLoginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  arrowButton: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${ENHANCED_COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  leftArrow: {
    left: 0,
  },
  rightArrow: {
    right: 0,
  },
  quickLoginTitle: {
    ...TEXT_STYLES.h3,
    color: ENHANCED_COLORS.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  quickLoginContainer: {
    paddingHorizontal: SPACING.sm,
  },
  quickLoginItem: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 16,
    backgroundColor: ENHANCED_COLORS.surfaceVariant,
    minWidth: 80,
    maxWidth: 100,
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.border,
  },
  quickLoginAvatar: {
    backgroundColor: ENHANCED_COLORS.primary,
    marginBottom: SPACING.xs,
  },
  quickLoginName: {
    ...TEXT_STYLES.caption,
    color: ENHANCED_COLORS.onSurface,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },
  quickLoginSport: {
    ...TEXT_STYLES.caption,
    color: ENHANCED_COLORS.onSurfaceVariant,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  conflictModal: {
    backgroundColor: ENHANCED_COLORS.surface,
    padding: SPACING.xl,
    borderRadius: 20,
    margin: SPACING.lg,
    elevation: 10,
    ...(Platform.OS === 'web' && {
      boxShadow: `0 20px 60px ${ENHANCED_COLORS.shadow}`,
    }),
  },
  conflictTitle: {
    ...TEXT_STYLES.h2,
    color: ENHANCED_COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: '700',
  },
  conflictDescription: {
    ...TEXT_STYLES.body,
    color: ENHANCED_COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  conflictItem: {
    backgroundColor: ENHANCED_COLORS.surfaceVariant,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: ENHANCED_COLORS.border,
  },
  conflictField: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: ENHANCED_COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  conflictValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conflictValue: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 8,
    marginHorizontal: SPACING.xs,
  },
  conflictValueLocal: {
    backgroundColor: `${ENHANCED_COLORS.primary}10`,
    borderColor: `${ENHANCED_COLORS.primary}30`,
    borderWidth: 1,
  },
  conflictValueFirebase: {
    backgroundColor: `${ENHANCED_COLORS.success}10`,
    borderColor: `${ENHANCED_COLORS.success}30`,
    borderWidth: 1,
  },
  conflictValueText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    fontWeight: '500',
  },
  conflictButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  conflictButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
  },
  authMethodsContainer: {
  marginBottom: SPACING.lg,
},
socialButtonsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: SPACING.md,
},
socialButton: {
  flex: 1,
  marginHorizontal: SPACING.xs,
  borderColor: ENHANCED_COLORS.primary,
  borderRadius: 12,
  borderWidth: 1.5,
},
socialButtonDisabled: {
  borderColor: ENHANCED_COLORS.onSurfaceDisabled,
  opacity: 0.5,
},
socialButtonLabel: {
  color: ENHANCED_COLORS.primary,
  fontWeight: '600',
  fontSize: 14,
},
socialButtonLabelDisabled: {
  color: ENHANCED_COLORS.onSurfaceDisabled,
},
authMethodMessage: {
  ...TEXT_STYLES.caption,
  color: ENHANCED_COLORS.primary,
  textAlign: 'center',
  fontWeight: '600',
  fontSize: 13,
  marginBottom: SPACING.sm,
  backgroundColor: `${ENHANCED_COLORS.primary}10`,
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.sm,
  borderRadius: 8,
},
dividerContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: SPACING.md,
},
dividerLine: {
  flex: 1,
  height: 1,
  backgroundColor: ENHANCED_COLORS.border,
},
inputDisabled: {
  opacity: 0.6,
  backgroundColor: ENHANCED_COLORS.surfaceVariant,
},
});

export default LoginScreen;