import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Vibration,
  AppState,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  white: '#FFFFFF',
  dark: '#2c3e50',
  gray: '#95a5a6',
  lightGray: '#ecf0f1',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.dark },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.dark },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.dark },
  body: { fontSize: 16, color: COLORS.dark },
  caption: { fontSize: 14, color: COLORS.gray },
  small: { fontSize: 12, color: COLORS.gray },
};

const { width, height } = Dimensions.get('window');

const RestPeriodTimerScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // State management
  const [currentTime, setCurrentTime] = useState(0);
  const [targetTime, setTargetTime] = useState(90); // Default 90 seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalSets, setTotalSets] = useState(3);
  const [currentExercise, setCurrentExercise] = useState('Bench Press');
  const [restHistory, setRestHistory] = useState([]);
  const [showPresets, setShowPresets] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoStart, setAutoStart] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Timer reference
  const intervalRef = useRef(null);
  const backgroundTimeRef = useRef(Date.now());

  // Preset rest periods
  const restPresets = [
    { name: 'Strength', time: 180, icon: '💪', description: '3 minutes for heavy lifting' },
    { name: 'Hypertrophy', time: 90, icon: '🔥', description: '90 seconds for muscle growth' },
    { name: 'Endurance', time: 45, icon: '⚡', description: '45 seconds for conditioning' },
    { name: 'Power', time: 300, icon: '🚀', description: '5 minutes for explosive training' },
    { name: 'Circuit', time: 30, icon: '🔄', description: '30 seconds for circuit training' },
    { name: 'Custom', time: 120, icon: '⚙️', description: 'Set your own time' },
  ];

  // Motivational messages
  const motivationalMessages = [
    "Stay focused! 🎯",
    "You've got this! 💪",
    "Recovery is key! 🔑",
    "Next set incoming! 🔥",
    "Breathe and prepare! 🧘‍♂️",
    "Mental preparation time! 🧠",
    "Fuel the fire! ⚡",
    "One step closer! 🎖️",
  ];

  // Effects
  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' && isRunning) {
        backgroundTimeRef.current = Date.now();
      } else if (nextAppState === 'active' && isRunning) {
        const timeInBackground = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
        setCurrentTime(prev => Math.min(prev + timeInBackground, targetTime));
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription?.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, targetTime]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prevTime => {
          const newTime = prevTime + 1;
          
          // Update progress animation
          Animated.timing(progressAnim, {
            toValue: newTime / targetTime,
            duration: 100,
            useNativeDriver: false,
          }).start();

          // Pulse animation every second
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();

          // Check for completion
          if (newTime >= targetTime) {
            handleTimerComplete();
            return targetTime;
          }

          // Warning notifications
          if (targetTime - newTime === 10 && notifications) {
            showWarningNotification('10 seconds remaining! ⏰');
          } else if (targetTime - newTime === 30 && notifications) {
            showWarningNotification('30 seconds left! 📢');
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, targetTime]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    
    // Haptic feedback
    if (hapticFeedback) {
      Vibration.vibrate([0, 500, 200, 500]);
    }

    // Success animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Add to history
    const restRecord = {
      id: Date.now(),
      exercise: currentExercise,
      set: currentSet,
      targetTime,
      actualTime: currentTime,
      timestamp: new Date().toISOString(),
    };
    
    setRestHistory(prev => [restRecord, ...prev.slice(0, 9)]);

    // Show completion message
    Alert.alert(
      'Rest Complete! ✅',
      `Time for set ${currentSet + 1} of ${currentExercise}`,
      [
        {
          text: 'Next Set',
          onPress: () => {
            if (currentSet < totalSets) {
              setCurrentSet(prev => prev + 1);
              if (autoStart) {
                startNewTimer();
              }
            } else {
              Alert.alert('Workout Complete! 🎉', 'Great job finishing all sets!');
            }
          },
        },
        {
          text: 'Rest More',
          onPress: () => startNewTimer(),
        },
      ]
    );
  }, [currentTime, targetTime, currentSet, totalSets, currentExercise, hapticFeedback, autoStart]);

  // Show warning notification
  const showWarningNotification = (message) => {
    if (hapticFeedback) {
      Vibration.vibrate(200);
    }
    // In a real app, you'd show a proper notification
    console.log('Notification:', message);
  };

  // Timer controls
  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(0);
    progressAnim.setValue(0);
  };

  const startNewTimer = () => {
    setCurrentTime(0);
    progressAnim.setValue(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  // Time formatting
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (current, target) => {
    const remaining = Math.max(0, target - current);
    return formatTime(remaining);
  };

  // Progress calculation
  const getProgress = () => {
    return currentTime / targetTime;
  };

  const getProgressColor = () => {
    const progress = getProgress();
    if (progress < 0.5) return COLORS.success;
    if (progress < 0.8) return COLORS.warning;
    return COLORS.error;
  };

  // Handle preset selection
  const selectPreset = (preset) => {
    if (preset.name === 'Custom') {
      Alert.alert(
        'Custom Rest Time',
        'Enter rest time in seconds:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Set',
            onPress: () => {
              // In a real app, you'd have a proper input modal
              setTargetTime(120);
              setShowPresets(false);
            },
          },
        ]
      );
    } else {
      setTargetTime(preset.time);
      setShowPresets(false);
      resetTimer();
    }
  };

  // Render preset modal
  const renderPresetsModal = () => (
    <Portal>
      <Modal
        visible={showPresets}
        onDismiss={() => setShowPresets(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer}>
          <Surface style={styles.modalSurface} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rest Period Presets</Text>
              <IconButton
                icon="close"
                onPress={() => setShowPresets(false)}
              />
            </View>

            <ScrollView style={styles.modalContent}>
              {restPresets.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetCard}
                  onPress={() => selectPreset(preset)}
                >
                  <LinearGradient
                    colors={targetTime === preset.time ? [COLORS.primary, COLORS.secondary] : [COLORS.white, COLORS.lightGray]}
                    style={styles.presetGradient}
                  >
                    <View style={styles.presetIcon}>
                      <Text style={styles.presetEmoji}>{preset.icon}</Text>
                    </View>
                    <View style={styles.presetInfo}>
                      <Text style={[styles.presetName, targetTime === preset.time && { color: COLORS.white }]}>
                        {preset.name}
                      </Text>
                      <Text style={[styles.presetTime, targetTime === preset.time && { color: COLORS.white }]}>
                        {formatTime(preset.time)}
                      </Text>
                      <Text style={[styles.presetDescription, targetTime === preset.time && { color: COLORS.white, opacity: 0.9 }]}>
                        {preset.description}
                      </Text>
                    </View>
                    {targetTime === preset.time && (
                      <Icon name="check-circle" size={24} color={COLORS.white} />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Render settings modal
  const renderSettingsModal = () => (
    <Portal>
      <Modal
        visible={showSettings}
        onDismiss={() => setShowSettings(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurContainer}>
          <Surface style={styles.modalSurface} elevation={5}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Timer Settings</Text>
              <IconButton
                icon="close"
                onPress={() => setShowSettings(false)}
              />
            </View>

            <View style={styles.modalContent}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-start next timer</Text>
                  <Text style={styles.settingDescription}>Automatically start timer for next set</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, autoStart && styles.toggleActive]}
                  onPress={() => setAutoStart(!autoStart)}
                >
                  <View style={[styles.toggleIndicator, autoStart && styles.toggleIndicatorActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <Text style={styles.settingDescription}>Show time remaining alerts</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, notifications && styles.toggleActive]}
                  onPress={() => setNotifications(!notifications)}
                >
                  <View style={[styles.toggleIndicator, notifications && styles.toggleIndicatorActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Haptic Feedback</Text>
                  <Text style={styles.settingDescription}>Vibration for alerts and completion</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, hapticFeedback && styles.toggleActive]}
                  onPress={() => setHapticFeedback(!hapticFeedback)}
                >
                  <View style={[styles.toggleIndicator, hapticFeedback && styles.toggleIndicatorActive]} />
                </TouchableOpacity>
              </View>
            </View>
          </Surface>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Rest Timer</Text>
          <Text style={styles.headerSubtitle}>
            Optimize your recovery periods ⏱️
          </Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton
            icon="tune"
            iconColor={COLORS.white}
            onPress={() => setShowPresets(true)}
          />
          <IconButton
            icon="settings"
            iconColor={COLORS.white}
            onPress={() => setShowSettings(true)}
          />
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Exercise Info */}
        <Surface style={styles.exerciseCard} elevation={3}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{currentExercise}</Text>
            <Chip style={styles.setChip} textStyle={styles.setChipText}>
              Set {currentSet}/{totalSets}
            </Chip>
          </View>
          <Text style={styles.exerciseTarget}>
            Target Rest: {formatTime(targetTime)}
          </Text>
        </Surface>

        {/* Main Timer */}
        <View style={styles.timerContainer}>
          <Animated.View
            style={[
              styles.timerCard,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={[getProgressColor(), `${getProgressColor()}80`]}
              style={styles.timerGradient}
            >
              <View style={styles.timerContent}>
                <Animated.View
                  style={[
                    styles.timerCircle,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <Text style={styles.timeRemaining}>
                    {formatTimeRemaining(currentTime, targetTime)}
                  </Text>
                  <Text style={styles.timeLabel}>
                    {currentTime >= targetTime ? 'DONE!' : 'remaining'}
                  </Text>
                </Animated.View>

                <View style={styles.progressContainer}>
                  <Animated.View style={styles.progressWrapper}>
                    <ProgressBar
                      progress={progressAnim}
                      color={COLORS.white}
                      style={styles.progressBar}
                    />
                  </Animated.View>
                  <Text style={styles.progressText}>
                    {Math.round(getProgress() * 100)}% complete
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Timer Controls */}
        <View style={styles.controlsContainer}>
          <Surface style={styles.controlsCard} elevation={2}>
            <View style={styles.controlsRow}>
              {!isRunning && !isPaused ? (
                <Button
                  mode="contained"
                  onPress={startTimer}
                  style={[styles.controlButton, styles.startButton]}
                  contentStyle={styles.controlButtonContent}
                  labelStyle={styles.controlButtonLabel}
                  icon="play-arrow"
                >
                  Start
                </Button>
              ) : isRunning ? (
                <Button
                  mode="contained"
                  onPress={pauseTimer}
                  style={[styles.controlButton, styles.pauseButton]}
                  contentStyle={styles.controlButtonContent}
                  labelStyle={styles.controlButtonLabel}
                  icon="pause"
                >
                  Pause
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={startTimer}
                  style={[styles.controlButton, styles.resumeButton]}
                  contentStyle={styles.controlButtonContent}
                  labelStyle={styles.controlButtonLabel}
                  icon="play-arrow"
                >
                  Resume
                </Button>
              )}

              <Button
                mode="outlined"
                onPress={resetTimer}
                style={styles.controlButton}
                contentStyle={styles.controlButtonContent}
                labelStyle={styles.resetButtonLabel}
                icon="refresh"
              >
                Reset
              </Button>

              <Button
                mode="contained"
                onPress={() => {
                  if (currentSet < totalSets) {
                    setCurrentSet(prev => prev + 1);
                    startNewTimer();
                  }
                }}
                style={[styles.controlButton, styles.nextButton]}
                contentStyle={styles.controlButtonContent}
                labelStyle={styles.controlButtonLabel}
                icon="skip-next"
                disabled={currentSet >= totalSets}
              >
                Next
              </Button>
            </View>
          </Surface>
        </View>

        {/* Motivation Section */}
        <Surface style={styles.motivationCard} elevation={2}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.motivationGradient}
          >
            <Icon name="psychology" size={24} color={COLORS.white} />
            <Text style={styles.motivationText}>
              {motivationalMessages[currentSet % motivationalMessages.length]}
            </Text>
          </LinearGradient>
        </Surface>

        {/* Quick Adjust */}
        <Surface style={styles.quickAdjustCard} elevation={2}>
          <Text style={styles.quickAdjustTitle}>Quick Adjust</Text>
          <View style={styles.quickAdjustRow}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => {
                const newTime = Math.max(15, targetTime - 15);
                setTargetTime(newTime);
                resetTimer();
              }}
            >
              <Icon name="remove" size={20} color={COLORS.primary} />
              <Text style={styles.adjustText}>-15s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => {
                const newTime = Math.max(30, targetTime - 30);
                setTargetTime(newTime);
                resetTimer();
              }}
            >
              <Icon name="remove" size={20} color={COLORS.primary} />
              <Text style={styles.adjustText}>-30s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => {
                setTargetTime(targetTime + 30);
                resetTimer();
              }}
            >
              <Icon name="add" size={20} color={COLORS.primary} />
              <Text style={styles.adjustText}>+30s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => {
                setTargetTime(targetTime + 60);
                resetTimer();
              }}
            >
              <Icon name="add" size={20} color={COLORS.primary} />
              <Text style={styles.adjustText}>+1m</Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Rest History */}
        {restHistory.length > 0 && (
          <Surface style={styles.historyCard} elevation={2}>
            <Text style={styles.historyTitle}>Recent Rest Periods</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.historyRow}>
                {restHistory.slice(0, 5).map((record) => (
                  <View key={record.id} style={styles.historyItem}>
                    <Text style={styles.historySet}>Set {record.set}</Text>
                    <Text style={styles.historyTime}>
                      {formatTime(record.actualTime)}/{formatTime(record.targetTime)}
                    </Text>
                    <View style={[
                      styles.historyIndicator,
                      {
                        backgroundColor: record.actualTime >= record.targetTime 
                          ? COLORS.success 
                          : COLORS.warning
                      }
                    ]} />
                  </View>
                ))}
              </View>
            </ScrollView>
          </Surface>
        )}
      </Animated.ScrollView>

      {renderPresetsModal()}
      {renderSettingsModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  exerciseName: {
    ...TEXT_STYLES.h3,
  },
  setChip: {
    backgroundColor: COLORS.primary,
  },
  setChipText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  exerciseTarget: {
    ...TEXT_STYLES.body,
    color: COLORS.gray,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timerCard: {
    width: width * 0.85,
    aspectRatio: 1,
    borderRadius: width * 0.425,
    overflow: 'hidden',
    elevation: 8,
  },
  timerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContent: {
    alignItems: 'center',
  },
  timerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  timeRemaining: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: 'monospace',
  },
  timeLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.sm,
  },
  progressContainer: {
    width: width * 0.6,
    alignItems: 'center',
  },
  progressWrapper: {
    width: '100%',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    opacity: 0.9,
  },
  controlsContainer: {
    marginBottom: SPACING.lg,
  },
  controlsCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: 25,
  },
  controlButtonContent: {
    paddingVertical: SPACING.sm,
  },
  controlButtonLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  resetButtonLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  startButton: {
    backgroundColor: COLORS.success,
  },
  pauseButton: {
    backgroundColor: COLORS.warning,
  },
  resumeButton: {
    backgroundColor: COLORS.primary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
  },
  motivationCard: {
    borderRadius: 16,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  motivationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  motivationText: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    fontWeight: '600',
    marginLeft: SPACING.md,
  },
  quickAdjustCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  quickAdjustTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  quickAdjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  adjustButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
  },
  adjustText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS,

  },
});

// Export the component
export default RestPeriodTimerScreen;