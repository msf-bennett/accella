// src/store/actions/userActions.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import FirebaseService from '../../services/FirebaseService';

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const profile = await FirebaseService.getUserProfile(userId);
      return profile;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const result = await FirebaseService.updateUserProfile(profileData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserPreferences = createAsyncThunk(
  'user/fetchPreferences',
  async (userId, { rejectWithValue }) => {
    try {
      const preferences = await FirebaseService.getUserPreferences(userId);
      return preferences;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferencesData, { rejectWithValue }) => {
    try {
      const result = await FirebaseService.updateUserPreferences(preferencesData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'user/fetchNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      const notifications = await FirebaseService.getUserNotifications(userId);
      return notifications;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'user/markNotificationAsRead',
  async ({ userId, notificationId }, { rejectWithValue }) => {
    try {
      await FirebaseService.markNotificationAsRead(userId, notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);