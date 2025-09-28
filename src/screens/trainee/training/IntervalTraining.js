import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
  RefreshControl,
  Platform,
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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const IntervalTraining = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, trainingData } = useSelector(state => state.user);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('work'); // 'work', 'rest', 'prepare'
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Training configuration
  const [config, setConfig] = useState({
    workTime: 30,
    restTime: 15,
    rounds: 8,
    sets: 3,
    restBetweenSets: 120,
    preparationTime: 10
  });
  
  // Session data
  const [sessionData, setSessionData] = useState({
    caloriesBurned: 0,
    totalExerciseTime: 0,
    completedRounds: 0,
    averageHeartRate: 0,
    maxHeartRate: 0,
    points: 0
  });

  const intervalRef = useRef(null);
  const phaseStartTime = useRef(Date.now());

  // Sample interval workouts
  const intervalWorkouts = [
    {
      id: 1,
      name: 'HIIT Cardio Blast',
      difficulty: 'High',
      duration: '20 min',
      exercises: ['Jumping Jacks', 'Burpees', 'Mountain Climbers', 'High Knees'],
      caloriesPerHour: 450,
      icon: '🔥',
      color: COLORS.error
    },
    {
      id: 2,
      name: 'Strength Intervals',
      difficulty: 'Medium',
      duration: '25 min',
      exercises: ['Push-ups', 'Squats', 'Lunges', 'Plank'],
      caloriesPerHour: 350,
      icon: '💪',
      color: COLORS.primary
    },
    {
      id: 3,
      name: 'Tabata Express',
      difficulty: 'High',
      duration: '12 min',
      exercises: ['Sprint', 'Rest', 'Sprint', 'Rest'],
      caloriesPerHour: 500,
      icon: '⚡',
      color: '#ff6b6b'
    },
    {
      id: 4,
      name: 'Recovery Flow',
      difficulty: 'Low',
      duration: '15 min',
      exercises: ['Light Stretching', 'Breathing', 'Meditation', 'Mobility'],
      caloriesPerHour: 150,
      icon: '🧘',
      color: COLORS.success
    }
  ];

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handlePhaseComplete();
            return getNextPhaseTime();
          }
          return prev - 1;
        });
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, isPaused]);

  // Timer animation
  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(timerAnim, {
            toValue: 0.95,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(timerAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isActive, currentPhase]);

  const getNextPhaseTime = () => {
    switch (currentPhase) {
      case 'prepare':
        return config.workTime;
      case 'work':
        return config.restTime;
      case 'rest':
        return config.workTime;
      default:
        return config.workTime;
    }
  };

  const handlePhaseComplete = () => {
    Vibration.vibrate([0, 200, 100, 200]);
    
    if (currentPhase === 'prepare') {
      setCurrentPhase('work');
    } else if (currentPhase === 'work') {
      setCurrentPhase('rest');
      setSessionData(prev => ({
        ...prev,
        totalExerciseTime: prev.totalExerciseTime + config.workTime
      }));
    } else if (currentPhase === 'rest') {
      if (currentRound < config.rounds) {
        setCurrentRound(prev => prev + 1);
        setCurrentPhase('work');
      } else if (currentSet < config.sets) {
        setCurrentSet(prev => prev + 1);
        setCurrentRound(1);
        setCurrentPhase('prepare');
        setTimeRemaining(config.restBetweenSets);
        return config.restBetweenSets;
      } else {
        handleWorkoutComplete();
        return 0;
      }
    }
  };

  const handleWorkoutComplete = () => {
    setIsActive(false);
    setShowResults(true);
    
    const finalData = {
      ...sessionData,
      completedRounds: (currentSet - 1) * config.rounds + currentRound,
      caloriesBurned: Math.round((totalTime / 3600) * 400), // Estimate
      points: calculatePoints()
    };
    
    setSessionData(finalData);
    
    // Dispatch to Redux
    dispatch({
      type: 'ADD_TRAINING_SESSION',
      payload: {
        type: 'interval',
        date: new Date().toISOString(),
        data: finalData
      }
    });
  };

  const calculatePoints = () => {
    const basePoints = config.rounds * config.sets * 10;
    const timeBonus = Math.max(0, (config.workTime * config.rounds * config.sets) - totalTime) * 2;
    const difficultyMultiplier = currentPhase === 'work' ? 1.5 : 1;
    return Math.round((basePoints + timeBonus) * difficultyMultiplier);
  };

  const startWorkout = () => {
    setCurrentPhase('prepare');
    setTimeRemaining(config.preparationTime);
    setIsActive(true);
    setIsPaused(false);
    setTotalTime(0);
    phaseStartTime.current = Date.now();
  };

  const pauseWorkout = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      Vibration.vibrate(100);
    }
  };

  const stopWorkout = () => {
    Alert.alert(
      'Stop Workout?',
      'Are you sure you want to end this interval session?',
      [
        { text: 'Continue', style: 'cancel' },
        { 
          text: 'Stop', 
          style: 'destructive',
          onPress: () => {
            setIsActive(false);
            setIsPaused(false);
            setCurrentPhase('work');
            setCurrentSet(1);
            setCurrentRound(1);
            setTimeRemaining(config.workTime);
            setTotalTime(0);
          }
        }
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Training data refreshed! 🎉');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'work':
        return COLORS.error;
      case 'rest':
        return COLORS.success;
      case 'prepare':
        return COLORS.primary;
      default:
        return COLORS.primary;
    }
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'work':
        return 'fitness-center';
      case 'rest':
        return 'pause-circle-outline';
      case 'prepare':
        return 'timer';
      default:
        return 'play-circle-outline';
    }
  };

  const renderTimer = () => (
    <Surface style={styles.timerContainer}>
      <LinearGradient
        colors={[getPhaseColor(), `${getPhaseColor()}80`]}
        style={styles.timerGradient}
      >
        <Animated.View
          style={[
            styles.timerContent,
            {
              transform: [{ scale: timerAnim }],
              opacity: fadeAnim
            }
          ]}
        >
          <Icon 
            name={getPhaseIcon()} 
            size={40} 
            color="white" 
            style={styles.timerIcon}
          />
          <Text style={[TEXT_STYLES.h1, styles.timerText]}>
            {formatTime(timeRemaining)}
          </Text>
          <Text style={[TEXT_STYLES.body, styles.phaseText]}>
            {currentPhase.toUpperCase()}
          </Text>
          <View style={styles.roundInfo}>
            <Text style={[TEXT_STYLES.caption, styles.roundText]}>
              Round {currentRound}/{config.rounds}
            </Text>
            <Text style={[TEXT_STYLES.caption, styles.roundText]}>
              Set {currentSet}/{config.sets}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </Surface>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      {!isActive ? (
        <Button
          mode="contained"
          onPress={startWorkout}
          style={[styles.controlButton, { backgroundColor: COLORS.success }]}
          labelStyle={TEXT_STYLES.button}
          icon="play-arrow"
        >
          Start Workout
        </Button>
      ) : (
        <View style={styles.activeControls}>
          <IconButton
            icon={isPaused ? "play-arrow" : "pause"}
            size={30}
            iconColor="white"
            style={[styles.roundButton, { backgroundColor: COLORS.primary }]}
            onPress={pauseWorkout}
          />
          <IconButton
            icon="stop"
            size={30}
            iconColor="white"
            style={[styles.roundButton, { backgroundColor: COLORS.error }]}
            onPress={stopWorkout}
          />
        </View>
      )}
    </View>
  );

  const renderWorkoutList = () => (
    <View style={styles.workoutSection}>
      <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
        Interval Workouts 🔥
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.workoutScroll}
      >
        {intervalWorkouts.map((workout) => (
          <Card key={workout.id} style={styles.workoutCard}>
            <LinearGradient
              colors={[workout.color, `${workout.color}CC`]}
              style={styles.workoutGradient}
            >
              <View style={styles.workoutHeader}>
                <Text style={styles.workoutIcon}>{workout.icon}</Text>
                <Chip
                  style={styles.difficultyChip}
                  textStyle={styles.chipText}
                >
                  {workout.difficulty}
                </Chip>
              </View>
              <Text style={[TEXT_STYLES.h4, styles.workoutTitle]}>
                {workout.name}
              </Text>
              <Text style={[TEXT_STYLES.body, styles.workoutDuration]}>
                {workout.duration} • {workout.caloriesPerHour} cal/hr
              </Text>
              <Text style={[TEXT_STYLES.caption, styles.exerciseList]}>
                {workout.exercises.join(' • ')}
              </Text>
              <Button
                mode="contained"
                onPress={() => Alert.alert('Coming Soon', 'Custom workouts feature in development! 🚀')}
                style={styles.selectButton}
                labelStyle={styles.selectButtonText}
              >
                Select
              </Button>
            </LinearGradient>
          </Card>
        ))}
      </ScrollView>
    </View>
  );

  const renderStats = () => (
    <Card style={styles.statsCard}>
      <Text style={[TEXT_STYLES.h4, styles.statsTitle]}>
        Today's Progress 📊
      </Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Icon name="local-fire-department" size={24} color={COLORS.error} />
          <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Calories</Text>
          <Text style={[TEXT_STYLES.h4, styles.statValue]}>
            {sessionData.caloriesBurned || 0}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="timer" size={24} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Time</Text>
          <Text style={[TEXT_STYLES.h4, styles.statValue]}>
            {formatTime(totalTime)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="fitness-center" size={24} color={COLORS.success} />
          <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Rounds</Text>
          <Text style={[TEXT_STYLES.h4, styles.statValue]}>
            {currentRound + (currentSet - 1) * config.rounds}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="stars" size={24} color="#FFD700" />
          <Text style={[TEXT_STYLES.caption, styles.statLabel]}>Points</Text>
          <Text style={[TEXT_STYLES.h4, styles.statValue]}>
            {calculatePoints()}
          </Text>
        </View>
      </View>
    </Card>
  );

  const renderSettingsModal = () => (
    <Portal>
      <Modal
        visible={showSettings}
        onDismiss={() => setShowSettings(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.settingsCard}>
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
            Interval Settings ⚙️
          </Text>
          <View style={styles.settingRow}>
            <Text style={[TEXT_STYLES.body, styles.settingLabel]}>Work Time</Text>
            <View style={styles.settingControls}>
              <IconButton
                icon="remove"
                size={20}
                onPress={() => setConfig(prev => ({
                  ...prev,
                  workTime: Math.max(10, prev.workTime - 5)
                }))}
              />
              <Text style={[TEXT_STYLES.h4, styles.settingValue]}>
                {config.workTime}s
              </Text>
              <IconButton
                icon="add"
                size={20}
                onPress={() => setConfig(prev => ({
                  ...prev,
                  workTime: Math.min(120, prev.workTime + 5)
                }))}
              />
            </View>
          </View>
          <View style={styles.settingRow}>
            <Text style={[TEXT_STYLES.body, styles.settingLabel]}>Rest Time</Text>
            <View style={styles.settingControls}>
              <IconButton
                icon="remove"
                size={20}
                onPress={() => setConfig(prev => ({
                  ...prev,
                  restTime: Math.max(5, prev.restTime - 5)
                }))}
              />
              <Text style={[TEXT_STYLES.h4, styles.settingValue]}>
                {config.restTime}s
              </Text>
              <IconButton
                icon="add"
                size={20}
                onPress={() => setConfig(prev => ({
                  ...prev,
                  restTime: Math.min(60, prev.restTime + 5)
                }))}
              />
            </View>
          </View>
          <View style={styles.settingRow}>
            <Text style={[TEXT_STYLES.body, styles.settingLabel]}>Rounds</Text>
            <View style={styles.settingControls}>
              <IconButton
                icon="remove"
                size={20}
                onPress={() => setConfig(prev => ({
                  ...prev,
                  rounds: Math.max(3, prev.rounds - 1)
                }))}
              />
              <Text style={[TEXT_STYLES.h4, styles.settingValue]}>
                {config.rounds}
              </Text>
              <IconButton
                icon="add"
                size={20}
                onPress={() => setConfig(prev => ({
                  ...prev,
                  rounds: Math.min(20, prev.rounds + 1)
                }))}
              />
            </View>
          </View>
          <Button
            mode="contained"
            onPress={() => setShowSettings(false)}
            style={styles.closeButton}
          >
            Save Settings
          </Button>
        </Card>
      </Modal>
    </Portal>
  );

  const renderResultsModal = () => (
    <Portal>
      <Modal
        visible={showResults}
        onDismiss={() => setShowResults(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.resultsCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.resultsHeader}
          >
            <Text style={[TEXT_STYLES.h2, styles.resultsTitle]}>
              Workout Complete! 🎉
            </Text>
            <Text style={[TEXT_STYLES.h1, styles.pointsEarned]}>
              +{sessionData.points} Points
            </Text>
          </LinearGradient>
          <View style={styles.resultsContent}>
            <View style={styles.resultRow}>
              <Icon name="timer" size={24} color={COLORS.primary} />
              <Text style={[TEXT_STYLES.body, styles.resultLabel]}>Total Time</Text>
              <Text style={[TEXT_STYLES.h4, styles.resultValue]}>
                {formatTime(totalTime)}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Icon name="local-fire-department" size={24} color={COLORS.error} />
              <Text style={[TEXT_STYLES.body, styles.resultLabel]}>Calories Burned</Text>
              <Text style={[TEXT_STYLES.h4, styles.resultValue]}>
                {sessionData.caloriesBurned}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Icon name="fitness-center" size={24} color={COLORS.success} />
              <Text style={[TEXT_STYLES.body, styles.resultLabel]}>Completed Rounds</Text>
              <Text style={[TEXT_STYLES.h4, styles.resultValue]}>
                {sessionData.completedRounds}
              </Text>
            </View>
          </View>
          <View style={styles.resultButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowResults(false)}
              style={styles.resultButton}
            >
              Continue Training
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                setShowResults(false);
                Alert.alert('Success', 'Workout shared! 📱');
              }}
              style={styles.resultButton}
            >
              Share Results
            </Button>
          </View>
        </Card>
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
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
            Interval Training
          </Text>
          <TouchableOpacity 
            onPress={() => setShowSettings(true)}
            style={styles.settingsButton}
          >
            <Icon name="settings" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {renderTimer()}
          {renderControls()}
          {renderStats()}
          {renderWorkoutList()}
        </Animated.View>
      </ScrollView>

      {renderSettingsModal()}
      {renderResultsModal()}

      <FAB
        icon="play-arrow"
        style={[styles.fab, { backgroundColor: isActive ? COLORS.error : COLORS.success }]}
        onPress={isActive ? pauseWorkout : startWorkout}
        label={isActive ? (isPaused ? "Resume" : "Pause") : "Start"}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mainContent: {
    padding: SPACING.md,
  },
  timerContainer: {
    marginBottom: SPACING.lg,
    borderRadius: 20,
    elevation: 8,
    overflow: 'hidden',
  },
  timerGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  timerContent: {
    alignItems: 'center',
  },
  timerIcon: {
    marginBottom: SPACING.sm,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: SPACING.xs,
  },
  phaseText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  roundInfo: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  roundText: {
    color: 'white',
    fontSize: 14,
  },
  controlsContainer: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  controlButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xl,
    borderRadius: 25,
  },
  activeControls: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  roundButton: {
    borderRadius: 25,
  },
  statsCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 15,
    elevation: 4,
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statLabel: {
    color: COLORS.textSecondary,
  },
  statValue: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  workoutSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.xs,
  },
  workoutScroll: {
    paddingHorizontal: SPACING.xs,
  },
  workoutCard: {
    width: width * 0.7,
    marginRight: SPACING.md,
    borderRadius: 15,
    elevation: 6,
    overflow: 'hidden',
  },
  workoutGradient: {
    padding: SPACING.md,
    height: 200,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  workoutIcon: {
    fontSize: 24,
  },
  difficultyChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipText: {
    color: 'white',
    fontSize: 12,
  },
  workoutTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  workoutDuration: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  exerciseList: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
    flex: 1,
  },
  selectButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  selectButtonText: {
    color: 'white',
  },
  modalContainer: {
    padding: SPACING.md,
    justifyContent: 'center',
  },
  settingsCard: {
    padding: SPACING.lg,
    borderRadius: 20,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  settingLabel: {
    color: COLORS.text,
    flex: 1,
  },
  settingControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    minWidth: 50,
    textAlign: 'center',
    color: COLORS.text,
  },
  closeButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  resultsCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
  },
  resultsHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  resultsTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  pointsEarned: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 36,
  },
  resultsContent: {
    padding: SPACING.lg,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  resultLabel: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  resultValue: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  resultButtons: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  resultButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
});

export default IntervalTraining;