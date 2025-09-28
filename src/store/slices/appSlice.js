// src/store/slices/appSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOffline: false,
  theme: 'light',
  // Add other app-wide state here
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOfflineStatus: (state, action) => {
      state.isOffline = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { setOfflineStatus, toggleTheme } = appSlice.actions;
export default appSlice.reducer;