
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Platform,
  TextInput,
} from 'react-native';
import { Card, Button, Chip, Divider, Avatar, Portal, Modal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { COLORS } from '../../../styles/colors';
import React, { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { useNavigation } from '@react-navigation/native';

const PaymentDetails = ({ navigation, route }) => {
  const { paymentId } = route.params;
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
const [recoveryCodes, setRecoveryCodes] = useState([]);
const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
const [recoveryModalVisible, setRecoveryModalVisible] = useState(false);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [editPaymentMethodVisible, setEditPaymentMethodVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('current');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [pinValue, setPinValue] = useState('');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
const [pinError, setPinError] = useState(false);
const [failedAttempts, setFailedAttempts] = useState(0);
const [isLockedOut, setIsLockedOut] = useState(false);
const [lockoutEndTime, setLockoutEndTime] = useState(null);
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000;
const [showPin, setShowPin] = useState(false);
const [lockoutCountdown, setLockoutCountdown] = useState(0);
const [countdownTimer, setCountdownTimer] = useState(null);
const [pinLoading, setPinLoading] = useState(false);
  const [securityModalVisible, setSecurityModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([
    {
      id: 'current',
      type: 'Visa',
      name: 'Credit Card (***532)',
      lastFour: '532',
      lastThree: '532',
      expiryMonth: '**',
      expiryYear: '2027',
      fullCardNumber: '4532123456789532',
      fullExpiryMonth: '12',
      isDefault: true,
      icon: 'credit-card',
    },
    {
      id: 'mpesa',
      type: 'M-Pesa',
      name: 'M-Pesa (***678)',
      phone: '+254712***678',
      fullPhone: '+254712345678',
      isDefault: false,
      icon: 'phone-android',
    },
    {
      id: 'paypal',
      type: 'PayPal',
      name: 'PayPal (j***@example.com)',
      email: 'j***@example.com',
      fullEmail: 'john@example.com',
      isDefault: false,
      icon: 'account-balance',
    },
    {
      id: 'pesapal',
      type: 'PesaPal',
      name: 'PesaPal Wallet',
      isDefault: false,
      icon: 'account-balance-wallet',
    },
    {
      id: 'mastercard',
      type: 'Mastercard',
      name: 'Mastercard (***901)',
      lastFour: '901',
      lastThree: '901',
      expiryMonth: '**',
      expiryYear: '2026',
      fullCardNumber: '5555123456788901',
      fullExpiryMonth: '09',
      isDefault: false,
      icon: 'credit-card',
    },
    {
      id: 'bank_transfer',
      type: 'Bank Transfer',
      name: 'Standard Bank (***4567)',
      accountNumber: '****4567',
      fullAccountNumber: '12344567',
      isDefault: false,
      icon: 'account-balance',
    },
  ]);

// Add platform detection and web-specific authentication
const authenticateUser = async (action) => {

  // Lockout check first
  const lockoutStatus = checkLockoutStatus();
  if (lockoutStatus.isLockedOut) {
    setSecurityModalVisible(true);
    setPendingAction(action);
    return false;
  }

  try {
    if (Platform.OS === 'web') {
      // For web, always use PIN modal
      setSecurityModalVisible(true);
      setPendingAction(action);
      return false;
    }
    
    // For mobile platforms, use expo-local-authentication
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: Platform.OS === 'ios' 
          ? 'Use Face ID, Touch ID, or device passcode to continue'
          : 'Use fingerprint, face unlock, PIN, or pattern to continue',
        fallbackLabel: Platform.OS === 'ios' ? 'Use Passcode' : 'Use PIN/Pattern',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        setIsAuthenticated(true);
        if (action === 'viewSensitive') {
          setShowSensitiveInfo(true);
        } else if (action === 'edit') {
          setEditPaymentMethodVisible(true);
        }
        return true;
      } else {
        // Fallback to PIN modal
        setSecurityModalVisible(true);
        setPendingAction(action);
        return false;
      }
    } else {
      // No biometric hardware, use PIN modal
      setSecurityModalVisible(true);
      setPendingAction(action);
      return false;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    setSecurityModalVisible(true);
    setPendingAction(action);
    return false;
  }
};

//Forgot Pin function
const handleForgotPin = () => {
  Alert.alert(
    'Reset PIN',
    'Choose a recovery method:',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Use Recovery Code', 
        onPress: () => handleAccountRecovery()
      },
    ]
  );
};

// Function to set up user PIN (call this when user first sets up security)
const setUserPin = async (newPin) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('userPin', newPin);
      return true;
    } else {
      await SecureStore.setItemAsync('userPin', newPin);
      return true;
    }
  } catch (error) {
    console.error('Error storing PIN:', error);
    return false;
  }
};

// Updated handlePinAuthentication function
const handlePinAuthentication = async (pin) => {
  // Check lockout status first
  const lockoutStatus = checkLockoutStatus();
  if (lockoutStatus.isLockedOut) {
    Alert.alert(
      'Account Temporarily Locked', 
      `Too many failed attempts. Please try again in ${lockoutStatus.remainingMinutes} minute(s).`
    );
    return;
  }

  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    setPinError(true);
    return;
  }

  setPinLoading(true);
  
  try {
    const storedPin = await getStoredPin();
    const isFirstTimeSetup = !storedPin;
    
    if (isFirstTimeSetup) {
      const strengthCheck = validatePinStrength(pin);
      if (!strengthCheck.isValid) {
        Alert.alert('Weak PIN', strengthCheck.message);
        setPinError(true);
        setPinValue('');
        setPinLoading(false);
        return;
      }

      const result = await setUserPinWithRecovery(pin);
if (result.success) {
  Alert.alert('PIN Set', 'Your security PIN has been set successfully.');
        setIsAuthenticated(true);
        setSecurityModalVisible(false);
        setPinValue('');
        setPinError(false);
        
        if (pendingAction === 'viewSensitive') {
          setShowSensitiveInfo(true);
        } else if (pendingAction === 'edit') {
          setEditPaymentMethodVisible(true);
        }
        setPendingAction(null);
      } else {
        Alert.alert('Error', 'Failed to set PIN. Please try again.');
        setPinError(true);
        setPinValue('');
      }
    } else {
      if (pin === storedPin) {
        setFailedAttempts(0);
        setIsAuthenticated(true);
        setSecurityModalVisible(false);
        setPinValue('');
        setPinError(false);
        
        if (pendingAction === 'viewSensitive') {
          setShowSensitiveInfo(true);
        } else if (pendingAction === 'edit') {
          setEditPaymentMethodVisible(true);
        }
        setPendingAction(null);
      } else {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      setPinError(true);
      setPinValue('');
      
      if (newFailedAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION;
        setLockoutEndTime(lockoutTime);
        setIsLockedOut(true);
        startLockoutCountdown(lockoutTime);
        // Don't close modal - show lockout state instead
      } else {
        const attemptsLeft = MAX_ATTEMPTS - newFailedAttempts;
        Alert.alert(
          'Incorrect PIN', 
          `The PIN you entered is incorrect. ${attemptsLeft} attempt(s) remaining.`
        );
      }
    }
    }
  } catch (error) {
    console.error('PIN authentication error:', error);
    Alert.alert('Error', 'Authentication failed. Please try again.');
    setPinError(true);
    setPinValue('');
  } finally {
    setPinLoading(false);
  }
};

const getStoredPin = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('userPin'); // Returns null if not set
    } else {
      const storedPin = await SecureStore.getItemAsync('userPin');
      return storedPin; // Returns null if not set
    }
  } catch (error) {
    console.error('Error getting stored PIN:', error);
    return null;
  }
};

const validatePinStrength = (pin) => {
  const weakPins = ['0000', '1111', '1234', '4321', '2580', '1212', '3333', '5555', '7777', '9999'];
  if (weakPins.includes(pin)) {
    return { isValid: false, message: 'Please choose a less predictable PIN' };
  }
  return { isValid: true };
};

const checkLockoutStatus = () => {
  if (lockoutEndTime && Date.now() < lockoutEndTime) {
    const remainingTime = Math.ceil((lockoutEndTime - Date.now()) / (60 * 1000));
    return { 
      isLockedOut: true, 
      remainingMinutes: remainingTime,
      lockoutEndTime: lockoutEndTime
    };
  }
  if (lockoutEndTime && Date.now() >= lockoutEndTime) {
    setIsLockedOut(false);
    setLockoutEndTime(null);
    setFailedAttempts(0);
  }
  return { isLockedOut: false };
};

// Generate recovery codes during PIN setup
const generateRecoveryCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    // Generate more secure codes
    const code = Math.random().toString(36).substring(2, 8).toUpperCase() + 
                 Math.random().toString(36).substring(2, 4).toUpperCase();
    codes.push(code);
  }
  return codes;
};

// Generate device fingerprint
const generateDeviceFingerprint = async () => {
  try {
    let deviceId;
    
    if (Platform.OS === 'web') {
      // For web, create a persistent identifier
      deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = 'web_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('deviceId', deviceId);
      }
    } else {
      // For mobile, use device-specific identifiers
      deviceId = Application.androidId || Device.osInternalBuildId || 
                 Math.random().toString(36).substring(2, 15);
    }

    const fingerprint = {
      deviceId,
      deviceName: Device.deviceName || 'Unknown Device',
      osName: Device.osName || Platform.OS,
      osVersion: Device.osVersion || 'Unknown',
      appVersion: Application.nativeApplicationVersion || '1.0.0',
      platform: Platform.OS,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };

    return fingerprint;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    return {
      deviceId: 'fallback_' + Math.random().toString(36).substring(2, 15),
      deviceName: 'Unknown Device',
      platform: Platform.OS,
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
  }
};

// Store recovery data securely
const storeRecoveryData = async (pin, codes, deviceFingerprint) => {
  try {
    const recoveryData = {
      recoveryCodes: codes,
      usedCodes: [],
      deviceFingerprint,
      createdAt: Date.now()
    };

    if (Platform.OS === 'web') {
      localStorage.setItem('recoveryData', JSON.stringify(recoveryData));
      return true;
    } else {
      await SecureStore.setItemAsync('recoveryData', JSON.stringify(recoveryData));
      return true;
    }
  } catch (error) {
    console.error('Error storing recovery data:', error);
    return false;
  }
};

// Get stored recovery data
const getRecoveryData = async () => {
  try {
    let recoveryData;
    
    if (Platform.OS === 'web') {
      recoveryData = localStorage.getItem('recoveryData');
    } else {
      recoveryData = await SecureStore.getItemAsync('recoveryData');
    }

    return recoveryData ? JSON.parse(recoveryData) : null;
  } catch (error) {
    console.error('Error getting recovery data:', error);
    return null;
  }
};

// Check if current device is trusted
const isCurrentDeviceTrusted = async () => {
  try {
    const currentFingerprint = await generateDeviceFingerprint();
    const recoveryData = await getRecoveryData();
    
    if (!recoveryData || !recoveryData.deviceFingerprint) {
      return false;
    }

    // Check if device ID matches
    return currentFingerprint.deviceId === recoveryData.deviceFingerprint.deviceId;
  } catch (error) {
    console.error('Error checking trusted device:', error);
    return false;
  }
};

// Validate recovery code
const validateRecoveryCode = async (inputCode) => {
  try {
    const recoveryData = await getRecoveryData();
    
    if (!recoveryData) {
      return { isValid: false, message: 'No recovery data found' };
    }

    const { recoveryCodes, usedCodes } = recoveryData;
    const normalizedInput = inputCode.toUpperCase().trim();

    // Check if code exists and hasn't been used
    if (!recoveryCodes.includes(normalizedInput)) {
      return { isValid: false, message: 'Invalid recovery code' };
    }

    if (usedCodes.includes(normalizedInput)) {
      return { isValid: false, message: 'Recovery code already used' };
    }

    // Mark code as used
    const updatedRecoveryData = {
      ...recoveryData,
      usedCodes: [...usedCodes, normalizedInput]
    };

    if (Platform.OS === 'web') {
      localStorage.setItem('recoveryData', JSON.stringify(updatedRecoveryData));
    } else {
      await SecureStore.setItemAsync('recoveryData', JSON.stringify(updatedRecoveryData));
    }

    return { isValid: true, message: 'Recovery code validated successfully' };
  } catch (error) {
    console.error('Error validating recovery code:', error);
    return { isValid: false, message: 'Error validating recovery code' };
  }
};

// Updated PIN setup function
const setUserPinWithRecovery = async (newPin) => {
  try {
    // Generate recovery codes and device fingerprint
    const codes = generateRecoveryCodes();
    const deviceFingerprint = await generateDeviceFingerprint();

    // Store PIN
    const pinStored = await setUserPin(newPin);
    if (!pinStored) {
      return { success: false, message: 'Failed to store PIN' };
    }

    // Store recovery data
    const recoveryStored = await storeRecoveryData(newPin, codes, deviceFingerprint);
    if (!recoveryStored) {
      return { success: false, message: 'Failed to store recovery data' };
    }

    // Show recovery codes to user
    setRecoveryCodes(codes);
    setShowRecoveryCodes(true);

    return { 
      success: true, 
      message: 'PIN and recovery setup completed',
      recoveryCodes: codes 
    };
  } catch (error) {
    console.error('Error setting up PIN with recovery:', error);
    return { success: false, message: 'Setup failed' };
  }
};


// Recovery process handler
const handleAccountRecovery = async () => {
  try {
    // First check if current device is trusted
    const isTrusted = await isCurrentDeviceTrusted();
    
    if (isTrusted) {
      // Allow PIN reset on trusted device
      Alert.alert(
        'Trusted Device Detected',
        'This device is recognized. You can reset your PIN directly.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset PIN', 
            onPress: () => {
              // Clear old PIN and allow new setup
              if (Platform.OS === 'web') {
                localStorage.removeItem('userPin');
              } else {
                SecureStore.deleteItemAsync('userPin');
              }
              setIsFirstTimeSetup(true);
              setSecurityModalVisible(true);
            }
          }
        ]
      );
    } else {
      // Require recovery code for untrusted device
      setRecoveryModalVisible(true);
    }
  } catch (error) {
    console.error('Error in account recovery:', error);
    Alert.alert('Error', 'Account recovery failed. Please try again.');
  }
};

// Recovery code validation handler
const handleRecoveryCodeSubmit = async () => {
  if (!recoveryCodeInput.trim()) {
    Alert.alert('Error', 'Please enter a recovery code');
    return;
  }

  const validation = await validateRecoveryCode(recoveryCodeInput);
  
  if (validation.isValid) {
    // Allow PIN reset
    setRecoveryModalVisible(false);
    setRecoveryCodeInput('');
    
    // Clear old PIN
    if (Platform.OS === 'web') {
      localStorage.removeItem('userPin');
    } else {
      await SecureStore.deleteItemAsync('userPin');
    }
    
    setIsFirstTimeSetup(true);
    setSecurityModalVisible(true);
    
    Alert.alert('Success', 'Recovery code validated. You can now set a new PIN.');
  } else {
    Alert.alert('Invalid Code', validation.message);
    setRecoveryCodeInput('');
  }
};

// Add countdown functionality
const startLockoutCountdown = (endTime) => {
  const updateCountdown = () => {
    const remaining = Math.max(0, endTime - Date.now());
    setLockoutCountdown(remaining);
    
    if (remaining <= 0) {
      setIsLockedOut(false);
      setLockoutEndTime(null);
      setFailedAttempts(0);
      setLockoutCountdown(0);
      if (countdownTimer) {
        clearInterval(countdownTimer);
        setCountdownTimer(null);
      }
    }
  };
  
  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
  setCountdownTimer(timer);
};

// Format countdown time
const formatCountdownTime = (milliseconds) => {
  const minutes = Math.floor(milliseconds / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Clear countdown timer on component unmount
useEffect(() => {
  return () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
  };
}, [countdownTimer]);




  // In your SecurityModal component, add this check
useEffect(() => {
  if (securityModalVisible) {
    const lockoutStatus = checkLockoutStatus();
    if (lockoutStatus.isLockedOut) {
      setIsLockedOut(true);
      setLockoutEndTime(lockoutStatus.lockoutEndTime || lockoutEndTime);
      if (lockoutStatus.lockoutEndTime) {
        startLockoutCountdown(lockoutStatus.lockoutEndTime);
      }
    } else {
      setIsLockedOut(false);
      setLockoutEndTime(null);
      setFailedAttempts(0);
    }
  }
}, [securityModalVisible]);

  useEffect(() => {
    loadPaymentDetails();
    checkBiometricSupport();
  }, [paymentId]);

  useEffect(() => {
  const checkSetup = async () => {
    const storedPin = await getStoredPin();
    setIsFirstTimeSetup(!storedPin);
  };
  checkSetup();
}, []);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      console.log('Biometric support:', { hasHardware, isEnrolled });
    } catch (error) {
      console.error('Error checking biometric support:', error);
    }
  };

  const loadPaymentDetails = async () => {
    // Replace with actual API call
    const samplePayment = {
      id: paymentId,
      type: 'Monthly Training Fee',
      childName: 'Alex Johnson',
      childAvatar: 'https://via.placeholder.com/100',
      amount: 250.00,
      currency: 'USD',
      date: '2025-08-01T10:30:00Z',
      dueDate: '2025-08-01T23:59:59Z',
      paidDate: '2025-08-01T10:30:00Z',
      status: 'paid',
      paymentMethod: 'Credit Card (***532)',
      paymentMethodDetails: {
        type: 'Visa',
        lastFour: '532',
        lastThree: '532',
        expiryMonth: '**',
        expiryYear: '2027',
        fullCardNumber: '4532123456789532',
        fullExpiryMonth: '12',
      },
      transactionId: 'TXN-2025080110300001',
      academy: 'Elite Sports Academy',
      academyLogo: 'https://via.placeholder.com/60',
      academyContact: {
        phone: '+1-555-0123',
        email: 'billing@elitesports.com',
        address: '123 Sports Drive, Athletic City, AC 12345',
      },
      program: 'Football Development Program',
      programDetails: {
        duration: '12 weeks',
        sessionsPerWeek: 3,
        startDate: '2025-07-15',
        endDate: '2025-10-15',
      },
      coach: 'Coach Mike Thompson',
      coachContact: '+1-555-0199',
      invoiceNumber: 'INV-2025-0801',
      description: 'Monthly training fee for August 2025',
      breakdown: [
        { item: 'Training Sessions (12 sessions)', amount: 200.00 },
        { item: 'Facility Usage', amount: 30.00 },
        { item: 'Equipment Maintenance', amount: 15.00 },
        { item: 'Insurance', amount: 5.00 },
      ],
      taxes: [
        { name: 'Sales Tax (8.5%)', amount: 21.25 },
      ],
      discounts: [
        { name: 'Early Bird Discount', amount: -21.25 },
      ],
      subtotal: 250.00,
      totalTaxes: 21.25,
      totalDiscounts: -21.25,
      totalAmount: 250.00,
      recurringPayment: {
        isRecurring: true,
        frequency: 'monthly',
        nextPaymentDate: '2025-09-01',
        endDate: '2025-10-01',
      },
      refundPolicy: 'Refunds available up to 7 days before session start date',
      notes: 'Payment received on time. Thank you for your prompt payment.',
      receiptUrl: 'https://example.com/receipt/TXN-2025080110300001',
      invoiceUrl: 'https://example.com/invoice/INV-2025-0801',
    };

    setPayment(samplePayment);
    setLoading(false);
  };

// Replace the PIN input in your modal with device authentication buttons
const UpdatedSecurityModal = () => (
  <Modal visible={securityModalVisible} onDismiss={() => setSecurityModalVisible(false)}>
    <Card style={styles.securityModalCard}>
      <Card.Content>
        <View style={styles.modalHeader}>
          <Icon name="security" size={36} color={COLORS.primary} />
          <Text style={styles.modalTitle}>
            {isFirstTimeSetup ? 'Set Security PIN' : 'Security Verification'}
          </Text>
          <Text style={styles.modalSubtext}>
            {isFirstTimeSetup 
              ? 'Create a 4-digit PIN to secure your payment information. This PIN will be required for future access to sensitive data.'
              : Platform.OS === 'web' 
              ? 'Enter your PIN to continue' 
              : 'Biometric authentication unavailable. Please enter your PIN to continue.'
            }
          </Text>
        </View>
        
        {/* PIN Input with improved visibility */}
        <View style={styles.pinSection}>
          <Text style={styles.pinLabel}>
            {isFirstTimeSetup ? 'Create 4-digit PIN' : 'Enter 4-digit PIN'}
          </Text>

        
        {failedAttempts > 0 && !isFirstTimeSetup && (
          <View style={styles.attemptsWarning}>
            <Icon name="warning" size={18} color="#f39c12" />
            <Text style={styles.attemptsText}>
              {MAX_ATTEMPTS - failedAttempts} attempt(s) remaining
            </Text>
          </View>
        )}
          
          {/* Enhanced PIN Dots Display */}
          <View style={styles.pinDotsContainer}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  index < pinValue.length ? styles.pinDotFilled : styles.pinDotEmpty,
                  pinError && index < pinValue.length && styles.pinDotError
                ]}
              />
            ))}
          </View>
          
          {/* Enhanced PIN Input with better eye positioning */}
          <View style={styles.pinInputContainer}>
            <TextInput
              style={[
                styles.pinInput,
                pinError && styles.pinInputError
              ]}
              placeholder="••••"
              placeholderTextColor="#bdc3c7"
              secureTextEntry={!showPin}
              maxLength={4}
              keyboardType="numeric"
              value={pinValue}
              onChangeText={(text) => {
                // Only allow numeric input
                const numericText = text.replace(/[^0-9]/g, '');
                setPinValue(numericText);
                if (pinError) setPinError(false);
              }}
              autoFocus={true}
              selectTextOnFocus={true}
            />
            <TouchableOpacity
              style={styles.eyeToggle}
              onPress={() => setShowPin(!showPin)}
              activeOpacity={0.7}
            >
              <Icon 
                name={showPin ? "visibility-off" : "visibility"} 
                size={22} 
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>
          
          {pinError && (
            <View style={styles.errorContainer}>
              <Icon name="error" size={18} color={COLORS.error} />
              <Text style={styles.errorText}>
                {isFirstTimeSetup ? 'PIN must be 4 digits' : 'Invalid PIN. Please try again.'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Enhanced Modal Buttons with better visibility for disabled state */}
        <View style={styles.modalButtons}>
          <Button
            mode="outlined"
            onPress={() => {
              setSecurityModalVisible(false);
              setPinValue('');
              setPinError(false);
              setPendingAction(null);
            }}
            style={[styles.modalButton]}
            textColor={COLORS.primary}
            buttonColor="transparent"
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => handlePinAuthentication(pinValue)}
            style={[
              styles.modalButton,
              pinValue.length !== 4 ? styles.disabledButton : styles.enabledButton
            ]}
            disabled={pinValue.length !== 4}
            loading={pinLoading}
            buttonColor={pinValue.length !== 4 ? '#e9ecef' : COLORS.primary}
            textColor={pinValue.length !== 4 ? '#6c757d' : '#ffffff'}
          >
            {isFirstTimeSetup ? 'Set PIN' : 'Verify PIN'}
          </Button>
        </View>
        
        {/* Forgot PIN option with better styling */}
        {!isFirstTimeSetup && (
          <View style={styles.forgotPinSection}>
            <TouchableOpacity onPress={handleForgotPin} activeOpacity={0.7}>
              <Text style={styles.forgotPinText}>Forgot PIN?</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Show biometric retry option only on mobile platforms */}
        {Platform.OS !== 'web' && (
          <View style={styles.alternativeAuth}>
            <Divider style={styles.modalDivider} />
            <Button
              mode="text"
              icon="fingerprint"
              onPress={() => {
                setSecurityModalVisible(false);
                setPinValue('');
                authenticateUser(pendingAction);
              }}
              style={styles.biometricRetryButton}
              textColor={COLORS.primary}
            >
              {Platform.OS === 'ios' 
                ? 'Try Touch ID/Face ID Again' 
                : 'Try Biometric Again'
              }
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  </Modal>
);


// Additional helper function for better PIN validation
const validatePinInput = (text) => {
  // Remove any non-numeric characters
  const numericOnly = text.replace(/[^0-9]/g, '');
  
  // Limit to 4 digits
  return numericOnly.slice(0, 4);
};

// Enhanced PIN authentication handler with better error handling
const enhancedHandlePinAuthentication = async (pin) => {
  if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    setPinError(true);
    Alert.alert('Invalid PIN', 'Please enter a valid 4-digit PIN');
    return;
  }

  setPinLoading(true);
  
  try {
    const storedPin = await getStoredPin();
    const isFirstTimeSetup = !storedPin;
    
    if (isFirstTimeSetup) {
      // First time - store the entered PIN
      const result = await setUserPinWithRecovery(pin);
if (result.success) {
  Alert.alert('PIN Set', 'Your security PIN has been set successfully.');
        // Continue with authentication
        setIsAuthenticated(true);
        setSecurityModalVisible(false);
        setPinValue('');
        setPinError(false);
        
        if (pendingAction === 'viewSensitive') {
          setShowSensitiveInfo(true);
        } else if (pendingAction === 'edit') {
          setEditPaymentMethodVisible(true);
        }
        setPendingAction(null);
      } else {
        Alert.alert('Error', 'Failed to set PIN. Please try again.');
        setPinError(true);
        setPinValue('');
      }
    } else {
      // PIN already exists - verify it
      if (pin === storedPin) {
        // PIN is correct
        setIsAuthenticated(true);
        setSecurityModalVisible(false);
        setPinValue('');
        setPinError(false);
        
        if (pendingAction === 'viewSensitive') {
          setShowSensitiveInfo(true);
        } else if (pendingAction === 'edit') {
          setEditPaymentMethodVisible(true);
        }
        setPendingAction(null);
      } else {
        setPinError(true);
        setPinValue('');
        Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect. Please try again.');
      }
    }
  } catch (error) {
    console.error('PIN authentication error:', error);
    Alert.alert('Error', 'Authentication failed. Please try again.');
    setPinError(true);
    setPinValue('');
  } finally {
    setPinLoading(false);
  }
};


  const savePaymentMethodToStorage = async (updatedMethods) => {
    try {
      await AsyncStorage.setItem('paymentMethods', JSON.stringify(updatedMethods));
      await AsyncStorage.setItem(`payment_${paymentId}`, JSON.stringify(payment));
      return true;
    } catch (error) {
      console.error('Error saving payment methods:', error);
      Alert.alert('Error', 'Failed to save payment method changes.');
      return false;
    }
  };

  const handleEditPaymentMethod = (method) => {
    setEditingMethod(method);
    setEditFormData({
      cardNumber: method.fullCardNumber || '',
      expiryMonth: method.fullExpiryMonth || '',
      expiryYear: method.expiryYear || '',
      phone: method.fullPhone || '',
      email: method.fullEmail || '',
      accountNumber: method.fullAccountNumber || '',
    });
  };

  const saveEditedPaymentMethod = async () => {
    if (!editingMethod) return;
    
    try {
      const updatedMethods = availablePaymentMethods.map(method => {
        if (method.id === editingMethod.id) {
          let updatedMethod = { ...method };
          
          if (method.type === 'Visa' || method.type === 'Mastercard') {
            updatedMethod.fullCardNumber = editFormData.cardNumber;
            updatedMethod.lastThree = editFormData.cardNumber.slice(-3);
            updatedMethod.name = `${method.type} (***${updatedMethod.lastThree})`;
            updatedMethod.fullExpiryMonth = editFormData.expiryMonth;
            updatedMethod.expiryMonth = '**';
            updatedMethod.expiryYear = editFormData.expiryYear;
          } else if (method.type === 'M-Pesa') {
            updatedMethod.fullPhone = editFormData.phone;
            updatedMethod.phone = `${editFormData.phone.slice(0, 7)}***${editFormData.phone.slice(-3)}`;
            updatedMethod.name = `M-Pesa (***${editFormData.phone.slice(-3)})`;
          } else if (method.type === 'PayPal') {
            updatedMethod.fullEmail = editFormData.email;
            const emailParts = editFormData.email.split('@');
            updatedMethod.email = `${emailParts[0].slice(0, 1)}***@${emailParts[1]}`;
            updatedMethod.name = `PayPal (${updatedMethod.email})`;
          } else if (method.type === 'Bank Transfer') {
            updatedMethod.fullAccountNumber = editFormData.accountNumber;
            updatedMethod.accountNumber = `***${editFormData.accountNumber.slice(-4)}`;
            updatedMethod.name = `Standard Bank (***${editFormData.accountNumber.slice(-4)})`;
          }
          
          return updatedMethod;
        }
        return method;
      });
      
      setAvailablePaymentMethods(updatedMethods);
      
      // Update current payment if it's the edited method
      if (editingMethod.isDefault) {
        const updatedMethod = updatedMethods.find(m => m.id === editingMethod.id);
        setPayment(prev => ({
          ...prev,
          paymentMethod: updatedMethod.name,
          paymentMethodDetails: {
            ...prev.paymentMethodDetails,
            lastThree: updatedMethod.lastThree,
            fullCardNumber: updatedMethod.fullCardNumber,
            fullExpiryMonth: updatedMethod.fullExpiryMonth,
            fullPhone: updatedMethod.fullPhone,
            fullEmail: updatedMethod.fullEmail,
            fullAccountNumber: updatedMethod.fullAccountNumber,
          }
        }));
      }
      
      await savePaymentMethodToStorage(updatedMethods);
      
      setEditingMethod(null);
      setEditFormData({});
      Alert.alert('Success', 'Payment method updated successfully!');
      
    } catch (error) {
      console.error('Error saving edited payment method:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'overdue': return COLORS.error;
      case 'cancelled': return COLORS.textSecondary;
      case 'refunded': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'PAID';
      case 'pending': return 'PENDING';
      case 'overdue': return 'OVERDUE';
      case 'cancelled': return 'CANCELLED';
      case 'refunded': return 'REFUNDED';
      default: return status.toUpperCase();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleShareReceipt = async () => {
    try {
      await Share.share({
        message: `Payment Receipt\n\nTransaction ID: ${payment.transactionId}\nAmount: ${formatCurrency(payment.amount)}\nDate: ${formatDate(payment.paidDate)}\nAcademy: ${payment.academy}\nChild: ${payment.childName}`,
        title: 'Payment Receipt',
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      if (payment.receiptUrl) {
        await Linking.openURL(payment.receiptUrl);
      } else {
        Alert.alert('Receipt', 'Receipt will be sent to your email address.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to download receipt at this time.');
    }
  };

  const handleContactAcademy = () => {
    Alert.alert(
      'Contact Academy',
      'How would you like to contact the academy?',
      [
        { text: 'Call', onPress: () => Linking.openURL(`tel:${payment.academyContact.phone}`) },
        { text: 'Email', onPress: () => Linking.openURL(`mailto:${payment.academyContact.email}`) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRequestRefund = () => {
    Alert.alert(
      'Request Refund',
      'Are you sure you want to request a refund for this payment? This will be reviewed by the academy.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Refund', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Refund Request', 'Your refund request has been submitted and will be reviewed within 2-3 business days.');
          }
        },
      ]
    );
  };

  const handleDispute = () => {
    setDisputeModalVisible(true);
  };

  const submitDispute = () => {
    setDisputeModalVisible(false);
    Alert.alert(
      'Dispute Submitted', 
      'Your payment dispute has been submitted. We will investigate and respond within 5-7 business days.'
    );
  };

  const getPaymentMethodIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'visa':
      case 'mastercard':
        return 'credit-card';
      case 'm-pesa':
        return 'phone-android';
      case 'paypal':
        return 'account-balance';
      case 'pesapal':
        return 'account-balance-wallet';
      case 'bank transfer':
        return 'account-balance';
      default:
        return 'credit-card';
    }
  };

  const PaymentStatusHeader = () => (
    <Card style={styles.statusCard}>
      <Card.Content>
        <View style={styles.statusHeader}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusAmount}>{formatCurrency(payment.amount)}</Text>
            <Chip 
              mode="flat"
              style={[styles.statusChip, { backgroundColor: `${getStatusColor(payment.status)}20` }]}
              textStyle={{ color: getStatusColor(payment.status), fontSize: 14, fontWeight: 'bold' }}
            >
              {getStatusText(payment.status)}
            </Chip>
          </View>
          <View style={styles.statusActions}>
            <TouchableOpacity style={styles.actionIcon} onPress={handleShareReceipt}>
              <Icon name="share" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon} onPress={handleDownloadReceipt}>
              <Icon name="file-download" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.transactionId}>Transaction ID: {payment.transactionId}</Text>
        
        <View style={styles.dateInfo}>
          <View style={styles.dateItem}>
            <Icon name="event" size={16} color={COLORS.textSecondary} />
            <Text style={styles.dateText}>
              Paid on {formatDateTime(payment.paidDate)}
            </Text>
          </View>
          {payment.status === 'paid' && (
            <View style={styles.dateItem}>
              <Icon name="check-circle" size={16} color={COLORS.success} />
              <Text style={styles.dateText}>Payment confirmed</Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const ChildAndAcademyInfo = () => (
    <Card style={styles.infoCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>Training Details</Text>
        
        {/* Child Info */}
        <View style={styles.infoRow}>
          <Avatar.Image source={{ uri: payment.childAvatar }} size={40} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{payment.childName}</Text>
            <Text style={styles.infoSubtitle}>{payment.program}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Academy Info */}
        <TouchableOpacity style={styles.infoRow} onPress={handleContactAcademy}>
          <Avatar.Image source={{ uri: payment.academyLogo }} size={40} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{payment.academy}</Text>
            <Text style={styles.infoSubtitle}>Tap to contact</Text>
          </View>
          <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <Divider style={styles.divider} />

        {/* Coach Info */}
        <View style={styles.infoRow}>
          <Avatar.Icon icon="account" size={40} style={{ backgroundColor: COLORS.primary }} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>{payment.coach}</Text>
            <Text style={styles.infoSubtitle}>{payment.coachContact}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const PaymentBreakdown = () => (
    <Card style={styles.infoCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>Payment Breakdown</Text>
        
        {/* Line items */}
        {payment.breakdown.map((item, index) => (
          <View key={index} style={styles.breakdownRow}>
            <Text style={styles.breakdownItem}>{item.item}</Text>
            <Text style={styles.breakdownAmount}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownItem}>Subtotal</Text>
          <Text style={styles.breakdownAmount}>{formatCurrency(payment.subtotal)}</Text>
        </View>

        {/* Discounts */}
        {payment.discounts.map((discount, index) => (
          <View key={index} style={styles.breakdownRow}>
            <Text style={[styles.breakdownItem, { color: COLORS.success }]}>{discount.name}</Text>
            <Text style={[styles.breakdownAmount, { color: COLORS.success }]}>{formatCurrency(discount.amount)}</Text>
          </View>
        ))}

        {/* Taxes */}
        {payment.taxes.map((tax, index) => (
          <View key={index} style={styles.breakdownRow}>
            <Text style={styles.breakdownItem}>{tax.name}</Text>
            <Text style={styles.breakdownAmount}>{formatCurrency(tax.amount)}</Text>
          </View>
        ))}

        <Divider style={styles.divider} />

        <View style={styles.breakdownRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{formatCurrency(payment.totalAmount)}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const PaymentMethodInfo = () => (
    <Card style={styles.infoCard}>
      <Card.Content>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <View style={styles.paymentMethodActions}>
            <TouchableOpacity 
              onPress={() => authenticateUser('viewSensitive')}
              style={styles.actionIconSmall}
            >
              <Icon name={showSensitiveInfo ? "visibility-off" : "visibility"} size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => authenticateUser('edit')}>
              <Icon name="edit" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.paymentMethodRow}
          onPress={() => authenticateUser('edit')}
        >
          <Icon 
            name={getPaymentMethodIcon(payment.paymentMethodDetails.type)} 
            size={40} 
            color={COLORS.primary} 
          />
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodText}>{payment.paymentMethod}</Text>
            {payment.paymentMethodDetails.type === 'Visa' || payment.paymentMethodDetails.type === 'Mastercard' ? (
              <>
                <Text style={styles.paymentMethodSubtext}>
                  {payment.paymentMethodDetails.type} ending in {showSensitiveInfo && isAuthenticated ? payment.paymentMethodDetails.fullCardNumber?.slice(-4) : payment.paymentMethodDetails.lastThree}
                </Text>
                <Text style={styles.paymentMethodSubtext}>
                  Expires {showSensitiveInfo && isAuthenticated ? payment.paymentMethodDetails.fullExpiryMonth : payment.paymentMethodDetails.expiryMonth}/{payment.paymentMethodDetails.expiryYear}
                </Text>
              </>
            ) : payment.paymentMethodDetails.phone ? (
              <Text style={styles.paymentMethodSubtext}>
                {showSensitiveInfo && isAuthenticated ? payment.paymentMethodDetails.fullPhone : payment.paymentMethodDetails.phone}
              </Text>
            ) : payment.paymentMethodDetails.email ? (
              <Text style={styles.paymentMethodSubtext}>
                {showSensitiveInfo && isAuthenticated ? payment.paymentMethodDetails.fullEmail : payment.paymentMethodDetails.email}
              </Text>
            ) : payment.paymentMethodDetails.accountNumber ? (
              <Text style={styles.paymentMethodSubtext}>
                Account: {showSensitiveInfo && isAuthenticated ? payment.paymentMethodDetails.fullAccountNumber : payment.paymentMethodDetails.accountNumber}
              </Text>
            ) : (
              <Text style={styles.paymentMethodSubtext}>
                Tap to manage payment methods
              </Text>
            )}
          </View>
          <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  
// Recovery Codes Display Modal
const RecoveryCodesModal = () => (
  <Modal visible={showRecoveryCodes} onDismiss={() => setShowRecoveryCodes(false)}>
    <Card style={styles.recoveryModal}>
      <Card.Content>
        <View style={styles.recoveryHeader}>
          <Icon name="security" size={32} color={COLORS.primary} />
          <Text style={styles.recoveryTitle}>Save Your Recovery Codes</Text>
          <Text style={styles.recoverySubtext}>
            These codes can be used to recover your account if you forget your PIN. 
            Save them in a secure location.
          </Text>
        </View>

        <View style={styles.codesContainer}>
          {recoveryCodes.map((code, index) => (
            <View key={index} style={styles.codeItem}>
              <Text style={styles.codeNumber}>{index + 1}.</Text>
              <Text style={styles.codeText}>{code}</Text>
            </View>
          ))}
        </View>

        <View style={styles.recoveryWarning}>
          <Icon name="warning" size={20} color={COLORS.warning} />
          <Text style={styles.warningText}>
            Each code can only be used once. Store them safely!
          </Text>
        </View>

        <View style={styles.recoveryActions}>
          <Button
            mode="outlined"
            onPress={() => {
              // Copy all codes to clipboard
              const codesText = recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join('\n');
              // You can implement clipboard copy here
              Alert.alert('Copied', 'Recovery codes copied to clipboard');
            }}
            style={styles.recoveryButton}
          >
            Copy Codes
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowRecoveryCodes(false)}
            style={styles.recoveryButton}
          >
            I've Saved Them
          </Button>
        </View>
      </Card.Content>
    </Card>
  </Modal>
);

// Account Recovery Modal
const AccountRecoveryModal = () => (
  <Modal visible={recoveryModalVisible} onDismiss={() => setRecoveryModalVisible(false)}>
    <Card style={styles.recoveryModal}>
      <Card.Content>
        <View style={styles.recoveryHeader}>
          <Icon name="vpn-key" size={32} color={COLORS.primary} />
          <Text style={styles.recoveryTitle}>Account Recovery</Text>
          <Text style={styles.recoverySubtext}>
            Enter one of your recovery codes to reset your PIN
          </Text>
        </View>

        <TextInput
          style={styles.recoveryInput}
          placeholder="Enter recovery code"
          value={recoveryCodeInput}
          onChangeText={setRecoveryCodeInput}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <View style={styles.recoveryActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setRecoveryModalVisible(false);
              setRecoveryCodeInput('');
            }}
            style={styles.recoveryButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleRecoveryCodeSubmit}
            style={styles.recoveryButton}
            disabled={!recoveryCodeInput.trim()}
          >
            Verify Code
          </Button>
        </View>
      </Card.Content>
    </Card>
  </Modal>
);

  const RecurringPaymentInfo = () => (
    payment.recurringPayment?.isRecurring && (
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.cardTitle}>Recurring Payment</Text>
          
          <View style={styles.recurringInfo}>
            <View style={styles.recurringRow}>
              <Icon name="repeat" size={20} color={COLORS.primary} />
              <Text style={styles.recurringText}>
                Charged {payment.recurringPayment.frequency}
              </Text>
            </View>
            <View style={styles.recurringRow}>
              <Icon name="schedule" size={20} color={COLORS.primary} />
              <Text style={styles.recurringText}>
                Next payment: {formatDate(payment.recurringPayment.nextPaymentDate)}
              </Text>
            </View>
            <View style={styles.recurringRow}>
              <Icon name="event-note" size={20} color={COLORS.primary} />
              <Text style={styles.recurringText}>
                Ends: {formatDate(payment.recurringPayment.endDate)}
              </Text>
            </View>
          </View>
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Manage Subscription', 'Redirect to subscription management')}
            style={styles.manageButton}
          >
            Manage Subscription
          </Button>
        </Card.Content>
      </Card>
    )
  );

  const AdditionalInfo = () => (
    <Card style={styles.infoCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>Additional Information</Text>
        
        <View style={styles.additionalInfoRow}>
          <Text style={styles.additionalInfoLabel}>Invoice Number:</Text>
          <Text style={styles.additionalInfoValue}>{payment.invoiceNumber}</Text>
        </View>
        
        <View style={styles.additionalInfoRow}>
          <Text style={styles.additionalInfoLabel}>Program Duration:</Text>
          <Text style={styles.additionalInfoValue}>{payment.programDetails.duration}</Text>
        </View>
        
        <View style={styles.additionalInfoRow}>
          <Text style={styles.additionalInfoLabel}>Sessions per Week:</Text>
          <Text style={styles.additionalInfoValue}>{payment.programDetails.sessionsPerWeek}</Text>
        </View>
        
        <View style={styles.additionalInfoRow}>
          <Text style={styles.additionalInfoLabel}>Refund Policy:</Text>
          <Text style={styles.additionalInfoValue}>{payment.refundPolicy}</Text>
        </View>
        
        {payment.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{payment.notes}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const ActionButtons = () => (
    <Card style={styles.actionsCard}>
      <Card.Content>
        <Text style={styles.cardTitle}>Actions</Text>
        
        <View style={styles.actionButtonsGrid}>
          <Button
            mode="contained"
            icon="file-download"
            onPress={handleDownloadReceipt}
            style={styles.actionButton}
          >
            Download Receipt
          </Button>
          
          <Button
            mode="outlined"
            icon="email"
            onPress={() => Linking.openURL(`mailto:${payment.academyContact.email}`)}
            style={styles.actionButton}
          >
            Email Academy
          </Button>
          
          {payment.status === 'paid' && (
            <Button
              mode="outlined"
              icon="undo"
              onPress={handleRequestRefund}
              style={styles.actionButton}
            >
              Request Refund
            </Button>
          )}
          
          <Button
            mode="text"
            icon="flag"
            onPress={handleDispute}
            style={styles.actionButton}
            textColor={COLORS.error}
          >
            Dispute Payment
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  // Add this function
const handleUpdatePaymentMethod = (methodId) => {
  setSelectedPaymentMethod(methodId);
  
  // Update the payment method for this payment
  const selectedMethod = availablePaymentMethods.find(method => method.id === methodId);
  if (selectedMethod) {
    // Update current payment's payment method
    setPayment(prev => ({
      ...prev,
      paymentMethod: selectedMethod.name,
      paymentMethodDetails: {
        ...prev.paymentMethodDetails,
        type: selectedMethod.type,
        lastThree: selectedMethod.lastThree || selectedMethod.phone?.slice(-3),
        fullCardNumber: selectedMethod.fullCardNumber,
        fullExpiryMonth: selectedMethod.fullExpiryMonth,
        fullPhone: selectedMethod.fullPhone,
        fullEmail: selectedMethod.fullEmail,
        fullAccountNumber: selectedMethod.fullAccountNumber,
      }
    }));
    
    // Update default status
    const updatedMethods = availablePaymentMethods.map(method => ({
      ...method,
      isDefault: method.id === methodId
    }));
    setAvailablePaymentMethods(updatedMethods);
    
    // Save to storage
    savePaymentMethodToStorage(updatedMethods);
    
    // Close modal
    setEditPaymentMethodVisible(false);
    
    Alert.alert('Success', 'Payment method updated successfully!');
  }
};

  if (loading || !payment) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
        <TouchableOpacity onPress={handleShareReceipt}>
          <Icon name="share" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <PaymentStatusHeader />
        <ChildAndAcademyInfo />
        <PaymentBreakdown />
        <PaymentMethodInfo />
        <RecurringPaymentInfo />
        <AdditionalInfo />
        <ActionButtons />
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Dispute Modal */}
      <Portal>
        <Modal visible={disputeModalVisible} onDismiss={() => setDisputeModalVisible(false)}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <Text style={styles.modalTitle}>Dispute Payment</Text>
              <Text style={styles.modalText}>
                If you believe this charge is incorrect or unauthorized, we can help you dispute it. 
                This will initiate a formal investigation process.
              </Text>
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setDisputeModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={submitDispute}
                  style={styles.modalButton}
                  buttonColor={COLORS.error}
                >
                  Submit Dispute
                </Button>
              </View>
            </Card.Content>
          </Card>

        </Modal>

{/* Security PIN Modal - Updated to use device authentication */}
{/* Security PIN Modal - Updated for web compatibility */}
<Modal visible={securityModalVisible} onDismiss={() => setSecurityModalVisible(false)}>
  <Card style={styles.securityModalCard}>
    <Card.Content>
      <View style={styles.modalHeader}>
        <Icon name="security" size={36} color={COLORS.primary} />
        <Text style={styles.modalTitle}>
          {isFirstTimeSetup ? 'Set Security PIN' : 'Security Verification'}
        </Text>
        <Text style={styles.modalSubtext}>
          {isFirstTimeSetup 
            ? 'Create a 4-digit PIN to secure your payment information. This PIN will be required for future access to sensitive data.'
            : Platform.OS === 'web' 
            ? 'Enter your PIN to continue' 
            : 'Biometric authentication unavailable. Please enter your PIN to continue.'
          }
        </Text>
      </View>
      
{/* PIN Input with improved visibility */}
<View style={styles.pinSection}>
  <Text style={styles.pinLabel}>
    {isFirstTimeSetup ? 'Create 4-digit PIN' : 'Enter 4-digit PIN'}
  </Text>

  {/* Show attempts warning after first failed attempt */}
  {failedAttempts > 0 && !isFirstTimeSetup && !isLockedOut && (
    <>
      <View style={styles.attemptsWarning}>
        <Icon name="warning" size={18} color="#f39c12" />
        <Text style={styles.attemptsText}>
          {MAX_ATTEMPTS - failedAttempts} attempt(s) remaining
        </Text>
      </View>
      
      {/* Security warning after first attempt */}
      <View style={styles.securityWarning}>
        <Icon name="security" size={16} color={COLORS.error} />
        <Text style={styles.securityWarningText}>
          You will be temporarily blocked from accessing this information after {MAX_ATTEMPTS - failedAttempts} more failed attempt(s).
        </Text>
      </View>
    </>
  )}

  {/* Lockout display when user is locked out */}
  {isLockedOut ? (
    <View style={styles.lockoutContainer}>
      <Icon name="lock" size={48} color={COLORS.error} />
      <Text style={styles.lockoutTitle}>Account Temporarily Disabled</Text>
      <Text style={styles.lockoutMessage}>
        You are disabled due to too many wrong attempts.
      </Text>
      <Text style={styles.countdownText}>
        Try again in: {formatCountdownTime(lockoutCountdown)}
      </Text>
      
      <View style={styles.lockoutButtons}>
        <Button
          mode="outlined"
          onPress={() => {
            setSecurityModalVisible(false);
            setPinValue('');
            setPinError(false);
            setPendingAction(null);
          }}
          style={styles.lockoutButton}
          textColor={COLORS.primary}
        >
          Cancel
        </Button>
        <Button
            mode="contained"
            onPress={() => {
              const lockoutStatus = checkLockoutStatus();
              if (!lockoutStatus.isLockedOut) {
                setIsLockedOut(false);
                setLockoutEndTime(null);
                setFailedAttempts(0);
                // Reset the modal to normal PIN entry state
              }
            }}
            style={[
              styles.lockoutButton,
              lockoutCountdown > 0 ? styles.disabledButton : styles.enabledButton
            ]}
            disabled={lockoutCountdown > 0}
            buttonColor={lockoutCountdown > 0 ? '#e9ecef' : COLORS.primary}
            textColor={lockoutCountdown > 0 ? '#6c757d' : '#ffffff'}
          >
            Try Again
          </Button>
      </View>
    </View>
  ) : (
    <>
      {/* Enhanced PIN Dots Display - Only show when not locked out */}
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pinValue.length ? styles.pinDotFilled : styles.pinDotEmpty,
              pinError && index < pinValue.length && styles.pinDotError
            ]}
          />
        ))}
      </View>
      
      {/* Enhanced PIN Input with better eye positioning */}
      <View style={styles.pinInputContainer}>
        <TextInput
          style={[
            styles.pinInput,
            pinError && styles.pinInputError
          ]}
          placeholder="••••"
          placeholderTextColor="#bdc3c7"
          secureTextEntry={!showPin}
          maxLength={4}
          keyboardType="numeric"
          value={pinValue}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setPinValue(numericText);
            if (pinError) setPinError(false);
          }}
          autoFocus={true}
          selectTextOnFocus={true}
        />
        <TouchableOpacity
          style={styles.eyeToggle}
          onPress={() => setShowPin(!showPin)}
          activeOpacity={0.7}
        >
          <Icon 
            name={showPin ? "visibility-off" : "visibility"} 
            size={22} 
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>
      
      {pinError && (
        <View style={styles.errorContainer}>
          <Icon name="error" size={18} color={COLORS.error} />
          <Text style={styles.errorText}>
            {isFirstTimeSetup ? 'PIN must be 4 digits' : 'Invalid PIN. Please try again.'}
          </Text>
        </View>
      )}
    </>
  )}
</View>

{/* Enhanced Modal Buttons - Hide when locked out */}
{!isLockedOut && (
  <View style={styles.modalButtons}>
    <Button
      mode="outlined"
      onPress={() => {
        setSecurityModalVisible(false);
        setPinValue('');
        setPinError(false);
        setPendingAction(null);
      }}
      style={styles.modalButton}
      textColor={COLORS.primary}
      buttonColor="transparent"
    >
      Cancel
    </Button>
    <Button
      mode="contained"
      onPress={() => handlePinAuthentication(pinValue)}
      style={[
        styles.modalButton,
        pinValue.length !== 4 ? styles.disabledButton : styles.enabledButton
      ]}
      disabled={pinValue.length !== 4}
      loading={pinLoading}
      buttonColor={pinValue.length !== 4 ? '#e9ecef' : COLORS.primary}
      textColor={pinValue.length !== 4 ? '#6c757d' : '#ffffff'}
    >
      {isFirstTimeSetup ? 'Set PIN' : 'Verify PIN'}
    </Button>
  </View>
)}

{/* Forgot PIN option - Hide when locked out */}
{!isFirstTimeSetup && !isLockedOut && (
  <View style={styles.forgotPinSection}>
    <TouchableOpacity onPress={handleForgotPin} activeOpacity={0.7}>
      <Text style={styles.forgotPinText}>Forgot PIN?</Text>
    </TouchableOpacity>
  </View>
)}
      
      {/* Show biometric retry option only on mobile platforms */}
      {Platform.OS !== 'web' && (
        <View style={styles.alternativeAuth}>
          <Divider style={styles.modalDivider} />
          <Button
            mode="text"
            icon="fingerprint"
            onPress={() => {
              setSecurityModalVisible(false);
              setPinValue('');
              authenticateUser(pendingAction);
            }}
            style={styles.biometricRetryButton}
            textColor={COLORS.primary}
          >
            {Platform.OS === 'ios' 
              ? 'Try Touch ID/Face ID Again' 
              : 'Try Biometric Again'
            }
          </Button>
        </View>
      )}
    </Card.Content>
  </Card>
</Modal>

{/* Edit Payment Method Details Modal */}
<Modal visible={!!editingMethod} onDismiss={() => setEditingMethod(null)}>
  <Card style={styles.modalCard}>
    <Card.Content>
      <Text style={styles.modalTitle}>Edit {editingMethod?.type}</Text>
      <Text style={styles.modalSubtext}>Update your payment method details</Text>
      
      {editingMethod?.type === 'Visa' || editingMethod?.type === 'Mastercard' ? (
        <>
          <TextInput
            style={styles.editInput}
            placeholder="Card Number"
            value={editFormData.cardNumber}
            onChangeText={(text) => setEditFormData(prev => ({...prev, cardNumber: text}))}
            keyboardType="numeric"
            maxLength={16}
          />
          <View style={styles.expiryRow}>
            <TextInput
              style={[styles.editInput, styles.expiryInput]}
              placeholder="MM"
              value={editFormData.expiryMonth}
              onChangeText={(text) => setEditFormData(prev => ({...prev, expiryMonth: text}))}
              keyboardType="numeric"
              maxLength={2}
            />
            <TextInput
              style={[styles.editInput, styles.expiryInput]}
              placeholder="YYYY"
              value={editFormData.expiryYear}
              onChangeText={(text) => setEditFormData(prev => ({...prev, expiryYear: text}))}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        </>
      ) : editingMethod?.type === 'M-Pesa' ? (
        <TextInput
          style={styles.editInput}
          placeholder="Phone Number (+254...)"
          value={editFormData.phone}
          onChangeText={(text) => setEditFormData(prev => ({...prev, phone: text}))}
          keyboardType="phone-pad"
        />
      ) : editingMethod?.type === 'PayPal' ? (
        <TextInput
          style={styles.editInput}
          placeholder="Email Address"
          value={editFormData.email}
          onChangeText={(text) => setEditFormData(prev => ({...prev, email: text}))}
          keyboardType="email-address"
        />
      ) : editingMethod?.type === 'Bank Transfer' ? (
        <TextInput
          style={styles.editInput}
          placeholder="Account Number"
          value={editFormData.accountNumber}
          onChangeText={(text) => setEditFormData(prev => ({...prev, accountNumber: text}))}
          keyboardType="numeric"
        />
      ) : null}

      <View style={styles.modalButtons}>
        <Button
          mode="outlined"
          onPress={() => setEditingMethod(null)}
          style={styles.modalButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={saveEditedPaymentMethod}
          style={styles.modalButton}
        >
          Save Changes
        </Button>
      </View>
    </Card.Content> {/* ✅ Add this closing tag */}
  </Card>
</Modal>

{/* Edit Payment Method Selection Modal - Fixed structure */}
<Modal visible={editPaymentMethodVisible} onDismiss={() => setEditPaymentMethodVisible(false)}>
  <Card style={styles.modalCard}>
    <Card.Content>
      <Text style={styles.modalTitle}>Select Payment Method</Text>
      <Text style={styles.modalSubtext}>Choose a payment method for future transactions</Text>
      
      <ScrollView style={styles.paymentMethodsList}>
        {availablePaymentMethods.map((method) => (
          <View key={method.id} style={styles.paymentMethodContainer}>
            <TouchableOpacity
              style={[
                styles.paymentMethodOption,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod
              ]}
              onPress={() => handleUpdatePaymentMethod(method.id)}
            >
                      <Icon 
                        name={method.icon} 
                        size={32} 
                        color={selectedPaymentMethod === method.id ? COLORS.primary : COLORS.textSecondary} 
                      />
                      <View style={styles.paymentMethodDetails}>
                        <Text style={[
                          styles.paymentMethodName,
                          selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
                        ]}>
                          {method.type}
                        </Text>
                        <Text style={styles.paymentMethodDescription}>
                          {method.name}
                        </Text>
                        {method.isDefault && (
                          <Chip 
                            mode="flat" 
                            style={styles.defaultChip}
                            textStyle={styles.defaultChipText}
                          >
                            Current
                          </Chip>
                        )}
                      </View>
                      <View style={styles.methodActions}>
                        <TouchableOpacity
                          onPress={() => handleEditPaymentMethod(method)}
                          style={styles.editMethodButton}
                        >
                          <Icon name="edit" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                        {selectedPaymentMethod === method.id && (
                          <Icon name="check-circle" size={24} color={COLORS.primary} />
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              
              <Divider style={styles.modalDivider} />
              
              <TouchableOpacity                  
              style={styles.addPaymentMethodButton}                 
              onPress={() => {                   
                setEditPaymentMethodVisible(false);
                navigation.navigate('AddPaymentMethod');
              }}               
            >                 
              <Icon name="add-circle-outline" size={24} color={COLORS.primary} />                 
              <Text style={styles.addPaymentMethodText}>Add New Payment Method</Text>               
            </TouchableOpacity>
              
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setEditPaymentMethodVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
        <RecoveryCodesModal />
<AccountRecoveryModal />
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add to your styles object
modalHeader: {
  alignItems: 'center',
  marginBottom: 24,
},
pinSection: {
  marginBottom: 24,
},
pinLabel: {
  fontSize: 14,
  color: COLORS.text,
  marginBottom: 8,
  textAlign: 'center',
  fontWeight: '600',
},
pinInputError: {
  borderColor: COLORS.error,
  backgroundColor: `${COLORS.error}10`,
},
errorContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 8,
  gap: 4,
},
errorText: {
  fontSize: 12,
  color: COLORS.error,
},
authSection: {
  marginBottom: 24,
},
authButton: {
  marginVertical: 8,
},
alternativeAuth: {
  marginTop: 16,
},
biometricRetryButton: {
  marginTop: 8,
},
modalDivider: {
  marginVertical: 12,
  backgroundColor: '#d1e7dd',
},
securityModalCard: {
  margin: 20,
  backgroundColor: '#f0f8ff',
  borderRadius: 16,
  elevation: 8,
},
modalHeader: {
  alignItems: 'center',
  marginBottom: 24,
},
pinSection: {
  marginBottom: 24,
},
pinLabel: {
  fontSize: 14,
  color: COLORS.textSecondary,
  marginBottom: 16,
  textAlign: 'center',
  fontWeight: '500',
},
pinDot: {
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 2,
},
pinDotEmpty: {
  borderColor: '#d1e7dd',
  backgroundColor: 'transparent',
},
pinDotFilled: {
  borderColor: COLORS.primary,
  backgroundColor: COLORS.primary,
},
  pinDotError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  
  pinInputContainer: {
    position: 'relative',
    marginBottom: 8,
    marginTop: 12,
  },
  pinInput: {
    borderWidth: 2, // Increased border width
    borderColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    paddingRight: 55, // Increased right padding for eye icon
    fontSize: 18, // Increased font size
    textAlign: 'center',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    fontWeight: '600',
    letterSpacing: 8, // Add letter spacing for better PIN display
  },
pinInputError: {
  borderColor: COLORS.error,
  backgroundColor: `${COLORS.error}05`,
    borderWidth: 2,
},
recoveryModal: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 8,
    maxHeight: '80%',
  },
  
  recoveryHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  recoveryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  
  recoverySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  codesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  codeNumber: {
    width: 24,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  
  codeText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: COLORS.text,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 6,
    flex: 1,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  
  recoveryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  
  warningText: {
    fontSize: 13,
    color: '#856404',
    flex: 1,
  },
  
  recoveryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  recoveryButton: {
    flex: 1,
  },
  
  recoveryInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeToggle: {
  position: 'absolute',
  right: 12,
  top: '50%',
  marginTop: -12, // Changed from -15 to -12
  padding: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 20,
  elevation: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
},
errorContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 8,
  gap: 4,
},
errorText: {
  fontSize: 12,
  color: COLORS.error,
  fontWeight: '500',
},
forgotPinSection: {
  alignItems: 'center',
  marginTop: 16,
},
forgotPinText: {
  fontSize: 14,
  color: COLORS.primary,
  fontWeight: '600',
  textDecorationLine: 'underline',
},
securityWarning: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  backgroundColor: '#ffeaa7',
  padding: 12,
  borderRadius: 8,
  marginTop: 8,
  marginBottom: 12,
  gap: 8,
},
securityWarningText: {
  fontSize: 12,
  color: '#d63031',
  flex: 1,
  lineHeight: 16,
  fontWeight: '500',
},
lockoutContainer: {
  alignItems: 'center',
  paddingVertical: 24,
  paddingHorizontal: 16,
},
lockoutTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: COLORS.error,
  marginTop: 16,
  marginBottom: 8,
  textAlign: 'center',
},
lockoutMessage: {
  fontSize: 14,
  color: COLORS.textSecondary,
  textAlign: 'center',
  marginBottom: 16,
  lineHeight: 20,
},
countdownText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: COLORS.error,
  textAlign: 'center',
  marginBottom: 24,
  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
},
lockoutButtons: {
  flexDirection: 'row',
  gap: 12,
  width: '100%',
},
lockoutButton: {
  flex: 1,
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
  marginTop: 8,
},
disabledButton: {
    backgroundColor: '#e9ecef',
    borderColor: '#dee2e6',
  },
  
  disabledButtonText: {
    color: '#6c757d',
  },
  
  enabledButton: {
    backgroundColor: COLORS.primary,
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
    backgroundColor: `${COLORS.error}10`,
    padding: 8,
    borderRadius: 8,
  },
  
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
  
  forgotPinSection: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  
  forgotPinText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
modalButton: {
  flex: 1,
  borderRadius: 8,
},
alternativeAuth: {
  marginTop: 16,
  alignItems: 'center',
},
biometricRetryButton: {
  marginTop: 8,
},
modalDivider: {
  marginVertical: 12,
  backgroundColor: '#d1e7dd',
},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusInfo: {
    flex: 1,
  },
  pinDotsContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 20,
  gap: 15,
},
authOptions: {
  marginBottom: 24,
},
authButton: {
  marginVertical: 8,
},
pinDot: {
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 2,
  elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
},
pinDotEmpty: {
  borderColor: '#bdc3c7',
  backgroundColor: 'transparent',
},
pinDotFilled: {
  borderColor: COLORS.primary,
  backgroundColor: COLORS.primary,
  shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
},
attemptsWarning: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
  gap: 6,
  backgroundColor: '#fff3cd',
  padding: 8,
  borderRadius: 6,
},
attemptsText: {
  fontSize: 12,
  color: '#856404',
  fontWeight: '500',
},
hiddenPinInput: {
  position: 'absolute',
  opacity: 0,
  zIndex: -1,
},
  biometricSection: {
  marginTop: 16,
},
biometricButton: {
  marginTop: 8,
},
modalDivider: {
  marginVertical: 12,
},
  statusAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    padding: 8,
  },
  transactionId: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  dateInfo: {
    gap: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 12,
    elevation: 1,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },// Add these to your styles object
editInput: {
  borderWidth: 1,
  borderColor: '#e9ecef',
  borderRadius: 8,
  padding: 12,
  marginBottom: 12,
  fontSize: 16,
  backgroundColor: '#fff',
},
expiryRow: {
  flexDirection: 'row',
  gap: 12,
},
expiryInput: {
  flex: 1,
},
pinInput: {
  borderWidth: 1,
  borderColor: '#e9ecef',
  borderRadius: 8,
  padding: 12,
  marginBottom: 20,
  fontSize: 16,
  textAlign: 'center',
  backgroundColor: '#fff',
},
actionIconSmall: {
  padding: 4,
  marginRight: 8,
},
paymentMethodActions: {
  flexDirection: 'row',
  alignItems: 'center',
},
paymentMethodContainer: {
  marginBottom: 8,
},
methodActions: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
editMethodButton: {
  padding: 4,
},
  infoSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  divider: {
    marginVertical: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  breakdownItem: {
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  breakdownAmount: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  paymentMethodSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  recurringInfo: {
    marginBottom: 16,
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recurringText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  manageButton: {
    marginTop: 8,
  },
  additionalInfoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  additionalInfoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  additionalInfoValue: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1.5,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  notesLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 1,
    backgroundColor: '#fff',
  },
  actionButtonsGrid: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 2,
  },
  bottomPadding: {
    height: 20,
  },
  modalCard: {
  margin: 20,
  backgroundColor: '#ffffff',
  borderRadius: 12,
  elevation: 4,
},
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  modalSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  paymentMethodsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedPaymentMethod: {
    backgroundColor: `${COLORS.primary}10`,
    borderColor: COLORS.primary,
  },
  paymentMethodDetails: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  selectedPaymentMethodText: {
    color: COLORS.primary,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  defaultChip: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.success}20`,
    height: 20,
  },
  defaultChipText: {
    fontSize: 10,
    color: COLORS.success,
  },
  modalDivider: {
    marginVertical: 16,
  },
  addPaymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
  },
  addPaymentMethodText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default PaymentDetails;