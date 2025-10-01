import React, { useEffect, useState, useRef } from 'react';
import { StatusBar, View, Text, StyleSheet, AppState, Platform, AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { NavigationContainerRef } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { LogBox } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Proper import statements with TypeScript support
import { store } from './src/store/store';
import type { AppDispatch } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineSyncManager from './src/components/offlinemanager/OfflineSyncManager';
import { initializeNetworkMonitoring } from './src/store/slices/networkSlice';
import { initializeGoogleSignIn } from './src/store/actions/registrationActions';
import FirebaseService from './src/services/FirebaseService';
import { initializeFirebaseApp, setupAutoSyncRetry } from './src/config/firebaseInit';

// AI Service imports
import AIService from './src/services/AIService';

// SessionProvider import
import { SessionProvider } from './src/contexts/SessionContext';

// Push Notification Service
import PushNotificationService from './src/services/PushNotificationService';
import NotificationService from './src/services/NotificationService';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Require cycle:',
  'Module TurboModuleRegistry',
  'TensorFlow.js',
  'Sending `onAnimatedValueUpdate`',
]);

interface AppInitializerProps {
  children: React.ReactNode;
}

// Global navigation ref for deep linking from notifications
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

// Configure notification handler BEFORE component mounts
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data as Record<string, any>;
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: data?.priority === 'high' 
        ? Notifications.AndroidNotificationPriority.HIGH 
        : Notifications.AndroidNotificationPriority.DEFAULT,
    };
  },
});

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        // Initialize network monitoring
        console.log('Initializing network monitoring...');
        const networkResult = await dispatch(initializeNetworkMonitoring());
        if (initializeNetworkMonitoring.fulfilled.match(networkResult)) {
          console.log('Network monitoring initialized successfully');
        }
        
        // Initialize AI Service
        console.log('Initializing AI services...');
        try {
          await AIService.initialize();
          console.log('AI services initialized successfully');
        } catch (aiError) {
          console.warn('AI service initialization failed:', aiError);
        }
        
        // Initialize Firebase service
        console.log('Initializing Firebase service...');
        await FirebaseService.initialize();
        
        // Initialize Google Sign-In
        try {
          console.log('Initializing Google Sign-In...');
          await dispatch(initializeGoogleSignIn());
        } catch (googleError) {
          console.warn('Google Sign-In initialization failed:', googleError);
        }
        
        // Initialize Push Notifications
        try {
          console.log('🔔 Initializing push notifications...');
          if (Platform.OS === 'web') {
            // Web notification setup
            await setupWebNotifications();
          } else {
            // Mobile notification setup
            await PushNotificationService.initialize();
          }
          console.log('✅ Push notifications initialized');
        } catch (notifError) {
          console.warn('⚠️ Push notification initialization failed:', notifError);
        }
        
        // Initialize authentication bridge
        try {
          console.log('🔗 Initializing authentication bridge...');
          await initializeAuthBridge();
        } catch (authError) {
          console.warn('Authentication bridge initialization failed:', authError);
        }
        
        console.log('App initialization complete');
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();

    // Setup AppState listener for background/foreground transitions
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App came to foreground, syncing notifications...');
        syncNotificationsOnForeground();
      }
      appState.current = nextAppState;
    });

    // Setup web notification click listener
    if (Platform.OS === 'web') {
      const handleWebNotificationClick = (event: any) => {
        const data = event.detail?.data;
        if (data?.sessionData && navigationRef.current) {
          navigationRef.current.navigate('SessionScheduleScreen', {
            sessionData: data.sessionData,
            planTitle: data.sessionData.planTitle,
            academyName: data.sessionData.academyName || 'Training Academy',
          });
        }
      };

      window.addEventListener('notificationClick', handleWebNotificationClick);

      return () => {
        subscription.remove();
        window.removeEventListener('notificationClick', handleWebNotificationClick);
      };
    }

    return () => {
      subscription.remove();
    };
  }, [dispatch]);

  const syncNotificationsOnForeground = async (): Promise<void> => {
    try {
      const DocumentProcessor = require('./src/services/DocumentProcessor').default;
      const SessionExtractor = require('./src/services/SessionExtractor').default;
      
      const plans = await DocumentProcessor.getTrainingPlans();
      const allSessions: any[] = [];
      
      for (const plan of plans) {
        if (plan.sourceDocument) {
          const documents = await DocumentProcessor.getStoredDocuments();
          const sourceDoc = documents.find((doc: any) => doc.id === plan.sourceDocument);
          
          if (sourceDoc) {
            const extractionResult = await SessionExtractor.extractSessionsFromDocument(sourceDoc, plan);
            
            if (extractionResult?.sessions) {
              extractionResult.sessions.forEach((weekSession: any) => {
                if (weekSession.dailySessions?.length > 0) {
                  weekSession.dailySessions.forEach((dailySession: any) => {
                    allSessions.push({
                      ...dailySession,
                      id: `daily_${dailySession.id}`,
                      planTitle: plan.title,
                      sourcePlan: plan.id,
                    });
                  });
                }
              });
            }
          }
        }
      }
      
      // Sync notifications
      await NotificationService.syncNotifications(allSessions);
      
      // Update badge count
      const notifications = await NotificationService.getNotifications();
      const unreadCount = notifications.filter((n: any) => !n.read).length;
      await PushNotificationService.setBadgeCount(unreadCount);
      
    } catch (error) {
      console.error('Error syncing notifications on foreground:', error);
    }
  };

  return <>{children}</>;
};

// Authentication bridge initialization
const initializeAuthBridge = async (): Promise<void> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const AuthService = require('./src/services/AuthService').default;
    const ChatService = require('./src/services/ChatService').default;
    
    if (!AuthService || !ChatService) {
      console.warn('⚠️ Services not available for auth bridge');
      return;
    }
    
    console.log('🔄 Starting authentication bridge...');
    
    try {
      if (typeof AuthService.bridgeLocalToFirebase === 'function') {
        const bridgeResult = await AuthService.bridgeLocalToFirebase();
        
        if (bridgeResult.success) {
          console.log('✅ Authentication bridge successful');
          
          if (typeof ChatService.initializeService === 'function') {
            await ChatService.initializeService();
          }
        } else {
          console.log('⚠️ Authentication bridge failed:', bridgeResult.reason);
          
          if (typeof ChatService.enableMessagingFallback === 'function') {
            await ChatService.enableMessagingFallback();
          }
        }
      }
    } catch (bridgeError) {
      console.error('❌ Authentication bridge error:', bridgeError);
    }
  } catch (error) {
    console.error('❌ Auth bridge initialization error:', error);
  }
};

// Setup web notifications
const setupWebNotifications = async (): Promise<void> => {
  try {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return;
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      // Request permission after a short delay (better UX)
      setTimeout(async () => {
        permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Web notification permission granted');
          
          // Show a welcome notification
          new Notification('Acceilla Training', {
            body: 'Notifications enabled! You\'ll receive updates about your training sessions.',
            icon: '/favicon.png',
          });
        }
      }, 3000);
    } else if (permission === 'granted') {
      console.log('✅ Web notifications already permitted');
    } else {
      console.warn('⚠️ Web notification permission denied');
    }
  } catch (error) {
    console.error('Error setting up web notifications:', error);
  }
};

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#667eea',
    secondary: '#764ba2',
  },
};

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Initializing...' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#667eea" />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

interface FirebaseInitResult {
  success: boolean;
  mode: string;
  error?: string;
}

export default function App(): React.ReactElement {
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);
  const [firebaseMode, setFirebaseMode] = useState<string>('offline');
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<string>('initializing');
  const [pushToken, setPushToken] = useState<string | null>(null);
  
  // Notification listeners
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    let retryInterval: NodeJS.Timeout | null = null;
    
    const initializeApp = async (): Promise<void> => {
      console.log('Starting app initialization...');
      
      try {
        // Initialize Firebase
        console.log('Initializing Firebase app...');
        const firebaseResult: FirebaseInitResult = await initializeFirebaseApp();
        
        if (firebaseResult && firebaseResult.success) {
          setFirebaseMode(firebaseResult.mode);
          console.log(`Firebase initialized in ${firebaseResult.mode} mode`);
          
          if (firebaseResult.mode === 'online') {
            retryInterval = setupAutoSyncRetry();
          }
        } else {
          console.warn('Firebase initialization failed, continuing in offline mode');
          setFirebaseMode('offline');
          setInitializationError(firebaseResult?.error || 'Unknown Firebase initialization error');
        }
        
        // Initialize AI Service
        try {
          console.log('Pre-initializing AI services...');
          await AIService.initialize();
          setAiStatus('ready');
          console.log('AI services ready');
        } catch (aiError) {
          console.warn('AI services failed to initialize:', aiError);
          setAiStatus('offline');
        }
        
        // Initialize Push Notifications
        try {
          console.log('🔔 Initializing push notification system...');
          const token = await PushNotificationService.initialize();
          if (token) {
            setPushToken(token);
            console.log('✅ Push notifications ready, token:', token.substring(0, 20) + '...');
          }
        } catch (notifError) {
          console.warn('⚠️ Push notifications failed to initialize:', notifError);
        }
        
        setIsFirebaseReady(true);
        
      } catch (error) {
        console.error('App initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitializationError(errorMessage);
        setFirebaseMode('offline');
        setAiStatus('offline');
        setIsFirebaseReady(true);
      }
    };

    const timer = setTimeout(initializeApp, 100);

    // Setup notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification.request.content.title);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response.notification.request.content.data);
      handleNotificationResponse(response);
    });

    return () => {
      clearTimeout(timer);
      if (retryInterval) {
        clearInterval(retryInterval);
      }
      
      // Cleanup notification listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Handle notification responses (taps and actions)
  const handleNotificationResponse = async (response: Notifications.NotificationResponse): Promise<void> => {
    const { actionIdentifier, notification } = response;
    const data = notification.request.content.data as Record<string, any>;

    console.log('🔔 Notification action:', actionIdentifier);

    try {
      const SessionManager = require('./src/utils/sessionManager').default;
      const { SessionStatus } = require('./src/utils/sessionManager');

      switch (actionIdentifier) {
        case 'START_SESSION':
        case 'DO_NOW':
          if (data.sessionData && navigationRef.current) {
            navigationRef.current.navigate('SessionScheduleScreen', {
              sessionData: data.sessionData,
              planTitle: data.sessionData.planTitle,
              academyName: data.sessionData.academyName || 'Training Academy',
              autoStart: true,
            });
          }
          break;

        case 'SKIP_SESSION':
          if (data.sessionId) {
            await SessionManager.updateSessionStatus(
              data.sessionId,
              SessionStatus.SKIPPED,
              { skippedAt: new Date().toISOString() }
            );
            await PushNotificationService.cancelNotification(data.notificationId);
            await NotificationService.deleteNotification(data.notificationId);
          }
          break;

        case 'MARK_READ':
          if (data.notificationId) {
            await NotificationService.markAsRead(data.notificationId);
            await PushNotificationService.cancelNotification(data.notificationId);
          }
          break;

        case 'FEEDBACK_GREAT':
        case 'FEEDBACK_GOOD':
        case 'FEEDBACK_TOUGH':
          await PushNotificationService.saveFeedback(data.sessionId, actionIdentifier);
          await NotificationService.deleteNotification(data.notificationId);
          break;

        case 'VIEW_DETAILS':
          if (data.sessionData && navigationRef.current) {
            navigationRef.current.navigate('SessionScheduleScreen', {
              sessionData: data.sessionData,
              planTitle: data.sessionData.planTitle,
              academyName: data.sessionData.academyName || 'Training Academy',
            });
          }
          break;

        default:
          if (data.sessionData && navigationRef.current) {
            navigationRef.current.navigate('SessionScheduleScreen', {
              sessionData: data.sessionData,
              planTitle: data.sessionData.planTitle,
              academyName: data.sessionData.academyName || 'Training Academy',
            });
          }
          break;
      }
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  };

  // Show loading screen while initializing
  if (!isFirebaseReady) {
    return (
      <PaperProvider theme={theme}>
        <StatusBar barStyle="default" />
        <LoadingScreen message="Setting up Acceilla with AI..." />
      </PaperProvider>
    );
  }

  try {
    return (
      <Provider store={store}>
        <AppInitializer>
          <PaperProvider theme={theme}>
            <SessionProvider>
              <NavigationContainer ref={navigationRef}>
                <StatusBar barStyle="default" />
                
                <OfflineSyncManager />
                <AppNavigator />
                
                {/* Enhanced status indicators */}
                {(__DEV__ || firebaseMode === 'offline' || aiStatus !== 'ready' || !pushToken) && (
                  <View style={styles.statusContainer}>
                    {firebaseMode === 'offline' && (
                      <View style={styles.offlineIndicator}>
                        <Text style={styles.offlineText}>
                          Running in offline mode
                          {initializationError && ` (${initializationError})`}
                        </Text>
                      </View>
                    )}
                    {aiStatus !== 'ready' && __DEV__ && (
                      <View style={[styles.offlineIndicator, styles.aiIndicator]}>
                        <Text style={styles.offlineText}>
                          AI: {aiStatus}
                        </Text>
                      </View>
                    )}
                    {!pushToken && __DEV__ && Device.isDevice && (
                      <View style={[styles.offlineIndicator, styles.notifIndicator]}>
                        <Text style={styles.offlineText}>
                          Notifications: Not configured
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </NavigationContainer>
            </SessionProvider>
          </PaperProvider>
        </AppInitializer>
      </Provider>
    );
  } catch (error) {
    console.error('Critical app error:', error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Acceilla</Text>
        <Text style={styles.errorText}>Starting up...</Text>
        <Text style={styles.errorSubtext}>Please wait a moment</Text>
        {__DEV__ && (
          <Text style={styles.errorDebug}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  statusContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  offlineIndicator: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  aiIndicator: {
    backgroundColor: 'rgba(156, 39, 176, 0.9)',
  },
  notifIndicator: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
  },
  offlineText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  errorDebug: {
    fontSize: 12,
    color: '#999999',
    marginTop: 20,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});