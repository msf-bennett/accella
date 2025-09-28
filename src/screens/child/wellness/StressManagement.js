import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Vibration,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Share,
  Platform,
  Linking,
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
  Searchbar,
  TextInput,
  Snackbar,
  Badge,
  List,
  Divider,
  Switch,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '@react-native-blur/android';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  accent: '#e74c3c',
  gradient: ['#667eea', '#764ba2'],
  mindfulness: '#9C27B0',
  sleep: '#3F51B5',
  nutrition: '#FF9800',
  exercise: '#4CAF50',
  social: '#E91E63',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textLight },
  small: { fontSize: 12, color: COLORS.textLight },
};

const { width, height } = Dimensions.get('window');

const StressManagement = ({ navigation, route }) => {
  // Redux State
  const dispatch = useDispatch();
  const { user, isLoading, coaches, notifications } = useSelector(state => ({
    user: state.auth.user,
    isLoading: state.ui.isLoading,
    coaches: state.coaches.list,
    notifications: state.notifications.list,
  }));

  // Component State - Basic
  const [currentActivity, setCurrentActivity] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [activeModal, setActiveModal] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Wellness State
  const [wellnessPoints, setWellnessPoints] = useState(user?.wellnessPoints || 0);
  const [streakCount, setStreakCount] = useState(user?.wellnessStreak || 0);
  const [wellnessLevel, setWellnessLevel] = useState(user?.wellnessLevel || 1);
  const [selectedMood, setSelectedMood] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);

  // Breathing Exercise State
  const [breathingCount, setBreathingCount] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingType, setBreathingType] = useState('4-7-8'); // 4-7-8, box, calm
  const [breathingSession, setBreathingSession] = useState(0);

  // Meditation State
  const [meditationTimer, setMeditationTimer] = useState(300); // 5 minutes default
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationType, setMeditationType] = useState('mindfulness');
  const [completedSessions, setCompletedSessions] = useState(user?.meditationSessions || 0);

  // Gratitude & Journal State
  const [gratitudeList, setGratitudeList] = useState([]);
  const [newGratitude, setNewGratitude] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  const [newJournalEntry, setNewJournalEntry] = useState('');

  // Sleep & Recovery State
  const [sleepHours, setSleepHours] = useState(8);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [bedtimeReminder, setBedtimeReminder] = useState(true);

  // Social & Support State
  const [supportConnections, setSupportConnections] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);

  // Gamification State
  const [achievements, setAchievements] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState({
    meditation: { target: 7, current: 3 },
    mood: { target: 7, current: 5 },
    gratitude: { target: 3, current: 1 },
    sleep: { target: 56, current: 42 }
  });

  // Animation References
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Load data on mount
  useEffect(() => {
    loadWellnessData();
    setupAnimations();
  }, []);

  const loadWellnessData = async () => {
    try {
      const data = await AsyncStorage.getItem('wellnessData');
      if (data) {
        const parsed = JSON.parse(data);
        setMoodHistory(parsed.moodHistory || []);
        setGratitudeList(parsed.gratitudeList || []);
        setJournalEntries(parsed.journalEntries || []);
        setAchievements(parsed.achievements || []);
      }
    } catch (error) {
      console.log('Error loading wellness data:', error);
    }
  };

  const saveWellnessData = async (data) => {
    try {
      await AsyncStorage.setItem('wellnessData', JSON.stringify(data));
    } catch (error) {
      console.log('Error saving wellness data:', error);
    }
  };

  const setupAnimations = () => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for notifications
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
  };

  // Breathing exercise timer with different patterns
  useEffect(() => {
    let interval = null;
    if (isBreathingActive) {
      const patterns = {
        '4-7-8': { inhale: 4, hold: 7, exhale: 8 },
        'box': { inhale: 4, hold: 4, exhale: 4, pause: 4 },
        'calm': { inhale: 4, exhale: 6 }
      };
      
      const pattern = patterns[breathingType];
      const phase = breathingPhase;
      const duration = pattern[phase] || 4;
      
      interval = setInterval(() => {
        setBreathingCount(count => {
          if (count >= duration - 1) {
            // Move to next phase
            if (breathingType === '4-7-8') {
              if (phase === 'inhale') setBreathingPhase('hold');
              else if (phase === 'hold') setBreathingPhase('exhale');
              else setBreathingPhase('inhale');
            } else if (breathingType === 'box') {
              if (phase === 'inhale') setBreathingPhase('hold');
              else if (phase === 'hold') setBreathingPhase('exhale');
              else if (phase === 'exhale') setBreathingPhase('pause');
              else setBreathingPhase('inhale');
            } else {
              setBreathingPhase(phase === 'inhale' ? 'exhale' : 'inhale');
            }
            return 0;
          }
          return count + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, breathingPhase, breathingType]);

  // Meditation timer
  useEffect(() => {
    let interval = null;
    if (isMeditating && meditationTimer > 0) {
      interval = setInterval(() => {
        setMeditationTimer(timer => {
          if (timer <= 1) {
            setIsMeditating(false);
            setCompletedSessions(prev => prev + 1);
            showSnackbar('Meditation session completed! 🧘‍♀️');
            Vibration.vibrate([100, 50, 100]);
            return 300; // Reset to 5 minutes
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isMeditating, meditationTimer]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWellnessPoints(prev => prev + 5);
      showSnackbar('Wellness data refreshed! +5 points');
      Vibration.vibrate(100);
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh wellness data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const activities = [
    {
      id: 'breathing',
      name: 'Breathing',
      icon: 'air',
      color: COLORS.primary,
      points: 15,
      description: 'Guided breathing exercises',
      category: 'Mindfulness',
      duration: '2-10 min',
      difficulty: 'Beginner'
    },
    {
      id: 'meditation',
      name: 'Meditation',
      icon: 'self-improvement',
      color: COLORS.mindfulness,
      points: 25,
      description: 'Mindfulness meditation sessions',
      category: 'Mindfulness',
      duration: '5-30 min',
      difficulty: 'All Levels'
    },
    {
      id: 'mood',
      name: 'Mood Check',
      icon: 'sentiment-satisfied-alt',
      color: COLORS.warning,
      points: 10,
      description: 'Track daily emotions',
      category: 'Mental Health',
      duration: '1 min',
      difficulty: 'Beginner'
    },
    {
      id: 'gratitude',
      name: 'Gratitude',
      icon: 'favorite',
      color: COLORS.accent,
      points: 12,
      description: 'Practice gratitude journaling',
      category: 'Positivity',
      duration: '3-5 min',
      difficulty: 'Beginner'
    },
    {
      id: 'sleep',
      name: 'Sleep Tracker',
      icon: 'bedtime',
      color: COLORS.sleep,
      points: 20,
      description: 'Monitor sleep patterns',
      category: 'Recovery',
      duration: 'Nightly',
      difficulty: 'Beginner'
    },
    {
      id: 'journal',
      name: 'Journal',
      icon: 'book',
      color: COLORS.success,
      points: 18,
      description: 'Reflect and write thoughts',
      category: 'Self-Care',
      duration: '5-15 min',
      difficulty: 'All Levels'
    },
    {
      id: 'social',
      name: 'Connect',
      icon: 'people',
      color: COLORS.social,
      points: 15,
      description: 'Social wellness activities',
      category: 'Social',
      duration: 'Varies',
      difficulty: 'All Levels'
    },
    {
      id: 'emergency',
      name: 'SOS Support',
      icon: 'emergency',
      color: COLORS.error,
      points: 0,
      description: 'Crisis support resources',
      category: 'Emergency',
      duration: 'Immediate',
      difficulty: 'Critical'
    }
  ];

  const moods = [
    { emoji: '😊', label: 'Excellent', color: COLORS.success, value: 5 },
    { emoji: '🙂', label: 'Good', color: COLORS.primary, value: 4 },
    { emoji: '😐', label: 'Neutral', color: COLORS.warning, value: 3 },
    { emoji: '😟', label: 'Stressed', color: '#FF7043', value: 2 },
    { emoji: '😢', label: 'Struggling', color: COLORS.error, value: 1 },
  ];

  const meditationTypes = [
    { id: 'mindfulness', name: 'Mindfulness', description: 'Present moment awareness' },
    { id: 'loving-kindness', name: 'Loving Kindness', description: 'Compassion meditation' },
    { id: 'body-scan', name: 'Body Scan', description: 'Physical awareness practice' },
    { id: 'breathing', name: 'Breath Focus', description: 'Concentrated breathing' },
    { id: 'visualization', name: 'Visualization', description: 'Guided imagery' }
  ];

  const handleActivityStart = useCallback((activityId) => {
    setCurrentActivity(activityId);
    Vibration.vibrate(50);
    
    const activity = activities.find(a => a.id === activityId);
    if (activity && activity.points > 0) {
      setWellnessPoints(prev => prev + activity.points);
      
      // Update streak
      const today = new Date().toDateString();
      const lastActivity = user?.lastWellnessActivity;
      if (lastActivity !== today) {
        setStreakCount(prev => prev + 1);
      }
      
      // Check for level up
      const newLevel = Math.floor((wellnessPoints + activity.points) / 100) + 1;
      if (newLevel > wellnessLevel) {
        setWellnessLevel(newLevel);
        showSnackbar(`Level up! You're now level ${newLevel}! 🎉`);
      }
    }
  }, [activities, user, wellnessPoints, wellnessLevel]);

  const handleMoodSelection = useCallback((mood) => {
    setSelectedMood(mood.label);
    setWellnessPoints(prev => prev + 10);
    
    const moodEntry = {
      mood: mood.value,
      label: mood.label,
      timestamp: new Date().toISOString(),
      notes: ''
    };
    
    setMoodHistory(prev => {
      const updated = [moodEntry, ...prev.slice(0, 29)]; // Keep last 30 entries
      saveWellnessData({ moodHistory: updated, gratitudeList, journalEntries, achievements });
      return updated;
    });
    
    showSnackbar(`Mood logged: ${mood.label} +10 points`);
    Vibration.vibrate(100);
    
    dispatch({
      type: 'LOG_MOOD',
      payload: moodEntry
    });
  }, [gratitudeList, journalEntries, achievements]);

  const addGratitude = () => {
    if (newGratitude.trim()) {
      const gratitudeEntry = {
        text: newGratitude.trim(),
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };
      
      setGratitudeList(prev => {
        const updated = [gratitudeEntry, ...prev];
        saveWellnessData({ gratitudeList: updated, moodHistory, journalEntries, achievements });
        return updated;
      });
      
      setNewGratitude('');
      setWellnessPoints(prev => prev + 12);
      showSnackbar('Gratitude added! +12 points 🙏');
    }
  };

  const addJournalEntry = () => {
    if (newJournalEntry.trim()) {
      const entry = {
        text: newJournalEntry.trim(),
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
        mood: selectedMood || 'neutral'
      };
      
      setJournalEntries(prev => {
        const updated = [entry, ...prev];
        saveWellnessData({ journalEntries: updated, moodHistory, gratitudeList, achievements });
        return updated;
      });
      
      setNewJournalEntry('');
      setWellnessPoints(prev => prev + 18);
      showSnackbar('Journal entry saved! +18 points 📝');
    }
  };

  const startMeditation = (duration, type) => {
    setMeditationTimer(duration);
    setMeditationType(type);
    setIsMeditating(true);
    showSnackbar(`Starting ${duration / 60} minute ${type} meditation`);
  };

  const shareProgress = async () => {
    try {
      const message = `🧘‍♀️ Wellness Update:\n• Level: ${wellnessLevel}\n• Points: ${wellnessPoints}\n• Streak: ${streakCount} days\n• Sessions: ${completedSessions}\n\nKeeping my mental health a priority! 💪`;
      await Share.share({ message });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const openEmergencySupport = () => {
    Alert.alert(
      'Emergency Support 🆘',
      'If you\'re in crisis, please reach out for help immediately.',
      [
        { text: 'Crisis Hotline', onPress: () => Linking.openURL('tel:988') },
        { text: 'Text Support', onPress: () => Linking.openURL('sms:741741') },
        { text: 'Emergency Services', onPress: () => Linking.openURL('tel:911'), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={COLORS.gradient}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
              Wellness Hub 🧘‍♀️
            </Text>
            <Text style={styles.headerSubtitle}>
              Level {wellnessLevel} • {wellnessPoints} points
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Surface style={styles.notificationBadge}>
              <IconButton
                icon="notifications"
                size={20}
                iconColor="white"
                onPress={() => setActiveModal('notifications')}
              />
              {notifications.length > 0 && (
                <Badge size={18} style={styles.badge}>
                  {notifications.length}
                </Badge>
              )}
            </Surface>
            <Avatar.Text
              size={40}
              label={user?.name?.charAt(0) || 'U'}
              style={styles.avatar}
            />
          </View>
        </View>
        
        <View style={styles.streakContainer}>
          <Icon name="local-fire-department" size={20} color="#FF6B35" />
          <Text style={styles.streakText}>
            {streakCount} day streak! Keep going! 🔥
          </Text>
          <TouchableOpacity onPress={shareProgress}>
            <Icon name="share" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        
        <ProgressBar
          progress={(wellnessPoints % 100) / 100}
          color="rgba(255,255,255,0.8)"
          style={styles.levelProgress}
        />
        <Text style={styles.levelText}>
          {100 - (wellnessPoints % 100)} points to level {wellnessLevel + 1}
        </Text>
      </View>
    </LinearGradient>
  );

  const renderDashboard = () => (
    <View style={styles.dashboardContainer}>
      {/* Quick Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.statsTitle]}>Today's Wellness</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="mood" size={24} color={COLORS.warning} />
              <Text style={styles.statValue}>
                {moodHistory[0]?.label || 'Not set'}
              </Text>
              <Text style={styles.statLabel}>Mood</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="local-fire-department" size={24} color="#FF6B35" />
              <Text style={styles.statValue}>{streakCount}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="self-improvement" size={24} color={COLORS.mindfulness} />
              <Text style={styles.statValue}>{completedSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="bedtime" size={24} color={COLORS.sleep} />
              <Text style={styles.statValue}>{sleepHours}h</Text>
              <Text style={styles.statLabel}>Sleep</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Weekly Goals */}
      <Card style={styles.goalsCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.goalsTitle]}>Weekly Goals 🎯</Text>
          {Object.entries(weeklyGoals).map(([key, goal]) => (
            <View key={key} style={styles.goalItem}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalName}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
                <Text style={styles.goalProgress}>
                  {goal.current}/{goal.target}
                </Text>
              </View>
              <ProgressBar
                progress={goal.current / goal.target}
                color={goal.current >= goal.target ? COLORS.success : COLORS.primary}
                style={styles.goalProgressBar}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Recent Activities */}
      <Card style={styles.recentCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.recentTitle]}>Recent Activities</Text>
          {moodHistory.slice(0, 3).map((mood, index) => (
            <List.Item
              key={index}
              title={`Mood: ${mood.label}`}
              description={new Date(mood.timestamp).toLocaleDateString()}
              left={() => <Text style={styles.moodEmoji}>{moods.find(m => m.value === mood.mood)?.emoji}</Text>}
            />
          ))}
          {gratitudeList.slice(0, 2).map((item, index) => (
            <List.Item
              key={`gratitude-${index}`}
              title="Gratitude Entry"
              description={item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text}
              left={() => <Icon name="favorite" size={24} color={COLORS.accent} />}
            />
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderBreathingExercise = () => (
    <View style={styles.breathingContainer}>
      <Card style={styles.breathingCard}>
        <Card.Content>
          <View style={styles.breathingHeader}>
            <Text style={[TEXT_STYLES.h3, styles.breathingTitle]}>
              Breathing Exercise
            </Text>
            <Chip
              mode="outlined"
              selected={breathingType === '4-7-8'}
              onPress={() => setBreathingType('4-7-8')}
              style={styles.breathingChip}
            >
              4-7-8
            </Chip>
            <Chip
              mode="outlined"
              selected={breathingType === 'box'}
              onPress={() => setBreathingType('box')}
              style={styles.breathingChip}
            >
              Box
            </Chip>
            <Chip
              mode="outlined"
              selected={breathingType === 'calm'}
              onPress={() => setBreathingType('calm')}
              style={styles.breathingChip}
            >
              Calm
            </Chip>
          </View>
          
          <Animated.View
            style={[
              styles.breathingCircle,
              {
                transform: [{ scale: breathingAnim }],
                backgroundColor: breathingPhase === 'inhale' ? COLORS.primary : 
                               breathingPhase === 'hold' ? COLORS.success :
                               breathingPhase === 'exhale' ? COLORS.secondary :
                               COLORS.warning,
              },
            ]}
          >
            <Icon name="air" size={80} color="white" />
            <Text style={styles.breathingPhaseText}>
              {breathingPhase.charAt(0).toUpperCase() + breathingPhase.slice(1)}
            </Text>
          </Animated.View>
          
          <Text style={[TEXT_STYLES.body, styles.breathingInstructions]}>
            {breathingPhase === 'inhale' ? 'Breathe in slowly through your nose' :
             breathingPhase === 'hold' ? 'Hold your breath gently' :
             breathingPhase === 'exhale' ? 'Breathe out slowly through your mouth' :
             'Pause and relax'}
          </Text>
          
          <View style={styles.breathingStats}>
            <Text style={styles.sessionCount}>Session: {breathingSession}</Text>
            <ProgressBar
              progress={(breathingCount + 1) / (breathingPhase === 'inhale' ? 4 : breathingPhase === 'hold' ? 7 : breathingPhase === 'exhale' ? 8 : 4)}
              color={COLORS.primary}
              style={styles.breathingProgress}
            />
          </View>
          
          <View style={styles.breathingControls}>
            <Button
              mode={isBreathingActive ? "outlined" : "contained"}
              onPress={() => {
                setIsBreathingActive(!isBreathingActive);
                if (!isBreathingActive) {
                  setBreathingSession(prev => prev + 1);
                }
              }}
              icon={isBreathingActive ? "pause" : "play-arrow"}
              style={styles.breathingButton}
            >
              {isBreathingActive ? 'Pause' : 'Start Breathing'}
            </Button>
            
            <Button
              mode="text"
              onPress={() => {
                setIsBreathingActive(false);
                setBreathingCount(0);
                setBreathingPhase('inhale');
                setBreathingSession(0);
              }}
              style={styles.resetButton}
            >
              Reset
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  const renderMeditationTimer = () => (
    <View style={styles.meditationContainer}>
      <Card style={styles.meditationCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.meditationTitle]}>
            Meditation Timer 🧘‍♀️
          </Text>
          
          <View style={styles.meditationTypes}>
            {meditationTypes.map(type => (
              <Chip
                key={type.id}
                mode={meditationType === type.id ? "flat" : "outlined"}
                selected={meditationType === type.id}
                onPress={() => setMeditationType(type.id)}
                style={styles.meditationChip}
              >
                {type.name}
              </Chip>
            ))}
          </View>
          
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>
              {Math.floor(meditationTimer / 60)}:{(meditationTimer % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={styles.timerSubtext}>
              {meditationTypes.find(t => t.id === meditationType)?.description}
            </Text>
          </View>
          
          <View style={styles.timerControls}>
            <Button
              mode="outlined"
              onPress={() => setMeditationTimer(300)}
              disabled={isMeditating}
              style={styles.timerButton}
            >
              5m
            </Button>
            <Button
              mode="outlined"
              onPress={() => setMeditationTimer(600)}
              disabled={isMeditating}
              style={styles.timerButton}
            >
              10m
            </Button>
            <Button
              mode="outlined"
              onPress={() => setMeditationTimer(900)}
              disabled={isMeditating}
              style={styles.timerButton}
            >
              15m
            </Button>
            <Button
              mode="outlined"
              onPress={() => setMeditationTimer(1800)}
              disabled={isMeditating}
              style={styles.timerButton}
            >
              30m
            </Button>
          </View>
          
          <Button
            mode={isMeditating ? "outlined" : "contained"}
            onPress={() => {
              if (isMeditating) {
                setIsMeditating(false);
              } else {
                startMeditation(meditationTimer, meditationType);
              }
            }}
            icon={isMeditating ? "stop" : "play-arrow"}
            style={styles.meditationStartButton}
          >
            {isMeditating ? 'Stop Meditation' : 'Start Meditation'}
          </Button>
          
          {isMeditating && (
            <ProgressBar
              progress={1 - (meditationTimer / (meditationType === 'mindfulness' ? 300 : 600))}
              color={COLORS.mindfulness}
              style={styles.meditationProgress}
            />
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderMoodTracker = () => (
    <View style={styles.moodContainer}>
      <Card style={styles.moodCard}>
        <Card.Content>
          <View style={styles.moodHeader}>
            <Text style={[TEXT_STYLES.h3, styles.moodTitle]}>
              Mood Check-in 😊
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.moodSubtitle]}>
              How are you feeling right now?
            </Text>
          </View>
          
          <View style={styles.moodGrid}>
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.label}
                onPress={() => handleMoodSelection(mood)}
                style={[
                  styles.moodButton,
                  { borderColor: mood.color },
                  selectedMood === mood.label && { backgroundColor: mood.color + '20' }
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, { color: mood.color }]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.stressEnergySliders}>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Stress Level: {stressLevel}/10</Text>
              <View style={styles.sliderButtons}>
                {[1,2,3,4,5,6,7,8,9,10].map(level => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setStressLevel(level)}
                    style={[
                      styles.sliderButton,
                      stressLevel === level && styles.activeSliderButton
                    ]}
                  >
                    <Text style={[
                      styles.sliderButtonText,
                      stressLevel === level && styles.activeSliderButtonText
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Energy Level: {energyLevel}/10</Text>
              <View style={styles.sliderButtons}>
                {[1,2,3,4,5,6,7,8,9,10].map(level => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setEnergyLevel(level)}
                    style={[
                      styles.sliderButton,
                      energyLevel === level && styles.activeSliderButton
                    ]}
                  >
                    <Text style={[
                      styles.sliderButtonText,
                      energyLevel === level && styles.activeSliderButtonText
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          {selectedMood && (
            <Surface style={styles.moodFeedback}>
              <Text style={styles.moodFeedbackText}>
                Thank you for checking in! 
                {stressLevel > 7 ? ' Consider trying a breathing exercise.' : 
                 energyLevel < 4 ? ' Maybe some gentle movement could help.' :
                 ' You\'re doing great!'}
              </Text>
            </Surface>
          )}
        </Card.Content>
      </Card>
      
      {/* Mood History Chart */}
      <Card style={styles.moodHistoryCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.moodHistoryTitle]}>
            Mood Trends 📊
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.moodChart}>
              {moodHistory.slice(0, 7).reverse().map((mood, index) => (
                <View key={index} style={styles.moodChartItem}>
                  <View
                    style={[
                      styles.moodBar,
                      { 
                        height: mood.mood * 20,
                        backgroundColor: moods.find(m => m.value === mood.mood)?.color || COLORS.primary
                      }
                    ]}
                  />
                  <Text style={styles.moodChartLabel}>
                    {new Date(mood.timestamp).toLocaleDateString('en', { weekday: 'short' })}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );

  const renderGratitudeJournal = () => (
    <View style={styles.gratitudeContainer}>
      <Card style={styles.gratitudeCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.gratitudeTitle]}>
            Gratitude Journal 🙏
          </Text>
          
          <View style={styles.gratitudeInput}>
            <TextInput
              value={newGratitude}
              onChangeText={setNewGratitude}
              placeholder="What are you grateful for today?"
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.gratitudeTextInput}
            />
            <Button
              mode="contained"
              onPress={addGratitude}
              disabled={!newGratitude.trim()}
              style={styles.addGratitudeButton}
            >
              Add Gratitude
            </Button>
          </View>
          
          <FlatList
            data={gratitudeList}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <Surface style={styles.gratitudeItem}>
                <View style={styles.gratitudeContent}>
                  <Icon name="favorite" size={20} color={COLORS.accent} />
                  <Text style={styles.gratitudeText}>{item.text}</Text>
                </View>
                <Text style={styles.gratitudeDate}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </Surface>
            )}
            style={styles.gratitudeList}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          />
        </Card.Content>
      </Card>
    </View>
  );

  const renderJournal = () => (
    <View style={styles.journalContainer}>
      <Card style={styles.journalCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.journalTitle]}>
            Personal Journal 📔
          </Text>
          
          <TextInput
            value={newJournalEntry}
            onChangeText={setNewJournalEntry}
            placeholder="How was your day? What's on your mind?"
            mode="outlined"
            multiline
            numberOfLines={6}
            style={styles.journalTextInput}
          />
          
          <Button
            mode="contained"
            onPress={addJournalEntry}
            disabled={!newJournalEntry.trim()}
            icon="create"
            style={styles.addJournalButton}
          >
            Save Entry
          </Button>
          
          <Divider style={styles.journalDivider} />
          
          <Text style={[TEXT_STYLES.body, styles.journalHistoryTitle]}>
            Recent Entries
          </Text>
          
          {journalEntries.slice(0, 3).map((entry, index) => (
            <Surface key={entry.id} style={styles.journalEntry}>
              <Text style={styles.journalEntryText}>
                {entry.text.length > 120 ? entry.text.substring(0, 120) + '...' : entry.text}
              </Text>
              <View style={styles.journalEntryFooter}>
                <Text style={styles.journalEntryDate}>
                  {new Date(entry.timestamp).toLocaleDateString()}
                </Text>
                <Chip size="small" style={styles.journalMoodChip}>
                  {entry.mood}
                </Chip>
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>
    </View>
  );

  const renderSleepTracker = () => (
    <View style={styles.sleepContainer}>
      <Card style={styles.sleepCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.sleepTitle]}>
            Sleep Wellness 😴
          </Text>
          
          <View style={styles.sleepStats}>
            <Surface style={styles.sleepStatCard}>
              <Icon name="bedtime" size={32} color={COLORS.sleep} />
              <Text style={styles.sleepStatValue}>{sleepHours}h</Text>
              <Text style={styles.sleepStatLabel}>Last Night</Text>
            </Surface>
            
            <Surface style={styles.sleepStatCard}>
              <Icon name="star" size={32} color={COLORS.warning} />
              <Text style={styles.sleepStatValue}>{sleepQuality}/5</Text>
              <Text style={styles.sleepStatLabel}>Quality</Text>
            </Surface>
            
            <Surface style={styles.sleepStatCard}>
              <Icon name="flag" size={32} color={COLORS.success} />
              <Text style={styles.sleepStatValue}>{sleepGoal}h</Text>
              <Text style={styles.sleepStatLabel}>Goal</Text>
            </Surface>
          </View>
          
          <View style={styles.sleepControls}>
            <Text style={styles.sleepLabel}>Hours Slept</Text>
            <View style={styles.sleepHoursSelector}>
              {[4,5,6,7,8,9,10,11,12].map(hours => (
                <TouchableOpacity
                  key={hours}
                  onPress={() => setSleepHours(hours)}
                  style={[
                    styles.sleepHourButton,
                    sleepHours === hours && styles.activeSleepHourButton
                  ]}
                >
                  <Text style={[
                    styles.sleepHourText,
                    sleepHours === hours && styles.activeSleepHourText
                  ]}>
                    {hours}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sleepLabel}>Sleep Quality</Text>
            <View style={styles.qualitySelector}>
              {[1,2,3,4,5].map(quality => (
                <TouchableOpacity
                  key={quality}
                  onPress={() => setSleepQuality(quality)}
                  style={styles.qualityButton}
                >
                  <Icon 
                    name="star" 
                    size={24} 
                    color={quality <= sleepQuality ? COLORS.warning : COLORS.textLight} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.sleepReminder}>
            <Text style={styles.reminderLabel}>Bedtime Reminder</Text>
            <Switch
              value={bedtimeReminder}
              onValueChange={setBedtimeReminder}
              color={COLORS.primary}
            />
          </View>
          
          <Button
            mode="contained"
            onPress={() => {
              setWellnessPoints(prev => prev + 20);
              showSnackbar('Sleep data logged! +20 points 😴');
            }}
            icon="check"
            style={styles.logSleepButton}
          >
            Log Sleep Data
          </Button>
        </Card.Content>
      </Card>
    </View>
  );

  const renderSocialSupport = () => (
    <View style={styles.socialContainer}>
      <Card style={styles.socialCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.socialTitle]}>
            Social Wellness 🤝
          </Text>
          
          <View style={styles.supportOptions}>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => navigation.navigate('CoachChat')}
            >
              <Icon name="psychology" size={24} color={COLORS.primary} />
              <Text style={styles.supportButtonText}>Talk to Coach</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => setActiveModal('community')}
            >
              <Icon name="group" size={24} color={COLORS.social} />
              <Text style={styles.supportButtonText}>Community</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => setActiveModal('resources')}
            >
              <Icon name="library-books" size={24} color={COLORS.success} />
              <Text style={styles.supportButtonText}>Resources</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.supportButton, styles.emergencyButton]}
              onPress={openEmergencySupport}
            >
              <Icon name="emergency" size={24} color={COLORS.error} />
              <Text style={[styles.supportButtonText, styles.emergencyText]}>
                Emergency Help
              </Text>
            </TouchableOpacity>
          </View>
          
          <Divider style={styles.socialDivider} />
          
          <Text style={styles.connectionTitle}>Your Support Network</Text>
          {supportConnections.length === 0 ? (
            <Surface style={styles.emptySupport}>
              <Icon name="group-add" size={32} color={COLORS.textLight} />
              <Text style={styles.emptySupportText}>
                Connect with coaches, friends, or family for support
              </Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('FindCoaches')}
                style={styles.findCoachButton}
              >
                Find a Coach
              </Button>
            </Surface>
          ) : (
            <FlatList
              data={supportConnections}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Surface style={styles.connectionCard}>
                  <Avatar.Text label={item.name.charAt(0)} size={40} />
                  <Text style={styles.connectionName}>{item.name}</Text>
                  <Text style={styles.connectionRole}>{item.role}</Text>
                </Surface>
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderActivityGrid = () => (
    <View style={styles.gridContainer}>
      <View style={styles.gridHeader}>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          Wellness Activities
        </Text>
        <Searchbar
          placeholder="Search activities..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>
      
      <FlatList
        data={activities.filter(activity => 
          activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.category.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        numColumns={2}
        columnWrapperStyle={styles.activityRow}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleActivityStart(item.id)}
            style={[
              styles.activityGridCard,
              currentActivity === item.id && styles.activeActivityCard
            ]}
          >
            <LinearGradient
              colors={[item.color + '20', item.color + '10']}
              style={styles.activityGradient}
            >
              <Surface style={[styles.activityIcon, { backgroundColor: item.color + '30' }]}>
                <Icon name={item.icon} size={28} color={item.color} />
              </Surface>
              
              <Text style={[TEXT_STYLES.body, styles.activityName]}>
                {item.name}
              </Text>
              
              <Text style={[TEXT_STYLES.small, styles.activityDescription]}>
                {item.description}
              </Text>
              
              <View style={styles.activityMeta}>
                <Chip size="small" style={styles.categoryChip}>
                  {item.category}
                </Chip>
                <Chip size="small" style={styles.durationChip}>
                  {item.duration}
                </Chip>
              </View>
              
              <View style={styles.activityFooter}>
                <Chip
                  style={[styles.pointsChip, { backgroundColor: item.color + '20' }]}
                  textStyle={{ color: item.color, fontSize: 11, fontWeight: 'bold' }}
                >
                  +{item.points} pts
                </Chip>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyActivities}>
            <Icon name="search-off" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No activities found</Text>
          </View>
        )}
      />
    </View>
  );

  const renderProgressDashboard = () => (
    <View style={styles.progressContainer}>
      {/* Achievement Badges */}
      <Card style={styles.achievementCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.achievementTitle]}>
            Achievements 🏆
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.achievementList}>
              {[
                { id: 'first-meditation', name: 'First Steps', icon: 'jump-rope', unlocked: completedSessions > 0 },
                { id: 'week-streak', name: 'Week Warrior', icon: 'local-fire-department', unlocked: streakCount >= 7 },
                { id: 'mood-master', name: 'Mood Master', icon: 'sentiment-very-satisfied', unlocked: moodHistory.length >= 30 },
                { id: 'gratitude-guru', name: 'Gratitude Guru', icon: 'favorite', unlocked: gratitudeList.length >= 20 },
                { id: 'sleep-champion', name: 'Sleep Champion', icon: 'bedtime', unlocked: sleepHours >= 8 },
              ].map(achievement => (
                <Surface
                  key={achievement.id}
                  style={[
                    styles.achievementBadge,
                    achievement.unlocked ? styles.unlockedBadge : styles.lockedBadge
                  ]}
                >
                  <Icon
                    name={achievement.icon}
                    size={24}
                    color={achievement.unlocked ? COLORS.warning : COLORS.textLight}
                  />
                  <Text style={[
                    styles.achievementName,
                    achievement.unlocked ? styles.unlockedText : styles.lockedText
                  ]}>
                    {achievement.name}
                  </Text>
                </Surface>
              ))}
            </View>
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Wellness Analytics */}
      <Card style={styles.analyticsCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.analyticsTitle]}>
            Wellness Analytics 📈
          </Text>
          
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{wellnessPoints}</Text>
              <Text style={styles.analyticsLabel}>Total Points</Text>
              <ProgressBar
                progress={0.7}
                color={COLORS.primary}
                style={styles.analyticsProgress}
              />
            </View>
            
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{streakCount}</Text>
              <Text style={styles.analyticsLabel}>Current Streak</Text>
              <ProgressBar
                progress={streakCount / 30}
                color={COLORS.warning}
                style={styles.analyticsProgress}
              />
            </View>
            
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>
                {moodHistory.length > 0 ? 
                  (moodHistory.reduce((sum, mood) => sum + mood.mood, 0) / moodHistory.length).toFixed(1) : 
                  '0.0'
                }
              </Text>
              <Text style={styles.analyticsLabel}>Avg Mood</Text>
              <ProgressBar
                progress={moodHistory.length > 0 ? 
                  (moodHistory.reduce((sum, mood) => sum + mood.mood, 0) / moodHistory.length) / 5 : 
                  0
                }
                color={COLORS.success}
                style={styles.analyticsProgress}
              />
            </View>
            
            <View style={styles.analyticsItem}>
              <Text style={styles.analyticsValue}>{completedSessions}</Text>
              <Text style={styles.analyticsLabel}>Sessions</Text>
              <ProgressBar
                progress={completedSessions / 50}
                color={COLORS.mindfulness}
                style={styles.analyticsProgress}
              />
            </View>
          </View>
          
          <Button
            mode="outlined"
            onPress={() => setActiveModal('detailed-analytics')}
            icon="analytics"
            style={styles.detailedAnalyticsButton}
          >
            View Detailed Analytics
          </Button>
        </Card.Content>
      </Card>

      {/* Coach Recommendations */}
      <Card style={styles.recommendationsCard}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, styles.recommendationsTitle]}>
            Coach Recommendations 💡
          </Text>
          
          {stressLevel > 7 && (
            <Surface style={styles.recommendationItem}>
              <Icon name="warning" size={20} color={COLORS.warning} />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationText}>
                  High stress detected. Try a 10-minute breathing exercise.
                </Text>
                <Button
                  mode="outlined"
                  size="small"
                  onPress={() => handleActivityStart('breathing')}
                  style={styles.recommendationButton}
                >
                  Start Now
                </Button>
              </View>
            </Surface>
          )}
          
          {energyLevel < 4 && (
            <Surface style={styles.recommendationItem}>
              <Icon name="battery-low" size={20} color={COLORS.error} />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationText}>
                  Low energy. Consider gentle movement or better sleep.
                </Text>
                <Button
                  mode="outlined"
                  size="small"
                  onPress={() => handleActivityStart('sleep')}
                  style={styles.recommendationButton}
                >
                  Sleep Tips
                </Button>
              </View>
            </Surface>
          )}
          
          {streakCount === 0 && (
            <Surface style={styles.recommendationItem}>
              <Icon name="trending-up" size={20} color={COLORS.primary} />
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationText}>
                  Start your wellness journey! Try a quick mood check-in.
                </Text>
                <Button
                  mode="outlined"
                  size="small"
                  onPress={() => handleActivityStart('mood')}
                  style={styles.recommendationButton}
                >
                  Check Mood
                </Button>
              </View>
            </Surface>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderModals = () => (
    <Portal>
      {/* Notifications Modal */}
      <Modal
        visible={activeModal === 'notifications'}
        onDismiss={() => setActiveModal('')}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
            Notifications 🔔
          </Text>
          {notifications.length === 0 ? (
            <Text style={styles.emptyNotifications}>No new notifications</Text>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <List.Item
                  title={item.title}
                  description={item.message}
                  left={() => <Icon name={item.icon} size={24} color={item.color} />}
                />
              )}
            />
          )}
          <Button
            mode="contained"
            onPress={() => setActiveModal('')}
            style={styles.modalButton}
          >
            Close
          </Button>
        </View>
      </Modal>

      {/* Community Modal */}
      <Modal
        visible={activeModal === 'community'}
        onDismiss={() => setActiveModal('')}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
            Wellness Community 👥
          </Text>
          <Text style={styles.modalDescription}>
            Connect with others on their wellness journey
          </Text>
          
          <View style={styles.communityFeatures}>
            <List.Item
              title="Group Challenges"
              description="Join team wellness challenges"
              left={() => <Icon name="jump-rope" size={24} color={COLORS.warning} />}
              onPress={() => {
                setActiveModal('');
                Alert.alert('Feature Coming Soon', 'Group challenges will be available in the next update!');
              }}
            />
            <List.Item
              title="Support Groups"
              description="Find local or virtual support groups"
              left={() => <Icon name="support" size={24} color={COLORS.social} />}
              onPress={() => {
                setActiveModal('');
                Alert.alert('Feature Coming Soon', 'Support groups feature is in development!');
              }}
            />
            <List.Item
              title="Wellness Stories"
              description="Share and read inspiring stories"
              left={() => <Icon name="auto-stories" size={24} color={COLORS.success} />}
              onPress={() => {
                setActiveModal('');
                Alert.alert('Feature Coming Soon', 'Wellness stories feature coming soon!');
              }}
            />
          </View>
          
          <Button
            mode="contained"
            onPress={() => setActiveModal('')}
            style={styles.modalButton}
          >
            Close
          </Button>
        </View>
      </Modal>

      {/* Resources Modal */}
      <Modal
        visible={activeModal === 'resources'}
        onDismiss={() => setActiveModal('')}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
            Wellness Resources 📚
          </Text>
          
          <View style={styles.resourceCategories}>
            {[
              { name: 'Mental Health', icon: 'psychology', color: COLORS.primary },
              { name: 'Stress Management', icon: 'self-improvement', color: COLORS.mindfulness },
              { name: 'Sleep Hygiene', icon: 'bedtime', color: COLORS.sleep },
              { name: 'Nutrition', icon: 'restaurant', color: COLORS.nutrition },
              { name: 'Exercise', icon: 'fitness-center', color: COLORS.exercise },
              { name: 'Crisis Support', icon: 'emergency', color: COLORS.error },
            ].map(category => (
              <TouchableOpacity
                key={category.name}
                style={styles.resourceButton}
                onPress={() => {
                  setActiveModal('');
                  Alert.alert(
                    `${category.name} Resources`,
                    'This feature will provide curated resources, articles, and professional contacts.',
                    [{ text: 'Got it!', style: 'default' }]
                  );
                }}
              >
                <Icon name={category.icon} size={24} color={category.color} />
                <Text style={styles.resourceButtonText}>{category.name}</Text>
                <Icon name="arrow-forward-ios" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>
          
          <Button
            mode="contained"
            onPress={() => setActiveModal('')}
            style={styles.modalButton}
          >
            Close
          </Button>
        </View>
      </Modal>

      {/* Detailed Analytics Modal */}
      <Modal
        visible={activeModal === 'detailed-analytics'}
        onDismiss={() => setActiveModal('')}
        contentContainerStyle={styles.fullScreenModal}
      >
        <BlurView style={styles.blurContainer} blurType="light" blurAmount={10}>
          <View style={styles.analyticsModalContent}>
            <View style={styles.analyticsModalHeader}>
              <Text style={[TEXT_STYLES.h2, styles.analyticsModalTitle]}>
                Detailed Analytics 📊
              </Text>
              <IconButton
                icon="close"
                onPress={() => setActiveModal('')}
              />
            </View>
            
            <ScrollView style={styles.analyticsModalScroll}>
              {/* Weekly Summary */}
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={[TEXT_STYLES.h3, styles.summaryTitle]}>This Week</Text>
                  <View style={styles.summaryStats}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {Object.values(weeklyGoals).reduce((sum, goal) => sum + goal.current, 0)}
                      </Text>
                      <Text style={styles.summaryLabel}>Activities Completed</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryValue}>
                        {Math.round((Object.values(weeklyGoals).reduce((sum, goal) => sum + (goal.current / goal.target), 0) / Object.keys(weeklyGoals).length) * 100)}%
                      </Text>
                      <Text style={styles.summaryLabel}>Goal Completion</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
              
              {/* Mood Trend */}
              <Card style={styles.trendCard}>
                <Card.Content>
                  <Text style={[TEXT_STYLES.h3, styles.trendTitle]}>Mood Trend</Text>
                  <View style={styles.moodTrendChart}>
                    {moodHistory.slice(0, 14).reverse().map((mood, index) => (
                      <View key={index} style={styles.trendBarContainer}>
                        <View
                          style={[
                            styles.trendBar,
                            { 
                              height: mood.mood * 15,
                              backgroundColor: moods.find(m => m.value === mood.mood)?.color || COLORS.primary
                            }
                          ]}
                        />
                        <Text style={styles.trendDate}>
                          {new Date(mood.timestamp).getDate()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderCurrentActivity = () => {
    switch(currentActivity) {
      case 'dashboard': return renderDashboard();
      case 'breathing': return renderBreathingExercise();
      case 'meditation': return renderMeditationTimer();
      case 'mood': return renderMoodTracker();
      case 'gratitude': return renderGratitudeJournal();
      case 'journal': return renderJournal();
      case 'sleep': return renderSleepTracker();
      case 'social': return renderSocialSupport();
      default: return renderDashboard();
    }
  };

  const navigationTabs = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'mood', icon: 'sentiment-satisfied-alt', label: 'Mood' },
    { id: 'breathing', icon: 'air', label: 'Breathe' },
    { id: 'meditation', icon: 'self-improvement', label: 'Meditate' },
    { id: 'social', icon: 'people', label: 'Connect' },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
        {renderHeader()}
        
        <View style={styles.content}>
          {renderCurrentActivity()}
          {currentActivity === 'dashboard' && renderActivityGrid()}
          {currentActivity === 'dashboard' && renderProgressDashboard()}
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <Surface style={styles.bottomNav}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bottomNavContent}
        >
          {navigationTabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setCurrentActivity(tab.id)}
              style={[
                styles.navTab,
                currentActivity === tab.id && styles.activeNavTab
              ]}
            >
              <Icon
                name={tab.icon}
                size={24}
                color={currentActivity === tab.id ? COLORS.primary : COLORS.textLight}
              />
              <Text style={[
                styles.navTabLabel,
                currentActivity === tab.id && styles.activeNavTabLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Surface>
      
      {/* Emergency FAB */}
      <Animated.View style={[styles.emergencyFab, { transform: [{ scale: pulseAnim }] }]}>
        <FAB
          icon="emergency"
          onPress={openEmergencySupport}
          style={[styles.fab, { backgroundColor: COLORS.error }]}
          label="SOS"
        />
      </Animated.View>
      
      {/* Quick Actions FAB */}
      <FAB
        style={styles.quickActionsFab}
        icon="add"
        label="Quick Actions"
        onPress={() => setActiveModal('quick-actions')}
      />
      
      {renderModals()}
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
      >
        {snackbarMessage}
      </Snackbar>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: SPACING.xxl + 20,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    gap: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  notificationBadge: {
    borderRadius: 20,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  streakText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
  },
  levelProgress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  levelText: {
    ...TEXT_STYLES.small,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.lg,
    paddingBottom: 120, // Account for bottom nav and FABs
  },
  
  // Dashboard Styles
  dashboardContainer: {
    gap: SPACING.lg,
  },
  statsCard: {
    elevation: 4,
    borderRadius: 16,
  },
  statsTitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.small,
  },
  
  // Goals Card
  goalsCard: {
    elevation: 4,
    borderRadius: 16,
  },
  goalsTitle: {
    marginBottom: SPACING.md,
  },
  goalItem: {
    marginBottom: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  goalProgress: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  goalProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  
  // Recent Activities
  recentCard: {
    elevation: 4,
    borderRadius: 16,
  },
  recentTitle: {
    marginBottom: SPACING.md,
  },
  moodEmoji: {
    fontSize: 24,
    textAlign: 'center',
    width: 40,
  },
  
  // Breathing Exercise Styles
  breathingContainer: {
    gap: SPACING.lg,
  },
  breathingCard: {
    elevation: 4,
    borderRadius: 16,
  },
  breathingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  breathingTitle: {
    flex: 1,
  },
  breathingChip: {
    height: 32,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
    elevation: 8,
  },
  breathingPhaseText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  breathingInstructions: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.textLight,
  },
  breathingStats: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sessionCount: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  breathingProgress: {
    width: '80%',
    height: 8,
    borderRadius: 4,
  },
  breathingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  breathingButton: {
    paddingHorizontal: SPACING.lg,
  },
  resetButton: {
    paddingHorizontal: SPACING.md,
  },
  
  // Meditation Styles
  meditationContainer: {
    gap: SPACING.lg,
  },
  meditationCard: {
    elevation: 4,
    borderRadius: 16,
  },
  meditationTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  meditationTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  meditationChip: {
    marginRight: SPACING.xs,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timerSubtext: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  timerButton: {
    minWidth: 60,
  },
  meditationStartButton: {
    paddingHorizontal: SPACING.lg,
  },
  meditationProgress: {
    height: 8,
    borderRadius: 4,
    marginTop: SPACING.md,
  },
  
  // Mood Tracker Styles
  moodContainer: {
    gap: SPACING.lg,
  },
  moodCard: {
    elevation: 4,
    borderRadius: 16,
  },
  moodHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  moodTitle: {
    textAlign: 'center',
  },
  moodSubtitle: {
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  moodButton: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  stressEnergySliders: {
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sliderContainer: {
    gap: SPACING.sm,
  },
  sliderLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  sliderButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  sliderButton: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  activeSliderButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sliderButtonText: {
    ...TEXT_STYLES.small,
    fontWeight: 'bold',
  },
  activeSliderButtonText: {
    color: 'white',
  },
  moodFeedback: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '10',
  },
  moodFeedbackText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
  },
  
  // Mood History Chart
  moodHistoryCard: {
    elevation: 4,
    borderRadius: 16,
  },
  moodHistoryTitle: {
    marginBottom: SPACING.md,
  },
  moodChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  moodChartItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  moodBar: {
    width: 24,
    borderRadius: 4,
    minHeight: 20,
  },
  moodChartLabel: {
    ...TEXT_STYLES.small,
  },
  
  // Gratitude Styles
  gratitudeContainer: {
    gap: SPACING.lg,
  },
  gratitudeCard: {
    elevation: 4,
    borderRadius: 16,
  },
  gratitudeTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  gratitudeInput: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  gratitudeTextInput: {
    backgroundColor: 'transparent',
  },
  addGratitudeButton: {
    alignSelf: 'center',
  },
  gratitudeList: {
    maxHeight: 300,
  },
  gratitudeItem: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  gratitudeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  gratitudeText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  gratitudeDate: {
    ...TEXT_STYLES.small,
    textAlign: 'right',
  },
  
  // Journal Styles
  journalContainer: {
    gap: SPACING.lg,
  },
  journalCard: {
    elevation: 4,
    borderRadius: 16,
  },
  journalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  journalTextInput: {
    backgroundColor: 'transparent',
    marginBottom: SPACING.md,
  },
  addJournalButton: {
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  journalDivider: {
    marginBottom: SPACING.lg,
  },
  journalHistoryTitle: {
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  journalEntry: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  journalEntryText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.sm,
  },
  journalEntryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journalEntryDate: {
    ...TEXT_STYLES.small,
  },
  journalMoodChip: {
    height: 24,
  },
  
  // Sleep Tracker Styles
  sleepContainer: {
    gap: SPACING.lg,
  },
  sleepCard: {
    elevation: 4,
    borderRadius: 16,
  },
  sleepTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  sleepStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },
  sleepStatCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    gap: SPACING.xs,
  },
  sleepStatValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.sleep,
  },
  sleepStatLabel: {
    ...TEXT_STYLES.small,
  },
  sleepControls: {
    gap: SPACING.lg,
  },
  sleepLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  sleepHoursSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    justifyContent: 'center',
  },
  sleepHourButton: {
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    minWidth: 50,
    alignItems: 'center',
  },
  activeSleepHourButton: {
    backgroundColor: COLORS.sleep,
    borderColor: COLORS.sleep,
  },
  sleepHourText: {
    ...TEXT_STYLES.caption,
  },
  activeSleepHourText: {
    color: 'white',
    fontWeight: 'bold',
  },
  qualitySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  qualityButton: {
    padding: SPACING.xs,
  },
  sleepReminder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  reminderLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  logSleepButton: {
    marginTop: SPACING.lg,
    alignSelf: 'center',
  },
  
  // Social Support Styles
  socialContainer: {
    gap: SPACING.lg,
  },
  socialCard: {
    elevation: 4,
    borderRadius: 16,
  },
  socialTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  supportOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  supportButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
    gap: SPACING.sm,
  },
  emergencyButton: {
    backgroundColor: COLORS.error + '10',
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  supportButtonText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  emergencyText: {
    color: COLORS.error,
  },
  socialDivider: {
    marginVertical: SPACING.lg,
  },
  connectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  emptySupport: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptySupportText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  findCoachButton: {
    marginTop: SPACING.sm,
  },
  connectionCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
    minWidth: 80,
  },
  connectionName: {
    ...TEXT_STYLES.small,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connectionRole: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
  },
  
  // Activity Grid Styles
  gridContainer: {
    gap: SPACING.md,
  },
  gridHeader: {
    gap: SPACING.md,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  activityRow: {
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  activityGridCard: {
    width: (width - SPACING.md * 3) / 2,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  activeActivityCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  activityGradient: {
    padding: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
    minHeight: 180,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  activityName: {
    fontWeight: '600',
    textAlign: 'center',
  },
  activityDescription: {
    textAlign: 'center',
    lineHeight: 16,
    flex: 1,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryChip: {
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  durationChip: {
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pointsChip: {
    height: 28,
  },
  difficultyText: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
  },
  emptyActivities: {
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textLight,
  },
  
  // Progress Dashboard Styles
  progressContainer: {
    gap: SPACING.lg,
  },
  achievementCard: {
    elevation: 4,
    borderRadius: 16,
  },
  achievementTitle: {
    marginBottom: SPACING.md,
  },
  achievementList: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  achievementBadge: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    gap: SPACING.xs,
    minWidth: 80,
  },
  unlockedBadge: {
    backgroundColor: COLORS.warning + '20',
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  lockedBadge: {
    backgroundColor: COLORS.textLight + '10',
    borderWidth: 1,
    borderColor: COLORS.textLight,
  },
  achievementName: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  unlockedText: {
    color: COLORS.warning,
  },
  lockedText: {
    color: COLORS.textLight,
  },
  analyticsCard: {
    elevation: 4,
    borderRadius: 16,
  },
  analyticsTitle: {
    marginBottom: SPACING.lg,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  analyticsItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  analyticsValue: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  analyticsLabel: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
  },
  analyticsProgress: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  detailedAnalyticsButton: {
    alignSelf: 'center',
  },
  recommendationsCard: {
    elevation: 4,
    borderRadius: 16,
  },
  recommendationsTitle: {
    marginBottom: SPACING.md,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  recommendationContent: {
    flex: 1,
    gap: SPACING.sm,
  },
  recommendationText: {
    ...TEXT_STYLES.body,
  },
  recommendationButton: {
    alignSelf: 'flex-start',
  },
  
  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    paddingVertical: SPACING.sm,
  },
  bottomNavContent: {
    paddingHorizontal: SPACING.md,
  },
  navTab: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    gap: SPACING.xs,
    minWidth: 70,
  },
  activeNavTab: {
    backgroundColor: COLORS.primary + '20',
  },
  navTabLabel: {
    ...TEXT_STYLES.small,
    color: COLORS.textLight,
  },
  activeNavTabLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  
  // FAB Styles
  fab: {
    backgroundColor: COLORS.primary,
  },
  emergencyFab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: 140,
  },
  quickActionsFab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: 200,
    backgroundColor: COLORS.secondary,
  },
  
  // Modal Styles
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: SPACING.xl,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.textLight,
  },
  modalButton: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
  },
  fullScreenModal: {
    flex: 1,
    margin: 0,
  },
  blurContainer: {
    flex: 1,
  },
  
  // Community Modal
  communityFeatures: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  
  // Resources Modal
  resourceCategories: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 1,
    gap: SPACING.md,
  },
  resourceButtonText: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  
  // Analytics Modal
  analyticsModalContent: {
    flex: 1,
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 16,
  },
  analyticsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textLight + '20',
  },
  analyticsModalTitle: {
    flex: 1,
  },
  analyticsModalScroll: {
    flex: 1,
    padding: SPACING.lg,
  },
  summaryCard: {
    elevation: 2,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    marginBottom: SPACING.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  summaryLabel: {
    ...TEXT_STYLES.small,
    marginTop: SPACING.xs,
  },
  trendCard: {
    elevation: 2,
    borderRadius: 12,
  },
  trendTitle: {
    marginBottom: SPACING.md,
  },
  moodTrendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    height: 120,
  },
  trendBarContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  trendBar: {
    width: 16,
    borderRadius: 8,
    minHeight: 10,
  },
  trendDate: {
    ...TEXT_STYLES.small,
    transform: [{ rotate: '-45deg' }],
  },
  
  // Notification Styles
  emptyNotifications: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textLight,
    marginVertical: SPACING.lg,
  },
  
  // Snackbar
  snackbar: {
    backgroundColor: COLORS.success,
    marginBottom: 100, // Above bottom nav
  },
});

export default StressManagement;