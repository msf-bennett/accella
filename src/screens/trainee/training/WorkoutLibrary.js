import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
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
  Modal,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Design system imports
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
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
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary },
};

const { width, height } = Dimensions.get('window');

const WorkoutLibrary = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [favorites, setFavorites] = useState(new Set());

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Redux
  const dispatch = useDispatch();
  const { userLevel, preferences } = useSelector(state => ({
    userLevel: state.user?.level || 'Beginner',
    preferences: state.user?.preferences || {},
  }));

  // Mock workout library data
  const mockWorkouts = [
    {
      id: '1',
      title: 'HIIT Cardio Blast',
      description: 'High-intensity interval training to boost your cardiovascular fitness and burn calories fast.',
      category: 'cardio',
      difficulty: 'intermediate',
      duration: 25,
      exercises: 8,
      calories: 300,
      equipment: ['None'],
      tags: ['HIIT', 'Fat Burn', 'Cardio'],
      rating: 4.8,
      reviews: 1245,
      trainer: 'Sarah Johnson',
      preview: '4 rounds x 45s work, 15s rest',
      thumbnailColor: ['#FF6B6B', '#FF8E53'],
      muscleGroups: ['Full Body', 'Cardio'],
      isPopular: true,
      isNew: false,
    },
    {
      id: '2',
      title: 'Upper Body Strength',
      description: 'Build powerful upper body muscles with compound movements and progressive overload.',
      category: 'strength',
      difficulty: 'advanced',
      duration: 45,
      exercises: 12,
      calories: 280,
      equipment: ['Dumbbells', 'Barbell', 'Bench'],
      tags: ['Strength', 'Upper Body', 'Muscle Building'],
      rating: 4.9,
      reviews: 892,
      trainer: 'Mike Rodriguez',
      preview: '4 sets x 8-12 reps',
      thumbnailColor: ['#4ECDC4', '#44A08D'],
      muscleGroups: ['Chest', 'Back', 'Shoulders', 'Arms'],
      isPopular: true,
      isNew: false,
    },
    {
      id: '3',
      title: 'Yoga Flow Morning',
      description: 'Gentle yoga sequence to start your day with mindfulness, flexibility, and energy.',
      category: 'flexibility',
      difficulty: 'beginner',
      duration: 20,
      exercises: 15,
      calories: 80,
      equipment: ['Yoga Mat'],
      tags: ['Yoga', 'Flexibility', 'Morning', 'Mindfulness'],
      rating: 4.7,
      reviews: 2156,
      trainer: 'Lisa Chen',
      preview: 'Flow sequence with breath work',
      thumbnailColor: ['#A8E6CF', '#7FCDCD'],
      muscleGroups: ['Full Body', 'Core'],
      isPopular: false,
      isNew: true,
    },
    {
      id: '4',
      title: 'Core Destroyer',
      description: 'Intense core workout targeting all abdominal muscles and building rock-solid stability.',
      category: 'core',
      difficulty: 'intermediate',
      duration: 15,
      exercises: 10,
      calories: 150,
      equipment: ['None'],
      tags: ['Core', 'Abs', 'Stability', 'Quick'],
      rating: 4.6,
      reviews: 768,
      trainer: 'Alex Thompson',
      preview: '3 circuits x 45s each',
      thumbnailColor: ['#FFD93D', '#FF6B35'],
      muscleGroups: ['Core', 'Abs'],
      isPopular: false,
      isNew: false,
    },
    {
      id: '5',
      title: 'Lower Body Power',
      description: 'Explosive lower body workout focusing on strength, power, and athletic performance.',
      category: 'strength',
      difficulty: 'advanced',
      duration: 50,
      exercises: 14,
      calories: 400,
      equipment: ['Dumbbells', 'Kettlebell'],
      tags: ['Lower Body', 'Power', 'Strength', 'Athletic'],
      rating: 4.8,
      reviews: 654,
      trainer: 'David Kim',
      preview: '5 sets x 6-8 reps',
      thumbnailColor: ['#667eea', '#764ba2'],
      muscleGroups: ['Glutes', 'Quads', 'Hamstrings', 'Calves'],
      isPopular: true,
      isNew: false,
    },
    {
      id: '6',
      title: 'Full Body Beginner',
      description: 'Perfect introduction to fitness with basic movements and proper form guidance.',
      category: 'beginner',
      difficulty: 'beginner',
      duration: 30,
      exercises: 8,
      calories: 200,
      equipment: ['None'],
      tags: ['Beginner', 'Full Body', 'Easy', 'Form Focus'],
      rating: 4.5,
      reviews: 1823,
      trainer: 'Emma Wilson',
      preview: '2 sets x 12-15 reps',
      thumbnailColor: ['#74b9ff', '#0984e3'],
      muscleGroups: ['Full Body'],
      isPopular: false,
      isNew: true,
    },
    {
      id: '7',
      title: 'Pilates Core Flow',
      description: 'Controlled movements focusing on core strength, posture, and mind-body connection.',
      category: 'pilates',
      difficulty: 'intermediate',
      duration: 35,
      exercises: 12,
      calories: 180,
      equipment: ['Mat'],
      tags: ['Pilates', 'Core', 'Posture', 'Control'],
      rating: 4.7,
      reviews: 943,
      trainer: 'Maria Santos',
      preview: 'Slow controlled movements',
      thumbnailColor: ['#fd79a8', '#e84393'],
      muscleGroups: ['Core', 'Posture'],
      isPopular: false,
      isNew: false,
    },
    {
      id: '8',
      title: 'Metabolic Finisher',
      description: 'High-intensity finisher to maximize calorie burn and boost your metabolism.',
      category: 'cardio',
      difficulty: 'advanced',
      duration: 12,
      exercises: 6,
      calories: 180,
      equipment: ['None'],
      tags: ['Metabolic', 'Finisher', 'HIIT', 'Burn'],
      rating: 4.9,
      reviews: 456,
      trainer: 'Jake Morrison',
      preview: '3 rounds x 40s all-out',
      thumbnailColor: ['#e17055', '#d63031'],
      muscleGroups: ['Full Body'],
      isPopular: true,
      isNew: true,
    },
  ];

  // Categories for filtering
  const categories = [
    { key: 'all', label: 'All Workouts', icon: 'fitness-center', count: mockWorkouts.length },
    { key: 'cardio', label: 'Cardio', icon: 'favorite', count: mockWorkouts.filter(w => w.category === 'cardio').length },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', count: mockWorkouts.filter(w => w.category === 'strength').length },
    { key: 'flexibility', label: 'Flexibility', icon: 'spa', count: mockWorkouts.filter(w => w.category === 'flexibility').length },
    { key: 'core', label: 'Core', icon: 'center-focus-strong', count: mockWorkouts.filter(w => w.category === 'core').length },
    { key: 'pilates', label: 'Pilates', icon: 'self-improvement', count: mockWorkouts.filter(w => w.category === 'pilates').length },
    { key: 'beginner', label: 'Beginner', icon: 'school', count: mockWorkouts.filter(w => w.category === 'beginner').length },
  ];

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [fadeAnim, slideAnim, scaleAnim]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('✅ Success', 'Workout library updated with new content!');
    }, 1500);
  }, []);

  // Filter workouts
  const filteredWorkouts = mockWorkouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.trainer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || workout.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || workout.difficulty === selectedDifficulty;
    const matchesDuration = selectedDuration === 'all' || 
                           (selectedDuration === 'short' && workout.duration <= 20) ||
                           (selectedDuration === 'medium' && workout.duration > 20 && workout.duration <= 40) ||
                           (selectedDuration === 'long' && workout.duration > 40);
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration;
  });

  // Toggle favorite
  const toggleFavorite = (workoutId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(workoutId)) {
      newFavorites.delete(workoutId);
    } else {
      newFavorites.add(workoutId);
    }
    setFavorites(newFavorites);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  // Render category filters
  const renderCategoryFilters = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.key}
          onPress={() => setSelectedCategory(category.key)}
          activeOpacity={0.7}
        >
          <Surface 
            style={[
              styles.categoryCard,
              selectedCategory === category.key && styles.selectedCategoryCard
            ]} 
            elevation={selectedCategory === category.key ? 4 : 2}
          >
            <LinearGradient
              colors={selectedCategory === category.key 
                ? [COLORS.primary, COLORS.secondary] 
                : ['#ffffff', '#f8f9fa']
              }
              style={styles.categoryCardGradient}
            >
              <Icon 
                name={category.icon} 
                size={24} 
                color={selectedCategory === category.key ? 'white' : COLORS.primary} 
              />
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.key && styles.selectedCategoryLabel
              ]}>
                {category.label}
              </Text>
              <Text style={[
                styles.categoryCount,
                selectedCategory === category.key && styles.selectedCategoryCount
              ]}>
                {category.count} workouts
              </Text>
            </LinearGradient>
          </Surface>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {/* Difficulty filters */}
      {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
        <Chip
          key={difficulty}
          selected={selectedDifficulty === difficulty}
          onPress={() => setSelectedDifficulty(difficulty)}
          style={[
            styles.filterChip,
            selectedDifficulty === difficulty && styles.selectedFilterChip
          ]}
          textStyle={selectedDifficulty === difficulty ? styles.selectedFilterText : null}
          mode="outlined"
        >
          {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Chip>
      ))}

      <Divider style={styles.filterDivider} />

      {/* Duration filters */}
      {[
        { key: 'all', label: 'Any Duration' },
        { key: 'short', label: '≤ 20 min' },
        { key: 'medium', label: '20-40 min' },
        { key: 'long', label: '> 40 min' }
      ].map((duration) => (
        <Chip
          key={duration.key}
          selected={selectedDuration === duration.key}
          onPress={() => setSelectedDuration(duration.key)}
          style={[
            styles.filterChip,
            selectedDuration === duration.key && styles.selectedFilterChip
          ]}
          textStyle={selectedDuration === duration.key ? styles.selectedFilterText : null}
          mode="outlined"
        >
          {duration.label}
        </Chip>
      ))}
    </ScrollView>
  );

  // Render workout card (grid view)
  const renderWorkoutCard = ({ item: workout, index }) => (
    <Animated.View
      style={[
        styles.workoutCardContainer,
        { 
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        }
      ]}
    >
      <Card style={styles.workoutCard} elevation={3}>
        <TouchableOpacity 
          onPress={() => {
            setSelectedWorkout(workout);
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          {/* Card Header with Gradient */}
          <LinearGradient
            colors={workout.thumbnailColor}
            style={styles.cardThumbnail}
          >
            <View style={styles.cardBadges}>
              {workout.isNew && (
                <Chip style={styles.newBadge} textStyle={styles.badgeText} compact>
                  🆕 NEW
                </Chip>
              )}
              {workout.isPopular && (
                <Chip style={styles.popularBadge} textStyle={styles.badgeText} compact>
                  🔥 POPULAR
                </Chip>
              )}
            </View>
            
            <View style={styles.cardThumbnailContent}>
              <Text style={styles.cardPreview}>{workout.preview}</Text>
            </View>

            <View style={styles.cardThumbnailFooter}>
              <View style={styles.durationBadge}>
                <Icon name="access-time" size={14} color="white" />
                <Text style={styles.durationText}>{workout.duration} min</Text>
              </View>
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(workout.id);
                }}
                style={styles.favoriteButton}
              >
                <Icon 
                  name={favorites.has(workout.id) ? "favorite" : "favorite-border"} 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>{workout.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={2}>
              {workout.description}
            </Text>

            <View style={styles.cardStats}>
              <View style={styles.cardStatItem}>
                <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                <Text style={styles.cardStatText}>{workout.exercises} exercises</Text>
              </View>
              <View style={styles.cardStatItem}>
                <Icon name="local-fire-department" size={16} color={COLORS.textSecondary} />
                <Text style={styles.cardStatText}>{workout.calories} cal</Text>
              </View>
            </View>

            <View style={styles.cardMeta}>
              <View style={styles.cardMetaLeft}>
                <Chip 
                  style={[
                    styles.difficultyChip, 
                    { backgroundColor: `${getDifficultyColor(workout.difficulty)}20` }
                  ]}
                  textStyle={[
                    styles.difficultyText, 
                    { color: getDifficultyColor(workout.difficulty) }
                  ]}
                  compact
                >
                  {workout.difficulty}
                </Chip>
              </View>
              <View style={styles.cardRating}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.ratingText}>{workout.rating}</Text>
                <Text style={styles.reviewsText}>({workout.reviews})</Text>
              </View>
            </View>

            <View style={styles.cardTrainer}>
              <Avatar.Icon 
                size={24} 
                icon="person" 
                style={styles.trainerAvatar}
              />
              <Text style={styles.trainerName}>by {workout.trainer}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  // Render workout list item (list view)
  const renderWorkoutListItem = ({ item: workout }) => (
    <Animated.View
      style={[
        styles.listItemContainer,
        { opacity: fadeAnim }
      ]}
    >
      <Card style={styles.listCard} elevation={2}>
        <TouchableOpacity 
          onPress={() => {
            setSelectedWorkout(workout);
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.listContent}>
            <LinearGradient
              colors={workout.thumbnailColor}
              style={styles.listThumbnail}
            >
              <Icon name="play-arrow" size={32} color="white" />
            </LinearGradient>

            <View style={styles.listInfo}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle} numberOfLines={1}>{workout.title}</Text>
                <TouchableOpacity 
                  onPress={() => toggleFavorite(workout.id)}
                  style={styles.listFavoriteButton}
                >
                  <Icon 
                    name={favorites.has(workout.id) ? "favorite" : "favorite-border"} 
                    size={20} 
                    color={COLORS.primary} 
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.listDescription} numberOfLines={1}>
                {workout.description}
              </Text>

              <View style={styles.listMeta}>
                <View style={styles.listMetaItem}>
                  <Icon name="access-time" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.listMetaText}>{workout.duration}min</Text>
                </View>
                <View style={styles.listMetaItem}>
                  <Icon name="fitness-center" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.listMetaText}>{workout.exercises}</Text>
                </View>
                <View style={styles.listMetaItem}>
                  <Icon name="local-fire-department" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.listMetaText}>{workout.calories}</Text>
                </View>
                <View style={styles.listMetaItem}>
                  <Icon name="star" size={14} color={COLORS.warning} />
                  <Text style={styles.listMetaText}>{workout.rating}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  // Render workout detail modal
  const renderWorkoutModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurView} blurType="light" blurAmount={10}>
          {selectedWorkout && (
            <Card style={styles.modalCard} elevation={8}>
              <LinearGradient
                colors={selectedWorkout.thumbnailColor}
                style={styles.modalHeader}
              >
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalHeaderTop}>
                    <Text style={styles.modalTitle}>{selectedWorkout.title}</Text>
                    <IconButton
                      icon="close"
                      iconColor="white"
                      size={24}
                      onPress={() => setModalVisible(false)}
                    />
                  </View>
                  <Text style={styles.modalSubtitle}>{selectedWorkout.description}</Text>
                  <View style={styles.modalHeaderStats}>
                    <View style={styles.modalHeaderStat}>
                      <Icon name="access-time" size={16} color="white" />
                      <Text style={styles.modalHeaderStatText}>{selectedWorkout.duration} min</Text>
                    </View>
                    <View style={styles.modalHeaderStat}>
                      <Icon name="fitness-center" size={16} color="white" />
                      <Text style={styles.modalHeaderStatText}>{selectedWorkout.exercises} exercises</Text>
                    </View>
                    <View style={styles.modalHeaderStat}>
                      <Icon name="local-fire-department" size={16} color="white" />
                      <Text style={styles.modalHeaderStatText}>{selectedWorkout.calories} cal</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <ScrollView style={styles.modalContent}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Workout Details</Text>
                  
                  <View style={styles.modalDetailGrid}>
                    <View style={styles.modalDetailItem}>
                      <Text style={styles.modalDetailLabel}>Difficulty</Text>
                      <Chip 
                        style={[
                          styles.modalDetailChip, 
                          { backgroundColor: `${getDifficultyColor(selectedWorkout.difficulty)}20` }
                        ]}
                        textStyle={[
                          styles.modalDetailChipText, 
                          { color: getDifficultyColor(selectedWorkout.difficulty) }
                        ]}
                        compact
                      >
                        {selectedWorkout.difficulty}
                      </Chip>
                    </View>
                    
                    <View style={styles.modalDetailItem}>
                      <Text style={styles.modalDetailLabel}>Category</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedWorkout.category.charAt(0).toUpperCase() + selectedWorkout.category.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Equipment Needed</Text>
                    <View style={styles.equipmentContainer}>
                      {selectedWorkout.equipment.map((item, index) => (
                        <Chip 
                          key={index}
                          style={styles.equipmentChip}
                          textStyle={styles.equipmentText}
                          compact
                        >
                          {item}
                        </Chip>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalDetailItem}>
                    <Text style={styles.modalDetailLabel}>Muscle Groups</Text>
                    <View style={styles.muscleGroupContainer}>
                      {selectedWorkout.muscleGroups.map((group, index) => (
                        <Chip 
                          key={index}
                          style={styles.muscleGroupChip}
                          textStyle={styles.muscleGroupText}
                          compact
                        >
                          {group}
                        </Chip>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedWorkout.tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        style={styles.tagChip}
                        textStyle={styles.tagText}
                        compact
                        icon="label"
                      >
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Trainer</Text>
                  <View style={styles.trainerInfo}>
                    <Avatar.Icon 
                      size={40} 
                      icon="person" 
                      style={styles.modalTrainerAvatar}
                    />
                    <View style={styles.trainerDetails}>
                      <Text style={styles.trainerNameLarge}>{selectedWorkout.trainer}</Text>
                      <View style={styles.trainerRating}>
                        <Icon name="star" size={16} color={COLORS.warning} />
                        <Text style={styles.trainerRatingText}>
                          {selectedWorkout.rating} ({selectedWorkout.reviews} reviews)
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('❤️ Added', 'Workout added to favorites!');
                  }}
                  style={styles.modalActionButton}
                  icon="favorite"
                >
                  Add to Favorites
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('🚀 Success', 'Workout added to your training plan!');
                  }}
                  style={[styles.modalActionButton, styles.primaryActionButton]}
                  icon="add-circle"
                >
                  Add to Plan
                </Button>
              </View>
            </Card>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.loadingGradient}
        >
          <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
          <Icon name="video-library" size={64} color="white" />
          <Text style={styles.loadingText}>Loading workout library...</Text>
          <Text style={styles.loadingSubtext}>Discovering amazing workouts for you! 💪</Text>
          <ProgressBar progress={0.8} color="white" style={styles.loadingProgress} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
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
            <Text style={styles.headerTitle}>Workout Library</Text>
            <View style={styles.headerActions}>
              <IconButton
                icon={viewMode === 'grid' ? 'view-list' : 'view-module'}
                iconColor="white"
                size={24}
                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              />
              <IconButton
                icon="filter-list"
                iconColor="white"
                size={24}
                onPress={() => Alert.alert('🔧 Coming Soon', 'Advanced filters coming soon!')}
              />
            </View>
          </View>
          
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsText}>
              📚 {filteredWorkouts.length} workouts • 🎯 Perfect for {userLevel}s
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search workouts, trainers, or tags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Category Filters */}
        {renderCategoryFilters()}

        {/* Filter Chips */}
        {renderFilterChips()}

        {/* Workout Results */}
        <View style={styles.workoutsList}>
          {filteredWorkouts.length > 0 ? (
            <>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  🏋️ {filteredWorkouts.length} Workout{filteredWorkouts.length !== 1 ? 's' : ''} Found
                </Text>
                <Text style={styles.resultsSubtitle}>
                  Tap any workout to see details and add to your plan
                </Text>
              </View>
              
              {viewMode === 'grid' ? (
                <FlatList
                  data={filteredWorkouts}
                  renderItem={renderWorkoutCard}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.gridRow}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <FlatList
                  data={filteredWorkouts}
                  renderItem={renderWorkoutListItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="search-off" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Workouts Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new workouts!'
                }
              </Text>
              <Button
                mode="contained"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSelectedDuration('all');
                }}
                style={styles.clearFiltersButton}
                icon="refresh"
              >
                Clear All Filters
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="bookmark"
        style={styles.fab}
        onPress={() => {
          Alert.alert('📑 Coming Soon', 'View saved workouts feature coming soon!');
        }}
        color="white"
        label="Saved"
      />

      {/* Workout Detail Modal */}
      {renderWorkoutModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginTop: SPACING.lg,
    textAlign: 'center',
  },
  loadingSubtext: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  loadingProgress: {
    width: width * 0.6,
    marginTop: SPACING.lg,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    marginTop: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerStats: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  headerStatsText: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  categoryContainer: {
    marginBottom: SPACING.md,
  },
  categoryContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryCard: {
    borderRadius: 12,
    overflow: 'hidden',
    width: 120,
    marginRight: SPACING.sm,
  },
  selectedCategoryCard: {
    elevation: 4,
  },
  categoryCardGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  categoryLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  selectedCategoryLabel: {
    color: 'white',
  },
  categoryCount: {
    ...TEXT_STYLES.small,
    textAlign: 'center',
    marginTop: SPACING.xs,
    opacity: 0.8,
  },
  selectedCategoryCount: {
    color: 'white',
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  selectedFilterText: {
    color: 'white',
  },
  filterDivider: {
    height: 20,
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  resultsHeader: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  resultsTitle: {
    ...TEXT_STYLES.h3,
  },
  resultsSubtitle: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
  },
  workoutsList: {
    paddingBottom: 100, // Space for FAB
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  workoutCardContainer: {
    width: (width - SPACING.md * 3) / 2,
    marginBottom: SPACING.md,
  },
  workoutCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  cardThumbnail: {
    height: 120,
    justifyContent: 'space-between',
    padding: SPACING.sm,
  },
  cardBadges: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: SPACING.xs,
  },
  newBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 24,
  },
  popularBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 24,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardThumbnailContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPreview: {
    color: 'white',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  cardThumbnailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  favoriteButton: {
    padding: SPACING.xs,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStatText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardMetaLeft: {
    flex: 1,
  },
  difficultyChip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TEXT_STYLES.small,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  reviewsText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
    opacity: 0.7,
  },
  cardTrainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  trainerName: {
    ...TEXT_STYLES.small,
    fontStyle: 'italic',
  },
  listItemContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  listCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  listContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  listThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  listInfo: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  listTitle: {
    ...TEXT_STYLES.h3,
    fontSize: 16,
    flex: 1,
  },
  listFavoriteButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  listDescription: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.sm,
  },
  listMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  listMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listMetaText: {
    ...TEXT_STYLES.small,
    marginLeft: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h3,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  clearFiltersButton: {
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    maxHeight: '90%',
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.lg,
  },
  modalHeaderContent: {
    alignItems: 'flex-start',
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    flex: 1,
    paddingRight: SPACING.md,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: 'white',
    opacity: 0.9,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  modalHeaderStats: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalHeaderStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderStatText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  modalSectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  modalDetailGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  modalDetailItem: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  modalDetailLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  modalDetailValue: {
    ...TEXT_STYLES.body,
  },
  modalDetailChip: {
    height: 28,
    alignSelf: 'flex-start',
  },
  modalDetailChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  equipmentChip: {
    backgroundColor: COLORS.background,
    height: 28,
  },
  equipmentText: {
    fontSize: 12,
  },
  muscleGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  muscleGroupChip: {
    backgroundColor: `${COLORS.primary}20`,
    height: 28,
  },
  muscleGroupText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tagChip: {
    backgroundColor: `${COLORS.secondary}20`,
    height: 28,
  },
  tagText: {
    color: COLORS.secondary,
    fontSize: 12,
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTrainerAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.md,
  },
  trainerDetails: {
    flex: 1,
  },
  trainerNameLarge: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  trainerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerRatingText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  modalActionButton: {
    flex: 1,
  },
  primaryActionButton: {
    backgroundColor: COLORS.primary,
  },
});

export default WorkoutLibrary;
