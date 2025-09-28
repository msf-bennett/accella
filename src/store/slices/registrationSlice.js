// src/store/slices/registrationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import FirebaseService from '../../services/FirebaseService';

// Async thunks for registration actions
export const registerUser = createAsyncThunk(
  'registration/registerUser',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { registration } = getState();
      const completeUserData = {
        ...userData,
        authMethod: registration.authMethod,
        registrationId: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      const result = await FirebaseService.registerUser(completeUserData);
      
      if (!result.success) {
        return rejectWithValue(result.error);
      }
      
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncOfflineRegistrations = createAsyncThunk(
  'registration/syncOfflineRegistrations',
  async (_, { rejectWithValue }) => {
    try {
      const result = await FirebaseService.syncOfflineRegistrationsToFirebase();
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Current registration flow data
  currentStep: 1,
  totalSteps: 5, // Updated to include auth method selection
  
  // Authentication method selection
  authMethod: null, // 'email', 'google', 'phone'
  authMethodSelected: false,
  
  // User data being collected
  userData: {
    // Authentication data
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    
    // Personal information
    firstName: '',
    lastName: '',
    username: '',
    dateOfBirth: '',
    
    // Role and sport
    userType: 'PLAYER', // 'PLAYER', 'COACH', 'CUSTOM'
    customRole: '',
    sport: '',
    
    // Security
    securityQuestion: '',
    securityAnswer: '',
    
    // Preferences
    emailOptIn: true,
    profileImage: null,
    
    // System fields
    registrationId: null,
    firebaseUid: null,
    createdAt: null,
    lastSyncAt: null,
    syncedToServer: false
  },
  
  // Google OAuth data
  googleAuthData: {
    idToken: null,
    accessToken: null,
    user: null,
    loading: false,
    error: null
  },
  
  // Phone auth data
  phoneAuthData: {
    verificationId: null,
    verificationCode: '',
    loading: false,
    error: null
  },
  
  // Registration flow state
  loading: false,
  error: null,
  success: false,
  registrationMode: null, // 'online', 'offline'
  
  // Validation state
  validation: {
    email: { isValid: false, error: null },
    password: { isValid: false, error: null },
    personalInfo: { isValid: false, errors: [] },
    roleSelection: { isValid: false, error: null },
    security: { isValid: false, errors: [] }
  },
  
  // Step completion tracking
  stepsCompleted: {
    authMethodSelection: false,
    personalInfo: false,
    roleSelection: false,
    security: false,
    passwordCreation: false
  },
  
  // Offline sync state
  syncStatus: {
    syncing: false,
    pendingSync: false,
    lastSyncAttempt: null,
    syncError: null,
    unsyncedCount: 0
  }
};

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    // Navigation actions
    setCurrentStep: (state, action) => {
      state.currentStep = Math.max(1, Math.min(action.payload, state.totalSteps));
    },
    
    nextStep: (state) => {
      if (state.currentStep < state.totalSteps) {
        state.currentStep += 1;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    // Authentication method actions
    setAuthMethod: (state, action) => {
      state.authMethod = action.payload;
      state.authMethodSelected = true;
      state.stepsCompleted.authMethodSelection = true;
      
      // Clear other auth data when switching methods
      if (action.payload !== 'google') {
        state.googleAuthData = initialState.googleAuthData;
      }
      if (action.payload !== 'phone') {
        state.phoneAuthData = initialState.phoneAuthData;
      }
    },
    
    clearAuthMethod: (state) => {
      state.authMethod = null;
      state.authMethodSelected = false;
      state.stepsCompleted.authMethodSelection = false;
      state.googleAuthData = initialState.googleAuthData;
      state.phoneAuthData = initialState.phoneAuthData;
    },
    
    // User data actions
    updateUserData: (state, action) => {
      state.userData = { ...state.userData, ...action.payload };
    },
    
    setUserField: (state, action) => {
      const { field, value } = action.payload;
      state.userData[field] = value;
    },
    
    clearUserData: (state) => {
      state.userData = initialState.userData;
    },
    
    // Google Auth actions
    setGoogleAuthLoading: (state, action) => {
      state.googleAuthData.loading = action.payload;
    },
    
    setGoogleAuthData: (state, action) => {
      state.googleAuthData = {
        ...state.googleAuthData,
        ...action.payload,
        loading: false,
        error: null
      };
      
      // Pre-fill user data from Google
      if (action.payload.user) {
        const googleUser = action.payload.user;
        state.userData = {
          ...state.userData,
          email: googleUser.email || '',
          firstName: googleUser.givenName || '',
          lastName: googleUser.familyName || '',
          profileImage: googleUser.photo || null
        };
      }
    },
    
    setGoogleAuthError: (state, action) => {
      state.googleAuthData.error = action.payload;
      state.googleAuthData.loading = false;
    },
    
    clearGoogleAuthData: (state) => {
      state.googleAuthData = initialState.googleAuthData;
    },
    
    // Phone Auth actions
    setPhoneAuthLoading: (state, action) => {
      state.phoneAuthData.loading = action.payload;
    },
    
    setPhoneVerificationId: (state, action) => {
      state.phoneAuthData.verificationId = action.payload;
      state.phoneAuthData.loading = false;
    },
    
    setPhoneVerificationCode: (state, action) => {
      state.phoneAuthData.verificationCode = action.payload;
    },
    
    setPhoneAuthError: (state, action) => {
      state.phoneAuthData.error = action.payload;
      state.phoneAuthData.loading = false;
    },
    
    clearPhoneAuthData: (state) => {
      state.phoneAuthData = initialState.phoneAuthData;
    },
    
    // Validation actions
    setFieldValidation: (state, action) => {
      const { field, isValid, error } = action.payload;
      state.validation[field] = { isValid, error };
    },
    
    setStepValidation: (state, action) => {
      const { step, isValid, errors } = action.payload;
      state.validation[step] = { isValid, errors: errors || [] };
    },
    
    clearValidation: (state) => {
      state.validation = initialState.validation;
    },
    
    // Step completion actions
    setStepCompleted: (state, action) => {
      const { step, completed } = action.payload;
      state.stepsCompleted[step] = completed;
    },
    
    markStepCompleted: (state, action) => {
      const step = action.payload;
      state.stepsCompleted[step] = true;
    },
    
    // Registration state actions
    setRegistrationLoading: (state, action) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    setRegistrationError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.success = false;
    },
    
    setRegistrationSuccess: (state, action) => {
      state.success = true;
      state.loading = false;
      state.error = null;
      state.registrationMode = action.payload?.mode || 'online';
      
      // Update user data with registration result
      if (action.payload?.userData) {
        state.userData = { ...state.userData, ...action.payload.userData };
      }
    },
    
    setRegistrationMode: (state, action) => {
      state.registrationMode = action.payload;
    },
    
    // Sync status actions
    setSyncStatus: (state, action) => {
      state.syncStatus = { ...state.syncStatus, ...action.payload };
    },
    
    setSyncing: (state, action) => {
      state.syncStatus.syncing = action.payload;
      if (action.payload) {
        state.syncStatus.syncError = null;
      }
    },
    
    setSyncError: (state, action) => {
      state.syncStatus.syncError = action.payload;
      state.syncStatus.syncing = false;
      state.syncStatus.lastSyncAttempt = new Date().toISOString();
    },
    
    setSyncSuccess: (state, action) => {
      state.syncStatus.syncing = false;
      state.syncStatus.syncError = null;
      state.syncStatus.lastSyncAttempt = new Date().toISOString();
      state.syncStatus.pendingSync = false;
      
      if (action.payload?.syncedCount !== undefined) {
        state.syncStatus.unsyncedCount = Math.max(0, 
          state.syncStatus.unsyncedCount - action.payload.syncedCount
        );
      }
    },
    
    setPendingSync: (state, action) => {
      state.syncStatus.pendingSync = action.payload;
      if (action.payload && typeof action.payload === 'number') {
        state.syncStatus.unsyncedCount = action.payload;
      }
    },
    
    // Reset actions
    resetRegistration: (state) => {
      return { ...initialState };
    },
    
    resetToStep: (state, action) => {
      const step = action.payload;
      state.currentStep = step;
      
      // Clear data for subsequent steps
      if (step <= 1) {
        state.authMethod = null;
        state.authMethodSelected = false;
        state.stepsCompleted.authMethodSelection = false;
      }
      if (step <= 2) {
        state.userData = { ...state.userData, ...initialState.userData };
        state.stepsCompleted.personalInfo = false;
      }
      if (step <= 3) {
        state.stepsCompleted.roleSelection = false;
      }
      if (step <= 4) {
        state.stepsCompleted.security = false;
      }
      if (step <= 5) {
        state.stepsCompleted.passwordCreation = false;
      }
      
      state.error = null;
      state.success = false;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.registrationMode = action.payload.mode;
        
        if (action.payload.userData) {
          state.userData = { ...state.userData, ...action.payload.userData };
        }
        
        if (action.payload.mode === 'offline') {
          state.syncStatus.pendingSync = true;
          state.syncStatus.unsyncedCount += 1;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Sync offline registrations
      .addCase(syncOfflineRegistrations.pending, (state) => {
        state.syncStatus.syncing = true;
        state.syncStatus.syncError = null;
      })
      .addCase(syncOfflineRegistrations.fulfilled, (state, action) => {
        state.syncStatus.syncing = false;
        state.syncStatus.lastSyncAttempt = new Date().toISOString();
        
        if (action.payload.success) {
          state.syncStatus.pendingSync = action.payload.failedCount > 0;
          state.syncStatus.unsyncedCount = action.payload.failedCount || 0;
        }
      })
      .addCase(syncOfflineRegistrations.rejected, (state, action) => {
        state.syncStatus.syncing = false;
        state.syncStatus.syncError = action.payload;
        state.syncStatus.lastSyncAttempt = new Date().toISOString();
      });
  }
});

// Export actions
export const {
  // Navigation
  setCurrentStep,
  nextStep,
  previousStep,
  
  // Auth method
  setAuthMethod,
  clearAuthMethod,
  
  // User data
  updateUserData,
  setUserField,
  clearUserData,
  
  // Google auth
  setGoogleAuthLoading,
  setGoogleAuthData,
  setGoogleAuthError,
  clearGoogleAuthData,
  
  // Phone auth
  setPhoneAuthLoading,
  setPhoneVerificationId,
  setPhoneVerificationCode,
  setPhoneAuthError,
  clearPhoneAuthData,
  
  // Validation
  setFieldValidation,
  setStepValidation,
  clearValidation,
  
  // Step completion
  setStepCompleted,
  markStepCompleted,
  
  // Registration state
  setRegistrationLoading,
  setRegistrationError,
  setRegistrationSuccess,
  setRegistrationMode,
  
  // Sync status
  setSyncStatus,
  setSyncing,
  setSyncError,
  setSyncSuccess,
  setPendingSync,
  
  // Reset
  resetRegistration,
  resetToStep
} = registrationSlice.actions;

// Selectors
export const selectRegistration = (state) => state.registration;
export const selectCurrentStep = (state) => state.registration.currentStep;
export const selectAuthMethod = (state) => state.registration.authMethod;
export const selectUserData = (state) => state.registration.userData;
export const selectRegistrationLoading = (state) => state.registration.loading;
export const selectRegistrationError = (state) => state.registration.error;
export const selectSyncStatus = (state) => state.registration.syncStatus;
export const selectStepsCompleted = (state) => state.registration.stepsCompleted;
export const selectValidation = (state) => state.registration.validation;

// Computed selectors
export const selectCanProceed = (state) => {
  const { currentStep, authMethod, stepsCompleted } = state.registration;
  
  switch (currentStep) {
    case 1: // Auth method selection
      return authMethod !== null;
    case 2: // Personal info
      return stepsCompleted.personalInfo;
    case 3: // Role selection
      return stepsCompleted.roleSelection;
    case 4: // Security questions (skip for Google/Phone)
      return authMethod === 'email' ? stepsCompleted.security : true;
    case 5: // Password creation (skip for Google/Phone)
      return authMethod === 'email' ? stepsCompleted.passwordCreation : true;
    default:
      return false;
  }
};

export const selectProgressPercentage = (state) => {
  const { currentStep, totalSteps } = state.registration;
  return Math.round((currentStep / totalSteps) * 100);
};

export const selectShouldSkipStep = (authMethod, step) => {
  // Skip security questions and password creation for non-email auth
  if (authMethod !== 'email' && (step === 4 || step === 5)) {
    return true;
  }
  return false;
};

export default registrationSlice.reducer;