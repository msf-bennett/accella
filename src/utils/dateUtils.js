/**
 * Date utility functions for the coaching app
 * Handles date formatting, calculations, and session scheduling
 */

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time', 'datetime')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }
  };

  return dateObj.toLocaleDateString('en-US', options[format] || options.short);
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.ceil(diffMs / (1000 * 60));

  if (diffDays > 7) {
    return formatDate(date, 'short');
  } else if (diffDays > 1) {
    return `in ${diffDays} days`;
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else if (diffDays === 0) {
    return 'today';
  } else if (diffDays === -1) {
    return 'yesterday';
  } else if (diffDays < -1 && diffDays > -7) {
    return `${Math.abs(diffDays)} days ago`;
  } else if (diffHours > 1) {
    return `${diffHours} hours ago`;
  } else if (diffHours === 1) {
    return '1 hour ago';
  } else if (diffMinutes > 1) {
    return `${diffMinutes} minutes ago`;
  } else {
    return 'just now';
  }
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.toDateString() === checkDate.toDateString();
};

/**
 * Check if date is this week
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is this week
 */
export const isThisWeek = (date) => {
  if (!date) return false;
  
  const today = new Date();
  const checkDate = new Date(date);
  
  // Get start of week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get end of week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};

/**
 * Get start and end of week for a given date
 * @param {Date|string} date - Reference date
 * @returns {Object} Object with startOfWeek and endOfWeek dates
 */
export const getWeekBounds = (date = new Date()) => {
  const referenceDate = new Date(date);
  
  const startOfWeek = new Date(referenceDate);
  startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return { startOfWeek, endOfWeek };
};

/**
 * Generate array of dates for a week
 * @param {Date|string} weekStart - Start date of the week
 * @returns {Array} Array of 7 dates representing the week
 */
export const getWeekDates = (weekStart = new Date()) => {
  const start = new Date(weekStart);
  const dates = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

/**
 * Add days to a date
 * @param {Date|string} date - Base date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} New date with days added
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Add weeks to a date
 * @param {Date|string} date - Base date
 * @param {number} weeks - Number of weeks to add (can be negative)
 * @returns {Date} New date with weeks added
 */
export const addWeeks = (date, weeks) => {
  return addDays(date, weeks * 7);
};

/**
 * Get the number of days between two dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} Number of days between dates
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  const checkDate = new Date(date);
  const now = new Date();
  return checkDate < now;
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  const checkDate = new Date(date);
  const now = new Date();
  return checkDate > now;
};

/**
 * Get session status based on date and completion
 * @param {Date|string} sessionDate - Date of the session
 * @param {boolean} isCompleted - Whether session is completed
 * @returns {string} Status: 'completed', 'missed', 'upcoming', 'today'
 */
export const getSessionStatus = (sessionDate, isCompleted = false) => {
  if (!sessionDate) return 'unknown';
  
  const sessionDateObj = new Date(sessionDate);
  const now = new Date();
  
  if (isCompleted) {
    return 'completed';
  }
  
  if (isToday(sessionDate)) {
    return 'today';
  }
  
  if (sessionDateObj < now) {
    return 'missed';
  }
  
  return 'upcoming';
};

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "1h 30m", "45m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Get age from birth date
 * @param {Date|string} birthDate - Birth date
 * @returns {number} Age in years
 */
export const getAge = (birthDate) => {
  if (!birthDate) return 0;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if two dates are the same day
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.toDateString() === d2.toDateString();
};

/**
 * Generate training schedule dates
 * @param {Date|string} startDate - Program start date
 * @param {number} weeks - Number of weeks
 * @param {Array} trainingDays - Array of day numbers (0=Sunday, 1=Monday, etc.)
 * @returns {Array} Array of training session dates
 */
export const generateTrainingSchedule = (startDate, weeks, trainingDays = [1, 3, 5]) => {
  const schedule = [];
  const start = new Date(startDate);
  
  for (let week = 0; week < weeks; week++) {
    for (const dayOfWeek of trainingDays) {
      const sessionDate = new Date(start);
      sessionDate.setDate(start.getDate() + (week * 7) + dayOfWeek - start.getDay());
      schedule.push(sessionDate);
    }
  }
  
  return schedule.sort((a, b) => a - b);
};