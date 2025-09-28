import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TrainingHistory = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'completed', 'missed', 'cancelled'
  const [timeFilter, setTimeFilter] = useState('month'); // 'week', 'month', '3months', 'year'
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const trainingHistory = useSelector(state => state.training.history) || [];
  const isLoading = useSelector(state => state.training.loading);

  // Animation on mount
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

  // Focus effect
  useFocusEffect(
    useCallback(() => {
      loadTrainingHistory();
    }, [timeFilter])
  );

  // Load training history
  const loadTrainingHistory = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        // Mock data would be loaded here
      }, 1000);
    } catch (error) {
      console.error('Error loading training history:', error);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainingHistory();
    setRefreshing(false);
  }, []);

  // Mock training history data
  const mockHistory = [
    {
      id: 1,
      date: '2024-12-15',
      title: 'Morning Football Practice',
      coach: 'Coach Martinez',
      duration: 120,
      status: 'completed',
      rating: 4.5,
      feedback: 'Great improvement in passing accuracy!',
      type: 'Team Training',
      intensity: 'High',
      skills: ['Passing', 'Dribbling', 'Shooting'],
      attendanceRate: 95,
      achievements: ['Perfect Attendance', 'Best Performance'],
    },
    {
      id: 2,
      date: '2024-12-13',
      title: 'Strength & Conditioning',
      coach: 'Trainer Johnson',
      duration: 90,
      status: 'completed',
      rating: 4.0,
      feedback: 'Good effort, work on core strength',
      type: 'Individual Training',
      intensity: 'Medium',
      skills: ['Strength', 'Endurance', 'Core'],
      attendanceRate: 100,
      achievements: ['Personal Best'],
    },
    {
      id: 3,
      date: '2024-12-11',
      title: 'Technical Skills',
      coach: 'Coach Rodriguez',
      duration: 75,
      status: 'missed',
      rating: 0,
      feedback: '',
      type: 'Individual Training',
      intensity: 'Medium',
      skills: ['Ball Control', 'Footwork'],
      attendanceRate: 0,
      achievements: [],
    },
    {
      id: 4,
      date: '2024-12-08',
      title: 'Team Strategy Session',
      coach: 'Coach Martinez',
      duration: 60,
      status: 'completed',
      rating: 5.0,
      feedback: 'Excellent understanding of tactics!',
      type: 'Team Training',
      intensity: 'Low',
      skills: ['Tactics', 'Communication'],
      attendanceRate: 100,
      achievements: ['Team Player', 'Strategic Thinker'],
    },
    {
      id: 5,
      date: '2024-12-06',
      title: 'Fitness Assessment',
      coach: 'Trainer Johnson',
      duration: 45,
      status: 'cancelled',
      rating: 0,
      feedback: 'Rescheduled due to weather',
      type: 'Assessment',
      intensity: 'Medium',
      skills: ['Fitness Testing'],
      attendanceRate: 0,
      achievements: [],
    },
  ];

  // Calculate statistics
  const calculateStats = () => {
    const completed = mockHistory.filter(session => session.status === 'completed');
    const totalSessions = mockHistory.length;
    const completionRate = (completed.length / totalSessions) * 100;
    const totalHours = completed.reduce((sum, session) => sum + (session.duration / 60), 0);
    const avgRating = completed.reduce((sum, session) => sum + session.rating, 0) / completed.length;
    const achievements = mockHistory.reduce((acc, session) => acc + session.achievements.length, 0);
    
    return {
      completionRate: Math.round(completionRate),
      totalHours: Math.round(totalHours * 10) / 10,
      avgRating: Math.round(avgRating * 10) / 10,
      totalSessions,
      completedSessions: completed.length,
      achievements,
    };
  };

  // Filter sessions
  const getFilteredSessions = () => {
    let filtered = mockHistory;

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(session => session.status === filterBy);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  // Handle session selection
  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  // Handle session action
  const handleSessionAction = (action) => {
    Vibration.vibrate(50);
    switch (action) {
      case 'feedback':
        navigation.navigate('SessionFeedback', { sessionId: selectedSession.id });
        break;
      case 'reschedule':
        Alert.alert('Reschedule Session', 'Feature coming soon! 🚀');
        break;
      case 'details':
        navigation.navigate('SessionDetails', { sessionId: selectedSession.id });
        break;
      default:
        Alert.alert('Action', 'Feature in development! ⚙️');
    }
    setModalVisible(false);
  };

  // Render statistics header
  const renderStatsHeader = () => {
    const stats = calculateStats();

    return (
      <TouchableOpacity
        onPress={() => setStatsModalVisible(true)}
        activeOpacity={0.9}
      >
        <Card style={styles.statsCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.statsGradient}
          >
            <View style={styles.statsContent}>
              <Text style={styles.statsTitle}>Training Overview 📊</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.completedSessions}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.totalHours}h</Text>
                  <Text style={styles.statLabel}>Total Hours</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.completionRate}%</Text>
                  <Text style={styles.statLabel}>Attendance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{stats.achievements}</Text>
                  <Text style={styles.statLabel}>Achievements</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Overall Performance</Text>
                <ProgressBar
                  progress={stats.avgRating / 5}
                  color="#FFD700"
                  style={styles.progressBar}
                />
                <Text style={styles.ratingText}>⭐ {stats.avgRating}/5.0</Text>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </TouchableOpacity>
    );
  };

  // Render filter controls
  const renderFilterControls = () => (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollContent}
      >
        <Chip
          selected={filterBy === 'all'}
          onPress={() => setFilterBy('all')}
          style={[styles.filterChip, filterBy === 'all' && styles.activeFilterChip]}
          textStyle={styles.filterChipText}
        >
          All Sessions
        </Chip>
        <Chip
          selected={filterBy === 'completed'}
          onPress={() => setFilterBy('completed')}
          style={[styles.filterChip, filterBy === 'completed' && styles.activeFilterChip]}
          textStyle={styles.filterChipText}
        >
          Completed ✓
        </Chip>
        <Chip
          selected={filterBy === 'missed'}
          onPress={() => setFilterBy('missed')}
          style={[styles.filterChip, filterBy === 'missed' && styles.activeFilterChip]}
          textStyle={styles.filterChipText}
        >
          Missed ⏰
        </Chip>
        <Chip
          selected={filterBy === 'cancelled'}
          onPress={() => setFilterBy('cancelled')}
          style={[styles.filterChip, filterBy === 'cancelled' && styles.activeFilterChip]}
          textStyle={styles.filterChipText}
        >
          Cancelled ❌
        </Chip>
      </ScrollView>
      
      <View style={styles.timeFilterContainer}>
        <Chip
          selected={timeFilter === 'month'}
          onPress={() => setTimeFilter('month')}
          style={[styles.timeChip, timeFilter === 'month' && styles.activeTimeChip]}
          compact
        >
          Month
        </Chip>
        <Chip
          selected={timeFilter === '3months'}
          onPress={() => setTimeFilter('3months')}
          style={[styles.timeChip, timeFilter === '3months' && styles.activeTimeChip]}
          compact
        >
          3M
        </Chip>
      </View>
    </View>
  );

  // Render session card
  const renderSessionCard = (session) => {
    const statusColors = {
      completed: COLORS.success,
      missed: COLORS.error,
      cancelled: COLORS.warning,
    };

    const statusIcons = {
      completed: 'check-circle',
      missed: 'cancel',
      cancelled: 'event-busy',
    };

    const intensityColor = session.intensity === 'High' ? COLORS.error : 
                          session.intensity === 'Medium' ? COLORS.warning : COLORS.success;

    return (
      <TouchableOpacity
        key={session.id}
        onPress={() => handleSessionSelect(session)}
        activeOpacity={0.8}
      >
        <Card style={styles.sessionCard}>
          <Card.Content>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.sessionStatusContainer}>
                <Icon
                  name={statusIcons[session.status]}
                  size={24}
                  color={statusColors[session.status]}
                />
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.intensityChip, { borderColor: intensityColor }]}
                  textStyle={{ color: intensityColor, fontSize: 11 }}
                >
                  {session.intensity}
                </Chip>
              </View>
            </View>

            <View style={styles.sessionDetails}>
              <View style={styles.detailRow}>
                <Icon name="person" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{session.coach}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{session.duration} minutes</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{session.type}</Text>
              </View>
            </View>

            {session.status === 'completed' && (
              <View style={styles.completedSection}>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Rating:</Text>
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Icon
                        key={star}
                        name="star"
                        size={16}
                        color={star <= session.rating ? '#FFD700' : '#E0E0E0'}
                      />
                    ))}
                  </View>
                </View>
                {session.feedback && (
                  <Text style={styles.feedbackText} numberOfLines={2}>
                    "{session.feedback}"
                  </Text>
                )}
                {session.achievements.length > 0 && (
                  <View style={styles.achievementsRow}>
                    <Icon name="jump-rope" size={16} color={COLORS.warning} />
                    <Text style={styles.achievementsText}>
                      {session.achievements.length} achievement{session.achievements.length > 1 ? 's' : ''} 🏆
                    </Text>
                  </View>
                )}
              </View>
            )}

            {session.status === 'missed' && (
              <View style={styles.missedSection}>
                <Text style={styles.missedText}>
                  Session missed - consider rescheduling! 💪
                </Text>
              </View>
            )}

            {session.status === 'cancelled' && session.feedback && (
              <View style={styles.cancelledSection}>
                <Text style={styles.cancelledText}>
                  Reason: {session.feedback}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // Render session details modal
  const renderSessionModal = () => {
    if (!selectedSession) return null;

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <Surface style={styles.modalContent} elevation={8}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedSession.title}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Session Details</Text>
                  <View style={styles.modalDetailItem}>
                    <Icon name="event" size={20} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>
                      {new Date(selectedSession.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.modalDetailItem}>
                    <Icon name="person" size={20} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>{selectedSession.coach}</Text>
                  </View>
                  <View style={styles.modalDetailItem}>
                    <Icon name="schedule" size={20} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>{selectedSession.duration} minutes</Text>
                  </View>
                </View>

                {selectedSession.skills.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Skills Practiced</Text>
                    <View style={styles.skillsContainer}>
                      {selectedSession.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          style={styles.skillChip}
                          textStyle={styles.skillChipText}
                          compact
                        >
                          {skill}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {selectedSession.achievements.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Achievements 🏆</Text>
                    {selectedSession.achievements.map((achievement, index) => (
                      <View key={index} style={styles.achievementItem}>
                        <Icon name="jump-rope" size={18} color={COLORS.warning} />
                        <Text style={styles.achievementText}>{achievement}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                {selectedSession.status === 'completed' && (
                  <Button
                    mode="outlined"
                    onPress={() => handleSessionAction('feedback')}
                    style={styles.actionButton}
                    contentStyle={styles.buttonContent}
                  >
                    View Feedback 💭
                  </Button>
                )}
                {selectedSession.status === 'missed' && (
                  <Button
                    mode="contained"
                    onPress={() => handleSessionAction('reschedule')}
                    style={styles.actionButton}
                    contentStyle={styles.buttonContent}
                  >
                    Reschedule 📅
                  </Button>
                )}
                <Button
                  mode="outlined"
                  onPress={() => handleSessionAction('details')}
                  style={styles.actionButton}
                  contentStyle={styles.buttonContent}
                >
                  Full Details 📋
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  // Render stats modal
  const renderStatsModal = () => {
    const stats = calculateStats();

    return (
      <Portal>
        <Modal
          visible={statsModalVisible}
          onDismiss={() => setStatsModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <Surface style={styles.statsModalContent} elevation={8}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detailed Statistics 📊</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setStatsModalVisible(false)}
                />
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.detailedStatsGrid}>
                  <Surface style={styles.statCard} elevation={2}>
                    <Text style={styles.statCardNumber}>{stats.totalSessions}</Text>
                    <Text style={styles.statCardLabel}>Total Sessions</Text>
                    <Icon name="event" size={24} color={COLORS.primary} />
                  </Surface>
                  <Surface style={styles.statCard} elevation={2}>
                    <Text style={styles.statCardNumber}>{stats.completedSessions}</Text>
                    <Text style={styles.statCardLabel}>Completed</Text>
                    <Icon name="check-circle" size={24} color={COLORS.success} />
                  </Surface>
                  <Surface style={styles.statCard} elevation={2}>
                    <Text style={styles.statCardNumber}>{stats.totalHours}h</Text>
                    <Text style={styles.statCardLabel}>Training Hours</Text>
                    <Icon name="schedule" size={24} color={COLORS.warning} />
                  </Surface>
                  <Surface style={styles.statCard} elevation={2}>
                    <Text style={styles.statCardNumber}>{stats.achievements}</Text>
                    <Text style={styles.statCardLabel}>Achievements</Text>
                    <Icon name="jump-rope" size={24} color={COLORS.warning} />
                  </Surface>
                </View>

                <View style={styles.progressDetails}>
                  <Text style={styles.progressDetailTitle}>Performance Metrics</Text>
                  
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Attendance Rate</Text>
                    <ProgressBar
                      progress={stats.completionRate / 100}
                      color={COLORS.success}
                      style={styles.metricBar}
                    />
                    <Text style={styles.metricValue}>{stats.completionRate}%</Text>
                  </View>

                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Average Rating</Text>
                    <ProgressBar
                      progress={stats.avgRating / 5}
                      color="#FFD700"
                      style={styles.metricBar}
                    />
                    <Text style={styles.metricValue}>{stats.avgRating}/5.0</Text>
                  </View>
                </View>
              </ScrollView>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  const filteredSessions = getFilteredSessions();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Training History 📚</Text>
          <Text style={styles.headerSubtitle}>
            Track your progress and achievements! 🌟
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsHeader()}
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search sessions, coaches, or types..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {renderFilterControls()}

        <View style={styles.sessionsContainer}>
          {filteredSessions.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                {filterBy === 'all' ? 'All Sessions' : 
                 filterBy === 'completed' ? 'Completed Sessions ✓' :
                 filterBy === 'missed' ? 'Missed Sessions ⏰' :
                 'Cancelled Sessions ❌'} ({filteredSessions.length})
              </Text>
              {filteredSessions.map(renderSessionCard)}
            </>
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <View style={styles.emptyState}>
                  <Icon name="history" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>No sessions found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search or filters' : 'Your training history will appear here'}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {renderSessionModal()}
      {renderStatsModal()}

      <FAB
        icon="analytics"
        style={styles.fab}
        onPress={() => setStatsModalVisible(true)}
        customSize={56}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsCard: {
    margin: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsContent: {
    alignItems: 'center',
  },
  statsTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginTop: SPACING.sm,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterScrollContent: {
    paddingRight: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    ...TEXT_STYLES.caption,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  timeChip: {
    backgroundColor: COLORS.surface,
  },
  activeTimeChip: {
    backgroundColor: COLORS.secondary,
  },
  sessionsContainer: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  sessionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sessionDate: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sessionStatusContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  intensityChip: {
    backgroundColor: 'transparent',
  },
  sessionDetails: {
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  completedSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  feedbackText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginVertical: SPACING.xs,
  },
  achievementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  achievementsText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  missedSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.error + '30',
  },
  missedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    fontStyle: 'italic',
  },
  cancelledSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.warning + '30',
  },
  cancelledText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontStyle: 'italic',
  },
  emptyCard: {
    marginVertical: SPACING.xl,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth - 40,
    maxHeight: screenHeight * 0.8,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  statsModalContent: {
    width: screenWidth - 40,
    maxHeight: screenHeight * 0.85,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalBody: {
    maxHeight: screenHeight * 0.6,
    padding: SPACING.lg,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalDetailText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  skillChip: {
    backgroundColor: COLORS.primary + '20',
  },
  skillChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  achievementText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  modalActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  actionButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  detailedStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: (screenWidth - 120) / 2,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
    backgroundColor: 'white',
  },
  statCardNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  statCardLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressDetails: {
    marginTop: SPACING.lg,
  },
  progressDetailTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  metricLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    width: 120,
  },
  metricBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: SPACING.md,
  },
  metricValue: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    fontWeight: '600',
    width: 60,
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default TrainingHistory;