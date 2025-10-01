// src/services/NotificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import SessionManager, { SessionStatus } from '../utils/sessionManager';
import PushNotificationService from './PushNotificationService';

const NOTIFICATIONS_KEY = 'app_notifications';
const DISMISSED_KEY = 'dismissed_notifications';

class NotificationService {
  // Generate notifications from sessions
  async generateSessionNotifications(allSessions) {
    const now = new Date();
    const notifications = [];
    const sessionStatuses = await SessionManager.getSessionStatuses();
    
    for (const session of allSessions) {
      if (!session.date || !session.id) {
        console.warn('Session missing required fields:', session);
        continue;
      }
      
      const sessionDate = new Date(session.date);
      const [hours, minutes] = (session.time || '09:00').split(':').map(Number);
      sessionDate.setHours(hours, minutes, 0, 0);
      
      const status = sessionStatuses[session.id]?.status;
      
      // Skip completed or skipped sessions
      if (status === SessionStatus.COMPLETED || status === SessionStatus.SKIPPED) {
        continue;
      }
      
      // Ensure session has required display fields
      const enrichedSession = {
        ...session,
        title: session.title || session.planTitle || 'Training Session',
        time: session.time || '09:00',
        date: session.date,
      };
      
      // TODAY'S SESSION
      if (this.isToday(sessionDate)) {
        const isPast = now > sessionDate;
        
        notifications.push({
          id: `session_today_${session.id}`,
          type: isPast ? 'missed_session' : 'session',
          title: isPast ? '⚠️ Missed Session' : '📅 Session Today',
          message: `${enrichedSession.title} - ${enrichedSession.time}`,
          timestamp: isPast ? sessionDate.getTime() : new Date(sessionDate).setHours(0, 0, 0, 0),
          read: false,
          priority: isPast ? 'high' : 'medium',
          actionable: true,
          data: { 
            sessionId: session.id,
            sessionData: enrichedSession,
            isMissed: isPast,
            isToday: !isPast
          },
          sender: { name: 'Training System', avatar: null },
        });
      }
      
      // TOMORROW'S SESSION
      else if (this.isTomorrow(sessionDate)) {
        const notificationTime = new Date(sessionDate);
        notificationTime.setHours(0, 0, 0, 0);
        notificationTime.setHours(notificationTime.getHours() - 8);
        
        if (now >= notificationTime) {
          notifications.push({
            id: `session_tomorrow_${session.id}`,
            type: 'session',
            title: '🔔 Upcoming Session Tomorrow',
            message: `${enrichedSession.title} at ${enrichedSession.time}`,
            timestamp: notificationTime.getTime(),
            read: false,
            priority: 'medium',
            actionable: true,
            data: { 
              sessionId: session.id,
              sessionData: enrichedSession,
              isTomorrow: true
            },
            sender: { name: 'Training System', avatar: null },
          });
        }
      }
      
      // MISSED SESSIONS
      else if (sessionDate < now) {
        notifications.push({
          id: `session_missed_${session.id}`,
          type: 'missed_session',
          title: '❌ Missed Session',
          message: `${enrichedSession.title} on ${this.formatDate(sessionDate)}`,
          timestamp: sessionDate.getTime(),
          read: false,
          priority: 'high',
          actionable: true,
          data: { 
            sessionId: session.id,
            sessionData: enrichedSession,
            isMissed: true,
            missedDate: sessionDate.toISOString()
          },
          sender: { name: 'Training System', avatar: null },
        });
      }
    }
    
    // Sort by priority and timestamp
    return notifications.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp - a.timestamp;
    });
  }
  
  // Get all notifications
  async getNotifications() {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }
  
  // Save notifications
  async saveNotifications(notifications) {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }
  
  // Mark notification as read
  async markAsRead(notificationId) {
    const notifications = await this.getNotifications();
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true, readAt: new Date().toISOString() } : n
    );
    await this.saveNotifications(updated);
    
    // Update badge count
    const unreadCount = updated.filter(n => !n.read).length;
    await PushNotificationService.setBadgeCount(unreadCount);
    
    return updated;
  }
  
  // Delete notification
  async deleteNotification(notificationId) {
    const notifications = await this.getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    await this.saveNotifications(filtered);
    
    // Track dismissed to avoid regenerating
    const dismissed = await this.getDismissedNotifications();
    dismissed.add(notificationId);
    await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]));
    
    // Update badge count
    const unreadCount = filtered.filter(n => !n.read).length;
    await PushNotificationService.setBadgeCount(unreadCount);
    
    return filtered;
  }
  
  // Clear all notifications
  async clearAllNotifications() {
    const notifications = await this.getNotifications();
    const dismissed = await this.getDismissedNotifications();
    
    // Add all current notification IDs to dismissed list
    notifications.forEach(n => dismissed.add(n.id));
    await AsyncStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]));
    
    await this.saveNotifications([]);
    await PushNotificationService.setBadgeCount(0);
    return [];
  }
  
  // Get dismissed notifications
  async getDismissedNotifications() {
    try {
      const dismissed = await AsyncStorage.getItem(DISMISSED_KEY);
      return new Set(dismissed ? JSON.parse(dismissed) : []);
    } catch (error) {
      return new Set();
    }
  }
  
  // Helper: Check if date is today
  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  // Helper: Check if date is tomorrow
  isTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  }
  
  // Helper: Format date
  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
  
  /**
   * Sync notifications and send push notifications
   */
  async syncNotifications(allSessions) {
    console.log('🔄 Syncing notifications for', allSessions.length, 'sessions');
    
    const generated = await this.generateSessionNotifications(allSessions);
    const dismissed = await this.getDismissedNotifications();
    
    // Filter out dismissed notifications
    const active = generated.filter(n => !dismissed.has(n.id));
    
    console.log(`📊 Generated ${generated.length} notifications, ${active.length} active after filtering`);
    
    // Send push notifications for new notifications
    for (const notification of active) {
      await this.sendPushNotification(notification);
    }
    
    // Merge with existing non-session notifications
    const existing = await this.getNotifications();
    const nonSession = existing.filter(n => 
      !n.type.includes('session') && !n.type.includes('missed')
    );
    
    const merged = [...nonSession, ...active];
    await this.saveNotifications(merged);
    
    // Update badge count
    const unreadCount = merged.filter(n => !n.read).length;
    await PushNotificationService.setBadgeCount(unreadCount);
    
    console.log(`✅ Sync complete: ${merged.length} total notifications, ${unreadCount} unread`);
    
    return merged;
  }

  /**
   * Send push notification based on type
   */
  async sendPushNotification(notification) {
    try {
      const session = notification.data?.sessionData;
      if (!session) {
        console.warn('Notification missing session data:', notification.id);
        return;
      }

      console.log(`📤 Sending push notification: ${notification.type} for session ${session.id}`);

      switch (notification.type) {
        case 'session':
          if (notification.data.isToday) {
            await PushNotificationService.sendTodaySessionNotification(session);
          } else if (notification.data.isTomorrow) {
            await PushNotificationService.sendTomorrowSessionNotification(session);
          }
          break;

        case 'missed_session':
          await PushNotificationService.sendMissedSessionNotification(session);
          break;

        default:
          console.log(`Unknown notification type: ${notification.type}`);
          break;
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}

export default new NotificationService();