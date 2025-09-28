import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  generatedWorkout: null,
  templates: [
    {
      id: 1,
      name: 'Pre-Season Conditioning',
      sport: 'football',
      duration: 90,
      intensity: 'high',
      rating: 4.8,
      uses: 245,
      color: '#EF4444'
    },
    {
      id: 2,
      name: 'Youth Skill Development',
      sport: 'football',
      duration: 60,
      intensity: 'moderate',
      rating: 4.9,
      uses: 189,
      color: '#667eea'
    },
    {
      id: 3,
      name: 'Match Day Preparation',
      sport: 'football',
      duration: 45,
      intensity: 'low',
      rating: 4.7,
      uses: 156,
      color: '#10B981'
    }
  ],
  loading: false,
  error: null,
  isGenerating: false,
};

const workoutsSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    setWorkouts: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    addWorkout: (state, action) => {
      state.items.push(action.payload);
    },
    updateWorkout: (state, action) => {
      const index = state.items.findIndex(
        workout => workout.id === action.payload.id
      );
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    removeWorkout: (state, action) => {
      state.items = state.items.filter(
        workout => workout.id !== action.payload
      );
    },
    setGeneratedWorkout: (state, action) => {
      state.generatedWorkout = action.payload;
      state.isGenerating = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setGenerating: (state, action) => {
      state.isGenerating = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.isGenerating = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearGeneratedWorkout: (state) => {
      state.generatedWorkout = null;
    },
  },
});

export const {
  setWorkouts,
  addWorkout,
  updateWorkout,
  removeWorkout,
  setGeneratedWorkout,
  setLoading,
  setGenerating,
  setError,
  clearError,
  clearGeneratedWorkout,
} = workoutsSlice.actions;

export default workoutsSlice.reducer;