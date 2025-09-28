import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Vibration,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
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
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WorkoutLibrary = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [favoriteWorkouts, setFavoriteWorkouts] = useState(new Set());
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const workouts = useSelector(state => state.training.workouts) || [];
  const isLoading = useSelector(state => state.training.loading);

  // Animation on mount
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

  // Focus effect
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  // Load workouts
  const loadWorkouts = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        // Mock data would be loaded here
      }, 1000);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  }, []);

  // Workout categories
  const categories = [
    { id: 'all', name: 'All Workouts', icon: 'fitness-center', color: COLORS.primary },
    { id: 'strength', name: 'Strength', icon: 'fitness-center', color: COLORS.error },
    { id: 'cardio', name: 'Cardio', icon: 'directions-run', color: COLORS.success },
    { id: 'flexibility', name: 'Flexibility', icon: 'self-improvement', color: COLORS.warning },
    { id: 'sports', name: 'Sports Skills', icon: 'sports-soccer', color: COLORS.secondary },
    { id: 'recovery', name: 'Recovery', icon: 'spa', color: COLORS.info },
  ];

  // Mock workout data
  const mockWorkouts = [
    {
      id: 1,
      title: 'Beginner Football Drills',
      category: 'sports',
      difficulty: 'beginner',
      duration: 30,
      description: 'Basic football skills for young players',
      exercises: [
        'Ball juggling', 'Cone dribbling', 'Passing accuracy', 'Basic shooting'
      ],
      equipment: ['Football', 'Cones', 'Goals'],
      calories: 180,
      rating: 4.5,
      image: '⚽',
      coach: 'Coach Martinez',
      tags: ['Football', 'Skills', 'Youth'],
      completed: false,
      isFavorite: false,
      videoUrl: null,
    },
    {
      id: 2,
      title: 'Youth Cardio Blast',
      category: 'cardio',
      difficulty: 'intermediate',
      duration: 25,
      description: 'High-energy cardio workout for kids and teens',
      exercises: [
        'Jumping jacks', 'High knees', 'Burpees', 'Mountain climbers'
      ],
      equipment: ['None'],
      calories: 200,
      rating: 4.3,
      image: '🏃',
      coach: 'Trainer Johnson',
      tags: ['Cardio', 'No Equipment', 'Energy'],
      completed: true,
      isFavorite: true,
      videoUrl: 'demo_video.mp4',
    },
    {
      id: 3,
      title: 'Flexibility & Mobility',
      category: 'flexibility',
      difficulty: 'beginner',
      duration: 20,
      description: 'Essential stretches for young athletes',
      exercises: [
        'Dynamic warm-up', 'Leg stretches', 'Arm circles', 'Cool-down stretches'
      ],
      equipment: ['Yoga mat'],
      calories: 80,
      rating: 4.7,
      image: '🧘',
      coach: 'Coach Rodriguez',
      tags: ['Stretching', 'Recovery', 'Mobility'],
      completed: false,
      isFavorite: false,
      videoUrl: 'flexibility_demo.mp4',
    },
    {
      id: 4,
      title: 'Core Strength Builder',
      category: 'strength',
      difficulty: 'intermediate',
      duration: 20,
      description: 'Build core strength with fun exercises',
      exercises: [
        'Plank variations', 'Bicycle crunches', 'Bear crawls', 'Dead bugs'
      ],
      equipment: ['None'],
      calories: 150,
      rating: 4.2,
      image: '💪',
      coach: 'Trainer Johnson',
      tags: ['Core', 'Strength', 'Bodyweight'],
      completed: false,
      isFavorite: true,
      videoUrl: null,
    },
    {
      id: 5,
      title: 'Basketball Skills Training',
      category: 'sports',
      difficulty: 'intermediate',
      duration: 40,
      description: 'Develop basketball fundamentals',
      exercises: [
        'Dribbling drills', 'Shooting practice', 'Defensive stance', 'Layup techniques'
      ],
      equipment: ['Basketball', 'Hoop', 'Cones'],
      calories: 220,
      rating: 4.6,
      image: '🏀',
      coach: 'Coach Thompson',
      tags: ['Basketball', 'Skills', 'Team Sports'],
      completed: false,
      isFavorite: false,
      videoUrl: 'basketball_demo.mp4',
    },
    {
      id: 6,
      title: 'Active Recovery Session',
      category: 'recovery',
      difficulty: 'beginner',
      duration: 15,
      description: 'Light movement for recovery days',
      exercises: [
        'Gentle walking', 'Light stretching', 'Breathing exercises', 'Foam rolling'
      ],
      equipment: ['Foam roller'],
      calories: 60,
      rating: 4.4,
      image: '🌱',
      coach: 'Coach Rodriguez',
      tags: ['Recovery', 'Wellness', 'Light'],
      completed: true,
      isFavorite: false,
      videoUrl: null,
    },
  ];

  // Filter workouts
  const getFilteredWorkouts = () => {
    let filtered = mockWorkouts;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(workout => workout.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(workout => workout.difficulty === selectedDifficulty);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(workout =>
        workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  // Handle workout selection
  const handleWorkoutSelect = (workout) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
    Vibration.vibrate(50);
  };

  // Toggle favorite
  const toggleFavorite = (workoutId) => {
    const newFavorites = new Set(favoriteWorkouts);
    if (newFavorites.has(workoutId)) {
      newFavorites.delete(workoutId);
    } else {
      newFavorites.add(workoutId);
    }
    setFavoriteWorkouts(newFavorites);
    Vibration.vibrate(50);
  };

  // Handle workout action
  const handleWorkoutAction = (action) => {
    Vibration.vibrate(50);
    switch (action) {
      case 'start':
        navigation.navigate('WorkoutSession', { workoutId: selectedWorkout.id });
        break;
      case 'preview':
        Alert.alert('Video Preview', 'Feature coming soon! 🎥');
        break;
      case 'details':
        navigation.navigate('WorkoutDetails', { workoutId: selectedWorkout.id });
        break;
      case 'add_to_plan':
        Alert.alert('Add to Plan', 'Feature coming soon! 📋');
        break;
      default:
        Alert.alert('Action', 'Feature in development! ⚙️');
    }
    setModalVisible(false);
  };

  // Render category filters
  const renderCategoryFilters = () => (
    <View style={styles.categoryContainer}>
      <Text style={styles.filterTitle}>Categories 🎯</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.8}
          >
            <Surface
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.activeCategoryCard,
                { borderColor: category.color }
              ]}
              elevation={selectedCategory === category.id ? 4 : 2}
            >
              <Icon
                name={category.icon}
                size={24}
                color={selectedCategory === category.id ? 'white' : category.color}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render difficulty filter
  const renderDifficultyFilter = () => (
    <View style={styles.difficultyContainer}>
      <Text style={styles.filterTitle}>Difficulty Level 📈</Text>
      <View style={styles.difficultyChips}>
        {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
          <Chip
            key={level}
            selected={selectedDifficulty === level}
            onPress={() => setSelectedDifficulty(level)}
            style={[
              styles.difficultyChip,
              selectedDifficulty === level && styles.activeDifficultyChip
            ]}
            textStyle={[
              styles.difficultyChipText,
              selectedDifficulty === level && styles.activeDifficultyChipText
            ]}
            compact
          >
            {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
          </Chip>
        ))}
      </View>
    </View>
  );

  // Render workout card
  const renderWorkoutCard = ({ item: workout }) => {
    const difficultyColors = {
      beginner: COLORS.success,
      intermediate: COLORS.warning,
      advanced: COLORS.error,
    };

    const category = categories.find(cat => cat.id === workout.category);
    const isFavorite = favoriteWorkouts.has(workout.id);

    return (
      <TouchableOpacity
        onPress={() => handleWorkoutSelect(workout)}
        activeOpacity={0.8}
      >
        <Card style={[styles.workoutCard, workout.completed && styles.completedWorkoutCard]}>
          <Card.Content>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutInfo}>
                <View style={styles.workoutTitleRow}>
                  <Text style={styles.workoutEmoji}>{workout.image}</Text>
                  <View style={styles.workoutTitleContainer}>
                    <Text style={styles.workoutTitle} numberOfLines={2}>
                      {workout.title}
                    </Text>
                    <Text style={styles.workoutCoach}>by {workout.coach}</Text>
                  </View>
                </View>
                <Text style={styles.workoutDescription} numberOfLines={2}>
                  {workout.description}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(workout.id)}
                style={styles.favoriteButton}
              >
                <Icon
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={24}
                  color={isFavorite ? COLORS.error : COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{workout.duration}min</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="local-fire-department" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{workout.calories} cal</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>{workout.rating}</Text>
              </View>
              <Chip
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: difficultyColors[workout.difficulty] + '20' }
                ]}
                textStyle={[
                  styles.difficultyBadgeText,
                  { color: difficultyColors[workout.difficulty] }
                ]}
                compact
              >
                {workout.difficulty}
              </Chip>
            </View>

            <View style={styles.workoutTags}>
              {workout.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  style={styles.tagChip}
                  textStyle={styles.tagText}
                  compact
                >
                  {tag}
                </Chip>
              ))}
            </View>

            {workout.completed && (
              <View style={styles.completedBadge}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.completedText}>Completed! ✓</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  // Render workout modal
  const renderWorkoutModal = () => {
    if (!selectedWorkout) return null;

    const category = categories.find(cat => cat.id === selectedWorkout.category);
    const difficultyColors = {
      beginner: COLORS.success,
      intermediate: COLORS.warning,
      advanced: COLORS.error,
    };

    return (
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
            <Surface style={styles.modalContent} elevation={8}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalEmoji}>{selectedWorkout.image}</Text>
                  <View>
                    <Text style={styles.modalTitle}>{selectedWorkout.title}</Text>
                    <Text style={styles.modalCoach}>by {selectedWorkout.coach}</Text>
                  </View>
                </View>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalDescription}>{selectedWorkout.description}</Text>

                <View style={styles.modalStatsGrid}>
                  <View style={styles.modalStatItem}>
                    <Icon name="schedule" size={20} color={COLORS.primary} />
                    <Text style={styles.modalStatText}>{selectedWorkout.duration} minutes</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Icon name="local-fire-department" size={20} color={COLORS.error} />
                    <Text style={styles.modalStatText}>{selectedWorkout.calories} calories</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Icon name="trending-up" size={20} color={difficultyColors[selectedWorkout.difficulty]} />
                    <Text style={styles.modalStatText}>{selectedWorkout.difficulty}</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Icon name="star" size={20} color="#FFD700" />
                    <Text style={styles.modalStatText}>{selectedWorkout.rating}/5.0</Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Exercises ({selectedWorkout.exercises.length}) 💪</Text>
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <View key={index} style={styles.exerciseItem}>
                      <View style={styles.exerciseNumber}>
                        <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.exerciseText}>{exercise}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Equipment Needed 🎯</Text>
                  <View style={styles.equipmentContainer}>
                    {selectedWorkout.equipment.map((item, index) => (
                      <Chip
                        key={index}
                        style={styles.equipmentChip}
                        textStyle={styles.equipmentChipText}
                        compact
                      >
                        {item}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Tags 🏷️</Text>
                  <View style={styles.tagsContainer}>
                    {selectedWorkout.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        style={styles.modalTagChip}
                        textStyle={styles.modalTagText}
                        compact
                      >
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                {!selectedWorkout.completed ? (
                  <Button
                    mode="contained"
                    onPress={() => handleWorkoutAction('start')}
                    style={[styles.actionButton, styles.primaryButton]}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.primaryButtonText}
                  >
                    Start Workout 🚀
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => handleWorkoutAction('start')}
                    style={[styles.actionButton, styles.completedButton]}
                    contentStyle={styles.buttonContent}
                  >
                    Do Again 🔄
                  </Button>
                )}
                
                <View style={styles.secondaryActions}>
                  {selectedWorkout.videoUrl && (
                    <Button
                      mode="outlined"
                      onPress={() => handleWorkoutAction('preview')}
                      style={styles.secondaryButton}
                      contentStyle={styles.smallButtonContent}
                    >
                      Preview 🎥
                    </Button>
                  )}
                  <Button
                    mode="outlined"
                    onPress={() => handleWorkoutAction('add_to_plan')}
                    style={styles.secondaryButton}
                    contentStyle={styles.smallButtonContent}
                  >
                    Add to Plan 📋
                  </Button>
                </View>
              </View>
            </Surface>
          </BlurView>
        </Modal>
      </Portal>
    );
  };

  // Render featured workouts
  const renderFeaturedWorkouts = () => {
    const featuredWorkouts = mockWorkouts.filter(workout => workout.rating >= 4.5).slice(0, 3);
    
    return (
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Workouts ⭐</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScrollContent}
        >
          {featuredWorkouts.map(workout => (
            <TouchableOpacity
              key={workout.id}
              onPress={() => handleWorkoutSelect(workout)}
              activeOpacity={0.8}
            >
              <Card style={styles.featuredCard}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.featuredGradient}
                >
                  <Text style={styles.featuredEmoji}>{workout.image}</Text>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {workout.title}
                  </Text>
                  <Text style={styles.featuredDuration}>{workout.duration} min</Text>
                  <View style={styles.featuredRating}>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={styles.featuredRatingText}>{workout.rating}</Text>
                  </View>
                </LinearGradient>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const filteredWorkouts = getFilteredWorkouts();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.headerTitle}>Workout Library 📚</Text>
          <Text style={styles.headerSubtitle}>
            Discover amazing workouts for every goal! 💪
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderFeaturedWorkouts()}
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search workouts, exercises, or coaches..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
          />
        </View>

        {renderCategoryFilters()}
        {renderDifficultyFilter()}

        <View style={styles.workoutsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Workouts' : 
             categories.find(cat => cat.id === selectedCategory)?.name} 
            ({filteredWorkouts.length})
          </Text>
          
          {filteredWorkouts.length > 0 ? (
            <FlatList
              data={filteredWorkouts}
              renderItem={renderWorkoutCard}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <View style={styles.emptyState}>
                  <Icon name="fitness-center" size={48} color={COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>No workouts found</Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery ? 'Try adjusting your search or filters' : 'New workouts coming soon!'}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>

      {renderWorkoutModal()}

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Create Workout', 'Feature coming soon! 🚀')}
        customSize={56}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: 'white',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  featuredSection: {
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  featuredScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  featuredCard: {
    width: 150,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
  },
  featuredGradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredEmoji: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  featuredTitle: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  featuredDuration: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  featuredRatingText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginLeft: 2,
    fontSize: 12,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchBar: {
    backgroundColor: 'white',
    elevation: 2,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  filterTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  categoryScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  categoryCard: {
    width: 100,
    height: 80,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCategoryCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontSize: 11,
  },
  activeCategoryText: {
    color: 'white',
    fontWeight: '600',
  },
  difficultyContainer: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  difficultyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  difficultyChip: {
    backgroundColor: COLORS.surface,
  },
  activeDifficultyChip: {
    backgroundColor: COLORS.secondary,
  },
  difficultyChipText: {
    ...TEXT_STYLES.caption,
  },
  activeDifficultyChipText: {
    color: 'white',
    fontWeight: '600',
  },
  workoutsContainer: {
    padding: SPACING.md,
  },
  workoutCard: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  completedWorkoutCard: {
    backgroundColor: COLORS.success + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  workoutEmoji: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  workoutCoach: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  workoutDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  difficultyBadge: {
    backgroundColor: 'transparent',
    marginLeft: 'auto',
  },
  difficultyBadgeText: {
    ...TEXT_STYLES.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  workoutTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  tagChip: {
    backgroundColor: COLORS.primary + '15',
    height: 24,
  },
  tagText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontSize: 10,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completedText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  emptyCard: {
    marginVertical: SPACING.xl,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth - 40,
    maxHeight: screenHeight * 0.9,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
  },
  modalCoach: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  modalBody: {
    maxHeight: screenHeight * 0.6,
    padding: SPACING.lg,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  modalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.md,
  },
  modalStatText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: SPACING.xl,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingRight: SPACING.md,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  exerciseNumberText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontWeight: 'bold',
  },
  exerciseText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    flex: 1,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  equipmentChip: {
    backgroundColor: COLORS.warning + '20',
  },
  equipmentChipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modalTagChip: {
    backgroundColor: COLORS.secondary + '20',
  },
  modalTagText: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
  },
  modalActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  completedButton: {
    backgroundColor: COLORS.success,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: COLORS.primary,
  },
  smallButtonContent: {
    paddingVertical: SPACING.xs,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default WorkoutLibrary;