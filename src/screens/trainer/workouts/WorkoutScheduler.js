import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Modal,
  TextInput,
  FlatList,
  Vibration,
  Platform
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
  Searchbar,
  Portal,
  Modal as PaperModal,
  Divider,
  Badge,
  Switch,
  SegmentedButtons
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  info: '#3498db'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary }
};

const { width, height } = Dimensions.get('window');

const WorkoutScheduler = ({ navigation }) => {
  // State Management
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week', 'month', 'day'
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [clients, setClients] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [sessionTime, setSessionTime] = useState('');
  const [sessionDuration, setSessionDuration] = useState(60);
  const [repeatSession, setRepeatSession] = useState(false);
  const [repeatOptions, setRepeatOptions] = useState('weekly');
  const [searchQuery, setSearchQuery] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const scheduleData = useSelector(state => state.schedule);

  // Mock data
  const mockSessions = [
    {
      id: 1,
      clientId: 1,
      clientName: 'Sarah Johnson',
      clientAvatar: '👩‍💼',
      workoutId: 1,
      workoutTitle: 'HIIT Cardio Blast',
      date: '2024-08-21',
      time: '09:00',
      duration: 45,
      status: 'confirmed',
      type: 'personal',
      location: 'Gym Floor A',
      notes: 'Focus on form and breathing',
      recurring: true,
      recurringType: 'weekly'
    },
    {
      id: 2,
      clientId: 2,
      clientName: 'Mike Chen',
      clientAvatar: '👨‍💻',
      workoutId: 2,
      workoutTitle: 'Strength Training',
      date: '2024-08-21',
      time: '14:00',
      duration: 60,
      status: 'pending',
      type: 'personal',
      location: 'Weight Room',
      notes: 'First session - assessment needed',
      recurring: false
    },
    {
      id: 3,
      clientId: 3,
      clientName: 'Group Class',
      clientAvatar: '👥',
      workoutId: 3,
      workoutTitle: 'Yoga Flow',
      date: '2024-08-22',
      time: '18:00',
      duration: 75,
      status: 'confirmed',
      type: 'group',
      location: 'Studio B',
      notes: 'Max 15 participants',
      participants: 12,
      maxParticipants: 15,
      recurring: true,
      recurringType: 'weekly'
    },
    {
      id: 4,
      clientId: 1,
      clientName: 'Sarah Johnson',
      clientAvatar: '👩‍💼',
      workoutId: 4,
      workoutTitle: 'Core & Flexibility',
      date: '2024-08-23',
      time: '10:30',
      duration: 30,
      status: 'confirmed',
      type: 'personal',
      location: 'Mat Area',
      notes: 'Recovery session',
      recurring: false
    }
  ];

  const mockClients = [
    { id: 1, name: 'Sarah Johnson', avatar: '👩‍💼', sessions: 24, nextSession: '2024-08-21' },
    { id: 2, name: 'Mike Chen', avatar: '👨‍💻', sessions: 8, nextSession: '2024-08-21' },
    { id: 3, name: 'Emma Davis', avatar: '👩‍🎨', sessions: 16, nextSession: '2024-08-24' },
    { id: 4, name: 'Group Classes', avatar: '👥', sessions: 45, nextSession: '2024-08-22' }
  ];

  const mockWorkouts = [
    { id: 1, title: 'HIIT Cardio Blast', duration: 45, difficulty: 'Advanced' },
    { id: 2, title: 'Strength Training', duration: 60, difficulty: 'Intermediate' },
    { id: 3, title: 'Yoga Flow', duration: 75, difficulty: 'Beginner' },
    { id: 4, title: 'Core & Flexibility', duration: 30, difficulty: 'Beginner' }
  ];

  // Component Lifecycle
  useEffect(() => {
    initializeScreen();
  }, []);

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Functions
  const initializeScreen = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setScheduledSessions(mockSessions);
      setClients(mockClients);
      setWorkouts(mockWorkouts);
    } catch (error) {
      console.error('Error initializing scheduler:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await initializeScreen();
    setRefreshing(false);
  }, []);

  const handleDateChange = (direction) => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
    Vibration.vibrate(30);
  };

  const handleSessionPress = (session) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Session Details',
      `${session.workoutTitle}\nClient: ${session.clientName}\nTime: ${session.time}\nDuration: ${session.duration} min`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit Session', onPress: () => console.log('Edit session') },
        { text: 'Start Session', onPress: () => console.log('Start session') }
      ]
    );
  };

  const handleCreateSession = () => {
    setShowCreateModal(true);
    Vibration.vibrate(50);
  };

  const handleScheduleSession = () => {
    if (!selectedClient || !selectedWorkout || !sessionTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const newSession = {
      id: Date.now(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientAvatar: selectedClient.avatar,
      workoutId: selectedWorkout.id,
      workoutTitle: selectedWorkout.title,
      date: selectedDate.toISOString().split('T')[0],
      time: sessionTime,
      duration: sessionDuration,
      status: 'pending',
      type: 'personal',
      location: 'TBD',
      notes: '',
      recurring: repeatSession,
      recurringType: repeatSession ? repeatOptions : null
    };

    setScheduledSessions(prev => [...prev, newSession]);
    setShowCreateModal(false);
    
    // Reset form
    setSelectedClient(null);
    setSelectedWorkout(null);
    setSessionTime('');
    setSessionDuration(60);
    setRepeatSession(false);

    Alert.alert('Success!', 'Session scheduled successfully 🎉');
    Vibration.vibrate(100);
  };

  const getSessionsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledSessions.filter(session => session.date === dateStr);
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return weekDays;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  // Components
  const SessionCard = ({ session, style }) => (
    <TouchableOpacity onPress={() => handleSessionPress(session)} style={style}>
      <Card style={[styles.sessionCard, { borderLeftColor: getStatusColor(session.status) }]} elevation={2}>
        <Card.Content style={styles.sessionContent}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionClient}>
                {session.clientAvatar} {session.clientName}
              </Text>
              {session.type === 'group' && (
                <Text style={styles.participantsText}>
                  {session.participants}/{session.maxParticipants} participants
                </Text>
              )}
            </View>
            <View style={styles.sessionStatus}>
              <Chip 
                mode="outlined" 
                compact
                textStyle={{ fontSize: 10 }}
                style={[styles.statusChip, { borderColor: getStatusColor(session.status) }]}
              >
                {session.status.toUpperCase()}
              </Chip>
            </View>
          </View>

          <Text style={styles.sessionWorkout}>{session.workoutTitle}</Text>
          
          <View style={styles.sessionDetails}>
            <View style={styles.sessionDetailItem}>
              <Icon name="access-time" size={16} color={COLORS.textSecondary} />
              <Text style={styles.sessionDetailText}>{formatTime(session.time)}</Text>
            </View>
            <View style={styles.sessionDetailItem}>
              <Icon name="timer" size={16} color={COLORS.textSecondary} />
              <Text style={styles.sessionDetailText}>{session.duration} min</Text>
            </View>
            <View style={styles.sessionDetailItem}>
              <Icon name="location-on" size={16} color={COLORS.textSecondary} />
              <Text style={styles.sessionDetailText}>{session.location}</Text>
            </View>
            {session.recurring && (
              <View style={styles.sessionDetailItem}>
                <Icon name="repeat" size={16} color={COLORS.info} />
                <Text style={[styles.sessionDetailText, { color: COLORS.info }]}>
                  {session.recurringType}
                </Text>
              </View>
            )}
          </View>

          {session.notes && (
            <Text style={styles.sessionNotes} numberOfLines={1}>
              💭 {session.notes}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const WeekView = () => {
    const weekDays = getWeekDays();
    
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weekView}>
        {weekDays.map((day, index) => {
          const sessions = getSessionsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <View key={index} style={styles.dayColumn}>
              <Surface style={[styles.dayHeader, isToday && styles.todayHeader]} elevation={1}>
                <Text style={[styles.dayName, isToday && styles.todayText]}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dayDate, isToday && styles.todayText]}>
                  {day.getDate()}
                </Text>
                {sessions.length > 0 && (
                  <Badge style={styles.sessionBadge}>{sessions.length}</Badge>
                )}
              </Surface>
              
              <ScrollView style={styles.dayContent} showsVerticalScrollIndicator={false}>
                {sessions.map((session) => (
                  <SessionCard key={session.id} session={session} style={styles.weekSessionCard} />
                ))}
                {sessions.length === 0 && (
                  <View style={styles.emptyDay}>
                    <Text style={styles.emptyDayText}>No sessions</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const DayView = () => {
    const sessions = getSessionsForDate(selectedDate);
    const sortedSessions = sessions.sort((a, b) => a.time.localeCompare(b.time));

    return (
      <ScrollView style={styles.dayView} showsVerticalScrollIndicator={false}>
        {sortedSessions.map((session) => (
          <SessionCard key={session.id} session={session} style={styles.daySessionCard} />
        ))}
        {sortedSessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTitle}>No sessions scheduled</Text>
            <Text style={styles.emptySubtitle}>Tap the + button to schedule a session</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const CreateSessionModal = () => (
    <PaperModal
      visible={showCreateModal}
      onDismiss={() => setShowCreateModal(false)}
      contentContainerStyle={styles.modalContainer}
    >
      <BlurView intensity={95} style={styles.modalBlur}>
        <Card style={styles.createModal}>
          <Card.Title
            title="Schedule Session 📅"
            subtitle={`For ${formatDate(selectedDate)}`}
            left={(props) => <Avatar.Icon {...props} icon="event" />}
            right={(props) => (
              <IconButton
                {...props}
                icon="close"
                onPress={() => setShowCreateModal(false)}
              />
            )}
          />
          
          <ScrollView style={styles.modalContent}>
            <Card.Content>
              {/* Client Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Select Client *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.clientSelection}>
                    {clients.map((client) => (
                      <TouchableOpacity
                        key={client.id}
                        style={[
                          styles.clientChip,
                          selectedClient?.id === client.id && styles.selectedClientChip
                        ]}
                        onPress={() => setSelectedClient(client)}
                      >
                        <Text style={styles.clientEmoji}>{client.avatar}</Text>
                        <Text style={[
                          styles.clientName,
                          selectedClient?.id === client.id && styles.selectedClientName
                        ]}>
                          {client.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Workout Selection */}
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Select Workout *</Text>
                {workouts.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={[
                      styles.workoutOption,
                      selectedWorkout?.id === workout.id && styles.selectedWorkoutOption
                    ]}
                    onPress={() => setSelectedWorkout(workout)}
                  >
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutTitle}>{workout.title}</Text>
                      <Text style={styles.workoutMeta}>
                        {workout.duration} min • {workout.difficulty}
                      </Text>
                    </View>
                    <Icon 
                      name={selectedWorkout?.id === workout.id ? "radio-button-checked" : "radio-button-unchecked"}
                      size={24}
                      color={selectedWorkout?.id === workout.id ? COLORS.primary : COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time & Duration */}
              <View style={styles.formRow}>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Time *</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="09:00"
                    value={sessionTime}
                    onChangeText={setSessionTime}
                    keyboardType="default"
                  />
                </View>
                <View style={styles.formHalf}>
                  <Text style={styles.formLabel}>Duration (min)</Text>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="60"
                    value={sessionDuration.toString()}
                    onChangeText={(text) => setSessionDuration(parseInt(text) || 60)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Repeat Options */}
              <View style={styles.formSection}>
                <View style={styles.switchRow}>
                  <Text style={styles.formLabel}>Repeat Session</Text>
                  <Switch
                    value={repeatSession}
                    onValueChange={setRepeatSession}
                    color={COLORS.primary}
                  />
                </View>
                
                {repeatSession && (
                  <SegmentedButtons
                    value={repeatOptions}
                    onValueChange={setRepeatOptions}
                    buttons={[
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'biweekly', label: 'Bi-weekly' },
                      { value: 'monthly', label: 'Monthly' }
                    ]}
                    style={styles.segmentedButtons}
                  />
                )}
              </View>
            </Card.Content>
          </ScrollView>

          <Card.Actions style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleScheduleSession}>
              Schedule Session
            </Button>
          </Card.Actions>
        </Card>
      </BlurView>
    </PaperModal>
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Schedule 📅</Text>
              <Text style={styles.headerSubtitle}>
                {scheduledSessions.length} sessions this week
              </Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon="today"
                iconColor="#fff"
                size={24}
                onPress={() => setSelectedDate(new Date())}
              />
              <IconButton
                icon="tune"
                iconColor="#fff"
                size={24}
                onPress={() => Alert.alert('Filters', 'Feature coming soon!')}
              />
            </View>
          </View>

          <View style={styles.dateNavigation}>
            <IconButton
              icon="chevron-left"
              iconColor="#fff"
              size={28}
              onPress={() => handleDateChange('prev')}
            />
            <View style={styles.dateInfo}>
              <Text style={styles.dateText}>
                {viewMode === 'week' 
                  ? `Week of ${formatDate(getWeekDays()[0])}`
                  : formatDate(selectedDate)
                }
              </Text>
            </View>
            <IconButton
              icon="chevron-right"
              iconColor="#fff"
              size={28}
              onPress={() => handleDateChange('next')}
            />
          </View>

          <SegmentedButtons
            value={viewMode}
            onValueChange={setViewMode}
            buttons={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' }
            ]}
            style={styles.viewModeButtons}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.background, '#e8f0fe']}
          style={styles.container}
        >
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <View style={styles.loadingContent}>
            <Text style={styles.loadingEmoji}>📅</Text>
            <Text style={styles.loadingText}>Loading your schedule...</Text>
            <ProgressBar indeterminate color={COLORS.primary} style={styles.progressBar} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}

      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        {viewMode === 'week' && <WeekView />}
        {viewMode === 'day' && <DayView />}
        {viewMode === 'month' && (
          <View style={styles.monthView}>
            <Text style={styles.comingSoon}>Month view coming soon! 🚀</Text>
          </View>
        )}
      </Animated.View>

      {/* Quick Stats */}
      <Surface style={styles.quickStats} elevation={4}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{scheduledSessions.length}</Text>
            <Text style={styles.statLabel}>Total Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {scheduledSessions.filter(s => s.status === 'confirmed').length}
            </Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {scheduledSessions.filter(s => s.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </Surface>

      {/* FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleCreateSession}
        color="#fff"
      />

      {/* Modals */}
      <Portal>
        <CreateSessionModal />
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
  },
  header: {
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  viewModeButtons: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  weekView: {
    flex: 1,
  },
  dayColumn: {
    width: width / 7,
    height: height - 300,
  },
  dayHeader: {
    padding: SPACING.sm,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 2,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  todayHeader: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  dayDate: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    marginTop: 2,
  },
  todayText: {
    color: '#fff',
  },
  sessionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accent,
    fontSize: 8,
  },
  dayContent: {
    flex: 1,
    paddingHorizontal: 2,
  },
  emptyDay: {
    padding: SPACING.sm,
    alignItems: 'center',
  },
  emptyDayText: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
  },
  weekSessionCard: {
    marginBottom: SPACING.xs,
  },
  dayView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  daySessionCard: {
    marginBottom: SPACING.md,
  },
  monthView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoon: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  sessionContent: {
    paddingVertical: SPACING.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionClient: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  participantsText: {
    ...TEXT_STYLES.small,
    color: COLORS.info,
    marginTop: 2,
  },
  sessionStatus: {
    marginLeft: SPACING.sm,
  },
  statusChip: {
    height: 24,
    borderWidth: 1,
  },
  sessionWorkout: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
    marginBottom: SPACING.sm,
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.xs,
  },
  sessionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  sessionDetailText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  sessionNotes: {
    ...TEXT_STYLES.small,
    fontStyle: 'italic',
    backgroundColor: COLORS.background,
    padding: SPACING.xs,
    borderRadius: 6,
    marginTop: SPACING.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  quickStats: {
    position: 'absolute',
    bottom: 80,
    left: SPACING.md,
    right: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  createModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: height * 0.85,
  },
  modalContent: {
    maxHeight: height * 0.6,
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  formLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  clientSelection: {
    flexDirection: 'row',
    paddingRight: SPACING.md,
  },
  clientChip: {
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    alignItems: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedClientChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  clientEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  clientName: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedClientName: {
    color: '#fff',
  },
  workoutOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedWorkoutOption: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  workoutMeta: {
    ...TEXT_STYLES.caption,
    marginTop: 2,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  formHalf: {
    flex: 0.48,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  modalActions: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
};

export default WorkoutScheduler;
