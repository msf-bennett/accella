import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './ApiService';
import OfflineService from './OfflineService';

class SessionService {
  constructor() {
    this.baseUrl = '/api/sessions';
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId) {
    try {
      const response = await ApiService.get(`${this.baseUrl}/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      
      // Try to get cached sessions if online request fails
      const cachedSessions = await this.getCachedSessions(userId);
      if (cachedSessions) {
        return { data: cachedSessions };
      }
      
      throw error;
    }
  }

  /**
   * Get a specific session by ID
   */
  async getSessionById(sessionId) {
    try {
      const response = await ApiService.get(`${this.baseUrl}/${sessionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching session:', error);
      
      // Try to get from cached sessions
      const cachedSession = await this.getCachedSessionById(sessionId);
      if (cachedSession) {
        return { data: cachedSession };
      }
      
      throw error;
    }
  }

  /**
   * Create a new session
   */
  async createSession(sessionData) {
    try {
      const response = await ApiService.post(this.baseUrl, sessionData);
      
      // Update local cache
      await this.updateSessionCache(response.data);
      
      return response;
    } catch (error) {
      console.error('Error creating session:', error);
      
      // Store for offline sync
      if (!navigator.onLine) {
        await OfflineService.queueAction({
          type: 'CREATE_SESSION',
          data: sessionData,
          timestamp: new Date().toISOString()
        });
        
        // Create temporary session with offline ID
        const tempSession = {
          ...sessionData,
          id: `temp_${Date.now()}`,
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          isOffline: true
        };
        
        await this.updateSessionCache(tempSession);
        return { data: tempSession };
      }
      
      throw error;
    }
  }

  /**
   * Update an existing session
   */
  async updateSession(sessionId, updateData) {
    try {
      const response = await ApiService.put(`${this.baseUrl}/${sessionId}`, updateData);
      
      // Update local cache
      await this.updateSessionCache(response.data);
      
      return response;
    } catch (error) {
      console.error('Error updating session:', error);
      
      // Store for offline sync
      if (!navigator.onLine) {
        await OfflineService.queueAction({
          type: 'UPDATE_SESSION',
          sessionId,
          data: updateData,
          timestamp: new Date().toISOString()
        });
        
        // Update cached session
        const cachedSession = await this.getCachedSessionById(sessionId);
        if (cachedSession) {
          const updatedSession = { ...cachedSession, ...updateData };
          await this.updateSessionCache(updatedSession);
          return { data: updatedSession };
        }
      }
      
      throw error;
    }
  }

  /**
   * Delete/Cancel a session
   */
  async cancelSession(sessionId) {
    try {
      const response = await ApiService.put(`${this.baseUrl}/${sessionId}/cancel`);
      
      // Update local cache
      await this.updateSessionCache(response.data);
      
      return response;
    } catch (error) {
      console.error('Error cancelling session:', error);
      
      // Store for offline sync
      if (!navigator.onLine) {
        await OfflineService.queueAction({
          type: 'CANCEL_SESSION',
          sessionId,
          timestamp: new Date().toISOString()
        });
        
        // Update cached session status
        const cachedSession = await this.getCachedSessionById(sessionId);
        if (cachedSession) {
          const cancelledSession = { 
            ...cachedSession, 
            status: 'cancelled',
            cancelledAt: new Date().toISOString()
          };
          await this.updateSessionCache(cancelledSession);
          return { data: cancelledSession };
        }
      }
      
      throw error;
    }
  }

  /**
   * Start a session
   */
  async startSession(sessionId) {
    try {
      const response = await ApiService.post(`${this.baseUrl}/${sessionId}/start`);
      
      // Update local cache
      await this.updateSessionCache(response.data);
      
      return response;
    } catch (error) {
      console.error('Error starting session:', error);
      
      // Allow offline start
      if (!navigator.onLine) {
        await OfflineService.queueAction({
          type: 'START_SESSION',
          sessionId,
          timestamp: new Date().toISOString()
        });
        
        const cachedSession = await this.getCachedSessionById(sessionId);
        if (cachedSession) {
          const startedSession = {
            ...cachedSession,
            status: 'in-progress',
            startedAt: new Date().toISOString()
          };
          await this.updateSessionCache(startedSession);
          return { data: startedSession };
        }
      }
      
      throw error;
    }
  }

  /**
   * Complete a session
   */
  async completeSession(sessionId, sessionData) {
    try {
      const response = await ApiService.post(`${this.baseUrl}/${sessionId}/complete`, sessionData);
      
      // Update local cache
      await this.updateSessionCache(response.data);
      
      return response;
    } catch (error) {
      console.error('Error completing session:', error);
      
      // Store for offline sync
      if (!navigator.onLine) {
        await OfflineService.queueAction({
          type: 'COMPLETE_SESSION',
          sessionId,
          data: sessionData,
          timestamp: new Date().toISOString()
        });
        
        const cachedSession = await this.getCachedSessionById(sessionId);
        if (cachedSession) {
          const completedSession = {
            ...cachedSession,
            ...sessionData,
            status: 'completed',
            completedAt: new Date().toISOString()
          };
          await this.updateSessionCache(completedSession);
          return { data: completedSession };
        }
      }
      
      throw error;
    }
  }

  /**
   * Update session progress
   */
  async updateSessionProgress(sessionId, progressData) {
    try {
      const response = await ApiService.put(`${this.baseUrl}/${sessionId}/progress`, progressData);
      
      // Update local cache
      await this.updateSessionCache(response.data);
      
      return response;
    } catch (error) {
      console.error('Error updating session progress:', error);
      
      // Store for offline sync
      if (!navigator.onLine) {
        await OfflineService.queueAction({
          type: 'UPDATE_SESSION_PROGRESS',
          sessionId,
          data: progressData,
          timestamp: new Date().toISOString()
        });
        
        const cachedSession = await this.getCachedSessionById(sessionId);
        if (cachedSession) {
          const updatedSession = {
            ...cachedSession,
            progress: { ...cachedSession.progress, ...progressData }
          };
          await this.updateSessionCache(updatedSession);
          return { data: updatedSession };
        }
      }
      
      throw error;
    }
  }

  /**
   * Get sessions by date range
   */
  async getSessionsByDateRange(userId, startDate, endDate) {
    try {
      const response = await ApiService.get(`${this.baseUrl}/user/${userId}/range`, {
        params: { startDate, endDate }
      });
      return response;
    } catch (error) {
      console.error('Error fetching sessions by date range:', error);
      
      // Filter cached sessions by date range
      const cachedSessions = await this.getCachedSessions(userId);
      if (cachedSessions) {
        const filteredSessions = cachedSessions.filter(session => {
          const sessionDate = new Date(session.scheduledDate);
          return sessionDate >= new Date(startDate) && sessionDate <= new Date(endDate);
        });
        return { data: filteredSessions };
      }
      
      throw error;
    }
  }

  /**
   * Get upcoming sessions
   */
  async getUpcomingSessions(userId, limit = 10) {
    try {
      const response = await ApiService.get(`${this.baseUrl}/user/${userId}/upcoming`, {
        params: { limit }
      });
      return response;
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      
      const cachedSessions = await this.getCachedSessions(userId);
      if (cachedSessions) {
        const now = new Date();
        const upcomingSessions = cachedSessions
          .filter(session => new Date(session.scheduledDate) > now && session.status === 'scheduled')
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate))
          .slice(0, limit);
        return { data: upcomingSessions };
      }
      
      throw error;
    }
  }

  /**
   * Search sessions
   */
  async searchSessions(userId, query, filters = {}) {
    try {
      const response = await ApiService.get(`${this.baseUrl}/user/${userId}/search`, {
        params: { query, ...filters }
      });
      return response;
    } catch (error) {
      console.error('Error searching sessions:', error);
      
      const cachedSessions = await this.getCachedSessions(userId);
      if (cachedSessions) {
        let filteredSessions = cachedSessions;
        
        // Apply text search
        if (query) {
          filteredSessions = filteredSessions.filter(session =>
            session.title.toLowerCase().includes(query.toLowerCase()) ||
            session.type.toLowerCase().includes(query.toLowerCase()) ||
            (session.coach && session.coach.name.toLowerCase().includes(query.toLowerCase()))
          );
        }
        
        // Apply additional filters
        Object.keys(filters).forEach(key => {
          if (filters[key]) {
            filteredSessions = filteredSessions.filter(session => 
              session[key] === filters[key]
            );
          }
        });
        
        return { data: filteredSessions };
      }
      
      throw error;
    }
  }

  /**
   * Sync with server - upload pending changes and fetch latest data
   */
  async syncWithServer() {
    try {
      // Get pending offline actions
      const pendingActions = await OfflineService.getPendingActions();
      
      // Process each pending action
      for (const action of pendingActions) {
        try {
          switch (action.type) {
            case 'CREATE_SESSION':
              await ApiService.post(this.baseUrl, action.data);
              break;
            case 'UPDATE_SESSION':
              await ApiService.put(`${this.baseUrl}/${action.sessionId}`, action.data);
              break;
            case 'CANCEL_SESSION':
              await ApiService.put(`${this.baseUrl}/${action.sessionId}/cancel`);
              break;
            case 'START_SESSION':
              await ApiService.post(`${this.baseUrl}/${action.sessionId}/start`);
              break;
            case 'COMPLETE_SESSION':
              await ApiService.post(`${this.baseUrl}/${action.sessionId}/complete`, action.data);
              break;
            case 'UPDATE_SESSION_PROGRESS':
              await ApiService.put(`${this.baseUrl}/${action.sessionId}/progress`, action.data);
              break;
            default:
              console.warn('Unknown action type:', action.type);
          }
          
          // Remove successfully synced action
          await OfflineService.removeAction(action.id);
        } catch (syncError) {
          console.error('Error syncing action:', action.type, syncError);
        }
      }
      
      return { success: true, syncedActions: pendingActions.length };
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }

  // Cache Management Methods

  /**
   * Get cached sessions for a user
   */
  async getCachedSessions(userId) {
    try {
      const cachedData = await AsyncStorage.getItem(`sessions_${userId}`);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error getting cached sessions:', error);
      return null;
    }
  }

  /**
   * Get cached session by ID
   */
  async getCachedSessionById(sessionId) {
    try {
      const allCachedData = await AsyncStorage.getAllKeys();
      const sessionKeys = allCachedData.filter(key => key.startsWith('sessions_'));
      
      for (const key of sessionKeys) {
        const sessions = await AsyncStorage.getItem(key);
        if (sessions) {
          const sessionArray = JSON.parse(sessions);
          const session = sessionArray.find(s => s.id.toString() === sessionId.toString());
          if (session) {
            return session;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached session by ID:', error);
      return null;
    }
  }

  /**
   * Update session in cache
   */
  async updateSessionCache(sessionData) {
    try {
      const userId = sessionData.userId;
      const cachedSessions = await this.getCachedSessions(userId) || [];
      
      const sessionIndex = cachedSessions.findIndex(s => s.id === sessionData.id);
      if (sessionIndex >= 0) {
        cachedSessions[sessionIndex] = sessionData;
      } else {
        cachedSessions.push(sessionData);
      }
      
      await AsyncStorage.setItem(`sessions_${userId}`, JSON.stringify(cachedSessions));
    } catch (error) {
      console.error('Error updating session cache:', error);
    }
  }

  /**
   * Clear cache for a user
   */
  async clearUserCache(userId) {
    try {
      await AsyncStorage.removeItem(`sessions_${userId}`);
    } catch (error) {
      console.error('Error clearing user cache:', error);
    }
  }

  /**
   * Clear all session cache
   */
  async clearAllCache() {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const sessionKeys = allKeys.filter(key => key.startsWith('sessions_'));
      await AsyncStorage.multiRemove(sessionKeys);
    } catch (error) {
      console.error('Error clearing all session cache:', error);
    }
  }

  // Utility Methods

  /**
   * Generate session templates
   */
  getSessionTemplates() {
    return [
      {
        id: 'strength_training',
        title: 'Strength Training',
        type: 'strength',
        duration: 60,
        exercises: [
          { name: 'Squats', sets: 3, reps: 12 },
          { name: 'Bench Press', sets: 3, reps: 10 },
          { name: 'Deadlifts', sets: 3, reps: 8 },
          { name: 'Pull-ups', sets: 3, reps: 'max' }
        ]
      },
      {
        id: 'cardio_hiit',
        title: 'HIIT Cardio',
        type: 'cardio',
        duration: 30,
        exercises: [
          { name: 'Burpees', duration: 30, rest: 10 },
          { name: 'Mountain Climbers', duration: 30, rest: 10 },
          { name: 'Jump Squats', duration: 30, rest: 10 },
          { name: 'High Knees', duration: 30, rest: 60 }
        ]
      },
      {
        id: 'flexibility',
        title: 'Flexibility & Mobility',
        type: 'flexibility',
        duration: 20,
        exercises: [
          { name: 'Cat-Cow Stretch', duration: 60 },
          { name: 'Downward Dog', duration: 30 },
          { name: 'Pigeon Pose', duration: 60 },
          { name: 'Seated Spinal Twist', duration: 30 }
        ]
      }
    ];
  }

  /**
   * Validate session data
   */
  validateSessionData(sessionData) {
    const errors = [];
    
    if (!sessionData.title || sessionData.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!sessionData.type) {
      errors.push('Session type is required');
    }
    
    if (!sessionData.scheduledDate) {
      errors.push('Scheduled date is required');
    } else if (new Date(sessionData.scheduledDate) < new Date()) {
      errors.push('Scheduled date cannot be in the past');
    }
    
    if (sessionData.plannedDuration && sessionData.plannedDuration <= 0) {
      errors.push('Planned duration must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default new SessionService();