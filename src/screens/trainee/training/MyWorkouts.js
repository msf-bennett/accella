import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
  Vibration,
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
  Badge,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// Import design constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const MyWorkouts = ({ navigation }) => {
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Redux state
  const dispatch = useDispatch();
  const { 
    workouts = [], 
    user, 
    streak = 0, 
    weeklyProgress = 0.65,
    achievements = [],
    loading = false 
  } = useSelector(state => state.training || {});

  // Mock data for development
  const mockWorkouts = [
    {
      id: 1,
      title: 'Upper Body Strength 💪',
      trainer: 'Coach Mike Johnson',
      duration: 45,
      difficulty: 'Intermediate',
      status: 'pending',
      scheduledDate: '2024-08-27',
      exercises: 8,
      completedExercises: 0,
      category: 'Strength',
      description: 'Focus on building upper body strength with compound movements',
      equipment: ['Dumbbells', 'Bench', 'Pull-up bar'],
      estimatedCalories: 280,
      thumbnail: '💪',
    },
    {
      id: 2,
      title: 'HIIT Cardio Blast 🔥',
      trainer: 'Coach Sarah Williams',
      duration: 30,
      difficulty: 'Advanced',
      status: 'completed',
      scheduledDate: '2024-08-26',
      exercises: 6,
      completedExercises: 6,
      category: 'Cardio',
      description: 'High-intensity interval training for maximum fat burn',
      equipment: ['None'],
      estimatedCalories: 350,
      thumbnail: '🔥',
      rating: 5,
      completedAt: '2024-08-26T18:30:00Z',
    },
    {
      id: 3,
      title: 'Flexibility & Recovery 🧘',
      trainer: 'Coach Emma Davis',
      duration: 25,
      difficulty: 'Beginner',
      status: 'in_progress',
      scheduledDate: '2024-08-25',
      exercises: 10,
      completedExercises: 6,
      category: 'Recovery',
      description: 'Gentle stretching and mobility work for recovery',
      equipment: ['Yoga mat', 'Resistance bands'],
      estimatedCalories: 120,
      thumbnail: '🧘',
    },
    {
      id: 4,
      title: 'Leg Day Power 🦵',
      trainer: 'Coach Alex Brown',
      duration: 50,
      difficulty: 'Advanced',
      status: 'scheduled',
      scheduledDate: '2024-08-28',
      exercises: 9,
      completedExercises: 0,
      category: 'Strength',
      description: 'Intense lower body workout for strength and power',
      equipment: ['Barbell', 'Squat rack', 'Leg press'],
      estimatedCalories: 320,
      thumbnail: '🦵',
    },
  ];

  const mockStats = {
    thisWeek: {
      completed: 4,
      total: 6,
      calories: 1070,
      minutes: 165,
    },
    achievements: [
      { id: 1, name: '5-Day Streak', icon: '🔥', unlocked: true },
      { id: 2, name: 'Early Bird', icon: '🌅', unlocked: true },
      { id: 3, name: 'Consistency King', icon: '👑', unlocked: false },
    ],
  };

  useEffect(() => {
    // Initialize animations
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

    // Set up header animation listener
    headerAnim.addListener(({ value }) => {
      // Header animation logic can be added here
    });

    return () => headerAnim.removeAllListeners();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchWorkouts());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh workouts');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredWorkouts = mockWorkouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.trainer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'pending' && workout.status === 'pending') ||
                         (activeFilter === 'completed' && workout.status === 'completed') ||
                         (activeFilter === 'in_progress' && workout.status === 'in_progress');
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in_progress': return COLORS.warning;
      case 'pending': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'in_progress': return 'play-circle-filled';
      case 'pending': return 'schedule';
      default: return 'fitness-center';
    }
  };

  const handleWorkoutPress = (workout) => {
    Vibration.vibrate(30);
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const handleStartWorkout = (workoutId) => {
    Vibration.vibrate([50, 100, 50]);
    setModalVisible(false);
    
    // Navigate to workout session
    navigation.navigate('WorkoutSession', { workoutId });
  };

  const handleViewResults = (workoutId) => {
    setModalVisible(false);
    navigation.navigate('WorkoutResults', { workoutId });
  };

  const renderWorkoutCard = ({ item: workout }) => (
    <Animated.View
      style={[
        styles.workoutCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => handleWorkoutPress(workout)}
        activeOpacity={0.8}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <Text style={styles.trainerName}>by {workout.trainer}</Text>
              </View>
              <View style={styles.workoutThumbnail}>
                <Text style={styles.thumbnailEmoji}>{workout.thumbnail}</Text>
              </View>
            </View>

            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Icon name="timer" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{workout.duration}min</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{workout.exercises} exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="local-fire-department" size={16} color={COLORS.textSecondary} />
                <Text style={styles.statText}>{workout.estimatedCalories} cal</Text>
              </View>
            </View>

            {workout.status === 'in_progress' && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  Progress: {workout.completedExercises}/{workout.exercises}
                </Text>
                <ProgressBar
                  progress={workout.completedExercises / workout.exercises}
                  color={COLORS.primary}
                  style={styles.progressBar}
                />
              </View>
            )}

            <View style={styles.workoutFooter}>
              <Chip
                mode="outlined"
                style={[styles.statusChip, { borderColor: getStatusColor(workout.status) }]}
                textStyle={{ color: getStatusColor(workout.status) }}
                icon={() => <Icon name={getStatusIcon(workout.status)} size={16} color={getStatusColor(workout.status)} />}
              >
                {workout.status.replace('_', ' ').toUpperCase()}
              </Chip>
              <Text style={styles.difficultyText}>{workout.difficulty}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuickStats = () => (
    <View style={styles.quickStatsContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.streakContainer}>
          <TouchableOpacity
            onPress={() => setStreakModalVisible(true)}
            style={styles.streakButton}
          >
            <Text style={styles.streakNumber}>{streak}</Text>
            <Text style={styles.streakLabel}>Day Streak 🔥</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.weeklyProgress}>
          <Text style={styles.progressLabel}>This Week</Text>
          <ProgressBar
            progress={weeklyProgress}
            color="#ffffff"
            style={styles.weeklyProgressBar}
          />
          <Text style={styles.progressText}>
            {mockStats.thisWeek.completed}/{mockStats.thisWeek.total} workouts completed
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.miniStatsRow}>
        <Surface style={styles.miniStat}>
          <Icon name="local-fire-department" size={24} color={COLORS.error} />
          <Text style={styles.miniStatValue}>{mockStats.thisWeek.calories}</Text>
          <Text style={styles.miniStatLabel}>Calories</Text>
        </Surface>
        <Surface style={styles.miniStat}>
          <Icon name="timer" size={24} color={COLORS.primary} />
          <Text style={styles.miniStatValue}>{mockStats.thisWeek.minutes}</Text>
          <Text style={styles.miniStatLabel}>Minutes</Text>
        </Surface>
        <Surface style={styles.miniStat}>
          <Icon name="jump-rope" size={24} color={COLORS.warning} />
          <Text style={styles.miniStatValue}>{mockStats.achievements.filter(a => a.unlocked).length}</Text>
          <Text style={styles.miniStatLabel}>Badges</Text>
        </Surface>
      </View>
    </View>
  );

  const renderFilterChips = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
      contentContainerStyle={styles.filterContent}
    >
      {['all', 'pending', 'in_progress', 'completed'].map((filter) => (
        <Chip
          key={filter}
          mode={activeFilter === filter ? 'flat' : 'outlined'}
          selected={activeFilter === filter}
          onPress={() => {
            setActiveFilter(filter);
            Vibration.vibrate(30);
          }}
          style={[
            styles.filterChip,
            activeFilter === filter && styles.activeFilterChip
          ]}
          textStyle={activeFilter === filter ? styles.activeFilterText : styles.filterText}
        >
          {filter.replace('_', ' ').toUpperCase()}
        </Chip>
      ))}
    </ScrollView>
  );

  const renderWorkoutModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedWorkout && (
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedWorkout.title}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                />
              </View>
              
              <Text style={styles.modalTrainer}>with {selectedWorkout.trainer}</Text>
              <Text style={styles.modalDescription}>{selectedWorkout.description}</Text>
              
              <View style={styles.modalStats}>
                <View style={styles.modalStatItem}>
                  <Icon name="timer" size={20} color={COLORS.primary} />
                  <Text style={styles.modalStatText}>{selectedWorkout.duration} minutes</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Icon name="trending-up" size={20} color={COLORS.warning} />
                  <Text style={styles.modalStatText}>{selectedWorkout.difficulty}</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Icon name="local-fire-department" size={20} color={COLORS.error} />
                  <Text style={styles.modalStatText}>{selectedWorkout.estimatedCalories} calories</Text>
                </View>
              </View>

              <Text style={styles.equipmentLabel}>Equipment needed:</Text>
              <View style={styles.equipmentList}>
                {selectedWorkout.equipment.map((item, index) => (
                  <Chip key={index} mode="outlined" style={styles.equipmentChip}>
                    {item}
                  </Chip>
                ))}
              </View>

              <View style={styles.modalActions}>
                {selectedWorkout.status === 'pending' && (
                  <Button
                    mode="contained"
                    onPress={() => handleStartWorkout(selectedWorkout.id)}
                    style={styles.primaryButton}
                    labelStyle={styles.buttonText}
                  >
                    Start Workout 🚀
                  </Button>
                )}
                {selectedWorkout.status === 'in_progress' && (
                  <Button
                    mode="contained"
                    onPress={() => handleStartWorkout(selectedWorkout.id)}
                    style={styles.primaryButton}
                    labelStyle={styles.buttonText}
                  >
                    Continue Workout ▶️
                  </Button>
                )}
                {selectedWorkout.status === 'completed' && (
                  <Button
                    mode="outlined"
                    onPress={() => handleViewResults(selectedWorkout.id)}
                    style={styles.secondaryButton}
                    labelStyle={styles.secondaryButtonText}
                  >
                    View Results 📊
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>My Workouts 💪</Text>
            <Badge
              visible={filteredWorkouts.filter(w => w.status === 'pending').length > 0}
              style={styles.badge}
            >
              {filteredWorkouts.filter(w => w.status === 'pending').length}
            </Badge>
          </View>
          <Text style={styles.headerSubtitle}>
            Keep pushing your limits! 🚀
          </Text>
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
            progressViewOffset={20}
          />
        }
      >
        {renderQuickStats()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search workouts or trainers..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
            inputStyle={styles.searchInput}
          />
        </View>

        {renderFilterChips()}

        <View style={styles.workoutsList}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Workouts' : 
             activeFilter === 'pending' ? 'Upcoming Workouts' :
             activeFilter === 'in_progress' ? 'In Progress' : 'Completed Workouts'}
          </Text>
          
          <FlatList
            data={filteredWorkouts}
            renderItem={renderWorkoutCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </ScrollView>

      {renderWorkoutModal()}

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => {
          Alert.alert(
            'Feature Coming Soon! 🚧',
            'Custom workout creation will be available in the next update. Stay tuned! 🎯'
          );
        }}
        color="#ffffff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  badge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.error,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  quickStatsContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  streakButton: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  streakLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: SPACING.xs,
  },
  weeklyProgress: {
    alignItems: 'center',
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  weeklyProgressBar: {
    width: width - 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: SPACING.sm,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  miniStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  miniStatLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  searchSection: {
    marginVertical: SPACING.md,
  },
  searchbar: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  filterContent: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginHorizontal: SPACING.xs,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: '#ffffff',
  },
  sectionTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  workoutsList: {
    flex: 1,
    paddingBottom: 100,
  },
  workoutCard: {
    marginBottom: SPACING.md,
  },
  card: {
    borderRadius: 16,
    elevation: 3,
    backgroundColor: COLORS.surface,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.xs,
  },
  trainerName: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
  },
  workoutThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailEmoji: {
    fontSize: 24,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: SPACING.xs,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    borderWidth: 1,
  },
  difficultyText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  separator: {
    height: SPACING.sm,
  },
  modalContainer: {
    padding: SPACING.lg,
  },
  modalCard: {
    borderRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    ...TEXT_STYLES.title,
    flex: 1,
  },
  modalTrainer: {
    ...TEXT_STYLES.caption,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  modalDescription: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modalStats: {
    marginBottom: SPACING.lg,
  },
  modalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalStatText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.sm,
  },
  equipmentLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
  },
  equipmentChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalActions: {
    gap: SPACING.sm,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    borderRadius: 12,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
});

export default MyWorkouts;