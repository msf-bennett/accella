// src/store/slices/networkSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import NetInfo, { NetInfoState, NetInfoStateType, NetInfoSubscription } from '@react-native-community/netinfo';
import FirebaseService from '../../services/FirebaseService';

// Types
interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: NetInfoStateType | null;
  connectionQuality: ConnectionQuality;
}

interface ConnectionHistoryEntry extends NetworkState {
  timestamp: string;
  previousState: NetworkState;
}

interface NetworkError {
  type: string;
  message: string;
  timestamp: string;
}

interface NetworkWarning {
  type: string;
  message: string;
  timestamp: string;
}

interface FirebaseConnectionResult {
  success: boolean;
  error?: string;
}

interface InitializeNetworkResult {
  initialState: NetworkState;
  unsubscribe: NetInfoSubscription;
}

type ConnectionQuality = 'offline' | 'poor' | 'fair' | 'good' | 'excellent' | 'unknown';

interface NetworkSliceState {
  // Connection status
  isConnected: boolean;
  isInternetReachable: boolean;
  type: NetInfoStateType | null;
  connectionQuality: ConnectionQuality;
  
  // Firebase connectivity
  firebaseConnected: boolean;
  firebaseError: string | null;
  lastFirebaseCheck: string | null;
  
  // Monitoring state
  isInitialized: boolean;
  isMonitoring: boolean;
  lastUpdated: string | null;
  
  // Connection history
  connectionHistory: ConnectionHistoryEntry[];
  maxHistoryLength: number;
  
  // Feature availability
  canUseOnlineFeatures: boolean;
  canUseAuth: boolean;
  canSync: boolean;
  
  // Error tracking
  errors: NetworkError[];
  warnings: NetworkWarning[];
}

// Async thunks with proper typing
export const initializeNetworkMonitoring = createAsyncThunk<
  InitializeNetworkResult,
  void,
  { rejectValue: string }
>(
  'network/initializeMonitoring',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Get initial network state
      const networkState = await NetInfo.fetch();
      
      const initialState: NetworkState = {
        isConnected: networkState.isConnected || false,
        isInternetReachable: networkState.isInternetReachable || false,
        type: networkState.type,
        connectionQuality: getConnectionQuality(networkState)
      };
      
      // Set up network listener
      const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        dispatch(updateNetworkState({
          isConnected: state.isConnected || false,
          isInternetReachable: state.isInternetReachable || false,
          type: state.type,
          connectionQuality: getConnectionQuality(state)
        }));
      });
      
      return { initialState, unsubscribe };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

export const checkConnectivity = createAsyncThunk<
  NetworkState,
  void,
  { rejectValue: string }
>(
  'network/checkConnectivity',
  async (_, { rejectWithValue }) => {
    try {
      const networkState = await NetInfo.fetch();
      return {
        isConnected: networkState.isConnected || false,
        isInternetReachable: networkState.isInternetReachable || false,
        type: networkState.type,
        connectionQuality: getConnectionQuality(networkState)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

export const testFirebaseConnection = createAsyncThunk<
  FirebaseConnectionResult,
  void
>(
  'network/testFirebaseConnection',
  async () => {
    try {
      // Test Firebase connectivity
      const result = await FirebaseService.testConnectionWithTimeout(5000);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }
);

// Helper function to determine connection quality
function getConnectionQuality(state: NetInfoState): ConnectionQuality {
  if (!state.isConnected || !state.isInternetReachable) {
    return 'offline';
  }

  switch (state.type) {
    case 'wifi':
      return 'excellent';
    case 'cellular':
      if (state.details && 'cellularGeneration' in state.details) {
        switch (state.details.cellularGeneration) {
          case '5g':
          case '4g':
            return 'good';
          case '3g':
            return 'fair';
          case '2g':
            return 'poor';
          default:
            return 'fair';
        }
      }
      return 'good';
    case 'ethernet':
      return 'excellent';
    case 'other':
    case 'unknown':
    default:
      return 'unknown';
  }
}

// Initial state
const initialState: NetworkSliceState = {
  // Connection status
  isConnected: false,
  isInternetReachable: false,
  type: null,
  connectionQuality: 'unknown',
  
  // Firebase connectivity
  firebaseConnected: false,
  firebaseError: null,
  lastFirebaseCheck: null,
  
  // Monitoring state
  isInitialized: false,
  isMonitoring: false,
  lastUpdated: null,
  
  // Connection history
  connectionHistory: [],
  maxHistoryLength: 10,
  
  // Feature availability
  canUseOnlineFeatures: false,
  canUseAuth: false,
  canSync: false,
  
  // Error tracking
  errors: [],
  warnings: []
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    updateNetworkState: (state, action: PayloadAction<NetworkState>) => {
      const newState = action.payload;
      const previousState: NetworkState = {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        connectionQuality: state.connectionQuality
      };
      
      // Update connection state
      state.isConnected = newState.isConnected;
      state.isInternetReachable = newState.isInternetReachable;
      state.type = newState.type;
      state.connectionQuality = newState.connectionQuality;
      state.lastUpdated = new Date().toISOString();
      
      // Update feature availability
      state.canUseOnlineFeatures = newState.isConnected && newState.isInternetReachable;
      state.canUseAuth = state.canUseOnlineFeatures;
      state.canSync = state.canUseOnlineFeatures;
      
      // Add to connection history if state changed
      if (
        previousState.isConnected !== newState.isConnected ||
        previousState.connectionQuality !== newState.connectionQuality
      ) {
        state.connectionHistory.unshift({
          ...newState,
          timestamp: new Date().toISOString(),
          previousState
        });
        
        // Keep history within limits
        if (state.connectionHistory.length > state.maxHistoryLength) {
          state.connectionHistory = state.connectionHistory.slice(0, state.maxHistoryLength);
        }
      }
      
      // Clear warnings when coming back online
      if (newState.isConnected && !previousState.isConnected) {
        state.warnings = [];
      }
      
      // Add warning when going offline
      if (!newState.isConnected && previousState.isConnected) {
        state.warnings.push({
          type: 'connection_lost',
          message: 'Connection lost. Some features may be unavailable.',
          timestamp: new Date().toISOString()
        });
      }
    },
    
    setFirebaseConnectionStatus: (state, action: PayloadAction<{ connected: boolean; error?: string }>) => {
      const { connected, error } = action.payload;
      state.firebaseConnected = connected;
      state.firebaseError = error || null;
      state.lastFirebaseCheck = new Date().toISOString();
      
      if (!connected && error) {
        state.errors.push({
          type: 'firebase_connection',
          message: error,
          timestamp: new Date().toISOString()
        });
      }
    },
    
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    
    setMonitoring: (state, action: PayloadAction<boolean>) => {
      state.isMonitoring = action.payload;
    },
    
    addError: (state, action: PayloadAction<Omit<NetworkError, 'timestamp'>>) => {
      const error: NetworkError = {
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.errors.push(error);
      
      // Keep only last 20 errors
      if (state.errors.length > 20) {
        state.errors = state.errors.slice(-20);
      }
    },
    
    addWarning: (state, action: PayloadAction<Omit<NetworkWarning, 'timestamp'>>) => {
      const warning: NetworkWarning = {
        ...action.payload,
        timestamp: new Date().toISOString()
      };
      state.warnings.push(warning);
      
      // Keep only last 10 warnings
      if (state.warnings.length > 10) {
        state.warnings = state.warnings.slice(-10);
      }
    },
    
    clearErrors: (state) => {
      state.errors = [];
    },
    
    clearWarnings: (state) => {
      state.warnings = [];
    },
    
    removeError: (state, action: PayloadAction<number>) => {
      const errorIndex = action.payload;
      if (errorIndex >= 0 && errorIndex < state.errors.length) {
        state.errors.splice(errorIndex, 1);
      }
    },
    
    removeWarning: (state, action: PayloadAction<number>) => {
      const warningIndex = action.payload;
      if (warningIndex >= 0 && warningIndex < state.warnings.length) {
        state.warnings.splice(warningIndex, 1);
      }
    },
    
    updateFeatureAvailability: (state, action: PayloadAction<{ canUseOnlineFeatures?: boolean; canUseAuth?: boolean; canSync?: boolean }>) => {
      const { canUseOnlineFeatures, canUseAuth, canSync } = action.payload;
      if (canUseOnlineFeatures !== undefined) state.canUseOnlineFeatures = canUseOnlineFeatures;
      if (canUseAuth !== undefined) state.canUseAuth = canUseAuth;
      if (canSync !== undefined) state.canSync = canSync;
    },
    
    resetNetworkState: () => initialState
  },
  
  extraReducers: (builder) => {
    builder
      // Initialize network monitoring
      .addCase(initializeNetworkMonitoring.pending, (state) => {
        state.isInitialized = false;
      })
      .addCase(initializeNetworkMonitoring.fulfilled, (state, action) => {
        const { initialState: netState } = action.payload;
        state.isConnected = netState.isConnected;
        state.isInternetReachable = netState.isInternetReachable;
        state.type = netState.type;
        state.connectionQuality = netState.connectionQuality;
        state.canUseOnlineFeatures = netState.isConnected && netState.isInternetReachable;
        state.canUseAuth = state.canUseOnlineFeatures;
        state.canSync = state.canUseOnlineFeatures;
        state.isInitialized = true;
        state.isMonitoring = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(initializeNetworkMonitoring.rejected, (state, action) => {
        state.isInitialized = false;
        state.errors.push({
          type: 'initialization_error',
          message: action.payload || 'Unknown initialization error',
          timestamp: new Date().toISOString()
        });
      })
      
      // Check connectivity
      .addCase(checkConnectivity.fulfilled, (state, action) => {
        const newState = action.payload;
        state.isConnected = newState.isConnected;
        state.isInternetReachable = newState.isInternetReachable;
        state.type = newState.type;
        state.connectionQuality = newState.connectionQuality;
        state.canUseOnlineFeatures = newState.isConnected && newState.isInternetReachable;
        state.canUseAuth = state.canUseOnlineFeatures;
        state.canSync = state.canUseOnlineFeatures;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(checkConnectivity.rejected, (state, action) => {
        state.errors.push({
          type: 'connectivity_check_error',
          message: action.payload || 'Unknown connectivity error',
          timestamp: new Date().toISOString()
        });
      })
      
      // Test Firebase connection
      .addCase(testFirebaseConnection.fulfilled, (state, action) => {
        state.firebaseConnected = action.payload.success;
        state.firebaseError = action.payload.error || null;
        state.lastFirebaseCheck = new Date().toISOString();
        
        if (!action.payload.success) {
          state.errors.push({
            type: 'firebase_test_failed',
            message: action.payload.error || 'Firebase connection test failed',
            timestamp: new Date().toISOString()
          });
        }
      });
  }
});

// Export actions
export const {
  updateNetworkState,
  setFirebaseConnectionStatus,
  setInitialized,
  setMonitoring,
  addError,
  addWarning,
  clearErrors,
  clearWarnings,
  removeError,
  removeWarning,
  updateFeatureAvailability,
  resetNetworkState
} = networkSlice.actions;

// Root state type (you should define this in your store)
export interface RootState {
  network: NetworkSliceState;
  // Add other slices here
}

// Selectors with proper typing
export const selectNetwork = (state: RootState) => state.network;
export const selectIsOnline = (state: RootState) => state.network.isConnected && state.network.isInternetReachable;
export const selectCanUseOnlineFeatures = (state: RootState) => state.network.canUseOnlineFeatures;
export const selectCanUseAuth = (state: RootState) => state.network.canUseAuth;
export const selectCanSync = (state: RootState) => state.network.canSync;
export const selectConnectionQuality = (state: RootState) => state.network.connectionQuality;
export const selectNetworkType = (state: RootState) => state.network.type;
export const selectFirebaseConnected = (state: RootState) => state.network.firebaseConnected;
export const selectNetworkErrors = (state: RootState) => state.network.errors;
export const selectNetworkWarnings = (state: RootState) => state.network.warnings;
export const selectConnectionHistory = (state: RootState) => state.network.connectionHistory;
export const selectNetworkInitialized = (state: RootState) => state.network.isInitialized;

// Computed selectors
export const selectConnectionStatus = (state: RootState) => {
  const { isConnected, isInternetReachable, connectionQuality, isInitialized } = state.network;
  
  if (!isInitialized) {
    return 'checking';
  }
  
  if (!isConnected) {
    return 'offline';
  }
  
  if (!isInternetReachable) {
    return 'no_internet';
  }
  
  return connectionQuality;
};

export const selectShouldShowOfflineWarning = (state: RootState) => {
  const { isConnected, isInternetReachable, isInitialized } = state.network;
  return isInitialized && (!isConnected || !isInternetReachable);
};

export const selectNetworkStatusMessage = (state: RootState) => {
  const status = selectConnectionStatus(state);
  
  switch (status) {
    case 'checking':
      return 'Checking connection...';
    case 'offline':
      return 'No network connection';
    case 'no_internet':
      return 'Connected but no internet access';
    case 'excellent':
      return 'Excellent connection';
    case 'good':
      return 'Good connection';
    case 'fair':
      return 'Fair connection';
    case 'poor':
      return 'Poor connection';
    case 'unknown':
    default:
      return 'Connected';
  }
};

export const selectHasRecentConnectionIssues = (state: RootState) => {
  const { connectionHistory } = state.network;
  const recentHistory = connectionHistory.slice(0, 5);
  
  return recentHistory.some(entry => 
    !entry.isConnected || !entry.isInternetReachable
  );
};

export default networkSlice.reducer;