// src/services/PushNotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import SessionManager, { SessionStatus } from '../utils/sessionManager';

const EXPO_PUSH_TOKEN_KEY = '@push_token';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class PushNotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Initialize push notifications
   */
  async initialize() {
    try {
      // Register for push notifications
      this.expoPushToken = await this.registerForPushNotifications();
      
      // Set up notification categories with actions
      await this.setupNotificationCategories();
      
      // Set up listeners
      this.setupListeners();
      
      return this.expoPushToken;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return null;
    }
  }

  /**
   * Register device for push notifications
   */
  async registerForPushNotifications() {
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
   * Setup notification categories with interactive actions
   */
  async setupNotificationCategories() {
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
   * Setup notification listeners
   */
  setupListeners() {
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
        // Navigate to session or start it
        if (data.sessionData) {
          // You'll need to pass navigation instance or use a navigation service
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
        // Default tap - open app
        if (data.sessionData) {
          this.navigateToSession(data.sessionData);
        }
        break;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(notification) {
    try {
      const { title, message, data, category, triggerTime } = notification;

      const trigger = triggerTime 
        ? { date: new Date(triggerTime) }
        : null; // null means show immediately

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

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Send notification for today's session
   */
  async sendTodaySessionNotification(session) {
    const category = 'SESSION_TODAY';
    
    await this.scheduleNotification({
      id: `session_today_${session.id}`,
      title: '📅 Training Session Today',
      message: `${session.title} at ${session.time}`,
      category,
      data: {
        sessionId: session.id,
        sessionData: session,
        type: 'session_today',
      },
      triggerTime: null, // Immediate
    });
  }

  /**
   * Send notification for missed session
   */
  async sendMissedSessionNotification(session) {
    const category = 'SESSION_MISSED';
    
    await this.scheduleNotification({
      id: `session_missed_${session.id}`,
      title: '⚠️ Missed Training Session',
      message: `You missed: ${session.title}. Start from this session or skip?`,
      category,
      data: {
        sessionId: session.id,
        sessionData: session,
        type: 'session_missed',
      },
      triggerTime: null, // Immediate
    });
  }

  /**
   * Send notification for tomorrow's session
   */
  async sendTomorrowSessionNotification(session) {
    const category = 'SESSION_TOMORROW';
    const notificationTime = new Date();
    notificationTime.setHours(16, 0, 0, 0); // 4 PM today
    
    await this.scheduleNotification({
      id: `session_tomorrow_${session.id}`,
      title: '🔔 Session Tomorrow',
      message: `${session.title} at ${session.time}`,
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
    
    await this.scheduleNotification({
      id: `session_feedback_${session.id}`,
      title: '🎉 Session Complete!',
      message: 'How was your session?',
      category,
      data: {
        sessionId: session.id,
        type: 'session_feedback',
      },
      triggerTime: null, // Immediate
    });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId) {
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
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
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
    // This needs to be connected to your navigation
    // You can use a navigation service or event emitter
    console.log('Navigate to session:', sessionData);
    
    // Example: Emit event that your app can listen to
    // EventEmitter.emit('NAVIGATE_TO_SESSION', sessionData);
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }
}

export default new PushNotificationService();
