import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Vibration,
  Alert,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Button,
  IconButton,
  FAB,
  Surface,
  ProgressBar,
  Chip,
  Avatar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
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
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const WorkoutTimer = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, workoutSession } = useSelector(state => ({
    user: state.auth.user,
    workoutSession: state.training.currentSession,
  }));

  // Timer States
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);

  // Workout Data
  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: 'Push-ups',
      sets: 3,
      reps: 15,
      restTime: 60,
      weight: null,
      completed: false,
      completedSets: [],
    },
    {
      id: 2,
      name: 'Squats',
      sets: 4,
      reps: 12,
      restTime: 90,
      weight: null,
      completed: false,
      completedSets: [],
    },
    {
      id: 3,
      name: 'Plank',
      sets: 3,
      reps: null,
      duration: 60,
      restTime: 45,
      completed: false,
      completedSets: [],
    },
  ]);

  // Performance Tracking
  const [sessionStats, setSessionStats] = useState({
    startTime: null,
    endTime: null,
    totalSets: 0,
    completedSets: 0,
    caloriesBurned: 0,
    heartRate: [],
  });

  // UI States
  const [refreshing, setRefreshing] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);

  // Animation Values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerScale = useRef(new Animated.Value(1)).current;

  // Timer Refs
  const timerInterval = useRef(null);
  const restInterval = useRef(null);

  // Initialize animations
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

    // Pulse animation for active timer
    const startPulse = () => {
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

    if (isRunning) startPulse();
  }, [isRunning]);

  // Main timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerInterval.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
        setTotalWorkoutTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
    }

    return () => clearInterval(timerInterval.current);
  }, [isRunning, isPaused]);

  // Rest timer logic
  useEffect(() => {
    if (isResting && restTime > 0) {
      restInterval.current = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            setIsResting(false);
            setShowRestModal(false);
            Vibration.vibrate([0, 500, 200, 500]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(restInterval.current);
    }

    return () => clearInterval(restInterval.current);
  }, [isResting, restTime]);

  // Format time helper
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start workout
  const startWorkout = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    if (!sessionStats.startTime) {
      setSessionStats(prev => ({
        ...prev,
        startTime: new Date(),
      }));
    }
    
    Animated.sequence([
      Animated.timing(timerScale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(timerScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Vibration.vibrate(100);
  }, [sessionStats.startTime]);

  // Pause workout
  const pauseWorkout = useCallback(() => {
    setIsPaused(!isPaused);
    Vibration.vibrate(50);
  }, [isPaused]);

  // Stop workout
  const stopWorkout = useCallback(() => {
    Alert.alert(
      'Stop Workout? 🏃‍♂️',
      'Are you sure you want to stop your workout session?',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);
            setIsPaused(false);
            setCurrentTime(0);
            setSessionStats(prev => ({
              ...prev,
              endTime: new Date(),
            }));
            clearInterval(timerInterval.current);
            clearInterval(restInterval.current);
          },
        },
      ]
    );
  }, []);

  // Complete set
  const completeSet = useCallback((exerciseIndex, setNumber, reps, weight) => {
    const updatedExercises = [...exercises];
    const exercise = updatedExercises[exerciseIndex];
    
    exercise.completedSets.push({
      setNumber,
      reps,
      weight,
      timestamp: new Date(),
    });

    if (exercise.completedSets.length >= exercise.sets) {
      exercise.completed = true;
    }

    setExercises(updatedExercises);
    setSessionStats(prev => ({
      ...prev,
      completedSets: prev.completedSets + 1,
    }));

    // Start rest timer
    if (!exercise.completed && exercise.restTime > 0) {
      setRestTime(exercise.restTime);
      setIsResting(true);
      setShowRestModal(true);
    }

    Vibration.vibrate([0, 100, 50, 100]);
  }, [exercises]);

  // Next exercise
  const nextExercise = useCallback(() => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setCurrentSet(1);
    }
  }, [currentExercise, exercises.length]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Calculate progress
  const overallProgress = exercises.reduce((total, exercise) => {
    return total + (exercise.completedSets.length / exercise.sets);
  }, 0) / exercises.length;

  const currentExerciseData = exercises[currentExercise];

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Workout Timer</Text>
            <Text style={styles.headerSubtitle}>
              {isRunning ? '🔥 Active Session' : '💪 Ready to Start'}
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'More options will be available in the next update.')}
          />
        </View>
      </LinearGradient>

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
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Main Timer Card */}
          <Card style={styles.timerCard} elevation={4}>
            <LinearGradient
              colors={isRunning ? [COLORS.success, COLORS.primary] : [COLORS.primary, COLORS.secondary]}
              style={styles.timerGradient}
            >
              <Animated.View
                style={[
                  styles.timerContainer,
                  {
                    transform: [
                      { scale: isRunning ? pulseAnim : timerScale },
                    ],
                  },
                ]}
              >
                <Text style={styles.timerLabel}>
                  {isResting ? '💤 Rest Time' : '⏱️ Workout Time'}
                </Text>
                <Text style={styles.timerText}>
                  {isResting ? formatTime(restTime) : formatTime(currentTime)}
                </Text>
                <View style={styles.timerActions}>
                  {!isRunning ? (
                    <Button
                      mode="contained"
                      onPress={startWorkout}
                      style={styles.startButton}
                      buttonColor="white"
                      textColor={COLORS.primary}
                    >
                      🚀 Start Workout
                    </Button>
                  ) : (
                    <View style={styles.timerButtonRow}>
                      <IconButton
                        icon={isPaused ? "play-arrow" : "pause"}
                        iconColor="white"
                        size={32}
                        onPress={pauseWorkout}
                        style={styles.timerIconButton}
                      />
                      <IconButton
                        icon="stop"
                        iconColor="white"
                        size={32}
                        onPress={stopWorkout}
                        style={styles.timerIconButton}
                      />
                    </View>
                  )}
                </View>
              </Animated.View>
            </LinearGradient>
          </Card>

          {/* Progress Overview */}
          <Card style={styles.progressCard} elevation={2}>
            <Card.Content>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>📊 Overall Progress</Text>
                <Chip mode="outlined" style={styles.progressChip}>
                  {Math.round(overallProgress * 100)}%
                </Chip>
              </View>
              <ProgressBar
                progress={overallProgress}
                color={COLORS.success}
                style={styles.progressBar}
              />
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{sessionStats.completedSets}</Text>
                  <Text style={styles.statLabel}>Sets Done</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatTime(totalWorkoutTime)}</Text>
                  <Text style={styles.statLabel}>Total Time</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round(totalWorkoutTime * 0.1)}</Text>
                  <Text style={styles.statLabel}>Calories</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Current Exercise */}
          {currentExerciseData && (
            <Card style={styles.exerciseCard} elevation={3}>
              <Card.Content>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseTitle}>
                      🎯 {currentExerciseData.name}
                    </Text>
                    <Text style={styles.exerciseSubtitle}>
                      Set {currentSet} of {currentExerciseData.sets}
                    </Text>
                  </View>
                  <Avatar.Text
                    size={40}
                    label={`${currentExercise + 1}`}
                    style={styles.exerciseNumber}
                  />
                </View>

                <View style={styles.exerciseDetails}>
                  {currentExerciseData.reps && (
                    <Chip icon="fitness-center" style={styles.detailChip}>
                      {currentExerciseData.reps} reps
                    </Chip>
                  )}
                  {currentExerciseData.duration && (
                    <Chip icon="timer" style={styles.detailChip}>
                      {currentExerciseData.duration}s
                    </Chip>
                  )}
                  <Chip icon="schedule" style={styles.detailChip}>
                    {currentExerciseData.restTime}s rest
                  </Chip>
                </View>

                <View style={styles.setProgress}>
                  <ProgressBar
                    progress={currentExerciseData.completedSets.length / currentExerciseData.sets}
                    color={COLORS.accent}
                    style={styles.setProgressBar}
                  />
                </View>

                <View style={styles.exerciseActions}>
                  <Button
                    mode="contained"
                    onPress={() => completeSet(currentExercise, currentSet, currentExerciseData.reps, null)}
                    style={styles.completeSetButton}
                    disabled={currentExerciseData.completed}
                  >
                    ✅ Complete Set
                  </Button>
                  {currentExerciseData.completed && (
                    <Button
                      mode="outlined"
                      onPress={nextExercise}
                      style={styles.nextExerciseButton}
                      disabled={currentExercise >= exercises.length - 1}
                    >
                      ➡️ Next Exercise
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Exercise List */}
          <Text style={styles.sectionTitle}>📋 Today's Exercises</Text>
          {exercises.map((exercise, index) => (
            <Card
              key={exercise.id}
              style={[
                styles.exerciseListCard,
                index === currentExercise && styles.activeExerciseCard,
              ]}
              elevation={index === currentExercise ? 4 : 1}
            >
              <Card.Content>
                <View style={styles.exerciseListItem}>
                  <View style={styles.exerciseListInfo}>
                    <Text style={[
                      styles.exerciseListTitle,
                      exercise.completed && styles.completedText,
                    ]}>
                      {exercise.completed ? '✅' : '⭕'} {exercise.name}
                    </Text>
                    <Text style={styles.exerciseListSubtitle}>
                      {exercise.completedSets.length}/{exercise.sets} sets
                    </Text>
                  </View>
                  <View style={styles.exerciseListActions}>
                    <ProgressBar
                      progress={exercise.completedSets.length / exercise.sets}
                      color={exercise.completed ? COLORS.success : COLORS.primary}
                      style={styles.exerciseListProgress}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard} elevation={2}>
            <Card.Content>
              <Text style={styles.quickActionsTitle}>⚡ Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Heart rate monitoring will be available soon.')}
                >
                  <Icon name="favorite" size={24} color={COLORS.error} />
                  <Text style={styles.quickActionText}>Heart Rate</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Music integration coming soon.')}
                >
                  <Icon name="music-note" size={24} color={COLORS.primary} />
                  <Text style={styles.quickActionText}>Music</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Video guidance will be available soon.')}
                >
                  <Icon name="play-circle-filled" size={24} color={COLORS.accent} />
                  <Text style={styles.quickActionText}>Video Guide</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => Alert.alert('Feature Coming Soon! 🚀', 'Workout notes feature coming soon.')}
                >
                  <Icon name="note-add" size={24} color={COLORS.warning} />
                  <Text style={styles.quickActionText}>Notes</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>

          <View style={styles.bottomPadding} />
        </Animated.View>
      </ScrollView>

      {/* Rest Timer Modal */}
      {showRestModal && (
        <BlurView
          style={styles.blurOverlay}
          blurType="dark"
          blurAmount={10}
        >
          <Surface style={styles.restModal} elevation={8}>
            <Text style={styles.restModalTitle}>💤 Rest Time</Text>
            <Text style={styles.restModalTimer}>{formatTime(restTime)}</Text>
            <Text style={styles.restModalSubtitle}>Take a breather! 😌</Text>
            <Button
              mode="contained"
              onPress={() => {
                setIsResting(false);
                setShowRestModal(false);
                setRestTime(0);
              }}
              style={styles.skipRestButton}
            >
              Skip Rest
            </Button>
          </Surface>
        </BlurView>
      )}

      {/* Floating Action Button */}
      <FAB
        icon={isRunning ? "pause" : "play-arrow"}
        style={styles.fab}
        onPress={isRunning ? pauseWorkout : startWorkout}
        color="white"
        customSize={56}
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
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  timerCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  timerGradient: {
    padding: SPACING.xl,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.sm,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.lg,
  },
  timerActions: {
    alignItems: 'center',
  },
  startButton: {
    paddingHorizontal: SPACING.lg,
  },
  timerButtonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  timerIconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
  },
  progressChip: {
    backgroundColor: COLORS.success + '20',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.small,
  },
  exerciseCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  exerciseSubtitle: {
    ...TEXT_STYLES.caption,
  },
  exerciseNumber: {
    backgroundColor: COLORS.primary,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  detailChip: {
    backgroundColor: COLORS.primary + '20',
  },
  setProgress: {
    marginBottom: SPACING.md,
  },
  setProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  exerciseActions: {
    gap: SPACING.sm,
  },
  completeSetButton: {
    backgroundColor: COLORS.success,
  },
  nextExerciseButton: {
    borderColor: COLORS.primary,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  exerciseListCard: {
    marginBottom: SPACING.sm,
    borderRadius: 8,
  },
  activeExerciseCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseListInfo: {
    flex: 1,
  },
  exerciseListTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  completedText: {
    color: COLORS.success,
    textDecorationLine: 'line-through',
  },
  exerciseListSubtitle: {
    ...TEXT_STYLES.caption,
  },
  exerciseListActions: {
    width: 100,
    alignItems: 'flex-end',
  },
  exerciseListProgress: {
    width: 80,
    height: 4,
    borderRadius: 2,
  },
  quickActionsCard: {
    marginTop: SPACING.md,
    borderRadius: 12,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    aspectRatio: 2,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restModal: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    margin: SPACING.lg,
    alignItems: 'center',
    minWidth: 280,
  },
  restModalTitle: {
    ...TEXT_STYLES.h2,
    marginBottom: SPACING.md,
  },
  restModalTimer: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  restModalSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  skipRestButton: {
    backgroundColor: COLORS.warning,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  bottomPadding: {
    height: 100,
  },
});

export default WorkoutTimer;