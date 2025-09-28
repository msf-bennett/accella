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
  StyleSheet,
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

const ExerciseInstructions = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { exerciseId, sessionId } = route?.params || {};

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exercise, setExercise] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [userNotes, setUserNotes] = useState('');

  // Mock exercise data
  const mockExercise = {
    id: exerciseId || 'ex_001',
    name: 'Burpee with Jump 💪',
    category: 'Full Body',
    difficulty: 'Intermediate',
    duration: '3 sets × 10 reps',
    restTime: 60,
    calories: 45,
    muscleGroups: ['Full Body', 'Cardio', 'Core'],
    equipment: 'None',
    videoUrl: 'mock_video.mp4',
    thumbnailUrl: 'mock_thumbnail.jpg',
    description: 'A high-intensity full-body exercise that combines a squat, plank, push-up, and jump into one fluid movement.',
    instructions: [
      'Start in a standing position with feet shoulder-width apart',
      'Drop into a squat position and place hands on the ground',
      'Jump feet back into a plank position',
      'Perform a push-up (optional for beginners)',
      'Jump feet back to squat position',
      'Explosively jump up with arms overhead',
      'Land softly and repeat'
    ],
    tips: [
      'Keep your core engaged throughout the movement',
      'Land softly on your toes, not your heels',
      'Maintain proper form over speed',
      'Breathe rhythmically - exhale on exertion'
    ],
    commonMistakes: [
      'Arching back during plank position',
      'Not fully extending during jump',
      'Rushing through movements',
      'Poor landing mechanics'
    ],
    modifications: {
      beginner: 'Skip the push-up and jump, step back instead of jumping',
      advanced: 'Add a tuck jump or use a medicine ball'
    },
    targetMetrics: {
      heartRate: '75-85% Max HR',
      rpe: '7-8/10',
      tempo: '2-1-2-1'
    }
  };

  useEffect(() => {
    loadExercise();
    startAnimations();
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            if (Platform.OS !== 'web') {
              Vibration.vibrate(1000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timeRemaining]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExercise(mockExercise);
    } catch (error) {
      Alert.alert('Error', 'Failed to load exercise instructions');
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
    loadExercise().finally(() => setRefreshing(false));
  }, []);

  const handleStepComplete = (stepIndex) => {
    const newCompleted = new Set(completedSteps);
    if (completedSteps.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
      if (Platform.OS !== 'web') {
        Vibration.vibrate(100);
      }
    }
    setCompletedSteps(newCompleted);

    // Update progress animation
    const progress = newCompleted.size / (exercise?.instructions?.length || 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const startRestTimer = () => {
    setTimeRemaining(exercise?.restTime || 60);
    setTimerActive(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoSection = () => (
    <Card style={styles.videoCard} elevation={4}>
      <Surface style={styles.videoContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.3)']}
          style={styles.videoOverlay}
        >
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              setIsVideoPlaying(!isVideoPlaying);
              if (Platform.OS !== 'web') {
                Vibration.vibrate(50);
              }
            }}
          >
            <Icon
              name={isVideoPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
              size={60}
              color="white"
            />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.videoInfo}>
          <Chip icon="timer" mode="outlined" style={styles.durationChip}>
            {exercise?.duration}
          </Chip>
          <Chip icon="local-fire-department" mode="outlined" style={styles.caloriesChip}>
            {exercise?.calories} cal
          </Chip>
        </View>
      </Surface>
    </Card>
  );

  const renderExerciseHeader = () => (
    <Card style={styles.headerCard} elevation={2}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.exerciseTitle}>{exercise?.name}</Text>
            <Text style={styles.exerciseCategory}>{exercise?.category}</Text>
          </View>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{exercise?.difficulty}</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );

  const renderProgressSection = () => (
    <Card style={styles.progressCard} elevation={2}>
      <Card.Content>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progress 🎯</Text>
          <Text style={styles.progressText}>
            {completedSteps.size}/{exercise?.instructions?.length || 0} steps
          </Text>
        </View>
        <Animated.View style={styles.progressBarContainer}>
          <ProgressBar
            progress={completedSteps.size / (exercise?.instructions?.length || 1)}
            color={COLORS.success}
            style={styles.progressBar}
          />
        </Animated.View>
        <View style={styles.metricsRow}>
          <Chip icon="favorite" mode="outlined" style={styles.metricChip}>
            {exercise?.targetMetrics?.heartRate}
          </Chip>
          <Chip icon="speed" mode="outlined" style={styles.metricChip}>
            RPE {exercise?.targetMetrics?.rpe}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const renderInstructionStep = (instruction, index) => {
    const isCompleted = completedSteps.has(index);
    const isCurrent = index === currentStep;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleStepComplete(index)}
        style={[
          styles.stepCard,
          isCurrent && styles.currentStepCard,
          isCompleted && styles.completedStepCard,
        ]}
      >
        <View style={styles.stepContent}>
          <View style={[
            styles.stepNumber,
            isCompleted && styles.completedStepNumber,
            isCurrent && styles.currentStepNumber,
          ]}>
            {isCompleted ? (
              <Icon name="check" size={20} color="white" />
            ) : (
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.stepTextContainer}>
            <Text style={[
              styles.stepText,
              isCompleted && styles.completedStepText,
            ]}>
              {instruction}
            </Text>
          </View>
        </View>
        {isCurrent && (
          <View style={styles.currentIndicator}>
            <Icon name="play-arrow" size={16} color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderTipsModal = () => (
    <Portal>
      <Modal visible={showTips} onDismiss={() => setShowTips(false)}>
        <BlurView intensity={100} style={styles.modalContainer}>
          <Card style={styles.tipsModal} elevation={8}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pro Tips 💡</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowTips(false)}
                />
              </View>
              <Divider style={styles.modalDivider} />
              {exercise?.tips?.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Icon name="lightbulb-outline" size={20} color={COLORS.warning} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
              <Divider style={styles.modalDivider} />
              <Text style={styles.mistakesTitle}>Common Mistakes ⚠️</Text>
              {exercise?.commonMistakes?.map((mistake, index) => (
                <View key={index} style={styles.mistakeItem}>
                  <Icon name="warning" size={20} color={COLORS.error} />
                  <Text style={styles.mistakeText}>{mistake}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderRestTimer = () => (
    <Card style={styles.timerCard} elevation={4}>
      <LinearGradient
        colors={[COLORS.accent, '#c0392b']}
        style={styles.timerGradient}
      >
        <Text style={styles.timerTitle}>Rest Timer ⏱️</Text>
        <Text style={styles.timerDisplay}>{formatTime(timeRemaining)}</Text>
        <View style={styles.timerButtons}>
          <Button
            mode="contained"
            onPress={startRestTimer}
            style={styles.timerButton}
            labelStyle={styles.timerButtonText}
          >
            Start Rest
          </Button>
          {timerActive && (
            <Button
              mode="outlined"
              onPress={() => setTimerActive(false)}
              style={styles.timerButton}
              labelStyle={styles.timerButtonTextOutlined}
            >
              Stop
            </Button>
          )}
        </View>
      </LinearGradient>
    </Card>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <Button
        mode="outlined"
        onPress={() => setShowTips(true)}
        style={styles.actionButton}
        icon="lightbulb-outline"
      >
        Tips & Mistakes
      </Button>
      <Button
        mode="outlined"
        onPress={() => setShowNotes(true)}
        style={styles.actionButton}
        icon="note"
      >
        My Notes
      </Button>
      <Button
        mode="contained"
        onPress={() => {
          Alert.alert('Exercise Complete! 🎉', 'Great job! Ready for the next exercise?', [
            { text: 'Rest More', style: 'cancel' },
            { text: 'Continue', onPress: () => navigation.goBack() }
          ]);
        }}
        style={styles.completeButton}
        icon="check"
      >
        Complete Exercise
      </Button>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.loadingGradient}
        >
          <Icon name="fitness-center" size={60} color="white" />
          <Text style={styles.loadingText}>Loading Exercise...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      <Animated.ScrollView
        style={[styles.scrollContainer, { opacity: fadeAnim }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor="white"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {renderExerciseHeader()}
          {renderVideoSection()}
          {renderProgressSection()}
          {renderRestTimer()}

          <Card style={styles.instructionsCard} elevation={2}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Step-by-Step Instructions 📋</Text>
              {exercise?.instructions?.map((instruction, index) =>
                renderInstructionStep(instruction, index)
              )}
            </Card.Content>
          </Card>

          <Card style={styles.equipmentCard} elevation={2}>
            <Card.Content>
              <View style={styles.equipmentHeader}>
                <Icon name="fitness-center" size={24} color={COLORS.primary} />
                <Text style={styles.equipmentTitle}>Equipment Needed</Text>
              </View>
              <Chip icon="check-circle" mode="outlined" style={styles.equipmentChip}>
                {exercise?.equipment}
              </Chip>
              
              <Text style={styles.muscleGroupTitle}>Target Muscle Groups 🎯</Text>
              <View style={styles.muscleGroupsContainer}>
                {exercise?.muscleGroups?.map((group, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    style={styles.muscleGroupChip}
                  >
                    {group}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          {renderActionButtons()}
        </Animated.View>
      </Animated.ScrollView>

      {renderTipsModal()}

      <FAB
        icon="play-arrow"
        style={styles.fab}
        onPress={() => setCurrentStep((prev) => 
          prev < (exercise?.instructions?.length || 1) - 1 ? prev + 1 : 0
        )}
        color="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  content: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  
  // Header Section
  headerCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  exerciseTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  exerciseCategory: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  difficultyText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
  },

  // Video Section
  videoCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoContainer: {
    height: 200,
    backgroundColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'column',
  },
  durationChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.sm,
  },
  caloriesChip: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  // Progress Section
  progressCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
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
  progressText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricChip: {
    flex: 0.48,
  },

  // Instructions Section
  instructionsCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentStepCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  completedStepCard: {
    backgroundColor: `${COLORS.success}10`,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  currentStepNumber: {
    backgroundColor: COLORS.primary,
  },
  completedStepNumber: {
    backgroundColor: COLORS.success,
  },
  stepNumberText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepText: {
    ...TEXT_STYLES.body,
  },
  completedStepText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  currentIndicator: {
    marginLeft: SPACING.sm,
  },

  // Timer Section
  timerCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  timerGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  timerTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginBottom: SPACING.sm,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.lg,
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: SPACING.sm,
  },
  timerButtonText: {
    color: 'white',
  },
  timerButtonTextOutlined: {
    color: 'white',
  },

  // Equipment Section
  equipmentCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  equipmentTitle: {
    ...TEXT_STYLES.h3,
    marginLeft: SPACING.sm,
  },
  equipmentChip: {
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
  },
  muscleGroupTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  muscleGroupsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleGroupChip: {
    marginBottom: SPACING.sm,
    marginRight: SPACING.sm,
  },

  // Action Buttons
  actionButtonsContainer: {
    paddingVertical: SPACING.md,
  },
  actionButton: {
    borderColor: COLORS.primary,
    marginBottom: SPACING.md,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  tipsModal: {
    borderRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h2,
  },
  modalDivider: {
    marginVertical: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tipText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.md,
    flex: 1,
  },
  mistakesTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  mistakeText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.md,
    flex: 1,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default ExerciseInstructions;