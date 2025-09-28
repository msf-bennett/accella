import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
  Portal,
  Modal,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const AlternativeExercises = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { user, exercises, isLoading } = useSelector(state => state.training);
  
  // Get original exercise from route params
  const { originalExercise, exerciseId, sessionId } = route.params || {};
  
  // Component state
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [alternatives, setAlternatives] = useState([]);
  const [filteredAlternatives, setFilteredAlternatives] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(-50);

  // Exercise categories for filtering
  const categories = [
    { id: 'all', label: 'All', icon: 'fitness-center' },
    { id: 'strength', label: 'Strength', icon: 'fitness-center' },
    { id: 'cardio', label: 'Cardio', icon: 'directions-run' },
    { id: 'flexibility', label: 'Flexibility', icon: 'self-improvement' },
    { id: 'bodyweight', label: 'Bodyweight', icon: 'accessibility' },
    { id: 'equipment', label: 'Equipment', icon: 'sports-gymnastics' },
  ];

  // Mock alternative exercises data
  const mockAlternatives = [
    {
      id: 1,
      name: 'Push-ups (Modified)',
      category: 'bodyweight',
      difficulty: 'Beginner',
      duration: '3 sets x 12 reps',
      equipment: 'None',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      instructions: 'Perform push-ups on knees instead of toes for reduced difficulty.',
      videoUrl: 'https://example.com/pushup-modified',
      calories: 45,
      rating: 4.2,
      substitutionReason: 'Lower intensity alternative'
    },
    {
      id: 2,
      name: 'Incline Push-ups',
      category: 'bodyweight',
      difficulty: 'Beginner',
      duration: '3 sets x 15 reps',
      equipment: 'Bench/Elevated surface',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      instructions: 'Place hands on elevated surface, perform push-up motion.',
      videoUrl: 'https://example.com/incline-pushups',
      calories: 35,
      rating: 4.5,
      substitutionReason: 'Easier angle variation'
    },
    {
      id: 3,
      name: 'Resistance Band Chest Press',
      category: 'equipment',
      difficulty: 'Intermediate',
      duration: '3 sets x 12 reps',
      equipment: 'Resistance Band',
      targetMuscles: ['Chest', 'Shoulders'],
      instructions: 'Anchor band behind you, press forward with controlled motion.',
      videoUrl: 'https://example.com/band-chest-press',
      calories: 50,
      rating: 4.0,
      substitutionReason: 'Equipment-based alternative'
    },
    {
      id: 4,
      name: 'Wall Push-ups',
      category: 'bodyweight',
      difficulty: 'Beginner',
      duration: '3 sets x 20 reps',
      equipment: 'Wall',
      targetMuscles: ['Chest', 'Shoulders'],
      instructions: 'Stand arm\'s length from wall, lean in and push back.',
      videoUrl: 'https://example.com/wall-pushups',
      calories: 25,
      rating: 3.8,
      substitutionReason: 'Lowest intensity option'
    },
    {
      id: 5,
      name: 'Dumbbell Chest Press',
      category: 'equipment',
      difficulty: 'Intermediate',
      duration: '3 sets x 10 reps',
      equipment: 'Dumbbells',
      targetMuscles: ['Chest', 'Shoulders', 'Triceps'],
      instructions: 'Lie on bench, press dumbbells up and together.',
      videoUrl: 'https://example.com/dumbbell-press',
      calories: 65,
      rating: 4.7,
      substitutionReason: 'Weight-based variation'
    },
  ];

  useEffect(() => {
    // Animate screen entrance
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

    // Load alternative exercises
    loadAlternatives();
  }, []);

  useEffect(() => {
    // Filter exercises based on search and category
    filterExercises();
  }, [searchQuery, selectedCategory, alternatives]);

  const loadAlternatives = useCallback(async () => {
    try {
      // In real implementation, this would fetch from API based on original exercise
      setAlternatives(mockAlternatives);
    } catch (error) {
      Alert.alert('Error', 'Failed to load alternative exercises');
    }
  }, []);

  const filterExercises = useCallback(() => {
    let filtered = alternatives;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.targetMuscles.some(muscle => 
          muscle.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredAlternatives(filtered);
  }, [alternatives, searchQuery, selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAlternatives();
    setRefreshing(false);
    Vibration.vibrate(50);
  }, [loadAlternatives]);

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setShowPreview(true);
    Vibration.vibrate([0, 50, 100, 50]);
  };

  const handleReplaceExercise = () => {
    if (selectedExercise) {
      // Dispatch action to replace exercise in workout
      Alert.alert(
        'Exercise Replaced! 🎉',
        `${originalExercise?.name || 'Original exercise'} has been replaced with ${selectedExercise.name}`,
        [
          {
            text: 'Continue Training',
            onPress: () => {
              setShowPreview(false);
              navigation.goBack();
            }
          }
        ]
      );
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return COLORS.success;
      case 'intermediate':
        return COLORS.warning;
      case 'advanced':
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  const renderCategoryChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => {
            setSelectedCategory(category.id);
            Vibration.vibrate(30);
          }}
        >
          <Surface style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.selectedCategoryChip
          ]}>
            <Icon 
              name={category.icon} 
              size={20} 
              color={selectedCategory === category.id ? COLORS.white : COLORS.primary}
              style={styles.categoryIcon}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText
            ]}>
              {category.label}
            </Text>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderExerciseCard = ({ item: exercise }) => (
    <Animated.View 
      style={[
        styles.cardContainer,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <Card style={styles.exerciseCard} onPress={() => handleExerciseSelect(exercise)}>
        <LinearGradient
          colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.substitutionReason}>
                💡 {exercise.substitutionReason}
              </Text>
            </View>
            <Surface style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(exercise.difficulty) + '20' }
            ]}>
              <Text style={[
                styles.difficultyText,
                { color: getDifficultyColor(exercise.difficulty) }
              ]}>
                {exercise.difficulty}
              </Text>
            </Surface>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.exerciseDetails}>
              <View style={styles.detailRow}>
                <Icon name="timer" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{exercise.duration}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{exercise.equipment}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="local-fire-department" size={16} color={COLORS.error} />
                <Text style={styles.detailText}>{exercise.calories} cal</Text>
              </View>
            </View>

            <View style={styles.targetMuscles}>
              <Text style={styles.musclesLabel}>Target Muscles:</Text>
              <View style={styles.muscleChips}>
                {exercise.targetMuscles.slice(0, 3).map((muscle, index) => (
                  <Chip
                    key={index}
                    mode="outlined"
                    compact
                    textStyle={styles.muscleChipText}
                    style={styles.muscleChip}
                  >
                    {muscle}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>{exercise.rating}</Text>
              </View>
              <Button
                mode="contained"
                compact
                onPress={() => handleExerciseSelect(exercise)}
                style={styles.previewButton}
                labelStyle={styles.previewButtonText}
              >
                Preview
              </Button>
            </View>
          </View>
        </LinearGradient>
      </Card>
    </Animated.View>
  );

  const renderExercisePreview = () => (
    <Portal>
      <Modal
        visible={showPreview}
        onDismiss={() => setShowPreview(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          {selectedExercise && (
            <Surface style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>{selectedExercise.name}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowPreview(false)}
                />
              </View>

              <ScrollView style={styles.previewContent}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.previewImagePlaceholder}
                >
                  <Icon name="play-circle-filled" size={60} color={COLORS.white} />
                  <Text style={styles.videoPlaceholderText}>
                    Tap to watch demo video
                  </Text>
                </LinearGradient>

                <View style={styles.previewDetails}>
                  <Text style={styles.previewInstructions}>
                    {selectedExercise.instructions}
                  </Text>

                  <View style={styles.previewStats}>
                    <Surface style={styles.statCard}>
                      <Icon name="timer" size={20} color={COLORS.primary} />
                      <Text style={styles.statLabel}>Duration</Text>
                      <Text style={styles.statValue}>{selectedExercise.duration}</Text>
                    </Surface>
                    <Surface style={styles.statCard}>
                      <Icon name="local-fire-department" size={20} color={COLORS.error} />
                      <Text style={styles.statLabel}>Calories</Text>
                      <Text style={styles.statValue}>{selectedExercise.calories}</Text>
                    </Surface>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.previewActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowPreview(false)}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleReplaceExercise}
                  style={[styles.actionButton, styles.replaceButton]}
                  labelStyle={styles.replaceButtonText}
                >
                  Replace Exercise ✨
                </Button>
              </View>
            </Surface>
          )}
        </BlurView>
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
          <IconButton
            icon="arrow-back"
            size={24}
            iconColor={COLORS.white}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Alternative Exercises</Text>
            <Text style={styles.headerSubtitle}>
              Find the perfect substitute 💪
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search exercises, muscles, equipment..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {renderCategoryChips()}

      <Animated.FlatList
        data={filteredAlternatives}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExerciseCard}
        style={styles.exerciseList}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh alternatives..."
            titleColor={COLORS.textSecondary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No alternatives found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}
      />

      {renderExercisePreview()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  headerText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.white + 'CC',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchbar: {
    backgroundColor: COLORS.background,
    elevation: 0,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryText: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectedCategoryText: {
    color: COLORS.white,
  },
  exerciseList: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  cardContainer: {
    marginBottom: SPACING.md,
  },
  exerciseCard: {
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  substitutionReason: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  cardContent: {
    marginTop: SPACING.sm,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  targetMuscles: {
    marginBottom: SPACING.md,
  },
  musclesLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleChip: {
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  muscleChipText: {
    fontSize: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
    color: COLORS.textSecondary,
  },
  previewButton: {
    borderRadius: 20,
  },
  previewButtonText: {
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  blurView: {
    flex: 1,
    padding: SPACING.lg,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    maxHeight: height * 0.8,
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    flex: 1,
  },
  previewContent: {
    flex: 1,
  },
  previewImagePlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.md,
    borderRadius: 12,
  },
  videoPlaceholderText: {
    ...TEXT_STYLES.caption,
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  previewDetails: {
    padding: SPACING.md,
  },
  previewInstructions: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statValue: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginTop: 2,
  },
  previewActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
    borderRadius: 25,
  },
  replaceButton: {
    backgroundColor: COLORS.success,
  },
  replaceButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});

export default AlternativeExercises;