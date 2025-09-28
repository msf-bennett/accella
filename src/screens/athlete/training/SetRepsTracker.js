import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  Dimensions,
  Vibration,
  TouchableOpacity,
  RefreshControl,
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
  TextInput,
  FAB,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import your design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../styles/designSystem';

const { width, height } = Dimensions.get('window');

const SetRepsTracker = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, currentWorkout, exerciseHistory } = useSelector(state => ({
    user: state.auth.user,
    currentWorkout: state.training.currentWorkout,
    exerciseHistory: state.training.exerciseHistory || {},
  }));

  // Route params
  const { 
    exercise = 'Bench Press',
    targetSets = 3,
    targetReps = 10,
    suggestedWeight = 135,
    workoutId = null,
    exerciseId = null,
    exerciseIndex = 0,
    totalExercises = 1,
  } = route.params || {};

  // State management
  const [sets, setSets] = useState([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(suggestedWeight);
  const [reps, setReps] = useState(targetReps);
  const [notes, setNotes] = useState('');
  const [isRestTimer, setIsRestTimer] = useState(false);
  const [restTime, setRestTime] = useState(90);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showRepsModal, setShowRepsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [personalBest, setPersonalBest] = useState(null);
  const [lastWorkoutData, setLastWorkoutData] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Quick adjustment values
  const weightIncrements = [-45, -25, -10, -5, -2.5, 2.5, 5, 10, 25, 45];
  const repIncrements = [-5, -2, -1, 1, 2, 5];

  useEffect(() => {
    // Entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Load exercise history and personal bests
    loadExerciseData();
    initializeSets();
  }, []);

  useEffect(() => {
    // Update progress animation
    const completedSets = sets.filter(set => set.completed).length;
    const progress = targetSets > 0 ? completedSets / targetSets : 0;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [sets, targetSets]);

  const loadExerciseData = useCallback(async () => {
    try {
      // Load personal best and last workout data
      const history = exerciseHistory[exercise] || {};
      setPersonalBest(history.personalBest || null);
      setLastWorkoutData(history.lastWorkout || null);
    } catch (error) {
      console.error('Error loading exercise data:', error);
    }
  }, [exercise, exerciseHistory]);

  const initializeSets = () => {
    const initialSets = Array.from({ length: targetSets }, (_, index) => ({
      id: index + 1,
      weight: suggestedWeight,
      reps: 0,
      targetReps: targetReps,
      completed: false,
      timestamp: null,
      difficulty: null, // 'easy', 'perfect', 'hard'
    }));
    setSets(initialSets);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExerciseData();
    setRefreshing(false);
  }, [loadExerciseData]);

  const bounceAnimation = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeSet = () => {
    if (reps === 0) {
      Alert.alert('No Reps Recorded', 'Please enter the number of reps completed.');
      return;
    }

    const setToUpdate = sets[currentSet - 1];
    if (setToUpdate && !setToUpdate.completed) {
      const updatedSets = [...sets];
      const difficulty = getDifficulty(reps, targetReps);
      
      updatedSets[currentSet - 1] = {
        ...setToUpdate,
        weight: weight,
        reps: reps,
        completed: true,
        timestamp: new Date().toISOString(),
        difficulty: difficulty,
      };

      setSets(updatedSets);
      
      // Animations and feedback
      bounceAnimation();
      Vibration.vibrate(100);

      // Check for personal best
      const totalVolume = weight * reps;
      if (!personalBest || totalVolume > personalBest.volume) {
        showPersonalBestAlert(totalVolume);
      }

      // Update Redux store
      dispatch({
        type: 'training/updateExerciseSet',
        payload: {
          workoutId,
          exerciseId,
          setData: updatedSets[currentSet - 1],
        },
      });

      // Move to next set or complete exercise
      if (currentSet < targetSets) {
        setCurrentSet(currentSet + 1);
        setReps(targetReps); // Reset to target for next set
        
        // Show rest timer option
        showRestOption();
      } else {
        completeExercise();
      }
    }
  };

  const getDifficulty = (actualReps, targetReps) => {
    const percentage = actualReps / targetReps;
    if (percentage >= 1.2) return 'easy';
    if (percentage >= 0.8 && percentage <= 1.1) return 'perfect';
    return 'hard';
  };

  const showPersonalBestAlert = (volume) => {
    Alert.alert(
      '🏆 New Personal Best!',
      `Congratulations! You just hit a new PR with ${weight}lbs x ${reps} reps!`,
      [{ text: 'Awesome!', style: 'default' }]
    );
    
    setPersonalBest({
      weight: weight,
      reps: reps,
      volume: volume,
      date: new Date().toISOString(),
    });
  };

  const showRestOption = () => {
    Alert.alert(
      'Set Complete! 💪',
      `Great job! Ready for set ${currentSet + 1}?`,
      [
        {
          text: 'Start Rest Timer',
          onPress: () => navigation.navigate('RestTimer', {
            defaultTime: restTime,
            exercise: exercise,
            nextExercise: currentSet < targetSets ? `Set ${currentSet + 1}` : 'Next Exercise',
            set: currentSet + 1,
            totalSets: targetSets,
            workoutId: workoutId,
          }),
        },
        {
          text: 'Continue',
          style: 'cancel',
        },
      ]
    );
  };

  const completeExercise = () => {
    const completedSets = sets.filter(set => set.completed).length;
    const totalReps = sets.reduce((sum, set) => sum + (set.completed ? set.reps : 0), 0);
    const avgWeight = sets.reduce((sum, set) => sum + (set.completed ? set.weight : 0), 0) / completedSets;

    Alert.alert(
      '✅ Exercise Complete!',
      `${exercise} completed!\n${completedSets}/${targetSets} sets • ${totalReps} total reps`,
      [
        {
          text: 'Next Exercise',
          onPress: () => {
            // Update workout progress
            dispatch({
              type: 'training/completeExercise',
              payload: {
                workoutId,
                exerciseId,
                sets: sets.filter(set => set.completed),
                totalReps,
                avgWeight,
                exercise,
              },
            });
            navigation.goBack();
          },
        },
      ]
    );
  };

  const editSet = (setIndex) => {
    const setData = sets[setIndex];
    setWeight(setData.weight);
    setReps(setData.reps);
    setCurrentSet(setIndex + 1);
    
    // Mark set as incomplete for re-completion
    const updatedSets = [...sets];
    updatedSets[setIndex] = { ...setData, completed: false };
    setSets(updatedSets);
  };

  const adjustWeight = (increment) => {
    const newWeight = Math.max(0, weight + increment);
    setWeight(newWeight);
    Vibration.vibrate(50);
  };

  const adjustReps = (increment) => {
    const newReps = Math.max(0, reps + increment);
    setReps(newReps);
    Vibration.vibrate(50);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return COLORS.success;
      case 'perfect': return COLORS.primary;
      case 'hard': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'trending-up';
      case 'perfect': return 'check-circle';
      case 'hard': return 'fitness-center';
      default: return 'radio-button-unchecked';
    }
  };

  const renderSetCard = (set, index) => {
    const isCurrentSet = index + 1 === currentSet;
    const isCompleted = set.completed;

    return (
      <TouchableOpacity
        key={set.id}
        onPress={() => !isCompleted && setCurrentSet(index + 1)}
        onLongPress={() => isCompleted && editSet(index)}
        disabled={isCompleted && currentSet <= targetSets}
      >
        <Card
          style={[
            styles.setCard,
            isCurrentSet && styles.currentSetCard,
            isCompleted && styles.completedSetCard,
          ]}
          elevation={isCurrentSet ? 8 : 2}
        >
          <Card.Content style={styles.setCardContent}>
            <View style={styles.setHeader}>
              <View style={styles.setNumber}>
                <Text style={[
                  styles.setNumberText,
                  isCurrentSet && styles.currentSetText,
                  isCompleted && styles.completedSetText,
                ]}>
                  {index + 1}
                </Text>
              </View>
              
              <View style={styles.setInfo}>
                <View style={styles.setStats}>
                  <Text style={styles.setStatValue}>
                    {isCompleted ? set.weight : weight}lbs
                  </Text>
                  <Text style={styles.setStatLabel}>Weight</Text>
                </View>
                
                <View style={styles.setStatsDivider} />
                
                <View style={styles.setStats}>
                  <Text style={styles.setStatValue}>
                    {isCompleted ? set.reps : reps}/{set.targetReps}
                  </Text>
                  <Text style={styles.setStatLabel}>Reps</Text>
                </View>
              </View>

              <View style={styles.setStatus}>
                {isCompleted ? (
                  <Icon 
                    name={getDifficultyIcon(set.difficulty)}
                    size={24} 
                    color={getDifficultyColor(set.difficulty)} 
                  />
                ) : isCurrentSet ? (
                  <Icon name="play-circle-outline" size={24} color={COLORS.primary} />
                ) : (
                  <Icon name="radio-button-unchecked" size={24} color={COLORS.textSecondary} />
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderWeightAdjuster = () => (
    <Surface style={styles.adjusterContainer} elevation={4}>
      <View style={styles.adjusterHeader}>
        <Icon name="fitness-center" size={24} color={COLORS.primary} />
        <Text style={styles.adjusterTitle}>Weight (lbs)</Text>
      </View>
      
      <View style={styles.adjusterContent}>
        <TouchableOpacity
          style={styles.adjusterInput}
          onPress={() => setShowWeightModal(true)}
        >
          <Text style={styles.adjusterValue}>{weight}</Text>
        </TouchableOpacity>
        
        <View style={styles.quickAdjusters}>
          {weightIncrements.map((increment) => (
            <TouchableOpacity
              key={increment}
              style={[
                styles.quickAdjusterButton,
                increment > 0 ? styles.positiveAdjuster : styles.negativeAdjuster
              ]}
              onPress={() => adjustWeight(increment)}
            >
              <Text style={[
                styles.quickAdjusterText,
                increment > 0 ? styles.positiveAdjusterText : styles.negativeAdjusterText
              ]}>
                {increment > 0 ? '+' : ''}{increment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Surface>
  );

  const renderRepsAdjuster = () => (
    <Surface style={styles.adjusterContainer} elevation={4}>
      <View style={styles.adjusterHeader}>
        <Icon name="repeat" size={24} color={COLORS.secondary} />
        <Text style={styles.adjusterTitle}>Reps</Text>
      </View>
      
      <View style={styles.adjusterContent}>
        <TouchableOpacity
          style={styles.adjusterInput}
          onPress={() => setShowRepsModal(true)}
        >
          <Text style={styles.adjusterValue}>{reps}</Text>
          <Text style={styles.adjusterTarget}>/{targetReps}</Text>
        </TouchableOpacity>
        
        <View style={styles.quickAdjusters}>
          {repIncrements.map((increment) => (
            <TouchableOpacity
              key={increment}
              style={[
                styles.quickAdjusterButton,
                increment > 0 ? styles.positiveAdjuster : styles.negativeAdjuster
              ]}
              onPress={() => adjustReps(increment)}
            >
              <Text style={[
                styles.quickAdjusterText,
                increment > 0 ? styles.positiveAdjusterText : styles.negativeAdjusterText
              ]}>
                {increment > 0 ? '+' : ''}{increment}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Surface>
  );

  const renderProgressSection = () => {
    const completedSets = sets.filter(set => set.completed).length;
    const totalVolume = sets.reduce((sum, set) => 
      sum + (set.completed ? set.weight * set.reps : 0), 0
    );

    return (
      <Surface style={styles.progressSection} elevation={4}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primary + '80']}
          style={styles.progressHeader}
        >
          <Text style={styles.progressTitle}>{exercise}</Text>
          <Text style={styles.progressSubtitle}>
            Exercise {exerciseIndex + 1} of {totalExercises}
          </Text>
        </LinearGradient>
        
        <View style={styles.progressContent}>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{completedSets}</Text>
              <Text style={styles.progressStatLabel}>Sets</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{totalVolume}</Text>
              <Text style={styles.progressStatLabel}>Volume</Text>
            </View>
            {personalBest && (
              <View style={styles.progressStat}>
                <Text style={styles.progressStatValue}>
                  {personalBest.weight}x{personalBest.reps}
                </Text>
                <Text style={styles.progressStatLabel}>PR</Text>
              </View>
            )}
          </View>
          
          <ProgressBar
            progress={completedSets / targetSets}
            color={COLORS.success}
            style={styles.progressBar}
          />
          
          <Text style={styles.progressText}>
            {Math.round((completedSets / targetSets) * 100)}% Complete
          </Text>
        </View>
      </Surface>
    );
  };

  const renderInputModal = (visible, onDismiss, title, value, onChangeText, keyboardType = 'numeric') => (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
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
            <Text style={styles.modalTitle}>{title}</Text>
            <TextInput
              mode="outlined"
              value={value.toString()}
              onChangeText={onChangeText}
              keyboardType={keyboardType}
              autoFocus
              style={styles.modalInput}
            />
            <View style={styles.modalButtons}>
              <Button mode="outlined" onPress={onDismiss} style={styles.modalButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={onDismiss} style={styles.modalButton}>
                Done
              </Button>
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
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
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={28}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Set Tracker</Text>
            <Text style={styles.headerSubtitle}>
              Set {currentSet} of {targetSets}
            </Text>
          </View>
          <IconButton
            icon="notes"
            iconColor="white"
            size={28}
            onPress={() => setShowNotesModal(true)}
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary, COLORS.secondary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderProgressSection()}
        
        <View style={styles.setsContainer}>
          <Text style={styles.sectionTitle}>Sets Progress 💪</Text>
          {sets.map((set, index) => renderSetCard(set, index))}
        </View>

        <View style={styles.adjustersContainer}>
          {renderWeightAdjuster()}
          {renderRepsAdjuster()}
        </View>
      </ScrollView>

      <Animated.View 
        style={[
          styles.completeButton,
          { transform: [{ scale: bounceAnim }] }
        ]}
      >
        <Button
          mode="contained"
          onPress={completeSet}
          style={styles.completeButtonStyle}
          contentStyle={styles.completeButtonContent}
          labelStyle={styles.completeButtonLabel}
          icon="check-circle"
          disabled={sets[currentSet - 1]?.completed || currentSet > targetSets}
        >
          Complete Set {currentSet}
        </Button>
      </Animated.View>

      {renderInputModal(
        showWeightModal,
        () => setShowWeightModal(false),
        'Enter Weight (lbs)',
        weight,
        (text) => setWeight(parseFloat(text) || 0)
      )}

      {renderInputModal(
        showRepsModal,
        () => setShowRepsModal(false),
        'Enter Reps',
        reps,
        (text) => setReps(parseInt(text) || 0)
      )}

      {renderInputModal(
        showNotesModal,
        () => setShowNotesModal(false),
        'Exercise Notes',
        notes,
        setNotes,
        'default'
      )}
    </Animated.View>
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
    paddingHorizontal: SPACING.sm,
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
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  progressSection: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  progressTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  progressSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  progressContent: {
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  progressStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  progressText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  setsContainer: {
    marginBottom: SPACING.lg,
  },
  setCard: {
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  currentSetCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  completedSetCard: {
    backgroundColor: COLORS.success + '10',
  },
  setCardContent: {
    padding: SPACING.md,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  setNumberText: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  currentSetText: {
    color: COLORS.primary,
  },
  completedSetText: {
    color: COLORS.success,
  },
  setInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setStats: {
    alignItems: 'center',
  },
  setStatValue: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  setStatLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  setStatsDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.textSecondary + '30',
    marginHorizontal: SPACING.lg,
  },
  setStatus: {
    marginLeft: SPACING.md,
  },
  adjustersContainer: {
    gap: SPACING.md,
  },
  adjusterContainer: {
    borderRadius: 16,
    padding: SPACING.md,
    backgroundColor: 'white',
  },
  adjusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  adjusterTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  adjusterContent: {
    alignItems: 'center',
  },
  adjusterInput: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  adjusterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  adjusterTarget: {
    ...TEXT_STYLES.h2,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  quickAdjusters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  quickAdjusterButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    minWidth: 50,
    alignItems: 'center',
  },
  positiveAdjuster: {
    backgroundColor: COLORS.success + '20',
  },
  negativeAdjuster: {
    backgroundColor: COLORS.error + '20',
  },
  quickAdjusterText: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
  },
  positiveAdjusterText: {
    color: COLORS.success,
  },
  negativeAdjusterText: {
    color: COLORS.error,
  },
  completeButton: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
  },
  completeButtonStyle: {
    borderRadius: 25,
    elevation: 8,
  },
  completeButtonContent: {
    paddingVertical: SPACING.sm,
  },
  completeButtonLabel: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
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
  modalInput: {
    marginBottom: SPACING.lg,
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

export default SetRepsTracker;