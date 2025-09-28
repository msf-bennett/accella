import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  TextInput,
  Modal,
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
  Searchbar,
  Portal,
  Dialog,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Import your established constants
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');

const ExerciseDatabase = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { exercises, isLoading } = useSelector(state => state.exercises);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Mock exercise data
  const [exerciseDatabase, setExerciseDatabase] = useState([
    {
      id: 1,
      name: 'Push-ups',
      category: 'strength',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
      equipment: 'Bodyweight',
      difficulty: 'beginner',
      instructions: [
        'Start in a plank position with hands shoulder-width apart',
        'Lower your body until chest nearly touches the floor',
        'Push back up to starting position',
        'Keep your core tight throughout the movement'
      ],
      tips: ['Keep your body in a straight line', 'Control the descent'],
      sets: '3',
      reps: '10-15',
      restTime: '60 seconds',
      calories: 7,
      image: 'https://via.placeholder.com/300x200/667eea/white?text=Push-ups',
      videoUrl: 'https://example.com/pushups.mp4',
      isCustom: false,
      rating: 4.8,
      usedBy: 150,
    },
    {
      id: 2,
      name: 'Squats',
      category: 'strength',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
      equipment: 'Bodyweight',
      difficulty: 'beginner',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower your hips back and down as if sitting in a chair',
        'Keep your chest up and knees over toes',
        'Return to standing position'
      ],
      tips: ['Go as low as comfortable', 'Keep weight on your heels'],
      sets: '3',
      reps: '12-15',
      restTime: '45 seconds',
      calories: 8,
      image: 'https://via.placeholder.com/300x200/764ba2/white?text=Squats',
      videoUrl: 'https://example.com/squats.mp4',
      isCustom: false,
      rating: 4.9,
      usedBy: 200,
    },
    {
      id: 3,
      name: 'Barbell Deadlift',
      category: 'strength',
      muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'],
      equipment: 'Barbell',
      difficulty: 'advanced',
      instructions: [
        'Stand with feet hip-width apart, barbell over mid-foot',
        'Bend at hips and knees to grip the bar',
        'Keep chest up and drive through heels',
        'Extend hips and knees simultaneously'
      ],
      tips: ['Keep the bar close to your body', 'Maintain neutral spine'],
      sets: '4',
      reps: '6-8',
      restTime: '2-3 minutes',
      calories: 12,
      image: 'https://via.placeholder.com/300x200/FF6B6B/white?text=Deadlift',
      videoUrl: 'https://example.com/deadlift.mp4',
      isCustom: false,
      rating: 4.7,
      usedBy: 85,
    },
    {
      id: 4,
      name: 'Burpees',
      category: 'cardio',
      muscleGroups: ['Full Body'],
      equipment: 'Bodyweight',
      difficulty: 'intermediate',
      instructions: [
        'Start standing, then squat down and place hands on floor',
        'Jump feet back into plank position',
        'Perform a push-up (optional)',
        'Jump feet back to squat position, then jump up with arms overhead'
      ],
      tips: ['Maintain good form even when tired', 'Modify as needed'],
      sets: '3',
      reps: '8-12',
      restTime: '90 seconds',
      calories: 15,
      image: 'https://via.placeholder.com/300x200/4ECDC4/white?text=Burpees',
      videoUrl: 'https://example.com/burpees.mp4',
      isCustom: false,
      rating: 4.5,
      usedBy: 120,
    },
    {
      id: 5,
      name: 'Yoga Sun Salutation',
      category: 'flexibility',
      muscleGroups: ['Full Body'],
      equipment: 'Yoga Mat',
      difficulty: 'beginner',
      instructions: [
        'Start in mountain pose with palms together',
        'Inhale, sweep arms overhead',
        'Exhale, fold forward into forward bend',
        'Continue through the sequence mindfully'
      ],
      tips: ['Focus on breath and movement connection', 'Move slowly and mindfully'],
      sets: '3',
      reps: '5 rounds',
      restTime: '30 seconds',
      calories: 5,
      image: 'https://via.placeholder.com/300x200/95E1D3/white?text=Sun+Salutation',
      videoUrl: 'https://example.com/sunsalutation.mp4',
      isCustom: false,
      rating: 4.8,
      usedBy: 95,
    },
    {
      id: 6,
      name: 'Custom Sprint Intervals',
      category: 'cardio',
      muscleGroups: ['Legs', 'Cardiovascular'],
      equipment: 'Track/Treadmill',
      difficulty: 'advanced',
      instructions: [
        'Warm up with 5 minutes of light jogging',
        'Sprint at 90% effort for 30 seconds',
        'Recover with light jog for 90 seconds',
        'Repeat for desired number of intervals'
      ],
      tips: ['Build up intensity gradually', 'Stay hydrated'],
      sets: '1',
      reps: '8-10 intervals',
      restTime: '90 seconds',
      calories: 20,
      image: 'https://via.placeholder.com/300x200/FFE66D/black?text=Sprint+Intervals',
      videoUrl: 'https://example.com/sprints.mp4',
      isCustom: true,
      rating: 4.6,
      usedBy: 45,
    },
  ]);

  const categories = ['all', 'strength', 'cardio', 'flexibility', 'sports', 'recovery'];
  const muscleGroups = ['all', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Legs', 'Full Body'];
  const equipmentTypes = ['all', 'Bodyweight', 'Dumbbells', 'Barbell', 'Resistance Bands', 'Machines', 'Cardio Equipment'];
  const difficultyLevels = ['all', 'beginner', 'intermediate', 'advanced'];

  const difficultyColors = {
    beginner: COLORS.success,
    intermediate: '#FF9500',
    advanced: COLORS.error,
  };

  // Animation setup
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
  }, []);

  // Filter exercises
  const filteredExercises = exerciseDatabase.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscleGroups.some(muscle => 
                           muscle.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesMuscleGroup = selectedMuscleGroup === 'all' || 
                              exercise.muscleGroups.includes(selectedMuscleGroup);
    const matchesEquipment = selectedEquipment === 'all' || exercise.equipment === selectedEquipment;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesMuscleGroup && matchesEquipment && matchesDifficulty;
  });

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchExercises());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh exercises');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = (exerciseId) => {
    setFavorites(prev => 
      prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  // Add to workout
  const addToWorkout = (exercise) => {
    Alert.alert(
      'Add to Workout',
      `Add "${exercise.name}" to which workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create New Workout', onPress: () => navigation.navigate('WorkoutBuilder', { exercise }) },
        { text: 'Add to Existing', onPress: () => Alert.alert('Feature Coming Soon', 'Adding to existing workouts will be available soon! 🚀') },
      ]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
  };

  // Render exercise card for grid view
  const renderExerciseGrid = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        width: (width - SPACING.lg * 3) / 2,
        marginRight: index % 2 === 0 ? SPACING.md : 0,
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          setSelectedExercise(item);
          setShowExerciseModal(true);
        }}
        activeOpacity={0.8}
      >
        <Card style={styles.exerciseGridCard} elevation={4}>
          <Image source={{ uri: item.image }} style={styles.exerciseImage} />
          
          <View style={styles.exerciseOverlay}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Icon 
                name={favorites.includes(item.id) ? "favorite" : "favorite-border"}
                size={20}
                color={favorites.includes(item.id) ? COLORS.error : "white"}
              />
            </TouchableOpacity>
            
            {item.isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>CUSTOM</Text>
              </View>
            )}
          </View>

          <View style={styles.exerciseCardContent}>
            <Text style={styles.exerciseName} numberOfLines={2}>{item.name}</Text>
            
            <View style={styles.exerciseMetrics}>
              <View style={styles.metricItem}>
                <Icon name="fitness-center" size={14} color={COLORS.primary} />
                <Text style={styles.metricText}>{item.equipment}</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="schedule" size={14} color={COLORS.primary} />
                <Text style={styles.metricText}>{item.sets}x{item.reps}</Text>
              </View>
            </View>

            <View style={styles.exerciseTags}>
              <Chip
                style={[styles.difficultyChip, { backgroundColor: difficultyColors[item.difficulty] }]}
                textStyle={styles.chipText}
              >
                {item.difficulty.toUpperCase()}
              </Chip>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={12} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render exercise card for list view
  const renderExerciseList = ({ item, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.md,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          setSelectedExercise(item);
          setShowExerciseModal(true);
        }}
        activeOpacity={0.8}
      >
        <Card style={styles.exerciseListCard} elevation={2}>
          <View style={styles.listCardContent}>
            <Image source={{ uri: item.image }} style={styles.listExerciseImage} />
            
            <View style={styles.listExerciseDetails}>
              <View style={styles.listExerciseHeader}>
                <Text style={styles.listExerciseName}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(item.id)}
                  style={styles.listFavoriteButton}
                >
                  <Icon 
                    name={favorites.includes(item.id) ? "favorite" : "favorite-border"}
                    size={20}
                    color={favorites.includes(item.id) ? COLORS.error : "#ccc"}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.listMuscleGroups}>
                Target: {item.muscleGroups.slice(0, 2).join(', ')}
                {item.muscleGroups.length > 2 && ` +${item.muscleGroups.length - 2} more`}
              </Text>

              <View style={styles.listExerciseMetrics}>
                <View style={styles.listMetricItem}>
                  <Icon name="fitness-center" size={16} color={COLORS.primary} />
                  <Text style={styles.listMetricText}>{item.equipment}</Text>
                </View>
                <View style={styles.listMetricItem}>
                  <Icon name="schedule" size={16} color={COLORS.primary} />
                  <Text style={styles.listMetricText}>{item.sets} sets</Text>
                </View>
                <View style={styles.listMetricItem}>
                  <Icon name="people" size={16} color={COLORS.primary} />
                  <Text style={styles.listMetricText}>{item.usedBy}</Text>
                </View>
              </View>

              <View style={styles.listExerciseTags}>
                <Chip
                  style={[styles.listDifficultyChip, { backgroundColor: difficultyColors[item.difficulty] }]}
                  textStyle={styles.listChipText}
                >
                  {item.difficulty.toUpperCase()}
                </Chip>
                <View style={styles.listRatingContainer}>
                  <Icon name="star" size={14} color="#FFD700" />
                  <Text style={styles.listRatingText}>{item.rating}</Text>
                </View>
                {item.isCustom && (
                  <Chip style={styles.listCustomChip} textStyle={styles.listCustomChipText}>
                    CUSTOM
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render exercise detail modal
  const renderExerciseModal = () => (
    <Portal>
      <Modal
        visible={showExerciseModal && selectedExercise}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        {selectedExercise && (
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <IconButton
                  icon="close"
                  iconColor="white"
                  onPress={() => setShowExerciseModal(false)}
                />
                <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(selectedExercise.id)}
                  style={styles.modalFavoriteButton}
                >
                  <Icon 
                    name={favorites.includes(selectedExercise.id) ? "favorite" : "favorite-border"}
                    size={24}
                    color={favorites.includes(selectedExercise.id) ? "#FF6B6B" : "white"}
                  />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Image source={{ uri: selectedExercise.image }} style={styles.modalExerciseImage} />

              <View style={styles.modalExerciseInfo}>
                <View style={styles.modalMetricsRow}>
                  <View style={styles.modalMetricBox}>
                    <Text style={styles.modalMetricValue}>{selectedExercise.sets}</Text>
                    <Text style={styles.modalMetricLabel}>Sets</Text>
                  </View>
                  <View style={styles.modalMetricBox}>
                    <Text style={styles.modalMetricValue}>{selectedExercise.reps}</Text>
                    <Text style={styles.modalMetricLabel}>Reps</Text>
                  </View>
                  <View style={styles.modalMetricBox}>
                    <Text style={styles.modalMetricValue}>{selectedExercise.restTime}</Text>
                    <Text style={styles.modalMetricLabel}>Rest</Text>
                  </View>
                  <View style={styles.modalMetricBox}>
                    <Text style={styles.modalMetricValue}>{selectedExercise.calories}</Text>
                    <Text style={styles.modalMetricLabel}>Cal/Set</Text>
                  </View>
                </View>

                <View style={styles.modalTagsSection}>
                  <Text style={styles.modalSectionTitle}>Details</Text>
                  <View style={styles.modalTagsRow}>
                    <Chip
                      style={[styles.modalDifficultyChip, { backgroundColor: difficultyColors[selectedExercise.difficulty] }]}
                      textStyle={styles.modalChipText}
                    >
                      {selectedExercise.difficulty.toUpperCase()}
                    </Chip>
                    <Chip style={styles.modalCategoryChip} textStyle={styles.modalCategoryChipText}>
                      {selectedExercise.category.toUpperCase()}
                    </Chip>
                    <Chip style={styles.modalEquipmentChip} textStyle={styles.modalEquipmentChipText}>
                      {selectedExercise.equipment}
                    </Chip>
                  </View>
                  <View style={styles.modalRatingSection}>
                    <Icon name="star" size={18} color="#FFD700" />
                    <Text style={styles.modalRatingText}>{selectedExercise.rating} • Used by {selectedExercise.usedBy} trainers</Text>
                  </View>
                </View>

                <View style={styles.modalMusclesSection}>
                  <Text style={styles.modalSectionTitle}>Target Muscles</Text>
                  <View style={styles.modalMusclesRow}>
                    {selectedExercise.muscleGroups.map((muscle, idx) => (
                      <Chip key={idx} style={styles.modalMuscleChip} textStyle={styles.modalMuscleChipText}>
                        {muscle}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.modalInstructionsSection}>
                  <Text style={styles.modalSectionTitle}>Instructions</Text>
                  {selectedExercise.instructions.map((instruction, idx) => (
                    <View key={idx} style={styles.instructionItem}>
                      <View style={styles.instructionNumber}>
                        <Text style={styles.instructionNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalTipsSection}>
                  <Text style={styles.modalSectionTitle}>Pro Tips 💡</Text>
                  {selectedExercise.tips.map((tip, idx) => (
                    <View key={idx} style={styles.tipItem}>
                      <Icon name="lightbulb-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalActionsSection}>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('Feature Coming Soon', 'Video demonstration will be available soon! 🎥')}
                    style={styles.modalActionButton}
                    labelStyle={styles.modalActionButtonLabel}
                    icon="play-circle-outline"
                  >
                    Watch Demo
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setShowExerciseModal(false);
                      addToWorkout(selectedExercise);
                    }}
                    style={[styles.modalActionButton, styles.modalPrimaryButton]}
                    labelStyle={styles.modalActionButtonLabel}
                    icon="add"
                  >
                    Add to Workout
                  </Button>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </Portal>
  );

  // Render filters modal
  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <IconButton
                icon="close"
                iconColor="white"
                onPress={() => setShowFilters(false)}
              />
              <Text style={styles.modalTitle}>Filter Exercises</Text>
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Category</Text>
              <View style={styles.filterChipsContainer}>
                {categories.map(category => (
                  <Chip
                    key={category}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.filterChip,
                      selectedCategory === category && styles.selectedFilterChip
                    ]}
                    textStyle={[
                      styles.filterChipText,
                      selectedCategory === category && styles.selectedFilterChipText
                    ]}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.filterDivider} />

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Muscle Group</Text>
              <View style={styles.filterChipsContainer}>
                {muscleGroups.map(muscle => (
                  <Chip
                    key={muscle}
                    selected={selectedMuscleGroup === muscle}
                    onPress={() => setSelectedMuscleGroup(muscle)}
                    style={[
                      styles.filterChip,
                      selectedMuscleGroup === muscle && styles.selectedFilterChip
                    ]}
                    textStyle={[
                      styles.filterChipText,
                      selectedMuscleGroup === muscle && styles.selectedFilterChipText
                    ]}
                  >
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.filterDivider} />

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Equipment</Text>
              <View style={styles.filterChipsContainer}>
                {equipmentTypes.map(equipment => (
                  <Chip
                    key={equipment}
                    selected={selectedEquipment === equipment}
                    onPress={() => setSelectedEquipment(equipment)}
                    style={[
                      styles.filterChip,
                      selectedEquipment === equipment && styles.selectedFilterChip
                    ]}
                    textStyle={[
                      styles.filterChipText,
                      selectedEquipment === equipment && styles.selectedFilterChipText
                    ]}
                  >
                    {equipment}
                  </Chip>
                ))}
              </View>
            </View>

            <Divider style={styles.filterDivider} />

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Difficulty</Text>
              <View style={styles.filterChipsContainer}>
                {difficultyLevels.map(difficulty => (
                  <Chip
                    key={difficulty}
                    selected={selectedDifficulty === difficulty}
                    onPress={() => setSelectedDifficulty(difficulty)}
                    style={[
                      styles.filterChip,
                      selectedDifficulty === difficulty && styles.selectedFilterChip
                    ]}
                    textStyle={[
                      styles.filterChipText,
                      selectedDifficulty === difficulty && styles.selectedFilterChipText
                    ]}
                  >
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Chip>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterActions}>
            <Button
              mode="contained"
              onPress={() => setShowFilters(false)}
              style={styles.applyFiltersButton}
              labelStyle={styles.applyFiltersButtonLabel}
            >
              Apply Filters ({filteredExercises.length} exercises)
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Exercise Database 💪</Text>
          <Text style={styles.headerSubtitle}>Discover and manage exercises</Text>
        </View>
        
        {/* Search Bar */}
        <Searchbar
          placeholder="Search exercises..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Icon name="filter-list" size={20} color="white" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'grid' && styles.activeViewToggle]}
              onPress={() => setViewMode('grid')}
            >
              <Icon name="grid-view" size={20} color={viewMode === 'grid' ? COLORS.primary : 'rgba(255,255,255,0.7)'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === 'list' && styles.activeViewToggle]}
              onPress={() => setViewMode('list')}
            >
              <Icon name="view-list" size={20} color={viewMode === 'list' ? COLORS.primary : 'rgba(255,255,255,0.7)'} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Active Filters */}
      {(selectedCategory !== 'all' || selectedMuscleGroup !== 'all' || selectedEquipment !== 'all' || selectedDifficulty !== 'all') && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersScroll}
          contentContainerStyle={styles.activeFiltersContainer}
        >
          {selectedCategory !== 'all' && (
            <Chip
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterText}
              onClose={() => setSelectedCategory('all')}
            >
              {selectedCategory}
            </Chip>
          )}
          {selectedMuscleGroup !== 'all' && (
            <Chip
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterText}
              onClose={() => setSelectedMuscleGroup('all')}
            >
              {selectedMuscleGroup}
            </Chip>
          )}
          {selectedEquipment !== 'all' && (
            <Chip
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterText}
              onClose={() => setSelectedEquipment('all')}
            >
              {selectedEquipment}
            </Chip>
          )}
          {selectedDifficulty !== 'all' && (
            <Chip
              style={styles.activeFilterChip}
              textStyle={styles.activeFilterText}
              onClose={() => setSelectedDifficulty('all')}
            >
              {selectedDifficulty}
            </Chip>
          )}
        </ScrollView>
      )}

      {/* Stats Card */}
      <Surface style={styles.statsCard} elevation={2}>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{filteredExercises.length}</Text>
            <Text style={styles.statLabel}>Exercises</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{exerciseDatabase.filter(e => e.isCustom).length}</Text>
            <Text style={styles.statLabel}>Custom</Text>
          </View>
        </View>
      </Surface>

      {/* Exercises List */}
      {viewMode === 'grid' ? (
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseGrid}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="search-off" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Browse the exercise database'}
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={renderExerciseList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="search-off" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No exercises found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Browse the exercise database'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Feature Coming Soon', 'Create custom exercise will be available soon! 🚀')}
        color="white"
      />

      {/* Modals */}
      {renderExerciseModal()}
      {renderFiltersModal()}
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    marginBottom: SPACING.md,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: SPACING.xs,
  },
  searchBar: {
    marginBottom: SPACING.md,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  filterButtonText: {
    color: 'white',
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: SPACING.xs,
  },
  viewToggleButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  activeViewToggle: {
    backgroundColor: 'white',
  },
  activeFiltersScroll: {
    paddingVertical: SPACING.sm,
  },
  activeFiltersContainer: {
    paddingHorizontal: SPACING.lg,
  },
  activeFilterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.primary,
  },
  activeFilterText: {
    color: 'white',
    fontSize: 12,
  },
  statsCard: {
    margin: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: SPACING.md,
  },
  gridContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  exerciseGridCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  exerciseImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  exerciseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    flexDirection: 'row',
  },
  favoriteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    padding: SPACING.xs,
  },
  customBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  customBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  exerciseCardContent: {
    padding: SPACING.md,
  },
  exerciseName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.sm,
    minHeight: 40,
  },
  exerciseMetrics: {
    marginBottom: SPACING.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metricText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  exerciseTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyChip: {
    height: 24,
  },
  chipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  exerciseListCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  listCardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  listExerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: SPACING.md,
  },
  listExerciseDetails: {
    flex: 1,
  },
  listExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  listExerciseName: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: SPACING.sm,
  },
  listFavoriteButton: {
    padding: SPACING.xs,
  },
  listMuscleGroups: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginBottom: SPACING.sm,
  },
  listExerciseMetrics: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  listMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  listMetricText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  listExerciseTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listDifficultyChip: {
    height: 20,
    marginRight: SPACING.sm,
  },
  listChipText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  listRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  listRatingText: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginLeft: SPACING.xs,
  },
  listCustomChip: {
    height: 20,
    backgroundColor: COLORS.primary,
  },
  listCustomChipText: {
    color: 'white',
    fontSize: 9,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    color: '#666',
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: '#999',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.md,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  modalFavoriteButton: {
    padding: SPACING.xs,
  },
  clearFiltersText: {
    color: 'white',
    fontWeight: '500',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  modalContent: {
    flex: 1,
  },
  modalExerciseImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  modalExerciseInfo: {
    padding: SPACING.lg,
  },
  modalMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  modalMetricBox: {
    alignItems: 'center',
  },
  modalMetricValue: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  modalMetricLabel: {
    ...TEXT_STYLES.caption,
    color: '#666',
    marginTop: SPACING.xs,
  },
  modalTagsSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.md,
  },
  modalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  modalDifficultyChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modalChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalCategoryChip: {
    backgroundColor: '#e8f2ff',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modalCategoryChipText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  modalEquipmentChip: {
    backgroundColor: '#f0f0f0',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modalEquipmentChipText: {
    color: '#666',
    fontSize: 12,
  },
  modalRatingSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    ...TEXT_STYLES.body,
    color: '#666',
    marginLeft: SPACING.sm,
  },
  modalMusclesSection: {
    marginBottom: SPACING.lg,
  },
  modalMusclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalMuscleChip: {
    backgroundColor: '#e8f2ff',
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modalMuscleChipText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  modalInstructionsSection: {
    marginBottom: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  instructionNumber: {
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  instructionNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    ...TEXT_STYLES.body,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  modalTipsSection: {
    marginBottom: SPACING.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipText: {
    ...TEXT_STYLES.body,
    color: '#333',
    flex: 1,
    marginLeft: SPACING.sm,
    fontStyle: 'italic',
  },
  modalActionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalActionButton: {
    flex: 0.48,
  },
  modalPrimaryButton: {
    backgroundColor: COLORS.primary,
  },
  modalActionButtonLabel: {
    fontSize: 14,
  },
  filterSection: {
    marginBottom: SPACING.lg,
  },
  filterSectionTitle: {
    ...TEXT_STYLES.body,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.md,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: '#f0f0f0',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterDivider: {
    marginVertical: SPACING.md,
  },
  filterActions: {
    padding: SPACING.lg,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyFiltersButton: {
    backgroundColor: COLORS.primary,
  },
  applyFiltersButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default ExerciseDatabase;