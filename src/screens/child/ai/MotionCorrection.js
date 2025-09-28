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

const MotionCorrection = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [analysisActive, setAnalysisActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [motionScore, setMotionScore] = useState(0);
  const [corrections, setCorrections] = useState([]);
  const [analysisModal, setAnalysisModal] = useState(false);
  const [demoModal, setDemoModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [scoreAnim] = useState(new Animated.Value(0));
  
  const analysisTimer = useRef();
  const scoreUpdateTimer = useRef();

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

    startPulseAnimation();

    return () => {
      clearInterval(analysisTimer.current);
      clearInterval(scoreUpdateTimer.current);
    };
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateScore = useCallback((targetScore) => {
    Animated.timing(scoreAnim, {
      toValue: targetScore / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleStartAnalysis = useCallback((exercise) => {
    setSelectedExercise(exercise);
    setAnalysisActive(true);
    setMotionScore(0);
    setCorrections([]);
    Vibration.vibrate(100);

    // Simulate real-time analysis
    let score = 0;
    let analysisCount = 0;
    const maxAnalysisTime = 15; // 15 seconds

    analysisTimer.current = setInterval(() => {
      analysisCount++;
      
      // Simulate improving score over time
      const newScore = Math.min(95, Math.floor(Math.random() * 20) + score + 3);
      setMotionScore(newScore);
      animateScore(newScore);
      score = newScore;

      // Generate corrections based on exercise type
      if (analysisCount === 3) {
        generateCorrections(exercise, newScore);
      }

      // Provide encouraging feedback
      if (analysisCount === 5 && newScore > 70) {
        Vibration.vibrate([100, 100, 100]);
      }

      // Stop analysis after max time
      if (analysisCount >= maxAnalysisTime) {
        handleStopAnalysis(true);
      }
    }, 1000);
  }, [animateScore]);

  const handleStopAnalysis = useCallback((completed = false) => {
    setAnalysisActive(false);
    clearInterval(analysisTimer.current);
    
    if (completed && motionScore > 80) {
      Alert.alert(
        "🎉 Awesome Form!",
        `Great job! Your ${selectedExercise.name} form scored ${motionScore}%! You're getting stronger and better with every rep!`,
        [{ text: "Thanks Coach! 🌟", style: "default" }]
      );
    } else if (completed) {
      Alert.alert(
        "👍 Keep Practicing!",
        `Nice effort! Your ${selectedExercise.name} form scored ${motionScore}%. Check out the tips below to improve even more!`,
        [{ text: "I'll do better! 💪", style: "default" }]
      );
    }
  }, [motionScore, selectedExercise]);

  const generateCorrections = useCallback((exercise, score) => {
    const correctionsByExercise = {
      'squats': [
        { id: 1, text: "Keep your back straight! 📏", severity: 'medium', icon: 'straighten' },
        { id: 2, text: "Go down a bit more! 🔽", severity: 'low', icon: 'keyboard-arrow-down' },
        { id: 3, text: "Great knee alignment! ✅", severity: 'good', icon: 'check-circle' }
      ],
      'pushups': [
        { id: 1, text: "Keep your body in a straight line! 📐", severity: 'high', icon: 'straighten' },
        { id: 2, text: "Perfect arm position! ✅", severity: 'good', icon: 'check-circle' }
      ],
      'jumping_jacks': [
        { id: 1, text: "Jump with more energy! ⚡", severity: 'medium', icon: 'bolt' },
        { id: 2, text: "Awesome timing! ✅", severity: 'good', icon: 'check-circle' }
      ],
      'lunges': [
        { id: 1, text: "Keep your front knee over your ankle! 🦵", severity: 'medium', icon: 'accessibility' },
        { id: 2, text: "Great balance! ✅", severity: 'good', icon: 'check-circle' }
      ]
    };

    const exerciseCorrections = correctionsByExercise[exercise.key] || [
      { id: 1, text: "You're doing great! Keep it up! 🌟", severity: 'good', icon: 'star' }
    ];

    setCorrections(exerciseCorrections);
  }, []);

  const handleShowDemo = useCallback((exercise) => {
    setSelectedExercise(exercise);
    setDemoModal(true);
    Vibration.vibrate(30);
  }, []);

  const handleMotionTip = useCallback((tip) => {
    Alert.alert(
      "🎯 Motion Tip",
      tip,
      [{ text: "Got it! 👍", style: "default" }]
    );
  }, []);

  // Mock exercise data
  const exercises = [
    {
      id: 1,
      name: "Squats",
      key: "squats",
      description: "Perfect your squat form for strong legs!",
      icon: "fitness-center",
      color: "#4ECDC4",
      difficulty: "Beginner",
      focusAreas: ["Legs", "Core", "Balance"],
      commonMistakes: ["Knee alignment", "Back posture", "Depth"]
    },
    {
      id: 2,
      name: "Push-ups",
      key: "pushups",
      description: "Build upper body strength with perfect form!",
      icon: "accessibility-new",
      color: "#FF6B6B",
      difficulty: "Beginner",
      focusAreas: ["Arms", "Chest", "Core"],
      commonMistakes: ["Body alignment", "Hand position", "Range of motion"]
    },
    {
      id: 3,
      name: "Jumping Jacks",
      key: "jumping_jacks",
      description: "Fun cardio exercise with perfect coordination!",
      icon: "directions-run",
      color: "#45B7D1",
      difficulty: "Easy",
      focusAreas: ["Cardio", "Coordination", "Full body"],
      commonMistakes: ["Timing", "Landing", "Arm movement"]
    },
    {
      id: 4,
      name: "Lunges",
      key: "lunges",
      description: "Master the lunge for better leg strength!",
      icon: "accessibility",
      color: "#96CEB4",
      difficulty: "Intermediate",
      focusAreas: ["Legs", "Balance", "Stability"],
      commonMistakes: ["Knee position", "Balance", "Step length"]
    }
  ];

  const motionTips = [
    "🎯 Start slow and focus on perfect form before going fast!",
    "👀 Use a mirror to check your form while exercising!",
    "🔄 Practice the movement without weights first!",
    "📱 Record yourself to see how you move!",
    "🧘 Take breaks when you feel tired to maintain good form!"
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#FFC107';
      case 'good': return '#4CAF50';
      default: return COLORS.textSecondary;
    }
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
            <View style={styles.motionInfo}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Avatar.Icon 
                  size={50} 
                  icon="camera-alt"
                  style={styles.motionAvatar}
                />
                {analysisActive && (
                  <Badge style={styles.recordingBadge} size={12} />
                )}
              </Animated.View>
              <View style={styles.motionDetails}>
                <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
                  Motion Correction 🎯
                </Text>
                <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
                  {analysisActive ? "🔍 Analyzing your form..." : "AI-powered form analysis!"}
                </Text>
              </View>
            </View>
            
            {analysisActive && selectedExercise && (
              <Surface style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{motionScore}%</Text>
              </Surface>
            )}
          </View>

          {/* Analysis progress */}
          {analysisActive && (
            <View style={styles.analysisProgress}>
              <Text style={styles.analysisText}>
                Analyzing {selectedExercise.name} form... 🤖
              </Text>
              <ProgressBar
                progress={motionScore / 100}
                color={getScoreColor(motionScore)}
                style={styles.scoreProgressBar}
              />
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {/* Active Analysis Display */}
      {analysisActive && selectedExercise && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card style={styles.activeAnalysisCard}>
            <LinearGradient
              colors={[selectedExercise.color, `${selectedExercise.color}80`]}
              style={styles.activeAnalysisGradient}
            >
              <View style={styles.activeAnalysisContent}>
                <View style={styles.exerciseHeader}>
                  <Icon name={selectedExercise.icon} size={32} color="white" />
                  <View style={styles.exerciseDetails}>
                    <Text style={[TEXT_STYLES.h3, styles.activeExerciseTitle]}>
                      {selectedExercise.name}
                    </Text>
                    <Text style={[TEXT_STYLES.body, styles.activeExerciseDesc]}>
                      Keep going! I'm watching your form! 👁️
                    </Text>
                  </View>
                </View>

                <View style={styles.scoreDisplay}>
                  <Animated.View style={styles.scoreCircle}>
                    <Text style={styles.scoreNumber}>{motionScore}</Text>
                    <Text style={styles.scoreLabel}>Form Score</Text>
                  </Animated.View>
                </View>

                <View style={styles.analysisControls}>
                  <Button
                    mode="contained"
                    onPress={() => handleStopAnalysis(true)}
                    style={styles.stopButton}
                    labelStyle={styles.stopButtonText}
                    icon="stop"
                  >
                    Finish Analysis
                  </Button>
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
        {/* Corrections Display */}
        {corrections.length > 0 && !analysisActive && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.sectionContainer}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                🎯 Form Feedback
              </Text>
              {corrections.map((correction) => (
                <Card key={correction.id} style={styles.correctionCard}>
                  <View style={styles.correctionContent}>
                    <Surface style={[
                      styles.correctionIcon,
                      { backgroundColor: getSeverityColor(correction.severity) + '20' }
                    ]}>
                      <Icon 
                        name={correction.icon} 
                        size={24} 
                        color={getSeverityColor(correction.severity)} 
                      />
                    </Surface>
                    <Text style={[TEXT_STYLES.body, styles.correctionText]}>
                      {correction.text}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Exercise Selection */}
        {!analysisActive && (
          <View style={styles.sectionContainer}>
            <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
              🏋️ Choose Exercise to Analyze
            </Text>
            {exercises.map((exercise, index) => (
              <Animated.View
                key={exercise.id}
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
                <Card style={[styles.exerciseCard, { marginTop: index > 0 ? SPACING.md : 0 }]}>
                  <View style={styles.exerciseCardContent}>
                    <LinearGradient
                      colors={[exercise.color, `${exercise.color}80`]}
                      style={styles.exerciseIcon}
                    >
                      <Icon name={exercise.icon} size={24} color="white" />
                    </LinearGradient>
                    
                    <View style={styles.exerciseInfo}>
                      <Text style={[TEXT_STYLES.h4, styles.exerciseTitle]}>
                        {exercise.name}
                      </Text>
                      <Text style={[TEXT_STYLES.body, styles.exerciseDescription]}>
                        {exercise.description}
                      </Text>
                      
                      <View style={styles.exerciseMeta}>
                        <Chip mode="outlined" textStyle={styles.chipText} style={styles.difficultyChip}>
                          {exercise.difficulty}
                        </Chip>
                        <Text style={styles.focusAreas}>
                          🎯 {exercise.focusAreas.slice(0, 2).join(", ")}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.exerciseActions}>
                      <IconButton
                        icon="play-circle"
                        iconColor="white"
                        size={20}
                        style={[styles.actionButton, { backgroundColor: exercise.color }]}
                        onPress={() => handleShowDemo(exercise)}
                      />
                      <Button
                        mode="contained"
                        onPress={() => handleStartAnalysis(exercise)}
                        style={[styles.analyzeButton, { backgroundColor: exercise.color }]}
                        labelStyle={styles.analyzeButtonText}
                      >
                        Analyze 🔍
                      </Button>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Motion Tips */}
        {!analysisActive && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.sectionContainer}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                💡 Pro Motion Tips
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.tipsContainer}
              >
                {motionTips.map((tip, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleMotionTip(tip)}
                    activeOpacity={0.7}
                  >
                    <Surface style={styles.tipCard}>
                      <Icon name="lightbulb" size={24} color="#FFD700" />
                      <Text style={styles.tipText}>{tip}</Text>
                    </Surface>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Demo Modal */}
      <Portal>
        <Modal
          visible={demoModal}
          onDismiss={() => setDemoModal(false)}
          contentContainerStyle={styles.demoModal}
        >
          <View style={styles.modalHeader}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
              📹 {selectedExercise?.name} Demo
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setDemoModal(false)}
            />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Surface style={styles.videoPlaceholder}>
              <Icon name="play-circle" size={64} color={COLORS.primary} />
              <Text style={styles.videoText}>Exercise Demo Video</Text>
              <Text style={styles.comingSoonText}>Coming Soon! 🎬</Text>
            </Surface>
            
            {selectedExercise && (
              <View style={styles.exerciseGuide}>
                <Text style={[TEXT_STYLES.h4, styles.guideTitle]}>
                  How to do {selectedExercise.name} perfectly:
                </Text>
                <View style={styles.focusAreasSection}>
                  <Text style={[TEXT_STYLES.body, styles.focusTitle]}>
                    🎯 Focus Areas:
                  </Text>
                  {selectedExercise.focusAreas.map((area, index) => (
                    <Text key={index} style={styles.focusArea}>
                      • {area}
                    </Text>
                  ))}
                </View>
                <View style={styles.mistakesSection}>
                  <Text style={[TEXT_STYLES.body, styles.mistakesTitle]}>
                    ⚠️ Common Mistakes to Avoid:
                  </Text>
                  {selectedExercise.commonMistakes.map((mistake, index) => (
                    <Text key={index} style={styles.mistake}>
                      • {mistake}
                    </Text>
                  ))}
                </View>
              </View>
            )}
            
            <Button
              mode="contained"
              style={styles.modalButton}
              onPress={() => setDemoModal(false)}
            >
              Got it! Let's practice! 💪
            </Button>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      {!analysisActive && (
        <FAB
          icon="camera-alt"
          label="Quick Check"
          style={styles.fab}
          onPress={() => {
            Alert.alert(
              "📹 Quick Form Check",
              "Point your camera at yourself and I'll give you instant feedback on your form! This feature is being perfected just for you!",
              [{ text: "Amazing! 🤩", style: "default" }]
            );
          }}
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
  motionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  motionAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  recordingBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F44336',
  },
  motionDetails: {
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
  scoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  analysisProgress: {
    marginTop: SPACING.md,
  },
  analysisText: {
    color: 'white',
    fontSize: 14,
    marginBottom: SPACING.xs,
    opacity: 0.9,
  },
  scoreProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeAnalysisCard: {
    margin: SPACING.lg,
    marginTop: -SPACING.lg,
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeAnalysisGradient: {
    padding: SPACING.xl,
  },
  activeAnalysisContent: {
    alignItems: 'center',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  exerciseDetails: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  activeExerciseTitle: {
    color: 'white',
    marginBottom: SPACING.xs,
  },
  activeExerciseDesc: {
    color: 'white',
    opacity: 0.9,
  },
  scoreDisplay: {
    marginBottom: SPACING.lg,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  analysisControls: {
    width: '100%',
  },
  stopButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stopButtonText: {
    color: 'white',
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
  correctionCard: {
    backgroundColor: 'white',
    elevation: 2,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  correctionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  correctionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  correctionText: {
    flex: 1,
    color: COLORS.text,
  },
  exerciseCard: {
    backgroundColor: 'white',
    elevation: 4,
    borderRadius: 16,
  },
  exerciseCardContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  exerciseDescription: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyChip: {
    height: 24,
    marginRight: SPACING.sm,
  },
  chipText: {
    fontSize: 10,
  },
  focusAreas: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  exerciseActions: {
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
    width: 40,
    height: 40,
    marginBottom: SPACING.sm,
  },
  analyzeButton: {
    paddingHorizontal: SPACING.sm,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  tipsContainer: {
    flexDirection: 'row',
  },
  tipCard: {
    width: 200,
    padding: SPACING.lg,
    marginRight: SPACING.md,
    borderRadius: 16,
    backgroundColor: 'white',
    elevation: 4,
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  demoModal: {
    backgroundColor: 'white',
    margin: SPACING.lg,
    borderRadius: 20,
    maxHeight: height * 0.8,
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
  videoPlaceholder: {
    height: 200,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  videoText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  comingSoonText: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  exerciseGuide: {
    backgroundColor: `${COLORS.primary}10`,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  guideTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  focusAreasSection: {
    marginBottom: SPACING.md,
  },
  focusTitle: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  focusArea: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  mistakesSection: {
    marginBottom: SPACING.md,
  },
  mistakesTitle: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  mistake: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: SPACING.sm,
    marginBottom: SPACING.xs,
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

export default MotionCorrection;