import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  Alert,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Card,
  Button,
  Chip,
  ProgressBar,
  Avatar,
  IconButton,
  Surface,
  Searchbar,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import design system constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const WorkoutHistory = ({ navigation }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  // Redux state
  const dispatch = useDispatch();
  const { workoutHistory, user, isLoading } = useSelector(state => ({
    workoutHistory: state.training?.workoutHistory || [],
    user: state.auth?.user || {},
    isLoading: state.training?.isLoading || false,
  }));

  // Mock data for demonstration
  const mockWorkoutHistory = [
    {
      id: '1',
      date: '2025-08-24',
      title: 'Football Training - Endurance Focus',
      sport: 'Football',
      duration: 90,
      intensity: 'High',
      coach: 'Coach Johnson',
      completed: true,
      exercises: [
        { name: 'Warm-up Jog', duration: 10, completed: true },
        { name: 'Sprint Intervals', sets: 8, completed: true },
        { name: 'Ball Control Drills', duration: 30, completed: true },
        { name: 'Cool Down', duration: 10, completed: true },
      ],
      stats: {
        caloriesBurned: 650,
        avgHeartRate: 145,
        maxHeartRate: 178,
        completionRate: 100,
      },
      feedback: 'Great session! Improved sprint times.',
      rating: 5,
    },
    {
      id: '2',
      date: '2025-08-22',
      title: 'Strength & Conditioning',
      sport: 'General Fitness',
      duration: 75,
      intensity: 'Medium',
      coach: 'Trainer Sarah',
      completed: true,
      exercises: [
        { name: 'Squats', sets: 4, reps: 12, weight: '80kg', completed: true },
        { name: 'Bench Press', sets: 3, reps: 10, weight: '70kg', completed: true },
        { name: 'Deadlifts', sets: 3, reps: 8, weight: '90kg', completed: false },
        { name: 'Pull-ups', sets: 3, reps: 8, completed: true },
      ],
      stats: {
        caloriesBurned: 420,
        avgHeartRate: 125,
        maxHeartRate: 155,
        completionRate: 85,
      },
      feedback: 'Good effort, but struggled with deadlifts.',
      rating: 4,
    },
    {
      id: '3',
      date: '2025-08-20',
      title: 'Basketball Skills Training',
      sport: 'Basketball',
      duration: 60,
      intensity: 'Medium',
      coach: 'Coach Mike',
      completed: true,
      exercises: [
        { name: 'Dribbling Drills', duration: 15, completed: true },
        { name: 'Shooting Practice', shots: 50, made: 32, completed: true },
        { name: 'Defensive Slides', duration: 10, completed: true },
        { name: 'Scrimmage', duration: 20, completed: true },
      ],
      stats: {
        caloriesBurned: 380,
        avgHeartRate: 135,
        maxHeartRate: 165,
        completionRate: 100,
      },
      feedback: 'Excellent shooting accuracy today!',
      rating: 5,
    },
  ];

  // Animation on component mount
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchWorkoutHistory());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh workout history');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter workouts based on search and filters
  const filteredWorkouts = mockWorkoutHistory.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workout.coach.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSport = selectedSport === 'all' || workout.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  // Calculate overall stats
  const calculateStats = () => {
    const totalWorkouts = filteredWorkouts.length;
    const completedWorkouts = filteredWorkouts.filter(w => w.completed).length;
    const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = filteredWorkouts.reduce((sum, w) => sum + w.stats.caloriesBurned, 0);
    const avgRating = filteredWorkouts.reduce((sum, w) => sum + w.rating, 0) / totalWorkouts || 0;

    return {
      totalWorkouts,
      completedWorkouts,
      completionRate: totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0,
      totalDuration,
      totalCalories,
      avgRating,
    };
  };

  const stats = calculateStats();

  // Get intensity color
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'High': return COLORS.error;
      case 'Medium': return COLORS.warning || '#ff9500';
      case 'Low': return COLORS.success;
      default: return COLORS.primary;
    }
  };

  // Get sport icon
  const getSportIcon = (sport) => {
    switch (sport) {
      case 'Football': return 'sports-soccer';
      case 'Basketball': return 'sports-basketball';
      case 'Tennis': return 'sports-tennis';
      case 'General Fitness': return 'fitness-center';
      default: return 'sports';
    }
  };

  // Format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render stats overview
  const renderStatsOverview = () => (
    <Surface style={styles.statsContainer} elevation={2}>
      <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
        📊 Your Progress Overview
      </Text>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>{stats.totalWorkouts}</Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Total Sessions</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
            {Math.round(stats.completionRate)}%
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Completion</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.error }]}>
            {Math.round(stats.totalDuration / 60)}h
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Total Time</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[TEXT_STYLES.h2, { color: COLORS.warning || '#ff9500' }]}>
            {Math.round(stats.totalCalories)}
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>Calories</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginBottom: SPACING.xs }]}>
            Monthly Goal Progress 🎯
          </Text>
          <ProgressBar
            progress={0.72}
            color={COLORS.primary}
            style={{ height: 8, borderRadius: 4 }}
          />
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginTop: SPACING.xs }]}>
            18/25 sessions completed this month
          </Text>
        </View>
      </View>
    </Surface>
  );

  // Render filter chips
  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
        {['all', 'week', 'month', 'year'].map((period) => (
          <Chip
            key={period}
            mode={selectedPeriod === period ? 'flat' : 'outlined'}
            selected={selectedPeriod === period}
            onPress={() => setSelectedPeriod(period)}
            style={[styles.filterChip, selectedPeriod === period && styles.selectedChip]}
            textStyle={selectedPeriod === period ? styles.selectedChipText : styles.chipText}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Chip>
        ))}
        
        <View style={styles.chipSeparator} />
        
        {['all', 'Football', 'Basketball', 'General Fitness'].map((sport) => (
          <Chip
            key={sport}
            mode={selectedSport === sport ? 'flat' : 'outlined'}
            selected={selectedSport === sport}
            onPress={() => setSelectedSport(sport)}
            style={[styles.filterChip, selectedSport === sport && styles.selectedChip]}
            textStyle={selectedSport === sport ? styles.selectedChipText : styles.chipText}
            icon={sport !== 'all' ? getSportIcon(sport) : 'filter-list'}
          >
            {sport === 'all' ? 'All Sports' : sport}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  // Render workout card
  const renderWorkoutCard = ({ item, index }) => {
    const isExpanded = expandedWorkout === item.id;
    
    return (
      <Animated.View
        style={[
          styles.workoutCardContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Card style={styles.workoutCard} elevation={3}>
          <TouchableOpacity
            onPress={() => {
              setExpandedWorkout(isExpanded ? null : item.id);
              Vibration.vibrate(30);
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.workoutCardHeader}
            >
              <View style={styles.workoutHeaderContent}>
                <View style={styles.workoutHeaderLeft}>
                  <Icon
                    name={getSportIcon(item.sport)}
                    size={24}
                    color="#ffffff"
                    style={styles.sportIcon}
                  />
                  <View>
                    <Text style={[TEXT_STYLES.h4, { color: '#ffffff' }]}>
                      {item.title}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: '#ffffff90' }]}>
                      {formatDate(item.date)} • {item.coach}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.workoutHeaderRight}>
                  <Chip
                    mode="flat"
                    style={[styles.intensityChip, { backgroundColor: getIntensityColor(item.intensity) + '20' }]}
                    textStyle={[styles.intensityChipText, { color: getIntensityColor(item.intensity) }]}
                  >
                    {item.intensity}
                  </Chip>
                  <Icon
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color="#ffffff"
                  />
                </View>
              </View>
            </LinearGradient>

            <View style={styles.workoutCardBody}>
              <View style={styles.workoutSummary}>
                <View style={styles.summaryItem}>
                  <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                    {formatDuration(item.duration)}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Icon name="local-fire-department" size={16} color={COLORS.error} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                    {item.stats.caloriesBurned} cal
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Icon name="favorite" size={16} color={COLORS.success} />
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                    {item.stats.avgHeartRate} bpm
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name={star <= item.rating ? 'star' : 'star-border'}
                        size={12}
                        color={star <= item.rating ? '#ffd700' : COLORS.textSecondary}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <ProgressBar
                progress={item.stats.completionRate / 100}
                color={item.stats.completionRate === 100 ? COLORS.success : COLORS.warning}
                style={styles.completionProgress}
              />
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, textAlign: 'center' }]}>
                {item.stats.completionRate}% completed
              </Text>
            </View>

            {isExpanded && (
              <Animated.View style={styles.expandedContent}>
                <View style={styles.exerciseList}>
                  <Text style={[TEXT_STYLES.h4, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                    Exercises 💪
                  </Text>
                  
                  {item.exercises.map((exercise, exerciseIndex) => (
                    <View key={exerciseIndex} style={styles.exerciseItem}>
                      <Icon
                        name={exercise.completed ? 'check-circle' : 'radio-button-unchecked'}
                        size={20}
                        color={exercise.completed ? COLORS.success : COLORS.textSecondary}
                      />
                      <View style={styles.exerciseDetails}>
                        <Text style={[TEXT_STYLES.body, { color: COLORS.text }]}>
                          {exercise.name}
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          {exercise.sets && `${exercise.sets} sets`}
                          {exercise.reps && ` × ${exercise.reps} reps`}
                          {exercise.weight && ` @ ${exercise.weight}`}
                          {exercise.duration && `${exercise.duration} minutes`}
                          {exercise.shots && `${exercise.made}/${exercise.shots} shots`}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                {item.feedback && (
                  <View style={styles.feedbackContainer}>
                    <Text style={[TEXT_STYLES.h4, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                      Coach Feedback 💬
                    </Text>
                    <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, fontStyle: 'italic' }]}>
                      "{item.feedback}"
                    </Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
                    style={styles.actionButton}
                  >
                    View Details
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      Alert.alert(
                        'Repeat Workout',
                        'Would you like to add this workout to your upcoming schedule?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Add to Schedule', onPress: () => Alert.alert('Success', 'Workout added to your schedule!') },
                        ]
                      );
                    }}
                    style={styles.actionButton}
                    buttonColor={COLORS.primary}
                  >
                    Repeat Workout
                  </Button>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, { color: '#ffffff' }]}>
            Workout History 📈
          </Text>
          <Text style={[TEXT_STYLES.body, { color: '#ffffff90' }]}>
            Track your fitness journey
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
            title="Pull to refresh"
            titleColor={COLORS.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search workouts, sports, or coaches..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
          />
        </View>

        {/* Stats Overview */}
        {renderStatsOverview()}

        {/* Filter Chips */}
        {renderFilterChips()}

        {/* Workout History List */}
        <View style={styles.workoutList}>
          {filteredWorkouts.length > 0 ? (
            <>
              <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginBottom: SPACING.md }]}>
                Recent Sessions ({filteredWorkouts.length}) 🏃‍♂️
              </Text>
              {filteredWorkouts.map((item, index) => renderWorkoutCard({ item, index }))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="fitness-center" size={80} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { color: COLORS.textSecondary, marginTop: SPACING.md }]}>
                No workouts found
              </Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm }]}>
                Start your fitness journey by booking your first session!
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('BookSession')}
                style={{ marginTop: SPACING.lg }}
                buttonColor={COLORS.primary}
              >
                Book a Session
              </Button>
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: SPACING.xl }} />
      </ScrollView>
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
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  searchContainer: {
    marginVertical: SPACING.md,
  },
  searchbar: {
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressContainer: {
    marginTop: SPACING.sm,
  },
  progressItem: {
    marginBottom: SPACING.sm,
  },
  filterContainer: {
    marginBottom: SPACING.md,
  },
  chipScrollView: {
    flexGrow: 0,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: '#ffffff',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: '#ffffff',
  },
  chipText: {
    color: COLORS.text,
  },
  chipSeparator: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
    alignSelf: 'center',
  },
  workoutList: {
    flex: 1,
  },
  workoutCardContainer: {
    marginBottom: SPACING.md,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  workoutCardHeader: {
    padding: SPACING.md,
  },
  workoutHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sportIcon: {
    marginRight: SPACING.sm,
  },
  workoutHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensityChip: {
    marginRight: SPACING.sm,
  },
  intensityChipText: {
    fontSize: 12,
  },
  workoutCardBody: {
    padding: SPACING.md,
  },
  workoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  completionProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border || '#e0e0e0',
    padding: SPACING.md,
  },
  exerciseList: {
    marginBottom: SPACING.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  exerciseDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  feedbackContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
};

export default WorkoutHistory;