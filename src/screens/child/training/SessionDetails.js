import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Vibration,
  Alert,
  StatusBar,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  IconButton,
  ProgressBar,
  Avatar,
  Chip,
  FAB,
  Surface,
  Portal,
  Modal,
  Searchbar,
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
  light: '#ecf0f1',
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
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const SessionDetails = ({ route, navigation }) => {
  const { sessionId, sessionData } = route?.params || {};
  
  // Redux state
  const user = useSelector(state => state.auth.user);
  const currentSession = useSelector(state => state.training.sessions?.[sessionId]) || sessionData;
  const completedExercises = useSelector(state => state.training.completedExercises) || {};
  const sessionProgress = useSelector(state => state.training.sessionProgress) || {};
  const dispatch = useDispatch();

  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [sessionNotes, setSessionNotes] = useState(currentSession?.notes || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Default session data if not provided
  const defaultSession = {
    id: sessionId || 'session_1',
    title: 'Football Training Session',
    date: new Date().toISOString(),
    duration: 90,
    difficulty: 'Intermediate',
    category: 'Football',
    coach: 'Coach Sarah',
    coachAvatar: null,
    description: 'Complete football training focusing on ball control, passing accuracy, and tactical awareness.',
    objectives: [
      'Improve ball control and first touch',
      'Develop passing accuracy under pressure',
      'Enhance tactical positioning',
      'Build match fitness and endurance'
    ],
    exercises: [
      {
        id: 'ex_1',
        name: 'Dynamic Warm-up',
        type: 'warmup',
        duration: 15,
        sets: 1,
        reps: null,
        description: 'Light jogging, dynamic stretches, and activation exercises',
        restTime: 0,
        difficulty: 'Easy',
        equipment: ['Cones'],
        videoUrl: null,
        completed: false,
        points: 10,
      },
      {
        id: 'ex_2',
        name: 'Ball Control Drills',
        type: 'skill',
        duration: 20,
        sets: 3,
        reps: 10,
        description: 'First touch practice with both feet, receiving balls from different angles',
        restTime: 60,
        difficulty: 'Intermediate',
        equipment: ['Ball', 'Cones'],
        videoUrl: null,
        completed: false,
        points: 25,
      },
      {
        id: 'ex_3',
        name: 'Passing Accuracy',
        type: 'skill',
        duration: 25,
        sets: 4,
        reps: 15,
        description: 'Short and long passing drills focusing on accuracy and timing',
        restTime: 90,
        difficulty: 'Intermediate',
        equipment: ['Ball', 'Cones', 'Targets'],
        videoUrl: null,
        completed: true,
        points: 30,
      },
      {
        id: 'ex_4',
        name: 'Small-sided Games',
        type: 'game',
        duration: 25,
        sets: 2,
        reps: null,
        description: '4v4 games focusing on quick decision making and ball retention',
        restTime: 120,
        difficulty: 'Hard',
        equipment: ['Ball', 'Goals', 'Bibs'],
        videoUrl: null,
        completed: false,
        points: 40,
      },
      {
        id: 'ex_5',
        name: 'Cool Down',
        type: 'cooldown',
        duration: 5,
        sets: 1,
        reps: null,
        description: 'Static stretching and breathing exercises',
        restTime: 0,
        difficulty: 'Easy',
        equipment: [],
        videoUrl: null,
        completed: false,
        points: 10,
      },
    ],
    totalPoints: 115,
    earnedPoints: 30,
  };

  const session = currentSession || defaultSession;

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    const completedCount = session.exercises.filter(ex => ex.completed).length;
    const progressValue = completedCount / session.exercises.length;
    
    Animated.timing(progressAnim, {
      toValue: progressValue,
      duration: 800,
      delay: 300,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim, slideAnim, progressAnim, session.exercises]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      dispatch({
        type: 'REFRESH_SESSION',
        payload: { sessionId: session.id },
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh session data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, session.id]);

  // Start session
  const startSession = useCallback(() => {
    Alert.alert(
      '🚀 Start Training Session',
      `Ready to begin "${session.title}"?\n\nDuration: ${session.duration} minutes\nExercises: ${session.exercises.length}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Session',
          onPress: () => {
            dispatch({
              type: 'START_SESSION',
              payload: {
                sessionId: session.id,
                startTime: new Date().toISOString(),
              },
            });
            
            if (Platform.OS === 'ios') {
              Vibration.vibrate([0, 100]);
            } else {
              Vibration.vibrate(100);
            }
            
            // Navigate to first exercise or session overview
            const firstIncompleteExercise = session.exercises.find(ex => !ex.completed);
            if (firstIncompleteExercise) {
              navigation.navigate('ExerciseDetail', {
                exerciseId: firstIncompleteExercise.id,
                sessionId: session.id,
              });
            }
          },
        },
      ]
    );
  }, [dispatch, navigation, session]);

  // Complete exercise
  const completeExercise = useCallback((exerciseId) => {
    const exercise = session.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    dispatch({
      type: 'COMPLETE_EXERCISE',
      payload: {
        sessionId: session.id,
        exerciseId,
        points: exercise.points,
        completedAt: new Date().toISOString(),
      },
    });

    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 200]);
    } else {
      Vibration.vibrate(200);
    }
  }, [dispatch, session]);

  // Start exercise
  const startExercise = useCallback((exercise) => {
    if (exercise.type === 'warmup' || exercise.type === 'cooldown') {
      navigation.navigate('ExerciseDetail', {
        exerciseId: exercise.id,
        sessionId: session.id,
      });
    } else {
      navigation.navigate('ExerciseDetail', {
        exerciseId: exercise.id,
        sessionId: session.id,
      });
    }
  }, [navigation, session.id]);

  // Start rest timer
  const startRestTimer = useCallback((exercise) => {
    const nextExerciseIndex = session.exercises.findIndex(ex => ex.id === exercise.id) + 1;
    const nextExercise = nextExerciseIndex < session.exercises.length 
      ? session.exercises[nextExerciseIndex].name 
      : null;

    navigation.navigate('RestTimer', {
      duration: exercise.restTime,
      exerciseName: exercise.name,
      nextExercise,
    });
  }, [navigation, session.exercises]);

  // Filter exercises
  const filteredExercises = session.exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'completed') return matchesSearch && exercise.completed;
    if (filterType === 'pending') return matchesSearch && !exercise.completed;
    if (filterType === exercise.type) return matchesSearch;
    
    return matchesSearch;
  });

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'hard': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  // Get exercise type icon
  const getExerciseIcon = (type) => {
    switch (type) {
      case 'warmup': return 'self-improvement';
      case 'skill': return 'sports-soccer';
      case 'strength': return 'fitness-center';
      case 'cardio': return 'directions-run';
      case 'game': return 'sports';
      case 'cooldown': return 'spa';
      default: return 'sports-soccer';
    }
  };

  // Calculate progress
  const completedCount = session.exercises.filter(ex => ex.completed).length;
  const progressPercentage = (completedCount / session.exercises.length) * 100;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <IconButton
            icon="arrow-back"
            iconColor="white"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {session.title}
          </Text>
          <IconButton
            icon="dots-vertical"
            iconColor="white"
            size={24}
            onPress={() => setShowNotes(true)}
          />
        </View>
        
        <View style={styles.headerInfo}>
          <View style={styles.coachInfo}>
            <Avatar.Text
              size={32}
              label={session.coach?.charAt(0) || 'C'}
              style={styles.coachAvatar}
            />
            <Text style={styles.coachName}>{session.coach}</Text>
          </View>
          
          <View style={styles.sessionStats}>
            <View style={styles.statItem}>
              <Icon name="schedule" size={16} color="white" />
              <Text style={styles.statText}>{session.duration}min</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="fitness-center" size={16} color="white" />
              <Text style={styles.statText}>{session.exercises.length} exercises</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={styles.content}
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
        {/* Progress Section */}
        <Animated.View
          style={[
            styles.progressSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Card style={styles.progressCard}>
            <Card.Content>
              <View style={styles.progressHeader}>
                <Text style={TEXT_STYLES.h3}>Session Progress</Text>
                <Chip
                  mode="outlined"
                  textStyle={styles.chipText}
                  style={[styles.difficultyChip, { borderColor: getDifficultyColor(session.difficulty) }]}
                >
                  {session.difficulty}
                </Chip>
              </View>
              
              <View style={styles.progressStats}>
                <Text style={styles.progressText}>
                  {completedCount}/{session.exercises.length} completed ({Math.round(progressPercentage)}%)
                </Text>
                <Text style={styles.pointsText}>
                  🏆 {session.earnedPoints}/{session.totalPoints} points
                </Text>
              </View>
              
              <Animated.View style={styles.progressBarContainer}>
                <ProgressBar
                  progress={progressAnim}
                  color={COLORS.success}
                  style={styles.progressBar}
                />
              </Animated.View>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Session Description */}
        {session.description && (
          <Card style={styles.descriptionCard}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>Description</Text>
              <Text style={[TEXT_STYLES.body, styles.description]}>
                {session.description}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Objectives */}
        {session.objectives && session.objectives.length > 0 && (
          <Card style={styles.objectivesCard}>
            <Card.Content>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                🎯 Training Objectives
              </Text>
              {session.objectives.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <Icon name="check-circle" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.body, styles.objectiveText]}>
                    {objective}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search exercises..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {['all', 'completed', 'pending', 'warmup', 'skill', 'game', 'cooldown'].map(filter => (
              <Chip
                key={filter}
                mode={filterType === filter ? 'flat' : 'outlined'}
                selected={filterType === filter}
                onPress={() => setFilterType(filter)}
                style={styles.filterChip}
                textStyle={styles.filterChipText}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Exercises List */}
        <View style={styles.exercisesSection}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            💪 Exercises ({filteredExercises.length})
          </Text>
          
          {filteredExercises.map((exercise, index) => (
            <Card
              key={exercise.id}
              style={[
                styles.exerciseCard,
                exercise.completed && styles.completedExerciseCard,
              ]}
            >
              <Card.Content>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseInfo}>
                    <Icon
                      name={getExerciseIcon(exercise.type)}
                      size={24}
                      color={exercise.completed ? COLORS.success : COLORS.primary}
                    />
                    <View style={styles.exerciseTitle}>
                      <Text style={[
                        TEXT_STYLES.body,
                        styles.exerciseName,
                        exercise.completed && styles.completedText,
                      ]}>
                        {exercise.name}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, styles.exerciseType]}>
                        {exercise.type.charAt(0).toUpperCase() + exercise.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.exerciseActions}>
                    <Text style={styles.exercisePoints}>+{exercise.points}pt</Text>
                    {exercise.completed ? (
                      <IconButton
                        icon="check-circle"
                        iconColor={COLORS.success}
                        size={20}
                      />
                    ) : (
                      <IconButton
                        icon="play-circle"
                        iconColor={COLORS.primary}
                        size={20}
                        onPress={() => startExercise(exercise)}
                      />
                    )}
                  </View>
                </View>

                <Text style={[TEXT_STYLES.caption, styles.exerciseDescription]}>
                  {exercise.description}
                </Text>

                <View style={styles.exerciseDetails}>
                  <View style={styles.exerciseStats}>
                    <View style={styles.statBadge}>
                      <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.statBadgeText}>{exercise.duration}min</Text>
                    </View>
                    
                    {exercise.sets && (
                      <View style={styles.statBadge}>
                        <Icon name="repeat" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.statBadgeText}>
                          {exercise.sets} sets
                          {exercise.reps && ` × ${exercise.reps}`}
                        </Text>
                      </View>
                    )}
                    
                    {exercise.restTime > 0 && (
                      <View style={styles.statBadge}>
                        <Icon name="pause" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.statBadgeText}>{exercise.restTime}s rest</Text>
                      </View>
                    )}
                  </View>

                  {exercise.equipment && exercise.equipment.length > 0 && (
                    <View style={styles.equipmentContainer}>
                      <Text style={styles.equipmentLabel}>Equipment:</Text>
                      {exercise.equipment.map((item, idx) => (
                        <Chip
                          key={idx}
                          mode="outlined"
                          compact
                          style={styles.equipmentChip}
                          textStyle={styles.equipmentChipText}
                        >
                          {item}
                        </Chip>
                      ))}
                    </View>
                  )}
                </View>

                {!exercise.completed && (
                  <View style={styles.exerciseButtons}>
                    <Button
                      mode="contained"
                      onPress={() => startExercise(exercise)}
                      style={styles.startButton}
                      icon="play-arrow"
                      compact
                    >
                      Start Exercise
                    </Button>
                    
                    {exercise.restTime > 0 && (
                      <Button
                        mode="outlined"
                        onPress={() => startRestTimer(exercise)}
                        style={styles.restButton}
                        icon="timer"
                        compact
                      >
                        Rest Timer
                      </Button>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>

      {/* FAB */}
      <FAB
        icon={completedCount === session.exercises.length ? "check" : "play-arrow"}
        style={[
          styles.fab,
          { backgroundColor: completedCount === session.exercises.length ? COLORS.success : COLORS.primary }
        ]}
        onPress={completedCount === session.exercises.length 
          ? () => Alert.alert('🎉 Session Complete!', 'Great job finishing your training session!')
          : startSession
        }
        label={completedCount === session.exercises.length ? "Complete!" : "Start Session"}
      />

      {/* Notes Modal */}
      <Portal>
        <Modal
          visible={showNotes}
          onDismiss={() => setShowNotes(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Session Notes</Text>
          <Text style={[TEXT_STYLES.body, styles.modalDescription]}>
            📝 Coach notes and session feedback coming soon!
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowNotes(false)}
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
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerInfo: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  coachAvatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  coachName: {
    ...TEXT_STYLES.body,
    color: 'white',
    marginLeft: SPACING.sm,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginLeft: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressCard: {
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  difficultyChip: {
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 12,
  },
  progressStats: {
    marginBottom: SPACING.md,
  },
  progressText: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
  },
  pointsText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  descriptionCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  objectivesCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: SPACING.md,
  },
  description: {
    lineHeight: 22,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  objectiveText: {
    marginLeft: SPACING.sm,
    flex: 1,
    lineHeight: 20,
  },
  searchSection: {
    marginBottom: SPACING.md,
  },
  searchBar: {
    elevation: 2,
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    paddingVertical: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  filterChipText: {
    fontSize: 12,
  },
  exercisesSection: {
    marginBottom: SPACING.xl,
  },
  exerciseCard: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  completedExerciseCard: {
    opacity: 0.8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  exerciseTitle: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  exerciseName: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  exerciseType: {
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
  },
  exerciseActions: {
    alignItems: 'flex-end',
  },
  exercisePoints: {
    ...TEXT_STYLES.caption,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  exerciseDescription: {
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  exerciseDetails: {
    marginBottom: SPACING.md,
  },
  exerciseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statBadgeText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  equipmentLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  equipmentChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  equipmentChipText: {
    fontSize: 11,
  },
  exerciseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  startButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  restButton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  bottomPadding: {
    height: 100,
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
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
  },
});

export default SessionDetails;