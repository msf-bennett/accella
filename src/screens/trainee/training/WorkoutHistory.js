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

const { width } = Dimensions.get('window');

const WorkoutHistory = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Redux
  const dispatch = useDispatch();
  const { workoutHistory, totalWorkouts, streak, points } = useSelector(state => ({
    workoutHistory: state.training?.workoutHistory || [],
    totalWorkouts: state.training?.totalWorkouts || 0,
    streak: state.training?.streak || 0,
    points: state.user?.points || 0,
  }));

  // Mock data for development
  const mockWorkoutHistory = [
    {
      id: '1',
      date: '2024-08-28',
      title: 'Upper Body Strength',
      duration: '45 mins',
      exercises: 8,
      completed: true,
      intensity: 'High',
      calories: 320,
      rating: 4,
      notes: 'Felt strong today! Increased weights on bench press.',
      trainer: 'Coach Mike',
      type: 'Strength',
    },
    {
      id: '2',
      date: '2024-08-26',
      title: 'Cardio HIIT Session',
      duration: '30 mins',
      exercises: 6,
      completed: true,
      intensity: 'Very High',
      calories: 280,
      rating: 5,
      notes: 'Amazing session! New personal record on burpees.',
      trainer: 'Coach Sarah',
      type: 'Cardio',
    },
    {
      id: '3',
      date: '2024-08-24',
      title: 'Lower Body Power',
      duration: '50 mins',
      exercises: 10,
      completed: true,
      intensity: 'High',
      calories: 380,
      rating: 4,
      notes: 'Legs are getting stronger. Need to work on flexibility.',
      trainer: 'Coach Mike',
      type: 'Strength',
    },
    {
      id: '4',
      date: '2024-08-22',
      title: 'Recovery Yoga',
      duration: '25 mins',
      exercises: 12,
      completed: true,
      intensity: 'Low',
      calories: 120,
      rating: 3,
      notes: 'Good for recovery day. Feeling more flexible.',
      trainer: 'Coach Lisa',
      type: 'Recovery',
    },
    {
      id: '5',
      date: '2024-08-20',
      title: 'Full Body Circuit',
      duration: '40 mins',
      exercises: 15,
      completed: false,
      intensity: 'Medium',
      calories: 0,
      rating: null,
      notes: 'Had to stop early due to schedule conflict.',
      trainer: 'Coach Mike',
      type: 'Circuit',
    },
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
    ]).start();

    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [fadeAnim, slideAnim]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Alert.alert('✅ Success', 'Workout history updated!');
    }, 1500);
  }, []);

  // Filter workouts
  const filteredWorkouts = mockWorkoutHistory.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.trainer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'completed' && workout.completed) ||
                         (selectedFilter === 'incomplete' && !workout.completed) ||
                         workout.type.toLowerCase() === selectedFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Get intensity color
  const getIntensityColor = (intensity) => {
    switch (intensity?.toLowerCase()) {
      case 'low': return COLORS.success;
      case 'medium': return COLORS.warning;
      case 'high': return COLORS.error;
      case 'very high': return '#D32F2F';
      default: return COLORS.textSecondary;
    }
  };

  // Get workout type icon
  const getWorkoutTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'strength': return 'fitness-center';
      case 'cardio': return 'favorite';
      case 'recovery': return 'spa';
      case 'circuit': return 'loop';
      default: return 'exercise';
    }
  };

  // Render filter chips
  const renderFilterChips = () => {
    const filters = [
      { key: 'all', label: 'All Workouts', icon: 'list' },
      { key: 'completed', label: 'Completed', icon: 'check-circle' },
      { key: 'incomplete', label: 'Incomplete', icon: 'cancel' },
      { key: 'strength', label: 'Strength', icon: 'fitness-center' },
      { key: 'cardio', label: 'Cardio', icon: 'favorite' },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            icon={filter.icon}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip
            ]}
            textStyle={selectedFilter === filter.key ? styles.selectedFilterText : null}
            mode="outlined"
          >
            {filter.label}
          </Chip>
        ))}
      </ScrollView>
    );
  };

  // Render stats cards
  const renderStatsCards = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.statsContainer}
      contentContainerStyle={styles.statsContent}
    >
      <Surface style={styles.statCard} elevation={2}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.statGradient}
        >
          <Icon name="fitness-center" size={24} color="white" />
          <Text style={styles.statNumber}>{totalWorkouts || mockWorkoutHistory.length}</Text>
          <Text style={styles.statLabel}>Total Workouts</Text>
        </LinearGradient>
      </Surface>

      <Surface style={styles.statCard} elevation={2}>
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.statGradient}
        >
          <Icon name="whatshot" size={24} color="white" />
          <Text style={styles.statNumber}>{streak || 7}</Text>
          <Text style={styles.statLabel}>Day Streak 🔥</Text>
        </LinearGradient>
      </Surface>

      <Surface style={styles.statCard} elevation={2}>
        <LinearGradient
          colors={['#FF9800', '#F57C00']}
          style={styles.statGradient}
        >
          <Icon name="stars" size={24} color="white" />
          <Text style={styles.statNumber}>{points || 1250}</Text>
          <Text style={styles.statLabel}>Points Earned ⭐</Text>
        </LinearGradient>
      </Surface>

      <Surface style={styles.statCard} elevation={2}>
        <LinearGradient
          colors={['#E91E63', '#C2185B']}
          style={styles.statGradient}
        >
          <Icon name="local-fire-department" size={24} color="white" />
          <Text style={styles.statNumber}>1,420</Text>
          <Text style={styles.statLabel}>Calories Burned</Text>
        </LinearGradient>
      </Surface>
    </ScrollView>
  );

  // Render workout card
  const renderWorkoutCard = (workout) => (
    <Animated.View
      key={workout.id}
      style={[
        styles.workoutCardContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <Card style={styles.workoutCard} elevation={3}>
        <TouchableOpacity 
          onPress={() => {
            setSelectedWorkout(workout);
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={workout.completed ? [COLORS.primary, COLORS.secondary] : ['#9E9E9E', '#757575']}
              style={styles.cardHeaderGradient}
            >
              <View style={styles.cardHeaderContent}>
                <View style={styles.cardHeaderLeft}>
                  <Icon 
                    name={getWorkoutTypeIcon(workout.type)} 
                    size={20} 
                    color="white" 
                  />
                  <Text style={styles.cardTitle}>{workout.title}</Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  {workout.completed ? (
                    <Icon name="check-circle" size={24} color="white" />
                  ) : (
                    <Icon name="schedule" size={24} color="white" />
                  )}
                </View>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.cardRow}>
              <View style={styles.cardInfoItem}>
                <Icon name="event" size={16} color={COLORS.textSecondary} />
                <Text style={styles.cardInfoText}>{workout.date}</Text>
              </View>
              <View style={styles.cardInfoItem}>
                <Icon name="access-time" size={16} color={COLORS.textSecondary} />
                <Text style={styles.cardInfoText}>{workout.duration}</Text>
              </View>
            </View>

            <View style={styles.cardRow}>
              <View style={styles.cardInfoItem}>
                <Icon name="list" size={16} color={COLORS.textSecondary} />
                <Text style={styles.cardInfoText}>{workout.exercises} exercises</Text>
              </View>
              <View style={styles.cardInfoItem}>
                <Icon name="local-fire-department" size={16} color={COLORS.textSecondary} />
                <Text style={styles.cardInfoText}>{workout.calories} cal</Text>
              </View>
            </View>

            <View style={styles.intensityContainer}>
              <Text style={styles.intensityLabel}>Intensity:</Text>
              <Chip 
                style={[
                  styles.intensityChip, 
                  { backgroundColor: `${getIntensityColor(workout.intensity)}20` }
                ]}
                textStyle={[
                  styles.intensityText, 
                  { color: getIntensityColor(workout.intensity) }
                ]}
                compact
              >
                {workout.intensity}
              </Chip>
            </View>

            <View style={styles.trainerContainer}>
              <Avatar.Icon 
                size={24} 
                icon="person" 
                style={styles.trainerAvatar}
              />
              <Text style={styles.trainerText}>with {workout.trainer}</Text>
            </View>

            {workout.rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Your Rating:</Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name="star"
                      size={16}
                      color={star <= workout.rating ? COLORS.warning : COLORS.border}
                    />
                  ))}
                </View>
              </View>
            )}

            {workout.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText} numberOfLines={2}>
                  {workout.notes}
                </Text>
              </View>
            )}
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
            <Card style={styles.modalCard} elevation={5}>
              <LinearGradient
                colors={selectedWorkout.completed ? [COLORS.primary, COLORS.secondary] : ['#9E9E9E', '#757575']}
                style={styles.modalHeader}
              >
                <View style={styles.modalHeaderContent}>
                  <Text style={styles.modalTitle}>{selectedWorkout.title}</Text>
                  <IconButton
                    icon="close"
                    iconColor="white"
                    size={24}
                    onPress={() => setModalVisible(false)}
                  />
                </View>
              </LinearGradient>

              <ScrollView style={styles.modalContent}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Workout Details</Text>
                  
                  <View style={styles.modalDetailRow}>
                    <Icon name="event" size={20} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>Date: {selectedWorkout.date}</Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Icon name="access-time" size={20} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>Duration: {selectedWorkout.duration}</Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Icon name="list" size={20} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>Exercises: {selectedWorkout.exercises}</Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Icon name="local-fire-department" size={20} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>Calories: {selectedWorkout.calories}</Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Icon name="speed" size={20} color={COLORS.primary} />
                    <Text style={styles.modalDetailText}>Intensity: {selectedWorkout.intensity}</Text>
                  </View>
                </View>

                {selectedWorkout.notes && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Your Notes</Text>
                    <Text style={styles.modalNotesText}>{selectedWorkout.notes}</Text>
                  </View>
                )}

                {selectedWorkout.rating && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Your Rating</Text>
                    <View style={styles.modalRatingContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Icon
                          key={star}
                          name="star"
                          size={24}
                          color={star <= selectedWorkout.rating ? COLORS.warning : COLORS.border}
                        />
                      ))}
                      <Text style={styles.modalRatingText}>
                        {selectedWorkout.rating}/5 stars
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    Alert.alert('🔄 Coming Soon', 'Repeat workout feature is under development!');
                  }}
                  style={styles.modalActionButton}
                  icon="refresh"
                >
                  Repeat Workout
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
          <Icon name="fitness-center" size={64} color="white" />
          <Text style={styles.loadingText}>Loading your workout history...</Text>
          <ProgressBar progress={0.7} color="white" style={styles.loadingProgress} />
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
            <Text style={styles.headerTitle}>Workout History</Text>
            <IconButton
              icon="filter-list"
              iconColor="white"
              size={24}
              onPress={() => Alert.alert('🔧 Coming Soon', 'Advanced filters coming soon!')}
            />
          </View>
          
          <View style={styles.headerStats}>
            <Text style={styles.headerStatsText}>
              💪 {mockWorkoutHistory.filter(w => w.completed).length} completed • 🔥 {streak || 7} day streak
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
            placeholder="Search workouts or trainers..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Filter Chips */}
        {renderFilterChips()}

        {/* Workout List */}
        <View style={styles.workoutsList}>
          {filteredWorkouts.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                📋 Your Workouts ({filteredWorkouts.length})
              </Text>
              {filteredWorkouts.map(renderWorkoutCard)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="event-busy" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateTitle}>No Workouts Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? 'Try adjusting your search or filters'
                  : 'Your completed workouts will appear here'
                }
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {
          Alert.alert('📱 Coming Soon', 'Manual workout logging feature is under development!');
        }}
        color="white"
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
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  statsContainer: {
    marginBottom: SPACING.md,
  },
  statsContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  statCard: {
    borderRadius: 12,
    overflow: 'hidden',
    width: 120,
  },
  statGradient: {
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statNumber: {
    ...TEXT_STYLES.h2,
    color: 'white',
    marginTop: SPACING.xs,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: 'white',
    textAlign: 'center',
    marginTop: SPACING.xs,
    opacity: 0.9,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
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
  sectionTitle: {
    ...TEXT_STYLES.h3,
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  workoutsList: {
    paddingBottom: 100, // Space for FAB
  },
  workoutCardContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  workoutCard: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    overflow: 'hidden',
  },
  cardHeaderGradient: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    marginLeft: SPACING.sm,
    flex: 1,
  },
  cardHeaderRight: {
    marginLeft: SPACING.md,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cardInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardInfoText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  intensityLabel: {
    ...TEXT_STYLES.caption,
    marginRight: SPACING.sm,
  },
  intensityChip: {
    height: 24,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  trainerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trainerAvatar: {
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  trainerText: {
    ...TEXT_STYLES.caption,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingLabel: {
    ...TEXT_STYLES.caption,
    marginRight: SPACING.sm,
  },
  stars: {
    flexDirection: 'row',
  },
  notesContainer: {
    marginTop: SPACING.xs,
  },
  notesLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  notesText: {
    ...TEXT_STYLES.caption,
    fontStyle: 'italic',
    opacity: 0.8,
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
    maxHeight: '80%',
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: SPACING.lg,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    flex: 1,
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
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  modalDetailText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  modalNotesText: {
    ...TEXT_STYLES.body,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 8,
    fontStyle: 'italic',
  },
  modalRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalRatingText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
    color: COLORS.textSecondary,
  },
  modalActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalActionButton: {
    backgroundColor: COLORS.primary,
  },
});

export default WorkoutHistory;