import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  Alert,
  Vibration,
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
  Divider,
  Searchbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
  flexibility: '#9b59b6',
  mobility: '#3498db',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const FlexibilityMobility = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const stretchTimerAnim = useRef(new Animated.Value(0)).current;

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [currentStretch, setCurrentStretch] = useState(0);
  const [stretchTimer, setStretchTimer] = useState(0);
  const [isStretching, setIsStretching] = useState(false);
  const [completedStretches, setCompletedStretches] = useState(new Set());
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState({
    monday: false,
    tuesday: true,
    wednesday: true,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
  });

  // Mock data
  const categories = [
    { id: 'all', name: 'All', icon: 'fitness-center', color: COLORS.primary },
    { id: 'flexibility', name: 'Flexibility', icon: 'self-improvement', color: COLORS.flexibility },
    { id: 'mobility', name: 'Mobility', icon: 'accessibility', color: COLORS.mobility },
    { id: 'warmup', name: 'Warm-up', icon: 'whatshot', color: COLORS.warning },
    { id: 'cooldown', name: 'Cool-down', icon: 'ac-unit', color: COLORS.success },
  ];

  const routines = [
    {
      id: 'morning_flow',
      name: 'Morning Flow 🌅',
      category: 'flexibility',
      duration: 15,
      difficulty: 'Beginner',
      description: 'Gentle morning stretches to wake up your body',
      exercises: 8,
      calories: 35,
      image: '🧘‍♀️',
      stretches: [
        { name: 'Cat-Cow Stretch', duration: 60, instructions: 'Alternate between arching and rounding your back' },
        { name: 'Child\'s Pose', duration: 90, instructions: 'Sit back on heels, extend arms forward' },
        { name: 'Downward Dog', duration: 75, instructions: 'Form inverted V-shape with your body' },
        { name: 'Forward Fold', duration: 60, instructions: 'Hang forward from hips, let arms dangle' },
      ]
    },
    {
      id: 'athlete_mobility',
      name: 'Athlete Mobility 💪',
      category: 'mobility',
      duration: 25,
      difficulty: 'Intermediate',
      description: 'Dynamic movements for athletic performance',
      exercises: 12,
      calories: 65,
      image: '🏃‍♂️',
      stretches: [
        { name: 'Hip Circles', duration: 45, instructions: 'Large circular movements with hips' },
        { name: 'Leg Swings', duration: 60, instructions: 'Forward and back leg swings' },
        { name: 'Arm Circles', duration: 30, instructions: 'Large circular arm movements' },
        { name: 'Torso Twists', duration: 45, instructions: 'Rotate torso left and right' },
      ]
    },
    {
      id: 'deep_stretch',
      name: 'Deep Stretch 🧘',
      category: 'flexibility',
      duration: 30,
      difficulty: 'Advanced',
      description: 'Intense stretches for maximum flexibility gains',
      exercises: 10,
      calories: 45,
      image: '🤸‍♀️',
      stretches: [
        { name: 'Pigeon Pose', duration: 120, instructions: 'Hip opener, hold each side' },
        { name: 'Seated Spinal Twist', duration: 90, instructions: 'Deep spinal rotation' },
        { name: 'Butterfly Stretch', duration: 105, instructions: 'Soles together, gently press knees down' },
        { name: 'Cobra Pose', duration: 75, instructions: 'Gentle backbend, chest up' },
      ]
    },
    {
      id: 'pre_workout',
      name: 'Pre-Workout 🔥',
      category: 'warmup',
      duration: 10,
      difficulty: 'Beginner',
      description: 'Quick dynamic warm-up routine',
      exercises: 6,
      calories: 25,
      image: '🔥',
      stretches: [
        { name: 'Jumping Jacks', duration: 30, instructions: 'Light cardio activation' },
        { name: 'High Knees', duration: 30, instructions: 'Bring knees to chest level' },
        { name: 'Butt Kicks', duration: 30, instructions: 'Kick heels to glutes' },
        { name: 'Arm Swings', duration: 30, instructions: 'Cross-body arm swings' },
      ]
    },
    {
      id: 'post_workout',
      name: 'Post-Workout 😌',
      category: 'cooldown',
      duration: 12,
      difficulty: 'Beginner',
      description: 'Relaxing cool-down stretches',
      exercises: 7,
      calories: 20,
      image: '😌',
      stretches: [
        { name: 'Hamstring Stretch', duration: 60, instructions: 'Reach for toes, straight legs' },
        { name: 'Quad Stretch', duration: 45, instructions: 'Pull heel to glutes' },
        { name: 'Calf Stretch', duration: 45, instructions: 'Press heel down, lean forward' },
        { name: 'Shoulder Stretch', duration: 30, instructions: 'Cross arm over chest' },
      ]
    },
  ];

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  useEffect(() => {
    let interval;
    if (isStretching && stretchTimer > 0) {
      interval = setInterval(() => {
        setStretchTimer(prev => {
          if (prev <= 1) {
            handleStretchComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStretching, stretchTimer]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      Alert.alert('Error', 'Failed to load flexibility routines');
    } finally {
      setLoading(false);
    }
  };

  const startAnimations = () => {
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
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  const filteredRoutines = routines.filter(routine => {
    const matchesCategory = selectedCategory === 'all' || routine.category === selectedCategory;
    const matchesSearch = routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routine.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const startRoutine = (routine) => {
    setActiveRoutine(routine);
    setCurrentStretch(0);
    setCompletedStretches(new Set());
    setShowRoutineModal(true);
    Vibration.vibrate(100);
  };

  const startStretch = () => {
    if (activeRoutine && activeRoutine.stretches[currentStretch]) {
      const duration = activeRoutine.stretches[currentStretch].duration;
      setStretchTimer(duration);
      setIsStretching(true);
      
      // Animate progress bar
      Animated.timing(stretchTimerAnim, {
        toValue: 1,
        duration: duration * 1000,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleStretchComplete = () => {
    setIsStretching(false);
    const newCompleted = new Set(completedStretches);
    newCompleted.add(currentStretch);
    setCompletedStretches(newCompleted);
    
    Vibration.vibrate([100, 50, 100]);
    
    if (currentStretch < activeRoutine.stretches.length - 1) {
      Alert.alert(
        'Stretch Complete! 🎉',
        'Great job! Ready for the next stretch?',
        [
          { text: 'Rest More', style: 'cancel' },
          { 
            text: 'Next Stretch', 
            onPress: () => {
              setCurrentStretch(prev => prev + 1);
              stretchTimerAnim.setValue(0);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Routine Complete! 🌟',
        'Excellent work! You\'ve completed the entire routine.',
        [
          { text: 'Finish', onPress: () => setShowRoutineModal(false) }
        ]
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.flexibility, COLORS.mobility]}
      style={styles.header}
    >
      <Text style={styles.headerTitle}>Flexibility & Mobility 🧘‍♀️</Text>
      <Text style={styles.headerSubtitle}>Stay flexible, stay strong</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>7</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>145</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>23</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderWeeklyProgress = () => (
    <Card style={styles.progressCard} elevation={2}>
      <Card.Content>
        <Text style={styles.sectionTitle}>Weekly Progress 📅</Text>
        <View style={styles.weekContainer}>
          {Object.entries(weeklyProgress).map(([day, completed], index) => (
            <TouchableOpacity key={day} style={styles.dayContainer}>
              <View style={[
                styles.dayCircle,
                completed && styles.completedDay,
                index === new Date().getDay() && styles.todayDay,
              ]}>
                <Text style={[
                  styles.dayText,
                  completed && styles.completedDayText,
                ]}>
                  {day.charAt(0).toUpperCase()}
                </Text>
              </View>
              {completed && (
                <Icon 
                  name="check-circle" 
                  size={12} 
                  color={COLORS.success} 
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <ProgressBar 
          progress={Object.values(weeklyProgress).filter(Boolean).length / 7}
          color={COLORS.success}
          style={styles.weekProgressBar}
        />
      </Card.Content>
    </Card>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchContainer}>
      <Searchbar
        placeholder="Search routines..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={styles.categoryItem}
          >
            <Chip
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && { backgroundColor: category.color }
              ]}
              textStyle={[
                selectedCategory === category.id && { color: 'white' }
              ]}
              icon={() => (
                <Icon 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? 'white' : category.color} 
                />
              )}
            >
              {category.name}
            </Chip>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRoutineCard = (routine) => {
    const categoryColor = categories.find(cat => cat.id === routine.category)?.color || COLORS.primary;
    
    return (
      <Card key={routine.id} style={styles.routineCard} elevation={3}>
        <TouchableOpacity 
          onPress={() => startRoutine(routine)}
          style={styles.routineContent}
        >
          <LinearGradient
            colors={[categoryColor, `${categoryColor}AA`]}
            style={styles.routineHeader}
          >
            <Text style={styles.routineEmoji}>{routine.image}</Text>
            <View style={styles.routineInfo}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineDescription}>{routine.description}</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.routineStats}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Icon name="timer" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{routine.duration} min</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{routine.exercises} exercises</Text>
              </View>
            </View>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Icon name="local-fire-department" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{routine.calories} cal</Text>
              </View>
              <Chip 
                mode="outlined" 
                style={styles.difficultyChip}
                compact
              >
                {routine.difficulty}
              </Chip>
            </View>
          </View>
          
          <View style={styles.routineActions}>
            <Button
              mode="contained"
              style={[styles.startButton, { backgroundColor: categoryColor }]}
              onPress={() => startRoutine(routine)}
              icon="play-arrow"
            >
              Start Routine
            </Button>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderActiveRoutineModal = () => (
    <Portal>
      <Modal 
        visible={showRoutineModal} 
        onDismiss={() => setShowRoutineModal(false)}
        style={styles.modalContainer}
      >
        <Card style={styles.routineModal} elevation={8}>
          {activeRoutine && (
            <>
              <LinearGradient
                colors={[COLORS.flexibility, COLORS.mobility]}
                style={styles.modalHeader}
              >
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>{activeRoutine.name}</Text>
                  <IconButton
                    icon="close"
                    iconColor="white"
                    onPress={() => setShowRoutineModal(false)}
                  />
                </View>
                <Text style={styles.modalSubtitle}>
                  Stretch {currentStretch + 1} of {activeRoutine.stretches.length}
                </Text>
              </LinearGradient>
              
              <Card.Content style={styles.modalContent}>
                {activeRoutine.stretches[currentStretch] && (
                  <>
                    <Text style={styles.stretchName}>
                      {activeRoutine.stretches[currentStretch].name}
                    </Text>
                    <Text style={styles.stretchInstructions}>
                      {activeRoutine.stretches[currentStretch].instructions}
                    </Text>
                    
                    <View style={styles.timerContainer}>
                      <Text style={styles.timerDisplay}>
                        {formatTime(stretchTimer)}
                      </Text>
                      <Animated.View style={styles.timerProgressContainer}>
                        <ProgressBar
                          progress={stretchTimer > 0 ? 
                            (activeRoutine.stretches[currentStretch].duration - stretchTimer) / 
                            activeRoutine.stretches[currentStretch].duration : 0
                          }
                          color={COLORS.success}
                          style={styles.timerProgress}
                        />
                      </Animated.View>
                    </View>
                    
                    <View style={styles.stretchControls}>
                      {!isStretching ? (
                        <Button
                          mode="contained"
                          onPress={startStretch}
                          style={styles.startStretchButton}
                          icon="play-arrow"
                        >
                          Start Stretch
                        </Button>
                      ) : (
                        <Button
                          mode="outlined"
                          onPress={() => {
                            setIsStretching(false);
                            setStretchTimer(0);
                            stretchTimerAnim.setValue(0);
                          }}
                          style={styles.stopButton}
                          icon="pause"
                        >
                          Pause
                        </Button>
                      )}
                      
                      {currentStretch > 0 && (
                        <Button
                          mode="text"
                          onPress={() => {
                            setCurrentStretch(prev => prev - 1);
                            setIsStretching(false);
                            setStretchTimer(0);
                            stretchTimerAnim.setValue(0);
                          }}
                          icon="skip-previous"
                        >
                          Previous
                        </Button>
                      )}
                    </View>
                    
                    <View style={styles.progressIndicators}>
                      {activeRoutine.stretches.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.progressDot,
                            index === currentStretch && styles.activeDot,
                            completedStretches.has(index) && styles.completedDot,
                          ]}
                        />
                      ))}
                    </View>
                  </>
                )}
              </Card.Content>
            </>
          )}
        </Card>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.flexibility} translucent />
        <LinearGradient
          colors={[COLORS.flexibility, COLORS.mobility]}
          style={styles.loadingGradient}
        >
          <Icon name="self-improvement" size={60} color="white" />
          <Text style={styles.loadingText}>Loading Routines...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.flexibility} translucent />
      
      <Animated.ScrollView
        style={[styles.scrollContainer, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.flexibility]}
            progressBackgroundColor="white"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        
        <Animated.View
          style={[
            styles.content,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {renderWeeklyProgress()}
          {renderSearchAndFilters()}
          
          <View style={styles.routinesContainer}>
            <Text style={styles.sectionTitle}>Available Routines 🏋️‍♀️</Text>
            {filteredRoutines.map(routine => renderRoutineCard(routine))}
          </View>
        </Animated.View>
      </Animated.ScrollView>

      {renderActiveRoutineModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert(
            'Create Custom Routine',
            'This feature is coming soon! You\'ll be able to create personalized flexibility routines.',
            [{ text: 'OK' }]
          );
        }}
        color="white"
      />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginTop: SPACING.md,
  },
  scrollContainer: {
    flex: 1,
  },
  
  // Header
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: SPACING.md,
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
    color: 'rgba(255,255,255,0.8)',
  },

  content: {
    padding: SPACING.md,
    paddingBottom: 100,
  },

  // Weekly Progress
  progressCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  dayContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedDay: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  todayDay: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  dayText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  completedDayText: {
    color: 'white',
  },
  checkIcon: {
    position: 'absolute',
    bottom: -6,
    right: -2,
  },
  weekProgressBar: {
    height: 6,
    borderRadius: 3,
  },

  // Search and Filters
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchbar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: SPACING.sm,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.xs,
  },
  categoryItem: {
    marginHorizontal: SPACING.xs,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },

  // Routines
  routinesContainer: {
    marginBottom: SPACING.xl,
  },
  routineCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  routineContent: {
    flex: 1,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  routineEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  routineDescription: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
  },
  routineStats: {
    padding: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  difficultyChip: {
    height: 28,
  },
  routineActions: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  startButton: {
    borderRadius: 25,
  },

  // Modal
  modalContainer: {
    margin: SPACING.lg,
  },
  routineModal: {
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    padding: SPACING.lg,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
  },
  modalSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  stretchName: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  stretchInstructions: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    color: COLORS.textSecondary,
  },

  // Timer
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  timerProgressContainer: {
    width: '100%',
  },
  timerProgress: {
    height: 8,
    borderRadius: 4,
  },

  // Controls
  stretchControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  startStretchButton: {
    backgroundColor: COLORS.success,
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },
  stopButton: {
    borderColor: COLORS.error,
    borderRadius: 25,
    paddingHorizontal: SPACING.lg,
  },

  // Progress Indicators
  progressIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  completedDot: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.flexibility,
  },
};

export default FlexibilityMobility;