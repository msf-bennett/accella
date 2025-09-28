//src/screens/coach/training/SessionScheduleScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  FlatList,
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
  Modal,
  Divider,
  Avatar,
  List,
  Snackbar,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TEXT_STYLES } from '../../styles/textStyles';
import AIService from '../../../services/AIService';

const { width: screenWidth } = Dimensions.get('window');


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
  // AI Enhancement States
  const [showImproved, setShowImproved] = useState(false);
  const [improvedContent, setImprovedContent] = useState(null);
  const [improving, setImproving] = useState(false);
  const [aiEnhancementAvailable, setAiEnhancementAvailable] = useState(true);
  // Add real-time AI coaching
  const [realtimeCoaching, setRealtimeCoaching] = useState(null);

const getRealtimeAdvice = async () => {
  const context = {
    currentDrill: currentDrill?.name,
    playerCount: session.participants,
    timeElapsed: sessionDuration,
    issues: observedIssues
  };
  
  const advice = await AIService.getRealtimeCoachingTips(context);
  setRealtimeCoaching(advice);
};

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

  // Calculate progress based on completed drills
  useEffect(() => {
    if (session.drills && session.drills.length > 0) {
      const progress = (completedDrills.size / session.drills.length) * 100;
      setSessionProgress(progress);
    }
  }, [completedDrills, session.drills]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
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
  console.log('Starting AI session improvement...');
  setImproving(true);
  
  try {
    // Import AIService dynamically to avoid circular dependencies
    const { default: AIService } = await import('../../../services/AIService');
    
    const userProfile = {
      ageGroup: session.ageGroup || 'Youth',
      sport: session.sport || 'General',
      experience: session.difficulty || 'beginner'
    };
    
    const enhanced = await AIService.improveSingleSession(session, userProfile);
    
    if (enhanced && enhanced.enhancedSession) {
      setImprovedContent(enhanced);
      setShowImproved(true);
      setSnackbarMessage('Session enhanced with AI successfully! 🚀');
      setSnackbarVisible(true);
    } else {
      throw new Error('No enhancement data received');
    }
    
  } catch (error) {
    console.error('AI Enhancement failed:', error);
    Alert.alert(
      'AI Enhancement Failed',
      'Could not enhance the session with AI. Please try again later.',
      [{ text: 'OK' }]
    );
  } finally {
    setImproving(false);
  }
};

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

      {/* Session Progress */}
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
    </Surface>
  );

  

 const renderTabContent = () => {
  const contentToRender = showImproved && improvedContent 
    ? improvedContent.enhancedSession 
    : session;
    
  switch (activeTab) {
    case 'overview':
      return renderOverview(contentToRender);
    case 'plan':
      return renderTrainingPlan(contentToRender);
    case 'progress':
      return renderProgress(contentToRender);
    case 'notes':
      return renderNotes(contentToRender);
    default:
      return renderOverview(contentToRender);
  }
};

  const renderOverview = (contentData = session) => (
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

      {/* Week Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
            Week {session.week} Overview
          </Text>
          <Text style={[textStyles.body1, { lineHeight: 24, marginBottom: spacing.md }]}>
            {session.weekDescription || session.description}
          </Text>
          
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Icon name="fitness-center" size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{session.drills?.length || 0}</Text>
              <Text style={styles.statLabel}>Drills</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="schedule" size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{session.duration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="group" size={24} color={colors.primary} />
              <Text style={styles.statNumber}>{session.participants || 'N/A'}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Objectives */}
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

      {/* Schedule for the Week */}
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

  const renderTrainingPlan = () => (
    <View style={styles.tabContent}>
      {/* Document Content */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
            Training Plan Details
          </Text>
          <Text style={[textStyles.body1, { lineHeight: 22 }]}>
            {session.documentContent || session.rawContent || 'No detailed training plan content available.'}
          </Text>
        </Card.Content>
      </Card>

      {/* Drills List */}
      {session.drills && session.drills.length > 0 && (
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text style={[textStyles.h3, { marginBottom: spacing.md }]}>
              Training Drills ({session.drills.length})
            </Text>
            {session.drills.map((drill, index) => (
              <View key={index} style={styles.drillItem}>
                <TouchableOpacity
                  style={styles.drillHeader}
                  onPress={() => handleDrillComplete(drill.id || index)}
                >
                  <View style={styles.drillInfo}>
                    <Icon
                      name={completedDrills.has(drill.id || index) ? "check-circle" : "radio-button-unchecked"}
                      size={24}
                      color={completedDrills.has(drill.id || index) ? colors.success : colors.textSecondary}
                    />
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                      <Text style={[textStyles.subtitle1, { fontWeight: 'bold' }]}>
                        {drill.name || drill.title || `Drill ${index + 1}`}
                      </Text>
                      {drill.duration && (
                        <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                          Duration: {drill.duration} minutes
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                
                {drill.description && (
                  <Text style={[textStyles.body2, { 
                    marginTop: spacing.sm, 
                    marginLeft: 36,
                    color: colors.textSecondary 
                  }]}>
                    {drill.description}
                  </Text>
                )}

                {drill.instructions && (
                  <Text style={[textStyles.body2, { 
                    marginTop: spacing.xs, 
                    marginLeft: 36,
                    fontStyle: 'italic' 
                  }]}>
                    {drill.instructions}
                  </Text>
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </View>
  );

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

      {/* Completed Drills List */}
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

      {/* Coach Recommendations */}
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

const renderEnhancementToggle = () => (
  <Surface style={[styles.sessionInfoCard, { marginTop: 0 }]}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon 
          name="auto-awesome" 
          size={20} 
          color={showImproved ? "#FFD700" : colors.textSecondary} 
        />
        <Text style={[textStyles.subtitle1, { marginLeft: spacing.sm }]}>
          {showImproved ? 'AI Enhanced View' : 'Original Content'}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[textStyles.caption, { marginRight: spacing.sm }]}>
          {showImproved ? 'Enhanced' : 'Original'}
        </Text>
        <TouchableOpacity
          onPress={() => setShowImproved(!showImproved)}
          disabled={!improvedContent}
          style={{
            width: 50,
            height: 30,
            borderRadius: 15,
            backgroundColor: showImproved && improvedContent ? colors.primary : colors.textSecondary,
            justifyContent: 'center',
            alignItems: showImproved ? 'flex-end' : 'flex-start',
            paddingHorizontal: 3,
            opacity: improvedContent ? 1 : 0.5
          }}
        >
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: 'white'
          }} />
        </TouchableOpacity>
      </View>
    </View>
  </Surface>
);

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
          {renderTabContent()}
          {renderEnhancementToggle()}
        </ScrollView>
      </Animated.View>

      {/* Start/End Session FAB */}
      {/* AI Enhancement FAB */}
      <FAB
        icon={improving ? "hourglass-empty" : sessionStarted ? "stop" : improvedContent ? "auto-awesome" : "play-arrow"}
        style={[
          styles.fab,
          { backgroundColor: improving ? colors.warning : sessionStarted ? colors.error : improvedContent ? "#FFD700" : colors.success }
        ]}
        onPress={improving ? null : (improvedContent ? handleImproveSession : sessionStarted ? handleStartSession : handleImproveSession)}
        label={improving ? "Enhancing..." : sessionStarted ? "End Session" : improvedContent ? "Re-enhance" : "Enhance with AI"}
        loading={improving}
      />

      {/* Success Snackbar */}
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