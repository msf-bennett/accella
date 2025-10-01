// src/services/PushNotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import SessionManager, { SessionStatus } from '../utils/sessionManager';

const EXPO_PUSH_TOKEN_KEY = '@push_token';
const WEB_NOTIFICATIONS_KEY = '@web_notifications';
const SENT_NOTIFICATIONS_KEY = '@sent_notifications';

// Check if we're on a platform that supports push notifications
const isPushNotificationSupported = Platform.OS === 'ios' || Platform.OS === 'android';
const isWeb = Platform.OS === 'web';

// Configure notification handler only on supported platforms
if (isPushNotificationSupported) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

class PushNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.webNotificationPermission = 'default';
    this.scheduledWebNotifications = new Map();
    this.sentNotifications = new Set();
  }

  /**
   * Initialize push notifications
   */
  async initialize() {
    if (isWeb) {
      return await this.initializeWebNotifications();
    }

    if (!isPushNotificationSupported) {
      console.log('Push notifications not supported on this platform');
      return null;
    }

    try {
      // Register for push notifications
      this.expoPushToken = await this.registerForPushNotifications();
      
      // Set up notification categories with actions
      await this.setupNotificationCategories();
      
      // Set up listeners
      this.setupListeners();
      
      // Load sent notifications history
      await this.loadSentNotifications();
      
      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Initialize web notifications using browser Notification API
   */
  async initializeWebNotifications() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return null;
    }

    this.webNotificationPermission = Notification.permission;

    if (Notification.permission === 'default') {
      // Don't request permission immediately, wait for user interaction
      console.log('Web notifications available, will request permission when needed');
    } else if (Notification.permission === 'granted') {
      console.log('Web notification permission already granted');
    }

    // Load scheduled notifications from storage
    await this.loadScheduledWebNotifications();
    await this.loadSentNotifications();

    return this.webNotificationPermission === 'granted' ? 'web-notifications-enabled' : 'web-notifications-pending';
  }

  /**
   * Request web notification permission
   */
  async requestWebPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.webNotificationPermission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Load sent notifications history
   */
  async loadSentNotifications() {
    try {
      const stored = await AsyncStorage.getItem(SENT_NOTIFICATIONS_KEY);
      if (stored) {
        this.sentNotifications = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading sent notifications:', error);
    }
  }

  /**
   * Save sent notifications history
   */
  async saveSentNotifications() {
    try {
      await AsyncStorage.setItem(
        SENT_NOTIFICATIONS_KEY,
        JSON.stringify([...this.sentNotifications])
      );
    } catch (error) {
      console.error('Error saving sent notifications:', error);
    }
  }

  /**
   * Check if notification was already sent
   */
  wasNotificationSent(notificationId) {
    return this.sentNotifications.has(notificationId);
  }

  /**
   * Mark notification as sent
   */
  async markNotificationSent(notificationId) {
    this.sentNotifications.add(notificationId);
    await this.saveSentNotifications();
  }

  /**
   * Register device for push notifications (mobile only)
   */
  async registerForPushNotifications() {
    if (!isPushNotificationSupported) {
      return null;
    }

    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create channels for different notification types
      await Notifications.setNotificationChannelAsync('sessions', {
        name: 'Training Sessions',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('missed', {
        name: 'Missed Sessions',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      // Store token
      await AsyncStorage.setItem(EXPO_PUSH_TOKEN_KEY, token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  /**
   * Setup notification categories with interactive actions (mobile only)
   */
  async setupNotificationCategories() {
    if (!isPushNotificationSupported) {
      return;
    }

    // Today's Session Category
    await Notifications.setNotificationCategoryAsync('SESSION_TODAY', [
      {
        identifier: 'START_SESSION',
        buttonTitle: 'Start Now',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'MARK_READ',
        buttonTitle: 'Mark as Read',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    // Missed Session Category
    await Notifications.setNotificationCategoryAsync('SESSION_MISSED', [
      {
        identifier: 'DO_NOW',
        buttonTitle: 'Do Now',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'SKIP_SESSION',
        buttonTitle: 'Skip',
        options: {
          opensAppToForeground: false,
          isDestructive: true,
        },
      },
      {
        identifier: 'MARK_READ',
        buttonTitle: 'Dismiss',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    // Session Completed Feedback Category
    await Notifications.setNotificationCategoryAsync('SESSION_FEEDBACK', [
      {
        identifier: 'FEEDBACK_GREAT',
        buttonTitle: '😊 Great',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'FEEDBACK_GOOD',
        buttonTitle: '👍 Good',
        options: {
          opensAppToForeground: false,
        },
      },
      {
        identifier: 'FEEDBACK_TOUGH',
        buttonTitle: '😓 Tough',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    // Tomorrow's Session Category
    await Notifications.setNotificationCategoryAsync('SESSION_TOMORROW', [
      {
        identifier: 'VIEW_DETAILS',
        buttonTitle: 'View Details',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'MARK_READ',
        buttonTitle: 'Got it',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
  }

  /**
   * Setup notification listeners (mobile only)
   */
  setupListeners() {
    if (!isPushNotificationSupported) {
      return;
    }

    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle notification response (tap or action button)
   */
  async handleNotificationResponse(response) {
    const { actionIdentifier, notification } = response;
    const data = notification.request.content.data;

    console.log('Notification action:', actionIdentifier, data);

    switch (actionIdentifier) {
      case 'START_SESSION':
      case 'DO_NOW':
        if (data.sessionData) {
          this.navigateToSession(data.sessionData);
        }
        break;

      case 'SKIP_SESSION':
        if (data.sessionId) {
          await SessionManager.updateSessionStatus(
            data.sessionId,
            SessionStatus.SKIPPED,
            { skippedAt: new Date().toISOString() }
          );
          await this.cancelNotification(data.notificationId);
        }
        break;

      case 'MARK_READ':
        if (data.notificationId) {
          await NotificationService.markAsRead(data.notificationId);
          await this.cancelNotification(data.notificationId);
        }
        break;

      case 'FEEDBACK_GREAT':
      case 'FEEDBACK_GOOD':
      case 'FEEDBACK_TOUGH':
        await this.saveFeedback(data.sessionId, actionIdentifier);
        break;

      case 'VIEW_DETAILS':
        if (data.sessionData) {
          this.navigateToSession(data.sessionData);
        }
        break;

      default:
        if (data.sessionData) {
          this.navigateToSession(data.sessionData);
        }
        break;
    }
  }

  /**
   * Schedule a notification (works on both mobile and web)
   */
  async scheduleNotification(notification) {
    // Check if already sent to avoid duplicates
    if (this.wasNotificationSent(notification.id)) {
      console.log(`Notification ${notification.id} already sent, skipping`);
      return null;
    }

    if (isWeb) {
      return await this.scheduleWebNotification(notification);
    }

    if (!isPushNotificationSupported) {
      console.log('Notifications not supported on this platform');
      return null;
    }

    try {
      const { title, message, data, category, triggerTime } = notification;

      const trigger = triggerTime 
        ? { date: new Date(triggerTime) }
        : null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            ...data,
            notificationId: notification.id,
          },
          categoryIdentifier: category,
          sound: 'default',
          priority: Notifications.AndroidImportance.HIGH,
        },
        trigger,
      });

      await this.markNotificationSent(notification.id);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Schedule a web notification
   */
  async scheduleWebNotification(notification) {
    if (!('Notification' in window)) {
      console.log('Browser notifications not supported');
      return null;
    }

    // Request permission if not granted
    if (this.webNotificationPermission !== 'granted') {
      const granted = await this.requestWebPermission();
      if (!granted) {
        console.log('Notification permission not granted');
        return null;
      }
    }

    const { title, message, data, triggerTime } = notification;
    const notificationId = notification.id || `notification_${Date.now()}`;

    if (triggerTime) {
      const delay = new Date(triggerTime).getTime() - Date.now();
      
      if (delay > 0) {
        const timeoutId = setTimeout(() => {
          this.showWebNotification(title, message, data, notificationId);
          this.scheduledWebNotifications.delete(notificationId);
          this.saveScheduledWebNotifications();
        }, delay);

        this.scheduledWebNotifications.set(notificationId, {
          timeoutId,
          title,
          message,
          data,
          triggerTime,
        });

        await this.saveScheduledWebNotifications();
        await this.markNotificationSent(notificationId);
        return notificationId;
      }
    }

    // Show immediately
    await this.markNotificationSent(notificationId);
    return this.showWebNotification(title, message, data, notificationId);
  }

  /**
   * Show a web notification
   */
  showWebNotification(title, body, data, notificationId) {
    try {
      const notification = new Notification(title, {
        body,
        icon: '/icon.png',
        badge: '/badge.png',
        tag: notificationId,
        requireInteraction: false,
        silent: false, // Enable sound
        renotify: true, // Show even if same tag exists
        vibrate: [200, 100, 200], // Vibration pattern
        data,
      });

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        
        // Dispatch custom event for handling in App.tsx
        window.dispatchEvent(new CustomEvent('notificationClick', {
          detail: { data }
        }));
        
        notification.close();
      };

      // Log notification shown
      console.log('📢 Web notification displayed:', title);

      return notificationId;
    } catch (error) {
      console.error('Error showing web notification:', error);
      return null;
    }
  }

  /**
   * Load scheduled web notifications from storage
   */
  async loadScheduledWebNotifications() {
    try {
      const stored = await AsyncStorage.getItem(WEB_NOTIFICATIONS_KEY);
      if (stored) {
        const notifications = JSON.parse(stored);
        const now = Date.now();

        notifications.forEach(notif => {
          const delay = new Date(notif.triggerTime).getTime() - now;
          if (delay > 0) {
            const timeoutId = setTimeout(() => {
              this.showWebNotification(
                notif.title,
                notif.message,
                notif.data,
                notif.id
              );
              this.scheduledWebNotifications.delete(notif.id);
              this.saveScheduledWebNotifications();
            }, delay);

            this.scheduledWebNotifications.set(notif.id, {
              ...notif,
              timeoutId,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error loading scheduled notifications:', error);
    }
  }

  /**
   * Save scheduled web notifications to storage
   */
  async saveScheduledWebNotifications() {
    try {
      const notifications = Array.from(this.scheduledWebNotifications.entries()).map(
        ([id, notif]) => ({
          id,
          title: notif.title,
          message: notif.message,
          data: notif.data,
          triggerTime: notif.triggerTime,
        })
      );

      await AsyncStorage.setItem(WEB_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving scheduled notifications:', error);
    }
  }

  /**
   * Send notification for today's session
   */
  async sendTodaySessionNotification(session) {
    const category = 'SESSION_TODAY';
    const notificationId = `session_today_${session.id}`;
    
    // Format session details with fallbacks
    const sessionTitle = session.title || session.planTitle || 'Training Session';
    const sessionTime = session.time || 'scheduled time';
    const sessionDate = session.date ? new Date(session.date).toLocaleDateString() : 'today';
    
    await this.scheduleNotification({
      id: notificationId,
      title: '📅 Training Session Today',
      message: `${sessionTitle} at ${sessionTime}`,
      category,
      data: {
        sessionId: session.id,
        sessionData: session,
        type: 'session_today',
      },
      triggerTime: null,
    });
  }

  /**
   * Send notification for missed session
   */
  async sendMissedSessionNotification(session) {
    const category = 'SESSION_MISSED';
    const notificationId = `session_missed_${session.id}`;
    
    // Format session details with fallbacks
    const sessionTitle = session.title || session.planTitle || 'Training Session';
    const sessionDate = session.date ? new Date(session.date).toLocaleDateString() : 'recently';
    
    await this.scheduleNotification({
      id: notificationId,
      title: '⚠️ Missed Training Session',
      message: `You missed: ${sessionTitle} (${sessionDate})`,
      category,
      data: {
        sessionId: session.id,
        sessionData: session,
        type: 'session_missed',
      },
      triggerTime: null,
    });
  }

  /**
   * Send notification for tomorrow's session
   */
  async sendTomorrowSessionNotification(session) {
    const category = 'SESSION_TOMORROW';
    const notificationTime = new Date();
    notificationTime.setHours(16, 0, 0, 0);
    const notificationId = `session_tomorrow_${session.id}`;
    
    // Format session details with fallbacks
    const sessionTitle = session.title || session.planTitle || 'Training Session';
    const sessionTime = session.time || 'scheduled time';
    
    await this.scheduleNotification({
      id: notificationId,
      title: '🔔 Session Tomorrow',
      message: `${sessionTitle} at ${sessionTime}`,
      category,
      data: {
        sessionId: session.id,
        sessionData: session,
        type: 'session_tomorrow',
      },
      triggerTime: notificationTime,
    });
  }

  /**
   * Send feedback request after session completion
   */
  async sendSessionFeedbackRequest(session) {
    const category = 'SESSION_FEEDBACK';
    const notificationId = `session_feedback_${session.id}`;
    
    await this.scheduleNotification({
      id: notificationId,
      title: '🎉 Session Complete!',
      message: 'How was your session?',
      category,
      data: {
        sessionId: session.id,
        type: 'session_feedback',
      },
      triggerTime: null,
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId) {
    if (isWeb) {
      if (this.scheduledWebNotifications.has(notificationId)) {
        const notif = this.scheduledWebNotifications.get(notificationId);
        clearTimeout(notif.timeoutId);
        this.scheduledWebNotifications.delete(notificationId);
        await this.saveScheduledWebNotifications();
      }
      return;
    }

    if (!isPushNotificationSupported) {
      return;
    }

    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const notification = scheduled.find(n => 
        n.content.data?.notificationId === notificationId
      );
      
      if (notification) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications() {
    if (isWeb) {
      this.scheduledWebNotifications.forEach(notif => {
        clearTimeout(notif.timeoutId);
      });
      this.scheduledWebNotifications.clear();
      await this.saveScheduledWebNotifications();
      return;
    }

    if (!isPushNotificationSupported) {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount() {
    if (isWeb) {
      return 0;
    }

    if (!isPushNotificationSupported) {
      return 0;
    }

    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count) {
    if (isWeb) {
      if ('setAppBadge' in navigator) {
        try {
          await navigator.setAppBadge(count);
        } catch (error) {
          console.log('Badge API not available');
        }
      }
      return;
    }

    if (!isPushNotificationSupported) {
      return;
    }

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Save session feedback
   */
  async saveFeedback(sessionId, feedback) {
    try {
      const feedbackMap = {
        'FEEDBACK_GREAT': { rating: 5, emoji: '😊', label: 'Great' },
        'FEEDBACK_GOOD': { rating: 4, emoji: '👍', label: 'Good' },
        'FEEDBACK_TOUGH': { rating: 3, emoji: '😓', label: 'Tough' },
      };

      const feedbackData = feedbackMap[feedback];
      
      await AsyncStorage.setItem(
        `session_feedback_${sessionId}`,
        JSON.stringify({
          ...feedbackData,
          timestamp: new Date().toISOString(),
        })
      );

      console.log(`Feedback saved for session ${sessionId}:`, feedbackData);
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  }

  /**
   * Get session feedback
   */
  async getSessionFeedback(sessionId) {
    try {
      const feedback = await AsyncStorage.getItem(`session_feedback_${sessionId}`);
      return feedback ? JSON.parse(feedback) : null;
    } catch (error) {
      console.error('Error getting feedback:', error);
      return null;
    }
  }

  /**
   * Navigate to session (implement with your navigation solution)
   */
  navigateToSession(sessionData) {
    console.log('Navigate to session:', sessionData);
  }

  /**
   * Clear sent notifications history (useful for testing)
   */
  async clearSentHistory() {
    this.sentNotifications.clear();
    await this.saveSentNotifications();
  }

  /**
   * Get permission status
   */
  async getPermissionStatus() {
    if (isWeb) {
      if ('Notification' in window) {
        return {
          granted: Notification.permission === 'granted',
          permission: Notification.permission,
          platform: 'web',
        };
      }
      return { granted: false, permission: 'unsupported', platform: 'web' };
    }

    if (!isPushNotificationSupported) {
      return { granted: false, permission: 'unsupported', platform: Platform.OS };
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      return {
        granted: status === 'granted',
        permission: status,
        platform: Platform.OS,
      };
    } catch (error) {
      return { granted: false, permission: 'error', platform: Platform.OS };
    }
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (isWeb) {
      this.scheduledWebNotifications.forEach(notif => {
        clearTimeout(notif.timeoutId);
      });
      this.scheduledWebNotifications.clear();
      return;
    }

    if (!isPushNotificationSupported) {
      return;
    }

    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new PushNotificationService();