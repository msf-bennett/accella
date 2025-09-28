// API
export const API_BASE_URL = 'https://your-api-url.com/api';
export const API_TIMEOUT = 10000;

// User Types - Extended to support all navigators
export const USER_TYPES = {
  // Original types
  COACH: 'coach',
  PLAYER: 'player',
  PARENT: 'parent',
  TRAINER: 'trainer',
  
  // New types for your navigators
  ATHLETE: 'athlete',
  CHILD: 'child',
  PLAYERS: 'players', // Plural form if needed
  TRAINEE: 'trainee',
  
  // Extended role variations
  HEAD_COACH: 'head_coach',
  ASSISTANT_COACH: 'assistant_coach',
  STUDENT_ATHLETE: 'student_athlete',
  GUARDIAN: 'guardian',
  
  // Additional roles for future expansion
  ADMIN: 'admin',
  MANAGER: 'manager',
  SCOUT: 'scout'
};

// Session Status
export const SESSION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  MISSED: 'missed',
  CANCELLED: 'cancelled'
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  OFFLINE_DATA: 'offline_data'
};

// Navigator Mapping - Helper for routing users to correct navigator
export const NAVIGATOR_MAPPING = {
  [USER_TYPES.ATHLETE]: 'AthleteNavigator',
  [USER_TYPES.STUDENT_ATHLETE]: 'AthleteNavigator',
  
  [USER_TYPES.CHILD]: 'ChildNavigator',
  
  [USER_TYPES.COACH]: 'CoachNavigator',
  [USER_TYPES.HEAD_COACH]: 'CoachNavigator',
  [USER_TYPES.ASSISTANT_COACH]: 'CoachNavigator',
  
  [USER_TYPES.PARENT]: 'ParentNavigator',
  [USER_TYPES.GUARDIAN]: 'ParentNavigator',
  
  [USER_TYPES.PLAYER]: 'PlayersNavigator',
  [USER_TYPES.PLAYERS]: 'PlayersNavigator',
  
  [USER_TYPES.TRAINEE]: 'TraineeNavigator',
  
  [USER_TYPES.TRAINER]: 'TrainerNavigator',
  
  // Default fallback
  DEFAULT: 'CoachNavigator'
};

// User Type Display Names
export const USER_TYPE_DISPLAY_NAMES = {
  [USER_TYPES.ATHLETE]: 'Athlete',
  [USER_TYPES.CHILD]: 'Child',
  [USER_TYPES.COACH]: 'Coach',
  [USER_TYPES.PARENT]: 'Parent',
  [USER_TYPES.PLAYER]: 'Player',
  [USER_TYPES.PLAYERS]: 'Players',
  [USER_TYPES.TRAINEE]: 'Trainee',
  [USER_TYPES.TRAINER]: 'Trainer',
  [USER_TYPES.HEAD_COACH]: 'Head Coach',
  [USER_TYPES.ASSISTANT_COACH]: 'Assistant Coach',
  [USER_TYPES.STUDENT_ATHLETE]: 'Student Athlete',
  [USER_TYPES.GUARDIAN]: 'Guardian',
  [USER_TYPES.ADMIN]: 'Administrator',
  [USER_TYPES.MANAGER]: 'Manager',
  [USER_TYPES.SCOUT]: 'Scout'
};

// Helper Functions
export const getUserTypeDisplayName = (userType) => {
  return USER_TYPE_DISPLAY_NAMES[userType] || userType;
};

export const isValidUserType = (userType) => {
  return Object.values(USER_TYPES).includes(userType);
};

export const getNavigatorForUserType = (userType) => {
  return NAVIGATOR_MAPPING[userType] || NAVIGATOR_MAPPING.DEFAULT;
};

// User Type Categories - for grouping similar roles
export const USER_TYPE_CATEGORIES = {
  COACHING_STAFF: [USER_TYPES.COACH, USER_TYPES.HEAD_COACH, USER_TYPES.ASSISTANT_COACH, USER_TYPES.TRAINER],
  ATHLETES: [USER_TYPES.ATHLETE, USER_TYPES.PLAYER, USER_TYPES.STUDENT_ATHLETE, USER_TYPES.TRAINEE],
  GUARDIANS: [USER_TYPES.PARENT, USER_TYPES.GUARDIAN],
  MINORS: [USER_TYPES.CHILD],
  ADMIN: [USER_TYPES.ADMIN, USER_TYPES.MANAGER, USER_TYPES.SCOUT]
};

// Check if user belongs to a category
export const isUserInCategory = (userType, category) => {
  return USER_TYPE_CATEGORIES[category]?.includes(userType) || false;
};

// Permission levels (for future use)
export const PERMISSION_LEVELS = {
  VIEW_ONLY: 'view_only',
  BASIC: 'basic',
  ADVANCED: 'advanced',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Default permissions by user type
export const DEFAULT_PERMISSIONS = {
  [USER_TYPES.CHILD]: PERMISSION_LEVELS.VIEW_ONLY,
  [USER_TYPES.PLAYER]: PERMISSION_LEVELS.BASIC,
  [USER_TYPES.ATHLETE]: PERMISSION_LEVELS.BASIC,
  [USER_TYPES.TRAINEE]: PERMISSION_LEVELS.BASIC,
  [USER_TYPES.PARENT]: PERMISSION_LEVELS.BASIC,
  [USER_TYPES.GUARDIAN]: PERMISSION_LEVELS.BASIC,
  [USER_TYPES.TRAINER]: PERMISSION_LEVELS.ADVANCED,
  [USER_TYPES.COACH]: PERMISSION_LEVELS.ADVANCED,
  [USER_TYPES.HEAD_COACH]: PERMISSION_LEVELS.ADMIN,
  [USER_TYPES.ASSISTANT_COACH]: PERMISSION_LEVELS.ADVANCED,
  [USER_TYPES.MANAGER]: PERMISSION_LEVELS.ADMIN,
  [USER_TYPES.ADMIN]: PERMISSION_LEVELS.SUPER_ADMIN
};