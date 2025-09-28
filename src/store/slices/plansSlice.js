// slices/plansSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  personalizedPlans: [],
  loading: false,
  error: null,
  categories: [
    { id: 'all', label: 'All Plans', icon: 'grid-view', color: '#667eea' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center', color: '#F44336' },
    { id: 'cardio', label: 'Cardio', icon: 'favorite', color: '#4CAF50' },
    { id: 'skill', label: 'Technical', icon: 'sports-soccer', color: '#FF9800' },
    { id: 'recovery', label: 'Recovery', icon: 'spa', color: '#2196F3' },
    { id: 'nutrition', label: 'Nutrition', icon: 'restaurant', color: '#9C27B0' },
  ],
};

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    setPersonalizedPlans: (state, action) => {
      state.personalizedPlans = action.payload;
      state.loading = false;
      state.error = null;
    },
    addPersonalizedPlan: (state, action) => {
      state.personalizedPlans.push(action.payload);
    },
    updatePersonalizedPlan: (state, action) => {
      const index = state.personalizedPlans.findIndex(
        plan => plan.id === action.payload.id
      );
      if (index !== -1) {
        state.personalizedPlans[index] = { ...state.personalizedPlans[index], ...action.payload };
      }
    },
    removePersonalizedPlan: (state, action) => {
      state.personalizedPlans = state.personalizedPlans.filter(
        plan => plan.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePlanProgress: (state, action) => {
      const { planId, progress, completedSessions } = action.payload;
      const plan = state.personalizedPlans.find(p => p.id === planId);
      if (plan) {
        plan.progress = progress;
        plan.completedSessions = completedSessions;
        plan.lastUpdated = 'Just now';
      }
    },
    adaptPlan: (state, action) => {
      const { planId } = action.payload;
      const plan = state.personalizedPlans.find(p => p.id === planId);
      if (plan) {
        plan.adaptations = (plan.adaptations || 0) + 1;
        plan.lastUpdated = 'Just now';
        plan.aiScore = Math.min(100, plan.aiScore + 2); // Slight AI score improvement
      }
    },
  },
});

export const {
  setPersonalizedPlans,
  addPersonalizedPlan,
  updatePersonalizedPlan,
  removePersonalizedPlan,
  setLoading,
  setError,
  clearError,
  updatePlanProgress,
  adaptPlan,
} = plansSlice.actions;

export default plansSlice.reducer;