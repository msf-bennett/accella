// src/utils/sessionManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_STATUS_KEY = 'session_statuses';
const WEEK_PROGRESS_KEY = 'week_progress';

export const SessionStatus = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  MISSED: 'missed',
  RESCHEDULED: 'rescheduled'
};

class SessionManager {
  // Get all session statuses
  async getSessionStatuses() {
    try {
      const statuses = await AsyncStorage.getItem(SESSION_STATUS_KEY);
      return statuses ? JSON.parse(statuses) : {};
    } catch (error) {
      console.error('Error loading session statuses:', error);
      return {};
    }
  }

  // Update a session's status
  async updateSessionStatus(sessionId, status, metadata = {}) {
    try {
      const statuses = await this.getSessionStatuses();
      statuses[sessionId] = {
        status,
        updatedAt: new Date().toISOString(),
        ...metadata
      };
      await AsyncStorage.setItem(SESSION_STATUS_KEY, JSON.stringify(statuses));
      return statuses[sessionId];
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  // Get week progress
  async getWeekProgress(planId, weekNumber) {
    try {
      const progress = await AsyncStorage.getItem(WEEK_PROGRESS_KEY);
      const allProgress = progress ? JSON.parse(progress) : {};
      const key = `${planId}_week_${weekNumber}`;
      return allProgress[key] || { completed: 0, total: 0, sessions: {} };
    } catch (error) {
      console.error('Error loading week progress:', error);
      return { completed: 0, total: 0, sessions: {} };
    }
  }

  // Update week progress
  async updateWeekProgress(planId, weekNumber, sessionId, status) {
    try {
      const progress = await AsyncStorage.getItem(WEEK_PROGRESS_KEY);
      const allProgress = progress ? JSON.parse(progress) : {};
      const key = `${planId}_week_${weekNumber}`;
      
      if (!allProgress[key]) {
        allProgress[key] = { completed: 0, total: 0, sessions: {} };
      }
      
      const wasCompleted = allProgress[key].sessions[sessionId] === SessionStatus.COMPLETED;
      const isNowCompleted = status === SessionStatus.COMPLETED;
      
      allProgress[key].sessions[sessionId] = status;
      
      if (isNowCompleted && !wasCompleted) {
        allProgress[key].completed += 1;
      } else if (!isNowCompleted && wasCompleted) {
        allProgress[key].completed -= 1;
      }
      
      await AsyncStorage.setItem(WEEK_PROGRESS_KEY, JSON.stringify(allProgress));
      return allProgress[key];
    } catch (error) {
      console.error('Error updating week progress:', error);
      throw error;
    }
  }

  // Check if session should auto-advance
  shouldAutoAdvance(sessionDate) {
    const now = new Date();
    const sessionTime = new Date(sessionDate);
    sessionTime.setHours(23, 59, 59, 999); // End of session day
    return now > sessionTime;
  }

  // Get current active session
  async getCurrentSession(allSessions) {
    const statuses = await this.getSessionStatuses();
    const now = new Date();
    
    // Find first incomplete session
    for (const session of allSessions) {
      const status = statuses[session.id]?.status;
      if (!status || status === SessionStatus.SCHEDULED) {
        return session;
      }
    }
    
    return allSessions[0]; // Fallback to first session
  }

  // Mark session as viewed/acknowledged
  async acknowledgeSessionPrompt(sessionId) {
    try {
      const key = `prompt_ack_${sessionId}`;
      await AsyncStorage.setItem(key, new Date().toISOString());
    } catch (error) {
      console.error('Error acknowledging prompt:', error);
    }
  }

  // Check if prompt was acknowledged
  async wasPromptAcknowledged(sessionId) {
    try {
      const key = `prompt_ack_${sessionId}`;
      const ack = await AsyncStorage.getItem(key);
      return !!ack;
    } catch (error) {
      return false;
    }
  }

  // Calculate week completion percentage
  async getWeekCompletionStats(allSessions, weekNumber) {
    const statuses = await this.getSessionStatuses();
    const weekSessions = allSessions.filter(s => s.weekNumber === weekNumber);
    
    const completed = weekSessions.filter(s => 
      statuses[s.id]?.status === SessionStatus.COMPLETED
    ).length;
    
    const total = weekSessions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      completed,
      total,
      percentage,
      visualBar: this.createProgressBar(percentage)
    };
  }

  // Create visual progress bar
  createProgressBar(percentage) {
    const filled = Math.round(percentage / 20); // 5 blocks = 100%
    const empty = 5 - filled;
    return '■'.repeat(filled) + '□'.repeat(empty);
  }

  // Get session state with time context
  getSessionState(session, statuses) {
    const now = new Date();
    const sessionDate = new Date(session.date);
    sessionDate.setHours(23, 59, 59, 999);
    
    const status = statuses[session.id]?.status;
    
    // If completed or skipped, return that
    if (status === SessionStatus.COMPLETED) {
      return { state: 'completed', icon: '✓', canAct: false };
    }
    if (status === SessionStatus.SKIPPED) {
      return { state: 'skipped', icon: '⊘', canAct: false };
    }
    
    // Check if it's today
    const isToday = sessionDate.toDateString() === now.toDateString();
    if (isToday) {
      return { state: 'today', icon: '▶', canAct: true, action: 'start' };
    }
    
    // Check if missed (past date, not completed)
    if (now > sessionDate) {
      return { state: 'missed', icon: '⚠', canAct: true, action: 'recover' };
    }
    
    // Upcoming
    return { state: 'upcoming', icon: '⋯', canAct: true, action: 'early' };
  }

  // Get daily/weekly/monthly stats
  async getCompletionStats(allSessions) {
    const statuses = await this.getSessionStatuses();
    const now = new Date();
    
    const stats = {
      daily: { completed: 0, total: 0, missed: 0 },
      weekly: { completed: 0, total: 0, missed: 0 },
      monthly: { completed: 0, total: 0, missed: 0 }
    };
    
    allSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const status = statuses[session.id]?.status;
      const isMissed = now > sessionDate && status !== SessionStatus.COMPLETED;
      
      // Daily (today)
      if (sessionDate.toDateString() === now.toDateString()) {
        stats.daily.total++;
        if (status === SessionStatus.COMPLETED) stats.daily.completed++;
        if (isMissed) stats.daily.missed++;
      }
      
      // Weekly
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      if (sessionDate >= weekStart && sessionDate <= weekEnd) {
        stats.weekly.total++;
        if (status === SessionStatus.COMPLETED) stats.weekly.completed++;
        if (isMissed) stats.weekly.missed++;
      }
      
      // Monthly
      if (sessionDate.getMonth() === now.getMonth() && 
          sessionDate.getFullYear() === now.getFullYear()) {
        stats.monthly.total++;
        if (status === SessionStatus.COMPLETED) stats.monthly.completed++;
        if (isMissed) stats.monthly.missed++;
      }
    });
    
    // Calculate percentages
    ['daily', 'weekly', 'monthly'].forEach(period => {
      const { completed, total } = stats[period];
      stats[period].percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      stats[period].visualBar = this.createProgressBar(stats[period].percentage);
    });
    
    return stats;
  }

  // Get missed sessions count by week
  async getMissedSessionsByWeek(allSessions) {
    const statuses = await this.getSessionStatuses();
    const now = new Date();
    const missedByWeek = {};
    
    allSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      const status = statuses[session.id]?.status;
      
      if (now > sessionDate && status !== SessionStatus.COMPLETED && status !== SessionStatus.SKIPPED) {
        const weekNum = session.weekNumber;
        if (!missedByWeek[weekNum]) {
          missedByWeek[weekNum] = [];
        }
        missedByWeek[weekNum].push(session);
      }
    });
    
    return missedByWeek;
  }
}

export default new SessionManager();