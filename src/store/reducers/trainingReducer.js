import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  trainingPlans: [],
  sessions: [],
  assignments: [],
  feedback: [],
  loading: false,
  error: null,
};

const trainingSlice = createSlice({
  name: 'training',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setTrainingPlans: (state, action) => {
      state.trainingPlans = action.payload;
    },
    addTrainingPlan: (state, action) => {
      state.trainingPlans.push(action.payload);
    },
    setSessions: (state, action) => {
      state.sessions = action.payload;
    },
    addSession: (state, action) => {
      state.sessions.push(action.payload);
    },
    setAssignments: (state, action) => {
      state.assignments = action.payload;
    },
    addFeedback: (state, action) => {
      state.feedback.push(action.payload);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setTrainingPlans,
  addTrainingPlan,
  setSessions,
  addSession,
  setAssignments,
  addFeedback,
  setError,
  clearError,
} = trainingSlice.actions;

export default trainingSlice.reducer;