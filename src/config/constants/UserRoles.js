// config/constants/UserRoles.js
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  ACADEMY_OWNER: 'academy_owner',
  ACADEMY_STAFF: 'academy_staff',
  COACH: 'coach',
  TRAINER: 'trainer',
  PARENT: 'parent',
  TRAINEE: 'trainee',
  STUDENT: 'student',
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: ['all'],
  [USER_ROLES.ADMIN]: ['user_management', 'content_moderation', 'system_config'],
  [USER_ROLES.MODERATOR]: ['content_moderation', 'user_reports'],
  [USER_ROLES.ACADEMY_OWNER]: ['academy_management', 'coach_management'],
  [USER_ROLES.ACADEMY_STAFF]: ['student_management', 'scheduling'],
  [USER_ROLES.COACH]: ['training_plans', 'student_progress', 'messaging'],
  [USER_ROLES.TRAINER]: ['training_plans', 'client_management'],
  [USER_ROLES.PARENT]: ['child_management', 'payments', 'communication'],
  [USER_ROLES.TRAINEE]: ['training_access', 'progress_tracking'],
};