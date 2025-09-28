import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  Vibration,
  BackHandler,
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
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design system imports
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
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const WorkoutTimer = ({ navigation, route }) => {
  // Get workout data from navigation params
  const workoutData = route?.params?.workout || {
    id: '1',
    title: 'HIIT Cardio Blast',
    duration: 25,
    exercises: [
      {
        id: '1',
        name: 'Jumping Jacks',
        duration: 45,
        rest: 15,
        sets: 1,
        reps: null,
        instructions: 'Keep your core tight and land softly on your feet',
        tips: 'Maintain steady breathing throughout the movement',
        muscleGroups: ['Full Body', 'Cardio'],
      },
      {
        id: '2',
        name: 'Push-ups',
        duration: 45,
        rest: 15,
        sets: 1,
        reps: null,
        instructions: 'Keep your body in a straight line from head to heels',
        tips: 'Lower yourself until your chest nearly touches the ground',
        muscleGroups: ['Chest', 'Arms', 'Core'],
      },
      {
        id: '3',
        name: 'Mountain Climbers',
        duration: 45,
        rest: 15,
        sets: 1,
        reps: null,
        instructions: 'Alternate bringing knees to chest rapidly',
        tips: 'Keep your hips level and core engaged',
        muscleGroups: ['Core', 'Cardio'],
      },
      {
        id: '4',
        name: 'Burpees',
        duration: 45,
        rest: 15,
        sets: 1,
        reps: null,
        instructions: 'Complete movement: squat, plank, push-up, jump',
        tips: 'Land softly and maintain control throughout',
        muscleGroups: ['Full Body'],
      },
    ],
    trainer: 'Sarah Johnson',
    difficulty: 'intermediate',
  };

  // State management
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workoutData.exercises[0]?.duration || 45);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [completedExercises, setCompletedExercises] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Refs
  const intervalRef = useRef(null);
  const totalTimeRef = useRef(null);
  const countdownRef = useRef(null);

  // Redux
  const dispatch = useDispatch();
  const { user } = useSelector(state => ({
    user: state.user || {},
  }));

  const currentExercise = workoutData.exercises[currentExerciseIndex];

  // Pulse animation for timer
  const startPulseAnimation = () => {
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

  // Shake animation for warnings
  const startShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  // Scale animation for completion
  const startScaleAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isActive && !workoutCompleted) {
        setExitModalVisible(true);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isActive, workoutCompleted]);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused && !showCountdown) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up - vibrate and move to next phase
            Vibration.vibrate([0, 500, 200, 500]);
            
            if (isResting) {
              // Rest is over, move to next exercise
              handleNextExercise();
            } else {
              // Exercise is done, start rest period
              handleExerciseComplete();
            }
            return 0;
          }
          
          // Warning vibration at 5 seconds
          if (prev === 5) {
            Vibration.vibrate(200);
            startShakeAnimation();
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused, isResting, showCountdown]);

  // Total workout timer
  useEffect(() => {
    if (isActive && !isPaused && !showCountdown) {
      totalTimeRef.current = setInterval(() => {
        setTotalWorkoutTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(totalTimeRef.current);
    }

    return () => clearInterval(totalTimeRef.current);
  }, [isActive, isPaused, showCountdown]);

  // Start countdown
  const startCountdown = (fromCount = 3) => {
    setShowCountdown(true);
    setCountdown(fromCount);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setShowCountdown(false);
          setIsActive(true);
          setIsPaused(false);
          startPulseAnimation();
          return 0;
        }
        Vibration.vibrate(100);
        return prev - 1;
      });
    }, 1000);
  };

  // Start workout
  const startWorkout = () => {
    startCountdown();
  };

  // Pause/Resume workout
  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      startPulseAnimation();
    }
  };

  // Handle exercise completion
  const handleExerciseComplete = () => {
    setIsResting(true);
    setCompletedExercises(prev => prev + 1);
    setTimeLeft(currentExercise.rest);
    startScaleAnimation();
    
    // Update progress animation
    const progress = (currentExerciseIndex + 1) / workoutData.exercises.length;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  // Move to next exercise
  const handleNextExercise = () => {
    if (currentExerciseIndex < workoutData.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setIsResting(false);
      setTimeLeft(workoutData.exercises[currentExerciseIndex + 1].duration);
    } else {
      // Workout completed
      handleWorkoutComplete();
    }
  };

  // Skip current exercise
  const skipExercise = () => {
    if (isResting) {
      handleNextExercise();
    } else {
      handleExerciseComplete();
    }
  };

  // Go to previous exercise
  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setIsResting(false);
      setTimeLeft(workoutData.exercises[currentExerciseIndex - 1].duration);
    }
  };

  // Complete workout
  const handleWorkoutComplete = () => {
    setIsActive(false);
    setWorkoutCompleted(true);
    clearInterval(intervalRef.current);
    clearInterval(totalTimeRef.current);
    
    // Celebrate with vibration
    Vibration.vibrate([0, 200, 100, 200, 100, 500]);
    
    // Show completion modal
    setTimeout(() => {
      Alert.alert(
        '🎉 Workout Complete!',
        `Amazing job! You've completed "${workoutData.title}" in ${formatTime(totalWorkoutTime)}. You burned an estimated ${Math.round(totalWorkoutTime * 0.15)} calories!`,
        [
          {
            text: 'View Summary',
            onPress: () => setModalVisible(true),
          },
          {
            text: 'Finish',
            onPress: () => navigation.goBack(),
            style: 'default',
          },
        ]
      );
    }, 1000);
  };

  // Exit workout
  const exitWorkout = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    clearInterval(totalTimeRef.current);
    navigation.goBack();
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer color based on time left
  const getTimerColor = () => {
    if (timeLeft <= 5) return COLORS.error;
    if (timeLeft <= 10) return COLORS.warning;
    return isResting ? COLORS.success : COLORS.primary;
  };

  // Render countdown overlay
  const renderCountdown = () => (
    <Portal>
      <Modal visible={showCountdown} dismissable={false}>
        <BlurView style={styles.countdownBlur} blurType="dark" blurAmount={15}>
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownTitle}>Get Ready!</Text>
            <Text style={styles.countdownSubtitle}>{currentExercise.name}</Text>
            <Animated.Text 
              style={[
                styles.countdownNumber,
                {
                  transform: [{ scale: pulseAnim }]
                }
              ]}
            >
              {countdown}
            </Animated.Text>
            <Text style={styles.countdownInstruction}>
              {countdown === 3 ? 'Prepare yourself!' : 
               countdown === 2 ? 'Get in position!' : 
               countdown === 1 ? 'Let\'s go!' : ''}
            </Text>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Render workout summary modal
  const renderSummaryModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Card style={styles.summaryCard} elevation={8}>
            <LinearGradient
              colors={[COLORS.success, '#45A049']}
              style={styles.summaryHeader}
            >
              <Icon name="jump-rope" size={48} color="white" />
              <Text style={styles.summaryTitle}>Workout Complete! 🎉</Text>
              <Text style={styles.summarySubtitle}>{workoutData.title}</Text>
            </LinearGradient>

            <ScrollView style={styles.summaryContent}>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStatItem}>
                  <Icon name="access-time" size={24} color={COLORS.primary} />
                  <Text style={styles.summaryStatNumber}>{formatTime(totalWorkoutTime)}</Text>
                  <Text style={styles.summaryStatLabel}>Total Time</Text>
                </View>
                <View style={styles.summaryStatItem}>
                  <Icon name="fitness-center" size={24} color={COLORS.success} />
                  <Text style={styles.summaryStatNumber}>{completedExercises}</Text>
                  <Text style={styles.summaryStatLabel}>Exercises Done</Text>
                </View>
                <View style={styles.summaryStatItem}>
                  <Icon name="local-fire-department" size={24} color={COLORS.error} />
                  <Text style={styles.summaryStatNumber}>{Math.round(totalWorkoutTime * 0.15)}</Text>
                  <Text style={styles.summaryStatLabel}>Calories Burned</Text>
                </View>
              </View>

              <Divider style={styles.summaryDivider} />

              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Rate Your Workout</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} style={styles.starButton}>
                      <Icon name="star-border" size={32} color={COLORS.warning} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>Quick Notes</Text>
                <TouchableOpacity style={styles.notesButton}>
                  <Icon name="edit" size={20} color={COLORS.primary} />
                  <Text style={styles.notesButtonText}>Add notes about this workout</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.summaryActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.summaryActionButton}
                icon="close"
              >
                Close
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setModalVisible(false);
                  navigation.goBack();
                }}
                style={[styles.summaryActionButton, styles.primaryActionButton]}
                icon="check"
              >
                Finish
              </Button>
            </View>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Render exit confirmation modal
  const renderExitModal = () => (
    <Portal>
      <Modal
        visible={exitModalVisible}
        onDismiss={() => setExitModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          <Card style={styles.exitCard} elevation={5}>
            <View style={styles.exitHeader}>
              <Icon name="warning" size={48} color={COLORS.warning} />
              <Text style={styles.exitTitle}>Exit Workout?</Text>
              <Text style={styles.exitMessage}>
                Your progress will be lost if you exit now. Are you sure you want to quit?
              </Text>
            </View>

            <View style={styles.exitActions}>
              <Button
                mode="outlined"
                onPress={() => setExitModalVisible(false)}
                style={styles.exitActionButton}
                icon="arrow-back"
              >
                Continue
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  setExitModalVisible(false);
                  exitWorkout();
                }}
                style={[styles.exitActionButton, styles.exitButton]}
                icon="exit-to-app"
                buttonColor={COLORS.error}
              >
                Exit
              </Button>
            </View>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={workoutCompleted 
          ? [COLORS.success, '#45A049'] 
          : isResting 
            ? ['#4CAF50', '#45A049']
            : [COLORS.primary, COLORS.secondary]
        }
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <IconButton
              icon="close"
              iconColor="white"
              size={24}
              onPress={() => {
                if (isActive && !workoutCompleted) {
                  setExitModalVisible(true);
                } else {
                  navigation.goBack();
                }
              }}
            />
            <Text style={styles.headerTitle}>
              {workoutCompleted ? 'Complete!' : isResting ? 'Rest Time' : 'Workout'}
            </Text>
            <IconButton
              icon="help-outline"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert('💡 Tips', currentExercise.tips || 'Keep going, you\'re doing great!')}
            />
          </View>
          
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsText}>
              Exercise {currentExerciseIndex + 1} of {workoutData.exercises.length} • {formatTime(totalWorkoutTime)} elapsed
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <ProgressBar
              progress={(currentExerciseIndex + (isResting ? 1 : 0)) / workoutData.exercises.length}
              color="white"
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(((currentExerciseIndex + (isResting ? 1 : 0)) / workoutData.exercises.length) * 100)}% Complete
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Timer Display */}
        <View style={styles.timerSection}>
          <Surface style={styles.timerCard} elevation={8}>
            <View style={styles.timerContent}>
              <Text style={styles.exerciseTitle}>{currentExercise.name}</Text>
              <Text style={styles.exerciseSubtitle}>
                {isResting ? '🛌 Rest & Recover' : '💪 Go Hard!'}
              </Text>
              
              <Animated.View 
                style={[
                  styles.timerDisplay,
                  {
                    transform: [
                      { scale: isActive ? pulseAnim : 1 },
                      { translateX: shakeAnim }
                    ]
                  }
                ]}
              >
                <Text style={[styles.timerNumber, { color: getTimerColor() }]}>
                  {formatTime(timeLeft)}
                </Text>
                <View style={styles.timerIndicator}>
                  <ProgressBar
                    progress={isResting 
                      ? 1 - (timeLeft / currentExercise.rest)
                      : 1 - (timeLeft / currentExercise.duration)
                    }
                    color={getTimerColor()}
                    style={styles.timerProgress}
                  />
                </View>
              </Animated.View>

              <Text style={styles.timerLabel}>
                {isResting 
                  ? `Rest for ${currentExercise.rest}s`
                  : `Work for ${currentExercise.duration}s`
                }
              </Text>
            </View>
          </Surface>
        </View>

        {/* Exercise Instructions */}
        <Card style={styles.instructionsCard} elevation={3}>
          <View style={styles.instructionsContent}>
            <View style={styles.instructionsHeader}>
              <Icon name="info" size={24} color={COLORS.primary} />
              <Text style={styles.instructionsTitle}>Exercise Instructions</Text>
            </View>
            <Text style={styles.instructionsText}>
              {currentExercise.instructions}
            </Text>
            
            <View style={styles.muscleGroups}>
              <Text style={styles.muscleGroupsLabel}>Target Muscles:</Text>
              <View style={styles.muscleGroupsContainer}>
                {currentExercise.muscleGroups.map((group, index) => (
                  <Chip 
                    key={index}
                    style={styles.muscleGroupChip}
                    textStyle={styles.muscleGroupText}
                    compact
                  >
                    {group}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        </Card>

        {/* Exercise Navigation */}
        <Card style={styles.navigationCard} elevation={3}>
          <View style={styles.navigationContent}>
            <Text style={styles.navigationTitle}>Upcoming Exercises</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.exercisesList}
              contentContainerStyle={styles.exercisesListContent}
            >
              {workoutData.exercises.map((exercise, index) => (
                <TouchableOpacity
                  key={exercise.id}
                  style={[
                    styles.exerciseItem,
                    index === currentExerciseIndex && styles.currentExerciseItem,
                    index < currentExerciseIndex && styles.completedExerciseItem
                  ]}
                  disabled={!isActive}
                  onPress={() => {
                    if (index !== currentExerciseIndex) {
                      Alert.alert('🔧 Coming Soon', 'Jump to exercise feature coming soon!');
                    }
                  }}
                >
                  <View style={styles.exerciseItemContent}>
                    <Text style={[
                      styles.exerciseItemNumber,
                      index === currentExerciseIndex && styles.currentExerciseItemNumber,
                      index < currentExerciseIndex && styles.completedExerciseItemNumber
                    ]}>
                      {index + 1}
                    </Text>
                    <Text style={[
                      styles.exerciseItemName,
                      index === currentExerciseIndex && styles.currentExerciseItemName,
                      index < currentExerciseIndex && styles.completedExerciseItemName
                    ]} numberOfLines={2}>
                      {exercise.name}
                    </Text>
                    <Text style={styles.exerciseItemDuration}>
                      {exercise.duration}s
                    </Text>
                    {index < currentExerciseIndex && (
                      <Icon name="check-circle" size={16} color={COLORS.success} style={styles.completedIcon} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Card>

        {/* Spacer for FABs */}
        <View style={styles.fabSpacer} />
      </ScrollView>

      {/* Control FABs */}
      {!workoutCompleted && (
        <View style={styles.fabContainer}>
          {/* Previous Exercise FAB */}
          <FAB
            icon="skip-previous"
            style={[styles.fab, styles.secondaryFab]}
            onPress={previousExercise}
            disabled={currentExerciseIndex === 0 || !isActive}
            color="white"
            size="small"
          />

          {/* Main Control FAB */}
          <FAB
            icon={!isActive 
              ? "play-arrow" 
              : isPaused 
                ? "play-arrow" 
                : "pause"
            }
            style={[styles.fab, styles.mainFab]}
            onPress={!isActive ? startWorkout : togglePause}
            color="white"
            size="large"
          />

          {/* Skip/Next Exercise FAB */}
          <FAB
            icon="skip-next"
            style={[styles.fab, styles.secondaryFab]}
            onPress={skipExercise}
            disabled={!isActive}
            color="white"
            size="small"
          />
        </View>
      )}

      {/* Countdown Overlay */}
      {renderCountdown()}

      {/* Summary Modal */}
      {renderSummaryModal()}

      {/* Exit Confirmation Modal */}
      {renderExitModal()}
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
    marginTop: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerStats: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  headerStatsText: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
  },
  progressContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
  },
  timerSection: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  timerCard: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  timerContent: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  exerciseTitle: {
    ...TEXT_STYLES.h2,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  exerciseSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerNumber: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timerIndicator: {
    width: 200,
    marginTop: SPACING.md,
  },
  timerProgress: {
    height: 8,
    borderRadius: 4,
  },
  timerLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  instructionsCard: {
    margin: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  instructionsContent: {
    padding: SPACING.lg,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  instructionsTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
  },
  instructionsText: {
    ...TEXT_STYLES.body,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  muscleGroups: {
    marginTop: SPACING.md,
  },
  muscleGroupsLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  muscleGroupChip: {
    backgroundColor: `${COLORS.primary}20`,
    height: 28,
  },
  muscleGroupText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  navigationCard: {
    margin: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  navigationContent: {
    padding: SPACING.lg,
  },
  navigationTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  exercisesList: {
    flexGrow: 0,
  },
  exercisesListContent: {
    gap: SPACING.sm,
  },
  exerciseItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    width: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentExerciseItem: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  completedExerciseItem: {
    backgroundColor: `${COLORS.success}20`,
    borderColor: COLORS.success,
  },
  exerciseItemContent: {
    alignItems: 'center',
    position: 'relative',
  },
  exerciseItemNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  currentExerciseItemNumber: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  completedExerciseItemNumber: {
    color: COLORS.success,
    fontWeight: 'bold',
  },
  exerciseItemName: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    minHeight: 32,
  },
  currentExerciseItemName: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  completedExerciseItemName: {
    color: COLORS.success,
  },
  exerciseItemDuration: {
    ...TEXT_STYLES.small,
    color: COLORS.textSecondary,
  },
  completedIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  fabSpacer: {
    height: 100,
  },
  fabContainer: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  fab: {
    elevation: 8,
  },
  mainFab: {
    backgroundColor: COLORS.primary,
  },
  secondaryFab: {
    backgroundColor: COLORS.secondary,
  },
  countdownBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  countdownTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.sm,
  },
  countdownSubtitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    opacity: 0.9,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.lg,
  },
  countdownInstruction: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  summaryCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  summaryHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  summaryTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  summarySubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  summaryContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  summaryStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryStatNumber: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  summaryStatLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  summaryDivider: {
    marginVertical: SPACING.lg,
  },
  summarySection: {
    marginBottom: SPACING.lg,
  },
  summarySectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  starButton: {
    padding: SPACING.xs,
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesButtonText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  summaryActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  summaryActionButton: {
    flex: 1,
  },
  primaryActionButton: {
    backgroundColor: COLORS.success,
  },
  exitCard: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  exitHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  exitTitle: {
    ...TEXT_STYLES.h2,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  exitMessage: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  exitActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  exitActionButton: {
    flex: 1,
  },
  exitButton: {
    backgroundColor: COLORS.error,
  },
});

export default WorkoutTimer;