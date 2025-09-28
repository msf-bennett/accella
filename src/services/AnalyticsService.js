//src/services/AnalyticsService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Analytics Service for tracking user interactions and app events
 * Provides offline-first analytics with local storage and batch sync capabilities
 */
class AnalyticsService {
  constructor() {
    this.isEnabled = true;
    this.eventQueue = [];
    this.maxQueueSize = 1000;
    this.batchSize = 50;
    this.flushInterval = 30000; // 30 seconds
    this.storageKey = 'analytics_events';
    this.configKey = 'analytics_config';
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initialized = false;
    
    // Auto-initialize
    this.init();
  }

  /**
   * Initialize the analytics service
   */
  async init() {
    if (this.initialized) return;

    try {
      // Load configuration
      await this.loadConfig();
      
      // Load queued events from storage
      await this.loadQueuedEvents();
      
      // Start auto-flush timer
      this.startAutoFlush();
      
      // Track session start
      this.trackEvent('session_start', {
        platform: Platform.OS,
        timestamp: this.sessionStartTime,
        sessionId: this.sessionId
      });

      this.initialized = true;
      console.log('AnalyticsService initialized successfully');
    } catch (error) {
      console.warn('AnalyticsService initialization failed:', error.message);
      // Continue with disabled analytics
      this.isEnabled = false;
    }
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load analytics configuration from storage
   */
  async loadConfig() {
    try {
      const config = await AsyncStorage.getItem(this.configKey);
      if (config) {
        const parsedConfig = JSON.parse(config);
        this.isEnabled = parsedConfig.enabled !== undefined ? parsedConfig.enabled : true;
        this.maxQueueSize = parsedConfig.maxQueueSize || 1000;
        this.batchSize = parsedConfig.batchSize || 50;
      }
    } catch (error) {
      console.warn('Could not load analytics config:', error.message);
    }
  }

  /**
   * Save analytics configuration to storage
   */
  async saveConfig() {
    try {
      const config = {
        enabled: this.isEnabled,
        maxQueueSize: this.maxQueueSize,
        batchSize: this.batchSize,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem(this.configKey, JSON.stringify(config));
    } catch (error) {
      console.warn('Could not save analytics config:', error.message);
    }
  }

  /**
   * Load queued events from storage
   */
  async loadQueuedEvents() {
    try {
      const events = await AsyncStorage.getItem(this.storageKey);
      if (events) {
        this.eventQueue = JSON.parse(events);
        console.log(`Loaded ${this.eventQueue.length} queued analytics events`);
      }
    } catch (error) {
      console.warn('Could not load queued events:', error.message);
      this.eventQueue = [];
    }
  }

  /**
   * Save queued events to storage
   */
  async saveQueuedEvents() {
    try {
      // Limit queue size to prevent excessive storage usage
      if (this.eventQueue.length > this.maxQueueSize) {
        this.eventQueue = this.eventQueue.slice(-this.maxQueueSize);
      }
      
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(this.eventQueue));
    } catch (error) {
      console.warn('Could not save queued events:', error.message);
    }
  }

  /**
   * Track an analytics event
   * @param {string} eventName - Name of the event
   * @param {object} properties - Event properties/parameters
   * @param {object} options - Additional options
   */
  async trackEvent(eventName, properties = {}, options = {}) {
    if (!this.isEnabled) return;

    try {
      // Ensure initialization
      if (!this.initialized) {
        await this.init();
      }

      const event = {
        id: this.generateEventId(),
        name: eventName,
        properties: {
          ...properties,
          // Add common properties
          platform: Platform.OS,
          sessionId: this.sessionId,
          timestamp: Date.now(),
          sessionDuration: Date.now() - this.sessionStartTime,
          appVersion: '1.0.0', // You can make this dynamic
          userId: await this.getUserId(),
        },
        metadata: {
          queued: true,
          attempts: 0,
          maxAttempts: options.maxAttempts || 3,
          priority: options.priority || 'normal',
          category: options.category || 'general'
        },
        createdAt: new Date().toISOString()
      };

      // Add to queue
      this.eventQueue.push(event);
      
      // Save to storage
      await this.saveQueuedEvents();

      // Immediate flush for high-priority events
      if (options.priority === 'high') {
        this.flushEvents();
      }

      console.log(`Analytics event tracked: ${eventName}`, properties);
    } catch (error) {
      console.warn('Failed to track analytics event:', error.message);
    }
  }

  /**
   * Generate a unique event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get or generate user ID
   */
  async getUserId() {
    try {
      let userId = await AsyncStorage.getItem('analytics_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('analytics_user_id', userId);
      }
      return userId;
    } catch (error) {
      return 'anonymous_user';
    }
  }

  /**
   * Track screen view
   * @param {string} screenName - Name of the screen
   * @param {object} properties - Additional properties
   */
  trackScreenView(screenName, properties = {}) {
    return this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties
    }, { category: 'navigation' });
  }

  /**
   * Track user action
   * @param {string} action - Action performed
   * @param {string} target - Target of the action
   * @param {object} properties - Additional properties
   */
  trackUserAction(action, target, properties = {}) {
    return this.trackEvent('user_action', {
      action,
      target,
      ...properties
    }, { category: 'interaction' });
  }

  /**
   * Track performance metrics
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   * @param {object} properties - Additional properties
   */
  trackPerformance(metric, value, properties = {}) {
    return this.trackEvent('performance_metric', {
      metric,
      value,
      ...properties
    }, { category: 'performance' });
  }

  /**
   * Track errors
   * @param {string} error - Error message or type
   * @param {object} context - Error context
   */
  trackError(error, context = {}) {
    return this.trackEvent('error', {
      error_message: error,
      error_type: context.type || 'unknown',
      error_source: context.source || 'unknown',
      stack_trace: context.stack || null,
      ...context
    }, { 
      priority: 'high',
      category: 'error'
    });
  }

  /**
   * Track timing events
   * @param {string} category - Timing category
   * @param {string} variable - Timing variable
   * @param {number} time - Time in milliseconds
   * @param {string} label - Optional label
   */
  trackTiming(category, variable, time, label = null) {
    return this.trackEvent('timing', {
      timing_category: category,
      timing_variable: variable,
      timing_value: time,
      timing_label: label
    }, { category: 'performance' });
  }

  /**
   * Start auto-flush timer
   */
  startAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Stop auto-flush timer
   */
  stopAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Flush events to remote analytics service
   * In a production app, this would send events to your analytics backend
   */
  async flushEvents() {
    if (this.eventQueue.length === 0) return;

    try {
      const batch = this.eventQueue.splice(0, this.batchSize);
      
      // In a real app, you would send these to your analytics service
      // For now, we'll just simulate the process and log the events
      console.log(`Flushing ${batch.length} analytics events:`, batch);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Mark events as successfully sent
      console.log('Analytics events sent successfully');
      
      // Update storage after successful flush
      await this.saveQueuedEvents();
      
    } catch (error) {
      console.warn('Failed to flush analytics events:', error.message);
      
      // Re-add events to queue on failure
      // In a real app, you might want to implement retry logic with exponential backoff
      this.eventQueue.unshift(...batch.map(event => ({
        ...event,
        metadata: {
          ...event.metadata,
          attempts: (event.metadata.attempts || 0) + 1,
          lastAttempt: new Date().toISOString()
        }
      })));
      
      await this.saveQueuedEvents();
    }
  }

  /**
   * Get analytics statistics
   */
  async getAnalyticsStats() {
    try {
      const events = await AsyncStorage.getItem(this.storageKey);
      const eventCount = events ? JSON.parse(events).length : 0;
      
      return {
        enabled: this.isEnabled,
        sessionId: this.sessionId,
        sessionDuration: Date.now() - this.sessionStartTime,
        queuedEvents: eventCount,
        platform: Platform.OS,
        initialized: this.initialized,
        lastFlush: this.lastFlushTime || null
      };
    } catch (error) {
      return {
        enabled: this.isEnabled,
        error: error.message
      };
    }
  }

  /**
   * Clear all analytics data
   */
  async clearAnalyticsData() {
    try {
      this.eventQueue = [];
      await AsyncStorage.removeItem(this.storageKey);
      await AsyncStorage.removeItem('analytics_user_id');
      console.log('Analytics data cleared');
    } catch (error) {
      console.warn('Failed to clear analytics data:', error.message);
    }
  }

  /**
   * Enable or disable analytics
   * @param {boolean} enabled - Whether analytics should be enabled
   */
  async setEnabled(enabled) {
    this.isEnabled = enabled;
    await this.saveConfig();
    
    if (enabled) {
      this.startAutoFlush();
      this.trackEvent('analytics_enabled');
    } else {
      this.stopAutoFlush();
      this.trackEvent('analytics_disabled');
    }
  }

  /**
   * Set user properties
   * @param {object} properties - User properties to set
   */
  async setUserProperties(properties) {
    try {
      const existingProps = await AsyncStorage.getItem('analytics_user_props');
      const currentProps = existingProps ? JSON.parse(existingProps) : {};
      
      const updatedProps = {
        ...currentProps,
        ...properties,
        lastUpdated: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('analytics_user_props', JSON.stringify(updatedProps));
      
      this.trackEvent('user_properties_updated', {
        properties_count: Object.keys(properties).length,
        property_keys: Object.keys(properties)
      });
    } catch (error) {
      console.warn('Failed to set user properties:', error.message);
    }
  }

  /**
   * Get user properties
   */
  async getUserProperties() {
    try {
      const props = await AsyncStorage.getItem('analytics_user_props');
      return props ? JSON.parse(props) : {};
    } catch (error) {
      console.warn('Failed to get user properties:', error.message);
      return {};
    }
  }

  /**
   * Track feature usage
   * @param {string} feature - Feature name
   * @param {object} properties - Additional properties
   */
  trackFeatureUsage(feature, properties = {}) {
    return this.trackEvent('feature_usage', {
      feature_name: feature,
      usage_count: 1,
      ...properties
    }, { category: 'feature' });
  }

  /**
   * Track conversion events
   * @param {string} goal - Conversion goal
   * @param {number} value - Conversion value (optional)
   * @param {object} properties - Additional properties
   */
  trackConversion(goal, value = null, properties = {}) {
    return this.trackEvent('conversion', {
      conversion_goal: goal,
      conversion_value: value,
      ...properties
    }, { 
      priority: 'high',
      category: 'conversion'
    });
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    try {
      // Track session end
      this.trackEvent('session_end', {
        session_duration: Date.now() - this.sessionStartTime,
        events_tracked: this.eventQueue.length
      });

      // Flush remaining events
      await this.flushEvents();
      
      // Stop auto-flush
      this.stopAutoFlush();
      
      // Save final state
      await this.saveQueuedEvents();
      await this.saveConfig();
      
      console.log('AnalyticsService shutdown complete');
    } catch (error) {
      console.warn('AnalyticsService shutdown error:', error.message);
    }
  }
}

// Create and export singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;