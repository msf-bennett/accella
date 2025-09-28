import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Modal,
  TextInput,
  FlatList,
  Vibration
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
  Modal as PaperModal,
  Divider,
  Badge
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9ff',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  accent: '#e74c3c'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary }
};

const { width, height } = Dimensions.get('window');

const WorkoutLibrary = ({ navigation }) => {
  // State Management
  const [workouts, setWorkouts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Redux
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const workoutData = useSelector(state => state.workouts);

  // Mock data
  const mockWorkouts = [
    {
      id: 1,
      title: 'Full Body HIIT Blast 🔥',
      description: 'High-intensity full body workout for fat burning',
      duration: 45,
      difficulty: 'Advanced',
      category: 'HIIT',
      exercises: 12,
      equipment: ['Dumbbells', 'Mat', 'Kettlebell'],
      tags: ['Fat Loss', 'Cardio', 'Strength'],
      rating: 4.8,
      uses: 156,
      thumbnail: '🏋️‍♂️',
      createdAt: '2024-01-15',
      isCustom: true,
      isFavorite: true
    },
    {
      id: 2,
      title: 'Beginner Strength Builder 💪',
      description: 'Perfect introduction to strength training',
      duration: 30,
      difficulty: 'Beginner',
      category: 'Strength',
      exercises: 8,
      equipment: ['Dumbbells', 'Bench'],
      tags: ['Strength', 'Beginner', 'Muscle Building'],
      rating: 4.6,
      uses: 89,
      thumbnail: '💪',
      createdAt: '2024-01-20',
      isCustom: false,
      isFavorite: false
    },
    {
      id: 3,
      title: 'Cardio Core Crusher ⚡',
      description: 'Dynamic core workout with cardio elements',
      duration: 25,
      difficulty: 'Intermediate',
      category: 'Core',
      exercises: 10,
      equipment: ['Mat', 'Medicine Ball'],
      tags: ['Core', 'Cardio', 'Abs'],
      rating: 4.9,
      uses: 203,
      thumbnail: '⚡',
      createdAt: '2024-01-18',
      isCustom: true,
      isFavorite: true
    },
    {
      id: 4,
      title: 'Yoga Flow & Flexibility 🧘‍♀️',
      description: 'Relaxing yoga flow for flexibility and mindfulness',
      duration: 60,
      difficulty: 'Beginner',
      category: 'Flexibility',
      exercises: 15,
      equipment: ['Mat', 'Blocks'],
      tags: ['Yoga', 'Flexibility', 'Recovery'],
      rating: 4.7,
      uses: 145,
      thumbnail: '🧘‍♀️',
      createdAt: '2024-01-22',
      isCustom: false,
      isFavorite: false
    }
  ];

  const mockCategories = [
    { id: 'all', name: 'All', count: 24, icon: '🏃‍♂️' },
    { id: 'hiit', name: 'HIIT', count: 8, icon: '🔥' },
    { id: 'strength', name: 'Strength', count: 12, icon: '💪' },
    { id: 'cardio', name: 'Cardio', count: 6, icon: '❤️' },
    { id: 'flexibility', name: 'Flexibility', count: 4, icon: '🧘‍♀️' },
    { id: 'core', name: 'Core', count: 7, icon: '⚡' },
  ];

  // Component Lifecycle
  useEffect(() => {
    initializeScreen();
  }, []);

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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  // Functions
  const initializeScreen = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWorkouts(mockWorkouts);
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error initializing workout library:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await initializeScreen();
    setRefreshing(false);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    Vibration.vibrate(30);
  };

  const handleWorkoutPress = (workout) => {
    Vibration.vibrate(50);
    Alert.alert(
      'Workout Details',
      `Opening "${workout.title}" details view`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to workout details') },
        { text: 'Use Workout', onPress: () => console.log('Navigate to workout session') }
      ]
    );
  };

  const handleCreateWorkout = () => {
    setShowCreateModal(true);
    Vibration.vibrate(50);
  };

  const handleFavoriteToggle = (workoutId) => {
    Vibration.vibrate(30);
    setWorkouts(prev => prev.map(workout => 
      workout.id === workoutId 
        ? { ...workout, isFavorite: !workout.isFavorite }
        : workout
    ));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || workout.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Components
  const WorkoutCard = ({ workout, style }) => (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Card style={styles.workoutCard} elevation={3}>
        <TouchableOpacity onPress={() => handleWorkoutPress(workout)}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.cardHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeaderContent}>
              <Text style={styles.workoutEmoji}>{workout.thumbnail}</Text>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle} numberOfLines={1}>
                  {workout.title}
                </Text>
                <View style={styles.workoutMeta}>
                  <Icon name="timer" size={14} color="#fff" />
                  <Text style={styles.metaText}>{workout.duration}min</Text>
                  <Icon name="fitness-center" size={14} color="#fff" style={{ marginLeft: 8 }} />
                  <Text style={styles.metaText}>{workout.exercises} exercises</Text>
                </View>
              </View>
              <IconButton
                icon={workout.isFavorite ? "favorite" : "favorite-border"}
                iconColor="#fff"
                size={20}
                onPress={() => handleFavoriteToggle(workout.id)}
                style={styles.favoriteButton}
              />
            </View>
          </LinearGradient>

          <Card.Content style={styles.cardContent}>
            <Text style={styles.workoutDescription} numberOfLines={2}>
              {workout.description}
            </Text>
            
            <View style={styles.difficultyRow}>
              <Chip
                mode="outlined"
                textStyle={{ color: getDifficultyColor(workout.difficulty), fontSize: 12 }}
                style={[styles.difficultyChip, { borderColor: getDifficultyColor(workout.difficulty) }]}
              >
                {workout.difficulty}
              </Chip>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>{workout.rating}</Text>
                <Text style={styles.usesText}>({workout.uses} uses)</Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
              {workout.tags.map((tag, index) => (
                <Chip key={index} mode="outlined" compact style={styles.tagChip}>
                  {tag}
                </Chip>
              ))}
            </ScrollView>

            <View style={styles.equipmentRow}>
              <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
              <Text style={styles.equipmentText} numberOfLines={1}>
                {workout.equipment.join(', ')}
              </Text>
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  const CategoryChip = ({ category, isSelected }) => (
    <TouchableOpacity onPress={() => handleCategorySelect(category.name)}>
      <Surface style={[
        styles.categoryChip,
        isSelected && styles.selectedCategoryChip
      ]} elevation={isSelected ? 4 : 2}>
        <Text style={styles.categoryEmoji}>{category.icon}</Text>
        <Text style={[
          styles.categoryName,
          isSelected && styles.selectedCategoryName
        ]}>
          {category.name}
        </Text>
        <Badge style={styles.categoryBadge}>{category.count}</Badge>
      </Surface>
    </TouchableOpacity>
  );

  const CreateWorkoutModal = () => (
    <PaperModal
      visible={showCreateModal}
      onDismiss={() => setShowCreateModal(false)}
      contentContainerStyle={styles.modalContainer}
    >
      <BlurView intensity={95} style={styles.modalBlur}>
        <Card style={styles.createModal}>
          <Card.Title
            title="Create New Workout 💪"
            subtitle="Build your custom training session"
            left={(props) => <Avatar.Icon {...props} icon="fitness-center" />}
            right={(props) => (
              <IconButton
                {...props}
                icon="close"
                onPress={() => setShowCreateModal(false)}
              />
            )}
          />
          <Card.Content>
            <View style={styles.createOptions}>
              <TouchableOpacity 
                style={styles.createOption}
                onPress={() => {
                  setShowCreateModal(false);
                  Alert.alert('Create from Template', 'Feature coming soon!');
                }}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.optionGradient}
                >
                  <Icon name="library-books" size={32} color="#fff" />
                  <Text style={styles.optionTitle}>From Template</Text>
                  <Text style={styles.optionSubtitle}>Use existing templates</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.createOption}
                onPress={() => {
                  setShowCreateModal(false);
                  Alert.alert('Create from Scratch', 'Feature coming soon!');
                }}
              >
                <LinearGradient
                  colors={[COLORS.success, '#27ae60']}
                  style={styles.optionGradient}
                >
                  <Icon name="create" size={32} color="#fff" />
                  <Text style={styles.optionTitle}>From Scratch</Text>
                  <Text style={styles.optionSubtitle}>Build completely new</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.createOption}
                onPress={() => {
                  setShowCreateModal(false);
                  Alert.alert('AI Generated', 'Feature coming soon!');
                }}
              >
                <LinearGradient
                  colors={[COLORS.accent, '#c0392b']}
                  style={styles.optionGradient}
                >
                  <Icon name="auto-awesome" size={32} color="#fff" />
                  <Text style={styles.optionTitle}>AI Generated</Text>
                  <Text style={styles.optionSubtitle}>Let AI create for you</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </BlurView>
    </PaperModal>
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Workout Library 📚</Text>
              <Text style={styles.headerSubtitle}>
                {filteredWorkouts.length} workouts available
              </Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
                iconColor="#fff"
                size={24}
                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              />
              <IconButton
                icon="tune"
                iconColor="#fff"
                size={24}
                onPress={() => setShowFilterModal(true)}
              />
            </View>
          </View>

          <Searchbar
            placeholder="Search workouts, tags..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
            inputStyle={{ color: COLORS.text }}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.background, '#e8f0fe']}
          style={styles.container}
        >
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <View style={styles.loadingContent}>
            <Text style={styles.loadingEmoji}>🏋️‍♂️</Text>
            <Text style={styles.loadingText}>Loading your workout library...</Text>
            <ProgressBar indeterminate color={COLORS.primary} style={styles.progressBar} />
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {renderHeader()}

      <ScrollView
        style={styles.scrollContainer}
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
        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          {/* Categories */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoriesRow}>
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.name}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <Surface style={styles.statsCard} elevation={2}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Total Workouts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Custom Made</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>8</Text>
                  <Text style={styles.statLabel}>Favorites</Text>
                </View>
              </View>
            </Surface>
          </View>

          {/* Workouts Grid/List */}
          <View style={styles.workoutsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'All' ? 'All Workouts' : `${selectedCategory} Workouts`}
              </Text>
              <Text style={styles.resultCount}>
                {filteredWorkouts.length} result{filteredWorkouts.length !== 1 ? 's' : ''}
              </Text>
            </View>

            {filteredWorkouts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={styles.emptyTitle}>No workouts found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or category filter
                </Text>
              </View>
            ) : (
              <View style={viewMode === 'grid' ? styles.workoutsGrid : styles.workoutsList}>
                {filteredWorkouts.map((workout, index) => (
                  <WorkoutCard
                    key={workout.id}
                    workout={workout}
                    style={viewMode === 'grid' ? styles.gridItem : styles.listItem}
                  />
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={handleCreateWorkout}
        color="#fff"
      />

      {/* Modals */}
      <Portal>
        <CreateWorkoutModal />
      </Portal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
  },
  header: {
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    paddingHorizontal: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchbar: {
    backgroundColor: '#fff',
    elevation: 2,
    borderRadius: 25,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  categoriesSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.md,
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingRight: SPACING.md,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  selectedCategoryChip: {
    backgroundColor: COLORS.primary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  categoryName: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  selectedCategoryName: {
    color: '#fff',
  },
  categoryBadge: {
    backgroundColor: COLORS.accent,
    fontSize: 10,
  },
  statsSection: {
    marginBottom: SPACING.lg,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  workoutsSection: {
    marginBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultCount: {
    ...TEXT_STYLES.caption,
  },
  workoutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  workoutsList: {
    flex: 1,
  },
  gridItem: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
  },
  listItem: {
    marginBottom: SPACING.md,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 4,
  },
  favoriteButton: {
    margin: 0,
  },
  cardContent: {
    padding: SPACING.md,
  },
  workoutDescription: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  difficultyChip: {
    height: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    marginLeft: 4,
    fontWeight: '600',
  },
  usesText: {
    ...TEXT_STYLES.small,
    marginLeft: 4,
  },
  tagsScroll: {
    marginBottom: SPACING.sm,
  },
  tagChip: {
    height: 28,
    marginRight: SPACING.xs,
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  equipmentText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TEXT_STYLES.h3,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  createModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  createOptions: {
    marginTop: SPACING.md,
  },
  createOption: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: SPACING.sm,
  },
  optionSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
};

export default WorkoutLibrary;