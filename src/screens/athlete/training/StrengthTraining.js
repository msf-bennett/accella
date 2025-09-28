import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
  TouchableOpacity,
  Vibration,
  Modal,
} from 'react-native';
import {
  Card,
  Button,
  ProgressBar,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Chip,
  Portal,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};

const { width } = Dimensions.get('window');

const StrengthTraining = ({ navigation }) => {
  // Redux state
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const workoutPlans = useSelector(state => state.training.strengthPlans);
  const currentWorkout = useSelector(state => state.training.currentWorkout);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [workoutModalVisible, setWorkoutModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [activeSet, setActiveSet] = useState(null);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  // Mock data for development
  const mockWorkouts = [
    {
      id: 1,
      title: 'Upper Body Power 💪',
      duration: '45 min',
      difficulty: 'Intermediate',
      exercises: 8,
      calories: 320,
      category: 'upper',
      description: 'Build explosive upper body strength',
      completed: false,
      streak: 3,
    },
    {
      id: 2,
      title: 'Leg Day Crusher 🦵',
      duration: '60 min',
      difficulty: 'Advanced',
      exercises: 10,
      calories: 450,
      category: 'lower',
      description: 'Intense lower body workout',
      completed: true,
      streak: 5,
    },
    {
      id: 3,
      title: 'Core Stability 🔥',
      duration: '30 min',
      difficulty: 'Beginner',
      exercises: 6,
      calories: 180,
      category: 'core',
      description: 'Strengthen your core foundation',
      completed: false,
      streak: 1,
    },
    {
      id: 4,
      title: 'Full Body HIIT ⚡',
      duration: '40 min',
      difficulty: 'Intermediate',
      exercises: 12,
      calories: 380,
      category: 'full',
      description: 'High-intensity full body workout',
      completed: false,
      streak: 0,
    },
  ];

  const categories = [
    { key: 'all', label: 'All', icon: 'fitness-center' },
    { key: 'upper', label: 'Upper', icon: 'self-improvement' },
    { key: 'lower', label: 'Lower', icon: 'directions-run' },
    { key: 'core', label: 'Core', icon: 'center-focus-strong' },
    { key: 'full', label: 'Full Body', icon: 'accessibility' },
  ];

  const achievements = [
    { id: 1, title: 'Consistency King 👑', description: '7-day streak!', unlocked: true },
    { id: 2, title: 'Iron Warrior 🛡️', description: '100 workouts completed', unlocked: false },
    { id: 3, title: 'Strength Master 💎', description: 'Max weight milestone', unlocked: true },
  ];

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Rest timer effect
    let interval = null;
    if (restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(restTimer - 1);
        // Pulse animation for timer
        Animated.sequence([
          Animated.timing(timerAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(timerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]).start();
      }, 1000);
    } else if (restTimer === 0 && interval) {
      clearInterval(interval);
      if (activeSet) {
        Vibration.vibrate(500);
        Alert.alert('Rest Complete! 💪', 'Time for your next set!');
      }
    }
    return () => clearInterval(interval);
  }, [restTimer, activeSet]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleWorkoutPress = (workout) => {
    setSelectedWorkout(workout);
    setWorkoutModalVisible(true);
    Vibration.vibrate(50);
  };

  const startWorkout = () => {
    setWorkoutStarted(true);
    setWorkoutModalVisible(false);
    Vibration.vibrate(100);
    Alert.alert(
      'Workout Started! 🔥',
      `Let's crush this ${selectedWorkout?.title} workout!`,
      [{ text: 'Let\'s Go!', style: 'default' }]
    );
  };

  const startRestTimer = (seconds) => {
    setRestTimer(seconds);
    setActiveSet(true);
    Vibration.vibrate(100);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const filteredWorkouts = mockWorkouts.filter(workout => {
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const WeeklyProgress = () => (
    <Card style={styles.progressCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.progressGradient}
      >
        <View style={styles.progressHeader}>
          <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>Weekly Progress 📈</Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            4 of 5 workouts completed
          </Text>
        </View>
        <ProgressBar 
          progress={0.8} 
          color="white" 
          style={styles.progressBar}
        />
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>1,240</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Calories Burned 🔥
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>3h 15m</Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Training Time ⏱️
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const WorkoutCard = ({ workout }) => (
    <TouchableOpacity onPress={() => handleWorkoutPress(workout)}>
      <Card style={[styles.workoutCard, workout.completed && styles.completedCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={[TEXT_STYLES.h3, styles.workoutTitle]}>{workout.title}</Text>
            {workout.streak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>🔥{workout.streak}</Text>
              </View>
            )}
          </View>
          <Chip 
            mode="outlined" 
            textStyle={{ color: getDifficultyColor(workout.difficulty) }}
            style={[styles.difficultyChip, { borderColor: getDifficultyColor(workout.difficulty) }]}
          >
            {workout.difficulty}
          </Chip>
        </View>
        
        <Text style={[TEXT_STYLES.body, styles.workoutDescription]}>
          {workout.description}
        </Text>
        
        <View style={styles.workoutStats}>
          <View style={styles.statRow}>
            <Icon name="schedule" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.caption, styles.statText]}>{workout.duration}</Text>
          </View>
          <View style={styles.statRow}>
            <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.caption, styles.statText]}>{workout.exercises} exercises</Text>
          </View>
          <View style={styles.statRow}>
            <Icon name="whatshot" size={16} color={COLORS.textSecondary} />
            <Text style={[TEXT_STYLES.caption, styles.statText]}>{workout.calories} cal</Text>
          </View>
        </View>

        {workout.completed && (
          <View style={styles.completedOverlay}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
            <Text style={[TEXT_STYLES.caption, { color: COLORS.success, marginLeft: SPACING.xs }]}>
              Completed! Great job! 🎉
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );

  const RestTimerModal = () => (
    <Modal
      visible={restTimer > 0}
      transparent={true}
      animationType="fade"
    >
      <BlurView style={styles.timerModalContainer} blurType="dark" blurAmount={10}>
        <Animated.View style={[styles.timerModal, { transform: [{ scale: timerAnim }] }]}>
          <Text style={[TEXT_STYLES.h1, styles.timerText]}>{restTimer}</Text>
          <Text style={[TEXT_STYLES.body, styles.timerLabel]}>Rest Time ⏰</Text>
          <Button
            mode="outlined"
            onPress={() => setRestTimer(0)}
            style={styles.skipButton}
            labelStyle={{ color: 'white' }}
          >
            Skip Rest
          </Button>
        </Animated.View>
      </BlurView>
    </Modal>
  );

  const WorkoutModal = () => (
    <Portal>
      <Modal
        visible={workoutModalVisible}
        onDismiss={() => setWorkoutModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.workoutModal}>
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h2, styles.modalTitle]}>
              {selectedWorkout?.title}
            </Text>
            <IconButton
              icon="close"
              onPress={() => setWorkoutModalVisible(false)}
            />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
              {selectedWorkout?.description}
            </Text>
            
            <View style={styles.modalStats}>
              <Surface style={styles.modalStat}>
                <Icon name="schedule" size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>Duration</Text>
                <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                  {selectedWorkout?.duration}
                </Text>
              </Surface>
              <Surface style={styles.modalStat}>
                <Icon name="fitness-center" size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>Exercises</Text>
                <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                  {selectedWorkout?.exercises}
                </Text>
              </Surface>
              <Surface style={styles.modalStat}>
                <Icon name="whatshot" size={24} color={COLORS.primary} />
                <Text style={[TEXT_STYLES.caption, styles.modalStatText]}>Calories</Text>
                <Text style={[TEXT_STYLES.body, styles.modalStatValue]}>
                  {selectedWorkout?.calories}
                </Text>
              </Surface>
            </View>

            <View style={styles.quickActions}>
              <Button
                mode="outlined"
                onPress={() => startRestTimer(60)}
                style={styles.quickAction}
                icon="timer"
              >
                1min Rest
              </Button>
              <Button
                mode="outlined"
                onPress={() => startRestTimer(90)}
                style={styles.quickAction}
                icon="timer"
              >
                90s Rest
              </Button>
              <Button
                mode="outlined"
                onPress={() => startRestTimer(120)}
                style={styles.quickAction}
                icon="timer"
              >
                2min Rest
              </Button>
            </View>
          </ScrollView>

          <Button
            mode="contained"
            onPress={startWorkout}
            style={styles.startButton}
            labelStyle={styles.startButtonText}
            icon="play-arrow"
          >
            Start Workout 🚀
          </Button>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
                Strength Training 💪
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.headerSubtitle]}>
                Build strength, gain power ⚡
              </Text>
            </View>
            <Avatar.Text
              size={50}
              label={user?.name?.charAt(0) || 'A'}
              style={styles.avatar}
            />
          </View>
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
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
          <WeeklyProgress />

          <View style={styles.section}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              Recent Achievements 🏆
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {achievements.map((achievement) => (
                <Card key={achievement.id} style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.lockedAchievement
                ]}>
                  <Text style={[TEXT_STYLES.body, styles.achievementTitle]}>
                    {achievement.title}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, styles.achievementDesc]}>
                    {achievement.description}
                  </Text>
                </Card>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                Workout Plans 🎯
              </Text>
              <TouchableOpacity onPress={() => Alert.alert('Coming Soon!', 'Custom workout builder is in development 🚧')}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.primary }]}>
                  Create Custom
                </Text>
              </TouchableOpacity>
            </View>

            <Searchbar
              placeholder="Search workouts..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              iconColor={COLORS.primary}
              inputStyle={TEXT_STYLES.body}
            />

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {categories.map((category) => (
                <Chip
                  key={category.key}
                  mode={selectedCategory === category.key ? 'flat' : 'outlined'}
                  onPress={() => setSelectedCategory(category.key)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.key && styles.selectedCategoryChip
                  ]}
                  textStyle={selectedCategory === category.key && { color: 'white' }}
                  icon={category.icon}
                >
                  {category.label}
                </Chip>
              ))}
            </ScrollView>

            {filteredWorkouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}

            {filteredWorkouts.length === 0 && (
              <Card style={styles.emptyState}>
                <Icon name="search-off" size={48} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.body, styles.emptyText]}>
                  No workouts found 🤷‍♂️
                </Text>
                <Text style={[TEXT_STYLES.caption, styles.emptySubtext]}>
                  Try adjusting your search or category filter
                </Text>
              </Card>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Feature Coming Soon! 🚧', 'Quick workout creation is in development')}
        color="white"
      />

      <WorkoutModal />
      <RestTimerModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
  },
  progressCard: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressGradient: {
    padding: SPACING.md,
  },
  progressHeader: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.md,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  achievementCard: {
    width: 140,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementTitle: {
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementDesc: {
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  categoryScroll: {
    marginBottom: SPACING.md,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  workoutCard: {
    marginBottom: SPACING.md,
    padding: SPACING.md,
    elevation: 2,
    borderRadius: 12,
  },
  completedCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutTitle: {
    color: COLORS.text,
    flex: 1,
  },
  streakBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginLeft: SPACING.sm,
  },
  streakText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  difficultyChip: {
    height: 28,
  },
  workoutDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
  },
  completedOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.2)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  workoutModal: {
    maxHeight: '80%',
    borderRadius: 16,
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
    flex: 1,
  },
  modalDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    elevation: 1,
  },
  modalStatText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  modalStatValue: {
    color: COLORS.text,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  quickAction: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerModal: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: SPACING.xl,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  timerText: {
    color: 'white',
    fontSize: 64,
    fontWeight: 'bold',
  },
  timerLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.md,
  },
  skipButton: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  emptySubtext: {
    color: COLORS.textSecondary,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default StrengthTraining;