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
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const TrainingCalendar = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week', 'month'
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const trainingSessions = useSelector(state => state.training.sessions) || [];
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
      loadTrainingData();
    }, [])
  );

  // Load training data
  const loadTrainingData = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        // Mock data would be loaded here
      }, 1000);
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTrainingData();
    setRefreshing(false);
  }, []);

  // Generate calendar dates for current week/month
  const getCalendarDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const dates = [];
    for (let i = 0; i < (viewMode === 'week' ? 7 : 35); i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Mock training sessions data
  const mockSessions = [
    {
      id: 1,
      date: new Date().toISOString().split('T')[0],
      title: 'Morning Football Practice',
      time: '08:00 - 10:00',
      type: 'Team Training',
      status: 'scheduled',
      coach: 'Coach Martinez',
      location: 'Main Field',
      intensity: 'High',
      completed: false,
    },
    {
      id: 2,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      title: 'Strength & Conditioning',
      time: '16:00 - 17:30',
      type: 'Individual Training',
      status: 'scheduled',
      coach: 'Trainer Johnson',
      location: 'Gym A',
      intensity: 'Medium',
      completed: false,
    },
    {
      id: 3,
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      title: 'Technical Skills',
      time: '15:00 - 16:30',
      type: 'Individual Training',
      status: 'completed',
      coach: 'Coach Rodriguez',
      location: 'Training Ground',
      intensity: 'Medium',
      completed: true,
    },
  ];

  // Get sessions for specific date
  const getSessionsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return mockSessions.filter(session => session.date === dateStr);
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
      case 'join':
        Alert.alert('Joining Session', 'Feature coming soon! 🚀');
        break;
      case 'feedback':
        navigation.navigate('SessionFeedback', { sessionId: selectedSession.id });
        break;
      case 'details':
        navigation.navigate('SessionDetails', { sessionId: selectedSession.id });
        break;
      default:
        Alert.alert('Action', 'Feature in development! ⚙️');
    }
    setModalVisible(false);
  };

  // Render calendar header
  const renderCalendarHeader = () => (
    <Surface style={styles.calendarHeader} elevation={2}>
      <View style={styles.headerControls}>
        <IconButton
          icon="chevron-left"
          size={28}
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(selectedDate.getDate() - (viewMode === 'week' ? 7 : 30));
            setSelectedDate(newDate);
          }}
        />
        
        <TouchableOpacity style={styles.dateTitle}>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </Text>
        </TouchableOpacity>

        <IconButton
          icon="chevron-right"
          size={28}
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(selectedDate.getDate() + (viewMode === 'week' ? 7 : 30));
            setSelectedDate(newDate);
          }}
        />
      </View>

      <View style={styles.viewToggle}>
        <Chip
          selected={viewMode === 'week'}
          onPress={() => setViewMode('week')}
          style={[styles.toggleChip, viewMode === 'week' && styles.activeChip]}
          textStyle={styles.chipText}
        >
          Week
        </Chip>
        <Chip
          selected={viewMode === 'month'}
          onPress={() => setViewMode('month')}
          style={[styles.toggleChip, viewMode === 'month' && styles.activeChip]}
          textStyle={styles.chipText}
        >
          Month
        </Chip>
      </View>
    </Surface>
  );

  // Render calendar grid
  const renderCalendarGrid = () => {
    const dates = getCalendarDates();
    const today = new Date().toDateString();

    return (
      <View style={styles.calendarGrid}>
        {viewMode === 'week' && (
          <View style={styles.weekDaysHeader}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.weekDayText}>{day}</Text>
            ))}
          </View>
        )}
        
        <View style={styles.datesContainer}>
          {dates.map((date, index) => {
            const isToday = date.toDateString() === today;
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const sessions = getSessionsForDate(date);
            const hasActiveSessions = sessions.length > 0;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateItem,
                  isToday && styles.todayDate,
                  isSelected && styles.selectedDate,
                  hasActiveSessions && styles.sessionDate,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dateNumber,
                  isToday && styles.todayText,
                  isSelected && styles.selectedText,
                ]}>
                  {date.getDate()}
                </Text>
                {hasActiveSessions && (
                  <View style={styles.sessionIndicator}>
                    <Text style={styles.sessionCount}>{sessions.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // Render session card
  const renderSessionCard = (session) => {
    const isCompleted = session.completed;
    const intensityColor = session.intensity === 'High' ? COLORS.error : 
                          session.intensity === 'Medium' ? COLORS.warning : COLORS.success;

    return (
      <TouchableOpacity
        key={session.id}
        onPress={() => handleSessionSelect(session)}
        activeOpacity={0.8}
      >
        <Card style={[styles.sessionCard, isCompleted && styles.completedCard]}>
          <Card.Content>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionTime}>{session.time}</Text>
              </View>
              <View style={styles.sessionStatus}>
                <Chip
                  mode="outlined"
                  compact
                  style={[styles.statusChip, { borderColor: intensityColor }]}
                  textStyle={{ color: intensityColor, fontSize: 12 }}
                >
                  {session.intensity}
                </Chip>
              </View>
            </View>

            <View style={styles.sessionDetails}>
              <View style={styles.detailItem}>
                <Icon name="person" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{session.coach}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="location-on" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{session.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{session.type}</Text>
              </View>
            </View>

            {isCompleted && (
              <View style={styles.completedBadge}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.completedText}>Completed ✓</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // Render session modal
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

              <View style={styles.modalBody}>
                <View style={styles.modalDetailItem}>
                  <Icon name="schedule" size={20} color={COLORS.primary} />
                  <Text style={styles.modalDetailText}>{selectedSession.time}</Text>
                </View>
                <View style={styles.modalDetailItem}>
                  <Icon name="person" size={20} color={COLORS.primary} />
                  <Text style={styles.modalDetailText}>{selectedSession.coach}</Text>
                </View>
                <View style={styles.modalDetailItem}>
                  <Icon name="location-on" size={20} color={COLORS.primary} />
                  <Text style={styles.modalDetailText}>{selectedSession.location}</Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                {!selectedSession.completed ? (
                  <Button
                    mode="contained"
                    onPress={() => handleSessionAction('join')}
                    style={styles.actionButton}
                    contentStyle={styles.buttonContent}
                  >
                    Join Session 🏃‍♂️
                  </Button>
                ) : (
                  <Button
                    mode="outlined"
                    onPress={() => handleSessionAction('feedback')}
                    style={styles.actionButton}
                    contentStyle={styles.buttonContent}
                  >
                    Leave Feedback 💭
                  </Button>
                )}
                <Button
                  mode="outlined"
                  onPress={() => handleSessionAction('details')}
                  style={styles.actionButton}
                  contentStyle={styles.buttonContent}
                >
                  View Details 📋
                </Button>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  // Render today's sessions
  const renderTodaysSessions = () => {
    const todaySessions = getSessionsForDate(new Date());
    
    if (todaySessions.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <View style={styles.emptyState}>
              <Icon name="event-available" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyTitle}>No sessions today</Text>
              <Text style={styles.emptySubtitle}>Enjoy your rest day! 😴</Text>
            </View>
          </Card.Content>
        </Card>
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Today's Sessions 🎯</Text>
        {todaySessions.map(renderSessionCard)}
      </View>
    );
  };

  // Render upcoming sessions
  const renderUpcomingSessions = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const upcomingSessions = mockSessions.filter(session => 
      new Date(session.date) > new Date() && !session.completed
    ).slice(0, 3);

    if (upcomingSessions.length === 0) return null;

    return (
      <View style={styles.upcomingSection}>
        <Text style={styles.sectionTitle}>Upcoming Sessions 📅</Text>
        {upcomingSessions.map(renderSessionCard)}
      </View>
    );
  };

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
          <Text style={styles.headerTitle}>Training Calendar 📅</Text>
          <Text style={styles.headerSubtitle}>
            Stay on track with your training! 💪
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
        {renderCalendarHeader()}
        {renderCalendarGrid()}
        
        <View style={styles.sessionsContainer}>
          {renderTodaysSessions()}
          {renderUpcomingSessions()}
        </View>
      </ScrollView>

      {renderSessionModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Add Session', 'Feature coming soon! 🚀')}
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
  calendarHeader: {
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateTitle: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  viewToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  toggleChip: {
    backgroundColor: COLORS.surface,
  },
  activeChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    ...TEXT_STYLES.caption,
  },
  calendarGrid: {
    margin: SPACING.md,
    marginTop: 0,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weekDayText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  datesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dateItem: {
    width: screenWidth / 7 - 4,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
    borderRadius: 8,
    position: 'relative',
  },
  todayDate: {
    backgroundColor: COLORS.primary + '20',
  },
  selectedDate: {
    backgroundColor: COLORS.primary,
  },
  sessionDate: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  dateNumber: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sessionIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCount: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sessionsContainer: {
    padding: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  sessionCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.8,
    backgroundColor: COLORS.success + '10',
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
  sessionTime: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  sessionStatus: {
    marginLeft: SPACING.sm,
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  sessionDetails: {
    marginTop: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  emptyCard: {
    marginBottom: SPACING.md,
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
  },
  upcomingSection: {
    marginTop: SPACING.lg,
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
    borderRadius: 16,
    padding: SPACING.lg,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    flex: 1,
  },
  modalBody: {
    marginBottom: SPACING.lg,
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
  modalActions: {
    gap: SPACING.sm,
  },
  actionButton: {
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default TrainingCalendar;