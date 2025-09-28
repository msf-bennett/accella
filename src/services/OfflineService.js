/**
 * Offline Service for managing local data storage and synchronization
 * Handles offline-first functionality for the coaching app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.listeners = new Set();
    this.storageKeys = {
      USER_DATA: '@coaching_app:user_data',
      SESSIONS: '@coaching_app:sessions',
      TRAINING_PLANS: '@coaching_app:training_plans',
      SYNC_QUEUE: '@coaching_app:sync_queue',
      CACHED_DATA: '@coaching_app:cached_data',
      OFFLINE_ACTIONS: '@coaching_app:offline_actions',
      LAST_SYNC: '@coaching_app:last_sync'
    };
    
    this.initializeNetworkListener();
  }

  /**
   * Initialize network connectivity listener
   */
  initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;
      
      if (!wasOnline && this.isOnline) {
        // Came back online - trigger sync
        this.syncWhenOnline();
      }
      
      // Notify listeners of connectivity change
      this.notifyListeners('connectivity', { isOnline: this.isOnline });
    });
  }

  /**
   * Add listener for offline service events
   * @param {Function} callback - Callback function
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of events
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  notifyListeners(type, data) {
    this.listeners.forEach(listener => {
      try {
        listener({ type, data });
      } catch (error) {
        console.warn('Error in offline service listener:', error);
      }
    });
  }

  /**
   * Store data locally with timestamp
   * @param {string} key - Storage key
   * @param {*} data - Data to store
   */
  async storeData(key, data) {
    try {
      const timestamp = new Date().toISOString();
      const dataWithTimestamp = {
        data,
        timestamp,
        version: 1
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(dataWithTimestamp));
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  }

  /**
   * Retrieve data from local storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   */
  async getData(key, defaultValue = null) {
    try {
      const storedData = await AsyncStorage.getItem(key);
      if (!storedData) return defaultValue;
      
      const parsed = JSON.parse(storedData);
      return parsed.data || defaultValue;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return defaultValue;
    }
  }

  /**
   * Store user sessions locally
   * @param {Array} sessions - Array of session objects
   */
  async storeSessions(sessions) {
    return await this.storeData(this.storageKeys.SESSIONS, sessions);
  }

  /**
   * Get cached sessions
   * @param {string} userId - User ID filter (optional)
   */
  async getSessions(userId = null) {
    const sessions = await this.getData(this.storageKeys.SESSIONS, []);
    
    if (userId) {
      return sessions.filter(session => 
        session.playerId === userId || session.coachId === userId
      );
    }
    
    return sessions;
  }

  /**
   * Store a single session locally
   * @param {Object} session - Session object
   */
  async storeSession(session) {
    const sessions = await this.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = { ...sessions[existingIndex], ...session };
    } else {
      sessions.push(session);
    }
    
    return await this.storeSessions(sessions);
  }

  /**
   * Update session completion status offline
   * @param {string} sessionId - Session ID
   * @param {Object} completionData - Completion data
   */
  async updateSessionCompletion(sessionId, completionData) {
    try {
      // Update local session data
      const sessions = await this.getSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = {
          ...sessions[sessionIndex],
          ...completionData,
          lastUpdated: new Date().toISOString(),
          needsSync: true
        };
        
        await this.storeSessions(sessions);
      }
      
      // Add to sync queue if offline
      if (!this.isOnline) {
        await this.addToSyncQueue({
          action: 'UPDATE_SESSION_COMPLETION',
          sessionId,
          data: completionData,
          timestamp: new Date().toISOString()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating session completion:', error);
      return false;
    }
  }

  /**
   * Store training plans locally
   * @param {Array} trainingPlans - Array of training plan objects
   */
  async storeTrainingPlans(trainingPlans) {
    return await this.storeData(this.storageKeys.TRAINING_PLANS, trainingPlans);
  }

  /**
   * Get cached training plans
   * @param {string} coachId - Coach ID filter (optional)
   */
  async getTrainingPlans(coachId = null) {
    const plans = await this.getData(this.storageKeys.TRAINING_PLANS, []);
    
    if (coachId) {
      return plans.filter(plan => plan.coachId === coachId);
    }
    
    return plans;
  }

  /**
   * Add action to sync queue for when online
   * @param {Object} action - Action object
   */
  async addToSyncQueue(action) {
    try {
      const queue = await this.getData(this.storageKeys.SYNC_QUEUE, []);
      queue.push({
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date().toISOString()
      });
      
      await this.storeData(this.storageKeys.SYNC_QUEUE, queue);
      this.notifyListeners('queueUpdated', { queueLength: queue.length });
      
      return true;
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      return false;
    }
  }

  /**
   * Get pending sync queue
   */
  async getSyncQueue() {
    return await this.getData(this.storageKeys.SYNC_QUEUE, []);
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue() {
    await this.storeData(this.storageKeys.SYNC_QUEUE, []);
    this.notifyListeners('queueCleared', {});
  }

  /**
   * Remove specific item from sync queue
   * @param {string} actionId - Action ID to remove
   */
  async removeFromSyncQueue(actionId) {
    const queue = await this.getSyncQueue();
    const updatedQueue = queue.filter(item => item.id !== actionId);
    await this.storeData(this.storageKeys.SYNC_QUEUE, updatedQueue);
  }

  /**
   * Sync data when coming back online
   */
  async syncWhenOnline() {
    if (!this.isOnline) {
      console.log('Cannot sync - still offline');
      return;
    }

    try {
      this.notifyListeners('syncStarted', {});
      
      const queue = await this.getSyncQueue();
      console.log(`Syncing ${queue.length} pending actions`);
      
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };
      
      for (const action of queue) {
        try {
          await this.processSyncAction(action);
          await this.removeFromSyncQueue(action.id);
          results.success++;
        } catch (error) {
          console.error('Error processing sync action:', error);
          results.failed++;
          results.errors.push({ action: action.action, error: error.message });
        }
      }
      
      // Update last sync timestamp
      await this.storeData(this.storageKeys.LAST_SYNC, new Date().toISOString());
      
      this.notifyListeners('syncCompleted', results);
      
      return results;
    } catch (error) {
      console.error('Error during sync:', error);
      this.notifyListeners('syncError', { error: error.message });
      throw error;
    }
  }

  /**
   * Process individual sync action
   * @param {Object} action - Action to process
   */
  async processSyncAction(action) {
    // This would typically make API calls to sync with backend
    // For now, we'll simulate the actions
    
    switch (action.action) {
      case 'UPDATE_SESSION_COMPLETION':
        console.log(`Syncing session completion for ${action.sessionId}`);
        // Make API call to update session completion
        break;
        
      case 'CREATE_SESSION':
        console.log(`Syncing new session creation`);
        // Make API call to create session
        break;
        
      case 'UPDATE_TRAINING_PLAN':
        console.log(`Syncing training plan update`);
        // Make API call to update training plan
        break;
        
      case 'UPLOAD_FEEDBACK':
        console.log(`Syncing feedback upload`);
        // Make API call to upload feedback
        break;
        
      default:
        console.warn(`Unknown sync action: ${action.action}`);
    }
  }

  /**
   * Get offline statistics
   */
  async getOfflineStats() {
    const queue = await this.getSyncQueue();
    const lastSync = await this.getData(this.storageKeys.LAST_SYNC);
    
    return {
      isOnline: this.isOnline,
      pendingActions: queue.length,
      lastSync: lastSync ? new Date(lastSync) : null,
      hasOfflineData: queue.length > 0
    };
  }

  /**
   * Cache frequently accessed data
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in minutes
   */
  async cacheData(key, data, ttl = 60) {
    const expiresAt = new Date(Date.now() + ttl * 60 * 1000).toISOString();
    const cacheEntry = {
      data,
      expiresAt,
      createdAt: new Date().toISOString()
    };
    
    const cachedData = await this.getData(this.storageKeys.CACHED_DATA, {});
    cachedData[key] = cacheEntry;
    
    return await this.storeData(this.storageKeys.CACHED_DATA, cachedData);
  }

  /**
   * Get cached data if not expired
   * @param {string} key - Cache key
   */
  async getCachedData(key) {
    const cachedData = await this.getData(this.storageKeys.CACHED_DATA, {});
    const entry = cachedData[key];
    
    if (!entry) return null;
    
    const now = new Date();
    const expiresAt = new Date(entry.expiresAt);
    
    if (now > expiresAt) {
      // Data expired, remove it
      delete cachedData[key];
      await this.storeData(this.storageKeys.CACHED_DATA, cachedData);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Clear all offline data
   */
  async clearAllData() {
    try {
      await AsyncStorage.multiRemove(Object.values(this.storageKeys));
      this.notifyListeners('dataCleared', {});
      return true;
    } catch (error) {
      console.error('Error clearing offline data:', error);
      return false;
    }
  }

  /**
   * Get current connectivity status
   */
  getConnectivityStatus() {
    return {
      isOnline: this.isOnline,
      canSync: this.isOnline && this.syncQueue.length > 0
    };
  }
}

// Export singleton instance
const offlineService = new OfflineService();
export default offlineService;