//src/screens/coach/training/SessionScheduler.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Services
import SessionExtractor from '../../../services/SessionExtractor';
import DocumentProcessor from '../../../services/DocumentProcessor';
import SessionScheduleScreen from './src/screens/coach/training/SessionScheduleScreen';
// Design system
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const SessionScheduler = ({ navigation }) => {
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
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState([]);

  // Session data
  const [extractedSessions, setExtractedSessions] = useState([]);
  const [manualSessions, setManualSessions] = useState([]);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [allSessions, setAllSessions] = useState([]);

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

  const scrollY = useSharedValue(0);
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

  const initializeSessionData = async () => {
    try {
      setLoading(true);
      console.log('Initializing session data...');

      // Load training plans
      const plans = await DocumentProcessor.getTrainingPlans();
      setTrainingPlans(plans);
      console.log('Loaded training plans:', plans.length);

      // Extract sessions from all training plans with extracted sessions
      const allExtractedSessions = [];
      
      for (const plan of plans) {
        try {
          console.log('Processing plan:', plan.title);
          
          // Check if plan has a source document and can extract sessions
          if (plan.sourceDocument) {
            const documents = await DocumentProcessor.getStoredDocuments();
            const sourceDoc = documents.find(doc => doc.id === plan.sourceDocument);
            
            if (sourceDoc) {
              console.log('Found source document for plan:', plan.title);
              
              // Extract sessions from the document
              const extractionResult = await SessionExtractor.extractSessionsFromDocument(sourceDoc, plan);
              
              if (extractionResult && extractionResult.sessions) {
                // Convert weekly sessions to individual daily sessions
                extractionResult.sessions.forEach((weekSession, weekIndex) => {
                  // Add the week session itself
                  const weekSessionData = {
                    id: `week_${weekSession.id}`,
                    title: `${plan.title} - ${weekSession.title}`,
                    day: 'week_overview',
                    date: calculateSessionDate(weekIndex + 1, 'monday'),
                    time: '08:00',
                    duration: weekSession.totalDuration || 120,
                    location: 'Training Facility',
                    type: 'Weekly Plan',
                    participants: 15,
                    status: 'scheduled',
                    academyName: plan.title,
                    sport: plan.category || 'General',
                    ageGroup: extractionResult.academyInfo?.ageGroup || 'Youth',
                    difficulty: plan.difficulty || 'intermediate',
                    weekNumber: weekSession.weekNumber,
                    weekData: weekSession,
                    planTitle: plan.title,
                    sourcePlan: plan.id,
                    sourceDocument: sourceDoc.id,
                    isWeekOverview: true,
                    focus: weekSession.focus || [],
                    notes: weekSession.description || '',
                    activities: [],
                    drills: [],
                    objectives: []
                  };
                  
                  allExtractedSessions.push(weekSessionData);

                  // Add individual daily sessions
                  if (weekSession.dailySessions && weekSession.dailySessions.length > 0) {
                    weekSession.dailySessions.forEach((dailySession, dayIndex) => {
                      const enhancedDailySession = {
                        ...dailySession,
                        id: `daily_${dailySession.id}`,
                        title: `${plan.title} - Week ${weekSession.weekNumber}, ${dailySession.day.charAt(0).toUpperCase() + dailySession.day.slice(1)} Training`,
                        academyName: plan.title,
                        sport: plan.category || 'General',
                        planTitle: plan.title,
                        sourcePlan: plan.id,
                        sourceDocument: sourceDoc.id,
                        weekData: weekSession,
                        parentWeekSession: weekSessionData.id,
                        isWeekOverview: false
                      };
                      
                      allExtractedSessions.push(enhancedDailySession);
                    });
                  }
                });
                
                console.log('Extracted sessions for plan:', plan.title, 'Total sessions:', allExtractedSessions.length);
              }
            } else {
              console.warn('Source document not found for plan:', plan.title);
            }
          } else {
            console.warn('No source document reference for plan:', plan.title);
          }
        } catch (error) {
          console.error('Error processing plan:', plan.title, error.message);
        }
      }

      setExtractedSessions(allExtractedSessions);
      console.log('Total extracted sessions:', allExtractedSessions.length);

      // Combine with manual sessions
      const combinedSessions = [
        ...allExtractedSessions,
        ...manualSessions
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      setAllSessions(combinedSessions);

      // In initializeSessionData()
      const recommendations = await AIService.getSessionRecommendations(
        allExtractedSessions,
        userProfile
      );
      setAiRecommendations(recommendations);

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
    // Ensure we have all required data for SessionScheduleScreen
    const sessionDataForNavigation = {
      ...session,
      // Ensure we have all required fields
      id: session.id,
      title: session.title,
      academyName: session.academyName || 'Training Academy',
      sport: session.sport || 'General',
      weekNumber: session.weekNumber,
      weekData: session.weekData || session,
      planTitle: session.planTitle || 'Training Session',
      sourcePlan: session.sourcePlan,
      sourceDocument: session.sourceDocument
    };

    navigation.navigate('SessionScheduleScreen', {
      sessionData: sessionDataForNavigation,
      planTitle: session.planTitle || 'Training Session',
      academyName: session.academyName || 'Training Academy'
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

  const getSessionTypeConfig = (type) => {
    return sessionTypes.find(t => t.id === type) || sessionTypes[0];
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

  // Filter sessions based on search and filters
  const filteredSessions = allSessions.filter(session => {
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

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

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
  };

  const renderHeader = () => (
    <Animated.View entering={FadeInDown.delay(100)}>
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
      </LinearGradient>
    </Animated.View>
  );

  const renderSessionCard = ({ item: session, index }) => {
    const typeConfig = getSessionTypeConfig(session.type || 'training');
    const isFromPlan = !session.isManual;
    
    return (
      <Animated.View entering={FadeInRight.delay(index * 50)}>
        <TouchableOpacity
          onPress={() => handleSessionPress(session)}
          activeOpacity={0.7}
        >
          <Card style={styles.sessionCard}>
            {/* Header with gradient */}
            <LinearGradient
              colors={[typeConfig.color, `${typeConfig.color}90`]}
              style={styles.cardHeader}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
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
                  
                  {/* Academy and Sport Info */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="school" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginLeft: 4 }]}>
                      {session.academyName}
                    </Text>
                    {session.sport && (
                      <>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', marginHorizontal: 8 }}>•</Text>
                        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                          {session.sport}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Time and Location */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Icon name="access-time" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginLeft: 4 }]}>
                      {session.time} • {session.duration}min
                    </Text>
                    {session.location && (
                      <>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', marginHorizontal: 8 }}>•</Text>
                        <Icon name="location-on" size={14} color="rgba(255,255,255,0.8)" />
                        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginLeft: 2 }]}>
                          {session.location}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* Age Group and Difficulty */}
                  {(session.ageGroup || session.difficulty) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      {session.ageGroup && (
                        <Chip
                          compact
                          style={{ backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 8 }}
                          textStyle={{ color: 'white', fontSize: 10 }}
                        >
                          {session.ageGroup}
                        </Chip>
                      )}
                      {session.difficulty && (
                        <Chip
                          compact
                          style={{ backgroundColor: getDifficultyColor(session.difficulty) + '40' }}
                          textStyle={{ color: 'white', fontSize: 10 }}
                        >
                          {session.difficulty}
                        </Chip>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </LinearGradient>

            {/* Body */}
            <Card.Content style={styles.cardContent}>
              {/* Participants */}
              <View style={styles.participantsSection}>
                <Icon name="group" size={16} color={COLORS?.textSecondary || COLORS_FALLBACK.textSecondary} />
                <Text style={[TEXT_STYLES.caption, { marginLeft: 4, color: COLORS?.textSecondary || COLORS_FALLBACK.textSecondary }]}>
                  {session.participants || 0} participants
                </Text>
                {session.status && (
                  <>
                    <Text style={{ color: COLORS?.textSecondary || COLORS_FALLBACK.textSecondary, marginHorizontal: 8 }}>•</Text>
                    <Chip
                      compact
                      mode="outlined"
                      style={{ height: 20 }}
                      textStyle={{ fontSize: 10 }}
                    >
                      {session.status.replace('_', ' ').toUpperCase()}
                    </Chip>
                  </>
                )}
              </View>

              {/* Focus Areas */}
              {session.focus && session.focus.length > 0 && (
                <View style={{ marginTop: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS?.textSecondary || COLORS_FALLBACK.textSecondary, marginBottom: 4 }]}>
                    Focus Areas:
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {session.focus.slice(0, 3).map((focus, idx) => (
                      <Chip
                        key={idx}
                        compact
                        mode="outlined"
                        style={{ marginRight: 4, marginBottom: 4, height: 24 }}
                        textStyle={{ fontSize: 10 }}
                      >
                        {focus}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.cardActions}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => handleEditSession(session)}
                  style={{ marginRight: SPACING.sm }}
                  contentStyle={{ height: 32 }}
                >
                  {isFromPlan ? 'View Plan' : 'Edit'}
                </Button>
                <Button
                  mode="contained"
                  compact
                  onPress={() => handleStartSession(session)}
                  style={{ backgroundColor: COLORS?.success || COLORS_FALLBACK.success }}
                  contentStyle={{ height: 32 }}
                >
                  Start Session
                </Button>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderDateSections = () => {
    const sections = Object.entries(groupedSessions).map(([date, sessions]) => ({
      date,
      sessions,
      data: sessions
    }));

    return (
      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
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
        {filteredSessions.length === 0 ? renderEmptyState() : renderDateSections()}
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
    </View>
  );
};

export default SessionScheduler;
