//src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import reducers - these should be the JS files that exist
import authReducer from './reducers/authReducer';
import trainingReducer from './reducers/trainingReducer';
import userReducer from './reducers/userReducer';

// Import slices - these should be the JS files that exist
import appReducer from './slices/appSlice';
import playersReducer from './slices/playersSlice';
import plansReducer from './slices/plansSlice';
import workoutsReducer from './slices/workoutsSlice';
import sessionsReducer from './slices/sessionsSlice';
import registrationReducer from './slices/registrationSlice';
import networkReducer from './slices/networkSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'registration'], // Persist auth and registration
  blacklist: ['network'] // Don't persist network state
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
  auth: authReducer,
  training: trainingReducer,
  user: userReducer,
  app: appReducer,
  players: playersReducer,
  plans: plansReducer,
  workouts: workoutsReducer,
  sessions: sessionsReducer,
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

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;