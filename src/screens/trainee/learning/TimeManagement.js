import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
  StatusBar,
  Alert,
  Animated,
  Platform,
} from 'react-native';
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
  TextInput,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14 },
  caption: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const TimeManagement = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, schedule, timeTracking } = useSelector(state => ({
    user: state.user,
    schedule: state.schedule || {},
    timeTracking: state.timeTracking || {},
  }));

  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [todayStats, setTodayStats] = useState({});
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDuration, setNewEventDuration] = useState('60');
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerPulse = useRef(new Animated.Value(1)).current;

  // Timer ref
  const timerInterval = useRef(null);

  // Mock data for schedule and time tracking
  const mockScheduleData = {
    today: [
      {
        id: '1',
        title: 'Morning Cardio',
        type: 'workout',
        startTime: '07:00',
        endTime: '08:00',
        duration: 60,
        category: 'Cardio',
        status: 'completed',
        coach: 'Sarah Johnson',
        location: 'Gym - Cardio Zone',
        notes: 'HIIT session - 30 minutes',
      },
      {
        id: '2',
        title: 'Strength Training',
        type: 'workout',
        startTime: '10:00',
        endTime: '11:30',
        duration: 90,
        category: 'Strength',
        status: 'scheduled',
        coach: 'Mike Rodriguez',
        location: 'Gym - Weight Room',
        notes: 'Upper body focus',
      },
      {
        id: '3',
        title: 'Nutrition Consultation',
        type: 'meeting',
        startTime: '14:00',
        endTime: '14:45',
        duration: 45,
        category: 'Nutrition',
        status: 'scheduled',
        coach: 'Emma Thompson',
        location: 'Virtual Meeting',
        notes: 'Weekly diet review',
      },
      {
        id: '4',
        title: 'Recovery Session',
        type: 'recovery',
        startTime: '19:00',
        endTime: '20:00',
        duration: 60,
        category: 'Recovery',
        status: 'scheduled',
        coach: 'Alex Chen',
        location: 'Recovery Room',
        notes: 'Stretching and mobility work',
      },
    ],
    week: [
      { day: 'Mon', workouts: 2, duration: 120, completed: 2 },
      { day: 'Tue', workouts: 3, duration: 150, completed: 3 },
      { day: 'Wed', workouts: 1, duration: 60, completed: 0 },
      { day: 'Thu', workouts: 2, duration: 90, completed: 1 },
      { day: 'Fri', workouts: 2, duration: 120, completed: 0 },
      { day: 'Sat', workouts: 1, duration: 90, completed: 0 },
      { day: 'Sun', workouts: 1, duration: 60, completed: 0 },
    ]
  };

  const mockTimeStats = {
    today: {
      totalWorkoutTime: 60,
      plannedTime: 225,
      completionRate: 26.7,
      activeTime: 45,
      restTime: 15,
    },
    week: {
      totalWorkoutTime: 450,
      plannedTime: 690,
      completionRate: 65.2,
      averagePerDay: 64.3,
      streakDays: 3,
    }
  };

  const mockGoals = [
    {
      id: '1',
      title: 'Weekly Workout Time',
      target: 300,
      current: 180,
      unit: 'minutes',
      category: 'time',
      deadline: '2025-09-02',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Training Sessions',
      target: 4,
      current: 3,
      unit: 'sessions',
      category: 'frequency',
      deadline: '2025-09-02',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Consistency Streak',
      target: 7,
      current: 3,
      unit: 'days',
      category: 'consistency',
      deadline: '2025-09-02',
      priority: 'high',
    },
  ];

  // Effects
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    loadScheduleData();
    setWeeklyGoals(mockGoals);
    setTodayStats(mockTimeStats);
  }, []);

  useEffect(() => {
    if (activeTimer) {
      startTimerPulse();
      timerInterval.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      stopTimerPulse();
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [activeTimer]);

  // Functions
  const loadScheduleData = useCallback(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadScheduleData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh schedule');
    } finally {
      setRefreshing(false);
    }
  }, [loadScheduleData]);

  const startTimerPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(timerPulse, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(timerPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopTimerPulse = () => {
    timerPulse.stopAnimation();
    timerPulse.setValue(1);
  };

  const handleStartTimer = (activity) => {
    setActiveTimer(activity);
    setTimerSeconds(0);
    Alert.alert('Timer Started! ⏱️', `Started timing: ${activity.title}`);
  };

  const handleStopTimer = () => {
    if (activeTimer) {
      const minutes = Math.floor(timerSeconds / 60);
      const seconds = timerSeconds % 60;
      Alert.alert(
        'Timer Stopped! ✅',
        `${activeTimer.title} completed in ${minutes}m ${seconds}s`,
        [
          {
            text: 'Save Session',
            onPress: () => {
              // Save the session data
              setActiveTimer(null);
              setTimerSeconds(0);
            }
          },
          {
            text: 'Discard',
            onPress: () => {
              setActiveTimer(null);
              setTimerSeconds(0);
            }
          }
        ]
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in-progress': return COLORS.warning;
      case 'scheduled': return COLORS.primary;
      case 'missed': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'workout': return 'fitness-center';
      case 'meeting': return 'people';
      case 'recovery': return 'spa';
      default: return 'event';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const renderHeader = () => (
    <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.headerGradient}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
        <Text style={[TEXT_STYLES.h1, styles.headerTitle]}>
          ⏰ Time Management
        </Text>
        <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
          Track your training schedule & time
        </Text>

        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayStats.today?.totalWorkoutTime || 0}m</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(todayStats.today?.completionRate || 0)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayStats.week?.streakDays || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {activeTimer && (
          <Animated.View style={[styles.activeTimerCard, { transform: [{ scale: timerPulse }] }]}>
            <View style={styles.timerInfo}>
              <Icon name="timer" size={20} color={COLORS.white} />
              <Text style={styles.timerTitle}>{activeTimer.title}</Text>
            </View>
            <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
            <TouchableOpacity style={styles.stopTimerButton} onPress={handleStopTimer}>
              <Icon name="stop" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </LinearGradient>
  );

  const renderViewModeSelector = () => (
    <Surface style={styles.viewModeSelector}>
      <View style={styles.viewModeButtons}>
        {['day', 'week', 'month'].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.viewModeButton,
              viewMode === mode && styles.activeViewMode
            ]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[
              styles.viewModeText,
              viewMode === mode && styles.activeViewModeText
            ]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dateNavigation}>
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 1);
            setSelectedDate(newDate);
          }}
        />
        <Text style={styles.selectedDateText}>
          {selectedDate.toDateString()}
        </Text>
        <IconButton
          icon="chevron-right"
          size={24}
          onPress={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 1);
            setSelectedDate(newDate);
          }}
        />
      </View>
    </Surface>
  );

  const renderTodaySchedule = () => (
    <Card style={styles.scheduleCard}>
      <Card.Title
        title="📅 Today's Schedule"
        subtitle={`${mockScheduleData.today.length} activities planned`}
        right={(props) => (
          <IconButton
            {...props}
            icon="add"
            onPress={() => setShowScheduleModal(true)}
          />
        )}
      />
      <Card.Content>
        <FlatList
          data={mockScheduleData.today}
          renderItem={renderScheduleItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </Card.Content>
    </Card>
  );

  const renderScheduleItem = ({ item }) => (
    <TouchableOpacity style={styles.scheduleItem}>
      <View style={styles.scheduleTimeColumn}>
        <Text style={styles.scheduleTime}>{item.startTime}</Text>
        <Text style={styles.scheduleDuration}>{item.duration}m</Text>
      </View>

      <View style={[styles.scheduleIndicator, { backgroundColor: getStatusColor(item.status) }]} />

      <View style={styles.scheduleContent}>
        <View style={styles.scheduleHeader}>
          <Icon 
            name={getActivityIcon(item.type)} 
            size={20} 
            color={getStatusColor(item.status)} 
          />
          <Text style={styles.scheduleTitle}>{item.title}</Text>
          <Chip
            mode="outlined"
            compact
            style={styles.statusChip}
            textStyle={{ fontSize: 10 }}
          >
            {item.status}
          </Chip>
        </View>

        <Text style={styles.scheduleCoach}>👨‍💼 {item.coach}</Text>
        <Text style={styles.scheduleLocation}>📍 {item.location}</Text>
        
        {item.notes && (
          <Text style={styles.scheduleNotes}>{item.notes}</Text>
        )}

        <View style={styles.scheduleActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleStartTimer(item)}
            disabled={activeTimer !== null}
          >
            <Icon name="play-arrow" size={16} color={COLORS.primary} />
            <Text style={styles.actionButtonText}>Start</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="edit" size={16} color={COLORS.textLight} />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="dots-vertical" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderWeeklyOverview = () => (
    <Card style={styles.overviewCard}>
      <Card.Title title="📊 Weekly Overview" />
      <Card.Content>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {mockScheduleData.week.map((day, index) => (
            <View key={index} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>{day.day}</Text>
              <View style={[
                styles.dayCircle,
                { backgroundColor: day.completed === day.workouts ? COLORS.success : COLORS.primary }
              ]}>
                <Text style={styles.dayValue}>{day.completed}/{day.workouts}</Text>
              </View>
              <Text style={styles.dayDuration}>{day.duration}m</Text>
              <ProgressBar
                progress={day.workouts > 0 ? day.completed / day.workouts : 0}
                color={COLORS.success}
                style={styles.dayProgress}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.weeklyStats}>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>
              {todayStats.week?.totalWorkoutTime || 0}m
            </Text>
            <Text style={styles.weeklyStatLabel}>Total Time</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>
              {Math.round(todayStats.week?.averagePerDay || 0)}m
            </Text>
            <Text style={styles.weeklyStatLabel}>Daily Avg</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Text style={styles.weeklyStatValue}>
              {Math.round(todayStats.week?.completionRate || 0)}%
            </Text>
            <Text style={styles.weeklyStatLabel}>Completion</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderGoalsSection = () => (
    <Card style={styles.goalsCard}>
      <Card.Title 
        title="🎯 Weekly Goals"
        right={(props) => (
          <IconButton
            {...props}
            icon="add"
            onPress={() => setShowGoalModal(true)}
          />
        )}
      />
      <Card.Content>
        {weeklyGoals.map((goal) => (
          <View key={goal.id} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(goal.priority) }]} />
            </View>
            
            <View style={styles.goalProgress}>
              <Text style={styles.goalValues}>
                {goal.current}/{goal.target} {goal.unit}
              </Text>
              <Text style={styles.goalPercentage}>
                {Math.round((goal.current / goal.target) * 100)}%
              </Text>
            </View>
            
            <ProgressBar
              progress={goal.current / goal.target}
              color={getPriorityColor(goal.priority)}
              style={styles.goalProgressBar}
            />
            
            <Text style={styles.goalDeadline}>
              Due: {new Date(goal.deadline).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderScheduleModal = () => (
    <Portal>
      <Modal
        visible={showScheduleModal}
        onDismiss={() => setShowScheduleModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>Add New Event</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowScheduleModal(false)}
            />
          </View>

          <ScrollView style={styles.modalBody}>
            <TextInput
              label="Event Title"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Duration (minutes)"
              value={newEventDuration}
              onChangeText={setNewEventDuration}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            <View style={styles.categorySelection}>
              <Text style={styles.sectionTitle}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Workout', 'Meeting', 'Recovery', 'Assessment'].map((category) => (
                  <Chip
                    key={category}
                    mode="outlined"
                    style={styles.categoryChip}
                    onPress={() => {}}
                  >
                    {category}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowScheduleModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  Alert.alert('Success! ✅', 'Event added to your schedule');
                  setShowScheduleModal(false);
                  setNewEventTitle('');
                  setNewEventDuration('60');
                }}
                style={styles.saveButton}
              >
                Add Event
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {renderViewModeSelector()}
        {renderTodaySchedule()}
        {renderWeeklyOverview()}
        {renderGoalsSection()}
      </ScrollView>

      {renderScheduleModal()}

      <FAB
        icon="timer"
        style={styles.fab}
        color={COLORS.white}
        onPress={() => {
          Alert.alert(
            'Quick Timer ⏱️',
            'Start a quick workout timer',
            [
              { text: '15 min', onPress: () => handleStartTimer({ title: 'Quick Session', duration: 15 }) },
              { text: '30 min', onPress: () => handleStartTimer({ title: 'Standard Session', duration: 30 }) },
              { text: '60 min', onPress: () => handleStartTimer({ title: 'Extended Session', duration: 60 }) },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
        }}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: SPACING.md,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    minWidth: 80,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  activeTimerCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: SPACING.md,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timerTitle: {
    color: COLORS.white,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  timerDisplay: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: SPACING.md,
  },
  stopTimerButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.sm,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  viewModeSelector: {
    margin: SPACING.md,
    padding: SPACING.md,
    elevation: 2,
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 25,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeViewMode: {
    backgroundColor: COLORS.primary,
  },
  viewModeText: {
    color: COLORS.textLight,
    fontWeight: '500',
  },
  activeViewModeText: {
    color: COLORS.white,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginHorizontal: SPACING.md,
  },
  scheduleCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  scheduleTimeColumn: {
    alignItems: 'center',
    marginRight: SPACING.md,
    minWidth: 50,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scheduleDuration: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  scheduleIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.md,
    marginTop: SPACING.xs,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  statusChip: {
    height: 20,
  },
  scheduleCoach: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  scheduleLocation: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  scheduleNotes: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  scheduleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.md,
  },
  actionButtonText: {
    fontSize: 10,
    marginLeft: SPACING.xs,
    color: COLORS.textLight,
  },
  overviewCard: {
    margin: SPACING.md,
    marginTop: 0,
  },
  dayColumn: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    minWidth: 60,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  dayValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dayDuration: {
    fontSize: 10,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  dayProgress: {
    width: 40,
    height: 4,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  weeklyStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  goalsCard: {
    margin: SPACING.md,
    marginTop: 0,
    marginBottom: SPACING.xl,
  },
  goalItem: {
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  goalProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalValues: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  goalPercentage: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.sm,
  },
  goalDeadline: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    flex: 1,
  },
  modalBody: {
    padding: SPACING.md,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  categorySelection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 0.45,
    borderColor: COLORS.border,
  },
  saveButton: {
    flex: 0.45,
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default TimeManagement;