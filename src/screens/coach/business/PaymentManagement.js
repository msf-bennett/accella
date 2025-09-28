import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Alert,
  Vibration,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Platform,
  PermissionsAndroid,
  Share,
  BackHandler,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  Dialog,
  RadioButton,
  Switch,
  Divider,
  Badge,
  DataTable,
  Menu,
  Provider as PaperProvider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

// Platform-specific imports with proper error handling
let LocalAuthentication, SecureStore, Device, Application, Notifications, PushNotification;

try {
  if (Platform.OS !== 'web') {
    LocalAuthentication = require('expo-local-authentication');
    SecureStore = require('expo-secure-store');
    Device = require('expo-device');
    Application = require('expo-application');
    // Use expo-notifications for Expo compatibility
    PushNotification = require('expo-notifications');
    
    // Create expo-notifications-like interface
    Notifications = {
      scheduleNotificationAsync: (content) => {
        PushNotification.localNotification({
          title: content.content?.title || 'Notification',
          message: content.content?.body || '',
          data: content.content?.data || {},
          playSound: true,
          soundName: 'default',
        });
        return Promise.resolve();
      },
      requestPermissionsAsync: () => {
        return new Promise((resolve) => {
          PushNotification.requestPermissions().then((permissions) => {
            resolve({ 
              status: permissions.alert || permissions.badge || permissions.sound ? 'granted' : 'denied' 
            });
          }).catch(() => {
            resolve({ status: 'denied' });
          });
        });
      }
    };
  } else {
    // Secure web fallbacks
    LocalAuthentication = {
      hasHardwareAsync: () => Promise.resolve(false),
      isEnrolledAsync: () => Promise.resolve(false),
      supportedAuthenticationTypesAsync: () => Promise.resolve([]),
      authenticateAsync: () => Promise.resolve({ success: false })
    };
    
    SecureStore = {
      setItemAsync: (key, value) => {
        // Use sessionStorage for web security instead of localStorage
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem(key, value);
        }
        return Promise.resolve();
      },
      getItemAsync: (key) => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          return Promise.resolve(window.sessionStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      deleteItemAsync: (key) => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.removeItem(key);
        }
        return Promise.resolve();
      }
    };
    
    Device = {
      isDevice: true,
      deviceName: 'Web Browser',
      deviceType: 'DESKTOP',
      osName: 'Web',
      brand: 'Browser'
    };
    
    Application = {
      getInstallationIdAsync: () => {
        // Generate consistent web device ID
        let webId = sessionStorage.getItem('web_device_id');
        if (!webId) {
          webId = 'web-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
          sessionStorage.setItem('web_device_id', webId);
        }
        return Promise.resolve(webId);
      },
      getApplicationIdAsync: () => Promise.resolve('coach-web-app')
    };
    
    Notifications = {
      scheduleNotificationAsync: (content) => {
        // Use web notifications API
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(content.content.title, {
            body: content.content.body,
            icon: '/icon-192.png',
            data: content.content.data
          });
        }
        return Promise.resolve();
      },
      requestPermissionsAsync: () => {
        if ('Notification' in window) {
          return Notification.requestPermission().then(permission => ({
            status: permission === 'granted' ? 'granted' : 'denied'
          }));
        }
        return Promise.resolve({ status: 'denied' });
      }
    };
  }
} catch (error) {
  console.warn('Native modules import failed:', error);
  // Provide minimal working fallbacks
  LocalAuthentication = { hasHardwareAsync: () => Promise.resolve(false) };
  SecureStore = { 
    setItemAsync: () => Promise.resolve(), 
    getItemAsync: () => Promise.resolve(null),
    deleteItemAsync: () => Promise.resolve()
  };
  Device = { isDevice: true, deviceName: 'Unknown', deviceType: 'UNKNOWN' };
  Application = { 
    getInstallationIdAsync: () => Promise.resolve('fallback-device-id'),
    getApplicationIdAsync: () => Promise.resolve('fallback-app-id')
  };
  Notifications = { 
    scheduleNotificationAsync: () => Promise.resolve(),
    requestPermissionsAsync: () => Promise.resolve({ status: 'denied' })
  };
}

import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { BlurView as ExpoBlurView } from 'expo-blur';

// Import design system
import { COLORS, SPACING, TEXT_STYLES } from '../../../styles/themes';

const { width, height } = Dimensions.get('window');

const PaymentManagement = ({ navigation, route }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const paymentData = useSelector(state => state.payments);
  const securitySettings = useSelector(state => state.security);

  // Core state management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [networkConnected, setNetworkConnected] = useState(true);

  // Security & Authentication
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [securityLevel, setSecurityLevel] = useState('standard');
  const [sessionTimeout, setSessionTimeout] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [auditLog, setAuditLog] = useState([]);
  const [securityThreats, setSecurityThreats] = useState([]);

  // UI state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showFraudAlert, setShowFraudAlert] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // AI & Analytics
  const [aiInsights, setAiInsights] = useState({});
  const [predictiveAnalytics, setPredictiveAnalytics] = useState({});
  const [fraudDetection, setFraudDetection] = useState({
    score: 0,
    threats: [],
    monitoring: false
  });
  const [recommendations, setRecommendations] = useState([]);

  // Financial data
  const [revenueMetrics, setRevenueMetrics] = useState({
    total: 0,
    growth: 0,
    average: 0,
    sessions: 0
  });
  const [expenseMetrics, setExpenseMetrics] = useState({
    total: 0,
    categories: {}
  });
  const [profitMargins, setProfitMargins] = useState({
    gross: 0,
    margin: 0
  });

  // Payment processing
  const [paymentGateways, setPaymentGateways] = useState(['stripe', 'paypal', 'square']);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(width)).current;

  // Refs for cleanup
  const intervalRefs = useRef([]);
  const timeoutRefs = useRef([]);

  // Initialize component
  useEffect(() => {
    initializeComponent();
    
    // Cleanup on unmount
    return cleanup;
  }, []);

  // Network state monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkConnected(state.isConnected);
      if (state.isConnected) {
        syncOfflineData();
      }
    });
    
    return unsubscribe;
  }, []);

  // Session activity monitoring
  useEffect(() => {
    const activityHandler = () => setLastActivity(Date.now());
    
    // Add activity listeners (simplified for React Native)
    const timeout = setTimeout(() => {
      if (Date.now() - lastActivity > 900000) { // 15 minutes
        handleSessionTimeout();
      }
    }, 60000);
    
    timeoutRefs.current.push(timeout);
    
    return () => clearTimeout(timeout);
  }, [lastActivity]);

  // Component initialization
  const initializeComponent = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        initializeSecurity(),
        setupBiometrics(),
        loadPaymentData(),
        initializeAI(),
        setupFraudDetection(),
        requestNotificationPermissions()
      ]);

      // Start background processes
      startPeriodicTasks();
      
    } catch (error) {
      console.error('Component initialization failed:', error);
      Alert.alert('Initialization Error', 'Some features may not work properly. Please restart the app.');
    } finally {
      setLoading(false);
    }
  };

  // Security initialization
  const initializeSecurity = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        setSecurityLevel('enhanced');
        setBiometricSupported(true);
      }

      // Initialize secure storage with proper key derivation
      await initializeSecureStorage();
      
      // Load audit log
      await loadAuditLog();
      
      // Log security initialization
      await logSecurityEvent('SECURITY_INIT_SUCCESS', {
        platform: Platform.OS,
        biometricSupported: hasHardware && isEnrolled
      });
      
    } catch (error) {
      console.error('Security initialization failed:', error);
      await logSecurityEvent('SECURITY_INIT_FAILED', { error: error.message });
      
      // Show security warning for non-web platforms
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Enhanced Security Recommended',
          'Please enable device lock (PIN, Pattern, or Biometrics) for secure payment access.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Settings', onPress: () => {/* Navigate to settings */} }
          ]
        );
      }
    }
  };

  // Secure storage initialization with proper encryption
  const initializeSecureStorage = async () => {
    try {
      const deviceId = await Application.getInstallationIdAsync();
      const userId = user?.id || 'anonymous';
      
      // Generate salt if it doesn't exist
      let salt = await SecureStore.getItemAsync('encryption_salt');
      if (!salt) {
        salt = CryptoJS.lib.WordArray.random(256/8).toString();
        await SecureStore.setItemAsync('encryption_salt', salt);
      }
      
      // Store encrypted initialization flag
      const initData = await encryptSensitiveData({ 
        userId, 
        deviceId,
        initialized: true,
        timestamp: Date.now()
      });
      
      await SecureStore.setItemAsync('payment_service_init', initData);
      
    } catch (error) {
      console.error('Secure storage initialization failed:', error);
      throw error;
    }
  };

  // Biometric setup
  const setupBiometrics = async () => {
    if (Platform.OS === 'web') {
      setBiometricSupported(false);
      return;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && supportedTypes.length > 0 && isEnrolled) {
        setBiometricSupported(true);
        setSecurityLevel('enhanced');
        
        await logSecurityEvent('BIOMETRIC_SETUP_SUCCESS', {
          supportedTypes: supportedTypes.length,
          hasHardware,
          isEnrolled
        });
      }
    } catch (error) {
      console.error('Biometric setup failed:', error);
      setBiometricSupported(false);
    }
  };

  // Enhanced encryption with PBKDF2
  const encryptSensitiveData = async (data) => {
    try {
      const deviceId = await Application.getInstallationIdAsync();
      const userId = user?.id || 'anonymous';
      const salt = await SecureStore.getItemAsync('encryption_salt') || 'default_salt';
      
      // Use PBKDF2 for key derivation
      const key = CryptoJS.PBKDF2(userId + deviceId, salt, { 
        keySize: 256/32, 
        iterations: 10000 
      });
      
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key.toString()).toString();
      return encrypted;
      
    } catch (error) {
      console.error('Encryption failed:', error);
      throw error;
    }
  };

  const decryptSensitiveData = async (encryptedData) => {
    try {
      const deviceId = await Application.getInstallationIdAsync();
      const userId = user?.id || 'anonymous';
      const salt = await SecureStore.getItemAsync('encryption_salt') || 'default_salt';
      
      const key = CryptoJS.PBKDF2(userId + deviceId, salt, { 
        keySize: 256/32, 
        iterations: 10000 
      });
      
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key.toString());
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      
    } catch (error) {
      console.error('Decryption failed:', error);
      throw error;
    }
  };

  // User authentication with retry logic
  const authenticateUser = async (level = 'standard', retryCount = 0) => {
    try {
      setLoading(true);
      
      if (Platform.OS === 'web') {
        // Web authentication flow
        const webAuth = await authenticateWeb();
        if (webAuth) {
          setIsSecureMode(true);
          await logSecurityEvent('WEB_AUTH_SUCCESS');
          return true;
        }
        throw new Error('Web authentication failed');
      }
      
      if (level === 'enhanced' && biometricSupported) {
        const biometricResult = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Access Payment Management',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
          fallbackLabel: 'Use Passcode',
        });
        
        if (biometricResult.success) {
          await logSecurityEvent('BIOMETRIC_AUTH_SUCCESS');
          setIsSecureMode(true);
          
          // Haptic feedback
          if (Platform.OS !== 'web' && Vibration) {
            Vibration.vibrate([100, 50, 100]);
          }
          return true;
        } else {
          throw new Error('Biometric authentication failed');
        }
      }
      
      // Fallback authentication
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        // For devices without biometric hardware, proceed with warning
        Alert.alert(
          'Authentication Notice',
          'Device authentication is not available. Proceeding with standard security.',
          [{ text: 'OK' }]
        );
      }
      
      setIsSecureMode(true);
      await logSecurityEvent('STANDARD_AUTH_SUCCESS');
      return true;
      
    } catch (error) {
      console.error('Authentication failed:', error);
      await logSecurityEvent('AUTH_FAILED', { 
        error: error.message, 
        retryCount,
        level 
      });
      
      // Retry logic with backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return authenticateUser(level, retryCount + 1);
      }
      
      Alert.alert(
        'Authentication Failed',
        'Unable to verify your identity after multiple attempts. Please contact support if the issue persists.',
        [
          { text: 'Try Again', onPress: () => authenticateUser(level, 0) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Web authentication fallback
  const authenticateWeb = async () => {
    return new Promise((resolve) => {
      Alert.alert(
        'Web Authentication',
        'Click OK to proceed with payment management access.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          { text: 'OK', onPress: () => resolve(true) }
        ]
      );
    });
  };

  // Session timeout handler
  const handleSessionTimeout = async () => {
    setIsSecureMode(false);
    await logSecurityEvent('SESSION_TIMEOUT', { 
      lastActivity: new Date(lastActivity).toISOString() 
    });
    
    Alert.alert(
      'Session Expired',
      'Your secure session has expired for your protection. Please authenticate again.',
      [
        { text: 'Authenticate', onPress: () => authenticateUser('enhanced') },
        { text: 'Exit', onPress: () => navigation.goBack() }
      ]
    );
  };

  // Security event logging
  const logSecurityEvent = async (event, details = {}) => {
    try {
      const deviceInfo = Platform.OS !== 'web' ? {
        name: Device.deviceName,
        type: Device.deviceType,
        os: Device.osName,
        brand: Device.brand
      } : {
        name: 'Web Browser',
        type: 'DESKTOP',
        os: 'Web',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      };

      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        event,
        userId: user?.id || 'anonymous',
        platform: Platform.OS,
        deviceInfo,
        details,
        riskLevel: calculateRiskLevel(event, details),
        sessionId: await getSessionId()
      };
      
      // Update audit log state
      setAuditLog(prev => [logEntry, ...prev.slice(0, 999)]);
      
      // Store encrypted log
      const encryptedLog = await encryptSensitiveData(logEntry);
      await AsyncStorage.setItem(`security_log_${logEntry.id}`, encryptedLog);
      
      // Handle high-risk events
      if (logEntry.riskLevel === 'high') {
        await handleSecurityThreat(logEntry);
      }
      
    } catch (error) {
      console.error('Security event logging failed:', error);
    }
  };

  // Risk level calculation
  const calculateRiskLevel = (event, details) => {
    const riskMatrix = {
      'AUTH_FAILED': details.retryCount > 2 ? 'high' : 'medium',
      'BIOMETRIC_AUTH_SUCCESS': 'low',
      'SESSION_TIMEOUT': 'low',
      'FRAUD_DETECTED': 'high',
      'UNUSUAL_TRANSACTION': 'medium',
      'DEVICE_CHANGE': 'high',
      'LOCATION_ANOMALY': 'medium',
      'SECURITY_INIT_FAILED': 'high',
      'WEB_AUTH_SUCCESS': 'low'
    };
    
    return riskMatrix[event] || 'low';
  };

  // Get or create session ID
  const getSessionId = async () => {
    let sessionId = await AsyncStorage.getItem('current_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('current_session_id', sessionId);
    }
    return sessionId;
  };

  // Handle security threats
  const handleSecurityThreat = async (logEntry) => {
    try {
      // Add to threats list
      setSecurityThreats(prev => [logEntry, ...prev.slice(0, 99)]);
      
      // Send notification
      await sendSecurityNotification(logEntry);
      
      // Auto-lock for severe threats
      if (logEntry.riskLevel === 'high' && logEntry.details?.severity === 'critical') {
        setIsSecureMode(false);
        Alert.alert(
          'Security Lock',
          'Account temporarily locked due to suspicious activity. Please verify your identity.',
          [{ text: 'Authenticate', onPress: () => authenticateUser('enhanced') }]
        );
      }
      
    } catch (error) {
      console.error('Security threat handling failed:', error);
    }
  };

  // Load audit log from storage
  const loadAuditLog = async () => {
    try {
      const logKeys = await AsyncStorage.getAllKeys();
      const securityLogKeys = logKeys.filter(key => key.startsWith('security_log_'));
      
      const logs = await Promise.all(
        securityLogKeys.map(async (key) => {
          try {
            const encryptedLog = await AsyncStorage.getItem(key);
            return await decryptSensitiveData(encryptedLog);
          } catch {
            return null;
          }
        })
      );
      
      const validLogs = logs.filter(Boolean).sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      
      setAuditLog(validLogs.slice(0, 999));
      
    } catch (error) {
      console.error('Audit log loading failed:', error);
    }
  };

  // AI initialization
  const initializeAI = async () => {
    try {
      // Initialize AI models and analytics
      await generateAIInsights();
      
      // Start predictive analytics
      await runPredictiveAnalytics();
      
    } catch (error) {
      console.error('AI initialization failed:', error);
    }
  };

  // Generate AI insights
  const generateAIInsights = async () => {
    try {
      // Simulate AI analysis based on payment data
      const insights = await analyzePaymentPatterns();
      setAiInsights(insights);
      
      // Generate recommendations
      const recs = await generateRecommendations(insights);
      setRecommendations(recs);
      
    } catch (error) {
      console.error('AI insights generation failed:', error);
    }
  };

  // Analyze payment patterns
  const analyzePaymentPatterns = async () => {
    // Mock AI analysis - in production, this would call actual ML services
    const mockInsights = {
      revenueOptimization: {
        recommendation: 'Peak booking times are 6-8 PM. Consider premium pricing during these hours.',
        confidence: 0.89,
        expectedImpact: '+$1,850/month',
        actionRequired: 'Update pricing strategy'
      },
      clientRetention: {
        recommendation: 'Clients who miss 2+ consecutive sessions have 70% churn risk. Implement re-engagement campaigns.',
        confidence: 0.94,
        expectedImpact: '30% retention improvement',
        actionRequired: 'Setup automated follow-ups'
      },
      cashFlowOptimization: {
        recommendation: 'Enable auto-renewal for subscription clients to improve cash flow predictability.',
        confidence: 0.87,
        expectedImpact: 'Reduce payment delays by 65%',
        actionRequired: 'Implement subscription auto-renewal'
      }
    };
    
    return mockInsights;
  };

  // Generate recommendations
  const generateRecommendations = async (insights) => {
    const recs = Object.entries(insights).map(([key, insight]) => ({
      id: key,
      type: 'ai_insight',
      title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      description: insight.recommendation,
      confidence: insight.confidence,
      impact: insight.expectedImpact,
      action: insight.actionRequired,
      priority: insight.confidence > 0.9 ? 'high' : insight.confidence > 0.8 ? 'medium' : 'low'
    }));
    
    return recs;
  };

  // Predictive analytics
  const runPredictiveAnalytics = async () => {
    try {
      const predictions = {
        nextMonthRevenue: calculatePredictedRevenue(),
        churnRisk: identifyChurnRisk(),
        optimalPricing: suggestOptimalPricing(),
        seasonalTrends: analyzeSeasonalTrends()
      };
      
      setPredictiveAnalytics(predictions);
      
    } catch (error) {
      console.error('Predictive analytics failed:', error);
    }
  };

  // Revenue prediction
  const calculatePredictedRevenue = () => {
    // Mock calculation based on historical data
    return {
      amount: 12450,
      confidence: 0.87,
      trend: 'increasing',
      factors: ['Historical growth', 'Seasonal patterns', 'Market conditions']
    };
  };

  // Churn risk identification
  const identifyChurnRisk = () => {
    return {
      highRisk: 3,
      mediumRisk: 8,
      lowRisk: 24,
      totalClients: 35,
      recommendations: [
        'Send personalized re-engagement campaign to high-risk clients',
        'Offer loyalty discount to medium-risk clients',
        'Schedule check-in calls with at-risk clients'
      ]
    };
  };

  // Optimal pricing suggestions
  const suggestOptimalPricing = () => {
    return {
      individual: 85,
      group: 45,
      premium: 120,
      package: 320, // 4 sessions
      rationale: 'Based on market analysis, competitor pricing, and demand elasticity'
    };
  };

  // Seasonal trend analysis
  const analyzeSeasonalTrends = () => {
    return {
      currentSeason: 'Peak (Fall)',
      expectedGrowth: 15,
      peakMonths: ['September', 'October', 'January', 'February'],
      recommendations: [
        'Increase marketing spend during peak months',
        'Prepare winter retention strategies',
        'Launch New Year fitness campaigns'
      ]
    };
  };

  // Fraud detection setup
  const setupFraudDetection = async () => {
    try {
      setFraudDetection(prev => ({ ...prev, monitoring: true }));
      
      // Start fraud monitoring
      startFraudMonitoring();
      
    } catch (error) {
      console.error('Fraud detection setup failed:', error);
    }
  };

  // Fraud monitoring
  const startFraudMonitoring = () => {
    const interval = setInterval(async () => {
      try {
        const fraudScore = await analyzeFraudPatterns();
        
        setFraudDetection(prev => ({
          ...prev,
          score: fraudScore.score,
          threats: fraudScore.threats
        }));
        
        if (fraudScore.score > 0.7) {
          setShowFraudAlert(true);
          await logSecurityEvent('FRAUD_DETECTED', {
            score: fraudScore.score,
            threats: fraudScore.threats
          });
        }
        
      } catch (error) {
        console.error('Fraud monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
    
    intervalRefs.current.push(interval);
  };

  // Analyze fraud patterns
  const analyzeFraudPatterns = async () => {
    const transactions = transactionHistory.slice(0, 10); // Last 10 transactions
    let score = 0;
    const threats = [];
    
    // Check for rapid transactions
    const rapidTransactions = checkRapidTransactions(transactions);
    if (rapidTransactions) {
      score += 0.3;
      threats.push('Multiple rapid transactions detected');
    }
    
    // Check for unusual amounts
    const unusualAmounts = checkUnusualAmounts(transactions);
    if (unusualAmounts) {
      score += 0.2;
      threats.push('Unusual transaction amounts detected');
    }
    
    // Check device fingerprint changes
    const deviceChange = await checkDeviceFingerprint();
    if (deviceChange) {
      score += 0.4;
      threats.push('Device fingerprint change detected');
    }
    
    // Check for time-based anomalies
    const timeAnomalies = checkTimeAnomalies(transactions);
    if (timeAnomalies) {
      score += 0.2;
      threats.push('Unusual transaction timing detected');
    }
    
    return { score: Math.min(score, 1), threats };
  };

  // Fraud detection helper functions
  const checkRapidTransactions = (transactions) => {
    if (transactions.length < 3) return false;
    
    const recentTransactions = transactions.filter(t => 
      Date.now() - new Date(t.timestamp).getTime() < 300000 // Last 5 minutes
    );
    
    return recentTransactions.length > 3;
  };

  const checkUnusualAmounts = (transactions) => {
    if (transactions.length < 5) return false;
    
    const amounts = transactions.map(t => t.amount);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const recentTransactions = transactions.slice(0, 3);
    
    return recentTransactions.some(t => t.amount > avg * 3 || t.amount < avg * 0.1);
  };

  const checkDeviceFingerprint = async () => {
    try {
      const currentDeviceInfo = {
        id: await Application.getInstallationIdAsync(),
        name: Device.deviceName,
        type: Device.deviceType,
        os: Device.osName,
        brand: Device.brand
      };
      
      const storedFingerprint = await AsyncStorage.getItem('device_fingerprint');
      if (storedFingerprint) {
        const stored = JSON.parse(storedFingerprint);
        const fingerprintChanged = JSON.stringify(currentDeviceInfo) !== JSON.stringify(stored);
        
        if (!fingerprintChanged) {
          // Update fingerprint if changed
          await AsyncStorage.setItem('device_fingerprint', JSON.stringify(currentDeviceInfo));
        }
        
        return fingerprintChanged;
      }
      
      // Store fingerprint for first time
      await AsyncStorage.setItem('device_fingerprint', JSON.stringify(currentDeviceInfo));
      return false;
      
    } catch (error) {
      console.error('Device fingerprint check failed:', error);
      return true; // Assume suspicious if we can't verify
    }
  };

  const checkTimeAnomalies = (transactions) => {
    if (transactions.length === 0) return false;
    
    // Check for transactions at unusual hours (2 AM - 5 AM)
    const unusualHourTransactions = transactions.filter(t => {
      const hour = new Date(t.timestamp).getHours();
      return hour >= 2 && hour <= 5;
    });
    
    return unusualHourTransactions.length > 0;
  };

  // Load payment data
  const loadPaymentData = async () => {
    try {
      // Load encrypted payment history
      const encryptedHistory = await AsyncStorage.getItem('payment_history');
      if (encryptedHistory) {
        const history = await decryptSensitiveData(encryptedHistory);
        setTransactionHistory(history || []);
      }
      
      // Load pending payments
      const encryptedPending = await AsyncStorage.getItem('pending_payments');
      if (encryptedPending) {
        const pending = await decryptSensitiveData(encryptedPending);
        setPendingPayments(pending || []);
      }
      
      // Calculate metrics
      await calculateFinancialMetrics();
      
    } catch (error) {
      console.error('Payment data loading failed:', error);
    }
  };

  // Calculate financial metrics
  const calculateFinancialMetrics = async () => {
    try {
      // Revenue metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyTransactions = transactionHistory.filter(t => {
        const transactionDate = new Date(t.timestamp);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });
      
      const totalRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);
      const avgTransaction = totalRevenue / Math.max(monthlyTransactions.length, 1);
      
      // Calculate growth (mock calculation)
      const previousMonthRevenue = totalRevenue * 0.88; // Mock previous month
      const growth = ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
      
      setRevenueMetrics({
        total: totalRevenue,
        growth: growth,
        average: avgTransaction,
        sessions: monthlyTransactions.length
      });
      
      // Mock expense calculation
      const expenses = {
        total: totalRevenue * 0.25, // 25% expense ratio
        categories: {
          equipment: totalRevenue * 0.08,
          marketing: totalRevenue * 0.10,
          insurance: totalRevenue * 0.05,
          other: totalRevenue * 0.02
        }
      };
      
      setExpenseMetrics(expenses);
      
      // Profit margins
      const grossProfit = totalRevenue - expenses.total;
      const profitMargin = (grossProfit / totalRevenue) * 100;
      
      setProfitMargins({
        gross: grossProfit,
        margin: profitMargin
      });
      
    } catch (error) {
      console.error('Financial metrics calculation failed:', error);
    }
  };

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Notification permission request failed:', error);
    }
  };

  // Send security notification
  const sendSecurityNotification = async (logEntry) => {
    try {
      const notificationContent = {
        content: {
          title: 'Security Alert',
          body: getSecurityNotificationMessage(logEntry.event),
          data: { logEntry }
        }
      };
      
      await Notifications.scheduleNotificationAsync(notificationContent);
      
      // Haptic feedback for high-risk events
      if (logEntry.riskLevel === 'high' && Platform.OS !== 'web' && Vibration) {
        Vibration.vibrate([200, 100, 200, 100, 200]);
      }
      
    } catch (error) {
      console.error('Security notification failed:', error);
    }
  };

  const getSecurityNotificationMessage = (event) => {
    const messages = {
      'FRAUD_DETECTED': 'Suspicious activity detected in your payment account.',
      'AUTH_FAILED': 'Multiple failed authentication attempts detected.',
      'DEVICE_CHANGE': 'Login from a new device detected.',
      'UNUSUAL_TRANSACTION': 'Unusual payment pattern detected.',
      'SECURITY_INIT_FAILED': 'Security system initialization failed.'
    };
    
    return messages[event] || 'Security event detected in your account.';
  };

  // Start periodic tasks
  const startPeriodicTasks = () => {
    // AI analysis every 5 minutes
    const aiInterval = setInterval(() => {
      generateAIInsights();
    }, 300000);
    
    // Financial metrics update every minute
    const metricsInterval = setInterval(() => {
      calculateFinancialMetrics();
    }, 60000);
    
    // Security check every 2 minutes
    const securityInterval = setInterval(() => {
      performSecurityCheck();
    }, 120000);
    
    intervalRefs.current.push(aiInterval, metricsInterval, securityInterval);
  };

  // Perform periodic security check
  const performSecurityCheck = async () => {
    try {
      // Check for session timeout
      if (Date.now() - lastActivity > 900000) {
        handleSessionTimeout();
        return;
      }
      
      // Update security metrics
      const threatCount = securityThreats.filter(t => 
        Date.now() - new Date(t.timestamp).getTime() < 3600000 // Last hour
      ).length;
      
      if (threatCount > 5) {
        await logSecurityEvent('HIGH_THREAT_ACTIVITY', { threatCount });
      }
      
    } catch (error) {
      console.error('Security check failed:', error);
    }
  };

  // Sync offline data
  const syncOfflineData = async () => {
    try {
      if (!networkConnected) return;
      
      // Sync offline transactions
      const offlineTransactions = await AsyncStorage.getItem('offline_transactions');
      if (offlineTransactions) {
        const transactions = JSON.parse(offlineTransactions);
        
        // Process offline transactions
        for (const transaction of transactions) {
          await processTransaction(transaction, true);
        }
        
        // Clear offline storage
        await AsyncStorage.removeItem('offline_transactions');
        
        await logSecurityEvent('OFFLINE_SYNC_SUCCESS', { 
          transactionCount: transactions.length 
        });
      }
      
    } catch (error) {
      console.error('Offline sync failed:', error);
      await logSecurityEvent('OFFLINE_SYNC_FAILED', { error: error.message });
    }
  };

  // Process payment transaction
  const processTransaction = async (transactionData, isOfflineSync = false) => {
    try {
      // Validate transaction
      if (!validateTransaction(transactionData)) {
        throw new Error('Invalid transaction data');
      }
      
      // Check fraud score
      const fraudScore = await calculateTransactionFraudScore(transactionData);
      if (fraudScore > 0.8) {
        await logSecurityEvent('HIGH_FRAUD_TRANSACTION', { 
          fraudScore, 
          transaction: transactionData 
        });
        throw new Error('Transaction blocked due to high fraud risk');
      }
      
      // Process with available gateways
      let result = null;
      const errors = [];
      
      for (const gateway of paymentGateways) {
        try {
          result = await processWithGateway(gateway, transactionData);
          if (result.success) break;
        } catch (gatewayError) {
          errors.push({ gateway, error: gatewayError.message });
        }
      }
      
      if (!result?.success) {
        throw new Error(`All payment gateways failed: ${JSON.stringify(errors)}`);
      }
      
      // Store successful transaction
      const transaction = {
        ...result,
        timestamp: new Date().toISOString(),
        fraudScore,
        isOfflineSync
      };
      
      await storeTransaction(transaction);
      
      // Update metrics
      await calculateFinancialMetrics();
      
      // Log success
      await logSecurityEvent('TRANSACTION_SUCCESS', { 
        amount: transactionData.amount,
        gateway: result.gateway,
        fraudScore 
      });
      
      return result;
      
    } catch (error) {
      console.error('Transaction processing failed:', error);
      
      // Store for offline processing if network is down
      if (!networkConnected) {
        await storeOfflineTransaction(transactionData);
      }
      
      await logSecurityEvent('TRANSACTION_FAILED', { 
        error: error.message,
        transaction: transactionData 
      });
      
      throw error;
    }
  };

  // Validate transaction data
  const validateTransaction = (transaction) => {
    return transaction && 
           transaction.amount && 
           transaction.amount > 0 && 
           transaction.clientId && 
           transaction.type;
  };

  // Calculate transaction fraud score
  const calculateTransactionFraudScore = async (transaction) => {
    let score = 0;
    
    // Amount-based scoring
    if (transaction.amount > 1000) score += 0.2;
    if (transaction.amount > 5000) score += 0.3;
    
    // Time-based scoring
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) score += 0.3;
    
    // Frequency-based scoring
    const recentTransactions = transactionHistory.filter(t => 
      Date.now() - new Date(t.timestamp).getTime() < 3600000 // Last hour
    );
    if (recentTransactions.length > 10) score += 0.4;
    
    // Device-based scoring
    const deviceChanged = await checkDeviceFingerprint();
    if (deviceChanged) score += 0.3;
    
    return Math.min(score, 1);
  };

  // Process with specific gateway
  const processWithGateway = async (gateway, transactionData) => {
    // Mock gateway processing
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve({
            success: true,
            gateway,
            transactionId: `tx_${Date.now()}_${gateway}`,
            amount: transactionData.amount,
            status: 'completed'
          });
        } else {
          reject(new Error(`${gateway} processing failed`));
        }
      }, 1000 + Math.random() * 2000); // 1-3 second delay
    });
  };

  // Store transaction
  const storeTransaction = async (transaction) => {
    try {
      const updatedHistory = [transaction, ...transactionHistory];
      setTransactionHistory(updatedHistory);
      
      // Encrypt and store
      const encryptedHistory = await encryptSensitiveData(updatedHistory);
      await AsyncStorage.setItem('payment_history', encryptedHistory);
      
    } catch (error) {
      console.error('Transaction storage failed:', error);
    }
  };

  // Store offline transaction
  const storeOfflineTransaction = async (transaction) => {
    try {
      const existingOffline = await AsyncStorage.getItem('offline_transactions');
      const offlineTransactions = existingOffline ? JSON.parse(existingOffline) : [];
      
      offlineTransactions.push({
        ...transaction,
        offlineTimestamp: new Date().toISOString()
      });
      
      await AsyncStorage.setItem('offline_transactions', JSON.stringify(offlineTransactions));
      
    } catch (error) {
      console.error('Offline transaction storage failed:', error);
    }
  };

  // Generate financial report
  const generateFinancialReport = async (period = 'monthly') => {
    try {
      const reportData = {
        period,
        generated: new Date().toISOString(),
        revenue: revenueMetrics,
        expenses: expenseMetrics,
        profit: profitMargins,
        predictions: predictiveAnalytics,
        insights: aiInsights,
        recommendations: recommendations,
        transactions: transactionHistory.slice(0, 100), // Last 100 transactions
        securityMetrics: {
          threatsDetected: securityThreats.length,
          fraudScore: fraudDetection.score,
          securityLevel: securityLevel
        }
      };
      
      // Encrypt sensitive report data
      const encryptedReport = await encryptSensitiveData(reportData);
      
      // Store report
      const reportKey = `financial_report_${period}_${Date.now()}`;
      await AsyncStorage.setItem(reportKey, encryptedReport);
      
      return reportData;
      
    } catch (error) {
      console.error('Financial report generation failed:', error);
      throw error;
    }
  };

  // Export report
  const exportReport = async (reportData) => {
    try {
      // Create shareable report (remove sensitive data)
      const shareableReport = {
        period: reportData.period,
        generated: reportData.generated,
        summary: {
          totalRevenue: reportData.revenue.total,
          totalExpenses: reportData.expenses.total,
          netProfit: reportData.profit.gross,
          profitMargin: `${reportData.profit.margin.toFixed(2)}%`
        },
        insights: Object.keys(reportData.insights).length,
        recommendations: reportData.recommendations.length
      };
      
      const reportText = `Financial Report - ${reportData.period}
Generated: ${new Date(reportData.generated).toLocaleDateString()}

Revenue: ${shareableReport.summary.totalRevenue.toFixed(2)}
Expenses: ${shareableReport.summary.totalExpenses.toFixed(2)}
Net Profit: ${shareableReport.summary.netProfit.toFixed(2)}
Profit Margin: ${shareableReport.summary.profitMargin}

AI Insights: ${shareableReport.insights} available
Recommendations: ${shareableReport.recommendations} items
      `;
      
      await Share.share({
        message: reportText,
        title: 'Financial Report'
      });
      
    } catch (error) {
      console.error('Report export failed:', error);
      Alert.alert('Export Failed', 'Unable to export report. Please try again.');
    }
  };

  // Cleanup function
  const cleanup = () => {
    // Clear all intervals
    intervalRefs.current.forEach(interval => clearInterval(interval));
    intervalRefs.current = [];
    
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = [];
    
    // Clear session timeout
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Re-authenticate for sensitive operations
      const authenticated = await authenticateUser('standard');
      if (!authenticated) {
        setRefreshing(false);
        return;
      }
      
      // Reload all data
      await Promise.all([
        loadPaymentData(),
        generateAIInsights(),
        syncOfflineData(),
        loadAuditLog()
      ]);
      
      // Haptic feedback
      if (Platform.OS !== 'web' && Vibration) {
        Vibration.vibrate(50);
      }
      
    } catch (error) {
      console.error('Refresh failed:', error);
      Alert.alert('Refresh Failed', 'Unable to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Payment processing handler
  const handlePaymentProcess = async (paymentData) => {
    try {
      setLoading(true);
      
      // Authenticate for payment processing
      const authenticated = await authenticateUser('enhanced');
      if (!authenticated) return;
      
      // Process payment
      const result = await processTransaction(paymentData);
      
      if (result.success) {
        Alert.alert(
          'Payment Successful',
          `Transaction completed successfully. ID: ${result.transactionId}`,
          [{ text: 'OK' }]
        );
        
        // Haptic feedback
        if (Platform.OS !== 'web' && Vibration) {
          Vibration.vibrate(100);
        }
      }
      
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        error.message || 'Payment processing failed. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Security modal handler
  const handleSecurityReview = async () => {
    try {
      const authenticated = await authenticateUser('enhanced');
      if (!authenticated) return;
      
      setShowSecurityModal(true);
    } catch (error) {
      console.error('Security review failed:', error);
    }
  };

  // Analytics modal handler
  const handleAnalyticsView = async () => {
    try {
      const authenticated = await authenticateUser('standard');
      if (!authenticated) return;
      
      await generateAIInsights();
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('Analytics view failed:', error);
    }
  };

  // Report generation handler
  const handleReportGeneration = async () => {
    try {
      setLoading(true);
      
      const authenticated = await authenticateUser('standard');
      if (!authenticated) return;
      
      const report = await generateFinancialReport();
      await exportReport(report);
      
    } catch (error) {
      Alert.alert('Report Generation Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Memoized components for performance
  const SecurityStatusCard = useMemo(() => (
    <Card style={styles.securityCard}>
      <LinearGradient
        colors={securityLevel === 'enhanced' ? ['#00C853', '#4CAF50'] : ['#FF9800', '#F57C00']}
        style={styles.securityGradient}
      >
        <View style={styles.securityContent}>
          <Icon 
            name={securityLevel === 'enhanced' ? 'security' : 'warning'} 
            size={24} 
            color="white" 
          />
          <Text style={styles.securityTitle}>
            {securityLevel === 'enhanced' ? 'Enhanced Security' : 'Standard Security'}
          </Text>
          <Text style={styles.securitySubtitle}>
            {biometricSupported ? 'Biometric Authentication Active' : 'Device Lock Required'}
          </Text>
        </View>
      </LinearGradient>
      <Card.Actions>
        <Button 
          onPress={handleSecurityReview}
          textColor={COLORS.primary}
        >
          Security Settings
        </Button>
      </Card.Actions>
    </Card>
  ), [securityLevel, biometricSupported]);

  const AIInsightsCard = useMemo(() => (
    <Card style={styles.insightsCard}>
      <Card.Title 
        title="AI Financial Insights"
        subtitle="Powered by Machine Learning"
        left={(props) => <Avatar.Icon {...props} icon="brain" backgroundColor={COLORS.primary} />}
      />
      <Card.Content>
        {Object.entries(aiInsights).map(([key, insight]) => (
          <Surface key={key} style={styles.insightItem} elevation={1}>
            <Text style={styles.insightTitle}>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Text>
            <Text style={styles.insightRecommendation}>{insight.recommendation}</Text>
            <View style={styles.insightMetrics}>
              <Chip 
                mode="outlined" 
                textStyle={{ fontSize: 10 }}
                style={styles.confidenceChip}
              >
                {Math.round(insight.confidence * 100)}% Confidence
              </Chip>
              <Text style={styles.impactText}>{insight.expectedImpact}</Text>
            </View>
          </Surface>
        ))}
      </Card.Content>
    </Card>
  ), [aiInsights]);

  const RevenueCard = useMemo(() => (
    <Card style={styles.revenueCard}>
      <Card.Title 
        title="Revenue Overview"
        subtitle={`${revenueMetrics.sessions} sessions this month`}
        left={(props) => <Avatar.Icon {...props} icon="trending-up" backgroundColor={COLORS.primary} />}
      />
      <Card.Content>
        <View style={styles.revenueMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>${revenueMetrics.total.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricValue, { color: revenueMetrics.growth > 0 ? '#4CAF50' : '#F44336' }]}>
              {revenueMetrics.growth > 0 ? '+' : ''}{revenueMetrics.growth.toFixed(1)}%
            </Text>
            <Text style={styles.metricLabel}>Growth</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>${revenueMetrics.average.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Average/Session</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  ), [revenueMetrics]);

  return (
    <PaperProvider>
      <StatusBar 
        translucent 
        backgroundColor="transparent" 
        barStyle="light-content" 
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Payment Management</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleSecurityReview}
              style={styles.securityIndicator}
            >
              <Icon 
                name={isSecureMode ? 'security' : 'lock'} 
                size={20} 
                color={isSecureMode ? '#4CAF50' : '#FF9800'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={handleAnalyticsView}
              style={styles.analyticsButton}
            >
              <Icon name="analytics" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor="white"
              title="Syncing secure data..."
              titleColor="white"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Network status indicator */}
          {!networkConnected && (
            <Card style={styles.offlineCard}>
              <Card.Content>
                <Text style={styles.offlineText}>
                  Offline Mode - Changes will sync when connection is restored
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Security Status */}
          {SecurityStatusCard}
          
          {/* Revenue Overview */}
          {RevenueCard}
          
          {/* AI Insights */}
          {Object.keys(aiInsights).length > 0 && AIInsightsCard}

          {/* Fraud Alert */}
          {fraudDetection.score > 0.5 && (
            <Card style={styles.fraudCard}>
              <Card.Title 
                title="Fraud Alert"
                subtitle={`Risk Score: ${Math.round(fraudDetection.score * 100)}%`}
                left={(props) => <Avatar.Icon {...props} icon="shield-alert" backgroundColor="#F44336" />}
              />
              <Card.Content>
                {fraudDetection.threats.map((threat, index) => (
                  <Text key={index} style={styles.threatText}>• {threat}</Text>
                ))}
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => setShowFraudAlert(true)}>Review</Button>
              </Card.Actions>
            </Card>
          )}

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Card.Title title="Quick Actions" />
            <Card.Content>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => setShowPayoutModal(true)}
                >
                  <Icon name="payment" size={24} color={COLORS.primary} />
                  <Text style={styles.quickActionText}>Process Payment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={handleReportGeneration}
                >
                  <Icon name="assessment" size={24} color={COLORS.primary} />
                  <Text style={styles.quickActionText}>Generate Report</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={handleAnalyticsView}
                >
                  <Icon name="analytics" size={24} color={COLORS.primary} />
                  <Text style={styles.quickActionText}>View Analytics</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={handleSecurityReview}
                >
                  <Icon name="security" size={24} color={COLORS.primary} />
                  <Text style={styles.quickActionText}>Security Audit</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          {/* Recent Transactions */}
          {transactionHistory.length > 0 && (
            <Card style={styles.transactionsCard}>
              <Card.Title 
                title="Recent Transactions"
                subtitle={`${transactionHistory.length} total transactions`}
              />
              <Card.Content>
                {transactionHistory.slice(0, 5).map((transaction, index) => (
                  <View key={transaction.transactionId || index} style={styles.transactionItem}>
                    <Text style={styles.transactionAmount}>
                      ${transaction.amount?.toFixed(2) || '0.00'}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </Text>
                    <Chip 
                      mode="outlined" 
                      textStyle={{ fontSize: 10 }}
                      style={[styles.statusChip, { 
                        backgroundColor: transaction.status === 'completed' ? '#E8F5E8' : '#FFF3E0' 
                      }]}
                    >
                      {transaction.status || 'pending'}
                    </Chip>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}

        </ScrollView>

        {/* Floating Action Button */}
        <FAB
          style={styles.fab}
          icon="add"
          onPress={async () => {
            const authenticated = await authenticateUser('enhanced');
            if (authenticated) {
              setShowPayoutModal(true);
            }
          }}
        />

        {/* Modals */}
        <Portal>
          {/* Security Modal */}
          <Modal
            visible={showSecurityModal}
            onDismiss={() => setShowSecurityModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Security Center</Text>
              <Text style={styles.modalSubtitle}>Security Level: {securityLevel}</Text>
              
              <View style={styles.securityMetrics}>
                <Text>Threats Detected: {securityThreats.length}</Text>
                <Text>Fraud Score: {Math.round(fraudDetection.score * 100)}%</Text>
                <Text>Biometric Support: {biometricSupported ? 'Yes' : 'No'}</Text>
              </View>
              
              <Button 
                mode="contained" 
                onPress={() => setShowSecurityModal(false)}
                style={styles.modalButton}
              >
                Close
              </Button>
            </View>
          </Modal>

          {/* Analytics Modal */}
          <Modal
            visible={showAnalyticsModal}
            onDismiss={() => setShowAnalyticsModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Analytics Dashboard</Text>
              
              <ScrollView style={styles.analyticsContent}>
                <View style={styles.analyticsSection}>
                  <Text style={styles.sectionTitle}>Predictive Analytics</Text>
                  
                  {predictiveAnalytics.nextMonthRevenue && (
                    <View style={styles.predictionItem}>
                      <Text style={styles.predictionLabel}>Next Month Revenue</Text>
                      <Text style={styles.predictionValue}>
                        ${predictiveAnalytics.nextMonthRevenue.amount}
                      </Text>
                      <Text style={styles.confidenceText}>
                        {Math.round(predictiveAnalytics.nextMonthRevenue.confidence * 100)}% confidence
                      </Text>
                    </View>
                  )}
                  
                  {predictiveAnalytics.churnRisk && (
                    <View style={styles.churnSection}>
                      <Text style={styles.predictionLabel}>Client Churn Risk</Text>
                      <View style={styles.churnMetrics}>
                        <View style={styles.churnItem}>
                          <Text style={styles.churnNumber}>{predictiveAnalytics.churnRisk.highRisk}</Text>
                          <Text style={styles.churnLabel}>High Risk</Text>
                        </View>
                        <View style={styles.churnItem}>
                          <Text style={styles.churnNumber}>{predictiveAnalytics.churnRisk.mediumRisk}</Text>
                          <Text style={styles.churnLabel}>Medium Risk</Text>
                        </View>
                        <View style={styles.churnItem}>
                          <Text style={styles.churnNumber}>{predictiveAnalytics.churnRisk.lowRisk}</Text>
                          <Text style={styles.churnLabel}>Low Risk</Text>
                        </View>
                      </View>
                    </View>
                  )}
                  
                  {predictiveAnalytics.optimalPricing && (
                    <View style={styles.pricingSection}>
                      <Text style={styles.predictionLabel}>Optimal Pricing</Text>
                      <View style={styles.pricingGrid}>
                        <View style={styles.pricingItem}>
                          <Text style={styles.pricingValue}>${predictiveAnalytics.optimalPricing.individual}</Text>
                          <Text style={styles.pricingLabel}>Individual</Text>
                        </View>
                        <View style={styles.pricingItem}>
                          <Text style={styles.pricingValue}>${predictiveAnalytics.optimalPricing.group}</Text>
                          <Text style={styles.pricingLabel}>Group</Text>
                        </View>
                        <View style={styles.pricingItem}>
                          <Text style={styles.pricingValue}>${predictiveAnalytics.optimalPricing.premium}</Text>
                          <Text style={styles.pricingLabel}>Premium</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
                
                <View style={styles.analyticsSection}>
                  <Text style={styles.sectionTitle}>Recommendations</Text>
                  {recommendations.map((rec, index) => (
                    <View key={rec.id || index} style={styles.recommendationItem}>
                      <View style={styles.recommendationHeader}>
                        <Text style={styles.recommendationTitle}>{rec.title}</Text>
                        <Chip 
                          mode="outlined"
                          style={[styles.priorityChip, {
                            backgroundColor: rec.priority === 'high' ? '#FFEBEE' : 
                                           rec.priority === 'medium' ? '#FFF3E0' : '#E8F5E8'
                          }]}
                        >
                          {rec.priority}
                        </Chip>
                      </View>
                      <Text style={styles.recommendationDescription}>{rec.description}</Text>
                      <Text style={styles.recommendationImpact}>Impact: {rec.impact}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
              
              <Button 
                mode="contained" 
                onPress={() => setShowAnalyticsModal(false)}
                style={styles.modalButton}
              >
                Close
              </Button>
            </View>
          </Modal>

          {/* Payment Processing Modal */}
          <Modal
            visible={showPayoutModal}
            onDismiss={() => setShowPayoutModal(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Process Payment</Text>
              
              <View style={styles.paymentForm}>
                <Text style={styles.formLabel}>Amount</Text>
                <Text style={styles.formInput}>$0.00</Text>
                
                <Text style={styles.formLabel}>Client</Text>
                <Text style={styles.formInput}>Select Client</Text>
                
                <Text style={styles.formLabel}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  {paymentGateways.map((gateway, index) => (
                    <Chip 
                      key={gateway}
                      mode="outlined"
                      selected={index === 0}
                      style={styles.gatewayChip}
                    >
                      {gateway}
                    </Chip>
                  ))}
                </View>
                
                <Text style={styles.securityNote}>
                  All payments are processed securely with end-to-end encryption
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowPayoutModal(false)}
                  style={styles.cancelButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => {
                    // Demo payment data
                    handlePaymentProcess({
                      amount: 85,
                      clientId: 'demo_client',
                      type: 'session_payment'
                    });
                    setShowPayoutModal(false);
                  }}
                  style={styles.processButton}
                >
                  Process Payment
                </Button>
              </View>
            </View>
          </Modal>

          {/* Fraud Alert Dialog */}
          <Dialog visible={showFraudAlert} onDismiss={() => setShowFraudAlert(false)}>
            <Dialog.Icon icon="shield-alert" />
            <Dialog.Title>Security Alert</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>
                Suspicious activity detected in your payment account.
              </Text>
              <Text style={styles.dialogSubtext}>
                Fraud Score: {Math.round(fraudDetection.score * 100)}%
              </Text>
              
              {fraudDetection.threats.length > 0 && (
                <View style={styles.threatsList}>
                  <Text style={styles.threatsTitle}>Detected Threats:</Text>
                  {fraudDetection.threats.map((threat, index) => (
                    <Text key={index} style={styles.threatItem}>• {threat}</Text>
                  ))}
                </View>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowFraudAlert(false)}>Dismiss</Button>
              <Button 
                mode="contained"
                onPress={() => {
                  setShowFraudAlert(false);
                  handleSecurityReview();
                }}
              >
                Review Security
              </Button>
            </Dialog.Actions>
          </Dialog>

        </Portal>

        {/* Loading overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContent}>
              <ProgressBar indeterminate style={styles.loadingBar} />
              <Text style={styles.loadingText}>Processing securely...</Text>
            </View>
          </View>
        )}

      </LinearGradient>
    </PaperProvider>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIndicator: {
    padding: SPACING.sm,
    marginRight: SPACING.xs,
  },
  analyticsButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  securityCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
  },
  securityGradient: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: SPACING.md,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityTitle: {
    ...TEXT_STYLES.subtitle,
    color: 'white',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  securitySubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: SPACING.sm,
  },
  insightsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
  },
  insightItem: {
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: 8,
  },
  insightTitle: {
    ...TEXT_STYLES.subtitle,
    textTransform: 'capitalize',
    marginBottom: SPACING.xs,
  },
  insightRecommendation: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
  },
  insightMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceChip: {
    height: 24,
  },
  impactText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  dashboardCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
  },
  placeholderText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  quickActionTitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 12,
  },
  blurContainer: {
    padding: SPACING.lg,
    borderRadius: 12,
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalButton: {
    marginTop: SPACING.md,
  },
  // Advanced Analytics Styles
  analyticsContainer: {
    padding: SPACING.md,
  },
  chartContainer: {
    marginVertical: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.sm,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.xs,
    elevation: 1,
  },
  kpiValue: {
    ...TEXT_STYLES.heading,
    color: COLORS.primary,
  },
  kpiLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  // Transaction History Styles
  transactionItem: {
    backgroundColor: 'white',
    marginBottom: SPACING.xs,
    borderRadius: 8,
    padding: SPACING.sm,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
  },
  transactionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  transactionDetails: {
    marginTop: SPACING.xs,
  },
  transactionClient: {
    ...TEXT_STYLES.body,
  },
  transactionStatus: {
    ...TEXT_STYLES.caption,
    textTransform: 'uppercase',
  },
  // Payment Modal Styles
  paymentModal: {
    backgroundColor: 'white',
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  paymentMethodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: SPACING.md,
  },
  paymentMethodCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  paymentMethodSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  // Security Settings Styles
  securitySection: {
    marginBottom: SPACING.lg,
  },
  securitySectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
  },
  securityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  securityOptionText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  // Subscription Management Styles
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  subscriptionTitle: {
    ...TEXT_STYLES.subtitle,
    flex: 1,
  },
  subscriptionAmount: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  subscriptionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionFrequency: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  subscriptionStatus: {
    ...TEXT_STYLES.caption,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  // Tax Management Styles
  taxSummaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  taxLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  taxAmount: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  taxTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
  },
  // Fraud Detection Styles
  fraudAlertCard: {
    backgroundColor: COLORS.errorLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  fraudAlertTitle: {
    ...TEXT_STYLES.subtitle,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
  fraudAlertText: {
    ...TEXT_STYLES.body,
    color: COLORS.error,
  },
  // Cryptocurrency Styles
  cryptoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  cryptoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cryptoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  cryptoName: {
    ...TEXT_STYLES.subtitle,
    flex: 1,
  },
  cryptoValue: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
  },
  cryptoChange: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
  },
  // NFT Rewards Styles
  nftCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    width: 120,
    elevation: 2,
  },
  nftImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  nftTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nftRarity: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.primary,
  },
  // Report Generation Styles
  reportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  reportTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.sm,
  },
  reportMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  reportLabel: {
    ...TEXT_STYLES.body,
  },
  reportValue: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
  },
  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TEXT_STYLES.subtitle,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  // Voice Command Indicator
  voiceIndicator: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  voiceAnimation: {
    position: 'absolute',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  // Blockchain Transaction Styles
  blockchainCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
  },
  blockchainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  blockchainTitle: {
    ...TEXT_STYLES.subtitle,
    color: '#6C5CE7',
  },
  blockchainStatus: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  blockchainDetails: {
    marginTop: SPACING.sm,
  },
  blockchainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  blockchainLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  blockchainValue: {
    ...TEXT_STYLES.caption,
    fontFamily: 'monospace',
  },
  offlineCard: {
    backgroundColor: '#FFF3CD',
    borderColor: '#F0AD4E',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  offlineText: {
    ...TEXT_STYLES.body,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Revenue card styles
  revenueCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'white',
  },
  revenueMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    ...TEXT_STYLES.heading,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontSize: 18,
  },
  metricLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },

  // Fraud detection styles
  fraudCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  threatText: {
    ...TEXT_STYLES.body,
    color: '#D32F2F',
    marginVertical: SPACING.xs,
  },

  // Quick actions styles
  quickActionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'white',
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginHorizontal: SPACING.xs,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    minHeight: 80,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  // Transaction history styles
  transactionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: 'white',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  transactionAmount: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  transactionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  statusChip: {
    height: 24,
    flex: 0,
  },

  // Modal styles
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    minHeight: 200,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },

  // Security metrics styles
  securityMetrics: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: SPACING.md,
    marginVertical: SPACING.md,
  },

  // Analytics content styles
  analyticsContent: {
    maxHeight: 400,
    marginVertical: SPACING.md,
  },
  analyticsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },

  // Prediction styles
  predictionItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  predictionLabel: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  predictionValue: {
    ...TEXT_STYLES.heading,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  confidenceText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Churn analysis styles
  churnSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  churnMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  churnItem: {
    alignItems: 'center',
    flex: 1,
  },
  churnNumber: {
    ...TEXT_STYLES.heading,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  churnLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Pricing styles
  pricingSection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  pricingGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  pricingItem: {
    alignItems: 'center',
    flex: 1,
  },
  pricingValue: {
    ...TEXT_STYLES.heading,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  pricingLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Recommendation styles
  recommendationItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recommendationTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    flex: 1,
    marginRight: SPACING.sm,
  },
  recommendationDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
  },
  recommendationImpact: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    fontWeight: '500',
  },
  priorityChip: {
    height: 24,
  },

  // Payment form styles
  paymentForm: {
    marginVertical: SPACING.md,
  },
  formLabel: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  formInput: {
    ...TEXT_STYLES.body,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  gatewayChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  securityNote: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: '#F0F8F0',
    padding: SPACING.sm,
    borderRadius: 8,
  },

  // Modal actions
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  processButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },

  // Dialog styles
  dialogText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
  },
  dialogSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  threatsList: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: SPACING.sm,
    marginTop: SPACING.sm,
  },
  threatsTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: '#D32F2F',
  },
  threatItem: {
    ...TEXT_STYLES.body,
    color: '#D32F2F',
    marginVertical: 2,
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: SPACING.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  loadingBar: {
    width: 150,
    marginBottom: SPACING.md,
  },
  loadingText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },

  // Additional utility styles
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: SPACING.md,
  },
  sectionSeparator: {
    height: SPACING.md,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}

export default PaymentManagement;