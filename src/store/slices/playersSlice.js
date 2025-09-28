// src/store/slices/playersSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {
    totalPlayers: 0,
    activePlayers: 0,
    inactivePlayers: 0,
  },
  players: [],
  loading: false,
  error: null,
};

const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    setPlayerStats: (state, action) => {
      state.stats = action.payload;
    },
    setPlayers: (state, action) => {
      state.players = action.payload;
    },
  },
});

export const { setPlayerStats, setPlayers } = playersSlice.actions;
export default playersSlice.reducer;
