// src/components/auth/AuthMethodSelection.js
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import NetworkStatus from './NetworkStatus';
import useNetworkStatus from '../../hooks/useNetworkStatus';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleAuth } from '../../config/googleAuth';

// SOLUTION 1: Configure WebBrowser for proper popup handling
WebBrowser.maybeCompleteAuthSession();

/**
 * Enhanced AuthMethodSelection Component with Fixed Expo Google OAuth Integration
 */
const AuthMethodSelection = ({ 
  navigation, 
  onMethodSelect, 
  selectedMethod, 
  onNext,
  onBack,
  theme = 'light',
  showNetworkStatus = true 
}) => {
  const { isOnline, canUseOnlineFeatures, isInitialized } = useNetworkStatus();
  const [localSelection, setLocalSelection] = useState(selectedMethod || null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);
  
  const shouldProcessResponse = useRef(false);

  const [request, response, promptAsync] = useGoogleAuth();

  console.log('🔍 MOBILE DEBUG - Google Auth initialized:', {
    platform: Platform.OS,
    requestReady: !!request
  });
  
  const scaleAnims = {
    email: React.useRef(new Animated.Value(1)).current,
    google: React.useRef(new Animated.Value(1)).current,
    phone: React.useRef(new Animated.Value(1)).current,
  };

  // Authentication method configurations
  const authMethods = [
    {
      id: 'email',
      name: 'Email',
      title: 'Continue with Email',
      description: 'Create account using email and password',
      icon: '📧',
      requiresInternet: false,
      available: true,
      advantages: ['Works offline', 'Quick setup', 'Most secure'],
      color: '#1976D2',
      gradientColors: ['#1976D2', '#1565C0'],
    },
    {
      id: 'google',
      name: 'Google',
      title: 'Continue with Google',
      description: 'Use your existing Google account',
      icon: '🔐',
      requiresInternet: true,
      available: canUseOnlineFeatures && !!request,
      advantages: ['Quick sign-up', 'Auto-fill info', 'Secure'],
      color: '#DB4437',
      gradientColors: ['#DB4437', '#C23321'],
      unavailableReason: 'Requires internet connection'
    },
    {
      id: 'phone',
      name: 'Phone',
      title: 'Continue with Phone',
      description: 'Verify using SMS code',
      icon: '📱',
      requiresInternet: true,
      available: canUseOnlineFeatures,
      advantages: ['SMS verification', 'Quick access', 'Secure'],
      color: '#4CAF50',
      gradientColors: ['#4CAF50', '#388E3C'],
      unavailableReason: 'Requires internet connection for SMS'
    },
  ];

  // SOLUTION 6: Improved response handling with error recovery
useEffect(() => {
  if (!response) {
    return;
  }

  // Always process the response, don't rely on shouldProcessResponse flag
  console.log('Processing Google Auth Response:', response.type, response);

  const handleResponse = async () => {
    try {
      if (response.type === 'success') {
        console.log('✅ Google Auth Success:', response.authentication);
        await handleGoogleAuthSuccess(response.authentication);
      } else if (response.type === 'error') {
        console.error('❌ Google Auth Error:', response.error);
        setGoogleLoading(false);
        
        if (response.error?.code === 'popup_blocked') {
          Alert.alert('Popup Blocked', 'Please allow popups for this site and try again.');
        } else if (response.error?.code === 'network_error') {
          Alert.alert('Network Error', 'Please check your internet connection and try again.');
        } else {
          Alert.alert('Authentication Error', response.error?.message || 'Google sign-in failed. Please try again.');
        }
      } else if (response.type === 'cancel') {
        console.log('⚠️ Google Auth Cancelled');
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error('Error processing Google Auth response:', error);
      setGoogleLoading(false);
      Alert.alert('Authentication Error', 'Failed to process authentication. Please try again.');
    }
  };

  handleResponse();
}, [response]); // Remove shouldProcessResponse dependency

  // Generate username helper
  const generateUsername = useCallback((firstName, lastName) => {
    const base = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    const random = Math.floor(Math.random() * 999);
    return `${base}${random}`;
  }, []);

  // Handle successful Google authentication
const handleGoogleAuthSuccess = async (authentication) => {
  try {
    console.log('Processing Google authentication success...');
    
    if (!authentication?.accessToken) {
      throw new Error('No access token received from Google');
    }
    
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
      const errorText = await userInfoResponse.text();
      throw new Error(`Failed to fetch user info: ${userInfoResponse.status} - ${errorText}`);
    }
    
    const userInfo = await userInfoResponse.json();
    console.log('✅ Google User Info received:', userInfo);
    
    // Check if email already exists in local storage
    try {
      const existingUsersJson = await AsyncStorage.getItem('registeredUsers');
      const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];
      
      const existingUser = existingUsers.find(user => 
        user.email.toLowerCase() === userInfo.email.toLowerCase()
      );
      
      if (existingUser) {
        Alert.alert(
          'Account Already Exists',
          `An account with email ${userInfo.email} already exists. Please sign in instead.`,
          [
            { text: 'Cancel', onPress: () => setGoogleLoading(false) },
            { 
              text: 'Go to Sign In', 
              onPress: () => {
                setGoogleLoading(false);
                if (navigation) {
                  navigation.navigate('LoginScreen');
                }
              }
            }
          ]
        );
        return;
      }
    } catch (storageError) {
      console.warn('Could not check existing users:', storageError.message);
    }
    
    const googleUserData = {
      authMethod: 'google',
      email: userInfo.email,
      firstName: userInfo.given_name || '',
      lastName: userInfo.family_name || '',
      profileImage: userInfo.picture || '',
      googleId: userInfo.id,
      idToken: authentication.idToken,
      accessToken: authentication.accessToken,
      emailVerified: userInfo.verified_email || true,
      username: generateUsername(userInfo.given_name || '', userInfo.family_name || ''),
      phone: '',
      sport: '',
      userType: 'PLAYER',
      customRole: '',
      dateOfBirth: '',
      emailOptIn: true,
      requiresOfflinePassword: true
    };
    
    console.log('✅ Processed Google User Data:', googleUserData);
    
    setGoogleLoading(false);
    
    // Call parent callback with Google data - THIS IS THE KEY FIX
    // Call parent callback with Google data
    if (onMethodSelect) {
      const result = onMethodSelect({
        id: 'google',
        userData: googleUserData
      });
      
      // Check if parent handled auto-advance
      if (result && result.autoAdvance) {
        // Parent will handle navigation, don't call onNext here
        Alert.alert(
          'Google Sign-In Successful',
          `Welcome ${userInfo.name || userInfo.email}! Your information has been pre-filled.`,
          [{ text: 'Continue' }]
        );
        return;
      }
    }

    // Fallback: manual advance
    Alert.alert(
      'Google Sign-In Successful',
      `Welcome ${userInfo.name || userInfo.email}! Your information has been pre-filled. Please continue to complete your profile.`,
      [{ 
        text: 'Continue', 
        onPress: () => {
          if (onNext) {
            onNext();
          }
        }
      }]
    );
    
  } catch (error) {
    console.error('❌ Error processing Google authentication:', error);
    setGoogleLoading(false);
    
    Alert.alert(
      'Authentication Error', 
      'Failed to process Google sign-in. Please try again or use email registration.'
    );
  }
};

  // SOLUTION 7: Enhanced Google authentication handler with retry logic
const handleGoogleAuth = async () => {
  console.log('🔄 Google auth button pressed');
  
  if (!canUseOnlineFeatures) {
    Alert.alert('No Internet Connection', 'Google Sign-In requires an internet connection.');
    return;
  }

  if (!request) {
    Alert.alert('Google Sign-In Not Ready', 'Google authentication is still loading. Please try again in a moment.');
    return;
  }

  try {
    setGoogleLoading(true);
    setLocalSelection('google');
    
    console.log('🚀 Triggering Google auth prompt...');
    
    const result = await promptAsync();
    
    console.log('📥 Google auth result received:', result?.type);
    
    // The response will be handled by useEffect above
    
  } catch (error) {
    console.error('❌ Google Sign-In Error:', error);
    setGoogleLoading(false);
    
    let errorMessage = 'Failed to initiate Google sign-in. Please try again.';
    
    if (error.message?.includes('popup')) {
      errorMessage = 'Please allow popups and try again.';
    } else if (error.message?.includes('network')) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    Alert.alert('Sign-In Failed', errorMessage);
  }
};

  // Phone authentication handler (placeholder for SMS verification)
  const handlePhoneAuth = useCallback(async () => {
    if (!canUseOnlineFeatures) {
      Alert.alert(
        'No Internet Connection',
        'Phone verification requires an internet connection.',
        [{ text: 'OK' }]
      );
      return;
    }

    setPhoneLoading(true);
    
    try {
      setLocalSelection('phone');
      
      Alert.alert(
        'Phone Verification',
        'You will be prompted to verify your phone number in the next step.',
        [
          {
            text: 'Continue',
            onPress: () => {
              if (onMethodSelect) {
                onMethodSelect({
                  id: 'phone',
                  userData: { authMethod: 'phone' },
                  autoAdvance: true
                });
              }
              
              setTimeout(() => {
                if (onNext) {
                  onNext();
                }
              }, 300);
            }
          }
        ]
      );

    } catch (error) {
      Alert.alert('Error', 'Phone verification setup failed. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  }, [canUseOnlineFeatures, onMethodSelect, onNext]);

  // Method selection handler
  const handleMethodPress = useCallback((method) => {
    if (!method.available) {
      Alert.alert(
        'Feature Unavailable',
        method.unavailableReason || 'This authentication method is not currently available.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (method.id === 'google') {
      handleGoogleAuth();
    } else if (method.id === 'phone') {
      handlePhoneAuth();
    } else {
      // For email, just select and proceed
      setLocalSelection(method.id);
      
      if (onMethodSelect) {
        onMethodSelect(method);
      }
      
      // Auto-advance to next step after selection
      setTimeout(() => {
        if (onNext) {
          onNext();
        }
      }, 300);
    }
  }, [handleGoogleAuth, handlePhoneAuth, onMethodSelect, onNext]);

  // Continue button handler
  const handleNext = useCallback(() => {
    if (!localSelection) {
      Alert.alert(
        'Selection Required',
        'Please choose how you\'d like to create your account.',
        [{ text: 'OK' }]
      );
      return;
    }

    const selectedMethodObj = authMethods.find(m => m.id === localSelection);
    
    if (!selectedMethodObj?.available) {
      Alert.alert(
        'Method Unavailable',
        'The selected authentication method is currently unavailable. Please choose a different option.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (onNext) {
      onNext();
    }
  }, [localSelection, onNext, authMethods]);

  // Back button handler
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation, onBack]);

  const renderMethodCard = (method) => {
    const isSelected = localSelection === method.id;
    const isAvailable = method.available && isInitialized;
    const isLoading = (method.id === 'google' && googleLoading) || 
                     (method.id === 'phone' && phoneLoading);
    
    return (
      <Animated.View
        key={method.id}
        style={[
          styles.methodCard,
          isSelected && styles.selectedCard,
          !isAvailable && styles.disabledCard,
          theme === 'dark' && styles.darkCard,
          { transform: [{ scale: scaleAnims[method.id] }] }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleMethodPress(method)}
          style={styles.cardTouchable}
          disabled={!isAvailable || isLoading}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: isAvailable ? method.color : '#BDBDBD' }
            ]}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.methodIcon}>{method.icon}</Text>
              )}
            </View>
            
            <View style={styles.methodInfo}>
              <Text style={[
                styles.methodTitle,
                theme === 'dark' && styles.darkText,
                !isAvailable && styles.disabledText
              ]}>
                {method.title}
              </Text>
              <Text style={[
                styles.methodDescription,
                theme === 'dark' && styles.darkSecondaryText,
                !isAvailable && styles.disabledSecondaryText
              ]}>
                {isLoading ? 'Connecting...' : method.description}
              </Text>
            </View>

            <View style={styles.selectionIndicator}>
              {isSelected && !isLoading && (
                <View style={[styles.selectedIndicator, { backgroundColor: method.color }]}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
              {!isAvailable && method.requiresInternet && (
                <View style={styles.unavailableIndicator}>
                  <Text style={styles.unavailableIcon}>⚠</Text>
                </View>
              )}
            </View>
          </View>

          {/* Advantages */}
          <View style={styles.advantagesContainer}>
            {method.advantages.map((advantage, index) => (
              <View key={index} style={styles.advantageItem}>
                <Text style={[
                  styles.advantageText,
                  theme === 'dark' && styles.darkSecondaryText,
                  !isAvailable && styles.disabledSecondaryText
                ]}>
                  • {advantage}
                </Text>
              </View>
            ))}
          </View>

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={[
                styles.loadingText,
                theme === 'dark' && styles.darkSecondaryText
              ]}>
                {method.id === 'google' ? 'Signing in with Google...' : 'Setting up phone verification...'}
              </Text>
            </View>
          )}

          {/* Unavailable message */}
          {!isAvailable && method.requiresInternet && (
            <View style={styles.unavailableMessage}>
              <Text style={styles.unavailableText}>
                {method.unavailableReason}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[
      styles.container,
      theme === 'dark' && styles.darkContainer
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backIcon, theme === 'dark' && styles.darkText]}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, theme === 'dark' && styles.darkText]}>
            Create Account
          </Text>
          <Text style={[styles.headerSubtitle, theme === 'dark' && styles.darkSecondaryText]}>
            Choose how you'd like to get started
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, theme === 'dark' && styles.darkSecondaryText]}>
          Step 1 of 5
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '20%' }]} />
        </View>
      </View>

      {/* Network Status */}
      {showNetworkStatus && (
        <NetworkStatus 
          style={styles.networkStatus}
          showDetails={!isOnline}
          theme={theme}
        />
      )}

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.methodsContainer}>
          <Text style={[
            styles.sectionTitle, 
            theme === 'dark' && styles.darkText
          ]}>
            Select Authentication Method
          </Text>
          <Text style={[
            styles.sectionSubtitle, 
            theme === 'dark' && styles.darkSecondaryText
          ]}>
            Choose how you want to create and access your account
          </Text>

          {authMethods.map(renderMethodCard)}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={handleNext}
          style={[
            styles.nextButton,
            localSelection && styles.nextButtonActive,
            theme === 'dark' && styles.darkNextButton
          ]}
          disabled={!localSelection}
        >
          <Text style={[
            styles.nextButtonText,
            localSelection && styles.nextButtonTextActive
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles remain exactly the same as your original component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1976D2',
    borderRadius: 2,
  },
  networkStatus: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  methodsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 18,
  },
  methodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCard: {
    borderColor: '#1976D2',
    borderWidth: 2,
    elevation: 4,
    shadowOpacity: 0.15,
  },
  disabledCard: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E0E0E0',
    opacity: 0.7,
  },
  darkCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333333',
  },
  cardTouchable: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodIcon: {
    fontSize: 18,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 12,
    color: '#757575',
    lineHeight: 14,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unavailableIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFA726',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  advantagesContainer: {
    marginBottom: 4,
  },
  advantageItem: {
    marginBottom: 1,
  },
  advantageText: {
    fontSize: 11,
    color: '#666666',
    lineHeight: 13,
  },
  loadingContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#1976D2',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  unavailableMessage: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  unavailableText: {
    fontSize: 13,
    color: '#E65100',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  nextButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#1976D2',
  },
  darkNextButton: {
    backgroundColor: '#333333',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  nextButtonTextActive: {
    color: '#FFFFFF',
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSecondaryText: {
    color: '#B0B0B0',
  },
  disabledText: {
    color: '#9E9E9E',
  },
  disabledSecondaryText: {
    color: '#BDBDBD',
  },
});

export default AuthMethodSelection;