// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers
import registrationReducer from './slices/registrationSlice';
import networkReducer from './slices/networkSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['registration'], // Only persist registration data
  blacklist: ['network'] // Don't persist network state (it should be fresh)
};

// Registration persist config (more granular control)
const registrationPersistConfig = {
  key: 'registration',
  storage: AsyncStorage,
  whitelist: [
    'userData',
    'authMethod',
    'currentStep',
    'stepsCompleted',
    'syncStatus'
  ],
  blacklist: [
    'loading',
    'error',
    'googleAuthData',
    'phoneAuthData',
    'validation'
  ]
};

// Combine reducers
const rootReducer = combineReducers({
  registration: persistReducer(registrationPersistConfig, registrationReducer),
  network: networkReducer
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER'
        ]
      }
    }),
  devTools: __DEV__
});

// Create persistor
export const persistor = persistStore(store);

// Export types for TypeScript (optional)
//export type RootState = ReturnType<typeof store.getState>;
//export type AppDispatch = typeof store.dispatch;