import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Dimensions,
  TouchableOpacity,
  Text as RNText,
  Image,
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
  Modal,
  Text,
  Divider,
  Badge,
  ActivityIndicator,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const MobilityWorkout = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const mobilityData = useSelector(state => state.mobility.data);
  
  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [workoutTimer, setWorkoutTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedWorkouts, setCompletedWorkouts] = useState(3);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [mobilityScore, setMobilityScore] = useState(78);
  const [assessmentResults, setAssessmentResults] = useState({});
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Workout categories and filters
  const workoutFilters = [
    { id: 'all', label: 'All Workouts', icon: 'fitness-center' },
    { id: 'morning', label: 'Morning Flow', icon: 'wb-sunny' },
    { id: 'pre-workout', label: 'Pre-Workout', icon: 'play-arrow' },
    { id: 'post-workout', label: 'Recovery', icon: 'healing' },
    { id: 'targeted', label: 'Targeted', icon: 'my-location' },
    { id: 'full-body', label: 'Full Body', icon: 'accessibility' },
  ];
  
  // Mobility workout routines
  const mobilityWorkouts = [
    {
      id: 1,
      title: 'Morning Mobility Flow',
      category: 'morning',
      duration: 15,
      difficulty: 'Beginner',
      exercises: 8,
      targetAreas: ['Full Body', 'Spine', 'Hips'],
      description: 'Gentle morning routine to awaken your body and improve circulation',
      imageUri: 'https://via.placeholder.com/300x150/667eea/ffffff?text=Morning+Flow',
      rating: 4.8,
      completions: 1247,
      calories: 45,
      equipment: 'None',
      benefits: ['Increased flexibility', 'Better circulation', 'Reduced stiffness'],
      exerciseList: [
        { name: 'Cat-Cow Stretch', duration: 60, reps: 10, instructions: 'Flow between cat and cow positions slowly' },
        { name: 'Neck Rolls', duration: 45, reps: 8, instructions: 'Gentle circles in both directions' },
        { name: 'Shoulder Blade Squeezes', duration: 60, reps: 12, instructions: 'Squeeze shoulder blades together' },
        { name: 'Hip Circles', duration: 90, reps: 10, instructions: 'Large circles with hips, both directions' },
        { name: 'Spinal Twist', duration: 60, reps: 6, instructions: 'Gentle twists while seated' },
        { name: 'Ankle Rolls', duration: 45, reps: 10, instructions: 'Rotate ankles in full circles' },
        { name: 'Gentle Side Bends', duration: 60, reps: 8, instructions: 'Reach over head and bend sideways' },
        { name: 'Deep Breathing', duration: 120, reps: 5, instructions: 'Deep diaphragmatic breathing' },
      ],
    },
    {
      id: 2,
      title: 'Dynamic Pre-Workout Prep',
      category: 'pre-workout',
      duration: 12,
      difficulty: 'Intermediate',
      exercises: 10,
      targetAreas: ['Joints', 'Muscles', 'Neural Activation'],
      description: 'Dynamic movements to prepare your body for intense training',
      imageUri: 'https://via.placeholder.com/300x150/764ba2/ffffff?text=Pre-Workout',
      rating: 4.9,
      completions: 892,
      calories: 65,
      equipment: 'None',
      benefits: ['Injury prevention', 'Performance enhancement', 'Neural activation'],
      exerciseList: [
        { name: 'Leg Swings', duration: 45, reps: 15, instructions: 'Forward and backward leg swings' },
        { name: 'Arm Circles', duration: 30, reps: 10, instructions: 'Large and small circles' },
        { name: 'Butt Kicks', duration: 30, reps: 20, instructions: 'Dynamic heel to glutes' },
        { name: 'High Knees', duration: 30, reps: 20, instructions: 'Lift knees to hip level' },
        { name: 'Lunge with Twist', duration: 60, reps: 10, instructions: 'Step into lunge and rotate' },
        { name: 'Inchworms', duration: 45, reps: 8, instructions: 'Walk hands out to plank' },
        { name: 'Hip Flexor Stretch', duration: 60, reps: 6, instructions: 'Dynamic hip flexor opening' },
        { name: 'Shoulder Rolls', duration: 30, reps: 10, instructions: 'Large backward shoulder rolls' },
        { name: 'Torso Twists', duration: 45, reps: 12, instructions: 'Standing spinal rotation' },
        { name: 'Calf Raises', duration: 30, reps: 15, instructions: 'Rise onto toes and lower' },
      ],
    },
    {
      id: 3,
      title: 'Post-Workout Recovery Flow',
      category: 'post-workout',
      duration: 20,
      difficulty: 'Beginner',
      exercises: 12,
      targetAreas: ['Muscles', 'Fascia', 'Nervous System'],
      description: 'Restorative stretches to aid recovery and reduce muscle tension',
      imageUri: 'https://via.placeholder.com/300x150/4CAF50/ffffff?text=Recovery+Flow',
      rating: 4.7,
      completions: 1534,
      calories: 35,
      equipment: 'Optional: Yoga Block',
      benefits: ['Muscle relaxation', 'Improved recovery', 'Stress reduction'],
      exerciseList: [
        { name: 'Child\'s Pose', duration: 90, reps: 1, instructions: 'Relax in child\'s pose, breathe deeply' },
        { name: 'Pigeon Pose', duration: 120, reps: 2, instructions: 'Hold each side for deep hip opening' },
        { name: 'Seated Forward Fold', duration: 90, reps: 1, instructions: 'Gentle fold over extended legs' },
        { name: 'Supine Spinal Twist', duration: 90, reps: 2, instructions: 'Lying twist, hold each side' },
        { name: 'Happy Baby Pose', duration: 60, reps: 1, instructions: 'Rock gently side to side' },
        { name: 'Legs Up Wall', duration: 180, reps: 1, instructions: 'Restorative inversion pose' },
        { name: 'Hamstring Stretch', duration: 60, reps: 2, instructions: 'Gentle hamstring opening' },
        { name: 'Quad Stretch', duration: 45, reps: 2, instructions: 'Standing or lying quad stretch' },
        { name: 'Chest Opener', duration: 60, reps: 1, instructions: 'Open chest and shoulders' },
        { name: 'Gentle Backbend', duration: 45, reps: 3, instructions: 'Small supported backbends' },
        { name: 'Shoulder Stretch', duration: 45, reps: 2, instructions: 'Cross-body shoulder stretch' },
        { name: 'Savasana', duration: 300, reps: 1, instructions: 'Complete relaxation pose' },
      ],
    },
    {
      id: 4,
      title: 'Hip Mobility Specialist',
      category: 'targeted',
      duration: 18,
      difficulty: 'Intermediate',
      exercises: 9,
      targetAreas: ['Hips', 'Pelvis', 'Lower Back'],
      description: 'Focused routine to improve hip flexibility and reduce lower back tension',
      imageUri: 'https://via.placeholder.com/300x150/FF9800/ffffff?text=Hip+Mobility',
      rating: 4.6,
      completions: 672,
      calories: 55,
      equipment: 'None',
      benefits: ['Hip flexibility', 'Lower back relief', 'Better posture'],
      exerciseList: [
        { name: '90/90 Hip Stretch', duration: 90, reps: 2, instructions: 'Seated position, both legs at 90 degrees' },
        { name: 'Hip Flexor Lunge', duration: 75, reps: 2, instructions: 'Deep lunge position hold' },
        { name: 'Butterfly Stretch', duration: 90, reps: 1, instructions: 'Seated with soles together' },
        { name: 'Figure 4 Stretch', duration: 60, reps: 2, instructions: 'Lying or seated figure 4 position' },
        { name: 'Hip Circles', duration: 60, reps: 10, instructions: 'Large slow circles in both directions' },
        { name: 'Frog Stretch', duration: 120, reps: 1, instructions: 'Prone position, knees wide' },
        { name: 'Cossack Squats', duration: 60, reps: 10, instructions: 'Side to side deep squats' },
        { name: 'Lizard Pose', duration: 75, reps: 2, instructions: 'Low lunge with forearms down' },
        { name: 'Supine Hip Flexor', duration: 90, reps: 2, instructions: 'Lying hip flexor stretch' },
      ],
    },
    {
      id: 5,
      title: 'Shoulder & Thoracic Mobility',
      category: 'targeted',
      duration: 16,
      difficulty: 'Intermediate',
      exercises: 10,
      targetAreas: ['Shoulders', 'Upper Back', 'Neck'],
      description: 'Improve shoulder range of motion and upper body posture',
      imageUri: 'https://via.placeholder.com/300x150/9C27B0/ffffff?text=Shoulder+Mobility',
      rating: 4.5,
      completions: 543,
      calories: 48,
      equipment: 'Optional: Resistance Band',
      benefits: ['Shoulder mobility', 'Posture improvement', 'Neck tension relief'],
      exerciseList: [
        { name: 'Wall Angels', duration: 60, reps: 12, instructions: 'Back against wall, arms move up/down' },
        { name: 'Doorway Chest Stretch', duration: 75, reps: 2, instructions: 'Stretch in doorway opening' },
        { name: 'Overhead Reach', duration: 45, reps: 10, instructions: 'Alternate reaching overhead' },
        { name: 'Cross-Body Stretch', duration: 45, reps: 2, instructions: 'Pull arm across chest' },
        { name: 'Cat-Cow Thoracic', duration: 60, reps: 10, instructions: 'Focus on upper back movement' },
        { name: 'Wall Slides', duration: 60, reps: 12, instructions: 'Back to wall, slide arms up/down' },
        { name: 'Thread the Needle', duration: 60, reps: 8, instructions: 'Rotate arm under body' },
        { name: 'Shoulder Blade Pinches', duration: 45, reps: 15, instructions: 'Squeeze blades together' },
        { name: 'Neck Stretches', duration: 60, reps: 4, instructions: 'Gentle neck in all directions' },
        { name: 'Eagle Arms', duration: 45, reps: 2, instructions: 'Wrap arms and lift elbows' },
      ],
    },
    {
      id: 6,
      title: 'Full Body Flow & Restore',
      category: 'full-body',
      duration: 25,
      difficulty: 'All Levels',
      exercises: 15,
      targetAreas: ['Full Body', 'Mind', 'Spirit'],
      description: 'Comprehensive mobility routine addressing all major muscle groups',
      imageUri: 'https://via.placeholder.com/300x150/2196F3/ffffff?text=Full+Body+Flow',
      rating: 4.9,
      completions: 2134,
      calories: 78,
      equipment: 'Optional: Yoga Mat',
      benefits: ['Complete mobility', 'Stress relief', 'Mind-body connection'],
      exerciseList: [
        { name: 'Sun Salutation A', duration: 120, reps: 3, instructions: 'Flow through classic sequence' },
        { name: 'Warrior II Flow', duration: 90, reps: 2, instructions: 'Hold and flow between warriors' },
        { name: 'Triangle Pose', duration: 75, reps: 2, instructions: 'Extended side angle stretch' },
        { name: 'Downward Dog', duration: 90, reps: 3, instructions: 'Pedal feet, move hips' },
        { name: 'Low Lunge Flow', duration: 60, reps: 4, instructions: 'Flow between low lunge variations' },
        { name: 'Seated Spinal Wave', duration: 90, reps: 1, instructions: 'Wave motion through spine' },
        { name: 'Bridge Pose', duration: 60, reps: 3, instructions: 'Hip flexor opening backbend' },
        { name: 'Supine Twist', duration: 90, reps: 2, instructions: 'Gentle spinal rotation' },
        { name: 'Happy Baby', duration: 75, reps: 1, instructions: 'Rock and release lower back' },
        { name: 'Seated Forward Fold', duration: 120, reps: 1, instructions: 'Mindful forward folding' },
        { name: 'Fish Pose', duration: 60, reps: 2, instructions: 'Heart opening backbend' },
        { name: 'Legs Up Wall', duration: 180, reps: 1, instructions: 'Restorative inversion' },
        { name: 'Gentle Backbends', duration: 45, reps: 5, instructions: 'Small supported extensions' },
        { name: 'Final Relaxation', duration: 300, reps: 1, instructions: 'Complete body scan relaxation' },
        { name: 'Pranayama', duration: 180, reps: 1, instructions: 'Mindful breathing practice' },
      ],
    },
  ];
  
  // Mobility assessment questions
  const assessmentQuestions = [
    {
      id: 1,
      category: 'shoulders',
      question: 'Can you clasp your hands behind your back (one arm over, one under)?',
      points: { yes: 10, partial: 5, no: 0 },
    },
    {
      id: 2,
      category: 'hips',
      question: 'Can you sit cross-legged comfortably for 2+ minutes?',
      points: { yes: 10, partial: 5, no: 0 },
    },
    {
      id: 3,
      category: 'spine',
      question: 'Can you touch your toes without bending your knees?',
      points: { yes: 10, partial: 5, no: 0 },
    },
    {
      id: 4,
      category: 'neck',
      question: 'Can you look over each shoulder without moving your torso?',
      points: { yes: 10, partial: 5, no: 0 },
    },
    {
      id: 5,
      category: 'ankles',
      question: 'Can you squat down with heels flat on the ground?',
      points: { yes: 10, partial: 5, no: 0 },
    },
  ];
  
  // Filter workouts based on selected filter and search
  const filteredWorkouts = mobilityWorkouts.filter(workout => {
    const matchesFilter = selectedFilter === 'all' || workout.category === selectedFilter;
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.targetAreas.some(area => area.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  // Timer effect for workout sessions
  useEffect(() => {
    let interval;
    if (isTimerActive && activeWorkout) {
      interval = setInterval(() => {
        setWorkoutTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, activeWorkout]);
  
  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Progress animation
    Animated.timing(progressAnim, {
      toValue: completedWorkouts / weeklyGoal,
      duration: 1500,
      useNativeDriver: false,
    }).start();
    
    // Rotation animation for active states
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    
    if (isTimerActive) {
      rotateAnimation.start();
    } else {
      rotateAnimation.stop();
      rotateAnim.setValue(0);
    }
    
    return () => rotateAnimation.stop();
  }, [isTimerActive, completedWorkouts, weeklyGoal]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Connection Error', 'Unable to refresh workouts. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  const startWorkout = useCallback((workout) => {
    setActiveWorkout(workout);
    setCurrentExercise(0);
    setWorkoutTimer(0);
    setShowWorkoutModal(true);
    setIsTimerActive(true);
    Vibration.vibrate(50);
  }, []);
  
  const pauseResumeWorkout = useCallback(() => {
    setIsTimerActive(!isTimerActive);
    Vibration.vibrate(30);
  }, [isTimerActive]);
  
  const nextExercise = useCallback(() => {
    if (activeWorkout && currentExercise < activeWorkout.exerciseList.length - 1) {
      setCurrentExercise(prev => prev + 1);
      Vibration.vibrate(40);
    } else {
      completeWorkout();
    }
  }, [activeWorkout, currentExercise]);
  
  const completeWorkout = useCallback(() => {
    setIsTimerActive(false);
    setCompletedWorkouts(prev => prev + 1);
    Alert.alert(
      'Workout Complete! 🎉',
      `Great job! You completed "${activeWorkout?.title}" in ${Math.floor(workoutTimer / 60)}:${String(workoutTimer % 60).padStart(2, '0')}`,
      [
        { text: 'Cool Down', onPress: () => setShowWorkoutModal(false) },
        { text: 'Share Progress', onPress: () => Alert.alert('Feature Coming Soon', 'Social sharing will be available soon!') },
      ]
    );
    setShowWorkoutModal(false);
    setActiveWorkout(null);
  }, [activeWorkout, workoutTimer]);
  
  const startAssessment = useCallback(() => {
    setShowAssessmentModal(true);
    setAssessmentResults({});
  }, []);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };
  
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Mobility Workouts</Text>
              <Text style={styles.headerSubtitle}>Move Better • Feel Better</Text>
            </View>
            <Surface style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Mobility Score</Text>
              <Text style={styles.scoreValue}>{mobilityScore}%</Text>
            </Surface>
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Weekly Progress</Text>
              <Text style={styles.progressText}>{completedWorkouts}/{weeklyGoal} workouts</Text>
            </View>
            <Animated.View style={styles.progressBarContainer}>
              <ProgressBar
                progress={progressAnim}
                color="#ffffff"
                style={styles.progressBar}
              />
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
  
  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Surface style={styles.quickActionsCard}>
        <Text style={styles.quickActionsTitle}>Quick Start</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => startWorkout(mobilityWorkouts[0])}
          >
            <Icon name="wb-sunny" size={28} color={COLORS.warning} />
            <Text style={styles.quickActionText}>Morning Flow</Text>
            <Text style={styles.quickActionSubtext}>15 min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => startWorkout(mobilityWorkouts[2])}
          >
            <Icon name="healing" size={28} color={COLORS.success} />
            <Text style={styles.quickActionText}>Recovery</Text>
            <Text style={styles.quickActionSubtext}>20 min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={startAssessment}
          >
            <Icon name="assignment" size={28} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Assessment</Text>
            <Text style={styles.quickActionSubtext}>5 min</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => Alert.alert('Feature Coming Soon', 'Custom routines will be available soon!')}
          >
            <Icon name="add-circle" size={28} color={COLORS.secondary} />
            <Text style={styles.quickActionText}>Custom</Text>
            <Text style={styles.quickActionSubtext}>Build</Text>
          </TouchableOpacity>
        </View>
      </Surface>
    </View>
  );
  
  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {workoutFilters.map((filter) => (
          <Chip
            key={filter.id}
            mode={selectedFilter === filter.id ? 'flat' : 'outlined'}
            selected={selectedFilter === filter.id}
            onPress={() => setSelectedFilter(filter.id)}
            icon={filter.icon}
            style={[
              styles.filterChip,
              selectedFilter === filter.id && styles.selectedFilterChip,
            ]}
            textStyle={[
              styles.filterText,
              selectedFilter === filter.id && styles.selectedFilterText,
            ]}
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
  
  const renderWorkoutCard = ({ item }) => (
    <Card style={styles.workoutCard}>
      <View style={styles.workoutImageContainer}>
        <Image source={{ uri: item.imageUri }} style={styles.workoutImage} />
        <View style={styles.workoutImageOverlay}>
          <Chip
            mode="flat"
            style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
            textStyle={styles.difficultyText}
          >
            {item.difficulty}
          </Chip>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
      
      <Card.Content style={styles.workoutContent}>
        <Text style={styles.workoutTitle}>{item.title}</Text>
        <Text style={styles.workoutDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.workoutMetrics}>
          <View style={styles.metricItem}>
            <Icon name="timer" size={16} color={COLORS.primary} />
            <Text style={styles.metricText}>{item.duration} min</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="fitness-center" size={16} color={COLORS.primary} />
            <Text style={styles.metricText}>{item.exercises} exercises</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="local-fire-department" size={16} color={COLORS.error} />
            <Text style={styles.metricText}>{item.calories} cal</Text>
          </View>
        </View>
        
        <View style={styles.targetAreas}>
          {item.targetAreas.slice(0, 3).map((area, idx) => (
            <Chip
              key={idx}
              mode="outlined"
              compact
              style={styles.targetChip}
              textStyle={styles.targetText}
            >
              {area}
            </Chip>
          ))}
        </View>
        
        <View style={styles.workoutActions}>
          <Button
            mode="contained"
            onPress={() => startWorkout(item)}
            style={styles.startButton}
            icon="play-arrow"
          >
            Start Workout
          </Button>
          <IconButton
            icon="bookmark-outline"
            size={24}
            onPress={() => Alert.alert('Saved!', 'Workout saved to your favorites.')}
          />
        </View>
      </Card.Content>
    </Card>
  );
  
  const renderWorkoutModal = () => (
    <Portal>
      <Modal
        visible={showWorkoutModal}
        onDismiss={() => {
          setShowWorkoutModal(false);
          setIsTimerActive(false);
          setActiveWorkout(null);
        }}
        contentContainerStyle={styles.workoutModalContainer}
      >
        {activeWorkout && (
          <Surface style={styles.workoutModalContent}>
            <View style={styles.workoutModalHeader}>
              <View>
                <Text style={styles.workoutModalTitle}>{activeWorkout.title}</Text>
                <Text style={styles.workoutModalTimer}>{formatTime(workoutTimer)}</Text>
              </View>
              <Animated.View
                style={{
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }}
              >
                <IconButton
                  icon={isTimerActive ? "pause" : "play-arrow"}
                  size={32}
                  iconColor={COLORS.primary}
                  onPress={pauseResumeWorkout}
                />
              </Animated.View>
            </View>
            
            <ProgressBar
              progress={(currentExercise + 1) / activeWorkout.exerciseList.length}
              color={COLORS.primary}
              style={styles.workoutProgress}
            />
            
            <Text style={styles.exerciseCounter}>
              Exercise {currentExercise + 1} of {activeWorkout.exerciseList.length}
            </Text>
            
            <View style={styles.currentExercise}>
              <Text style={styles.exerciseName}>
                {activeWorkout.exerciseList[currentExercise]?.name}
              </Text>
              <Text style={styles.exerciseInstructions}>
                {activeWorkout.exerciseList[currentExercise]?.instructions}
              </Text>
              
              <View style={styles.exerciseDetails}>
                {activeWorkout.exerciseList[currentExercise]?.duration && (
                  <View style={styles.exerciseDetail}>
                    <Icon name="timer" size={20} color={COLORS.primary} />
                    <Text style={styles.exerciseDetailText}>
                      {activeWorkout.exerciseList[currentExercise].duration}s
                    </Text>
                  </View>
                )}
                {activeWorkout.exerciseList[currentExercise]?.reps && (
                  <View style={styles.exerciseDetail}>
                    <Icon name="repeat" size={20} color={COLORS.primary} />
                    <Text style={styles.exerciseDetailText}>
                      {activeWorkout.exerciseList[currentExercise].reps} reps
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.workoutControls}>
              <Button
                mode="outlined"
                onPress={() => setCurrentExercise(Math.max(0, currentExercise - 1))}
                disabled={currentExercise === 0}
                style={styles.controlButton}
              >
                Previous
              </Button>
              <Button
                mode="contained"
                onPress={nextExercise}
                style={styles.controlButton}
              >
                {currentExercise === activeWorkout.exerciseList.length - 1 ? 'Complete' : 'Next'}
              </Button>
            </View>
          </Surface>
        )}
      </Modal>
    </Portal>
  );
  
  const renderAssessmentModal = () => (
    <Portal>
      <Modal
        visible={showAssessmentModal}
        onDismiss={() => setShowAssessmentModal(false)}
        contentContainerStyle={styles.assessmentModalContainer}
      >
        <Surface style={styles.assessmentModalContent}>
          <View style={styles.assessmentHeader}>
            <Text style={styles.assessmentTitle}>Mobility Assessment</Text>
            <Text style={styles.assessmentSubtitle}>
              Answer honestly to get personalized recommendations
            </Text>
          </View>
          
          <ScrollView style={styles.assessmentQuestions}>
            {assessmentQuestions.map((question, index) => (
              <View key={question.id} style={styles.questionContainer}>
                <Text style={styles.questionText}>{question.question}</Text>
                <View style={styles.answerOptions}>
                  {['yes', 'partial', 'no'].map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.answerOption,
                        assessmentResults[question.id] === option && styles.selectedAnswer
                      ]}
                      onPress={() => setAssessmentResults(prev => ({
                        ...prev,
                        [question.id]: option
                      }))}
                    >
                      <Text style={[
                        styles.answerText,
                        assessmentResults[question.id] === option && styles.selectedAnswerText
                      ]}>
                        {option === 'yes' ? '✓ Yes' : option === 'partial' ? '◐ Somewhat' : '✗ No'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.assessmentActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAssessmentModal(false)}
              style={styles.assessmentButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                const totalQuestions = assessmentQuestions.length;
                const answeredQuestions = Object.keys(assessmentResults).length;
                
                if (answeredQuestions < totalQuestions) {
                  Alert.alert('Incomplete', 'Please answer all questions to complete the assessment.');
                  return;
                }
                
                const totalScore = assessmentQuestions.reduce((sum, q) => {
                  return sum + q.points[assessmentResults[q.id]];
                }, 0);
                
                const maxScore = assessmentQuestions.length * 10;
                const scorePercentage = Math.round((totalScore / maxScore) * 100);
                
                setMobilityScore(scorePercentage);
                setShowAssessmentModal(false);
                
                Alert.alert(
                  'Assessment Complete! 📊',
                  `Your mobility score: ${scorePercentage}%\n\nRecommendations will be updated based on your results.`,
                  [{ text: 'View Recommendations', onPress: () => {} }]
                );
              }}
              style={styles.assessmentButton}
            >
              Complete Assessment
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor="#ffffff"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderQuickActions()}
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search mobility workouts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor={COLORS.primary}
          />
        </View>
        
        {renderFilterChips()}
        
        <View style={styles.workoutsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'all' ? 'All Workouts' : workoutFilters.find(f => f.id === selectedFilter)?.label}
            ({filteredWorkouts.length})
          </Text>
          
          {filteredWorkouts.length === 0 ? (
            <Surface style={styles.emptyState}>
              <Icon name="search-off" size={48} color={COLORS.primary} />
              <Text style={styles.emptyStateTitle}>No workouts found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filter criteria
              </Text>
            </Surface>
          ) : (
            filteredWorkouts.map((workout) => (
              <View key={workout.id}>
                {renderWorkoutCard({ item: workout })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      {renderWorkoutModal()}
      {renderAssessmentModal()}
      
      <FAB
        style={styles.fab}
        icon="timeline"
        onPress={() => Alert.alert('Feature Coming Soon', 'Progress tracking dashboard coming soon!')}
        color="#ffffff"
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
    paddingTop: 50,
    paddingBottom: SPACING.large,
    paddingHorizontal: SPACING.medium,
  },
  headerContent: {
    marginTop: SPACING.small,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.medium,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  scoreContainer: {
    padding: SPACING.small,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  scoreLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  scoreValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  progressSection: {
    marginTop: SPACING.small,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
  },
  progressBarContainer: {
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING.medium,
    marginTop: SPACING.small,
  },
  quickActionsCard: {
    padding: SPACING.medium,
    borderRadius: 12,
    elevation: 2,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.medium,
    color: COLORS.text,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionItem: {
    alignItems: 'center',
    padding: SPACING.small,
    borderRadius: 8,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  quickActionSubtext: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  searchContainer: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: '#ffffff',
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  filterContainer: {
    marginVertical: SPACING.small,
  },
  filterScroll: {
    paddingHorizontal: SPACING.medium,
  },
  filterChip: {
    marginRight: SPACING.small,
    backgroundColor: '#ffffff',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
  },
  selectedFilterText: {
    color: '#ffffff',
  },
  workoutsContainer: {
    paddingHorizontal: SPACING.medium,
    marginTop: SPACING.medium,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.medium,
    color: COLORS.text,
  },
  workoutCard: {
    marginBottom: SPACING.medium,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  workoutImageContainer: {
    position: 'relative',
  },
  workoutImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  workoutImageOverlay: {
    position: 'absolute',
    top: SPACING.small,
    left: SPACING.small,
    right: SPACING.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  difficultyChip: {
    elevation: 2,
  },
  difficultyText: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    marginLeft: SPACING.xs,
  },
  workoutContent: {
    padding: SPACING.medium,
  },
  workoutTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  workoutDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.small,
    lineHeight: 20,
  },
  workoutMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.small,
    paddingVertical: SPACING.small,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    color: COLORS.text,
  },
  targetAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.small,
  },
  targetChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
    height: 28,
  },
  targetText: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  startButton: {
    flex: 1,
    marginRight: SPACING.small,
  },
  workoutModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  workoutModalContent: {
    margin: SPACING.medium,
    borderRadius: 16,
    padding: SPACING.large,
    maxHeight: '80%',
  },
  workoutModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  workoutModalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
  },
  workoutModalTimer: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  workoutProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.small,
  },
  exerciseCounter: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.medium,
  },
  currentExercise: {
    padding: SPACING.large,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.large,
  },
  exerciseName: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.small,
  },
  exerciseInstructions: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.medium,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.large,
  },
  exerciseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseDetailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    color: COLORS.text,
    fontWeight: '600',
  },
  workoutControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.medium,
  },
  controlButton: {
    flex: 1,
  },
  assessmentModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  assessmentModalContent: {
    margin: SPACING.medium,
    borderRadius: 16,
    padding: SPACING.large,
    maxHeight: '80%',
  },
  assessmentHeader: {
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  assessmentTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  assessmentSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  assessmentQuestions: {
    flex: 1,
    marginBottom: SPACING.large,
  },
  questionContainer: {
    marginBottom: SPACING.large,
  },
  questionText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.small,
    lineHeight: 22,
  },
  answerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  answerOption: {
    flex: 1,
    padding: SPACING.small,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  selectedAnswer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  answerText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
  },
  selectedAnswerText: {
    color: '#ffffff',
  },
  assessmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.medium,
  },
  assessmentButton: {
    flex: 1,
  },
  emptyState: {
    padding: SPACING.large,
    alignItems: 'center',
    borderRadius: 12,
    elevation: 1,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    marginTop: SPACING.medium,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MobilityWorkout;