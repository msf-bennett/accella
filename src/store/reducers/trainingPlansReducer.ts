import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TrainingPlan {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  // Add other properties as needed
}

interface TrainingPlansState {
  trainingPlans: TrainingPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: TrainingPlansState = {
  trainingPlans: [],
  loading: false,
  error: null,
};

const trainingPlansSlice = createSlice({
  name: 'trainingPlans',
  initialState,
  reducers: {
    setTrainingPlans: (state, action: PayloadAction<TrainingPlan[]>) => {
      state.trainingPlans = action.payload;
    },
    addTrainingPlan: (state, action: PayloadAction<TrainingPlan>) => {
      state.trainingPlans.push(action.payload);
    },
    removeTrainingPlan: (state, action: PayloadAction<string>) => {
      state.trainingPlans = state.trainingPlans.filter(plan => plan.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setTrainingPlans, 
  addTrainingPlan, 
  removeTrainingPlan, 
  setLoading, 
  setError 
} = trainingPlansSlice.actions;

export default trainingPlansSlice.reducer;