import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Vibration,
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
  Portal,
  Modal,
  Badge,
  ActivityIndicator,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import established design system
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const AITrainingAssistant = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [formAnalysisVisible, setFormAnalysisVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [workoutProgress, setWorkoutProgress] = useState(0);
  
  const timerRef = useRef();

  // Redux state
  const { user, isLoading } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Animate screen entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for active elements
    startPulseAnimation();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Timer logic for exercises and rest periods
    if (activeWorkout && (exerciseTimer > 0 || restTimer > 0)) {
      timerRef.current = setInterval(() => {
        if (isResting && restTimer > 0) {
          setRestTimer(prev => prev - 1);
        } else if (!isResting && exerciseTimer > 0) {
          setExerciseTimer(prev => prev - 1);
        } else if (isResting && restTimer === 0) {
          // Move to next exercise
          handleNextExercise();
        } else if (!isResting && exerciseTimer === 0) {
          // Start rest period
          setIsResting(true);
          setRestTimer(15); // 15 second rest
          Vibration.vibrate([100, 100, 100]);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [exerciseTimer, restTimer, isResting, activeWorkout]);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleStartWorkout = useCallback((workout) => {
    setActiveWorkout(workout);
    setCurrentExercise(0);
    setExerciseTimer(workout.exercises[0].duration);
    setWorkoutProgress(0);
    setIsResting(false);
    Vibration.vibrate(100);
  }, []);

  const handleStopWorkout = useCallback(() => {
    setActiveWorkout(null);
    setCurrentExercise(0);
    setExerciseTimer(0);
    setRestTimer(0);
    setIsResting(false);
    setWorkoutProgress(0);
    clearInterval(timerRef.current);
    
    Alert.alert(
      "🎉 Great Work!",
      "You completed your training session! Your AI assistant recorded your progress and will help you improve next time!",
      [{ text: "Awesome! 🌟", style: "default" }]
    );
  }, []);

  const handleNextExercise = useCallback(() => {
    if (!activeWorkout) return;
    
    const nextIndex = currentExercise + 1;
    if (nextIndex < activeWorkout.exercises.length) {
      setCurrentExercise(nextIndex);
      setExerciseTimer(activeWorkout.exercises[nextIndex].duration);
      setIsResting(false);
      setRestTimer(0);
      setWorkoutProgress((nextIndex / activeWorkout.exercises.length) * 100);
      Vibration.vibrate(50);
    } else {
      handleStopWorkout();
    }
  }, [activeWorkout, currentExercise, handleStopWorkout]);

  const handleFormAnalysis = useCallback(() => {
    setFormAnalysisVisible(true);
    Vibration.vibrate(30);
  }, []);

  const handleAIFeature = useCallback((feature) => {
    const messages = {
      formCheck: "📹 AI Form Analysis is getting smarter! Soon I'll watch your movements and give you instant feedback to perfect your technique!",
      motivation: "🎯 AI Motivation Engine is charging up! I'll know exactly when to cheer you on during tough workouts!",
      realtime: "⚡ Real-time Coaching is almost here! I'll guide you through every rep with perfect timing and encouragement!",
      adaptation: "🧠 Smart Workout Adaptation is learning! I'll adjust your workout in real-time based on how you're performing!"
    };

    Alert.alert(
      "🚀 AI Feature Preview",
      messages[feature],
      [{ text: "So Cool! 🤩", style: "default" }]
    );
  }, []);

  // Mock workout data
  const workoutTemplates = [
    {
      id: 1,
      title: "Beginner Football Drills ⚽",
      duration: "15 min",
      difficulty: "Easy",
      exercises: [
        { name: "Warm-up Jog", duration: 60, reps: null, description: "Light jogging to get your body ready!" },
        { name: "Ball Touches", duration: 45, reps: 20, description: "Gently tap the ball with both feet" },
        { name: "Cone Weaving", duration: 60, reps: null, description: "Zigzag through cones with the ball" },
        { name: "Basic Kicks", duration: 45, reps: 15, description: "Practice your kicking technique" },
        { name: "Cool Down Stretch", duration: 60, reps: null, description: "Gentle stretches to finish strong!" }
      ],
      color: "#4ECDC4"
    },
    {
      id: 2,
      title: "Fun Agility Training 🏃‍♂️",
      duration: "12 min",
      difficulty: "Moderate",
      exercises: [
        { name: "High Knees", duration: 30, reps: null, description: "Lift those knees up high!" },
        { name: "Side Steps", duration: 45, reps: null, description: "Quick steps side to side" },
        { name: "Jump Squats", duration: 30, reps: 10, description: "Jump up from squat position" },
        { name: "Ladder Drill", duration: 60, reps: null, description: "Quick feet through the ladder" }
      ],
      color: "#FF6B6B"
    },
    {
      id: 3,
      title: "Strength & Balance 💪",
      duration: "10 min",
      difficulty: "Easy",
      exercises: [
        { name: "Wall Push-ups", duration: 30, reps: 10, description: "Push-ups against the wall" },
        { name: "Single Leg Stand", duration: 30, reps: null, description: "Balance on one foot" },
        { name: "Bear Crawl", duration: 45, reps: null, description: "Crawl like a bear!" },
        { name: "Plank Hold", duration: 20, reps: null, description: "Hold strong plank position" }
      ],
      color: "#45B7D1"
    }
  ];

  const aiFeatures = [
    { id: 'formCheck', title: 'Form Analysis 📹', description: 'AI watches and corrects your technique', icon: 'videocam' },
    { id: 'motivation', title: 'Smart Motivation 🎯', description: 'Personalized encouragement when you need it', icon: 'psychology' },
    { id: 'realtime', title: 'Real-time Coaching ⚡', description: 'Live guidance through every exercise', icon: 'record-voice-over' },
    { id: 'adaptation', title: 'Adaptive Workouts 🧠', description: 'Workouts that adjust to your performance', icon: 'tune' }
  ];

  const currentWorkoutExercise = activeWorkout ? activeWorkout.exercises[currentExercise] : null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.headerTop}>
            <View style={styles.assistantInfo}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Avatar.Icon 
                  size={50} 
                  icon="fitness-center"
                  style={styles.assistantAvatar}
                />
                {activeWorkout && (
                  <Badge style={styles.activeBadge} size={12} />
                )}
              </Animated.View>
              <View style={styles.assistantDetails}>
                <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
                  AI Training Assistant 🤖
                </Text>
                <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
                  {activeWorkout ? "🔥 Workout in Progress!" : "Ready to train with you!"}
                </Text>
              </View>
            </View>
            
            {activeWorkout && (
              <Surface style={styles.progressBadge}>
                <Text style={styles.progressText}>
                  {Math.round(workoutProgress)}%
                </Text>
              </Surface>
            )}
          </View>

          {/* Active workout progress */}
          {activeWorkout && (
            <View style={styles.workoutProgress}>
              <ProgressBar
                progress={workoutProgress / 100}
                color="#FFD700"
                style={styles.mainProgressBar}
              />
              <Text style={styles.workoutTitle}>
                {activeWorkout.title} - Exercise {currentExercise + 1}/{activeWorkout.exercises.length}
              </Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {/* Active Workout Display */}
      {activeWorkout && currentWorkoutExercise && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card style={styles.activeWorkoutCard}>
            <LinearGradient
              colors={[activeWorkout.color, `${activeWorkout.color}80`]}
              style={styles.activeWorkoutGradient}
            >
              <View style={styles.activeWorkoutContent}>
                <View style={styles.exerciseInfo}>
                  <Text style={[TEXT_STYLES.h2, styles.exerciseTitle]}>
                    {currentWorkoutExercise.name}
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.exerciseDescription]}>
                    {currentWorkoutExercise.description}
                  </Text>
                </View>

                <View style={styles.timerSection}>
                  <Text style={styles.timerLabel}>
                    {isResting ? "Rest Time 😌" : "Exercise Time 💪"}
                  </Text>
                  <Text style={styles.timerDisplay}>
                    {formatTime(isResting ? restTimer : exerciseTimer)}
                  </Text>
                  {currentWorkoutExercise.reps && (
                    <Text style={styles.repsText}>
                      Target: {currentWorkoutExercise.reps} reps
                    </Text>
                  )}
                </View>

                <View style={styles.workoutControls}>
                  <IconButton
                    icon="pause"
                    iconColor="white"
                    size={24}
                    style={styles.controlButton}
                    onPress={() => {/* Pause logic */}}
                  />
                  <IconButton
                    icon="skip-next"
                    iconColor="white"
                    size={24}
                    style={styles.controlButton}
                    onPress={handleNextExercise}
                  />
                  <IconButton
                    icon="stop"
                    iconColor="white"
                    size={24}
                    style={styles.controlButton}
                    onPress={handleStopWorkout}
                  />
                </View>
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {!activeWorkout && (
          <>
            {/* AI Features */}
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.sectionContainer}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                  🚀 AI Powers (Coming Soon!)
                </Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.featuresContainer}
                >
                  {aiFeatures.map((feature) => (
                    <TouchableOpacity
                      key={feature.id}
                      onPress={() => handleAIFeature(feature.id)}
                      activeOpacity={0.7}
                    >
                      <Surface style={styles.featureCard}>
                        <Icon name={feature.icon} size={32} color={COLORS.primary} />
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                        <Chip mode="outlined" textStyle={styles.chipText}>
                          Preview 🔮
                        </Chip>
                      </Surface>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </Animated.View>

            {/* Quick Start Workouts */}
            <View style={styles.sectionContainer}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                🏋️ Quick Start Workouts
              </Text>
              {workoutTemplates.map((workout, index) => (
                <Animated.View
                  key={workout.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      })
                    }]
                  }}
                >
                  <Card style={[styles.workoutCard, { marginTop: index > 0 ? SPACING.md : 0 }]}>
                    <View style={styles.workoutCardContent}>
                      <LinearGradient
                        colors={[workout.color, `${workout.color}80`]}
                        style={styles.workoutIcon}
                      >
                        <Icon name="fitness-center" size={24} color="white" />
                      </LinearGradient>
                      
                      <View style={styles.workoutInfo}>
                        <Text style={[TEXT_STYLES.h4, styles.workoutCardTitle]}>
                          {workout.title}
                        </Text>
                        <View style={styles.workoutMeta}>
                          <Chip mode="outlined" textStyle={styles.chipText} style={styles.difficultyChip}>
                            {workout.difficulty}
                          </Chip>
                          <Text style={styles.workoutDuration}>
                            ⏱️ {workout.duration} • 🎯 {workout.exercises.length} exercises
                          </Text>
                        </View>
                        <Text style={[TEXT_STYLES.caption, styles.exercisePreview]}>
                          {workout.exercises.map(ex => ex.name).slice(0, 3).join(" • ")}
                          {workout.exercises.length > 3 && "..."}
                        </Text>
                      </View>

                      <Button
                        mode="contained"
                        onPress={() => handleStartWorkout(workout)}
                        style={[styles.startButton, { backgroundColor: workout.color }]}
                        labelStyle={styles.startButtonText}
                      >
                        Start 🚀
                      </Button>
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </View>
          </>
        )}

        {/* Tips Section */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionContainer}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              💡 AI Training Tips
            </Text>
            <Card style={styles.tipCard}>
              <View style={styles.tipContent}>
                <Icon name="lightbulb" size={32} color="#FFD700" />
                <View style={styles.tipText}>
                  <Text style={[TEXT_STYLES.h4, styles.tipTitle]}>
                    Perfect Your Form! 🎯
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.tipDescription]}>
                    Quality over quantity! Focus on doing each exercise correctly rather than rushing through them.
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Form Analysis Modal */}
      <Portal>
        <Modal
          visible={formAnalysisVisible}
          onDismiss={() => setFormAnalysisVisible(false)}
          contentContainerStyle={styles.formAnalysisModal}
        >
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
              📹 AI Form Analysis
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setFormAnalysisVisible(false)}
            />
          </View>
          
          <View style={styles.modalContent}>
            <Surface style={styles.cameraPlaceholder}>
              <Icon name="videocam-off" size={48} color={COLORS.textSecondary} />
              <Text style={styles.cameraText}>Camera Preview</Text>
              <Text style={styles.comingSoonText}>Coming Soon! 🚀</Text>
            </Surface>
            
            <View style={styles.analysisResults}>
              <Text style={[TEXT_STYLES.body, styles.analysisText]}>
                🤖 AI will analyze your form in real-time and provide instant feedback to help you improve your technique!
              </Text>
            </View>
            
            <Button
              mode="contained"
              style={styles.modalButton}
              onPress={() => setFormAnalysisVisible(false)}
            >
              Got it! 👍
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Floating Action Buttons */}
      {!activeWorkout && (
        <FAB
          icon="camera"
          label="Form Check"
          style={styles.fab}
          onPress={handleFormAnalysis}
          color="white"
        />
      )}
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  assistantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  assistantAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#4CAF50',
  },
  assistantDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  progressBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  workoutProgress: {
    marginTop: SPACING.md,
  },
  mainProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.xs,
  },
  workoutTitle: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  activeWorkoutCard: {
    margin: SPACING.lg,
    marginTop: -SPACING.lg,
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeWorkoutGradient: {
    padding: SPACING.xl,
  },
  activeWorkoutContent: {
    alignItems: 'center',
  },
  exerciseInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  exerciseTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  exerciseDescription: {
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timerLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  timerDisplay: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  repsText: {
    color: 'white',
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  workoutControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: SPACING.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  featuresContainer: {
    flexDirection: 'row',
  },
  featureCard: {
    width: 160,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    borderRadius: 16,
    backgroundColor: 'white',
    elevation: 4,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  chipText: {
    fontSize: 10,
  },
  workoutCard: {
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 16,
  },
  workoutCardContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutCardTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  difficultyChip: {
    height: 24,
    marginRight: SPACING.sm,
  },
  workoutDuration: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  exercisePreview: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  startButton: {
    marginLeft: SPACING.sm,
  },
  startButtonText: {
    color: 'white',
    fontSize: 12,
  },
  tipCard: {
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  tipTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tipDescription: {
    color: COLORS.textSecondary,
  },
  formAnalysisModal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  cameraPlaceholder: {
    height: 200,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  cameraText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  comingSoonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  analysisResults: {
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  analysisText: {
    color: COLORS.text,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});

export default AITrainingAssistant;