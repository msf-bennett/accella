import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Vibration,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  ProgressBar,
  Portal,
  ActivityIndicator,
  Snackbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from '../../../components/shared/Icon';
import { useSelector, useDispatch } from 'react-redux';

// Services
import SessionExtractor from '../../../services/SessionExtractor';
import DocumentProcessor from '../../../services/DocumentProcessor';

const { width, height } = Dimensions.get('window');

const UpcomingSessions = ({ navigation }) => {
  // Define fallback colors at the top of the component
  const COLORS_FALLBACK = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    background: '#f5f7fa',
    white: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
  };

  const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  };

  const TEXT_STYLES = {
    h1: { fontSize: 28, fontWeight: 'bold' },
    h2: { fontSize: 22, fontWeight: '600' },
    h3: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 14, fontWeight: '400' },
    small: { fontSize: 12, fontWeight: '400' },
  };

  // Try to use imported COLORS, fallback to local definition if undefined
  const COLORS = {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    background: '#f5f7fa',
    white: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
  };

  const dispatch = useDispatch();
  const { user } = useSelector(state => ({
    user: state.auth.user,
  }));

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  
  // Session data
  const [extractedSessions, setExtractedSessions] = useState([]);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [allSessions, setAllSessions] = useState([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Initialize sessions data
  useEffect(() => {
    initializeSessionData();
  }, []);

  const initializeSessionData = async () => {
    try {
      setLoading(true);
      console.log('Initializing session data in UpcomingSessions...');

      // Load training plans
      const plans = await DocumentProcessor.getTrainingPlans();
      setTrainingPlans(plans);
      console.log('Loaded training plans:', plans.length);

      // Extract sessions from all training plans
      const allExtractedSessions = [];
      
      for (const plan of plans) {
        try {
          console.log('Processing plan:', plan.title);
          
          if (plan.sourceDocument) {
            const documents = await DocumentProcessor.getStoredDocuments();
            const sourceDoc = documents.find(doc => doc.id === plan.sourceDocument);
            
            if (sourceDoc) {
              console.log('Found source document for plan:', plan.title);
              
              const extractionResult = await SessionExtractor.extractSessionsFromDocument(sourceDoc, plan);
              
              if (extractionResult && extractionResult.sessions) {
                // Convert weekly sessions to individual daily sessions for the upcoming sessions view
                extractionResult.sessions.forEach((weekSession, weekIndex) => {
                  // Add individual daily sessions
                  if (weekSession.dailySessions && weekSession.dailySessions.length > 0) {
                    weekSession.dailySessions.forEach((dailySession) => {
                      const enhancedDailySession = {
                        ...dailySession,
                        id: `upcoming_${dailySession.id}`,
                        title: `${plan.title} - Week ${weekSession.weekNumber}: ${dailySession.day.charAt(0).toUpperCase() + dailySession.day.slice(1)} Training`,
                        academyName: plan.title,
                        sport: plan.category || 'General',
                        planTitle: plan.title,
                        sourcePlan: plan.id,
                        sourceDocument: sourceDoc.id,
                        weekData: weekSession,
                        weekNumber: weekSession.weekNumber,
                        isFromPlan: true,
                        // Additional properties for UI
                        players: [
                          { id: 1, name: 'Player 1', attendance: 'confirmed' },
                          { id: 2, name: 'Player 2', attendance: 'pending' }
                        ],
                        completionRate: 0
                      };
                      
                      allExtractedSessions.push(enhancedDailySession);
                    });
                  }
                });
                
                console.log('Extracted sessions for plan:', plan.title);
              }
            }
          }
        } catch (error) {
          console.error('Error processing plan:', plan.title, error.message);
        }
      }

      setExtractedSessions(allExtractedSessions);
      setAllSessions(allExtractedSessions);
      console.log('Total extracted sessions:', allExtractedSessions.length);

    } catch (error) {
      console.error('Error initializing session data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate session dates
  const calculateSessionDate = (weekNumber, dayName) => {
    const today = new Date();
    const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      .indexOf(dayName.toLowerCase());
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (weekNumber - 1) * 7);
    
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

  const toggleSessionExpansion = (sessionId) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(50);
    }
  };

  const handleSessionPress = (session) => {
    // Navigate to SessionScheduleScreen with proper data structure
    const sessionDataForNavigation = {
      ...session,
      // Ensure all required fields are present
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
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate([50, 50, 50]);
    }
    Alert.alert(
      'Start Session',
      `Ready to start "${session.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            navigation.navigate('ActiveSession', { sessionId: session.id });
          }
        }
      ]
    );
  };

  const handleEditSession = (session) => {
    if (session.isFromPlan) {
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
    } else {
      navigation.navigate('EditSession', { sessionId: session.id });
    }
  };

  const filteredSessions = allSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (session.location && session.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (session.academyName && session.academyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = selectedFilter === 'all' || 
                         selectedFilter === 'team' || // Most sessions are team sessions
                         session.type?.toLowerCase().includes(selectedFilter);

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return COLORS.success;
      case 'upcoming': return COLORS.warning;
      case 'in_progress': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return COLORS.textSecondary;
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  // Define styles inside the component to access COLORS safely
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
      paddingBottom: 20,
      paddingHorizontal: SPACING.md,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    filterButton: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    searchContainer: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: COLORS.white,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    searchBar: {
      backgroundColor: COLORS.background,
      elevation: 0,
    },
    content: {
      flex: 1,
    },
    listContainer: {
      padding: SPACING.md,
      paddingBottom: 100,
    },
    sessionCard: {
      backgroundColor: COLORS.white,
      borderRadius: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      overflow: 'hidden',
    },
    cardHeader: {
      padding: SPACING.md,
    },
    sessionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    sessionInfo: {
      flex: 1,
    },
    timeLocation: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    headerActions: {
      alignItems: 'flex-end',
    },
    statusChip: {
      marginBottom: 8,
    },
    cardContent: {
      paddingTop: SPACING.md,
    },
    sessionMetrics: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.md,
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressSection: {
      marginBottom: SPACING.md,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    progressBar: {
      flex: 1,
      height: 8,
      borderRadius: 4,
    },
    notesSection: {
      marginBottom: SPACING.md,
      padding: SPACING.sm,
      backgroundColor: COLORS.background,
      borderRadius: 8,
    },
    expandButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      marginTop: SPACING.sm,
    },
    expandedContent: {
      marginTop: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
    },
    playerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    playerInfo: {
      flex: 1,
      marginLeft: SPACING.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    attendanceChip: {
      height: 24,
    },
    cardActions: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: COLORS.background,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: SPACING.xs,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    modalContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    blurContainer: {
      borderRadius: 12,
      overflow: 'hidden',
    },
    modalSurface: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      padding: SPACING.lg,
      borderRadius: 12,
      width: width * 0.8,
      maxHeight: height * 0.6,
    },
    filterOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
      borderRadius: 8,
      marginBottom: SPACING.sm,
    },
    selectedFilter: {
      backgroundColor: COLORS.primary,
    },
  });

  const renderSessionCard = ({ item: session, index }) => {
    const isExpanded = expandedSessions.has(session.id);

    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }, { translateY: slideAnim }] },
          { marginBottom: SPACING.md }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleSessionPress(session)}
          activeOpacity={0.7}
        >
          <Card style={styles.sessionCard}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.cardHeader}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionInfo}>
                  <Text style={[TEXT_STYLES.h3, { color: COLORS.white }]}>
                    {session.title}
                  </Text>
                  <View style={styles.timeLocation}>
                    <Icon name="access-time" size={16} color={COLORS.white} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: 4 }]}>
                      {session.time} • {session.duration}min
                    </Text>
                  </View>
                  <View style={styles.timeLocation}>
                    <Icon name="location-on" size={16} color={COLORS.white} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: 4 }]}>
                      {session.location || 'Training Field'}
                    </Text>
                  </View>
                  
                  {/* Academy and Sport Info */}
                  <View style={styles.timeLocation}>
                    <Icon name="school" size={16} color={COLORS.white} />
                    <Text style={[TEXT_STYLES.caption, { color: COLORS.white, marginLeft: 4 }]}>
                      {session.academyName}
                    </Text>
                    {session.sport && (
                      <>
                        <Text style={{ color: 'rgba(255,255,255,0.6)', marginHorizontal: 8 }}>•</Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.white }]}>
                          {session.sport}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
                <View style={styles.headerActions}>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(session.status) }]}
                    textStyle={{ color: COLORS.white, fontSize: 12 }}
                  >
                    {session.status?.replace('_', ' ').toUpperCase() || 'SCHEDULED'}
                  </Chip>
                  {session.weekNumber && (
                    <Chip
                      compact
                      style={{ backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 4 }}
                      textStyle={{ color: 'white', fontSize: 10 }}
                    >
                      Week {session.weekNumber}
                    </Chip>
                  )}
                </View>
              </View>
            </LinearGradient>

            <Card.Content style={styles.cardContent}>
              <View style={styles.sessionMetrics}>
                <View style={styles.metricItem}>
                  <Icon name="group" size={20} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                    {session.participants || 15} participants
                  </Text>
                </View>
                {session.difficulty && (
                  <View style={styles.metricItem}>
                    <Icon name="star" size={20} color={getDifficultyColor(session.difficulty)} />
                    <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                      {session.difficulty}
                    </Text>
                  </View>
                )}
              </View>

              {/* Focus Areas */}
              {session.focus && session.focus.length > 0 && (
                <View style={{ marginTop: SPACING.sm }}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: 4 }]}>
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

              {session.notes && (
                <View style={styles.notesSection}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: 4 }]}>
                    Session Plan:
                  </Text>
                  <Text style={[TEXT_STYLES.small, { lineHeight: 16 }]} numberOfLines={3}>
                    {session.notes.length > 150 ? session.notes.substring(0, 150) + '...' : session.notes}
                  </Text>
                </View>
              )}
            </Card.Content>

            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                onPress={() => handleEditSession(session)}
                style={styles.actionButton}
                contentStyle={styles.buttonContent}
              >
                <Icon name="edit" size={16} />
                {session.isFromPlan ? 'View Plan' : 'Edit'}
              </Button>
              <Button
                mode="contained"
                onPress={() => handleStartSession(session)}
                style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                contentStyle={styles.buttonContent}
              >
                <Icon name="play-arrow" size={16} color={COLORS.white} />
                Start
              </Button>
            </Card.Actions>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="event-available" size={80} color={COLORS.textSecondary} />
      <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: 16 }]}>
        No sessions scheduled
      </Text>
      <Text style={[TEXT_STYLES.body, { 
        color: COLORS.textSecondary, 
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

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={filterModalVisible}
        onDismiss={() => setFilterModalVisible(false)}
        contentContainerStyle={styles.modalContent}
        transparent
      >
        <View style={styles.modalOverlay}>
          <BlurView 
            intensity={20} 
            tint="light" 
            style={styles.blurContainer}
          >
            <Surface style={styles.modalSurface}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: 20 }]}>Filter Sessions</Text>
              
              {['all', 'team', 'individual', 'youth'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => {
                    setSelectedFilter(filter);
                    setFilterModalVisible(false);
                    if (Platform.OS === 'ios' || Platform.OS === 'android') {
                      Vibration.vibrate(50);
                    }
                  }}
                  style={[
                    styles.filterOption,
                    selectedFilter === filter && styles.selectedFilter
                  ]}
                >
                  <Text style={[
                    TEXT_STYLES.body,
                    selectedFilter === filter && { color: COLORS.white }
                  ]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)} Sessions
                  </Text>
                  {selectedFilter === filter && (
                    <Icon name="check" size={20} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              ))}
            </Surface>
          </BlurView>
        </View>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16 }}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
              Upcoming Sessions
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.white, opacity: 0.9 }]}>
              {filteredSessions.length} sessions available
            </Text>
          </View>
          <IconButton
            icon="tune"
            size={24}
            iconColor={COLORS.white}
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          />
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search sessions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={{ color: COLORS.text }}
        />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <FlatList
          data={filteredSessions}
          renderItem={renderSessionCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      </Animated.View>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => navigation.navigate('SessionBuilder')}
        label="New Session"
      />

      {renderFilterModal()}
    </View>
  );
};

export default UpcomingSessions;