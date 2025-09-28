// utils/userDataValidator.js
export const validateUserData = (userData) => {
  const required = ['firstName', 'lastName', 'email', 'username'];
  const missing = required.filter(field => !userData[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  return true;
};

export const sanitizeUserData = (userData) => {
  return {
    id: userData.id || Date.now().toString(),
    firstName: userData.firstName?.trim() || '',
    lastName: userData.lastName?.trim() || '',
    email: userData.email?.trim().toLowerCase() || '',
    username: userData.username?.trim() || '',
    phone: userData.phone?.trim() || '',
    sport: userData.sport?.trim() || '',
    userType: userData.userType || '',
    customRole: userData.customRole?.trim() || '',
    profileImage: userData.profileImage || null,
    dateOfBirth: userData.dateOfBirth || '',
    emailOptIn: userData.emailOptIn || false,
    createdAt: userData.createdAt || new Date().toISOString(),
    syncedToServer: userData.syncedToServer || false,
  };
};