import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StatusBar,
  Alert,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Vibration,
  Dimensions,
  Platform,
  FlatList
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
  Modal,
  ProgressBar,
  Divider,
  Menu,
  Checkbox,
  SegmentedButtons
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#333333',
  textLight: '#666666',
  border: '#e0e0e0',
  accent: '#FF6B6B'
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
  h2: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textLight },
  small: { fontSize: 12, color: COLORS.textLight }
};

const { width: screenWidth } = Dimensions.get('window');

const WorkoutHistory = ({ navigation, route }) => {
  // Redux State
  const dispatch = useDispatch();
  const { user, workoutHistory, stats } = useSelector(state => ({
    user: state.auth.user,
    workoutHistory: state.workouts.history,
    stats: state.workouts.stats
  }));

  // Local State
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedFilters, setSelectedFilters] = useState({
    completed: true,
    inProgress: true,
    skipped: true
  });
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Sample workout history data
  const sampleWorkouts = [
    {
      id: '1',
      name: 'Upper Body Strength',
      date: '2024-01-20T09:00:00Z',
      duration: 45,
      status: 'completed',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 12, weight: 80 },
        { name: 'Pull-ups', sets: 3, reps: 10, weight: 0 },
        { name: 'Shoulder Press', sets: 3, reps: 15, weight: 25 }
      ],
      caloriesBurned: 320,
      rating: 4,
      notes: 'Great workout! Increased weight on bench press.',
      muscleGroups: ['Chest', 'Back', 'Shoulders'],
      difficulty: 'Intermediate'
    },
    {
      id: '2',
      name: 'HIIT Cardio Blast',
      date: '2024-01-18T18:30:00Z',
      duration: 30,
      status: 'completed',
      exercises: [
        { name: 'Burpees', sets: 4, reps: 15, weight: 0 },
        { name: 'Mountain Climbers', sets: 4, reps: 20, weight: 0 },
        { name: 'Jump Squats', sets: 4, reps: 12, weight: 0 }
      ],
      caloriesBurned: 280,
      rating: 5,
      notes: 'Intense session! Heart rate stayed high throughout.',
      muscleGroups: ['Full Body', 'Cardio'],
      difficulty: 'Advanced'
    },
    {
      id: '3',
      name: 'Leg Day Power',
      date: '2024-01-16T10:15:00Z',
      duration: 55,
      status: 'completed',
      exercises: [
        { name: 'Squats', sets: 4, reps: 15, weight: 70 },
        { name: 'Deadlifts', sets: 3, reps: 8, weight: 100 },
        { name: 'Lunges', sets: 3, reps: 12, weight: 20 }
      ],
      caloriesBurned: 380,
      rating: 4,
      notes: 'Legs felt strong today. Good form throughout.',
      muscleGroups: ['Legs', 'Glutes'],
      difficulty: 'Advanced'
    },
    {
      id: '4',
      name: 'Core & Flexibility',
      date: '2024-01-14T19:00:00Z',
      duration: 25,
      status: 'inProgress',
      exercises: [
        { name: 'Planks', sets: 3, reps: 60, weight: 0 },
        { name: 'Russian Twists', sets: 3, reps: 30, weight: 10 }
      ],
      caloriesBurned: 150,
      rating: 3,
      notes: 'Cut short due to time constraints.',
      muscleGroups: ['Core', 'Flexibility'],
      difficulty: 'Beginner'
    },
    {
      id: '5',
      name: 'Full Body Circuit',
      date: '2024-01-12T07:00:00Z',
      duration: 0,
      status: 'skipped',
      exercises: [],
      caloriesBurned: 0,
      rating: 0,
      notes: 'Overslept - will reschedule for later.',
      muscleGroups: [],
      difficulty: 'Intermediate'
    }
  ];

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setTranslucent(true);
    
    // Initialize with sample data
    setWorkouts(sampleWorkouts);
    setFilteredWorkouts(sampleWorkouts);
    
    // Entrance animation
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
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...workouts];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(workout =>
        workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.muscleGroups.some(group => 
          group.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    // Apply status filter
    filtered = filtered.filter(workout => selectedFilters[workout.status]);
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(workout => 
        workout.difficulty.toLowerCase() === filterType
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'duration':
          return b.duration - a.duration;
        case 'calories':
          return b.caloriesBurned - a.caloriesBurned;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    
    setFilteredWorkouts(filtered);
  }, [workouts, searchQuery, selectedFilters, filterType, sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'inProgress': return COLORS.warning;
      case 'skipped': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'inProgress': return 'play-circle-outline';
      case 'skipped': return 'cancel';
      default: return 'help-outline';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.textLight;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <MaterialIcons
        key={i}
        name={i < rating ? 'star' : 'star-outline'}
        size={16}
        color={i < rating ? COLORS.warning : COLORS.textLight}
      />
    ));
  };

  const calculateStats = () => {
    const completed = workouts.filter(w => w.status === 'completed');
    const totalWorkouts = completed.length;
    const totalDuration = completed.reduce((acc, w) => acc + w.duration, 0);
    const totalCalories = completed.reduce((acc, w) => acc + w.caloriesBurned, 0);
    const avgRating = completed.reduce((acc, w) => acc + w.rating, 0) / totalWorkouts || 0;
    const completionRate = (totalWorkouts / workouts.length) * 100 || 0;
    
    return {
      totalWorkouts,
      totalDuration,
      totalCalories,
      avgRating: avgRating.toFixed(1),
      completionRate: completionRate.toFixed(0)
    };
  };

  const stats_calc = calculateStats();

  const handleDeleteWorkout = (workoutId) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setWorkouts(prev => prev.filter(w => w.id !== workoutId));
            Vibration.vibrate(100);
          }
        }
      ]
    );
  };

  const renderWorkoutCard = ({ item: workout }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedWorkout(workout);
        setShowWorkoutModal(true);
      }}
      style={{ marginBottom: SPACING.md }}
    >
      <Card style={{ elevation: 3, borderRadius: 12 }}>
        {/* Header with gradient */}
        <LinearGradient
          colors={[getStatusColor(workout.status), getStatusColor(workout.status) + '80']}
          style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
          <Card.Content style={{ padding: SPACING.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.body, { color: 'white', fontWeight: '600' }]}>
                  {workout.name}
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                  {formatDate(workout.date)} • {workout.duration}min
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons 
                  name={getStatusIcon(workout.status)} 
                  size={24} 
                  color="white" 
                />
                <IconButton
                  icon="dots-vertical"
                  iconColor="white"
                  size={20}
                  onPress={() => {
                    Alert.alert('Workout Options', 'Choose an action:', [
                      { text: 'View Details', onPress: () => {
                        setSelectedWorkout(workout);
                        setShowWorkoutModal(true);
                      }},
                      { text: 'Delete', onPress: () => handleDeleteWorkout(workout.id), style: 'destructive' },
                      { text: 'Cancel', style: 'cancel' }
                    ]);
                  }}
                />
              </View>
            </View>
          </Card.Content>
        </LinearGradient>

        {/* Content */}
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                Exercises: {workout.exercises.length}
              </Text>
              <Text style={[TEXT_STYLES.caption, { marginBottom: SPACING.xs }]}>
                Calories: {workout.caloriesBurned}
              </Text>
              {workout.status === 'completed' && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.xs }]}>
                    Rating:
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    {getRatingStars(workout.rating)}
                  </View>
                </View>
              )}
            </View>
            
            <View style={{ alignItems: 'flex-end' }}>
              <Chip
                mode="outlined"
                textStyle={{ fontSize: 10 }}
                style={{
                  backgroundColor: getDifficultyColor(workout.difficulty) + '20',
                  borderColor: getDifficultyColor(workout.difficulty),
                  marginBottom: SPACING.xs
                }}
              >
                {workout.difficulty}
              </Chip>
              
              {workout.muscleGroups.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {workout.muscleGroups.slice(0, 2).map((group, index) => (
                    <Chip
                      key={index}
                      mode="flat"
                      textStyle={{ fontSize: 9 }}
                      style={{ 
                        height: 20,
                        backgroundColor: COLORS.primary + '20',
                        marginLeft: SPACING.xs,
                        marginTop: SPACING.xs
                      }}
                    >
                      {group}
                    </Chip>
                  ))}
                  {workout.muscleGroups.length > 2 && (
                    <Chip
                      mode="flat"
                      textStyle={{ fontSize: 9 }}
                      style={{ 
                        height: 20,
                        backgroundColor: COLORS.textLight + '20',
                        marginLeft: SPACING.xs,
                        marginTop: SPACING.xs
                      }}
                    >
                      +{workout.muscleGroups.length - 2}
                    </Chip>
                  )}
                </View>
              )}
            </View>
          </View>
          
          {workout.notes && (
            <Text style={[TEXT_STYLES.caption, { fontStyle: 'italic', marginTop: SPACING.sm }]}>
              "{workout.notes}"
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderStatsCard = () => (
    <Card style={{ marginBottom: SPACING.md, elevation: 2 }}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
      >
        <Card.Content style={{ padding: SPACING.md }}>
          <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.sm }]}>
            Workout Stats
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>{stats_calc.totalWorkouts}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Completed
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>{Math.floor(stats_calc.totalDuration / 60)}h</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Total Time
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>{stats_calc.totalCalories}</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Calories
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>{stats_calc.avgRating}⭐</Text>
              <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                Avg Rating
              </Text>
            </View>
          </View>
        </Card.Content>
      </LinearGradient>
      
      <Card.Content style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={TEXT_STYLES.body}>Completion Rate</Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.success, fontWeight: '600' }]}>
            {stats_calc.completionRate}%
          </Text>
        </View>
        <ProgressBar 
          progress={stats_calc.completionRate / 100} 
          color={COLORS.success}
          style={{ marginTop: SPACING.xs, height: 8, borderRadius: 4 }}
        />
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{ 
          paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 20,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton
              icon="arrow-back"
              iconColor="white"
              size={24}
              onPress={() => navigation.goBack()}
            />
            <Text style={[TEXT_STYLES.h2, { color: 'white', marginLeft: SPACING.sm }]}>
              Workout History
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="filter-list"
              iconColor="white"
              size={24}
              onPress={() => setShowFilters(true)}
            />
            <Menu
              visible={showMenu}
              onDismiss={() => setShowMenu(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  iconColor="white"
                  size={24}
                  onPress={() => setShowMenu(true)}
                />
              }
            >
              <Menu.Item 
                onPress={() => {
                  setViewMode(viewMode === 'list' ? 'grid' : 'list');
                  setShowMenu(false);
                }} 
                title={viewMode === 'list' ? 'Grid View' : 'List View'}
                leadingIcon={viewMode === 'list' ? 'grid-view' : 'view-list'}
              />
              <Menu.Item 
                onPress={() => {
                  Alert.alert('Export', 'Export workout history feature coming soon!');
                  setShowMenu(false);
                }} 
                title="Export Data" 
                leadingIcon="download"
              />
            </Menu>
          </View>
        </View>
        
        <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)', marginTop: SPACING.xs }]}>
          Track your fitness journey
        </Text>
      </LinearGradient>

      <Animated.View 
        style={{ 
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
        }}
      >
        {/* Search and Filter Controls */}
        <View style={{ padding: SPACING.md }}>
          <Searchbar
            placeholder="Search workouts, notes, muscle groups..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{ marginBottom: SPACING.sm }}
          />
          
          <SegmentedButtons
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            buttons={[
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
              { value: 'all', label: 'All' }
            ]}
            style={{ marginBottom: SPACING.md }}
          />
        </View>

        <FlatList
          data={filteredWorkouts}
          renderItem={renderWorkoutCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SPACING.md }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={renderStatsCard}
          ListEmptyComponent={
            <Card style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <MaterialIcons name="fitness-center" size={64} color={COLORS.textLight} />
              <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginTop: SPACING.md }]}>
                No workouts found
              </Text>
              <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
                Start your fitness journey today!
              </Text>
            </Card>
          }
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>

      {/* Filters Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 12,
            padding: SPACING.md
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>Filters</Text>
          
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
            Workout Status
          </Text>
          {Object.entries(selectedFilters).map(([key, value]) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Checkbox
                status={value ? 'checked' : 'unchecked'}
                onPress={() => setSelectedFilters(prev => ({ ...prev, [key]: !prev[key] }))}
              />
              <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, textTransform: 'capitalize' }]}>
                {key === 'inProgress' ? 'In Progress' : key}
              </Text>
            </View>
          ))}
          
          <Divider style={{ marginVertical: SPACING.md }} />
          
          <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
            Sort By
          </Text>
          <SegmentedButtons
            value={sortBy}
            onValueChange={setSortBy}
            buttons={[
              { value: 'date', label: 'Date' },
              { value: 'duration', label: 'Duration' },
              { value: 'calories', label: 'Calories' },
              { value: 'rating', label: 'Rating' }
            ]}
            style={{ marginBottom: SPACING.md }}
          />
          
          <Button
            mode="contained"
            onPress={() => setShowFilters(false)}
            style={{ backgroundColor: COLORS.primary }}
          >
            Apply Filters
          </Button>
        </Modal>
      </Portal>

      {/* Workout Detail Modal */}
      <Portal>
        <Modal
          visible={showWorkoutModal && selectedWorkout !== null}
          onDismiss={() => setShowWorkoutModal(false)}
          contentContainerStyle={{
            backgroundColor: COLORS.surface,
            margin: SPACING.md,
            borderRadius: 12,
            maxHeight: '80%'
          }}
        >
          {selectedWorkout && (
            <ScrollView style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
                <Text style={TEXT_STYLES.h3}>{selectedWorkout.name}</Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowWorkoutModal(false)}
                />
              </View>
              
              <Card style={{ marginBottom: SPACING.md }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.caption}>Date:</Text>
                    <Text style={TEXT_STYLES.body}>{formatDate(selectedWorkout.date)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.caption}>Duration:</Text>
                    <Text style={TEXT_STYLES.body}>{selectedWorkout.duration} minutes</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.caption}>Calories Burned:</Text>
                    <Text style={TEXT_STYLES.body}>{selectedWorkout.caloriesBurned}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm }}>
                    <Text style={TEXT_STYLES.caption}>Status:</Text>
                    <Chip mode="flat" style={{ backgroundColor: getStatusColor(selectedWorkout.status) + '20' }}>
                      {selectedWorkout.status}
                    </Chip>
                  </View>
                  {selectedWorkout.rating > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={TEXT_STYLES.caption}>Rating:</Text>
                      <View style={{ flexDirection: 'row' }}>
                        {getRatingStars(selectedWorkout.rating)}
                      </View>
                    </View>
                  )}
                </Card.Content>
              </Card>
              
              {selectedWorkout.exercises.length > 0 && (
                <Card style={{ marginBottom: SPACING.md }}>
                  <Card.Content>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                      Exercises ({selectedWorkout.exercises.length})
                    </Text>
                    {selectedWorkout.exercises.map((exercise, index) => (
                      <View key={index} style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: SPACING.sm,
                        borderBottomWidth: index < selectedWorkout.exercises.length - 1 ? 1 : 0,
                        borderBottomColor: COLORS.border
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text style={TEXT_STYLES.body}>{exercise.name}</Text>
                          <Text style={TEXT_STYLES.caption}>
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight > 0 && ` × ${exercise.weight}kg`}
                          </Text>
                        </View>
                        <Avatar.Text 
                          size={32} 
                          label={(index + 1).toString()} 
                          style={{ backgroundColor: COLORS.primary }}
                        />
                      </View>
                    ))}
                  </Card.Content>
                </Card>
              )}
              
              {selectedWorkout.muscleGroups.length > 0 && (
                <Card style={{ marginBottom: SPACING.md }}>
                  <Card.Content>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                      Target Muscle Groups
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {selectedWorkout.muscleGroups.map((group, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          style={{ 
                            margin: SPACING.xs,
                            backgroundColor: COLORS.primary + '20',
                            borderColor: COLORS.primary
                          }}
                        >
                          {group}
                        </Chip>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              )}
              
              {selectedWorkout.notes && (
                <Card style={{ marginBottom: SPACING.md }}>
                  <Card.Content>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.sm }]}>
                      Notes
                    </Text>
                    <Text style={[TEXT_STYLES.body, { fontStyle: 'italic' }]}>
                      "{selectedWorkout.notes}"
                    </Text>
                  </Card.Content>
                </Card>
              )}
              
              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                <Button
                  mode="outlined"
                  icon="content-copy"
                  onPress={() => {
                    Alert.alert('Repeat Workout', 'Would you like to repeat this workout?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Repeat', onPress: () => {
                        Alert.alert('Success! 💪', 'Workout added to your schedule!');
                        setShowWorkoutModal(false);
                      }}
                    ]);
                  }}
                  style={{ flex: 1 }}
                >
                  Repeat
                </Button>
                <Button
                  mode="contained"
                  icon="share"
                  onPress={() => {
                    Alert.alert('Share Workout', 'Share workout feature coming soon!');
                  }}
                  style={{ flex: 1, backgroundColor: COLORS.primary }}
                >
                  Share
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Floating Action Buttons */}
      <View style={{ 
        position: 'absolute',
        bottom: SPACING.lg,
        right: SPACING.lg,
        alignItems: 'flex-end'
      }}>
        <FAB
          icon="add"
          label="New Workout"
          style={{
            backgroundColor: COLORS.primary,
            marginBottom: SPACING.sm
          }}
          onPress={() => {
            Alert.alert('Quick Action', 'Choose an option:', [
              { text: 'Start New Workout', onPress: () => navigation.navigate('WorkoutBuilder') },
              { text: 'Quick Log', onPress: () => Alert.alert('Quick Log', 'Quick log feature coming soon!') },
              { text: 'Cancel', style: 'cancel' }
            ]);
          }}
        />
        
        <FAB
          icon="analytics"
          size="small"
          style={{
            backgroundColor: COLORS.secondary,
          }}
          onPress={() => {
            Alert.alert('Analytics', 'Detailed analytics coming soon!');
          }}
        />
      </View>
    </View>
  );
};

export default WorkoutHistory;