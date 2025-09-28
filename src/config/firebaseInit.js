// src/config/firebaseInit.js
import './firebase.config'; // Import Firebase config first
import FirebaseService from '../services/FirebaseService';

// Initialize Firebase service and handle setup
export const initializeFirebaseApp = async () => {
  try {
    console.log('🚀 Starting Firebase app initialization...');
    
    // Initialize Firebase service
    const initResult = await FirebaseService.initialize();
    
    if (initResult.success) {
      if (initResult.offline) {
        console.log('📱 App initialized in offline mode');
        return { success: true, mode: 'offline' };
      } else {
        console.log('☁️ App initialized with Firebase connection');
        
        // Try to sync any pending offline registrations
        setTimeout(async () => {
          try {
            //console.log('🔄 Checking for offline registrations to sync...');
            const syncResult = await FirebaseService.syncOfflineRegistrationsToFirebase();
            if (syncResult.success && syncResult.syncedCount > 0) {
              console.log(`✅ Synced ${syncResult.syncedCount} offline registrations`);
            }
          } catch (error) {
            console.log('⚠️ Background sync failed:', error.message);
          }
        }, 2000); // Wait 2 seconds after app start
        
        return { success: true, mode: 'online' };
      }
    } else {
      console.warn('⚠️ Firebase initialization failed:', initResult.error);
      return { success: false, error: initResult.error, mode: 'offline' };
    }
  } catch (error) {
    console.error('❌ Firebase app initialization error:', error);
    return { success: false, error: error.message, mode: 'offline' };
  }
};

// Auto-retry mechanism for failed syncs
export const setupAutoSyncRetry = () => {
  console.log('⚙️ Setting up auto-sync retry mechanism...');
  
  // Retry every 30 seconds for the first 5 minutes after app start
  let retryCount = 0;
  const maxRetries = 10;
  
  const retryInterval = setInterval(async () => {
    try {
      retryCount++;
      console.log(`🔄 Auto-sync retry attempt ${retryCount}/${maxRetries}`);
      
      const isOnline = await FirebaseService.checkInternetConnection();
      if (isOnline) {
        const syncResult = await FirebaseService.syncOfflineRegistrationsToFirebase();
        
        if (syncResult.success && syncResult.syncedCount > 0) {
          console.log(`✅ Auto-sync successful: ${syncResult.syncedCount} users synced`);
          clearInterval(retryInterval);
          return;
        }
        
        // Also process any queued operations
        const queueResult = await FirebaseService.processOfflineQueue();
        if (queueResult.success && queueResult.processedCount > 0) {
          console.log(`✅ Processed ${queueResult.processedCount} queued operations`);
        }
      }
      
      if (retryCount >= maxRetries) {
        console.log('🏁 Auto-sync retry limit reached');
        clearInterval(retryInterval);
      }
    } catch (error) {
      console.log(`⚠️ Auto-sync retry ${retryCount} failed:`, error.message);
      
      if (retryCount >= maxRetries) {
        clearInterval(retryInterval);
      }
    }
  }, 30000); // Every 30 seconds
  
  return retryInterval;
};

// Export default initialization function
export default initializeFirebaseApp;