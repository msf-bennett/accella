//src/screens/coach/training/SessionScheduleScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Share,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  IconButton,
  FAB,
  Surface,
  Text,
  Portal,
  Snackbar,
  ProgressBar,
  Avatar,
} from 'react-native-paper';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Design system imports
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TEXT_STYLES } from '../../styles/textStyles';
import AIService from '../../../services/AIService';

const { width: screenWidth } = Dimensions.get('window');

// Helper functions
const parseContentSections = (rawContent) => {
  if (!rawContent) return [];
  
  const sections = [];
  const lines = rawContent.split('\n');
  let currentSection = { header: '', content: '' };
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Detect section headers - these patterns match your swimming document
    if (trimmed.length > 0 && (
      // All caps headers
      trimmed === trimmed.toUpperCase() && trimmed.length < 50 ||
      // Common session section patterns
      /^(Warm[- ]?up|Technical Drill|Main [Ss]et|Kick [Ss]et|Conditioning Game|Special Drill|Gameplay|Cool[- ]?down|IM [Ss]et|Starts?\/Turns?)\s*(\(.*\))?$/i.test(trimmed) ||
      // Numbered sections
      /^\d+\.\s+[A-Z]/i.test(trimmed) ||
      // Activity with colon
      /^[A-Z][^:]{3,30}:\s*/i.test(trimmed)
    )) {
      if (currentSection.content) {
        sections.push({ ...currentSection });
      }
      currentSection = { header: trimmed, content: '' };
    } else if (trimmed) {
      currentSection.content += (currentSection.content ? '\n' : '') + trimmed;
    }
  });
  
  if (currentSection.content) {
    sections.push(currentSection);
  }
  
  return sections;
};

const formatSessionContent = (rawContent, spacing, textStyles) => {
  if (!rawContent) return <Text>No content available</Text>;
  
  const sections = parseContentSections(rawContent);
  
  return sections.map((section, index) => (
    <View key={index} style={{ marginBottom: spacing.md }}>
      {section.header && (
        <Text style={[textStyles.subtitle1, { fontWeight: 'bold', marginBottom: spacing.xs }]}>
          {section.header}
        </Text>
      )}
      <Text style={[textStyles.body2, { lineHeight: 20 }]}>
        {section.content}
      </Text>
    </View>
  ));
};

const SessionScheduleScreen = ({ navigation, route }) => {
  // Define fallback constants at the top
  const COLORS_FALLBACK = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    background: '#f5f7fa',
    surface: '#ffffff',
    textPrimary: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
  };

  const SPACING_FALLBACK = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const TEXT_STYLES_FALLBACK = {
    h1: { fontSize: 28, fontWeight: 'bold' },
    h2: { fontSize: 22, fontWeight: '600' },
    h3: { fontSize: 18, fontWeight: '600' },
    body1: { fontSize: 16, fontWeight: '400' },
    body2: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' },
    subtitle1: { fontSize: 16, fontWeight: '500' },
  };

  // Use imported values or fallbacks
  const colors = COLORS || COLORS_FALLBACK;
  const spacing = SPACING || SPACING_FALLBACK;
  const textStyles = TEXT_STYLES || TEXT_STYLES_FALLBACK;

  // Add parameter validation and defaults
  const params = route?.params || {};
  const sessionData = params.sessionData || null;
  const planTitle = params.planTitle || 'Training Session';
  const academyName = params.academyName || 'Training Academy';

  // Define styles inside component to access colors safely
  const styles = {
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: StatusBar.currentHeight + spacing.md,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    headerInfo: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    headerActions: {
      flexDirection: 'row',
    },
    progressContainer: {
      paddingHorizontal: spacing.lg,
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    tabContainer: {
      elevation: 2,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginHorizontal: spacing.xs,
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    tabText: {
      marginLeft: spacing.xs,
      fontSize: 12,
      fontWeight: '500',
    },
    content: {
      flex: 1,
    },
    sessionInfoCard: {
      margin: spacing.md,
      padding: spacing.lg,
      borderRadius: 12,
      elevation: 2,
    },
    sessionInfoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sessionInfoDetails: {
      flex: 1,
      marginLeft: spacing.md,
    },
    sessionMetrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: spacing.md,
      marginTop: spacing.xs,
    },
    sessionChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    chip: {
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    tabContent: {
      padding: spacing.md,
      paddingTop: 0,
    },
    sectionCard: {
      marginBottom: spacing.md,
      borderRadius: 12,
      elevation: 2,
    },
    overviewStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginTop: spacing.xs,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: spacing.xs / 2,
    },
    objectiveItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    scheduleDay: {
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    dayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    drillItem: {
      marginBottom: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.surface,
    },
    drillHeader: {
      paddingVertical: spacing.xs,
    },
    drillInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressCircle: {
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    progressBarLarge: {
      width: '100%',
      height: 8,
      borderRadius: 4,
      marginVertical: spacing.md,
    },
    progressStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.md,
    },
    progressStat: {
      alignItems: 'center',
    },
    progressStatNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    progressStatLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
    completedDrill: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    notesInput: {
      padding: spacing.md,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fab: {
      position: 'absolute',
      margin: spacing.md,
      right: 0,
      bottom: 0,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: colors.background,
    },
    enhancementToggleCard: {
      borderRadius: 12,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      backgroundColor: colors.surface,
      borderLeftWidth: 4,
      borderLeftColor: '#9C27B0',
    },
    weekOverviewCard: {
      marginBottom: spacing.md,
      borderRadius: 12,
      elevation: 2,
    },
    dailySessionCard: {
      marginBottom: spacing.md,
      borderRadius: 12,
      elevation: 2,
    },
    weekStats: {
      marginTop: spacing.md,
    },
    expandableHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
  };

  // Early return if no session data
  if (!sessionData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color={colors.error} />
        <Text style={[textStyles.h3, { marginTop: spacing.md }]}>
          Session Not Found
        </Text>
        <Text style={[textStyles.body1, { textAlign: 'center', marginTop: spacing.sm }]}>
          Could not load session details. Please try again.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.md }}
        >
          Go Back
        </Button>
      </View>
    );
  }
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [session, setSession] = useState(sessionData);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [completedDrills, setCompletedDrills] = useState(new Set());
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showImproved, setShowImproved] = useState(false);
  const [improvedContent, setImprovedContent] = useState(null);
  const [improving, setImproving] = useState(false);
  const [aiEnhancementAvailable, setAiEnhancementAvailable] = useState(true);
  const [realtimeCoaching, setRealtimeCoaching] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'info' },
    { key: 'plan', label: 'Training Plan', icon: 'fitness-center' },
    { key: 'progress', label: 'Progress', icon: 'trending-up' },
    { key: 'notes', label: 'Notes', icon: 'note' }
  ];

  // Animation setup
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Load cached enhancement
  useEffect(() => {
    const loadCachedEnhancement = async () => {
      try {
        const cached = await AsyncStorage.getItem(`enhanced_session_${session.id}`);
        if (cached) {
          setImprovedContent(JSON.parse(cached));
        }
      } catch (error) {
        console.warn('Could not load cached enhancement:', error);
      }
    };
    
    loadCachedEnhancement();
  }, [session.id]);

  // Calculate progress based on completed drills
  useEffect(() => {
    if (session.drills && session.drills.length > 0) {
      const progress = (completedDrills.size / session.drills.length) * 100;
      setSessionProgress(progress);
    }
  }, [completedDrills, session.drills]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleStartSession = () => {
    if (sessionStarted) {
      Alert.alert(
        'End Session',
        'Are you sure you want to end this training session?',
        [
          { text: 'Continue Training', style: 'cancel' },
          { 
            text: 'End Session', 
            onPress: () => {
              setSessionStarted(false);
              setSnackbarMessage('Training session ended');
              setSnackbarVisible(true);
            }
          }
        ]
      );
    } else {
      setSessionStarted(true);
      setSnackbarMessage('Training session started! 🎯');
      setSnackbarVisible(true);
    }
  };

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleDrillComplete = (drillId) => {
    const newCompleted = new Set(completedDrills);
    if (newCompleted.has(drillId)) {
      newCompleted.delete(drillId);
    } else {
      newCompleted.add(drillId);
    }
    setCompletedDrills(newCompleted);
  };

  const handleShareSession = async () => {
    try {
      await Share.share({
        message: `Training Session: ${session.title}\n\nAcademy: ${academyName}\nPlan: ${planTitle}\n\nDuration: ${session.duration} minutes\nFocus: ${session.focus?.join(', ')}\n\nScheduled for: ${new Date(session.date).toLocaleDateString()} at ${session.time}`,
        title: session.title,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleImproveSession = async () => {
    setImproving(true);
    
    try {
      const userProfile = {};
      const enhanced = await AIService.improveSingleSession(session, userProfile);
      
      if (enhanced && enhanced.enhancedSession) {
        setImprovedContent(enhanced);
        setShowImproved(true);
        
        await AsyncStorage.setItem(
          `enhanced_session_${session.id}`,
          JSON.stringify(enhanced)
        );
        
        setSnackbarMessage('Session enhanced successfully! 🚀');
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
      setSnackbarMessage('Enhancement failed. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setImproving(false);
    }
  };

  const getRealtimeAdvice = async () => {
    const context = {
      currentDrill: null,
      playerCount: session.participants,
      timeElapsed: 0,
      issues: []
    };
    
    const advice = await AIService.getRealtimeCoachingTips(context);
    setRealtimeCoaching(advice);
  };

  const calculateWeekStats = (weekData) => {
    if (!weekData || !weekData.dailySessions) {
      return { totalDrills: 0, totalMinutes: 0, participants: 15 };
    }
    
    const stats = weekData.dailySessions.reduce((acc, daySession) => {
      const daySessions = daySession.sessionsForDay || [daySession];
      
      daySessions.forEach(s => {
        acc.totalDrills += (s.drills?.length || 0) + (s.activities?.length || 0);
        acc.totalMinutes += s.duration || 0;
      });
      
      return acc;
    }, { totalDrills: 0, totalMinutes: 0 });
    
    stats.participants = weekData.participants || session.participants || 15;
    return stats;
  };

  const calculateTotalDrills = (weekData) => {
    if (!weekData || !weekData.dailySessions) return 0;
    return weekData.dailySessions.reduce((total, day) => {
      return total + (day.drills?.length || 0);
    }, 0);
  };

  const weekStats = calculateWeekStats(session.weekData);

  const getDifficultyColor = (difficulty) => {
    const difficultyColors = {
      'Beginner': colors.success,
      'Intermediate': '#FF9800',
      'Advanced': colors.error,
      'beginner': colors.success,
      'intermediate': '#FF9800',
      'advanced': colors.error,
    };
    return difficultyColors[difficulty] || colors.textSecondary;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerInfo}>
          <Text style={[textStyles.h3, { color: 'white' }]}>
            {session.title}
          </Text>
          <Text style={[textStyles.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            {academyName} • {planTitle}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="share"
            iconColor="white"
            size={24}
            onPress={handleShareSession}
          />
          {aiEnhancementAvailable && (
            <IconButton
              icon="auto-awesome"
              iconColor={improvedContent ? "#FFD700" : "white"}
              size={24}
              onPress={handleImproveSession}
            />
          )}
        </View>
      </View>

      {sessionStarted && (
        <View style={styles.progressContainer}>
          <Text style={[textStyles.caption, { color: 'white', marginBottom: spacing.xs }]}>
            Session Progress: {Math.round(sessionProgress)}%
          </Text>
          <ProgressBar
            progress={sessionProgress / 100}
            color="white"
            style={styles.progressBar}
          />
        </View>
      )}
    </LinearGradient>
  );

    const renderSessionInfo = () => (
        <Surface style={styles.sessionInfoCard}>
          <View style={styles.sessionInfoHeader}>
            <Avatar.Text
              size={48}
              label={academyName.charAt(0)}
              style={{ backgroundColor: colors.primary }}
            />
            <View style={styles.sessionInfoDetails}>
              <Text style={[textStyles.h3, { marginBottom: spacing.xs }]}>
                {session.title}
              </Text>
              <View style={styles.sessionMetrics}>
                <View style={styles.metricItem}>
                  <Icon name="schedule" size={16} color={colors.textSecondary} />
                  <Text style={[textStyles.caption, { marginLeft: 4 }]}>
                    {session.time} • {session.duration}min
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Icon name="location-on" size={16} color={colors.textSecondary} />
                  <Text style={[textStyles.caption, { marginLeft: 4 }]}>
                    {session.location || 'Training Field'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sessionChips}>
            {session.difficulty && (
              <Chip
                style={[styles.chip, { backgroundColor: getDifficultyColor(session.difficulty) + '20' }]}
                textStyle={{ color: getDifficultyColor(session.difficulty) }}
              >
                {session.difficulty}
              </Chip>
            )}
            {session.participants && (
              <Chip style={styles.chip}>
                {session.participants} players
              </Chip>
            )}
            {session.focus && session.focus.map((focus, index) => (
              <Chip key={index} style={styles.chip} mode="outlined">
                {focus}
              </Chip>
            ))}
          </View>

          {/* ADD THE SHARED SESSION INDICATOR HERE */}
          {session.isSharedSession && session.sharedWith?.length > 0 && (
            <View style={{ 
              marginTop: spacing.sm, 
              padding: spacing.sm, 
              backgroundColor: colors.primary + '20',
              borderRadius: 8 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="repeat" size={16} color={colors.primary} />
                <Text style={[textStyles.caption, { 
                  marginLeft: 4, 
                  color: colors.primary,
                  fontWeight: '600' 
                }]}>
                  Shared Session
                </Text>
              </View>
              <Text style={[textStyles.caption, { 
                marginTop: 2,
                color: colors.textSecondary 
              }]}>
                Also used for: {session.sharedWith.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
              </Text>
            </View>
          )}

        </Surface>
      );

  const renderTabContent = () => {
    const activeSessionData = showImproved && improvedContent 
      ? {
          ...session,
          ...improvedContent.enhancedSession,
          weekNumber: session.weekNumber,
          weekData: session.weekData,
          sourcePlan: session.sourcePlan,
          sourceDocument: session.sourceDocument
        }
      : session;
      
    switch (activeTab) {
      case 'overview':
        return renderOverview(activeSessionData);
      case 'plan':
        return renderTrainingPlan(activeSessionData);
      case 'progress':
        return renderProgress(activeSessionData);
      case 'notes':
        return renderNotes(activeSessionData);
      default:
        return renderOverview(activeSessionData);
    }
  };

  const renderOverview = (contentData = session) => {
    const weekData = contentData.weekData || {};
    const dailySessions = weekData.dailySessions || [];
    
    const totalDrills = dailySessions.reduce((sum, daySession) => {
      if (daySession.sessionsForDay && Array.isArray(daySession.sessionsForDay)) {
        return sum + daySession.sessionsForDay.reduce((daySum, s) => {
          return daySum + (s.drills?.length || 0);
        }, 0);
      }
      return sum + (daySession.drills?.length || 0);
    }, 0);
    
    const totalMinutes = weekData.totalDuration || contentData.duration || 0;
    const participants = contentData.participants || weekData.participants || 'N/A';

    return (
      <View style={styles.tabContent}>
        {showImproved && improvedContent && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Icon name="auto-awesome" size={24} color="#FFD700" />
                <Text style={[textStyles.h3, { marginLeft: spacing.sm, color: "#FFD700" }]}>
                  AI Enhancement Applied
                </Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {improvedContent.improvements.map((improvement, index) => (
                  <Chip key={index} style={[styles.chip, { backgroundColor: colors.success + '20' }]} mode="outlined">
                    {improvement}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {session.isWeekOverview ? (
          <Card style={styles.weekOverviewCard}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <Icon name="calendar-view-week" size={24} color={colors.primary} />
                <Text style={[textStyles.h3, { marginLeft: spacing.sm }]}>
                  Week {session.weekNumber} Overview
                </Text>
              </View>
              
              <Text style={textStyles.body2}>
                This week contains {session.weekData?.dailySessions?.length || 0} training days
              </Text>
              
              <View style={styles.weekStats}>
                <View style={styles.statItem}>
                  <Icon name="fitness-center" size={24} color={colors.primary} />
                  <Text style={styles.statNumber}>{calculateTotalDrills(session.weekData)}</Text>
                  <Text style={styles.statLabel}>Total Drills</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="schedule" size={24} color={colors.primary} />
                  <Text style={styles.statNumber}>{session.weekData?.totalDuration || 0} min</Text>
                  <Text style={styles.statLabel}>Total Time</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.dailySessionCard}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <Icon name="today" size={20} color={colors.secondary} />
                <Text style={[textStyles.subtitle1, { marginLeft: spacing.xs }]}>
                  Daily Session - {session.day}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
              Week {contentData.weekNumber || session.week} Overview
            </Text>
            <Text style={[textStyles.body1, { lineHeight: 24, marginBottom: spacing.md }]}>
              {contentData.weekDescription || weekData.description || session.description || 'Training week focused on skill development'}
            </Text>
            
            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <Icon name="fitness-center" size={24} color={colors.primary} />
                <Text style={styles.statNumber}>{weekStats.totalDrills}</Text>
                <Text style={styles.statLabel}>Drills</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="schedule" size={24} color={colors.primary} />
                <Text style={styles.statNumber}>{weekStats.totalMinutes}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="group" size={24} color={colors.primary} />
                <Text style={styles.statNumber}>{weekStats.participants}</Text>
                <Text style={styles.statLabel}>Players</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {dailySessions.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
                Training Days
              </Text>
              <Text style={[textStyles.body2, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
                This week includes {dailySessions.length} training sessions
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {dailySessions.map((daySession, idx) => (
                  <Chip
                    key={idx}
                    compact
                    mode="flat"
                    style={[styles.chip, { backgroundColor: colors.primary + '20', marginBottom: 4 }]}
                    textStyle={{ color: colors.primary, fontSize: 11 }}
                  >
                    {daySession.day === 'week_overview' ? 'Overview' : 
                      `${daySession.day.charAt(0).toUpperCase() + daySession.day.slice(1)}`}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {session.objectives && session.objectives.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
                Session Objectives
              </Text>
              {session.objectives.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <Icon name="flag" size={16} color={colors.primary} />
                  <Text style={[textStyles.body2, { flex: 1, marginLeft: spacing.sm }]}>
                    {objective}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {session.weekSchedule && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
                Training Schedule
              </Text>
              {session.weekSchedule.map((day, index) => (
                <View key={index} style={styles.scheduleDay}>
                  <View style={styles.dayHeader}>
                    <Text style={[textStyles.subtitle1, { fontWeight: 'bold' }]}>
                      {day.day}
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {day.time} • {day.duration}
                    </Text>
                  </View>
                  <Text style={[textStyles.body2, { color: colors.textSecondary }]}>
                    {day.focus || 'Training Session'}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };

  const renderTrainingPlan = () => {
  const contentToDisplay = session.documentContent || session.rawContent || '';
  
  return (
    <View style={styles.tabContent}>
      {/* Show day-specific information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Icon name="today" size={24} color={colors.primary} />
            <Text style={[textStyles.h3, { marginLeft: spacing.sm }]}>
              {session.day === 'week_overview' ? 'Week Overview' : 
                `${session.day.charAt(0).toUpperCase() + session.day.slice(1)} Training`}
            </Text>
          </View>
          
          {session.time && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <Icon name="schedule" size={16} color={colors.textSecondary} />
              <Text style={[textStyles.body2, { marginLeft: spacing.xs, color: colors.textSecondary }]}>
                {session.time} • {session.duration} minutes
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Display the complete session content */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
            Session Details
          </Text>
          <ScrollView style={{ maxHeight: 600 }} nestedScrollEnabled>
            {contentToDisplay ? (
              formatSessionContent(contentToDisplay, spacing, textStyles)
            ) : (
              <Text style={textStyles.body2}>No detailed content available for this session.</Text>
            )}
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Show all sessions for this day */}
      {session.sessionsForDay && session.sessionsForDay.length > 1 && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
              Multiple Sessions Today
            </Text>
            <Text style={[textStyles.body2, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
              This day includes {session.sessionsForDay.length} training sessions
            </Text>
            {session.sessionsForDay.map((s, idx) => (
              <Chip
                key={idx}
                style={[styles.chip, { marginBottom: spacing.xs }]}
                mode="outlined"
              >
                Session {idx + 1}: {s.duration || 90} min
              </Chip>
            ))}
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

  const renderProgress = () => (
    <View style={styles.tabContent}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
            Session Progress
          </Text>
          
          <View style={styles.progressCircle}>
            <Text style={[textStyles.h1, { color: colors.primary }]}>
              {Math.round(sessionProgress)}%
            </Text>
            <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
              Complete
            </Text>
          </View>
          
          <ProgressBar
            progress={sessionProgress / 100}
            color={colors.primary}
            style={styles.progressBarLarge}
          />
          
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatNumber}>
                {completedDrills.size}
              </Text>
              <Text style={styles.progressStatLabel}>Drills Completed</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatNumber}>
                {(session.drills?.length || 0) - completedDrills.size}
              </Text>
              <Text style={styles.progressStatLabel}>Drills Remaining</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {completedDrills.size > 0 && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
              Completed Drills
            </Text>
            {Array.from(completedDrills).map((drillId, index) => {
              const drill = session.drills?.find((d, i) => d.id === drillId || i === drillId);
              return (
                <View key={index} style={styles.completedDrill}>
                  <Icon name="check-circle" size={20} color={colors.success} />
                  <Text style={[textStyles.body1, { marginLeft: spacing.sm }]}>
                    {drill?.name || drill?.title || `Drill ${drillId + 1}`}
                  </Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderNotes = () => (
    <View style={styles.tabContent}>
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
            Session Notes
          </Text>
          <Text style={[textStyles.body2, { color: colors.textSecondary, marginBottom: spacing.md }]}>
            Add your observations, player performance notes, and improvements for future sessions.
          </Text>
          
          <Surface style={styles.notesInput}>
            <Text style={[textStyles.body1, { minHeight: 100 }]}>
              {sessionNotes || 'Tap to add notes...'}
            </Text>
          </Surface>
          
          <Button
            mode="outlined"
            onPress={() => {
              setSnackbarMessage('Notes feature will be available in the next update');
              setSnackbarVisible(true);
            }}
            style={{ marginTop: spacing.md }}
          >
            Edit Notes
          </Button>
        </Card.Content>
      </Card>

      {session.coachNotes && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
              Coach Recommendations
            </Text>
            <Text style={[textStyles.body1, { lineHeight: 22 }]}>
              {session.coachNotes}
            </Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderEnhancementToggle = () => {
    if (!aiEnhancementAvailable) return null;
    
    return (
      <Surface style={[styles.enhancementToggleCard, { marginHorizontal: spacing.md, marginVertical: spacing.sm }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Icon 
              name="auto-awesome" 
              size={24} 
              color={showImproved ? "#FFD700" : colors.textSecondary} 
            />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={[textStyles.subtitle1, { fontWeight: 'bold' }]}>
                {showImproved ? 'AI Enhanced View' : 'Original Content'}
              </Text>
              <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                {improvedContent ? 'Toggle between versions' : 'Enhance with AI first'}
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[textStyles.caption, { marginRight: spacing.sm, fontWeight: '500' }]}>
              {showImproved ? 'Enhanced' : 'Original'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (improvedContent) {
                  setShowImproved(!showImproved);
                } else {
                  handleImproveSession();
                }
              }}
              activeOpacity={0.7}
              style={{
                width: 50,
                height: 30,
                borderRadius: 15,
                backgroundColor: showImproved && improvedContent ? "#FFD700" : colors.textSecondary,
                justifyContent: 'center',
                alignItems: showImproved ? 'flex-end' : 'flex-start',
                paddingHorizontal: 3,
                opacity: improvedContent ? 1 : 0.7
              }}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'white',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              }} />
            </TouchableOpacity>
          </View>
        </View>
        
        {!improvedContent && (
          <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
            <Button
              mode="contained"
              onPress={handleImproveSession}
              loading={improving}
              disabled={improving}
              style={{ backgroundColor: "#9C27B0" }}
              icon="auto-awesome"
              compact
            >
              {improving ? 'Enhancing...' : 'Enhance Session with AI'}
            </Button>
          </View>
        )}
      </Surface>
    );
  };

  const renderTabNavigation = () => (
    <Surface style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Icon
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab.key ? colors.primary : colors.textSecondary }
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent />
      
      {renderHeader()}
      {renderTabNavigation()}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderSessionInfo()}
          {renderEnhancementToggle()}
          {renderTabContent()}
        </ScrollView>
      </Animated.View>
      
      <FAB
        icon={improving ? "hourglass-empty" : sessionStarted ? "stop" : "play-arrow"}
        style={[
          styles.fab,
          { backgroundColor: improving ? colors.warning : sessionStarted ? colors.error : colors.success }
        ]}
        onPress={improving ? null : handleStartSession}
        label={improving ? "Enhancing..." : sessionStarted ? "End Session" : "Start Session"}
        loading={improving}
      />

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: colors.success }}
        >
          <Text style={{ color: 'white' }}>{snackbarMessage}</Text>
        </Snackbar>
      </Portal>
    </View>
  );
};

export default SessionScheduleScreen;