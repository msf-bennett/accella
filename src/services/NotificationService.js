// src/services/NotificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import SessionManager, { SessionStatus } from '../utils/sessionManager';

const NOTIFICATIONS_KEY = 'app_notifications';
const DISMISSED_KEY = 'dismissed_notifications';

class NotificationService {
  // Generate notifications from sessions
  async generateSessionNotifications(allSessions) {
    const now = new Date();
    const notifications = [];
    const sessionStatuses = await SessionManager.getSessionStatuses();
    
    for (const session of allSessions) {
      const sessionDate = new Date(session.date);
      const [hours, minutes] = (session.time || '09:00').split(':');
      sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const status = sessionStatuses[session.id]?.status;
      
      // Skip completed or skipped sessions
      if (status === SessionStatus.COMPLETED || status === SessionStatus.SKIPPED) {
        continue;
      }
      
      // Today's session
      if (this.isToday(sessionDate)) {
        const isPast = now > sessionDate;
        notifications.push({
          id: `session_today_${session.id}`,
          type: isPast ? 'missed_session' : 'session',
          title: isPast ? 'Missed Session' : 'Session Today',
          message: `${session.title} - ${session.time}`,
          timestamp: sessionDate,
          read: false,
          priority: isPast ? 'high' : 'medium',
          actionable: true,
          data: { 
            sessionId: session.id,
            sessionData: session,
            isMissed: isPast
          },
          sender: { name: 'Training System', avatar: null },
        });
      }
      
      // Tomorrow's session (8 hours before midnight)
      else if (this.isTomorrow(sessionDate)) {
        const notificationTime = new Date(sessionDate);
        notificationTime.setHours(0, 0, 0, 0); // Start of tomorrow
        notificationTime.setHours(notificationTime.getHours() - 8); // 8 hours before
        
        if (now >= notificationTime) {
          notifications.push({
            id: `session_tomorrow_${session.id}`,
            type: 'session',
            title: 'Upcoming Session Tomorrow',
            message: `${session.title} at ${session.time}`,
            timestamp: notificationTime,
            read: false,
            priority: 'medium',
            actionable: true,
            data: { 
              sessionId: session.id,
              sessionData: session,
              isTomorrow: true
            },
            sender: { name: 'Training System', avatar: null },
          });
        }
      }
      
      // Missed sessions (past sessions not completed)
      else if (sessionDate < now) {
        notifications.push({
          id: `session_missed_${session.id}`,
          type: 'missed_session',
          title: 'Missed Session',
          message: `${session.title} on ${sessionDate.toLocaleDateString()}`,
          timestamp: sessionDate,
          read: false,
          priority: 'high',
          actionable: true,
          data: { 
            sessionId: session.id,
            sessionData: session,
            isMissed: true
          },
          sender: { name: 'Training System', avatar: null },
        });
      }
    }
    
    return notifications;
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
      n.id === notificationId ? { ...n, read: true } : n
    );
    await this.saveNotifications(updated);
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
  
  // Sync notifications with sessions
  async syncNotifications(allSessions) {
    const generated = await this.generateSessionNotifications(allSessions);
    const dismissed = await this.getDismissedNotifications();
    
    // Filter out dismissed notifications
    const active = generated.filter(n => !dismissed.has(n.id));
    
    // Merge with existing non-session notifications
    const existing = await this.getNotifications();
    const nonSession = existing.filter(n => 
      !n.type.includes('session') && !n.type.includes('missed')
    );
    
    const merged = [...nonSession, ...active];
    await this.saveNotifications(merged);
    
    return merged;
  }
}

export default new NotificationService();
