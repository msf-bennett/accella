// Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  // Render detailed session view
  const renderDetailedSessionView = () => {
    if (!selectedSession) return null;

    const sessionProgress = selectedSession.exercises.length > 0 
      ? completedExercises.length / selectedSession.exercises.length 
      : 0;

    return (
      <View style={{ padding: SPACING.md }}>
        {/* Session Overview Card */}
        <Card style={{ marginBottom: SPACING.md, elevation: 4 }}>
          <Card.Content style={{ padding: SPACING.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
              <Avatar.Image
                size={50}
                source={{ uri: selectedSession.trainerAvatar }}
                style={{ marginRight: SPACING.md }}
              />
              <View style={{ flex: 1 }}>
                <Text style={TEXT_STYLES.subtitle}>{selectedSession.title}</Text>
                <Text style={TEXT_STYLES.caption}>with {selectedSession.trainer}</Text>
              </View>
              <Chip
                mode="outlined"
                style={{ backgroundColor: COLORS.primary }}
                textStyle={{ color: COLORS.white }}
              >
                {selectedSession.difficulty}
              </Chip>
            </View>

            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.md }]}>
              {selectedSession.description}
            </Text>

            {/* Session Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md }}>
              <View style={{ alignItems: 'center' }}>
                <Icon name="schedule" size={24} color={COLORS.primary} />
                <Text style={TEXT_STYLES.caption}>{selectedSession.duration}</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="fitness-center" size={24} color={COLORS.primary} />
                <Text style={TEXT_STYLES.caption}>{selectedSession.exercises.length} exercises</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Icon name="trending-up" size={24} color={COLORS.success} />
                <Text style={TEXT_STYLES.caption}>{Math.round(sessionProgress * 100)}% done</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={{ marginBottom: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs }}>
                <Text style={TEXT_STYLES.caption}>Progress</Text>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>
                  {completedExercises.length}/{selectedSession.exercises.length}
                </Text>
              </View>
              <View style={{ width: '100%', height: 8, backgroundColor: '#e0e0e0', borderRadius: 4 }}>
                <Animated.View 
                  style={{
                    height: '100%',
                    backgroundColor: COLORS.success,
                    borderRadius: 4,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }}
                />
              </View>
            </View>

            {/* Action Buttons */}
            {completedExercises.length === selecteimport React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  RefreshControl,
  Animated,
  Vibration,
  Alert,
  Dimensions,
  TouchableOpacity,
  Modal,
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
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#ffffff',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  accent: '#e91e63',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TodaysSessions = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(new Set());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Timer ref
  const timerRef = useRef(null);

  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const todaysSessions = useSelector(state => state.training.todaysSessions);
  const loading = useSelector(state => state.training.loading);
  const streakCount = useSelector(state => state.gamification.streakCount);
  const totalPoints = useSelector(state => state.gamification.totalPoints);
  const achievements = useSelector(state => state.gamification.achievements);

  // Mock data for demonstration (replace with Redux store data)
  const mockSessions = [
    {
      id: '1',
      title: 'Morning Cardio Blast 💪',
      trainer: 'Sarah Johnson',
      trainerAvatar: 'https://i.pravatar.cc/150?img=44',
      time: '08:00 AM',
      duration: '45 min',
      type: 'cardio',
      difficulty: 'intermediate',
      points: 50,
      status: 'upcoming',
      exercises: [
        {
          id: 'ex1',
          name: 'Jumping Jacks',
          sets: 3,
          reps: 30,
          rest: 30,
          instructions: 'Jump with feet apart, arms overhead, then back to start position',
          videoUrl: 'https://example.com/jumping-jacks-demo',
          completed: false,
          muscles: ['Legs', 'Core', 'Arms'],
        },
        {
          id: 'ex2',
          name: 'Burpees',
          sets: 3,
          reps: 10,
          rest: 60,
          instructions: 'Squat down, jump back to plank, do push-up, jump forward, jump up',
          videoUrl: 'https://example.com/burpees-demo',
          completed: false,
          muscles: ['Full Body', 'Core', 'Cardio'],
        },
        {
          id: 'ex3',
          name: 'Mountain Climbers',
          sets: 3,
          duration: 45,
          rest: 45,
          instructions: 'Start in plank, alternate bringing knees to chest quickly',
          videoUrl: 'https://example.com/mountain-climbers-demo',
          completed: false,
          muscles: ['Core', 'Arms', 'Legs'],
        },
      ],
      description: 'High-intensity cardio session to boost your metabolism',
      completion: 0,
      warmUp: {
        duration: 10,
        exercises: ['Dynamic stretches', 'Light cardio', 'Joint mobility'],
      },
      coolDown: {
        duration: 10,
        exercises: ['Static stretches', 'Deep breathing', 'Relaxation'],
      },
    },
    {
      id: '2',
      title: 'Strength Training Focus 🏋️',
      trainer: 'Mike Torres',
      trainerAvatar: 'https://i.pravatar.cc/150?img=33',
      time: '02:00 PM',
      duration: '60 min',
      type: 'strength',
      difficulty: 'advanced',
      points: 75,
      status: 'in-progress',
      exercises: [
        {
          id: 'ex4',
          name: 'Squats',
          sets: 4,
          reps: 12,
          rest: 90,
          instructions: 'Feet shoulder-width apart, squat down keeping knees aligned',
          videoUrl: 'https://example.com/squat-demo',
          completed: false,
          muscles: ['Quadriceps', 'Glutes', 'Core'],
        },
        {
          id: 'ex5',
          name: 'Deadlifts',
          sets: 4,
          reps: 8,
          rest: 120,
          instructions: 'Lift with straight back, hinge at hips, keep bar close to body',
          videoUrl: 'https://example.com/deadlift-demo',
          completed: false,
          muscles: ['Hamstrings', 'Glutes', 'Back'],
        },
        {
          id: 'ex6',
          name: 'Bench Press',
          sets: 4,
          reps: 10,
          rest: 90,
          instructions: 'Lower bar to chest, press up with control, keep core tight',
          videoUrl: 'https://example.com/bench-demo',
          completed: false,
          muscles: ['Chest', 'Triceps', 'Shoulders'],
        },
      ],
      description: 'Build muscle and increase your strength with compound movements',
      completion: 0.3,
      warmUp: {
        duration: 15,
        exercises: ['Dynamic warm-up', 'Activation exercises', 'Light weights'],
      },
      coolDown: {
        duration: 10,
        exercises: ['Cool-down stretches', 'Foam rolling'],
      },
    },
    {
      id: '3',
      title: 'Flexibility & Recovery 🧘',
      trainer: 'Emma Wilson',
      trainerAvatar: 'https://i.pravatar.cc/150?img=25',
      time: '06:00 PM',
      duration: '30 min',
      type: 'flexibility',
      difficulty: 'beginner',
      points: 25,
      status: 'upcoming',
      exercises: [
        {
          id: 'ex7',
          name: 'Cat-Cow Stretch',
          sets: 2,
          reps: 15,
          rest: 15,
          instructions: 'On hands and knees, arch and round your back alternately',
          videoUrl: 'https://example.com/cat-cow-demo',
          completed: false,
          muscles: ['Spine', 'Core'],
        },
        {
          id: 'ex8',
          name: 'Downward Dog',
          sets: 3,
          duration: 30,
          rest: 20,
          instructions: 'Form inverted V-shape, push through hands, lengthen spine',
          videoUrl: 'https://example.com/downward-dog-demo',
          completed: false,
          muscles: ['Shoulders', 'Hamstrings', 'Calves'],
        },
        {
          id: 'ex9',
          name: 'Child\'s Pose',
          sets: 1,
          duration: 60,
          rest: 0,
          instructions: 'Sit back on heels, extend arms forward, relax and breathe',
          videoUrl: 'https://example.com/childs-pose-demo',
          completed: false,
          muscles: ['Back', 'Hips'],
        },
      ],
      description: 'Gentle stretching and mobility work to aid recovery',
      completion: 0,
      warmUp: {
        duration: 5,
        exercises: ['Gentle movement', 'Breathing exercises'],
      },
      coolDown: {
        duration: 10,
        exercises: ['Meditation', 'Deep breathing', 'Savasana'],
      },
    },
  ];

  const motivationalQuotes = [
    'Every workout is progress! 🚀',
    'You\'re stronger than yesterday! 💪',
    'Champions train when they don\'t feel like it! 🏆',
    'Your only competition is who you were yesterday! ⭐',
    'Great things happen when you push your limits! 🔥',
    'Consistency beats perfection! 🎯',
    'Push yourself because no one else will! 💯',
  ];

  const dailyStats = {
    totalSessions: 3,
    completedSessions: 0,
    totalDuration: 135,
    earnedPoints: 0,
    streak: streakCount || 12,
  };

  // Effects
  useEffect(() => {
    initializeScreen();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (sessionStarted) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [sessionStarted]);

  useEffect(() => {
    // Animate progress when exercises are completed
    if (selectedSession) {
      const progress = completedExercises.length / selectedSession.exercises.length;
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [completedExercises, selectedSession]);

  // Animation functions
  const initializeScreen = useCallback(() => {
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for start button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, slideAnim, pulseAnim]);

  // Timer functions
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setSessionTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Dispatch action to fetch today's sessions
      // await dispatch(fetchTodaysSessions());
      Vibration.vibrate(50);
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    }
    setRefreshing(false);
  }, [dispatch]);

  // Filter sessions
  const filteredSessions = mockSessions.filter(session => {
    if (selectedFilter !== 'all' && session.type !== selectedFilter) return false;
    if (searchQuery && !session.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Session action handlers
  const handleStartSession = (session) => {
    setSelectedSession(session);
    setSessionStarted(true);
    setCompletedExercises([]);
    setSessionTimer(0);
    setCurrentExerciseIndex(0);
    Vibration.vibrate(100);
    Alert.alert(
      '🎯 Session Started!',
      `Let's crush this ${session.title}! Remember to stay hydrated and listen to your body.`,
      [{ text: 'Let\'s Go! 💪', style: 'default' }]
    );
  };

  const handleCompleteExercise = useCallback((exerciseId) => {
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises(prev => [...prev, exerciseId]);
      Vibration.vibrate(200);
      
      // Show celebration
      Alert.alert(
        '🎉 Exercise Completed!',
        `Great job! You're getting stronger! ${Math.floor(Math.random() * 3) + 5} XP earned!`,
        [{ text: 'Next Exercise 🔥', style: 'default' }]
      );

      // Move to next exercise
      if (selectedSession) {
        const nextIndex = Math.min(currentExerciseIndex + 1, selectedSession.exercises.length - 1);
        setCurrentExerciseIndex(nextIndex);
      }
    }
  }, [completedExercises, currentExerciseIndex, selectedSession]);

  const handleCompleteSession = (sessionId) => {
    Vibration.vibrate([100, 50, 100]);
    setCompletedSessions(prev => new Set([...prev, sessionId]));
    setSessionStarted(false);
    
    const completionRate = selectedSession ? 
      Math.round((completedExercises.length / selectedSession.exercises.length) * 100) : 100;

    Alert.alert(
      '🏆 Session Complete!',
      `Amazing work! You completed ${completionRate}% of today's workout.\n\n+${completionRate} XP earned!\n🔥 Streak: ${(streakCount || 0) + 1} days`,
      [
        { text: 'View Progress 📊', onPress: () => navigation.navigate('Progress') },
        { text: 'Awesome! 🎉', style: 'default' }
      ]
    );

    // Reset session state
    setSelectedSession(null);
    setCompletedExercises([]);
    setSessionTimer(0);
  };

  const handleSessionDetails = (session) => {
    navigation.navigate('SessionDetails', { session });
  };

  // Get session status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in-progress': return COLORS.warning;
      case 'upcoming': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  // Get difficulty color
  // Video modal component
  const VideoModal = () => (
    <Portal>
      <Modal
        visible={showVideoModal}
        onDismiss={() => setShowVideoModal(false)}
        animationType="slide"
      >
        <BlurView
          style={{ flex: 1 }}
          blurType="dark"
          blurAmount={10}
          reducedTransparencyFallbackColor={COLORS.text}
        >
          <View style={{ flex: 1, justifyContent: 'center', padding: SPACING.lg }}>
            <Card style={{ backgroundColor: COLORS.white }}>
              <Card.Content style={{ padding: SPACING.lg }}>
                <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
                  <Icon name="play-circle-filled" size={80} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.subtitle, { marginTop: SPACING.sm }]}>
                    Exercise Demonstration
                  </Text>
                  <Text style={TEXT_STYLES.caption}>
                    {selectedVideo?.name}
                  </Text>
                </View>
                <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.md }]}>
                  {selectedVideo?.instructions}
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    Alert.alert('Video Feature', 'Video player integration coming soon!');
                    setShowVideoModal(false);
                  }}
                  style={{ marginTop: SPACING.md }}
                  buttonColor={COLORS.primary}
                >
                  Play Video 🎬
                </Button>
              </Card.Content>
            </Card>
            <IconButton
              icon="close"
              size={30}
              iconColor={COLORS.white}
              style={{ position: 'absolute', top: 50, right: 20 }}
              onPress={() => setShowVideoModal(false)}
            />
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Render session card
  const renderSessionCard = (session, index) => {
    const isCompleted = completedSessions.has(session.id);
    const cardScale = useRef(new Animated.Value(1)).current;

    const animateCard = () => {
      Animated.sequence([
        Animated.timing(cardScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(cardScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    };

    return (
      <Animated.View
        key={session.id}
        style={{
          transform: [
            { translateY: slideAnim },
            { scale: cardScale }
          ],
          opacity: fadeAnim,
        }}
      >
        <Card
          style={{
            marginHorizontal: SPACING.md,
            marginVertical: SPACING.sm,
            elevation: 4,
            borderRadius: 16,
            overflow: 'hidden',
          }}
          onPress={() => {
            animateCard();
            handleSessionDetails(session);
          }}
        >
          <LinearGradient
            colors={isCompleted ? [COLORS.success, '#4CAF50'] : [COLORS.primary, COLORS.secondary]}
            style={{ height: 4 }}
          />
          
          <Card.Content style={{ padding: SPACING.md }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Avatar.Text 
                size={48} 
                label={session.trainer.split(' ').map(n => n[0]).join('')}
                style={{ backgroundColor: getStatusColor(session.status) }}
              />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={[TEXT_STYLES.h3, { marginBottom: 4 }]}>
                  {session.title}
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  with {session.trainer}
                </Text>
              </View>
              <IconButton
                icon={isCompleted ? 'check-circle' : 'play-circle'}
                iconColor={isCompleted ? COLORS.success : COLORS.primary}
                size={32}
                onPress={() => {
                  if (isCompleted) return;
                  if (session.status === 'in-progress') {
                    navigation.navigate('ActiveSession', { sessionId: session.id });
                  } else {
                    handleStartSession(session.id);
                  }
                }}
              />
            </View>

            {/* Session Info */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
              <Chip 
                icon="clock-outline" 
                style={{ backgroundColor: COLORS.background, marginRight: SPACING.xs, marginBottom: SPACING.xs }}
              >
                {session.time}
              </Chip>
              <Chip 
                icon="timer-outline" 
                style={{ backgroundColor: COLORS.background, marginRight: SPACING.xs, marginBottom: SPACING.xs }}
              >
                {session.duration}
              </Chip>
              <Chip 
                icon="trending-up" 
                style={{ backgroundColor: getDifficultyColor(session.difficulty) + '20', marginRight: SPACING.xs, marginBottom: SPACING.xs }}
                textStyle={{ color: getDifficultyColor(session.difficulty) }}
              >
                {session.difficulty}
              </Chip>
              <Chip 
                icon="star" 
                style={{ backgroundColor: COLORS.accent + '20', marginBottom: SPACING.xs }}
                textStyle={{ color: COLORS.accent }}
              >
                {session.points} pts
              </Chip>
            </View>

            {/* Progress Bar */}
            {session.completion > 0 && (
              <View style={{ marginBottom: SPACING.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={TEXT_STYLES.caption}>Progress</Text>
                  <Text style={TEXT_STYLES.caption}>{Math.round(session.completion * 100)}%</Text>
                </View>
                <ProgressBar
                  progress={session.completion}
                  color={COLORS.primary}
                  style={{ height: 6, borderRadius: 3 }}
                />
              </View>
            )}

            {/* Description */}
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontSize: 14 }]}>
              {session.description}
            </Text>

            {/* Exercises Preview */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.caption, { marginLeft: 4, flex: 1 }]}>
                {session.exercises.slice(0, 3).join(' • ')}
                {session.exercises.length > 3 && ' • +more'}
              </Text>
            </View>
          </Card.Content>

          {/* Action Buttons */}
          <Card.Actions style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.md }}>
            <Button
              mode="outlined"
              onPress={() => handleSessionDetails(session)}
              style={{ flex: 1, marginRight: SPACING.xs }}
            >
              Details
            </Button>
            {!isCompleted && (
              <Button
                mode="contained"
                onPress={() => {
                  if (session.status === 'in-progress') {
                    navigation.navigate('ActiveSession', { sessionId: session.id });
                  } else {
                    handleStartSession(session.id);
                  }
                }}
                style={{ flex: 1, marginLeft: SPACING.xs }}
                buttonColor={COLORS.primary}
              >
                {session.status === 'in-progress' ? 'Continue' : 'Start'}
              </Button>
            )}
          </Card.Actions>
        </Card>
      </Animated.View>
    );
  };

  // Render stats cards
  const renderStatsCard = () => (
    <Surface style={{
      margin: SPACING.md,
      borderRadius: 16,
      elevation: 4,
      overflow: 'hidden',
    }}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{ padding: SPACING.md }}
      >
        <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.sm }]}>
          Today's Progress 📊
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              {dailyStats.completedSessions}/{dailyStats.totalSessions}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Sessions
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              {dailyStats.totalDuration}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Total Min
            </Text>
          </View>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              🔥{dailyStats.streak}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Day Streak
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}
    >
      {['all', 'cardio', 'strength', 'flexibility'].map((filter) => (
        <Chip
          key={filter}
          selected={selectedFilter === filter}
          onPress={() => setSelectedFilter(filter)}
          style={{
            marginRight: SPACING.sm,
            backgroundColor: selectedFilter === filter ? COLORS.primary : COLORS.background,
          }}
          textStyle={{
            color: selectedFilter === filter ? 'white' : COLORS.text,
            textTransform: 'capitalize',
          }}
        >
          {filter === 'all' ? 'All Sessions' : filter}
        </Chip>
      ))}
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{ 
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.md,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
              Today's Sessions 💪
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
          <IconButton
            icon="search"
            iconColor="white"
            size={24}
            onPress={() => setShowFilterModal(true)}
          />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Stats Card */}
        {renderStatsCard()}

        {/* Filter Chips */}
        {renderFilterChips()}

        {/* Sessions List */}
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session, index) => renderSessionCard(session, index))
        ) : (
          <Card style={{ 
            margin: SPACING.md, 
            padding: SPACING.xl,
            alignItems: 'center',
            elevation: 2 
          }}>
            <Icon name="event-available" size={64} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, textAlign: 'center' }]}>
              No Sessions Found
            </Text>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.sm }]}>
              {selectedFilter === 'all' 
                ? "You're all caught up! Great work! 🎉" 
                : `No ${selectedFilter} sessions scheduled for today`
              }
            </Text>
          </Card>
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.accent,
        }}
        color="white"
        onPress={() => {
          Vibration.vibrate(50);
          Alert.alert(
            'Quick Actions ⚡',
            'Feature coming soon!',
            [{ text: 'Got it!' }]
          );
        }}
      />

      {/* Search Modal */}
      <Portal>
        {showFilterModal && (
          <BlurView
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            blurType="light"
            blurAmount={10}
          >
            <Surface style={{
              width: SCREEN_WIDTH - 32,
              borderRadius: 16,
              padding: SPACING.md,
              elevation: 8,
            }}>
              <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
                Search Sessions
              </Text>
              <Searchbar
                placeholder="Search by name, trainer, or exercise..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={{ marginBottom: SPACING.md }}
              />
              <Button
                mode="contained"
                onPress={() => setShowFilterModal(false)}
                buttonColor={COLORS.primary}
              >
                Apply Filter
              </Button>
            </Surface>
          </BlurView>
        )}
      </Portal>
    </View>
  );
};

export default TodaysSessions;