//src/screens/coach/training/SessionScheduler.js
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Vibration,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import { BlurView } from '../../../components/shared/BlurView';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Searchbar,
  ProgressBar,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { Platform } from 'react-native';

// Services
import SessionExtractor from '../../../services/SessionExtractor';
import DocumentProcessor from '../../../services/DocumentProcessor';
import SessionScheduleScreen from './SessionScheduleScreen';
import AIService from '../../../services/AIService.js';
import NotificationService from '../../../services/NotificationService';
import SessionProgressCard from '../../../components/training/SessionProgressCard';
import SessionManager, { SessionStatus } from '../../../utils/sessionManager';
import { useSessionCounts } from '../../../contexts/SessionContext';
// Design system
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';



// Cross-platform animation handling
let Animated, FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle;

if (Platform.OS === 'web') {
  // Use React Native's built-in Animated for web
  const RNAnimated = require('react-native').Animated;
  
  Animated = {
    View: RNAnimated.View,
    timing: RNAnimated.timing,
    parallel: RNAnimated.parallel,
    Value: RNAnimated.Value,
  };
  
  // Mock reanimated functions for web
  FadeInDown = {
    delay: (ms) => ({ delay: ms })
  };
  
  FadeInRight = {
    delay: (ms) => ({ delay: ms })
  };
  
  useSharedValue = (initialValue) => {
    const ref = React.useRef(new RNAnimated.Value(initialValue));
    return ref.current;
  };
  
  useAnimatedStyle = () => ({});
  
} else {
  // Use react-native-reanimated for native platforms
  try {
    const ReAnimated = require('react-native-reanimated');
    Animated = ReAnimated.default;
    FadeInDown = ReAnimated.FadeInDown;
    FadeInRight = ReAnimated.FadeInRight;
    useSharedValue = ReAnimated.useSharedValue;
    useAnimatedStyle = ReAnimated.useAnimatedStyle;
  } catch (error) {
    console.warn('react-native-reanimated not available, falling back to RN Animated');
    // Fallback to React Native Animated if reanimated fails
    const RNAnimated = require('react-native').Animated;
    
    Animated = {
      View: RNAnimated.View,
      timing: RNAnimated.timing,
      parallel: RNAnimated.parallel,
      Value: RNAnimated.Value,
    };
    
    FadeInDown = { delay: (ms) => ({ delay: ms }) };
    FadeInRight = { delay: (ms) => ({ delay: ms }) };
    useSharedValue = (initialValue) => {
      const ref = React.useRef(new RNAnimated.Value(initialValue));
      return ref.current;
    };
    useAnimatedStyle = () => ({});
  }
}

const { width, height } = Dimensions.get('window');

const SessionScheduler = ({ navigation, route }) => {
  const { refreshSessionCounts } = useSessionCounts();
  const COLORS_FALLBACK = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
    background: '#f5f7fa',
    surface: '#ffffff',
    textPrimary: '#333333',
    textSecondary: '#666666',
    text: '#333333',
    white: '#ffffff',
    border: '#E0E0E0'
  };

  const dispatch = useDispatch();
  const { user, coachData } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // week, month, day
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sessionStatuses, setSessionStatuses] = useState({});
  await NotificationService.syncNotifications(allSessions);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('all');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [expandedDays, setExpandedDays] = useState({});
  const [expandedSessions, setExpandedSessions] = useState({});

  // Session data
  const [extractedSessions, setExtractedSessions] = useState([]);
  const [manualSessions, setManualSessions] = useState([]);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [completionStats, setCompletionStats] = useState(null);
  const [missedByWeek, setMissedByWeek] = useState({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);


      const toggleDayExpanded = (dayId) => {
      setExpandedDays(prev => ({
        ...prev,
        [dayId]: !prev[dayId]
      }));
    };

    const toggleSessionExpanded = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  // Create session state
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    date: new Date(),
    time: '09:00',
    duration: 60,
    location: '',
    type: 'training',
    players: [],
    trainingPlan: null,
    notes: '',
  });

  const scrollY = Platform.OS === 'web' ? 0 : useSharedValue(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const sessionTypes = [
    { id: 'training', label: 'Training', icon: 'fitness-center', color: COLORS?.primary || COLORS_FALLBACK.primary },
    { id: 'meeting', label: 'Meeting', icon: 'meeting-room', color: COLORS?.secondary || COLORS_FALLBACK.secondary },
    { id: 'individual', label: 'Individual', icon: 'person', color: COLORS?.success || COLORS_FALLBACK.success },
    { id: 'assessment', label: 'Assessment', icon: 'assessment', color: COLORS?.warning || COLORS_FALLBACK.warning },
    { id: 'recovery', label: 'Recovery', icon: 'spa', color: COLORS?.info || COLORS_FALLBACK.info },
    { id: 'match', label: 'Match', icon: 'sports-soccer', color: COLORS?.error || COLORS_FALLBACK.error },
  ];

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Initialize data
  useEffect(() => {
    initializeSessionData();
  }, []);

  // Animation setup
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
  loadSessionStatuses();
}, []);

const loadSessionStatuses = async () => {
  try {
    const statuses = await SessionManager.getSessionStatuses();
    setSessionStatuses(statuses);
    
    // Load completion stats
    if (allSessions.length > 0) {
      const stats = await SessionManager.getCompletionStats(allSessions);
      setCompletionStats(stats);
      
      const missed = await SessionManager.getMissedSessionsByWeek(allSessions);
      setMissedByWeek(missed);
    }
  } catch (error) {
    console.error('Error loading session statuses:', error);
  }
};

const handleSessionAction = async (session, action) => {
  const sessionState = SessionManager.getSessionState(session, sessionStatuses);
  
  if (action === 'start') {
    handleStartSession(session);
  } else if (action === 'recover') {
    // Show confirmation dialog for missed sessions
    setShowConfirmDialog({
      session,
      message: `Start ${session.day}'s session now?`,
      options: [
        {
          text: 'Yes, start it',
          onPress: () => {
            setShowConfirmDialog(null);
            handleStartSession(session);
          }
        },
        {
          text: 'Just mark complete',
          onPress: async () => {
            await SessionManager.updateSessionStatus(
              session.id,
              SessionStatus.COMPLETED,
              { completedAt: new Date().toISOString(), recoveredMissed: true }
            );
            setShowConfirmDialog(null);
            await loadSessionStatuses();
          }
        },
        {
          text: 'Skip permanently',
          style: 'destructive',
          onPress: () => handleSkipSession(session)
        }
      ]
    });
  } else if (action === 'early') {
    Alert.alert(
      'Start Early?',
      `Do you want to start ${session.day}'s session early?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start Now', onPress: () => handleStartSession(session) }
      ]
    );
  }
};

  useEffect(() => {
    const { filter, createNew } = route.params || {};
    
    if (filter) {
      setSelectedTimePeriod(filter === 'today' ? 'today' : 
                          filter === 'tomorrow' ? 'tomorrow' :
                          filter === 'week' ? 'thisWeek' :
                          filter === 'month' ? 'thisMonth' : 'all');
    }
    
    if (createNew) {
      setShowCreateModal(true);
    }
  }, [route.params]);

 const initializeSessionData = async () => {
    try {
      setLoading(true);
      console.log('Initializing session data...');

      const plans = await DocumentProcessor.getTrainingPlans();
      setTrainingPlans(plans);
      
      const allExtractedSessions = [];
      
      for (const plan of plans) {
        try {
          if (plan.sourceDocument) {
            const documents = await DocumentProcessor.getStoredDocuments();
            const sourceDoc = documents.find(doc => doc.id === plan.sourceDocument);
            
            if (sourceDoc) {
              const extractionResult = await SessionExtractor.extractSessionsFromDocument(sourceDoc, plan);
              
              if (extractionResult?.sessions) {
                extractionResult.sessions.forEach((weekSession) => {
                  if (weekSession.dailySessions?.length > 0) {
                    weekSession.dailySessions.forEach((dailySession) => {
                      const enhancedDailySession = {
                        ...dailySession,
                        id: `daily_${dailySession.id}`,
                        title: `${plan.title} - Week ${weekSession.weekNumber}, ${dailySession.day}`,
                        planTitle: plan.title,
                        sourcePlan: plan.id,
                        sourceDocument: sourceDoc.id,
                        weekData: weekSession,
                      };
                      
                      allExtractedSessions.push(enhancedDailySession);
                    });
                  }
                });
              }
            }
          }
        } catch (error) {
          console.error('Error processing plan:', plan.title, error.message);
        }
      }

      setExtractedSessions(allExtractedSessions);

      const combinedSessions = [
        ...allExtractedSessions,
        ...manualSessions
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      setAllSessions(combinedSessions);

      await refreshSessionCounts(combinedSessions);

      const userProfile = {
        ageGroup: user?.ageGroup || 'Youth',
        sport: user?.preferredSport || 'General',
        experience: user?.experience || 'intermediate'
      };

      try {
        const recommendations = await AIService.getSessionRecommendations(
          allExtractedSessions,
          userProfile
        );
        setAiRecommendations(recommendations);
      } catch (error) {
        console.warn('Could not load AI recommendations:', error);
        setAiRecommendations([]);
      }

    } catch (error) {
      console.error('Error initializing session data:', error);
      setSnackbarMessage('Failed to load session data');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };



  // Helper function to calculate session dates
  const calculateSessionDate = (weekNumber, dayName) => {
    const today = new Date();
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      .indexOf(dayName.toLowerCase());
    
    // Calculate the date for this session
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (weekNumber - 1) * 7);
    
    // Adjust to the correct day of week
    const currentDay = targetDate.getDay();
    const daysToAdd = (dayIndex - currentDay + 7) % 7;
    targetDate.setDate(targetDate.getDate() + daysToAdd);
    
    return targetDate.toISOString().split('T')[0];
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeSessionData();
    setRefreshing(false);
  }, []);

  const handleCreateSession = async () => {
    try {
      if (!newSession.title || !newSession.date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      Vibration.vibrate(50);

      // Create manual session
      const session = {
        id: `manual_${Date.now()}`,
        ...newSession,
        date: newSession.date.toISOString().split('T')[0],
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        isManual: true,
        academyName: coachData?.academyName || 'Training Academy',
        sport: 'General',
      };

      const updatedManualSessions = [...manualSessions, session];
      setManualSessions(updatedManualSessions);

      // Update all sessions
      const combinedSessions = [
        ...extractedSessions,
        ...updatedManualSessions
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      setAllSessions(combinedSessions);

      Alert.alert(
        'Success!',
        'Training session has been scheduled successfully',
        [{ text: 'OK', onPress: () => setShowCreateModal(false) }]
      );

      // Reset form
      setNewSession({
        title: '',
        description: '',
        date: new Date(),
        time: '09:00',
        duration: 60,
        location: '',
        type: 'training',
        players: [],
        trainingPlan: null,
        notes: '',
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to create session. Please try again.');
    }
  };

const handleSessionPress = (session) => {
  // Ensure we have complete session data with week information
  const completeSessionData = {
    ...session,
    weekData: session.weekData || {},
    weekNumber: session.weekNumber || session.week,
    weekTitle: session.weekTitle || session.title,
    planTitle: session.planTitle || 'Training Session',
    academyName: session.academyName || 'Training Academy',
    documentContent: session.documentContent || session.rawContent || '',
    rawContent: session.rawContent || session.documentContent || ''
  };

  navigation.navigate('SessionScheduleScreen', {
    sessionData: completeSessionData,
    planTitle: completeSessionData.planTitle,
    academyName: completeSessionData.academyName
  });
};

  const handleStartSession = (session) => {
    Alert.alert(
      'Start Session',
      `Ready to start "${session.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => {
            navigation.navigate('ActiveSession', { 
              sessionId: session.id,
              sessionData: session 
            });
          }
        }
      ]
    );
  };

  const handleEditSession = (session) => {
    if (session.isManual) {
      // Can edit manual sessions
      setNewSession({
        ...session,
        date: new Date(session.date),
      });
      setShowCreateModal(true);
    } else {
      // For extracted sessions, navigate to plan details
      Alert.alert(
        'Edit Session',
        'This session is part of a training plan. Edit the original document to modify.',
        [
          { text: 'OK' },
          {
            text: 'View Plan',
            onPress: () => navigation.navigate('TrainingPlanDetails', { 
              planId: session.sourcePlan 
            })
          }
        ]
      );
    }
  };

  const handleMarkComplete = async (session) => {
  try {
    await SessionManager.updateSessionStatus(
      session.id,
      SessionStatus.COMPLETED,
      { completedAt: new Date().toISOString() }
    );
    
    await loadSessionStatuses();
    
    setSnackbarMessage('Session marked as completed! 🎉');
    setSnackbarVisible(true);
  } catch (error) {
    Alert.alert('Error', 'Failed to update session status');
  }
};

const handleSkipSession = async (session) => {
  Alert.alert(
    'Skip Session',
    'Mark this session as skipped? You can still complete it later.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Skip',
        onPress: async () => {
          try {
            await SessionManager.updateSessionStatus(
              session.id,
              SessionStatus.SKIPPED,
              { skippedAt: new Date().toISOString() }
            );
            
            await loadSessionStatuses();
            
            setSnackbarMessage('Session skipped');
            setSnackbarVisible(true);
          } catch (error) {
            Alert.alert('Error', 'Failed to skip session');
          }
        }
      }
    ]
  );
};

const handleUndoStatus = async (session) => {
  try {
    await SessionManager.updateSessionStatus(
      session.id,
      SessionStatus.SCHEDULED
    );
    
    await loadSessionStatuses();
    
    setSnackbarMessage('Session status reset');
    setSnackbarVisible(true);
  } catch (error) {
    Alert.alert('Error', 'Failed to reset status');
  }
};

  const getSessionTypeConfig = (type) => {
    return sessionTypes.find(t => t.id === type) || sessionTypes[0];
  };

  // Add these helper functions after handleEditSession
    const isToday = (dateString) => {
      const today = new Date();
      const sessionDate = new Date(dateString);
      return today.toDateString() === sessionDate.toDateString();
    };

    const isTomorrow = (dateString) => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const sessionDate = new Date(dateString);
      return tomorrow.toDateString() === sessionDate.toDateString();
    };

    const isThisWeek = (dateString) => {
      const today = new Date();
      const sessionDate = new Date(dateString);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek && !isToday(dateString) && !isTomorrow(dateString);
    };

    const isThisMonth = (dateString) => {
      const today = new Date();
      const sessionDate = new Date(dateString);
      return sessionDate.getMonth() === today.getMonth() && 
            sessionDate.getFullYear() === today.getFullYear() &&
            !isToday(dateString) && !isTomorrow(dateString) && !isThisWeek(dateString);
    };

    const groupSessionsByTimePeriod = (sessions) => {
      const grouped = {
        today: [],
        tomorrow: [],
        thisWeek: [],
        thisMonth: [],
        allSessions: []
      };
      
      sessions.forEach(session => {
        if (isToday(session.date)) {
          grouped.today.push(session);
        } else if (isTomorrow(session.date)) {
          grouped.tomorrow.push(session);
        } else if (isThisWeek(session.date)) {
          grouped.thisWeek.push(session);
        } else if (isThisMonth(session.date)) {
          grouped.thisMonth.push(session);
        }
        grouped.allSessions.push(session);
      });
      
      return grouped;
    };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': COLORS?.success || COLORS_FALLBACK.success,
      'Intermediate': '#FF9800',
      'Advanced': COLORS?.error || COLORS_FALLBACK.error,
      'beginner': COLORS?.success || COLORS_FALLBACK.success,
      'intermediate': '#FF9800',
      'advanced': COLORS?.error || COLORS_FALLBACK.error,
    };
    return colors[difficulty] || (COLORS?.textSecondary || COLORS_FALLBACK.textSecondary);
  };

  const formatSessionDate = (date) => {
    const sessionDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (sessionDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return sessionDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  const getWeekLabel = (session) => {
    if (session.weekNumber) {
      return `Week ${session.weekNumber}`;
    }
    return 'Training';
  };
  
    // Filter and group sessions
    const { groupedByTime, filteredAndGrouped } = React.useMemo(() => {
      let filtered = allSessions.filter(session => {
        const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (session.location && session.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (session.academyName && session.academyName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = selectedFilters.length === 0 || 
                            selectedFilters.some(filter => 
                              session.type?.toLowerCase().includes(filter.toLowerCase()) ||
                              session.sport?.toLowerCase().includes(filter.toLowerCase()) ||
                              session.difficulty?.toLowerCase().includes(filter.toLowerCase())
                            );

        return matchesSearch && matchesFilter;
      });

      const grouped = groupSessionsByTimePeriod(filtered);
      
      // Apply time period filter
      let finalFiltered = filtered;
      if (selectedTimePeriod !== 'all') {
        finalFiltered = grouped[selectedTimePeriod];
      }
      
      return {
        groupedByTime: grouped,
        filteredAndGrouped: finalFiltered
      };
    }, [allSessions, searchQuery, selectedFilters, selectedTimePeriod]);

  const styles = {
    container: {
      flex: 1,
      backgroundColor: COLORS?.background || COLORS_FALLBACK.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS?.background || COLORS_FALLBACK.background,
    },
    content: {
      flex: 1,
      padding: SPACING?.md || 16,
    },
    statCard: {
      flex: 1,
      padding: SPACING?.sm || 8,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)',
      marginHorizontal: 4,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS?.primary || COLORS_FALLBACK.primary,
    },
    statLabel: {
      fontSize: 12,
      color: COLORS?.textSecondary || COLORS_FALLBACK.textSecondary,
      marginTop: 2,
    },
    dateSection: {
      marginBottom: SPACING?.lg || 24,
    },
    dateHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS?.textPrimary || COLORS_FALLBACK.textPrimary,
      marginBottom: SPACING?.md || 16,
      paddingHorizontal: SPACING?.xs || 4,
    },
    sessionCard: {
      marginBottom: SPACING?.md || 16,
      borderRadius: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    cardHeader: {
      padding: SPACING?.md || 16,
    },
    sessionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    sessionInfo: {
      flex: 1,
    },
    participantsSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: SPACING?.sm || 8,
    },
    cardContent: {
      paddingTop: SPACING?.sm || 8,
      paddingBottom: SPACING?.md || 16,
    },
    cardActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginTop: SPACING?.md || 16,
      paddingTop: SPACING?.sm || 8,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING?.xl || 32,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS?.primary || COLORS_FALLBACK.primary,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING?.lg || 24,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '100%',
      maxWidth: 400,
      maxHeight: '90%',
      borderRadius: 16,
      padding: SPACING?.lg || 24,
      backgroundColor: COLORS?.surface || COLORS_FALLBACK.surface,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING?.lg || 24,
      paddingBottom: SPACING?.md || 16,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    textInput: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: SPACING?.md || 16,
      marginBottom: SPACING?.md || 16,
      fontSize: 16,
      backgroundColor: COLORS?.surface || COLORS_FALLBACK.surface,
      color: COLORS?.textPrimary || COLORS_FALLBACK.textPrimary,
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS?.textPrimary || COLORS_FALLBACK.textPrimary,
      marginBottom: SPACING?.sm || 8,
      marginTop: SPACING?.sm || 8,
    },
    typeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: SPACING?.md || 16,
    },
    typeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: SPACING?.md || 16,
      paddingVertical: SPACING?.sm || 8,
      borderRadius: 20,
      margin: 4,
      minWidth: 80,
    },
    typeText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '500',
    },
    timeSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING?.lg || 24,
    },
    createButton: {
      marginTop: SPACING?.lg || 24,
      borderRadius: 8,
      backgroundColor: COLORS?.primary || COLORS_FALLBACK.primary,
    },
    daySessionContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  individualSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  weekSummary: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 2,
  },
  };

const renderHeader = () => (
  <View>
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{
        paddingTop: StatusBar.currentHeight + 20,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.lg,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md }}>
        <View>
          <Text style={[TEXT_STYLES.header, { color: 'white', fontSize: 28 }]}>
            Training Sessions
          </Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)', marginTop: 4 }]}>
            {allSessions.length} sessions scheduled
          </Text>
        </View>
        <Avatar.Text
          size={50}
          label={user?.name?.charAt(0) || 'C'}
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          labelStyle={{ color: 'white' }}
        />
      </View>

      {/* Quick Stats */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{extractedSessions.length}</Text>
          <Text style={styles.statLabel}>From Plans</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{manualSessions.length}</Text>
          <Text style={styles.statLabel}>Manual</Text>
        </Surface>
        <Surface style={styles.statCard}>
          <Text style={styles.statNumber}>{trainingPlans.length}</Text>
          <Text style={styles.statLabel}>Plans</Text>
        </Surface>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search sessions, academies, sports..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          elevation: 0,
          borderRadius: 12,
        }}
        iconColor={COLORS?.primary || COLORS_FALLBACK.primary}
        inputStyle={{ color: COLORS?.text || COLORS_FALLBACK.text }}
      />

      {/* Quick Time Period Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: SPACING.md }}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        <Chip
          mode={selectedTimePeriod === 'all' ? 'flat' : 'outlined'}
          selected={selectedTimePeriod === 'all'}
          onPress={() => setSelectedTimePeriod('all')}
          style={[
            { marginRight: SPACING.xs, backgroundColor: selectedTimePeriod === 'all' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }
          ]}
          textStyle={{ color: 'white', fontSize: 12 }}
        >
          All ({groupedByTime.allSessions.length})
        </Chip>
        <Chip
          mode={selectedTimePeriod === 'today' ? 'flat' : 'outlined'}
          selected={selectedTimePeriod === 'today'}
          onPress={() => setSelectedTimePeriod('today')}
          style={[
            { marginRight: SPACING.xs, backgroundColor: selectedTimePeriod === 'today' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }
          ]}
          textStyle={{ color: 'white', fontSize: 12 }}
        >
          Today ({groupedByTime.today.length})
        </Chip>
        <Chip
          mode={selectedTimePeriod === 'tomorrow' ? 'flat' : 'outlined'}
          selected={selectedTimePeriod === 'tomorrow'}
          onPress={() => setSelectedTimePeriod('tomorrow')}
          style={[
            { marginRight: SPACING.xs, backgroundColor: selectedTimePeriod === 'tomorrow' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }
          ]}
          textStyle={{ color: 'white', fontSize: 12 }}
        >
          Tomorrow ({groupedByTime.tomorrow.length})
        </Chip>
        <Chip
          mode={selectedTimePeriod === 'thisWeek' ? 'flat' : 'outlined'}
          selected={selectedTimePeriod === 'thisWeek'}
          onPress={() => setSelectedTimePeriod('thisWeek')}
          style={[
            { marginRight: SPACING.xs, backgroundColor: selectedTimePeriod === 'thisWeek' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }
          ]}
          textStyle={{ color: 'white', fontSize: 12 }}
        >
          This Week ({groupedByTime.thisWeek.length})
        </Chip>
        <Chip
          mode={selectedTimePeriod === 'thisMonth' ? 'flat' : 'outlined'}
          selected={selectedTimePeriod === 'thisMonth'}
          onPress={() => setSelectedTimePeriod('thisMonth')}
          style={[
            { marginRight: SPACING.xs, backgroundColor: selectedTimePeriod === 'thisMonth' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)' }
          ]}
          textStyle={{ color: 'white', fontSize: 12 }}
        >
          This Month ({groupedByTime.thisMonth.length})
        </Chip>
      </ScrollView>
    </LinearGradient>
  </View>
);

const renderWeekSummary = (weekNumber) => {
  const weekSessions = filteredAndGrouped.filter(s => s.weekNumber === weekNumber);
  if (weekSessions.length === 0) return null;
  
  const completed = weekSessions.filter(s => 
    sessionStatuses[s.id]?.status === SessionStatus.COMPLETED
  ).length;
  
  const nextSession = weekSessions.find(s => {
    const state = SessionManager.getSessionState(s, sessionStatuses);
    return state.state === 'today' || state.state === 'upcoming';
  });
  
  const percentage = Math.round((completed / weekSessions.length) * 100);
  const visualBar = SessionManager.createProgressBar(percentage);
  
  return (
    <Surface style={styles.weekSummary}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={TEXT_STYLES.h3}>Week {weekNumber}</Text>
        <Text style={TEXT_STYLES.body2}>
          {completed}/{weekSessions.length} {visualBar} {percentage}%
        </Text>
      </View>
      {nextSession && (
        <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
          Next: {nextSession.day} {nextSession.time}
        </Text>
      )}
    </Surface>
  );
};

const renderSessionCard = ({ item: session, index }) => {
  const typeConfig = getSessionTypeConfig(session.type || 'training');
  const isFromPlan = !session.isManual;
  const sessionState = SessionManager.getSessionState(session, sessionStatuses);
  
  // Get time info
  const sessionTime = session.time || '08:00';
  const endTime = (() => {
    const [hours, mins] = sessionTime.split(':').map(Number);
    const durationHours = Math.floor(session.duration / 60);
    const durationMins = session.duration % 60;
    const endHour = hours + durationHours;
    const endMin = mins + durationMins;
    return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
  })();
  
  const weekData = session.weekData || {};
  const dailySessions = weekData.dailySessions || [];
  
  const CardWrapper = Platform.OS === 'web' ? View : Animated.View;
  const cardProps = Platform.OS === 'web' ? {} : { entering: FadeInRight.delay(index * 50) };
  
  // Determine card style based on state
  const getCardStyle = () => {
    switch (sessionState.state) {
      case 'completed':
        return { borderLeftWidth: 4, borderLeftColor: COLORS.success };
      case 'missed':
        return { borderLeftWidth: 4, borderLeftColor: COLORS.error };
      case 'today':
        return { borderLeftWidth: 4, borderLeftColor: COLORS.primary };
      default:
        return {};
    }
  };
  
  return (
    <CardWrapper {...cardProps}>
      <TouchableOpacity
        onPress={() => handleSessionPress(session)}
        activeOpacity={0.7}
      >
        <Card style={[styles.sessionCard, getCardStyle()]}>
          {/* Header with gradient */}
          <LinearGradient
            colors={[typeConfig.color, `${typeConfig.color}90`]}
            style={styles.cardHeader}
          >
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>{sessionState.icon}</Text>
                  <Text style={[TEXT_STYLES.h4, { color: 'white', flex: 1 }]}>
                    {session.title}
                  </Text>
                  {isFromPlan && (
                    <Chip
                      compact
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      {getWeekLabel(session)}
                    </Chip>
                  )}
                </View>
                
                {/* State Label */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={[TEXT_STYLES.caption, { 
                    color: 'white', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }]}>
                    {sessionState.state === 'missed' && '⚠ MISSED'}
                    {sessionState.state === 'today' && '▶ TODAY\'S SESSION'}
                    {sessionState.state === 'completed' && '✓ COMPLETED'}
                    {sessionState.state === 'upcoming' && '⋯ UPCOMING'}
                  </Text>
                </View>
                
                {/* Time Info */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Icon name="access-time" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginLeft: 4 }]}>
                    {formatSessionDate(session.date)}, {sessionTime}-{endTime} ({session.duration}min)
                  </Text>
                </View>

                {/* Session Focus Preview */}
                {session.focus && session.focus.length > 0 && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.7)' }]}>
                      Focus: {session.focus[0]}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>

          <Card.Content style={styles.cardContent}>
            {/* Action Buttons Based on State */}
            <View style={styles.cardActions}>
              {sessionState.state === 'missed' && (
                <>
                  <Button
                    mode="contained"
                    compact
                    onPress={() => handleSessionAction(session, 'recover')}
                    style={{ backgroundColor: COLORS.warning, marginRight: SPACING.sm }}
                    contentStyle={{ height: 32 }}
                  >
                    Do Now
                  </Button>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => handleSkipSession(session)}
                    contentStyle={{ height: 32 }}
                  >
                    Skip Permanently
                  </Button>
                </>
              )}
              
              {sessionState.state === 'today' && (
                <Button
                  mode="contained"
                  compact
                  onPress={() => handleSessionAction(session, 'start')}
                  style={{ backgroundColor: COLORS.success }}
                  contentStyle={{ height: 32 }}
                  icon="play-arrow"
                >
                  Start Session
                </Button>
              )}
              
              {sessionState.state === 'upcoming' && (
                <Button
                  mode="outlined"
                  compact
                  onPress={() => handleSessionAction(session, 'early')}
                  contentStyle={{ height: 32 }}
                >
                  Do Early
                </Button>
              )}
              
              {sessionState.state === 'completed' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="check-circle" size={20} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.body2, { marginLeft: 8, color: COLORS.success }]}>
                    Completed
                  </Text>
                  <Button
                    mode="text"
                    compact
                    onPress={() => handleUndoStatus(session)}
                    contentStyle={{ height: 32 }}
                    style={{ marginLeft: 'auto' }}
                  >
                    Undo
                  </Button>
                </View>
              )}
              
              <Button
                mode="text"
                compact
                onPress={() => handleSessionPress(session)}
                contentStyle={{ height: 32 }}
                style={{ marginLeft: sessionState.state === 'completed' ? 0 : 'auto' }}
              >
                View Details
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </CardWrapper>
  );
};

  const renderDateSections = () => {
  const sessionsToDisplay = filteredAndGrouped;
  
  const grouped = sessionsToDisplay.reduce((groups, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});
  
  const sections = Object.entries(grouped).map(([date, sessions]) => ({
    date,
    sessions,
    data: sessions
  }));

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.date}
      ListHeaderComponent={() => (
        <>
          {completionStats && <SessionProgressCard stats={completionStats} />}
          
          {/* Missed Sessions Alert */}
          {Object.keys(missedByWeek).length > 0 && (
            <Card style={{ margin: SPACING.md, backgroundColor: COLORS.error + '10' }}>
              <Card.Content>
                <Text style={[TEXT_STYLES.subtitle1, { color: COLORS.error, fontWeight: 'bold' }]}>
                  ⚠ Missed Sessions
                </Text>
                {Object.entries(missedByWeek).map(([weekNum, sessions]) => (
                  <View key={weekNum} style={{ marginTop: SPACING.sm }}>
                    <Text style={TEXT_STYLES.body2}>
                      Week {weekNum}: {sessions.length} missed
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: SPACING.xs }}>
                      <Button mode="contained-tonal" compact onPress={() => {/* TODO */}}>
                        Review
                      </Button>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        </>
      )}
      renderItem={({ item }) => (
        <View style={styles.dateSection}>
          <Text style={styles.dateHeader}>
            {formatSessionDate(item.date)} ({item.sessions.length})
          </Text>
          <FlatList
            data={item.sessions}
            keyExtractor={(session) => session.id}
            renderItem={renderSessionCard}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS?.primary || COLORS_FALLBACK.primary]}
          tintColor={COLORS?.primary || COLORS_FALLBACK.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    />
  );
};

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-available" size={80} color={COLORS?.textSecondary || COLORS_FALLBACK.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { color: COLORS?.textSecondary || COLORS_FALLBACK.textSecondary, marginTop: 16 }]}>
        No sessions scheduled
      </Text>
      <Text style={[TEXT_STYLES.body, { 
        color: COLORS?.textSecondary || COLORS_FALLBACK.textSecondary, 
        textAlign: 'center', 
        marginTop: 8,
        marginHorizontal: 32 
      }]}>
        Upload training documents to automatically generate sessions or create manual sessions
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('DocumentLibrary')}
        style={{ marginTop: 16 }}
        icon="upload"
      >
        Upload Training Document
      </Button>
    </View>
  );

  const renderCreateSessionModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onRequestClose={() => setShowCreateModal(false)}
        animationType="slide"
      >
        <BlurView intensity={95} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <Surface style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[TEXT_STYLES.h3]}>Create Session</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowCreateModal(false)}
                />
              </View>
              
              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Session Title"
                  value={newSession.title}
                  onChangeText={(text) => setNewSession(prev => ({ ...prev, title: text }))}
                />
                
                <TextInput
                  style={[styles.textInput, { minHeight: 80 }]}
                  placeholder="Description (optional)"
                  multiline
                  value={newSession.description}
                  onChangeText={(text) => setNewSession(prev => ({ ...prev, description: text }))}
                />
                
                <Text style={styles.sectionLabel}>Session Type</Text>
                <View style={styles.typeSelector}>
                  {sessionTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => setNewSession(prev => ({ ...prev, type: type.id }))}
                      style={[
                        styles.typeOption,
                        {
                          backgroundColor: newSession.type === type.id ? type.color : `${type.color}20`,
                        }
                      ]}
                    >
                      <Icon
                        name={type.icon}
                        size={16}
                        color={newSession.type === type.id ? 'white' : type.color}
                      />
                      <Text style={[
                        styles.typeText,
                        { color: newSession.type === type.id ? 'white' : type.color }
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <TextInput
                  style={styles.textInput}
                  placeholder="Location"
                  value={newSession.location}
                  onChangeText={(text) => setNewSession(prev => ({ ...prev, location: text }))}
                />
                
                <View style={styles.timeSection}>
                  <Button
                    mode="outlined"
                    style={{ flex: 0.48 }}
                    onPress={() => Alert.alert('Feature Coming Soon', 'Date picker will be implemented')}
                  >
                    Date
                  </Button>
                  <Button
                    mode="outlined"
                    style={{ flex: 0.48 }}
                    onPress={() => Alert.alert('Feature Coming Soon', 'Time picker will be implemented')}
                  >
                    Time
                  </Button>
                </View>
                
                <Button
                  mode="contained"
                  onPress={handleCreateSession}
                  style={styles.createButton}
                  contentStyle={{ paddingVertical: SPACING.sm }}
                >
                  Create Session
                </Button>
              </ScrollView>
            </Surface>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS?.primary || COLORS_FALLBACK.primary} />
        <Text style={{ marginTop: 16 }}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {filteredAndGrouped.length === 0 ? renderEmptyState() : renderDateSections()}
      </Animated.View>

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        label="New Session"
      />

      {renderCreateSessionModal()}

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: COLORS?.success || COLORS_FALLBACK.success }}
        >
          <Text style={{ color: 'white' }}>{snackbarMessage}</Text>
        </Snackbar>
      </Portal>
      {/* Confirmation Dialog */}
      <Portal>
        <Modal
          visible={showConfirmDialog !== null}
          onDismiss={() => setShowConfirmDialog(null)}
          contentContainerStyle={{
            backgroundColor: 'white',
            padding: SPACING.lg,
            margin: SPACING.lg,
            borderRadius: 12,
          }}
        >
          {showConfirmDialog && (
            <>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                {showConfirmDialog.message}
              </Text>
              {showConfirmDialog.options.map((option, index) => (
                <Button
                  key={index}
                  mode={option.style === 'destructive' ? 'outlined' : 'contained'}
                  onPress={option.onPress}
                  style={{ marginBottom: SPACING.sm }}
                  buttonColor={option.style === 'destructive' ? COLORS.error : COLORS.primary}
                >
                  {option.text}
                </Button>
              ))}
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

export default SessionScheduler;
