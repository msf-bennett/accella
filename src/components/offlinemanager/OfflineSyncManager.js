import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import FirebaseService from '../../services/FirebaseService';

const OfflineSyncManager = () => {
  const [syncStatus, setSyncStatus] = useState({ syncing: false, error: null });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        console.log('Device came online - attempting sync');
        setSyncStatus({ syncing: true, error: null });
        
        try {
          // Sync offline registrations
          const syncResult = await FirebaseService.syncOfflineRegistrationsToFirebase();
          
          // Process queued operations
          const queueResult = await FirebaseService.processOfflineQueue();
          
          if (syncResult.success || queueResult.success) {
            setSyncStatus({ syncing: false, error: null });
          } else {
            setSyncStatus({ 
              syncing: false, 
              error: syncResult.error || queueResult.error 
            });
          }
        } catch (error) {
          setSyncStatus({ syncing: false, error: error.message });
        }
      }
    });

    return unsubscribe;
  }, []);

  // Don't render anything in production
  if (!__DEV__) return null;

  // Show sync status in development
  if (syncStatus.syncing) {
    return (
      <View style={styles.syncIndicator}>
        <Text style={styles.syncText}>Syncing...</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  syncIndicator: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    padding: 8,
    borderRadius: 4,
    zIndex: 1000,
  },
  syncText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default OfflineSyncManager;