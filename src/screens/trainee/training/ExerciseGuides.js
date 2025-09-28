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
  FlatList,
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
  Searchbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const ExerciseGuides = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, exercises, favorites } = useSelector(state => state.training);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [favoriteExercises, setFavoriteExercises] = useState(new Set(['ex_001', 'ex_005', 'ex_009']));
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'difficulty', 'popularity'

  // Categories and filters
  const categories = [
    { id: 'all', name: 'All Exercises', icon: 'fitness-center', count: 24 },
    { id: 'strength', name: 'Strength', icon: 'fitness-center', count: 12 },
    { id: 'cardio', name: 'Cardio', icon: 'directions-run', count: 6 },
    { id: 'flexibility', name: 'Flexibility', icon: 'self-improvement', count: 4 },
    { id: 'sports', name: 'Sports Specific', icon: 'sports-soccer', count: 2 },
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];

  // Sample exercise data
  const [exerciseLibrary] = useState([
    {
      id: 'ex_001',
      name: 'Push-ups',
      category: 'strength',
      difficulty: 'beginner',
      muscleGroups: ['chest', 'shoulders', 'arms'],
      equipment: 'bodyweight',
      duration: '30 seconds',
      calories: 20,
      description: 'Classic upper body exercise that builds chest, shoulder, and tricep strength',
      instructions: [
        'Start in plank position with hands shoulder-width apart',
        'Lower your body until chest nearly touches the floor',
        'Push back up to starting position',
        'Keep your body in a straight line throughout'
      ],
      tips: [
        'Keep your core engaged',
        'Don\'t let your hips sag',
        'Control the movement - don\'t rush'
      ],
      variations: [
        { name: 'Knee Push-ups', difficulty: 'beginner' },
        { name: 'Incline Push-ups', difficulty: 'beginner' },
        { name: 'Diamond Push-ups', difficulty: 'advanced' }
      ],
      commonMistakes: [
        'Sagging hips',
        'Partial range of motion',
        'Flaring elbows too wide'
      ],
      videoUrl: 'https://example.com/pushups.mp4',
      imageUrl: 'https://example.com/pushups.jpg',
      rating: 4.8,
      popularity: 95
    },
    {
      id: 'ex_002',
      name: 'Squats',
      category: 'strength',
      difficulty: 'beginner',
      muscleGroups: ['legs', 'core'],
      equipment: 'bodyweight',
      duration: '45 seconds',
      calories: 25,
      description: 'Fundamental lower body exercise for leg and glute strength',
      instructions: [
        'Stand with feet shoulder-width apart',
        'Lower your body as if sitting back into a chair',
        'Keep your chest up and knees tracking over toes',
        'Stand back up to starting position'
      ],
      tips: [
        'Keep weight in your heels',
        'Don\'t let knees cave inward',
        'Go as low as your mobility allows'
      ],
      variations: [
        { name: 'Wall Squats', difficulty: 'beginner' },
        { name: 'Jump Squats', difficulty: 'intermediate' },
        { name: 'Pistol Squats', difficulty: 'advanced' }
      ],
      commonMistakes: [
        'Knees caving inward',
        'Leaning too far forward',
        'Not going deep enough'
      ],
      videoUrl: 'https://example.com/squats.mp4',
      imageUrl: 'https://example.com/squats.jpg',
      rating: 4.9,
      popularity: 98
    },
    {
      id: 'ex_003',
      name: 'Mountain Climbers',
      category: 'cardio',
      difficulty: 'intermediate',
      muscleGroups: ['core', 'cardio'],
      equipment: 'bodyweight',
      duration: '30 seconds',
      calories: 30,
      description: 'High-intensity cardio exercise that also strengthens the core',
      instructions: [
        'Start in plank position',
        'Alternate bringing knees toward chest',
        'Maintain steady rhythm',
        'Keep hips level throughout'
      ],
      tips: [
        'Focus on control over speed',
        'Keep core tight',
        'Breathe steadily'
      ],
      variations: [
        { name: 'Slow Mountain Climbers', difficulty: 'beginner' },
        { name: 'Cross-body Mountain Climbers', difficulty: 'intermediate' },
        { name: 'Mountain Climber Push-ups', difficulty: 'advanced' }
      ],
      commonMistakes: [
        'Moving too fast',
        'Hiking hips up',
        'Landing heavily on feet'
      ],
      videoUrl: 'https://example.com/mountain-climbers.mp4',
      imageUrl: 'https://example.com/mountain-climbers.jpg',
      rating: 4.6,
      popularity: 85
    },
    {
      id: 'ex_004',
      name: 'Plank',
      category: 'strength',
      difficulty: 'beginner',
      muscleGroups: ['core', 'shoulders'],
      equipment: 'bodyweight',
      duration: '60 seconds',
      calories: 15,
      description: 'Isometric core exercise that builds stability and strength',
      instructions: [
        'Start in push-up position',
        'Hold your body in straight line',
        'Keep core engaged',
        'Breathe steadily while holding'
      ],
      tips: [
        'Don\'t hold your breath',
        'Keep hips level',
        'Engage glutes for extra stability'
      ],
      variations: [
        { name: 'Knee Plank', difficulty: 'beginner' },
        { name: 'Side Plank', difficulty: 'intermediate' },
        { name: 'Plank with Leg Lift', difficulty: 'advanced' }
      ],
      commonMistakes: [
        'Sagging hips',
        'Holding breath',
        'Looking up instead of down'
      ],
      videoUrl: 'https://example.com/plank.mp4',
      imageUrl: 'https://example.com/plank.jpg',
      rating: 4.7,
      popularity: 92
    },
    {
      id: 'ex_005',
      name: 'Burpees',
      category: 'cardio',
      difficulty: 'advanced',
      muscleGroups: ['cardio', 'legs', 'chest', 'core'],
      equipment: 'bodyweight',
      duration: '20 seconds',
      calories: 40,
      description: 'Full-body high-intensity exercise combining strength and cardio',
      instructions: [
        'Start standing, then squat down',
        'Place hands on floor and jump feet back to plank',
        'Do a push-up (optional)',
        'Jump feet back to squat, then jump up with arms overhead'
      ],
      tips: [
        'Pace yourself - quality over speed',
        'Land softly when jumping',
        'Modify as needed'
      ],
      variations: [
        { name: 'Step-back Burpees', difficulty: 'beginner' },
        { name: 'Half Burpees', difficulty: 'intermediate' },
        { name: 'Burpee Box Jumps', difficulty: 'advanced' }
      ],
      commonMistakes: [
        'Moving too fast and losing form',
        'Skipping the push-up',
        'Landing hard on jumps'
      ],
      videoUrl: 'https://example.com/burpees.mp4',
      imageUrl: 'https://example.com/burpees.jpg',
      rating: 4.5,
      popularity: 78
    },
    {
      id: 'ex_006',
      name: 'Lunges',
      category: 'strength',
      difficulty: 'beginner',
      muscleGroups: ['legs', 'core'],
      equipment: 'bodyweight',
      duration: '40 seconds',
      calories: 22,
      description: 'Single-leg exercise that improves balance and leg strength',
      instructions: [
        'Step forward into a lunge position',
        'Lower back knee toward floor',
        'Keep front knee over ankle',
        'Push back to starting position'
      ],
      tips: [
        'Keep torso upright',
        'Don\'t let front knee go past toes',
        'Alternate legs or do one side at a time'
      ],
      variations: [
        { name: 'Reverse Lunges', difficulty: 'beginner' },
        { name: 'Walking Lunges', difficulty: 'intermediate' },
        { name: 'Jump Lunges', difficulty: 'advanced' }
      ],
      commonMistakes: [
        'Leaning too far forward',
        'Taking too small steps',
        'Not going deep enough'
      ],
      videoUrl: 'https://example.com/lunges.mp4',
      imageUrl: 'https://example.com/lunges.jpg',
      rating: 4.8,
      popularity: 88
    }
  ]);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('Success', 'Exercise library updated! 💪');
    }, 1500);
  }, []);

  const toggleFavorite = useCallback((exerciseId) => {
    setFavoriteExercises(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(exerciseId)) {
        newFavorites.delete(exerciseId);
      } else {
        newFavorites.add(exerciseId);
        Vibration.vibrate(50);
      }
      return newFavorites;
    });
  }, []);

  const filterExercises = useCallback(() => {
    let filtered = [...exerciseLibrary];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscleGroups.some(muscle => 
          muscle.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    // Muscle group filter
    if (selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(exercise => 
        exercise.muscleGroups.includes(selectedMuscleGroup)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'popularity':
          return b.popularity - a.popularity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [exerciseLibrary, searchQuery, selectedCategory, selectedDifficulty, selectedMuscleGroup, sortBy]);

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.primary;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'strength': return 'fitness-center';
      case 'cardio': return 'directions-run';
      case 'flexibility': return 'self-improvement';
      case 'sports': return 'sports-soccer';
      default: return 'fitness-center';
    }
  };

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
          <View style={styles.headerActions}>
            <IconButton
              icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
              iconColor="white"
              size={24}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            />
            <IconButton
              icon="tune"
              iconColor="white"
              size={24}
              onPress={() => setShowFiltersModal(true)}
            />
          </View>
        </View>
        
        <Text style={styles.headerTitle}>Exercise Guides</Text>
        <Text style={styles.headerSubtitle}>
          Master proper form with detailed instructions
        </Text>
        
        <Searchbar
          placeholder="Search exercises..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>
    </LinearGradient>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryCard,
              selectedCategory === category.id && styles.categoryCardSelected
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <LinearGradient
              colors={selectedCategory === category.id 
                ? ['#667eea', '#764ba2'] 
                : ['transparent', 'transparent']
              }
              style={styles.categoryGradient}
            >
              <Icon
                name={category.icon}
                size={24}
                color={selectedCategory === category.id ? 'white' : COLORS.primary}
              />
              <Text style={[
                styles.categoryName,
                selectedCategory === category.id && styles.categoryNameSelected
              ]}>
                {category.name}
              </Text>
              <Text style={[
                styles.categoryCount,
                selectedCategory === category.id && styles.categoryCountSelected
              ]}>
                {category.count} exercises
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderExerciseCard = ({ item }) => (
    <Animated.View
      style={[
        viewMode === 'grid' ? styles.exerciseCardGrid : styles.exerciseCardList,
        { opacity: fadeAnim }
      ]}
    >
      <Card
        style={styles.exerciseCard}
        onPress={() => {
          setSelectedExercise(item);
          setShowExerciseModal(true);
          Vibration.vibrate(50);
        }}
      >
        <View style={styles.exerciseImageContainer}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)']}
            style={styles.exerciseImagePlaceholder}
          >
            <Icon name={getCategoryIcon(item.category)} size={48} color="white" />
          </LinearGradient>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Icon
              name={favoriteExercises.has(item.id) ? 'favorite' : 'favorite-border'}
              size={20}
              color={favoriteExercises.has(item.id) ? COLORS.error : 'white'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.exerciseContent}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.exerciseTags}>
            <Chip
              mode="flat"
              style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
              textStyle={styles.chipText}
              compact
            >
              {item.difficulty}
            </Chip>
            <View style={styles.exerciseStats}>
              <Icon name="whatshot" size={16} color={COLORS.error} />
              <Text style={styles.statText}>{item.calories} cal</Text>
            </View>
          </View>

          <View style={styles.muscleGroups}>
            {item.muscleGroups.slice(0, 3).map((muscle, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.muscleChip}
                textStyle={styles.muscleChipText}
                compact
              >
                {muscle}
              </Chip>
            ))}
            {item.muscleGroups.length > 3 && (
              <Text style={styles.moreText}>+{item.muscleGroups.length - 3}</Text>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );

  const renderExerciseModal = () => (
    <Portal>
      <Modal
        visible={showExerciseModal}
        onDismiss={() => setShowExerciseModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView intensity={100} style={styles.modalBlur}>
          <Card style={styles.exerciseDetailCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedExercise && (
                <>
                  <View style={styles.modalHeader}>
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.modalHeaderGradient}
                    >
                      <View style={styles.modalHeaderTop}>
                        <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                        <IconButton
                          icon="close"
                          iconColor="white"
                          onPress={() => setShowExerciseModal(false)}
                        />
                      </View>
                      
                      <View style={styles.modalHeaderInfo}>
                        <View style={styles.modalStat}>
                          <Icon name="schedule" size={20} color="white" />
                          <Text style={styles.modalStatText}>{selectedExercise.duration}</Text>
                        </View>
                        <View style={styles.modalStat}>
                          <Icon name="whatshot" size={20} color="white" />
                          <Text style={styles.modalStatText}>{selectedExercise.calories} cal</Text>
                        </View>
                        <View style={styles.modalStat}>
                          <Icon name="star" size={20} color="white" />
                          <Text style={styles.modalStatText}>{selectedExercise.rating}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>

                  <View style={styles.modalContent}>
                    <Text style={styles.exerciseFullDescription}>
                      {selectedExercise.description}
                    </Text>

                    {/* Instructions */}
                    <View style={styles.instructionsSection}>
                      <Text style={styles.sectionTitle}>Instructions</Text>
                      {selectedExercise.instructions.map((instruction, index) => (
                        <View key={index} style={styles.instructionItem}>
                          <View style={styles.instructionNumber}>
                            <Text style={styles.instructionNumberText}>{index + 1}</Text>
                          </View>
                          <Text style={styles.instructionText}>{instruction}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Pro Tips */}
                    <Surface style={styles.tipsSection}>
                      <View style={styles.tipsSectionHeader}>
                        <Icon name="lightbulb-outline" size={24} color={COLORS.primary} />
                        <Text style={styles.sectionTitle}>Pro Tips</Text>
                      </View>
                      {selectedExercise.tips.map((tip, index) => (
                        <View key={index} style={styles.tipItem}>
                          <Icon name="check-circle" size={16} color={COLORS.success} />
                          <Text style={styles.tipText}>{tip}</Text>
                        </View>
                      ))}
                    </Surface>

                    {/* Common Mistakes */}
                    <Surface style={styles.mistakesSection}>
                      <View style={styles.mistakesSectionHeader}>
                        <Icon name="warning" size={24} color={COLORS.error} />
                        <Text style={styles.sectionTitle}>Common Mistakes</Text>
                      </View>
                      {selectedExercise.commonMistakes.map((mistake, index) => (
                        <View key={index} style={styles.mistakeItem}>
                          <Icon name="cancel" size={16} color={COLORS.error} />
                          <Text style={styles.mistakeText}>{mistake}</Text>
                        </View>
                      ))}
                    </Surface>

                    {/* Variations */}
                    <View style={styles.variationsSection}>
                      <Text style={styles.sectionTitle}>Variations</Text>
                      {selectedExercise.variations.map((variation, index) => (
                        <View key={index} style={styles.variationItem}>
                          <Text style={styles.variationName}>{variation.name}</Text>
                          <Chip
                            mode="flat"
                            style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(variation.difficulty) }]}
                            textStyle={styles.chipText}
                            compact
                          >
                            {variation.difficulty}
                          </Chip>
                        </View>
                      ))}
                    </View>

                    <View style={styles.modalActions}>
                      <Button
                        mode="outlined"
                        icon="play-circle"
                        onPress={() => {
                          Alert.alert('Feature Coming Soon', 'Video demonstrations will be available in the next update! 🎬');
                        }}
                        style={styles.modalButton}
                      >
                        Watch Video
                      </Button>
                      <Button
                        mode="contained"
                        icon="fitness-center"
                        onPress={() => {
                          setShowExerciseModal(false);
                          navigation.navigate('DrillPractice', { exercise: selectedExercise });
                        }}
                        style={styles.modalButton}
                      >
                        Practice Now
                      </Button>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFiltersModal}
        onDismiss={() => setShowFiltersModal(false)}
        contentContainerStyle={styles.filtersModalContainer}
      >
        <Card style={styles.filtersCard}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filter & Sort</Text>
            <IconButton
              icon="close"
              onPress={() => setShowFiltersModal(false)}
            />
          </View>

          <ScrollView style={styles.filtersContent}>
            {/* Difficulty Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Difficulty</Text>
              <View style={styles.filterOptions}>
                <Chip
                  mode={selectedDifficulty === 'all' ? 'flat' : 'outlined'}
                  style={selectedDifficulty === 'all' && styles.selectedFilter}
                  onPress={() => setSelectedDifficulty('all')}
                  compact
                >
                  All
                </Chip>
                {difficulties.map((difficulty) => (
                  <Chip
                    key={difficulty}
                    mode={selectedDifficulty === difficulty ? 'flat' : 'outlined'}
                    style={selectedDifficulty === difficulty && styles.selectedFilter}
                    onPress={() => setSelectedDifficulty(difficulty)}
                    compact
                  >
                    {difficulty}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Muscle Group Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Muscle Group</Text>
              <View style={styles.filterOptions}>
                <Chip
                  mode={selectedMuscleGroup === 'all' ? 'flat' : 'outlined'}
                  style={selectedMuscleGroup === 'all' && styles.selectedFilter}
                  onPress={() => setSelectedMuscleGroup('all')}
                  compact
                >
                  All
                </Chip>
                {muscleGroups.map((muscle) => (
                  <Chip
                    key={muscle}
                    mode={selectedMuscleGroup === muscle ? 'flat' : 'outlined'}
                    style={selectedMuscleGroup === muscle && styles.selectedFilter}
                    onPress={() => setSelectedMuscleGroup(muscle)}
                    compact
                  >
                    {muscle}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.filterOptions}>
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'difficulty', label: 'Difficulty' },
                  { key: 'popularity', label: 'Popularity' }
                ].map((option) => (
                  <Chip
                    key={option.key}
                    mode={sortBy === option.key ? 'flat' : 'outlined'}
                    style={sortBy === option.key && styles.selectedFilter}
                    onPress={() => setSortBy(option.key)}
                    compact
                  >
                    {option.label}
                  </Chip>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filtersActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setSelectedDifficulty('all');
                setSelectedMuscleGroup('all');
                setSortBy('name');
              }}
              style={styles.filterButton}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowFiltersModal(false)}
              style={styles.filterButton}
            >
              Apply Filters
            </Button>
          </View>
        </Card>
      </Modal>
    </Portal>
  );

  const filteredExercises = filterExercises();

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
        {renderCategories()}
        
        <View style={styles.content}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filteredExercises.length} exercises found
            </Text>
            {favoriteExercises.size > 0 && (
              <TouchableOpacity
                style={styles.favoritesButton}
                onPress={() => {
                  const favoritesList = exerciseLibrary.filter(ex => favoriteExercises.has(ex.id));
                  Alert.alert(
                    'Favorite Exercises',
                    `You have ${favoritesList.length} favorite exercises: ${favoritesList.map(ex => ex.name).join(', ')}`
                  );
                }}
              >
                <Icon name="favorite" size={16} color={COLORS.error} />
                <Text style={styles.favoritesText}>{favoriteExercises.size}</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseCard}
            keyExtractor={(item) => item.id}
            numColumns={viewMode === 'grid' ? 2 : 1}
            key={viewMode}
            contentContainerStyle={styles.exercisesList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {renderExerciseModal()}
      {renderFiltersModal()}

      <FAB
        icon="favorite"
        style={[styles.fab, { backgroundColor: COLORS.error }]}
        onPress={() => {
          const favoritesList = exerciseLibrary.filter(ex => favoriteExercises.has(ex.id));
          if (favoritesList.length > 0) {
            navigation.navigate('FavoriteExercises', { exercises: favoritesList });
          } else {
            Alert.alert('No Favorites', 'Start adding exercises to your favorites! ❤️');
          }
        }}
        label="Favorites"
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
  headerActions: {
    flexDirection: 'row',
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
  searchBar: {
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 4,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoriesContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoryCard: {
    marginRight: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  categoryCardSelected: {
    elevation: 6,
  },
  categoryGradient: {
    padding: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderRadius: 12,
    minWidth: 120,
    backgroundColor: COLORS.surface,
  },
  categoryName: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: 'white',
  },
  categoryCount: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  categoryCountSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: SPACING.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultsCount: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  favoritesText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    fontWeight: '600',
  },
  exercisesList: {
    paddingBottom: 100,
  },
  exerciseCardGrid: {
    flex: 1,
    margin: SPACING.xs,
  },
  exerciseCardList: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  exerciseCard: {
    borderRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  exerciseImageContainer: {
    position: 'relative',
  },
  exerciseImagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseContent: {
    padding: SPACING.md,
  },
  exerciseName: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  exerciseDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  exerciseTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  difficultyChip: {
    height: 24,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  muscleChip: {
    height: 20,
    backgroundColor: 'transparent',
    borderColor: COLORS.primary,
  },
  muscleChipText: {
    color: COLORS.primary,
    fontSize: 10,
  },
  moreText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
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
  exerciseDetailCard: {
    width: width - SPACING.xl * 2,
    maxHeight: height * 0.9,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    marginBottom: SPACING.lg,
  },
  modalHeaderGradient: {
    padding: SPACING.lg,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },
  modalHeaderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  modalStatText: {
    ...TEXT_STYLES.body,
    color: 'white',
    fontWeight: '600',
  },
  modalContent: {
    padding: SPACING.lg,
  },
  exerciseFullDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  instructionsSection: {
    marginBottom: SPACING.xl,
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
  tipsSection: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xl,
  },
  tipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  mistakesSection: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xl,
  },
  mistakesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  mistakeText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  variationsSection: {
    marginBottom: SPACING.xl,
  },
  variationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  variationName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalButton: {
    flex: 1,
  },
  filtersModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  filtersCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filtersTitle: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
  },
  filtersContent: {
    padding: SPACING.lg,
    maxHeight: height * 0.5,
  },
  filterSection: {
    marginBottom: SPACING.xl,
  },
  filterLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  selectedFilter: {
    backgroundColor: COLORS.primary,
  },
  filtersActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  filterButton: {
    flex: 1,
  },
});

export default ExerciseGuides;