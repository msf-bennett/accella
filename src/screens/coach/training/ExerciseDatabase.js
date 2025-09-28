import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { 
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Surface,
  Searchbar,
  Portal,
  ProgressBar,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
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
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width } = Dimensions.get('window');

const ExerciseDatabase = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseDetailModalVisible, setExerciseDetailModalVisible] = useState(false);
  const [favoriteExercises, setFavoriteExercises] = useState(new Set());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock data for exercises
  const mockExercises = [
    {
      id: '1',
      name: 'Push-ups',
      category: 'Strength',
      primaryMuscles: ['Chest', 'Triceps'],
      secondaryMuscles: ['Shoulders', 'Core'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      instructions: [
        'Start in a plank position with hands shoulder-width apart',
        'Lower your body until chest nearly touches the floor',
        'Keep your core tight and body in straight line',
        'Push back up to starting position',
        'Repeat for desired repetitions'
      ],
      benefits: [
        'Builds upper body strength',
        'Improves core stability',
        'Enhances functional movement',
        'No equipment required'
      ],
      modifications: [
        'Knee push-ups for beginners',
        'Incline push-ups on bench',
        'Diamond push-ups for triceps focus',
        'Single-arm push-ups for advanced'
      ],
      commonMistakes: [
        'Sagging hips or raised butt',
        'Partial range of motion',
        'Flared elbows',
        'Holding breath during movement'
      ],
      sets: '3-4',
      reps: '8-15',
      rest: '60-90 seconds',
      calories: 7,
      duration: '5-10 min',
      thumbnail: 'https://via.placeholder.com/300x200',
      videoUrl: 'https://example.com/pushups',
      rating: 4.8,
      completions: 15420,
      progressionLevel: 1,
      biomechanics: {
        movement: 'Push (Horizontal)',
        plane: 'Sagittal',
        jointActions: ['Shoulder flexion', 'Elbow extension'],
        stabilizers: ['Core', 'Scapular stabilizers']
      }
    },
    {
      id: '2',
      name: 'Squats',
      category: 'Strength',
      primaryMuscles: ['Quadriceps', 'Glutes'],
      secondaryMuscles: ['Hamstrings', 'Calves', 'Core'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower your body by bending at hips and knees',
        'Keep your chest up and weight on your heels',
        'Descend until thighs are parallel to floor',
        'Drive through heels to return to starting position'
      ],
      benefits: [
        'Strengthens lower body',
        'Improves functional movement',
        'Enhances athletic performance',
        'Builds core stability'
      ],
      modifications: [
        'Chair-assisted squats',
        'Wall squats for form',
        'Jump squats for power',
        'Single-leg squats for advanced'
      ],
      commonMistakes: [
        'Knees caving inward',
        'Forward lean',
        'Not going deep enough',
        'Weight on toes'
      ],
      sets: '3-4',
      reps: '12-20',
      rest: '60-90 seconds',
      calories: 8,
      duration: '8-12 min',
      thumbnail: 'https://via.placeholder.com/300x200',
      videoUrl: 'https://example.com/squats',
      rating: 4.9,
      completions: 18750,
      progressionLevel: 1,
      biomechanics: {
        movement: 'Squat',
        plane: 'Sagittal',
        jointActions: ['Hip flexion', 'Knee flexion', 'Ankle dorsiflexion'],
        stabilizers: ['Core', 'Hip stabilizers']
      }
    },
    {
      id: '3',
      name: 'Deadlift',
      category: 'Strength',
      primaryMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae'],
      secondaryMuscles: ['Traps', 'Rhomboids', 'Forearms'],
      equipment: 'Barbell',
      difficulty: 'Intermediate',
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Hinge at hips and bend knees to grip bar',
        'Keep chest up and shoulders back',
        'Drive through heels and hips to lift bar',
        'Stand tall, then reverse movement to lower'
      ],
      benefits: [
        'Develops posterior chain',
        'Improves posture',
        'Builds functional strength',
        'Enhances athletic power'
      ],
      modifications: [
        'Romanian deadlift',
        'Sumo deadlift',
        'Trap bar deadlift',
        'Single-leg deadlift'
      ],
      commonMistakes: [
        'Rounded back',
        'Bar drifting away from body',
        'Hyperextending at top',
        'Not engaging lats'
      ],
      sets: '3-5',
      reps: '5-8',
      rest: '2-3 minutes',
      calories: 12,
      duration: '15-20 min',
      thumbnail: 'https://via.placeholder.com/300x200',
      videoUrl: 'https://example.com/deadlift',
      rating: 4.7,
      completions: 9340,
      progressionLevel: 3,
      biomechanics: {
        movement: 'Hip Hinge',
        plane: 'Sagittal',
        jointActions: ['Hip extension', 'Knee extension'],
        stabilizers: ['Core', 'Latissimus dorsi', 'Rhomboids']
      }
    },
    {
      id: '4',
      name: 'Burpees',
      category: 'Cardio',
      primaryMuscles: ['Full Body'],
      secondaryMuscles: ['Cardiovascular System'],
      equipment: 'Bodyweight',
      difficulty: 'Intermediate',
      instructions: [
        'Start standing, then squat down and place hands on floor',
        'Jump feet back into plank position',
        'Perform a push-up (optional)',
        'Jump feet back to squat position',
        'Jump up with arms overhead'
      ],
      benefits: [
        'Full-body conditioning',
        'Improves cardiovascular fitness',
        'Burns high calories',
        'Builds mental toughness'
      ],
      modifications: [
        'Step back instead of jump',
        'Remove push-up',
        'Half burpee without jump',
        'Add tuck jump for advanced'
      ],
      commonMistakes: [
        'Poor plank form',
        'Rushing through movement',
        'Landing hard on jumps',
        'Incomplete range of motion'
      ],
      sets: '3-4',
      reps: '5-15',
      rest: '90-120 seconds',
      calories: 15,
      duration: '10-15 min',
      thumbnail: 'https://via.placeholder.com/300x200',
      videoUrl: 'https://example.com/burpees',
      rating: 4.3,
      completions: 7890,
      progressionLevel: 2,
      biomechanics: {
        movement: 'Compound Multi-planar',
        plane: 'Multi-planar',
        jointActions: ['Multiple joint movements'],
        stabilizers: ['Full body stabilization']
      }
    },
    {
      id: '5',
      name: 'Plank',
      category: 'Core',
      primaryMuscles: ['Core', 'Abdominals'],
      secondaryMuscles: ['Shoulders', 'Glutes'],
      equipment: 'Bodyweight',
      difficulty: 'Beginner',
      instructions: [
        'Start in push-up position',
        'Lower to forearms, elbows under shoulders',
        'Keep body in straight line from head to heels',
        'Engage core and glutes',
        'Hold position for specified time'
      ],
      benefits: [
        'Builds core strength',
        'Improves posture',
        'Enhances stability',
        'Reduces back pain risk'
      ],
      modifications: [
        'Knee plank for beginners',
        'Incline plank on bench',
        'Side planks',
        'Plank with leg lifts'
      ],
      commonMistakes: [
        'Sagging hips',
        'Raised butt',
        'Holding breath',
        'Looking up'
      ],
      sets: '3-4',
      reps: '30-60 seconds',
      rest: '60 seconds',
      calories: 3,
      duration: '5-8 min',
      thumbnail: 'https://via.placeholder.com/300x200',
      videoUrl: 'https://example.com/plank',
      rating: 4.6,
      completions: 12560,
      progressionLevel: 1,
      biomechanics: {
        movement: 'Isometric Hold',
        plane: 'Static',
        jointActions: ['Isometric core contraction'],
        stabilizers: ['Deep core muscles', 'Shoulder stabilizers']
      }
    },
  ];

  const categories = ['All', 'Strength', 'Cardio', 'Flexibility', 'Core', 'Balance', 'Power'];
  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Glutes', 'Full Body'];
  const equipment = ['All', 'Bodyweight', 'Barbell', 'Dumbbells', 'Kettlebell', 'Resistance Bands', 'Medicine Ball'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

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
      }),
    ]).start();

    loadExercises();
  }, []);

  // Filter exercises based on search and filters
  useEffect(() => {
    filterExercises();
  }, [searchQuery, selectedCategory, selectedMuscleGroup, selectedEquipment, selectedDifficulty, exercises]);

  const loadExercises = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExercises(mockExercises);
    } catch (error) {
      Alert.alert('Error', 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterExercises = useCallback(() => {
    let filtered = exercises;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.primaryMuscles.some(muscle => 
          muscle.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    // Muscle group filter
    if (selectedMuscleGroup !== 'All') {
      filtered = filtered.filter(exercise =>
        exercise.primaryMuscles.includes(selectedMuscleGroup) ||
        exercise.secondaryMuscles.includes(selectedMuscleGroup)
      );
    }

    // Equipment filter
    if (selectedEquipment !== 'All') {
      filtered = filtered.filter(exercise => exercise.equipment === selectedEquipment);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    setFilteredExercises(filtered);
  }, [exercises, searchQuery, selectedCategory, selectedMuscleGroup, selectedEquipment, selectedDifficulty]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExercises();
    setRefreshing(false);
  }, [loadExercises]);

  const handleExercisePress = (exercise) => {
    setSelectedExercise(exercise);
    setExerciseDetailModalVisible(true);
  };

  const handleAddToWorkout = (exercise) => {
    Alert.alert(
      'Add to Workout',
      `Add "${exercise.name}" to a workout plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            Alert.alert('Success', 'Exercise added to workout! 💪');
          }
        }
      ]
    );
  };

  const toggleFavorite = (exerciseId) => {
    const newFavorites = new Set(favoriteExercises);
    if (newFavorites.has(exerciseId)) {
      newFavorites.delete(exerciseId);
    } else {
      newFavorites.add(exerciseId);
    }
    setFavoriteExercises(newFavorites);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Strength': return 'fitness-center';
      case 'Cardio': return 'favorite';
      case 'Core': return 'center-focus-strong';
      case 'Flexibility': return 'accessibility';
      case 'Balance': return 'balance';
      case 'Power': return 'flash-on';
      default: return 'fitness-center';
    }
  };

  const renderExerciseCard = ({ item, index }) => {
    const cardScale = new Animated.Value(1);
    const isFavorite = favoriteExercises.has(item.id);

    const handlePressIn = () => {
      Animated.spring(cardScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          viewMode === 'grid' ? styles.gridCard : styles.listCard,
          { transform: [{ scale: cardScale }] }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleExercisePress(item)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Card style={styles.exerciseCard} elevation={3}>
            <View style={styles.cardHeader}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                style={styles.categoryBadge}
              >
                <Icon name={getCategoryIcon(item.category)} size={20} color="white" />
                <Text style={[TEXT_STYLES.small, { color: 'white', marginLeft: SPACING.xs }]}>
                  {item.category}
                </Text>
              </LinearGradient>

              <IconButton
                icon={isFavorite ? 'favorite' : 'favorite-outline'}
                iconColor={isFavorite ? COLORS.error : COLORS.textSecondary}
                size={20}
                onPress={() => toggleFavorite(item.id)}
                style={styles.favoriteButton}
              />
            </View>

            <Card.Content style={styles.exerciseContent}>
              <Text style={TEXT_STYLES.h3} numberOfLines={2}>
                {item.name}
              </Text>
              
              <View style={styles.exerciseMeta}>
                <Chip
                  mode="flat"
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
                  textStyle={styles.chipText}
                >
                  {item.difficulty}
                </Chip>
                <Text style={TEXT_STYLES.caption}>•</Text>
                <Text style={TEXT_STYLES.caption}>{item.equipment}</Text>
              </View>

              <View style={styles.muscleGroups}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: '600' }]}>
                  Primary: 
                </Text>
                <Text style={TEXT_STYLES.caption}>
                  {item.primaryMuscles.join(', ')}
                </Text>
              </View>

              <View style={styles.exerciseStats}>
                <View style={styles.statItem}>
                  <Icon name="timer" size={16} color={COLORS.info} />
                  <Text style={TEXT_STYLES.small}>{item.duration}</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="local-fire-department" size={16} color={COLORS.error} />
                  <Text style={TEXT_STYLES.small}>{item.calories} cal</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="star" size={16} color={COLORS.warning} />
                  <Text style={TEXT_STYLES.small}>{item.rating}</Text>
                </View>
              </View>

              <View style={styles.workoutInfo}>
                <Text style={TEXT_STYLES.small}>
                  {item.sets} sets × {item.reps} reps
                </Text>
                <Text style={TEXT_STYLES.small}>
                  Rest: {item.rest}
                </Text>
              </View>

              <ProgressBar
                progress={item.progressionLevel / 5}
                color={COLORS.primary}
                style={styles.progressBar}
              />
              <Text style={[TEXT_STYLES.small, { textAlign: 'center', marginTop: SPACING.xs }]}>
                Level {item.progressionLevel}/5
              </Text>

              <View style={styles.exerciseActions}>
                <Button
                  mode="contained"
                  style={styles.addButton}
                  onPress={() => handleAddToWorkout(item)}
                  labelStyle={styles.buttonLabel}
                >
                  Add to Workout
                </Button>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterChips}
    >
      {categories.map((category) => (
        <Chip
          key={category}
          mode={selectedCategory === category ? 'flat' : 'outlined'}
          style={[
            styles.filterChip,
            selectedCategory === category && styles.activeFilterChip
          ]}
          textStyle={selectedCategory === category ? styles.activeChipText : styles.chipText}
          onPress={() => setSelectedCategory(category)}
          icon={category !== 'All' ? getCategoryIcon(category) : undefined}
        >
          {category}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderExerciseDetailModal = () => (
    <Modal
      visible={exerciseDetailModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setExerciseDetailModalVisible(false)}
    >
      <BlurView style={styles.modalOverlay} blurType="light" blurAmount={10}>
        <View style={styles.exerciseDetailModal}>
          <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalTitleSection}>
                <Icon name={getCategoryIcon(selectedExercise?.category)} size={24} color="white" />
                <Text style={[TEXT_STYLES.h2, { color: 'white', marginLeft: SPACING.sm }]}>
                  {selectedExercise?.name}
                </Text>
              </View>
              <IconButton
                icon="close"
                size={24}
                iconColor="white"
                onPress={() => setExerciseDetailModalVisible(false)}
              />
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            {selectedExercise && (
              <>
                <View style={styles.exerciseOverview}>
                  <View style={styles.overviewGrid}>
                    <View style={styles.overviewItem}>
                      <Text style={TEXT_STYLES.caption}>Difficulty</Text>
                      <Chip
                        mode="flat"
                        style={[styles.overviewChip, { backgroundColor: getDifficultyColor(selectedExercise.difficulty) }]}
                        textStyle={{ color: 'white' }}
                      >
                        {selectedExercise.difficulty}
                      </Chip>
                    </View>
                    <View style={styles.overviewItem}>
                      <Text style={TEXT_STYLES.caption}>Equipment</Text>
                      <Text style={TEXT_STYLES.body}>{selectedExercise.equipment}</Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Text style={TEXT_STYLES.caption}>Duration</Text>
                      <Text style={TEXT_STYLES.body}>{selectedExercise.duration}</Text>
                    </View>
                    <View style={styles.overviewItem}>
                      <Text style={TEXT_STYLES.caption}>Calories</Text>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.error }]}>
                        {selectedExercise.calories} cal
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Primary Muscles</Text>
                  <View style={styles.musclesList}>
                    {selectedExercise.primaryMuscles.map((muscle, index) => (
                      <Chip
                        key={index}
                        mode="flat"
                        style={[styles.muscleChip, { backgroundColor: COLORS.primary }]}
                        textStyle={{ color: 'white' }}
                      >
                        {muscle}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Secondary Muscles</Text>
                  <View style={styles.musclesList}>
                    {selectedExercise.secondaryMuscles.map((muscle, index) => (
                      <Chip
                        key={index}
                        mode="outlined"
                        style={styles.muscleChip}
                      >
                        {muscle}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Instructions</Text>
                  {selectedExercise.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={styles.instructionNumber}>
                        <Text style={styles.instructionNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={[TEXT_STYLES.body, { flex: 1 }]}>{instruction}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Benefits</Text>
                  {selectedExercise.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Icon name="check-circle" size={16} color={COLORS.success} />
                      <Text style={[TEXT_STYLES.body, styles.benefitText]}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Common Mistakes</Text>
                  {selectedExercise.commonMistakes.map((mistake, index) => (
                    <View key={index} style={styles.mistakeItem}>
                      <Icon name="warning" size={16} color={COLORS.warning} />
                      <Text style={[TEXT_STYLES.body, styles.mistakeText]}>{mistake}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Modifications</Text>
                  {selectedExercise.modifications.map((modification, index) => (
                    <Text key={index} style={[TEXT_STYLES.body, styles.modificationText]}>
                      • {modification}
                    </Text>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={TEXT_STYLES.h3}>Biomechanics</Text>
                  <View style={styles.biomechanicsGrid}>
                    <View style={styles.biomechanicsItem}>
                      <Text style={TEXT_STYLES.caption}>Movement Pattern</Text>
                      <Text style={TEXT_STYLES.body}>{selectedExercise.biomechanics.movement}</Text>
                    </View>
                    <View style={styles.biomechanicsItem}>
                      <Text style={TEXT_STYLES.caption}>Movement Plane</Text>
                      <Text style={TEXT_STYLES.body}>{selectedExercise.biomechanics.plane}</Text>
                    </View>
                  </View>
                  <View style={styles.biomechanicsSection}>
                    <Text style={TEXT_STYLES.caption}>Joint Actions</Text>
                    <Text style={TEXT_STYLES.body}>
                      {selectedExercise.biomechanics.jointActions.join(', ')}
                    </Text>
                  </View>
                  <View style={styles.biomechanicsSection}>
                    <Text style={TEXT_STYLES.caption}>Stabilizing Muscles</Text>
                    <Text style={TEXT_STYLES.body}>
                      {selectedExercise.biomechanics.stabilizers.join(', ')}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              style={styles.modalSecondaryButton}
              onPress={() => {
                toggleFavorite(selectedExercise.id);
              }}
              icon={favoriteExercises.has(selectedExercise?.id) ? 'favorite' : 'favorite-outline'}
            >
              {favoriteExercises.has(selectedExercise?.id) ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button
              mode="contained"
              style={styles.modalPrimaryButton}
              onPress={() => {
                handleAddToWorkout(selectedExercise);
                setExerciseDetailModalVisible(false);
              }}
            >
              Add to Workout
            </Button>
          </View>
        </View>
      </BlurView>
    </Modal>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <BlurView style={styles.modalOverlay} blurType="light" blurAmount={10}>
          <View style={styles.filterModal}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.modalHeader}>
              <View style={styles.modalHeaderContent}>
                <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>Advanced Filters</Text>
                <IconButton
                  icon="close"
                  size={24}
                  iconColor="white"
                  onPress={() => setFilterModalVisible(false)}
                />
              </View>
            </LinearGradient>

            <ScrollView style={styles.filterModalContent}>
              <View style={styles.filterSection}>
                <Text style={TEXT_STYLES.h3}>Muscle Groups</Text>
                <View style={styles.filterOptions}>
                  {muscleGroups.map((group) => (
                    <Chip
                      key={group}
                      mode={selectedMuscleGroup === group ? 'flat' : 'outlined'}
                      style={[
                        styles.filterOption,
                        selectedMuscleGroup === group && styles.activeFilterOption
                      ]}
                      onPress={() => setSelectedMuscleGroup(group)}
                    >
                      {group}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={TEXT_STYLES.h3}>Equipment</Text>
                <View style={styles.filterOptions}>
                  {equipment.map((eq) => (
                    <Chip
                      key={eq}
                      mode={selectedEquipment === eq ? 'flat' : 'outlined'}
                      style={[
                        styles.filterOption,
                        selectedEquipment === eq && styles.activeFilterOption
                      ]}
                      onPress={() => setSelectedEquipment(eq)}
                    >
                      {eq}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={TEXT_STYLES.h3}>Difficulty</Text>
                <View style={styles.filterOptions}>
                  {difficulties.map((difficulty) => (
                    <Chip
                      key={difficulty}
                      mode={selectedDifficulty === difficulty ? 'flat' : 'outlined'}
                      style={[
                        styles.filterOption,
                        selectedDifficulty === difficulty && styles.activeFilterOption
                      ]}
                      onPress={() => setSelectedDifficulty(difficulty)}
                    >
                      {difficulty}
                    </Chip>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterModalActions}>
              <Button
                mode="outlined"
                style={styles.resetButton}
                onPress={() => {
                  setSelectedCategory('All');
                  setSelectedMuscleGroup('All');
                  setSelectedEquipment('All');
                  setSelectedDifficulty('All');
                }}
              >
                Reset All
              </Button>
              <Button
                mode="contained"
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                Apply Filters
              </Button>
            </View>
          </View>
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>Exercise Database 💪</Text>
          <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
            Comprehensive exercise library with detailed guidance
          </Text>
          
          <View style={styles.headerActions}>
            <Searchbar
              placeholder="Search exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              iconColor={COLORS.primary}
            />
            
            <View style={styles.headerButtons}>
              <IconButton
                icon="tune"
                size={24}
                iconColor="white"
                style={styles.headerButton}
                onPress={() => setFilterModalVisible(true)}
              />
              <IconButton
                icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
                size={24}
                iconColor="white"
                style={styles.headerButton}
                onPress={toggleViewMode}
              />
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {renderFilterChips()}

        <View style={styles.resultsHeader}>
          <Text style={TEXT_STYLES.h3}>
            {filteredExercises.length} Exercises Found
          </Text>
          <Text style={TEXT_STYLES.caption}>
            {searchQuery && `Results for "${searchQuery}"`}
          </Text>
        </View>

        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseCard}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode}
          contentContainerStyle={styles.exercisesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      <FAB
        icon="add"
        style={[styles.fab, { backgroundColor: COLORS.primary }]}
        onPress={() => Alert.alert('Create Exercise', 'Feature coming soon! 🔧')}
      />

      {renderExerciseDetailModal()}
      {renderFilterModal()}
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerActions: {
    width: '100%',
    marginTop: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    backgroundColor: 'white',
    borderRadius: 25,
  },
  searchInput: {
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    margin: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  filterChips: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: 'white',
  },
  resultsHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  exercisesList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
  },
  gridCard: {
    flex: 1,
    margin: SPACING.xs,
  },
  listCard: {
    marginVertical: SPACING.xs,
  },
  exerciseCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 15,
  },
  favoriteButton: {
    margin: 0,
  },
  exerciseContent: {
    padding: SPACING.md,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  difficultyChip: {
    backgroundColor: COLORS.success,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  workoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  progressBar: {
    marginVertical: SPACING.sm,
    height: 4,
    borderRadius: 2,
  },
  exerciseActions: {
    marginTop: SPACING.md,
  },
  addButton: {
    width: '100%',
  },
  buttonLabel: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    borderRadius: 28,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  exerciseDetailModal: {
    width: width * 0.9,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterModal: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  exerciseOverview: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overviewItem: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  overviewChip: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  musclesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  muscleChip: {
    marginRight: 0,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SPACING.sm,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  instructionNumberText: {
    ...TEXT_STYLES.small,
    color: 'white',
    fontWeight: 'bold',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  benefitText: {
    marginLeft: SPACING.sm,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  mistakeText: {
    marginLeft: SPACING.sm,
  },
  modificationText: {
    marginVertical: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  biomechanicsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  biomechanicsItem: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  biomechanicsSection: {
    marginTop: SPACING.sm,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  modalSecondaryButton: {
    flex: 1,
  },
  modalPrimaryButton: {
    flex: 1,
  },
  filterModalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  filterOption: {
    marginRight: 0,
  },
  activeFilterOption: {
    backgroundColor: COLORS.primary,
  },
  filterModalActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
});

export default ExerciseDatabase;