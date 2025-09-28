import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  Vibration,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Dimensions,
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
  Searchbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const DrillPractice = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, drills, currentSession } = useSelector(state => state.training);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drillProgress, setDrillProgress] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [personalBest, setPersonalBest] = useState(null);
  const [streakCount, setStreakCount] = useState(7);
  const [totalPoints, setTotalPoints] = useState(1250);

  // Sample drill data
  const [practiceSession] = useState({
    id: 'drill_001',
    title: 'Core Strength Circuit',
    description: 'Build fundamental core stability and strength',
    duration: 45,
    difficulty: 'intermediate',
    points: 150,
    drills: [
      {
        id: 'drill_1',
        name: 'Plank Hold',
        description: 'Hold a plank position to strengthen core muscles',
        duration: 60,
        sets: 3,
        restTime: 30,
        instructions: [
          'Start in push-up position',
          'Keep body in straight line',
          'Hold for specified time',
          'Breathe steadily'
        ],
        videoUrl: 'https://example.com/plank-demo.mp4',
        tips: 'Keep your core tight and avoid sagging hips',
        difficulty: 'beginner',
        calories: 15,
        targetMuscles: ['Core', 'Shoulders', 'Glutes']
      },
      {
        id: 'drill_2',
        name: 'Mountain Climbers',
        description: 'Dynamic core exercise with cardio benefits',
        duration: 45,
        sets: 3,
        restTime: 45,
        instructions: [
          'Start in plank position',
          'Alternate bringing knees to chest',
          'Maintain steady rhythm',
          'Keep hips level'
        ],
        videoUrl: 'https://example.com/mountain-climbers.mp4',
        tips: 'Focus on controlled movement rather than speed',
        difficulty: 'intermediate',
        calories: 25,
        targetMuscles: ['Core', 'Cardio', 'Legs']
      },
      {
        id: 'drill_3',
        name: 'Dead Bug',
        description: 'Controlled core stability exercise',
        duration: 40,
        sets: 3,
        restTime: 30,
        instructions: [
          'Lie on back with arms up',
          'Bring knees to 90 degrees',
          'Extend opposite arm and leg',
          'Return to starting position'
        ],
        videoUrl: 'https://example.com/dead-bug.mp4',
        tips: 'Keep lower back pressed to the floor',
        difficulty: 'beginner',
        calories: 12,
        targetMuscles: ['Core', 'Hip Flexors']
      }
    ]
  });

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
      })
    ]).start();
  }, []);

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setTimerActive(false);
            Vibration.vibrate([100, 50, 100]);
            handleSetComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Progress animation
  useEffect(() => {
    const currentDrill = practiceSession.drills[currentDrillIndex];
    const progress = completedSets / (currentDrill?.sets || 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [completedSets, currentDrillIndex]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Practice session updated! 🔄');
    }, 1500);
  }, []);

  const startDrill = useCallback((drill) => {
    setSelectedDrill(drill);
    setTimeRemaining(drill.duration);
    setCompletedSets(0);
    Vibration.vibrate(50);
  }, []);

  const startTimer = useCallback(() => {
    setTimerActive(true);
    setIsPlaying(true);
    Vibration.vibrate(100);
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerActive(false);
    setIsPlaying(false);
  }, []);

  const resetTimer = useCallback(() => {
    const currentDrill = practiceSession.drills[currentDrillIndex];
    setTimerActive(false);
    setIsPlaying(false);
    setTimeRemaining(currentDrill.duration);
    setCompletedSets(0);
  }, [currentDrillIndex]);

  const handleSetComplete = useCallback(() => {
    const currentDrill = practiceSession.drills[currentDrillIndex];
    const newCompletedSets = completedSets + 1;
    setCompletedSets(newCompletedSets);
    
    if (newCompletedSets >= currentDrill.sets) {
      // Drill completed
      Alert.alert(
        '🎉 Drill Complete!',
        `Great job! You've completed all ${currentDrill.sets} sets.`,
        [
          { text: 'Next Drill', onPress: moveToNextDrill },
          { text: 'Rest', onPress: () => setTimeRemaining(60) }
        ]
      );
      
      // Update points
      setTotalPoints(prev => prev + 50);
    } else {
      // Set completed, start rest
      setTimeRemaining(currentDrill.restTime);
      Alert.alert('💪 Set Complete!', `Rest for ${currentDrill.restTime} seconds`);
    }
  }, [completedSets, currentDrillIndex]);

  const moveToNextDrill = useCallback(() => {
    if (currentDrillIndex < practiceSession.drills.length - 1) {
      setCurrentDrillIndex(prev => prev + 1);
      setCompletedSets(0);
      setTimeRemaining(practiceSession.drills[currentDrillIndex + 1].duration);
      setIsPlaying(false);
      setTimerActive(false);
    } else {
      // Session complete
      Alert.alert(
        '🏆 Session Complete!',
        `Amazing work! You've completed the entire ${practiceSession.title} session.`,
        [
          { text: 'View Summary', onPress: () => navigation.navigate('SessionSummary') },
          { text: 'Done', style: 'cancel' }
        ]
      );
      setTotalPoints(prev => prev + practiceSession.points);
      setStreakCount(prev => prev + 1);
    }
  }, [currentDrillIndex, practiceSession]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.primary;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const currentDrill = practiceSession.drills[currentDrillIndex];
  const sessionProgress = ((currentDrillIndex + (completedSets / currentDrill.sets)) / practiceSession.drills.length);

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Icon name="local-fire-department" size={16} color="white" />
              <Text style={styles.statText}>{streakCount} day streak</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="stars" size={16} color="white" />
              <Text style={styles.statText}>{totalPoints} pts</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.headerTitle}>{practiceSession.title}</Text>
        <Text style={styles.headerSubtitle}>
          {practiceSession.description}
        </Text>
        
        <View style={styles.sessionProgress}>
          <Text style={styles.progressLabel}>Session Progress</Text>
          <ProgressBar
            progress={sessionProgress}
            color="white"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            {Math.round(sessionProgress * 100)}% Complete
          </Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderCurrentDrill = () => (
    <Animated.View
      style={[
        styles.currentDrillContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Card style={styles.currentDrillCard}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.drillCardHeader}
        >
          <View style={styles.drillHeaderContent}>
            <Text style={styles.drillTitle}>{currentDrill.name}</Text>
            <Chip
              mode="flat"
              style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(currentDrill.difficulty) }]}
              textStyle={styles.chipText}
            >
              {currentDrill.difficulty}
            </Chip>
          </View>
          <Text style={styles.drillDescription}>{currentDrill.description}</Text>
        </LinearGradient>

        <View style={styles.drillContent}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>
              {timerActive ? 'Time Remaining' : 'Duration'}
            </Text>
            <Text style={styles.timerDisplay}>{formatTime(timeRemaining)}</Text>
            
            <View style={styles.setsContainer}>
              <Text style={styles.setsText}>
                Set {completedSets + 1} of {currentDrill.sets}
              </Text>
              <Animated.View style={styles.progressContainer}>
                <ProgressBar
                  progress={progressAnim}
                  color={COLORS.primary}
                  style={styles.setsProgress}
                />
              </Animated.View>
            </View>
          </View>

          <View style={styles.drillControls}>
            <IconButton
              icon={isPlaying ? "pause" : "play-arrow"}
              mode="contained"
              size={32}
              iconColor="white"
              containerColor={COLORS.primary}
              onPress={isPlaying ? pauseTimer : startTimer}
              style={styles.playButton}
            />
            <IconButton
              icon="refresh"
              mode="outlined"
              size={24}
              iconColor={COLORS.primary}
              onPress={resetTimer}
              style={styles.controlButton}
            />
            <IconButton
              icon="videocam"
              mode="outlined"
              size={24}
              iconColor={COLORS.primary}
              onPress={() => setShowVideoModal(true)}
              style={styles.controlButton}
            />
          </View>

          <View style={styles.drillInfo}>
            <View style={styles.infoRow}>
              <Icon name="whatshot" size={20} color={COLORS.error} />
              <Text style={styles.infoText}>{currentDrill.calories} cal</Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="fitness-center" size={20} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {currentDrill.targetMuscles.join(', ')}
              </Text>
            </View>
          </View>

          <Surface style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Icon name="lightbulb-outline" size={20} color={COLORS.primary} />
              <Text style={styles.tipsTitle}>Pro Tip</Text>
            </View>
            <Text style={styles.tipsText}>{currentDrill.tips}</Text>
          </Surface>
        </View>
      </Card>
    </Animated.View>
  );

  const renderDrillInstructions = () => (
    <Card style={styles.instructionsCard}>
      <View style={styles.instructionsHeader}>
        <Icon name="list" size={24} color={COLORS.primary} />
        <Text style={styles.instructionsTitle}>Instructions</Text>
      </View>
      {currentDrill.instructions.map((instruction, index) => (
        <View key={index} style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.instructionText}>{instruction}</Text>
        </View>
      ))}
    </Card>
  );

  const renderVideoModal = () => (
    <Portal>
      <Modal
        visible={showVideoModal}
        onDismiss={() => setShowVideoModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView intensity={100} style={styles.modalBlur}>
          <Card style={styles.videoCard}>
            <View style={styles.videoHeader}>
              <Text style={styles.videoTitle}>Video Demonstration</Text>
              <IconButton
                icon="close"
                onPress={() => setShowVideoModal(false)}
              />
            </View>
            
            <View style={styles.videoPlaceholder}>
              <Icon name="play-circle-outline" size={64} color={COLORS.primary} />
              <Text style={styles.videoPlaceholderText}>
                Video demonstration for {currentDrill.name}
              </Text>
              <Button
                mode="contained"
                onPress={() => {
                  Alert.alert('Feature Coming Soon', 'Video playback will be available in the next update! 🎬');
                }}
                style={styles.videoButton}
              >
                Play Video
              </Button>
            </View>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderHeader()}
        
        <View style={styles.content}>
          {renderCurrentDrill()}
          {renderDrillInstructions()}
          
          <View style={styles.quickActions}>
            <Button
              mode="outlined"
              icon="skip-next"
              onPress={moveToNextDrill}
              style={styles.actionButton}
              disabled={currentDrillIndex >= practiceSession.drills.length - 1}
            >
              Next Drill
            </Button>
            <Button
              mode="contained"
              icon="check"
              onPress={handleSetComplete}
              style={styles.actionButton}
            >
              Complete Set
            </Button>
          </View>
        </View>
      </ScrollView>

      {renderVideoModal()}

      <FAB
        icon="pause"
        style={[styles.fab, { backgroundColor: isPlaying ? COLORS.error : COLORS.primary }]}
        onPress={isPlaying ? pauseTimer : startTimer}
        label={isPlaying ? "Pause" : "Start"}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.lg,
  },
  sessionProgress: {
    marginTop: SPACING.md,
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  currentDrillContainer: {
    marginBottom: SPACING.lg,
  },
  currentDrillCard: {
    elevation: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  drillCardHeader: {
    padding: SPACING.lg,
  },
  drillHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  drillTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  difficultyChip: {
    marginLeft: SPACING.sm,
  },
  chipText: {
    color: 'white',
    fontWeight: '600',
  },
  drillDescription: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  drillContent: {
    padding: SPACING.lg,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timerLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  timerDisplay: {
    ...TEXT_STYLES.h1,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 48,
  },
  setsContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    width: '100%',
  },
  setsText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    width: '100%',
  },
  setsProgress: {
    height: 6,
    borderRadius: 3,
  },
  drillControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  playButton: {
    elevation: 4,
  },
  controlButton: {
    borderColor: COLORS.primary,
  },
  drillInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  infoText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  tipsContainer: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  tipsTitle: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tipsText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  instructionsCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 12,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  instructionsTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  instructionNumberText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  instructionText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  videoCard: {
    width: width - SPACING.xl * 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  videoTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  videoPlaceholder: {
    padding: SPACING.xl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    marginVertical: SPACING.lg,
    color: COLORS.textSecondary,
  },
  videoButton: {
    marginTop: SPACING.md,
  },
});

export default DrillPractice;