import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  Vibration,
  AppState,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  IconButton,
  Surface,
  Portal,
  Modal,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width, height } = Dimensions.get('window');

const RestTimer = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, currentWorkout } = useSelector(state => ({
    user: state.auth.user,
    currentWorkout: state.training.currentWorkout,
  }));

  // Route params
  const { 
    defaultTime = 60, 
    exercise = 'Exercise',
    nextExercise = 'Next Exercise',
    set = 1,
    totalSets = 3,
    workoutId = null 
  } = route.params || {};

  // State management
  const [timeRemaining, setTimeRemaining] = useState(defaultTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [initialTime, setInitialTime] = useState(defaultTime);
  const [customTimerVisible, setCustomTimerVisible] = useState(false);
  const [selectedCustomTime, setSelectedCustomTime] = useState(60);
  const [appState, setAppState] = useState(AppState.currentState);
  const [backgroundTime, setBackgroundTime] = useState(null);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Timer reference
  const timerRef = useRef(null);
  const backgroundTimerRef = useRef(null);

  // Custom time options
  const customTimes = [15, 30, 45, 60, 90, 120, 180, 300];

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // App state change listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Back handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => {
      subscription?.remove();
      backHandler.remove();
      if (timerRef.current) clearInterval(timerRef.current);
      if (backgroundTimerRef.current) clearInterval(backgroundTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start pulse animation
      startPulseAnimation();
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopPulseAnimation();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, timeRemaining]);

  useEffect(() => {
    // Update progress animation
    const progress = 1 - (timeRemaining / initialTime);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [timeRemaining, initialTime]);

  const handleAppStateChange = useCallback((nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App came back to foreground
      if (backgroundTime && isActive && !isPaused) {
        const timeElapsed = Math.floor((Date.now() - backgroundTime) / 1000);
        setTimeRemaining(prev => {
          const newTime = Math.max(0, prev - timeElapsed);
          if (newTime === 0) {
            handleTimerComplete();
          }
          return newTime;
        });
      }
      setBackgroundTime(null);
    } else if (nextAppState.match(/inactive|background/) && isActive && !isPaused) {
      // App went to background
      setBackgroundTime(Date.now());
    }
    
    setAppState(nextAppState);
  }, [appState, isActive, isPaused, backgroundTime]);

  const handleBackPress = useCallback(() => {
    if (isActive) {
      Alert.alert(
        'Timer Running',
        'Are you sure you want to exit? Your rest timer will be cancelled.',
        [
          { text: 'Continue Timer', style: 'cancel' },
          { 
            text: 'Exit', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
      return true;
    }
    return false;
  }, [isActive, navigation]);

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

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    
    // Vibration pattern: long, short, long
    Vibration.vibrate([0, 1000, 200, 500]);
    
    // Shake animation
    shakeAnimation();

    // Show completion notification
    Alert.alert(
      '⏰ Rest Complete!',
      `Time to get back to work! 💪\nNext: ${nextExercise}`,
      [
        { 
          text: 'Add 30s', 
          style: 'default',
          onPress: () => {
            setTimeRemaining(30);
            setInitialTime(30);
            setIsActive(true);
          }
        },
        { 
          text: 'Continue Workout', 
          style: 'default',
          onPress: () => navigation.goBack()
        }
      ]
    );

    // Update workout stats
    dispatch({
      type: 'training/updateRestTime',
      payload: {
        workoutId,
        restTime: initialTime,
        exercise,
        set,
      }
    });
  }, [dispatch, exercise, initialTime, navigation, nextExercise, set, workoutId]);

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    if (timeRemaining === 0) {
      setTimeRemaining(initialTime);
    }
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsPaused(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(initialTime);
  };

  const skipTimer = () => {
    Alert.alert(
      'Skip Rest?',
      'Are you sure you want to skip your rest period?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'default',
          onPress: () => {
            setIsActive(false);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const openCustomTimer = () => {
    setCustomTimerVisible(true);
  };

  const setCustomTime = (seconds) => {
    setTimeRemaining(seconds);
    setInitialTime(seconds);
    setIsActive(false);
    setIsPaused(false);
    setCustomTimerVisible(false);
  };

  const addTime = (seconds) => {
    setTimeRemaining(prev => prev + seconds);
    setInitialTime(prev => prev + seconds);
    Vibration.vibrate(100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const progress = timeRemaining / initialTime;
    if (progress > 0.5) return COLORS.success;
    if (progress > 0.25) return COLORS.secondary;
    return COLORS.error;
  };

  const renderCustomTimerModal = () => (
    <Portal>
      <Modal
        visible={customTimerVisible}
        onDismiss={() => setCustomTimerVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor="white"
        />
        <Card style={styles.modalCard}>
          <Card.Content style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Rest Time ⏱️</Text>
            <View style={styles.customTimeGrid}>
              {customTimes.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.customTimeButton,
                    selectedCustomTime === time && styles.selectedCustomTimeButton
                  ]}
                  onPress={() => setSelectedCustomTime(time)}
                >
                  <Text style={[
                    styles.customTimeText,
                    selectedCustomTime === time && styles.selectedCustomTimeText
                  ]}>
                    {time < 60 ? `${time}s` : `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setCustomTimerVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => setCustomTime(selectedCustomTime)}
                style={styles.modalButton}
              >
                Set Timer
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => addTime(15)}
      >
        <Icon name="add" size={20} color={COLORS.primary} />
        <Text style={styles.quickActionText}>+15s</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => addTime(30)}
      >
        <Icon name="add" size={20} color={COLORS.primary} />
        <Text style={styles.quickActionText}>+30s</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={openCustomTimer}
      >
        <Icon name="timer" size={20} color={COLORS.primary} />
        <Text style={styles.quickActionText}>Custom</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[getTimerColor(), getTimerColor() + '80']}
        style={styles.background}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={28}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Rest Timer</Text>
            <Text style={styles.headerSubtitle}>
              {exercise} • Set {set}/{totalSets}
            </Text>
          </View>
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={28}
            onPress={() => Alert.alert('Feature in Development', 'Timer settings coming soon!')}
          />
        </View>

        <View style={styles.content}>
          <Surface style={styles.timerContainer} elevation={8}>
            <Animated.View
              style={[
                styles.timerCircle,
                {
                  transform: [
                    { scale: pulseAnim },
                    { translateX: shakeAnim }
                  ]
                }
              ]}
            >
              <Animated.View
                style={[
                  styles.progressCircle,
                  {
                    transform: [
                      {
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <View style={styles.timerInner}>
                <Text style={[styles.timerText, { color: getTimerColor() }]}>
                  {formatTime(timeRemaining)}
                </Text>
                <Text style={styles.timerLabel}>
                  {isActive ? (isPaused ? 'Paused' : 'Resting...') : 'Ready'}
                </Text>
              </View>
            </Animated.View>
          </Surface>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>
              Rest Progress
            </Text>
            <ProgressBar
              progress={1 - (timeRemaining / initialTime)}
              color={getTimerColor()}
              style={styles.progressBar}
            />
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {Math.round((1 - (timeRemaining / initialTime)) * 100)}% Complete
              </Text>
              <Text style={styles.progressText}>
                {formatTime(initialTime)} total
              </Text>
            </View>
          </View>

          {renderQuickActions()}

          <View style={styles.controlsContainer}>
            <View style={styles.mainControls}>
              {!isActive ? (
                <Button
                  mode="contained"
                  onPress={startTimer}
                  style={[styles.mainButton, { backgroundColor: getTimerColor() }]}
                  contentStyle={styles.mainButtonContent}
                  labelStyle={styles.mainButtonLabel}
                  icon="play-arrow"
                >
                  Start Rest
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={isPaused ? resumeTimer : pauseTimer}
                  style={[styles.mainButton, { backgroundColor: getTimerColor() }]}
                  contentStyle={styles.mainButtonContent}
                  labelStyle={styles.mainButtonLabel}
                  icon={isPaused ? "play-arrow" : "pause"}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
              )}
            </View>

            <View style={styles.secondaryControls}>
              <IconButton
                icon="refresh"
                iconColor="white"
                size={32}
                style={styles.controlButton}
                onPress={resetTimer}
              />
              <IconButton
                icon="skip-next"
                iconColor="white"
                size={32}
                style={styles.controlButton}
                onPress={skipTimer}
              />
            </View>
          </View>

          <Surface style={styles.nextExerciseCard} elevation={4}>
            <View style={styles.nextExerciseContent}>
              <Icon name="fitness-center" size={24} color={COLORS.primary} />
              <View style={styles.nextExerciseText}>
                <Text style={styles.nextExerciseLabel}>Up Next:</Text>
                <Text style={styles.nextExerciseName}>{nextExercise}</Text>
              </View>
              <Icon name="arrow-forward" size={24} color={COLORS.textSecondary} />
            </View>
          </Surface>
        </View>
      </LinearGradient>

      {renderCustomTimerModal()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    borderRadius: width * 0.4,
    padding: SPACING.lg,
    backgroundColor: 'white',
    marginBottom: SPACING.xl,
  },
  timerCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    borderWidth: 8,
    borderColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: COLORS.primary,
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  timerLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.9,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  quickActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '500',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  mainControls: {
    marginBottom: SPACING.lg,
  },
  mainButton: {
    borderRadius: 30,
    elevation: 4,
  },
  mainButtonContent: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  mainButtonLabel: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  secondaryControls: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  nextExerciseCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: 'white',
    padding: SPACING.md,
  },
  nextExerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  nextExerciseText: {
    flex: 1,
  },
  nextExerciseLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
  },
  nextExerciseName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: width * 0.9,
    borderRadius: 20,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  customTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  customTimeButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
    alignItems: 'center',
  },
  selectedCustomTimeButton: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  customTimeText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedCustomTimeText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: 25,
  },
});

export default RestTimer;