import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions,
  Animated,
  RefreshControl,
  TouchableOpacity,
  TextInput,
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
  ProgressBar,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

const { width, height } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#f44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#FF6B6B',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const LiveCoaching = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, isCoach } = useSelector(state => ({
    user: state.auth.user,
    isCoach: state.auth.user?.role === 'coach',
  }));

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [heartRateData, setHeartRateData] = useState([]);

  // Mock session data
  const [sessionData] = useState({
    id: 'live_001',
    title: 'HIIT Training Session',
    coach: {
      id: 'coach_001',
      name: 'Sarah Johnson',
      avatar: 'https://example.com/avatar1.jpg',
      specialization: 'HIIT Training',
    },
    participants: [
      { id: 'p1', name: 'Mike Chen', avatar: null, heartRate: 145, status: 'active' },
      { id: 'p2', name: 'Emma Davis', avatar: null, heartRate: 138, status: 'active' },
      { id: 'p3', name: 'John Smith', avatar: null, heartRate: 152, status: 'resting' },
    ],
    exercises: [
      { name: 'Burpees', duration: 45, rest: 15, completed: true },
      { name: 'Mountain Climbers', duration: 45, rest: 15, completed: true },
      { name: 'Jump Squats', duration: 45, rest: 15, completed: false, current: true },
      { name: 'Push-ups', duration: 45, rest: 15, completed: false },
      { name: 'High Knees', duration: 45, rest: 15, completed: false },
    ],
    metrics: {
      duration: '18:45',
      avgHeartRate: 145,
      caloriesBurned: 234,
      exercisesCompleted: 2,
      totalExercises: 5,
    }
  });

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Start session timer
    const timer = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: user.name,
        timestamp: new Date().toLocaleTimeString(),
        isCoach: isCoach,
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      Vibration.vibrate(50);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    Vibration.vibrate(100);
    Alert.alert('Voice Recording', 'Recording started! Feature coming soon.');
  };

  const stopRecording = () => {
    setIsRecording(false);
    Alert.alert('Voice Recording', 'Recording stopped! Feature coming soon.');
  };

  const markExerciseComplete = (exerciseIndex) => {
    Alert.alert('Exercise Completed', 'Great job! 🎉 Moving to next exercise.');
    Vibration.vibrate([100, 50, 100]);
  };

  const emergencyStop = () => {
    Alert.alert(
      'Emergency Stop',
      'Are you sure you want to end the session immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Session', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Avatar.Text
            size={40}
            label={sessionData.coach.name.split(' ').map(n => n[0]).join('')}
            style={styles.coachAvatar}
          />
          <View style={styles.sessionInfo}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {sessionData.title}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Coach: {sessionData.coach.name}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Surface style={styles.timerContainer}>
            <Icon name="timer" size={16} color={COLORS.primary} />
            <Text style={[TEXT_STYLES.body, { marginLeft: 4, fontWeight: 'bold' }]}>
              {formatTime(sessionTimer)}
            </Text>
          </Surface>
          <IconButton
            icon="emergency"
            iconColor={COLORS.error}
            size={24}
            onPress={emergencyStop}
            style={styles.emergencyButton}
          />
        </View>
      </View>
      
      <View style={styles.participantsRow}>
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.9)' }]}>
          👥 {sessionData.participants.length} participants
        </Text>
        <View style={styles.participantAvatars}>
          {sessionData.participants.slice(0, 3).map((participant, index) => (
            <Avatar.Text
              key={participant.id}
              size={24}
              label={participant.name[0]}
              style={[styles.participantAvatar, { marginLeft: index > 0 ? -8 : 0 }]}
            />
          ))}
          {sessionData.participants.length > 3 && (
            <Avatar.Text
              size={24}
              label={`+${sessionData.participants.length - 3}`}
              style={[styles.participantAvatar, { marginLeft: -8 }]}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );

  const renderCurrentExercise = () => (
    <Animated.View
      style={[
        styles.currentExerciseCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#FF6B6B', '#FF8E8E']}
        style={styles.exerciseGradient}
      >
        <View style={styles.exerciseHeader}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Current Exercise
          </Text>
          <Chip
            icon="play-arrow"
            mode="flat"
            textStyle={{ color: 'white', fontWeight: 'bold' }}
            style={styles.activeChip}
          >
            ACTIVE
          </Chip>
        </View>
        
        <Text style={[TEXT_STYLES.h1, { color: 'white', textAlign: 'center', marginVertical: SPACING.md }]}>
          🏃‍♂️ Jump Squats
        </Text>
        
        <View style={styles.exerciseStats}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Duration
            </Text>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>45s</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Rest After
            </Text>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>15s</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Progress
            </Text>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>3/5</Text>
          </View>
        </View>

        <ProgressBar
          progress={0.6}
          color="white"
          style={styles.progressBar}
        />

        {isCoach && (
          <Button
            mode="contained"
            onPress={() => markExerciseComplete(2)}
            style={styles.completeButton}
            labelStyle={{ color: COLORS.primary, fontWeight: 'bold' }}
          >
            Mark Complete ✓
          </Button>
        )}
      </LinearGradient>
    </Animated.View>
  );

  const renderLiveMetrics = () => (
    <Card style={styles.metricsCard}>
      <View style={styles.metricsHeader}>
        <Text style={TEXT_STYLES.h3}>📊 Live Metrics</Text>
        <IconButton
          icon={showMetrics ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          onPress={() => setShowMetrics(!showMetrics)}
        />
      </View>
      
      {showMetrics && (
        <View style={styles.metricsContent}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Icon name="favorite" size={24} color={COLORS.error} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Avg Heart Rate</Text>
              <Text style={TEXT_STYLES.h3}>{sessionData.metrics.avgHeartRate} bpm</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="local-fire-department" size={24} color={COLORS.warning} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Calories Burned</Text>
              <Text style={TEXT_STYLES.h3}>{sessionData.metrics.caloriesBurned}</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="fitness-center" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>Exercises Done</Text>
              <Text style={TEXT_STYLES.h3}>
                {sessionData.metrics.exercisesCompleted}/{sessionData.metrics.totalExercises}
              </Text>
            </View>
          </View>

          {isCoach && (
            <View style={styles.participantMetrics}>
              <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontWeight: 'bold' }]}>
                Participant Heart Rates
              </Text>
              {sessionData.participants.map((participant) => (
                <View key={participant.id} style={styles.participantRow}>
                  <Avatar.Text
                    size={32}
                    label={participant.name[0]}
                  />
                  <Text style={[TEXT_STYLES.body, { flex: 1, marginLeft: SPACING.sm }]}>
                    {participant.name}
                  </Text>
                  <Chip
                    icon="favorite"
                    mode="outlined"
                    compact
                    textStyle={{ fontSize: 12 }}
                    style={[
                      styles.heartRateChip,
                      {
                        borderColor: participant.heartRate > 150 ? COLORS.error :
                                   participant.heartRate > 140 ? COLORS.warning : COLORS.success,
                      }
                    ]}
                  >
                    {participant.heartRate} bpm
                  </Chip>
                  <Chip
                    mode="flat"
                    compact
                    textStyle={{ fontSize: 10 }}
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: participant.status === 'active' ? 
                          COLORS.success : COLORS.warning,
                      }
                    ]}
                  >
                    {participant.status.toUpperCase()}
                  </Chip>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );

  const renderChatSection = () => (
    <Card style={styles.chatCard}>
      <View style={styles.chatHeader}>
        <Text style={TEXT_STYLES.h3}>💬 Live Chat</Text>
        <Chip
          mode="flat"
          compact
          style={styles.messageCount}
        >
          {messages.length} messages
        </Chip>
      </View>

      <ScrollView 
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Icon name="chat-bubble-outline" size={48} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
              No messages yet. Start the conversation! 👋
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageItem,
                {
                  alignSelf: message.sender === user.name ? 'flex-end' : 'flex-start',
                  backgroundColor: message.isCoach ? COLORS.primary : 
                                 message.sender === user.name ? COLORS.accent : COLORS.surface,
                },
              ]}
            >
              <Text style={[
                TEXT_STYLES.caption,
                {
                  color: message.isCoach || message.sender === user.name ? 'white' : COLORS.text,
                  marginBottom: 2,
                }
              ]}>
                {message.sender} • {message.timestamp}
              </Text>
              <Text style={[
                TEXT_STYLES.body,
                {
                  color: message.isCoach || message.sender === user.name ? 'white' : COLORS.text,
                }
              ]}>
                {message.text}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <IconButton
          icon="send"
          iconColor={COLORS.primary}
          size={24}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        />
        <IconButton
          icon={isRecording ? "stop" : "mic"}
          iconColor={isRecording ? COLORS.error : COLORS.primary}
          size={24}
          onPress={isRecording ? stopRecording : startRecording}
          style={[
            styles.micButton,
            isRecording && { backgroundColor: 'rgba(244, 67, 54, 0.1)' },
          ]}
        />
      </View>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.quickActionsCard}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>⚡ Quick Actions</Text>
      
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Feature Coming Soon', 'Share workout feature will be available soon! 🚀')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={styles.actionGradient}
          >
            <Icon name="share" size={24} color="white" />
            <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
              Share Workout
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Feature Coming Soon', 'Take photo feature will be available soon! 📸')}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.actionGradient}
          >
            <Icon name="camera-alt" size={24} color="white" />
            <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
              Take Photo
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Feature Coming Soon', 'Add note feature will be available soon! 📝')}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.actionGradient}
          >
            <Icon name="note-add" size={24} color="white" />
            <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
              Add Note
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('Feature Coming Soon', 'Settings will be available soon! ⚙️')}
        >
          <LinearGradient
            colors={['#9C27B0', '#7B1FA2']}
            style={styles.actionGradient}
          >
            <Icon name="settings" size={24} color="white" />
            <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: 4 }]}>
              Settings
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
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
        {renderCurrentExercise()}
        {renderLiveMetrics()}
        {renderChatSection()}
        {renderQuickActions()}
      </ScrollView>

      <FAB
        icon="pause"
        label="Pause Session"
        style={styles.fab}
        onPress={() => Alert.alert('Session Paused', 'Session has been paused. Tap to resume.')}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coachAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sessionInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  emergencyButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  participantsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  currentExerciseCard: {
    marginVertical: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  exerciseGradient: {
    padding: SPACING.lg,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  activeChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  completeButton: {
    backgroundColor: 'white',
    borderRadius: 25,
  },
  metricsCard: {
    marginVertical: SPACING.sm,
    padding: SPACING.md,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricsContent: {
    marginTop: SPACING.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  participantMetrics: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  heartRateChip: {
    marginRight: SPACING.xs,
  },
  statusChip: {
    marginLeft: SPACING.xs,
  },
  chatCard: {
    marginVertical: SPACING.sm,
    maxHeight: height * 0.4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  messageCount: {
    backgroundColor: COLORS.background,
  },
  messagesContainer: {
    maxHeight: 200,
    paddingHorizontal: SPACING.md,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  messageItem: {
    maxWidth: '80%',
    padding: SPACING.sm,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  micButton: {
    marginLeft: SPACING.xs,
  },
  quickActionsCard: {
    marginVertical: SPACING.sm,
    padding: SPACING.md,
    marginBottom: 100, // Space for FAB
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  actionGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default LiveCoaching;