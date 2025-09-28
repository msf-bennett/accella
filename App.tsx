//App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';
import { PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import { LogBox } from 'react-native';

// Proper import statements with TypeScript support
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineSyncManager from './src/components/offlinemanager/OfflineSyncManager';
import { initializeNetworkMonitoring } from './src/store/slices/networkSlice';
import { initializeGoogleSignIn } from './src/store/actions/registrationActions';
import FirebaseService from './src/services/FirebaseService';
import { initializeFirebaseApp, setupAutoSyncRetry } from './src/config/firebaseInit';

// NEW: AI Service imports
import AIService from './src/services/AIService';

// Type for the dispatch function
import type { AppDispatch } from './src/store/store';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Require cycle:',
  'Module TurboModuleRegistry',
  'TensorFlow.js', // Add this to ignore TF warnings
]);

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeApp = async (): Promise<void> => {
      try {
        // Initialize network monitoring with proper typing
        console.log('Initializing network monitoring...');
        const networkResult = await dispatch(initializeNetworkMonitoring());
        if (initializeNetworkMonitoring.fulfilled.match(networkResult)) {
          console.log('Network monitoring initialized successfully');
        } else if (initializeNetworkMonitoring.rejected.match(networkResult)) {
          console.warn('Network monitoring initialization failed:', networkResult.payload);
        }
        
        // NEW: Initialize AI Service
        console.log('Initializing AI services...');
        try {
          await AIService.initialize();
          console.log('AI services initialized successfully');
        } catch (aiError) {
          console.warn('AI service initialization failed, continuing without AI features:', aiError);
        }
        
        // Initialize Firebase service
        console.log('Initializing Firebase service...');
        await FirebaseService.initialize();
        
        // Initialize Google Sign-In with error handling
        try {
          console.log('Initializing Google Sign-In...');
          const googleSignInResult = await dispatch(initializeGoogleSignIn());
          if (typeof googleSignInResult.type === 'string' && googleSignInResult.type.endsWith('/fulfilled')) {
            console.log('Google Sign-In initialized successfully');
          } else {
            console.warn('Google Sign-In initialization had issues:', googleSignInResult);
          }
        } catch (googleError) {
          console.warn('Google Sign-In initialization failed:', googleError);
          // Continue app initialization even if Google Sign-In fails
        }
        
        // Initialize authentication bridge for messaging
        try {
          console.log('🔗 Initializing authentication bridge...');
          await initializeAuthBridge();
        } catch (authError) {
          console.warn('Authentication bridge initialization failed:', authError);
          // Continue app initialization even if auth bridge fails
        }
        
        console.log('App initialization complete');
      } catch (error) {
        console.error('App initialization error:', error);
        // Don't throw error - let app continue in offline mode
      }
    };

    initializeApp();
  }, [dispatch]);

  return <>{children}</>;
};

// Authentication bridge initialization function (unchanged)
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
          
          if (bridgeResult.user.isOfflineMode) {
            console.log('📱 Operating in offline mode');
          } else {
            console.log('☁️ Connected to Firebase for messaging');
          }
          
          if (typeof ChatService.initializeService === 'function') {
            const chatInitResult = await ChatService.initializeService();
            console.log('💬 Chat service initialization result:', chatInitResult.success ? 'Success' : 'Failed');
          }
          
        } else {
          console.log('⚠️ Authentication bridge failed:', bridgeResult.reason);
          
          if (typeof ChatService.enableMessagingFallback === 'function') {
            console.log('🔧 Trying messaging fallback...');
            const fallbackResult = await ChatService.enableMessagingFallback();
            if (fallbackResult.success) {
              console.log('✅ Messaging fallback enabled');
            }
          }
        }
      } else {
        console.log('⚠️ Authentication bridge method not available, using basic init');
        
        if (typeof ChatService.initializeService === 'function') {
          await ChatService.initializeService();
        }
      }
      
    } catch (bridgeError) {
      console.error('❌ Authentication bridge error:', bridgeError);
      
      try {
        if (typeof ChatService.enableMessagingFallback === 'function') {
          console.log('🔧 Enabling messaging fallback after bridge error...');
          await ChatService.enableMessagingFallback();
        }
      } catch (fallbackError) {
        console.error('❌ Even fallback messaging failed:', fallbackError);
      }
    }
    
  } catch (error) {
    console.error('❌ Auth bridge initialization error:', error);
  }
};

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
  },
};

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Initializing...' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
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

  useEffect(() => {
    let retryInterval: NodeJS.Timeout | null = null;
    
    const initializeApp = async (): Promise<void> => {
      console.log('Starting app initialization...');
      
      try {
        // Initialize Firebase with error handling and proper typing
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
        
        // NEW: Initialize AI Service early
        try {
          console.log('Pre-initializing AI services...');
          await AIService.initialize();
          setAiStatus('ready');
          console.log('AI services ready');
        } catch (aiError) {
          console.warn('AI services failed to initialize:', aiError);
          setAiStatus('offline');
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

    return () => {
      clearTimeout(timer);
      if (retryInterval) {
        clearInterval(retryInterval);
      }
    };
  }, []);

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
            <NavigationContainer>
              <StatusBar barStyle="default" />
              
              <OfflineSyncManager />
              <AppNavigator />
              
              {/* Enhanced status indicators */}
              {(__DEV__ || firebaseMode === 'offline' || aiStatus !== 'ready') && (
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
                </View>
              )}
            </NavigationContainer>
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
    top: 50,
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
  offlineText: {
    color: '#856404',
    fontSize: 12,
    textAlign: 'center',
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
    color: '#007AFF',
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
    fontFamily: 'monospace',
  },
});