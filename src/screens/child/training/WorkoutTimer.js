import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Vibration,
  Alert,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  IconButton,
  FAB,
  Surface,
  Avatar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import your established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const WorkoutTimer = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, workoutSession } = useSelector(state => state.auth);
  
  // Timer states
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTime, setRestTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  
  // Animation refs
  const timerAnimation = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // Workout data (would come from props/redux in real app)
  const [workoutData] = useState({
    name: "Football Training ⚽",
    totalExercises: 6,
    estimatedTime: 45,
    exercises: [
      { name: "Warm-up Jogging", duration: 300, sets: 1, rest: 60 },
      { name: "Ball Control Drills", duration: 480, sets: 3, rest: 90 },
      { name: "Shooting Practice", duration: 600, sets: 4, rest: 120 },
      { name: "Passing Accuracy", duration: 420, sets: 3, rest: 90 },
      { name: "Agility Ladder", duration: 360, sets: 2, rest: 60 },
      { name: "Cool-down Stretching", duration: 300, sets: 1, rest: 0 },
    ]
  });
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        if (isResting) {
          setRestTime(prev => {
            if (prev <= 1) {
              setIsResting(false);
              Vibration.vibrate([0, 500, 200, 500]);
              startPulseAnimation();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setCurrentTime(prev => prev + 1);
          setTotalWorkoutTime(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isResting]);
  
  // Animations
  const startPulseAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const startTimerAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(timerAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(timerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  // Timer functions
  const startWorkout = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    startTimerAnimation();
    Vibration.vibrate(100);
  }, [startTimerAnimation]);
  
  const pauseWorkout = useCallback(() => {
    setIsPaused(!isPaused);
    Vibration.vibrate(100);
  }, [isPaused]);
  
  const stopWorkout = useCallback(() => {
    Alert.alert(
      "Stop Workout? 🛑",
      "Are you sure you want to stop this training session?",
      [
        { text: "Keep Going! 💪", style: "cancel" },
        { 
          text: "Stop", 
          onPress: () => {
            setIsRunning(false);
            setIsPaused(false);
            setCurrentTime(0);
            setCurrentExercise(0);
            setCurrentSet(1);
            navigation.goBack();
          }
        },
      ]
    );
  }, [navigation]);
  
  const nextExercise = useCallback(() => {
    if (currentExercise < workoutData.exercises.length - 1) {
      const nextEx = workoutData.exercises[currentExercise + 1];
      if (nextEx.rest > 0) {
        setIsResting(true);
        setRestTime(nextEx.rest);
      }
      setCurrentExercise(prev => prev + 1);
      setCurrentTime(0);
      setCurrentSet(1);
      Vibration.vibrate([0, 200, 100, 200]);
      startPulseAnimation();
    } else {
      completeWorkout();
    }
  }, [currentExercise, workoutData.exercises, startPulseAnimation]);
  
  const completeWorkout = useCallback(() => {
    setWorkoutCompleted(true);
    setIsRunning(false);
    setIsPaused(false);
    Vibration.vibrate([0, 500, 200, 500, 200, 500]);
    
    Alert.alert(
      "Workout Complete! 🎉",
      `Amazing job! You completed your ${workoutData.name} in ${Math.floor(totalWorkoutTime / 60)}:${String(totalWorkoutTime % 60).padStart(2, '0')}`,
      [
        { text: "View Summary", onPress: () => navigation.navigate('WorkoutSummary') },
        { text: "Done", onPress: () => navigation.goBack() },
      ]
    );
  }, [workoutData.name, totalWorkoutTime, navigation]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);
  
  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  
  // Progress calculation
  const exerciseProgress = workoutData.exercises[currentExercise] ? 
    (currentTime / workoutData.exercises[currentExercise].duration) : 0;
  const totalProgress = (currentExercise + exerciseProgress) / workoutData.exercises.length;

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-back"
            iconColor={COLORS.white}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>{workoutData.name}</Text>
          <IconButton
            icon="settings"
            iconColor={COLORS.white}
            size={24}
            onPress={() => Alert.alert("Settings", "Timer settings coming soon! ⚙️")}
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
      >
        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <Card.Content>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Overall Progress</Text>
              <Chip icon="trophy" textStyle={styles.chipText}>
                {Math.round(totalProgress * 100)}% Complete 🏆
              </Chip>
            </View>
            <ProgressBar
              progress={totalProgress}
              color={COLORS.success}
              style={styles.progressBar}
            />
            <View style={styles.progressStats}>
              <View style={styles.stat}>
                <Icon name="fitness-center" size={20} color={COLORS.primary} />
                <Text style={styles.statText}>{currentExercise + 1}/{workoutData.exercises.length}</Text>
              </View>
              <View style={styles.stat}>
                <Icon name="access-time" size={20} color={COLORS.primary} />
                <Text style={styles.statText}>{formatTime(totalWorkoutTime)}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Timer Card */}
        <Card style={[styles.timerCard, isResting && styles.restCard]}>
          <Card.Content style={styles.timerContent}>
            {isResting ? (
              <View style={styles.restTimer}>
                <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
                  <Avatar.Icon 
                    size={80} 
                    icon="pause" 
                    style={[styles.restIcon, { backgroundColor: COLORS.secondary }]} 
                  />
                </Animated.View>
                <Text style={styles.restTitle}>Rest Time 😴</Text>
                <Text style={styles.restTime}>{formatTime(restTime)}</Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    setIsResting(false);
                    setRestTime(0);
                  }}
                  style={styles.skipButton}
                  buttonColor={COLORS.secondary}
                >
                  Skip Rest ⏭️
                </Button>
              </View>
            ) : (
              <View style={styles.exerciseTimer}>
                <Text style={styles.exerciseName}>
                  {workoutData.exercises[currentExercise]?.name}
                </Text>
                <Animated.Text 
                  style={[
                    styles.timerDisplay,
                    { transform: [{ scale: timerAnimation }] }
                  ]}
                >
                  {formatTime(currentTime)}
                </Animated.Text>
                <Text style={styles.setInfo}>
                  Set {currentSet} of {workoutData.exercises[currentExercise]?.sets} 💪
                </Text>
                <ProgressBar
                  progress={Math.min(exerciseProgress, 1)}
                  color={COLORS.success}
                  style={styles.exerciseProgress}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Exercise List */}
        <Card style={styles.exerciseListCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Training Plan 📋</Text>
            {workoutData.exercises.map((exercise, index) => (
              <Surface 
                key={index}
                style={[
                  styles.exerciseItem,
                  index === currentExercise && styles.currentExerciseItem
                ]}
              >
                <View style={styles.exerciseLeft}>
                  <Avatar.Text 
                    size={40} 
                    label={`${index + 1}`}
                    style={[
                      styles.exerciseNumber,
                      index === currentExercise && styles.currentExerciseNumber,
                      index < currentExercise && styles.completedExerciseNumber
                    ]}
                  />
                  <View>
                    <Text style={[
                      styles.exerciseItemName,
                      index === currentExercise && styles.currentExerciseText
                    ]}>
                      {exercise.name}
                    </Text>
                    <Text style={styles.exerciseDetails}>
                      {formatTime(exercise.duration)} • {exercise.sets} sets
                    </Text>
                  </View>
                </View>
                <View style={styles.exerciseRight}>
                  {index < currentExercise && (
                    <Icon name="check-circle" size={24} color={COLORS.success} />
                  )}
                  {index === currentExercise && isRunning && (
                    <Icon name="play-circle-filled" size={24} color={COLORS.primary} />
                  )}
                </View>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        {/* Motivation Card */}
        <Card style={styles.motivationCard}>
          <LinearGradient colors={['#ff9a9e', '#fecfef']} style={styles.motivationGradient}>
            <Card.Content>
              <Text style={styles.motivationText}>
                {isResting ? "Take a breather! 💨" : 
                 currentExercise === 0 ? "Let's get started! 🔥" :
                 currentExercise === workoutData.exercises.length - 1 ? "Final push! You got this! 🏁" :
                 "Keep pushing! You're doing great! 💪"}
              </Text>
            </Card.Content>
          </LinearGradient>
        </Card>
      </ScrollView>

      {/* Control FABs */}
      <View style={styles.fabContainer}>
        {!isRunning ? (
          <FAB
            icon="play-arrow"
            style={[styles.fab, styles.playFab]}
            onPress={startWorkout}
            label="Start 🚀"
          />
        ) : (
          <>
            <FAB
              icon={isPaused ? "play-arrow" : "pause"}
              style={[styles.fab, styles.pauseFab]}
              onPress={pauseWorkout}
              size="small"
            />
            {!isResting && (
              <FAB
                icon="skip-next"
                style={[styles.fab, styles.nextFab]}
                onPress={nextExercise}
                size="small"
              />
            )}
            <FAB
              icon="stop"
              style={[styles.fab, styles.stopFab]}
              onPress={stopWorkout}
              size="small"
            />
          </>
        )}
      </View>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  progressCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
  },
  chipText: {
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  timerCard: {
    marginBottom: SPACING.md,
    elevation: 8,
  },
  restCard: {
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  timerContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  restTimer: {
    alignItems: 'center',
  },
  restIcon: {
    marginBottom: SPACING.md,
  },
  restTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  restTime: {
    ...TEXT_STYLES.h1,
    fontSize: 48,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  skipButton: {
    borderRadius: 25,
  },
  exerciseTimer: {
    alignItems: 'center',
    width: '100%',
  },
  exerciseName: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  timerDisplay: {
    ...TEXT_STYLES.h1,
    fontSize: 64,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  setInfo: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  exerciseProgress: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  exerciseListCard: {
    marginBottom: SPACING.md,
    elevation: 4,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: 8,
    elevation: 2,
  },
  currentExerciseItem: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  currentExerciseNumber: {
    backgroundColor: COLORS.primary,
  },
  completedExerciseNumber: {
    backgroundColor: COLORS.success,
  },
  exerciseItemName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
  },
  currentExerciseText: {
    color: COLORS.primary,
  },
  exerciseDetails: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  exerciseRight: {
    marginLeft: SPACING.sm,
  },
  motivationCard: {
    marginBottom: 100, // Space for FABs
    elevation: 4,
    overflow: 'hidden',
  },
  motivationGradient: {
    borderRadius: 12,
  },
  motivationText: {
    ...TEXT_STYLES.h3,
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  fab: {
    elevation: 8,
  },
  playFab: {
    backgroundColor: COLORS.success,
  },
  pauseFab: {
    backgroundColor: COLORS.secondary,
  },
  nextFab: {
    backgroundColor: COLORS.primary,
  },
  stopFab: {
    backgroundColor: COLORS.error,
  },
});

export default WorkoutTimer;