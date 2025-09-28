// src/store/actions/trainingActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import FirebaseService from '../../services/FirebaseService';

export const fetchTrainingPlans = createAsyncThunk(
  'training/fetchTrainingPlans',
  async (_, { rejectWithValue }) => {
    try {
      const plans = await FirebaseService.getTrainingPlans();
      return plans;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTrainingPlan = createAsyncThunk(
  'training/createTrainingPlan',
  async (planData, { rejectWithValue }) => {
    try {
      const result = await FirebaseService.createTrainingPlan(planData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'training/fetchSessions',
  async (_, { rejectWithValue }) => {
    try {
      const sessions = await FirebaseService.getSessions();
      return sessions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createSession = createAsyncThunk(
  'training/createSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      const result = await FirebaseService.createSession(sessionData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitFeedback = createAsyncThunk(
  'training/submitFeedback',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const result = await FirebaseService.submitFeedback(feedbackData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);