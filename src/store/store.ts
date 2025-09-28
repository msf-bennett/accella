import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import trainingReducer from './reducers/trainingReducer';
import appReducer from './slices/appSlice';
import playersReducer from './slices/playersSlice';
import sessionsReducer from './slices/sessionsSlice';
import plansReducer from './slices/plansSlice';
import workoutsReducer from './slices/workoutsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    training: trainingReducer,
    app: appReducer,
    players: playersReducer,
    sessions: sessionsReducer,
    plans: plansReducer,
    workouts: workoutsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;