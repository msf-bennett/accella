import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  Vibration,
  Alert,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Card, 
  Avatar, 
  Chip, 
  ProgressBar, 
  IconButton, 
  Surface,
  Portal,
  Modal,
  Button
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const RecentSessions = ({ navigation }) => {
  const dispatch = useDispatch();
  const { recentSessions, isLoading, user } = useSelector(state => state.trainer);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [expandedSessions, setExpandedSessions] = useState(new Set());

  // Mock data for development - replace with real Redux state
  const mockSessions = [
    {
      id: 'session_1',
      clientName: 'Sarah Johnson',
      clientAvatar: 'https://randomuser.me/api/portraits/women/1.jpg',
      sessionType: 'Personal Training',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      duration: 60,
      status: 'completed',
      intensity: 'high',
      completionRate: 0.95,
      exercises: 8,
      completedExercises: 8,
      calories: 420,
      rating: 5,
      feedback: 'Great session! Feeling stronger each week.',
      nextSession: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      sessionNotes: 'Client showed excellent form on squats. Ready to increase weight next session.',
      achievements: ['Personal Best', 'Full Completion'],
      workoutPlan: 'Upper Body Strength',
    },
    {
      id: 'session_2',
      clientName: 'Mike Thompson',
      clientAvatar: 'https://randomuser.me/api/portraits/men/2.jpg',
      sessionType: 'Group Training',
      date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      duration: 45,
      status: 'completed',
      intensity: 'medium',
      completionRate: 0.78,
      exercises: 6,
      completedExercises: 5,
      calories: 285,
      rating: 4,
      feedback: 'Good workout, but struggled with the last set.',
      nextSession: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      sessionNotes: 'Need to work on endurance. Consider adding cardio intervals.',
      achievements: ['Consistency Award'],
      workoutPlan: 'Cardio Blast',
    },
    {
      id: 'session_3',
      clientName: 'Emily Davis',
      clientAvatar: 'https://randomuser.me/api/portraits/women/3.jpg',
      sessionType: 'Yoga',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      duration: 90,
      status: 'completed',
      intensity: 'low',
      completionRate: 1.0,
      exercises: 12,
      completedExercises: 12,
      calories: 180,
      rating: 5,
      feedback: 'Perfect relaxation session. Namaste! 🧘‍♀️',
      nextSession: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      sessionNotes: 'Excellent progress in flexibility. Ready for advanced poses.',
      achievements: ['Mindfulness Master', 'Perfect Form'],
      workoutPlan: 'Flexibility & Balance',
    },
    {
      id: 'session_4',
      clientName: 'Alex Rodriguez',
      clientAvatar: 'https://randomuser.me/api/portraits/men/4.jpg',
      sessionType: 'HIIT',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: 30,
      status: 'missed',
      intensity: 'high',
      completionRate: 0,
      exercises: 5,
      completedExercises: 0,
      calories: 0,
      rating: null,
      feedback: null,
      nextSession: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      sessionNotes: 'Client missed session. Need to follow up.',
      achievements: [],
      workoutPlan: 'Fat Burn Express',
    },
  ];

  const sessions = recentSessions || mockSessions;

  useEffect(() => {
    // Fetch recent sessions on component mount
    // dispatch(fetchRecentSessions());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      // dispatch(fetchRecentSessions());
    }, 1000);
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'missed': return COLORS.error;
      case 'cancelled': return '#ff9500';
      case 'upcoming': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffa726';
      case 'low': return '#66bb6a';
      default: return COLORS.textSecondary;
    }
  };

  const toggleSessionExpansion = useCallback((sessionId) => {
    setExpandedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
    Vibration.vibrate(30);
  }, []);

  const handleSessionAction = useCallback((action, session) => {
    Vibration.vibrate(50);
    
    switch (action) {
      case 'viewDetails':
        setSelectedSession(session);
        setShowSessionDetails(true);
        break;
      case 'reschedule':
        navigation.navigate('ScheduleSession', { clientId: session.clientId, reschedule: true });
        break;
      case 'addNotes':
        navigation.navigate('SessionNotes', { sessionId: session.id });
        break;
      case 'duplicate':
        navigation.navigate('CreateWorkout', { templateSession: session });
        break;
      case 'contact':
        navigation.navigate('Messages', { clientId: session.clientId });
        break;
      default:
        Alert.alert(
          'Feature Development',
          `${action} feature is currently under development and will be available in the next update! 🚀`,
          [{ text: 'Got it!', style: 'default' }]
        );
    }
  }, [navigation]);

  const renderStarRating = (rating) => {
    if (!rating) return null;
    
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="star"
            size={16}
            color={star <= rating ? '#FFD700' : '#E0E0E0'}
          />
        ))}
      </View>
    );
  };

  const renderSessionCard = ({ item: session, index }) => {
    const isExpanded = expandedSessions.has(session.id);
    const cardScale = scrollY.interpolate({
      inputRange: [-1, 0, index * 200, (index + 1) * 200],
      outputRange: [1, 1, 1, 0.98],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View 
        key={session.id}
        style={[
          styles.sessionCard,
          { transform: [{ scale: cardScale }] }
        ]}
      >
        <Card style={styles.card} elevation={4}>
          <TouchableOpacity
            onPress={() => toggleSessionExpansion(session.id)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={session.status === 'completed' 
                ? ['#667eea', '#764ba2'] 
                : session.status === 'missed'
                ? ['#ff6b6b', '#ee5a52']
                : ['#11998e', '#38ef7d']
              }
              style={styles.cardHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.clientInfo}>
                  <Avatar.Image 
                    size={48} 
                    source={{ uri: session.clientAvatar }}
                    style={styles.avatar}
                  />
                  <View style={styles.clientDetails}>
                    <Text style={styles.clientName}>{session.clientName}</Text>
                    <Text style={styles.sessionType}>{session.sessionType}</Text>
                  </View>
                </View>
                <View style={styles.headerActions}>
                  <Text style={styles.timeAgo}>{formatTimeAgo(session.date)}</Text>
                  <Icon 
                    name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                    size={24} 
                    color="white" 
                  />
                </View>
              </View>
            </LinearGradient>

            <View style={styles.cardContent}>
              <View style={styles.sessionStats}>
                <View style={styles.statItem}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                  <Text style={styles.statText}>{session.duration}min</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Icon name="fitness-center" size={20} color={getIntensityColor(session.intensity)} />
                  <Text style={styles.statText}>{session.exercises} exercises</Text>
                </View>

                {session.status === 'completed' && (
                  <View style={styles.statItem}>
                    <Icon name="local-fire-department" size={20} color="#ff6b6b" />
                    <Text style={styles.statText}>{session.calories} cal</Text>
                  </View>
                )}
              </View>

              <View style={styles.statusRow}>
                <Chip 
                  mode="outlined"
                  textStyle={{ color: getStatusColor(session.status), fontSize: 12 }}
                  style={[styles.statusChip, { borderColor: getStatusColor(session.status) }]}
                >
                  {session.status.toUpperCase()}
                </Chip>

                <Chip 
                  mode="outlined"
                  textStyle={{ color: getIntensityColor(session.intensity), fontSize: 12 }}
                  style={[styles.intensityChip, { borderColor: getIntensityColor(session.intensity) }]}
                >
                  {session.intensity.toUpperCase()}
                </Chip>
              </View>

              {session.status === 'completed' && (
                <View style={styles.progressSection}>
                  <Text style={styles.progressLabel}>Completion Rate</Text>
                  <ProgressBar 
                    progress={session.completionRate} 
                    color={COLORS.success}
                    style={styles.progressBar}
                  />
                  <Text style={styles.progressText}>
                    {Math.round(session.completionRate * 100)}% ({session.completedExercises}/{session.exercises})
                  </Text>
                </View>
              )}

              {/* Expanded Content */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.divider} />
                  
                  {session.achievements.length > 0 && (
                    <View style={styles.achievementsSection}>
                      <Text style={styles.sectionTitle}>🏆 Achievements</Text>
                      <View style={styles.achievementsRow}>
                        {session.achievements.map((achievement, idx) => (
                          <Chip
                            key={idx}
                            mode="flat"
                            textStyle={{ color: '#FFD700', fontSize: 11 }}
                            style={styles.achievementChip}
                          >
                            {achievement}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}

                  {session.feedback && (
                    <View style={styles.feedbackSection}>
                      <Text style={styles.sectionTitle}>💬 Client Feedback</Text>
                      <View style={styles.feedbackCard}>
                        <Text style={styles.feedbackText}>"{session.feedback}"</Text>
                        {renderStarRating(session.rating)}
                      </View>
                    </View>
                  )}

                  {session.sessionNotes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.sectionTitle}>📝 Trainer Notes</Text>
                      <Text style={styles.notesText}>{session.sessionNotes}</Text>
                    </View>
                  )}

                  <View style={styles.actionsRow}>
                    <IconButton
                      icon="visibility"
                      size={20}
                      iconColor={COLORS.primary}
                      style={styles.actionButton}
                      onPress={() => handleSessionAction('viewDetails', session)}
                    />
                    <IconButton
                      icon="edit-note"
                      size={20}
                      iconColor={COLORS.success}
                      style={styles.actionButton}
                      onPress={() => handleSessionAction('addNotes', session)}
                    />
                    <IconButton
                      icon="content-copy"
                      size={20}
                      iconColor="#ff9500"
                      style={styles.actionButton}
                      onPress={() => handleSessionAction('duplicate', session)}
                    />
                    <IconButton
                      icon="message"
                      size={20}
                      iconColor="#4ecdc4"
                      style={styles.actionButton}
                      onPress={() => handleSessionAction('contact', session)}
                    />
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  const closeSessionDetails = () => {
    setShowSessionDetails(false);
    setSelectedSession(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <Text style={styles.sectionSubtitle}>
          Track your latest training activities 📊
        </Text>
      </View>

      {/* Sessions List */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {sessions.length > 0 ? (
          sessions.map((session, index) => 
            renderSessionCard({ item: session, index })
          )
        ) : (
          <View style={styles.emptyState}>
            <Icon name="fitness-center" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Recent Sessions</Text>
            <Text style={styles.emptySubtitle}>
              Your completed sessions will appear here
            </Text>
          </View>
        )}
      </Animated.ScrollView>

      {/* Session Details Modal */}
      <Portal>
        <Modal
          visible={showSessionDetails}
          onDismiss={closeSessionDetails}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalSurface}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Session Details</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={closeSessionDetails}
              />
            </View>
            
            {selectedSession && (
              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalText}>
                  Detailed session information would be displayed here with comprehensive metrics, 
                  exercise breakdown, and performance analytics.
                </Text>
                <Button
                  mode="contained"
                  style={styles.modalButton}
                  onPress={closeSessionDetails}
                >
                  Close
                </Button>
              </ScrollView>
            )}
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  sessionCard: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: SPACING.md,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionType: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '400',
  },
  headerActions: {
    alignItems: 'flex-end',
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginBottom: 4,
  },
  cardContent: {
    padding: SPACING.md,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  statusChip: {
    marginRight: SPACING.sm,
    height: 28,
  },
  intensityChip: {
    height: 28,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    textAlign: 'right',
  },
  expandedContent: {
    marginTop: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: SPACING.md,
  },
  achievementsSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  achievementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
    backgroundColor: '#FFF8E1',
    height: 26,
  },
  feedbackSection: {
    marginBottom: SPACING.md,
  },
  feedbackCard: {
    backgroundColor: '#f8f9fa',
    padding: SPACING.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  feedbackText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  notesSection: {
    marginBottom: SPACING.md,
  },
  notesText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    backgroundColor: '#f8f9fa',
    padding: SPACING.md,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    margin: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: SPACING.lg,
  },
  modalSurface: {
    backgroundColor: 'white',
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
});

export default RecentSessions;