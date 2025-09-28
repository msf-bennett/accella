import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Vibration,
  Alert,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  IconButton,
  ProgressBar,
  Surface,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f6fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c',
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
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const RestTimer = ({ route, navigation }) => {
  const { duration = 60, exerciseName = 'Rest', nextExercise = null } = route?.params || {};
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const trainingSession = useSelector(state => state.training.currentSession);
  const dispatch = useDispatch();

  // Component state
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customDuration, setCustomDuration] = useState(duration);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const countdownAnim = useRef(new Animated.Value(1)).current;

  // Timer ref
  const timerRef = useRef(null);

  // Start pulse animation
  const startPulseAnimation = useCallback(() => {
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
  }, [pulseAnim]);

  // Stop pulse animation
  const stopPulseAnimation = useCallback(() => {
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  // Start countdown animation
  const startCountdownAnimation = useCallback(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(countdownAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(countdownAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [countdownAnim, timeLeft]);

  // Format time display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    startPulseAnimation();
    
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 100]);
    } else {
      Vibration.vibrate(100);
    }

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: timeLeft * 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, startPulseAnimation, progressAnim]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
    stopPulseAnimation();
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [stopPulseAnimation]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
    startPulseAnimation();
  }, [startPulseAnimation]);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimeLeft(duration);
    setIsRunning(false);
    setIsPaused(false);
    setIsFinished(false);
    stopPulseAnimation();
    progressAnim.setValue(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [duration, stopPulseAnimation, progressAnim]);

  // Add time
  const addTime = useCallback((seconds) => {
    setTimeLeft(prev => prev + seconds);
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 50]);
    } else {
      Vibration.vibrate(50);
    }
  }, []);

  // Skip rest
  const skipRest = useCallback(() => {
    Alert.alert(
      '⏭️ Skip Rest?',
      'Are you ready to continue to the next exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            // Track completion in Redux
            dispatch({
              type: 'COMPLETE_REST_PERIOD',
              payload: {
                exerciseName,
                scheduledDuration: duration,
                actualDuration: duration - timeLeft,
                skipped: true,
              },
            });
            
            if (Platform.OS === 'ios') {
              Vibration.vibrate([0, 200]);
            } else {
              Vibration.vibrate(200);
            }
            
            navigation.goBack();
          }
        },
      ]
    );
  }, [dispatch, exerciseName, duration, timeLeft, navigation]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsFinished(true);
            setIsRunning(false);
            stopPulseAnimation();
            
            // Completion vibration and notification
            if (Platform.OS === 'ios') {
              Vibration.vibrate([0, 500, 200, 500]);
            } else {
              Vibration.vibrate([500, 200, 500]);
            }
            
            // Track completion in Redux
            dispatch({
              type: 'COMPLETE_REST_PERIOD',
              payload: {
                exerciseName,
                scheduledDuration: duration,
                actualDuration: duration,
                completed: true,
              },
            });
            
            Alert.alert(
              '🎉 Rest Complete!',
              nextExercise ? `Time for: ${nextExercise}` : 'Ready to continue training!',
              [
                { 
                  text: 'Continue', 
                  onPress: () => navigation.goBack(),
                },
              ]
            );
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, stopPulseAnimation, dispatch, exerciseName, duration, nextExercise, navigation]);

  // Countdown animation effect
  useEffect(() => {
    if (isRunning) {
      startCountdownAnimation();
    }
  }, [timeLeft, isRunning, startCountdownAnimation]);

  // Progress calculation
  const progress = duration > 0 ? (duration - timeLeft) / duration : 0;

  // Get time color based on remaining time
  const getTimeColor = useCallback(() => {
    if (timeLeft <= 10) return COLORS.error;
    if (timeLeft <= 30) return COLORS.warning;
    return COLORS.primary;
  }, [timeLeft]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <IconButton
          icon="arrow-back"
          iconColor="white"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Rest Timer</Text>
        <IconButton
          icon="settings"
          iconColor="white"
          size={24}
          onPress={() => setShowSettings(true)}
        />
      </LinearGradient>

      <View style={styles.content}>
        {/* Exercise Info */}
        <Card style={styles.exerciseCard}>
          <Card.Content style={styles.exerciseInfo}>
            <Icon name="fitness-center" size={24} color={COLORS.primary} />
            <View style={styles.exerciseText}>
              <Text style={[TEXT_STYLES.h3, styles.exerciseName]}>
                {exerciseName}
              </Text>
              {nextExercise && (
                <Text style={[TEXT_STYLES.caption, styles.nextExercise]}>
                  Next: {nextExercise}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Timer Display */}
        <Surface style={styles.timerContainer}>
          <Animated.View style={[
            styles.timerCircle,
            { 
              transform: [
                { scale: pulseAnim },
                { scale: countdownAnim }
              ] 
            }
          ]}>
            <Text style={[
              styles.timerText,
              { color: getTimeColor() }
            ]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={styles.timerLabel}>
              {isFinished ? '🎉 Complete!' : isRunning ? 'Resting...' : 'Ready?'}
            </Text>
          </Animated.View>
          
          {/* Progress Ring */}
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress}
              color={getTimeColor()}
              style={styles.progressBar}
            />
          </View>
        </Surface>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <View style={styles.timeControls}>
            <IconButton
              icon="remove"
              iconColor={COLORS.error}
              size={20}
              style={styles.timeButton}
              onPress={() => addTime(-15)}
              disabled={timeLeft <= 15}
            />
            <Text style={styles.timeControlLabel}>-15s</Text>
          </View>

          <View style={styles.mainControls}>
            {!isRunning && !isFinished ? (
              <Button
                mode="contained"
                onPress={startTimer}
                style={[styles.mainButton, { backgroundColor: COLORS.success }]}
                labelStyle={styles.mainButtonText}
                icon="play-arrow"
              >
                Start
              </Button>
            ) : isRunning ? (
              <Button
                mode="contained"
                onPress={pauseTimer}
                style={[styles.mainButton, { backgroundColor: COLORS.warning }]}
                labelStyle={styles.mainButtonText}
                icon="pause"
              >
                Pause
              </Button>
            ) : isPaused ? (
              <Button
                mode="contained"
                onPress={resumeTimer}
                style={[styles.mainButton, { backgroundColor: COLORS.success }]}
                labelStyle={styles.mainButtonText}
                icon="play-arrow"
              >
                Resume
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => navigation.goBack()}
                style={[styles.mainButton, { backgroundColor: COLORS.primary }]}
                labelStyle={styles.mainButtonText}
                icon="check"
              >
                Continue
              </Button>
            )}
          </View>

          <View style={styles.timeControls}>
            <IconButton
              icon="add"
              iconColor={COLORS.success}
              size={20}
              style={styles.timeButton}
              onPress={() => addTime(15)}
            />
            <Text style={styles.timeControlLabel}>+15s</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={resetTimer}
            style={styles.actionButton}
            icon="refresh"
            textColor={COLORS.textSecondary}
          >
            Reset
          </Button>
          <Button
            mode="outlined"
            onPress={skipRest}
            style={styles.actionButton}
            icon="skip-next"
            textColor={COLORS.primary}
          >
            Skip Rest
          </Button>
        </View>

        {/* Motivational Messages */}
        {timeLeft <= 10 && timeLeft > 0 && (
          <Animated.View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>
              🔥 Almost there! Get ready!
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Settings Modal */}
      <Portal>
        <Modal
          visible={showSettings}
          onDismiss={() => setShowSettings(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Timer Settings</Text>
          <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
            Feature coming soon! 🚀
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowSettings(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  exerciseCard: {
    marginBottom: SPACING.lg,
    elevation: 2,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  exerciseName: {
    marginBottom: SPACING.xs,
  },
  nextExercise: {
    fontStyle: 'italic',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    borderRadius: 20,
    elevation: 4,
    marginBottom: SPACING.lg,
    minHeight: height * 0.35,
  },
  timerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    ...TEXT_STYLES.h1,
    fontSize: 56,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timerLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  timeControls: {
    alignItems: 'center',
  },
  timeButton: {
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  timeControlLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  mainControls: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  mainButton: {
    paddingVertical: SPACING.xs,
    elevation: 4,
  },
  mainButtonText: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  motivationContainer: {
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  motivationText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalDescription: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
});

export default RestTimer;