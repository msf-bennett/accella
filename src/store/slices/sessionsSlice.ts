// slices/sessionsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Session {
  id: string;
  title: string;
  time: string;
  duration: number;
  status: 'completed' | 'upcoming' | 'in_progress' | 'cancelled';
  type: string;
  players: number;
  location: string;
  image?: string;
  completionRate?: number;
  revenue?: string;
  date: string; // ISO date string
  description?: string;
  playerId?: string;
  coachId?: string;
  programId?: string;
}

export interface SessionsState {
  upcomingSessions: Session[];
  completedSessions: Session[];
  todaySessions: Session[];
  allSessions: Session[];
  loading: boolean;
  error: string | null;
  selectedSession: Session | null;
}

const initialState: SessionsState = {
  upcomingSessions: [
    {
      id: '1',
      title: 'Youth Team - Agility Training',
      time: '05:30 PM',
      duration: 90,
      status: 'upcoming',
      type: 'Youth Training',
      players: 8,
      location: 'Field C',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=100',
      completionRate: 0,
      revenue: '$160',
      date: new Date().toISOString(),
      description: 'Focus on agility drills and coordination exercises'
    },
    {
      id: '2',
      title: 'Elite Team - Strength Session',
      time: '07:00 PM',
      duration: 60,
      status: 'upcoming',
      type: 'Strength Training',
      players: 12,
      location: 'Gym A',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
      revenue: '$240',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      description: 'Intensive strength and conditioning workout'
    }
  ],
  completedSessions: [
    {
      id: '3',
      title: 'Team A - Strength Training',
      time: '09:00 AM',
      duration: 60,
      status: 'completed',
      type: 'Team Session',
      players: 12,
      location: 'Gym A',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100',
      completionRate: 100,
      revenue: '$120',
      date: new Date().toISOString(),
      description: 'Completed morning strength training session'
    },
    {
      id: '4',
      title: '1-on-1 with Sarah Connor',
      time: '02:00 PM',
      duration: 45,
      status: 'completed',
      type: 'Personal Training',
      players: 1,
      location: 'Studio B',
      image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=100',
      completionRate: 95,
      revenue: '$80',
      date: new Date().toISOString(),
      description: 'Personal training session focused on technique'
    }
  ],
  todaySessions: [],
  allSessions: [],
  loading: false,
  error: null,
  selectedSession: null,
};

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Add a new session
    addSession: (state, action: PayloadAction<Session>) => {
      const session = action.payload;
      state.allSessions.push(session);
      
      if (session.status === 'upcoming') {
        state.upcomingSessions.push(session);
      } else if (session.status === 'completed') {
        state.completedSessions.push(session);
      }

      // Check if it's today's session
      const today = new Date().toDateString();
      const sessionDate = new Date(session.date).toDateString();
      if (today === sessionDate) {
        state.todaySessions.push(session);
      }
    },

    // Update a session
    updateSession: (state, action: PayloadAction<Session>) => {
      const updatedSession = action.payload;
      const sessionId = updatedSession.id;

      // Update in allSessions
      const allIndex = state.allSessions.findIndex(s => s.id === sessionId);
      if (allIndex !== -1) {
        state.allSessions[allIndex] = updatedSession;
      }

      // Update in appropriate status arrays
      const removeFromArray = (array: Session[]) => {
        const index = array.findIndex(s => s.id === sessionId);
        if (index !== -1) {
          array.splice(index, 1);
        }
      };

      // Remove from all status arrays
      removeFromArray(state.upcomingSessions);
      removeFromArray(state.completedSessions);
      removeFromArray(state.todaySessions);

      // Add to appropriate array based on new status
      if (updatedSession.status === 'upcoming') {
        state.upcomingSessions.push(updatedSession);
      } else if (updatedSession.status === 'completed') {
        state.completedSessions.push(updatedSession);
      }

      // Check if it's today's session
      const today = new Date().toDateString();
      const sessionDate = new Date(updatedSession.date).toDateString();
      if (today === sessionDate) {
        state.todaySessions.push(updatedSession);
      }
    },

    // Delete a session
    deleteSession: (state, action: PayloadAction<string>) => {
      const sessionId = action.payload;
      
      state.allSessions = state.allSessions.filter(s => s.id !== sessionId);
      state.upcomingSessions = state.upcomingSessions.filter(s => s.id !== sessionId);
      state.completedSessions = state.completedSessions.filter(s => s.id !== sessionId);
      state.todaySessions = state.todaySessions.filter(s => s.id !== sessionId);

      if (state.selectedSession?.id === sessionId) {
        state.selectedSession = null;
      }
    },

    // Set all sessions
    setSessions: (state, action: PayloadAction<Session[]>) => {
      const sessions = action.payload;
      state.allSessions = sessions;
      
      // Categorize sessions
      state.upcomingSessions = sessions.filter(s => s.status === 'upcoming');
      state.completedSessions = sessions.filter(s => s.status === 'completed');
      
      // Filter today's sessions
      const today = new Date().toDateString();
      state.todaySessions = sessions.filter(s => {
        const sessionDate = new Date(s.date).toDateString();
        return today === sessionDate;
      });
    },

    // Set upcoming sessions
    setUpcomingSessions: (state, action: PayloadAction<Session[]>) => {
      state.upcomingSessions = action.payload;
    },

    // Set completed sessions
    setCompletedSessions: (state, action: PayloadAction<Session[]>) => {
      state.completedSessions = action.payload;
    },

    // Set today's sessions
    setTodaySessions: (state, action: PayloadAction<Session[]>) => {
      state.todaySessions = action.payload;
    },

    // Select a session
    selectSession: (state, action: PayloadAction<Session | null>) => {
      state.selectedSession = action.payload;
    },

    // Complete a session
    completeSession: (state, action: PayloadAction<{ sessionId: string; completionRate?: number }>) => {
      const { sessionId, completionRate = 100 } = action.payload;
      
      const session = state.allSessions.find(s => s.id === sessionId);
      if (session) {
        session.status = 'completed';
        session.completionRate = completionRate;
        
        // Move from upcoming to completed
        state.upcomingSessions = state.upcomingSessions.filter(s => s.id !== sessionId);
        const existingInCompleted = state.completedSessions.find(s => s.id === sessionId);
        if (!existingInCompleted) {
          state.completedSessions.push(session);
        }
      }
    },

    // Start a session
    startSession: (state, action: PayloadAction<string>) => {
      const sessionId = action.payload;
      const session = state.allSessions.find(s => s.id === sessionId);
      if (session) {
        session.status = 'in_progress';
      }
    },

    // Cancel a session
    cancelSession: (state, action: PayloadAction<string>) => {
      const sessionId = action.payload;
      const session = state.allSessions.find(s => s.id === sessionId);
      if (session) {
        session.status = 'cancelled';
        // Remove from upcoming sessions
        state.upcomingSessions = state.upcomingSessions.filter(s => s.id !== sessionId);
      }
    },

    // Clear all data
    clearSessions: (state) => {
      state.upcomingSessions = [];
      state.completedSessions = [];
      state.todaySessions = [];
      state.allSessions = [];
      state.selectedSession = null;
      state.error = null;
    },

    // Refresh today's sessions
    refreshTodaySessions: (state) => {
      const today = new Date().toDateString();
      state.todaySessions = state.allSessions.filter(s => {
        const sessionDate = new Date(s.date).toDateString();
        return today === sessionDate;
      });
    }
  },
});

export const {
  setLoading,
  setError,
  addSession,
  updateSession,
  deleteSession,
  setSessions,
  setUpcomingSessions,
  setCompletedSessions,
  setTodaySessions,
  selectSession,
  completeSession,
  startSession,
  cancelSession,
  clearSessions,
  refreshTodaySessions
} = sessionsSlice.actions;

export default sessionsSlice.reducer;