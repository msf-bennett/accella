import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Custom hook for network status detection and monitoring
 * Provides real-time connectivity status and connection quality information
 */
const useNetworkStatus = () => {
  const [networkState, setNetworkState] = useState({
    isConnected: true,
    isInternetReachable: true,
    type: null,
    isInitialized: false,
    connectionQuality: 'unknown'
  });

  const [listeners, setListeners] = useState([]);

  useEffect(() => {
    let unsubscribe = null;
    let mounted = true;

    const initializeNetworkMonitoring = async () => {
      try {
        // Get initial network state
        const initialState = await NetInfo.fetch();
        
        if (mounted) {
          setNetworkState({
            isConnected: initialState.isConnected || false,
            isInternetReachable: initialState.isInternetReachable || false,
            type: initialState.type,
            isInitialized: true,
            connectionQuality: getConnectionQuality(initialState)
          });
        }

        // Subscribe to network state changes
        unsubscribe = NetInfo.addEventListener(state => {
          if (mounted) {
            setNetworkState(prevState => ({
              ...prevState,
              isConnected: state.isConnected || false,
              isInternetReachable: state.isInternetReachable || false,
              type: state.type,
              connectionQuality: getConnectionQuality(state)
            }));

            // Notify any registered listeners
            listeners.forEach(listener => {
              try {
                listener({
                  isConnected: state.isConnected || false,
                  isInternetReachable: state.isInternetReachable || false,
                  type: state.type,
                  connectionQuality: getConnectionQuality(state)
                });
              } catch (error) {
                console.warn('Error in network status listener:', error);
              }
            });
          }
        });

      } catch (error) {
        console.error('Error initializing network monitoring:', error);
        if (mounted) {
          setNetworkState(prevState => ({
            ...prevState,
            isInitialized: true,
            isConnected: false,
            isInternetReachable: false
          }));
        }
      }
    };

    initializeNetworkMonitoring();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  /**
   * Determine connection quality based on network state
   * @param {Object} state - NetInfo state object
   * @returns {string} Connection quality indicator
   */
  const getConnectionQuality = (state) => {
    if (!state.isConnected || !state.isInternetReachable) {
      return 'offline';
    }

    switch (state.type) {
      case 'wifi':
        return 'good';
      case 'cellular':
        // Check cellular generation if available
        if (state.details && state.details.cellularGeneration) {
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
        return 'fair';
      case 'ethernet':
        return 'excellent';
      case 'other':
      case 'unknown':
      default:
        return 'unknown';
    }
  };

  /**
   * Add a listener for network status changes
   * @param {Function} listener - Callback function to be called on network changes
   * @returns {Function} Cleanup function to remove the listener
   */
  const addNetworkListener = (listener) => {
    setListeners(prev => [...prev, listener]);
    
    return () => {
      setListeners(prev => prev.filter(l => l !== listener));
    };
  };

  /**
   * Check if device is online with internet access
   * @returns {boolean} True if online and internet reachable
   */
  const isOnline = () => {
    return networkState.isConnected && networkState.isInternetReachable;
  };

  /**
   * Check if device has any network connection (may not have internet access)
   * @returns {boolean} True if connected to any network
   */
  const isConnected = () => {
    return networkState.isConnected;
  };

  /**
   * Get human-readable connection status
   * @returns {string} Status description
   */
  const getConnectionStatus = () => {
    if (!networkState.isInitialized) {
      return 'Checking connection...';
    }

    if (!networkState.isConnected) {
      return 'No network connection';
    }

    if (!networkState.isInternetReachable) {
      return 'Connected but no internet access';
    }

    switch (networkState.connectionQuality) {
      case 'excellent':
        return 'Excellent connection';
      case 'good':
        return 'Good connection';
      case 'fair':
        return 'Fair connection';
      case 'poor':
        return 'Poor connection';
      case 'offline':
        return 'Offline';
      default:
        return 'Connected';
    }
  };

  /**
   * Manually refresh network status
   * Useful for user-initiated connectivity checks
   */
  const refreshNetworkStatus = async () => {
    try {
      const state = await NetInfo.fetch();
      setNetworkState(prevState => ({
        ...prevState,
        isConnected: state.isConnected || false,
        isInternetReachable: state.isInternetReachable || false,
        type: state.type,
        connectionQuality: getConnectionQuality(state)
      }));
      
      return {
        isConnected: state.isConnected || false,
        isInternetReachable: state.isInternetReachable || false,
        type: state.type,
        connectionQuality: getConnectionQuality(state)
      };
    } catch (error) {
      console.error('Error refreshing network status:', error);
      throw error;
    }
  };

  return {
    // Current network state
    ...networkState,
    
    // Convenience methods
    isOnline: isOnline(),
    isConnected: isConnected(),
    
    // Status methods
    getConnectionStatus,
    getConnectionQuality: () => networkState.connectionQuality,
    
    // Utility methods
    addNetworkListener,
    refreshNetworkStatus,
    
    // Boolean flags for quick checks
    canUseOnlineFeatures: isOnline(),
    shouldShowOfflineMessage: !isOnline() && networkState.isInitialized,
    isCheckingConnection: !networkState.isInitialized
  };
};

export default useNetworkStatus;