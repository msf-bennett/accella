// src/utils/NotificationManager.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BADGE_COUNT_KEY = '@badge_count';
const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  sessions: boolean;
  missedSessions: boolean;
  tomorrowReminders: boolean;
  feedbackRequests: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  sound: boolean;
  vibration: boolean;
}

export class NotificationManager {
  private static defaultSettings: NotificationSettings = {
    enabled: true,
    sessions: true,
    missedSessions: true,
    tomorrowReminders: true,
    feedbackRequests: true,
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    sound: true,
    vibration: true,
  };

  /**
   * Get notification settings
   */
  static async getSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        return { ...this.defaultSettings, ...JSON.parse(stored) };
      }
      return this.defaultSettings;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.defaultSettings;
    }
  }

  /**
   * Update notification settings
   */
  static async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  /**
   * Check if notifications should be shown (respects quiet hours)
   */
  static async shouldShowNotification(): Promise<boolean> {
    const settings = await this.getSettings();
    
    if (!settings.enabled) {
      return false;
    }

    if (settings.quietHoursEnabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinutes;

      const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number);
      const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      // Handle overnight quiet hours (e.g., 22:00 - 07:00)
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime < endTime) {
          return false; // In quiet hours
        }
      } else {
        if (currentTime >= startTime && currentTime < endTime) {
          return false; // In quiet hours
        }
      }
    }

    return true;
  }

  /**
   * Get current badge count
   */
  static async getBadgeCount(): Promise<number> {
    try {
      const count = await AsyncStorage.getItem(BADGE_COUNT_KEY);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Update badge count
   */
  static async updateBadgeCount(count: number): Promise<void> {
    try {
      await AsyncStorage.setItem(BADGE_COUNT_KEY, count.toString());
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error updating badge count:', error);
    }
  }

  /**
   * Increment badge count
   */
  static async incrementBadge(): Promise<void> {
    const current = await this.getBadgeCount();
    await this.updateBadgeCount(current + 1);
  }

  /**
   * Decrement badge count
   */
  static async decrementBadge(): Promise<void> {
    const current = await this.getBadgeCount();
    const newCount = Math.max(0, current - 1);
    await this.updateBadgeCount(newCount);
  }

  /**
   * Clear badge count
   */
  static async clearBadge(): Promise<void> {
    await this.updateBadgeCount(0);
  }

  /**
   * Schedule a notification with proper badge management
   */
  static async scheduleNotification(
    title: string,
    body: string,
    data: any,
    options?: {
      categoryIdentifier?: string;
      triggerDate?: Date;
      sound?: boolean;
      vibrate?: boolean;
      priority?: 'default' | 'high' | 'max';
    }
  ): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      
      // Check if notifications should be shown
      if (!await this.shouldShowNotification()) {
        console.log('Skipping notification due to quiet hours or disabled notifications');
        return null;
      }

      // Web platform handling
      if (Platform.OS === 'web') {
        return await this.scheduleWebNotification(title, body, data, options);
      }

      // Increment badge
      await this.incrementBadge();
      const badgeCount = await this.getBadgeCount();

      // Create proper trigger based on whether triggerDate is provided
      const trigger: Notifications.NotificationTriggerInput | null = options?.triggerDate 
        ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date: options.triggerDate }
        : null;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            ...data,
            badgeCount,
          },
          categoryIdentifier: options?.categoryIdentifier,
          sound: settings.sound && (options?.sound !== false) ? 'default' : undefined,
          badge: badgeCount,
          priority: this.mapPriority(options?.priority || 'default'),
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
   * Schedule web notification using Web Notifications API
   */
  private static async scheduleWebNotification(
    title: string,
    body: string,
    data: any,
    options?: {
      categoryIdentifier?: string;
      triggerDate?: Date;
      sound?: boolean;
      vibrate?: boolean;
      priority?: 'default' | 'high' | 'max';
    }
  ): Promise<string | null> {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return null;
      }

      // Request permission if needed
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // If triggerDate is provided, schedule for later
      if (options?.triggerDate) {
        const delay = options.triggerDate.getTime() - Date.now();
        if (delay > 0) {
          const timeoutId = setTimeout(() => {
            this.showWebNotification(title, body, data, options);
          }, delay);
          return `web_${timeoutId}`;
        }
      }

      // Show notification immediately
      return this.showWebNotification(title, body, data, options);
    } catch (error) {
      console.error('Error scheduling web notification:', error);
      return null;
    }
  }

  /**
   * Show web notification
   */
  private static showWebNotification(
    title: string,
    body: string,
    data: any,
    options?: {
      sound?: boolean;
      vibrate?: boolean;
    }
  ): string {
    const notificationId = `web_${Date.now()}`;
    
    const notification = new Notification(title, {
      body,
      icon: '/favicon.png', // Use your app icon
      badge: '/notification-icon.png',
      tag: notificationId,
      data,
      requireInteraction: false,
      silent: options?.sound === false,
    });

    // Handle click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      
      // Dispatch custom event for handling in app
      window.dispatchEvent(new CustomEvent('notificationClick', {
        detail: { data }
      }));
    };

    // Vibrate if supported and enabled
    if (options?.vibrate !== false && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notificationId;
  }

  /**
   * Map priority to Android importance
   */
  private static mapPriority(priority: 'default' | 'high' | 'max'): Notifications.AndroidNotificationPriority {
    switch (priority) {
      case 'max':
        return Notifications.AndroidNotificationPriority.MAX;
      case 'high':
        return Notifications.AndroidNotificationPriority.HIGH;
      default:
        return Notifications.AndroidNotificationPriority.DEFAULT;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Dismiss a displayed notification
   */
  static async dismissNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.dismissNotificationAsync(notificationId);
      await this.decrementBadge();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Dismiss all displayed notifications
   */
  static async dismissAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.clearBadge();
    } catch (error) {
      console.error('Error dismissing all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Get all presented notifications
   */
  static async getPresentedNotifications(): Promise<Notifications.Notification[]> {
    try {
      return await Notifications.getPresentedNotificationsAsync();
    } catch (error) {
      console.error('Error getting presented notifications:', error);
      return [];
    }
  }

  /**
   * Request notification permissions
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission for push notifications not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if notification permissions are granted
   */
  static async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }
}

export default NotificationManager