import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FlatList,
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
  FAB,
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
  const listAnim = useState(new Animated.Value(0))[0];

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'rating', 'duration'

  // Redux state
  const dispatch = useDispatch();
  const { workoutHistory, user, isLoading, streak } = useSelector(state => ({
    workoutHistory: state.training?.workoutHistory || [],
    user: state.auth?.user || {},
    isLoading: state.training?.isLoading || false,
    streak: state.training?.streak || 0,
  }));

  // Enhanced mock data
  const mockWorkoutHistory = [
    {
      id: '1',
      date: '2025-08-24',
      title: 'Elite Football Training - Match Prep',
      sport: 'Football',
      duration: 120,
      intensity: 'High',
      coach: 'Coach Johnson',
      coachAvatar: 'https://i.pravatar.cc/150?img=1',
      completed: true,
      type: 'Team Training',
      location: 'Main Field',
      weather: 'Sunny, 24°C',
      exercises: [
        { name: 'Dynamic Warm-up', duration: 15, completed: true, notes: 'Good mobility' },
        { name: 'Sprint Intervals', sets: 10, reps: 30, restTime: 60, completed: true, notes: 'Personal best times' },
        { name: 'Ball Control Drills', duration: 35, completed: true, notes: 'Improved first touch' },
        { name: 'Tactical Positioning', duration: 40, completed: true, notes: 'Great understanding' },
        { name: 'Shooting Practice', shots: 25, goals: 18, completed: true, notes: '72% accuracy' },
        { name: 'Cool Down & Stretch', duration: 15, completed: true },
      ],
      stats: {
        caloriesBurned: 780,
        avgHeartRate: 152,
        maxHeartRate: 185,
        completionRate: 100,
        distance: 8.5,
        topSpeed: 28.3,
        vo2Max: 58,
        recoveryTime: 18,
      },
      feedback: 'Outstanding session! Your sprint times have improved significantly. Keep focusing on that first touch - it was much sharper today.',
      coachRating: 5,
      selfRating: 5,
      difficulty: 9,
      enjoyment: 8,
      tags: ['match-prep', 'speed-work', 'shooting'],
      achievements: ['Speed Demon', 'Sharp Shooter'],
    },
    {
      id: '2',
      date: '2025-08-22',
      title: 'Strength & Power Development',
      sport: 'General Fitness',
      duration: 85,
      intensity: 'High',
      coach: 'Trainer Sarah',
      coachAvatar: 'https://i.pravatar.cc/150?img=2',
      completed: true,
      type: '1-on-1 Training',
      location: 'Elite Gym',
      exercises: [
        { name: 'Compound Warm-up', duration: 10, completed: true },
        { name: 'Back Squats', sets: 5, reps: 5, weight: '95kg', completed: true, notes: 'New PR!' },
        { name: 'Bench Press', sets: 4, reps: 8, weight: '75kg', completed: true },
        { name: 'Romanian Deadlifts', sets: 3, reps: 10, weight: '85kg', completed: true },
        { name: 'Pull-ups (Weighted)', sets: 3, reps: 6, weight: '10kg', completed: false, notes: 'Fatigue on last set' },
        { name: 'Plank Hold', duration: 3, completed: true, notes: '3 minutes!' },
      ],
      stats: {
        caloriesBurned: 520,
        avgHeartRate: 135,
        maxHeartRate: 175,
        completionRate: 92,
        totalWeight: 2450,
        personalRecords: 1,
        restTime: 180,
      },
      feedback: 'Fantastic strength gains! That squat PR shows your dedication is paying off. We need to work on pull-up endurance.',
      coachRating: 4,
      selfRating: 4,
      difficulty: 8,
      enjoyment: 7,
      tags: ['strength', 'power', 'pr'],
      achievements: ['Personal Record'],
    },
    {
      id: '3',
      date: '2025-08-20',
      title: 'Basketball Skills Masterclass',
      sport: 'Basketball',
      duration: 75,
      intensity: 'Medium',
      coach: 'Coach Mike',
      coachAvatar: 'https://i.pravatar.cc/150?img=3',
      completed: true,
      type: 'Skills Session',
      location: 'Indoor Court A',
      exercises: [
        { name: 'Ball Handling Complex', duration: 20, completed: true, notes: 'Much smoother' },
        { name: 'Shooting Form Work', shots: 100, made: 72, completed: true, notes: 'Consistent arc' },
        { name: 'Defensive Footwork', duration: 15, completed: true },
        { name: 'Game Situation Drills', duration: 20, completed: true, notes: 'Better decision making' },
      ],
      stats: {
        caloriesBurned: 450,
        avgHeartRate: 128,
        maxHeartRate: 160,
        completionRate: 100,
        shotAccuracy: 72,
        freeThrows: 18,
        freeThrowsMade: 16,
      },
      feedback: 'Your shooting consistency is really improving! The form work is paying dividends. Keep that follow-through.',
      coachRating: 5,
      selfRating: 4,
      difficulty: 6,
      enjoyment: 9,
      tags: ['shooting', 'skills', 'consistency'],
      achievements: ['Sharpshooter'],
    },
    {
      id: '4',
      date: '2025-08-18',
      title: 'Recovery & Mobility Session',
      sport: 'Recovery',
      duration: 45,
      intensity: 'Low',
      coach: 'Therapist Anna',
      coachAvatar: 'https://i.pravatar.cc/150?img=4',
      completed: true,
      type: 'Recovery Session',
      location: 'Recovery Center',
      exercises: [
        { name: 'Foam Rolling', duration: 15, completed: true, notes: 'Less tight today' },
        { name: 'Dynamic Stretching', duration: 15, completed: true },
        { name: 'Massage Therapy', duration: 15, completed: true, notes: 'Focused on hamstrings' },
      ],
      stats: {
        caloriesBurned: 120,
        avgHeartRate: 85,
        maxHeartRate: 105,
        completionRate: 100,
        flexibilityScore: 8.5,
        stressLevel: 2,
      },
      feedback: 'Great progress on flexibility. Your hamstring tension has decreased significantly.',
      coachRating: 4,
      selfRating: 5,
      difficulty: 2,
      enjoyment: 8,
      tags: ['recovery', 'mobility', 'wellness'],
      achievements: ['Recovery Champion'],
    },
  ];

  // Animation on component mount
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    Animated.sequence([
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
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate([50, 100, 50]);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchWorkoutHistory());
      Alert.alert('✅ Success', 'Workout history updated!', [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to refresh workout history');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Filter and sort workouts
  const filteredAndSortedWorkouts = useMemo(() => {
    let filtered = mockWorkoutHistory.filter(workout => {
      const matchesSearch = workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workout.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workout.coach.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workout.tags?.some(tag => tag.includes(searchQuery.toLowerCase()));
      
      const matchesSport = selectedSport === 'all' || workout.sport === selectedSport;
      
      // Period filtering
      const workoutDate = new Date(workout.date);
      const now = new Date();
      let matchesPeriod = true;
      
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesPeriod = workoutDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          matchesPeriod = workoutDate >= monthAgo;
          break;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          matchesPeriod = workoutDate >= yearAgo;
          break;
      }
      
      return matchesSearch && matchesSport && matchesPeriod;
    });

    // Sort workouts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'rating':
          return (b.coachRating || 0) - (a.coachRating || 0);
        case 'duration':
          return b.duration - a.duration;
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

    return filtered;
  }, [mockWorkoutHistory, searchQuery, selectedSport, selectedPeriod, sortBy]);

  // Calculate comprehensive stats
  const calculateStats = () => {
    const workouts = filteredAndSortedWorkouts;
    const totalWorkouts = workouts.length;
    const completedWorkouts = workouts.filter(w => w.completed).length;
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const totalCalories = workouts.reduce((sum, w) => sum + (w.stats?.caloriesBurned || 0), 0);
    const avgCoachRating = workouts.reduce((sum, w) => sum + (w.coachRating || 0), 0) / totalWorkouts || 0;
    const avgSelfRating = workouts.reduce((sum, w) => sum + (w.selfRating || 0), 0) / totalWorkouts || 0;
    const totalDistance = workouts.reduce((sum, w) => sum + (w.stats?.distance || 0), 0);
    const personalRecords = workouts.reduce((sum, w) => sum + (w.stats?.personalRecords || 0), 0);

    return {
      totalWorkouts,
      completedWorkouts,
      completionRate: totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0,
      totalDuration,
      totalCalories,
      avgCoachRating,
      avgSelfRating,
      totalDistance,
      personalRecords,
      streak: 7, // Mock streak data
    };
  };

  const stats = calculateStats();

  // Get intensity color and icon
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'High': return '#FF6B6B';
      case 'Medium': return '#4ECDC4';
      case 'Low': return '#45B7D1';
      default: return COLORS.primary;
    }
  };

  const getIntensityIcon = (intensity) => {
    switch (intensity) {
      case 'High': return 'whatshot';
      case 'Medium': return 'trending-up';
      case 'Low': return 'self-improvement';
      default: return 'fitness-center';
    }
  };

  // Get sport icon and color
  const getSportIcon = (sport) => {
    switch (sport) {
      case 'Football': return 'sports-soccer';
      case 'Basketball': return 'sports-basketball';
      case 'Tennis': return 'sports-tennis';
      case 'General Fitness': return 'fitness-center';
      case 'Recovery': return 'spa';
      default: return 'sports';
    }
  };

  const getSportColor = (sport) => {
    switch (sport) {
      case 'Football': return '#4CAF50';
      case 'Basketball': return '#FF9800';
      case 'Tennis': return '#2196F3';
      case 'General Fitness': return '#9C27B0';
      case 'Recovery': return '#00BCD4';
      default: return COLORS.primary;
    }
  };

  // Format functions
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Render enhanced stats overview
  const renderStatsOverview = () => (
    <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsGradient}
      >
        <View style={styles.statsHeader}>
          <Text style={[TEXT_STYLES.h3, { color: '#ffffff' }]}>
            🏆 Performance Dashboard
          </Text>
          <View style={styles.streakBadge}>
            <Icon name="local-fire-department" size={16} color="#FFD700" />
            <Text style={[TEXT_STYLES.caption, { color: '#FFD700', marginLeft: 4 }]}>
              {stats.streak} day streak
            </Text>
          </View>
        </View>
        
        <View style={styles.primaryStats}>
          <View style={styles.primaryStatItem}>
            <Text style={[TEXT_STYLES.h1, { color: '#ffffff', fontWeight: 'bold' }]}>
              {stats.totalWorkouts}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#ffffff90' }]}>
              Total Sessions
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.primaryStatItem}>
            <Text style={[TEXT_STYLES.h1, { color: '#ffffff', fontWeight: 'bold' }]}>
              {Math.round(stats.completionRate)}%
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: '#ffffff90' }]}>
              Completion Rate
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      <Surface style={styles.secondaryStats} elevation={1}>
        <View style={styles.statGrid}>
          <View style={styles.statGridItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FF6B6B20' }]}>
              <Icon name="schedule" size={20} color="#FF6B6B" />
            </View>
            <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
              {Math.round(stats.totalDuration / 60)}h
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Total Time
            </Text>
          </View>
          
          <View style={styles.statGridItem}>
            <View style={[styles.statIcon, { backgroundColor: '#4ECDC420' }]}>
              <Icon name="local-fire-department" size={20} color="#4ECDC4" />
            </View>
            <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
              {Math.round(stats.totalCalories / 1000)}k
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Calories
            </Text>
          </View>
          
          <View style={styles.statGridItem}>
            <View style={[styles.statIcon, { backgroundColor: '#45B7D120' }]}>
              <Icon name="directions-run" size={20} color="#45B7D1" />
            </View>
            <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
              {stats.totalDistance?.toFixed(1) || '0'}km
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Distance
            </Text>
          </View>
          
          <View style={styles.statGridItem}>
            <View style={[styles.statIcon, { backgroundColor: '#FFD70020' }]}>
              <Icon name="star" size={20} color="#FFD700" />
            </View>
            <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
              {stats.avgCoachRating?.toFixed(1) || '0'}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Avg Rating
            </Text>
          </View>
        </View>
        
        {stats.personalRecords > 0 && (
          <View style={styles.achievementBanner}>
            <Icon name="jump-rope" size={24} color="#FFD700" />
            <Text style={[TEXT_STYLES.body, { color: COLORS.text, marginLeft: 8 }]}>
              {stats.personalRecords} Personal Record{stats.personalRecords !== 1 ? 's' : ''} this period! 🎉
            </Text>
          </View>
        )}
      </Surface>
    </Animated.View>
  );

  // Render enhanced filter section
  const renderFiltersAndSort = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
        <View style={styles.filterSection}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginRight: SPACING.sm }]}>
            Period:
          </Text>
          {['all', 'week', 'month', 'year'].map((period) => (
            <Chip
              key={period}
              mode={selectedPeriod === period ? 'flat' : 'outlined'}
              selected={selectedPeriod === period}
              onPress={() => {
                setSelectedPeriod(period);
                Vibration.vibrate(30);
              }}
              style={[styles.filterChip, selectedPeriod === period && styles.selectedChip]}
              textStyle={selectedPeriod === period ? styles.selectedChipText : styles.chipText}
            >
              {period === 'all' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
            </Chip>
          ))}
        </View>
        
        <View style={styles.filterDivider} />
        
        <View style={styles.filterSection}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginRight: SPACING.sm }]}>
            Sport:
          </Text>
          {['all', 'Football', 'Basketball', 'General Fitness', 'Recovery'].map((sport) => (
            <Chip
              key={sport}
              mode={selectedSport === sport ? 'flat' : 'outlined'}
              selected={selectedSport === sport}
              onPress={() => {
                setSelectedSport(sport);
                Vibration.vibrate(30);
              }}
              style={[styles.filterChip, selectedSport === sport && styles.selectedChip]}
              textStyle={selectedSport === sport ? styles.selectedChipText : styles.chipText}
              icon={sport !== 'all' ? getSportIcon(sport) : 'filter-list'}
            >
              {sport === 'all' ? 'All' : sport}
            </Chip>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            Alert.alert(
              'Sort Options',
              'Choose how to sort your workouts',
              [
                { text: 'By Date', onPress: () => setSortBy('date') },
                { text: 'By Rating', onPress: () => setSortBy('rating') },
                { text: 'By Duration', onPress: () => setSortBy('duration') },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Icon name="sort" size={20} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, marginLeft: 4 }]}>
            Sort
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render enhanced workout card
  const renderWorkoutCard = ({ item, index }) => {
    const isExpanded = expandedWorkout === item.id;
    const sportColor = getSportColor(item.sport);
    const intensityColor = getIntensityColor(item.intensity);
    
    return (
      <Animated.View
        style={[
          styles.workoutCardContainer,
          {
            opacity: listAnim,
            transform: [
              {
                translateY: listAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Card style={styles.workoutCard} elevation={4}>
          <TouchableOpacity
            onPress={() => {
              setExpandedWorkout(isExpanded ? null : item.id);
              Vibration.vibrate(30);
            }}
            activeOpacity={0.8}
          >
            {/* Enhanced Header */}
            <LinearGradient
              colors={[sportColor + 'DD', sportColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.workoutCardHeader}
            >
              <View style={styles.workoutHeaderTop}>
                <View style={styles.workoutHeaderLeft}>
                  <View style={styles.sportIconContainer}>
                    <Icon name={getSportIcon(item.sport)} size={24} color="#ffffff" />
                  </View>
                  <View style={styles.workoutTitleContainer}>
                    <Text style={[TEXT_STYLES.h4, { color: '#ffffff', fontWeight: 'bold' }]}>
                      {item.title}
                    </Text>
                    <Text style={[TEXT_STYLES.caption, { color: '#ffffff90' }]}>
                      {formatDate(item.date)} • {item.coach}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.workoutHeaderRight}>
                  <View style={[styles.intensityBadge, { backgroundColor: intensityColor + '30' }]}>
                    <Icon name={getIntensityIcon(item.intensity)} size={16} color="#ffffff" />
                    <Text style={[TEXT_STYLES.caption, { color: '#ffffff', marginLeft: 4 }]}>
                      {item.intensity}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.workoutHeaderBottom}>
                <View style={styles.quickStats}>
                  <View style={styles.quickStat}>
                    <Icon name="schedule" size={14} color="#ffffff90" />
                    <Text style={[TEXT_STYLES.caption, { color: '#ffffff90', marginLeft: 2 }]}>
                      {formatDuration(item.duration)}
                    </Text>
                  </View>
                  
                  <View style={styles.quickStat}>
                    <Icon name="local-fire-department" size={14} color="#ffffff90" />
                    <Text style={[TEXT_STYLES.caption, { color: '#ffffff90', marginLeft: 2 }]}>
                      {item.stats?.caloriesBurned || 0} cal
                    </Text>
                  </View>
                  
                  <View style={styles.quickStat}>
                    <Icon name="favorite" size={14} color="#ffffff90" />
                    <Text style={[TEXT_STYLES.caption, { color: '#ffffff90', marginLeft: 2 }]}>
                      {item.stats?.avgHeartRate || 0} bpm
                    </Text>
                  </View>
                </View>
                
                <IconButton
                  icon={isExpanded ? "expand-less" : "expand-more"}
                  size={24}
                  iconColor="#ffffff"
                  onPress={() => {
                    setExpandedWorkout(isExpanded ? null : item.id);
                    Vibration.vibrate(30);
                  }}
                />
              </View>
            </LinearGradient>

            {/* Card Body */}
            <View style={styles.workoutCardBody}>
              {/* Completion Progress */}
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[TEXT_STYLES.body, { color: COLORS.text, fontWeight: '600' }]}>
                    Session Progress
                  </Text>
                  <Text style={[TEXT_STYLES.h4, { color: sportColor }]}>
                    {item.stats?.completionRate || 0}%
                  </Text>
                </View>
                <ProgressBar
                  progress={(item.stats?.completionRate || 0) / 100}
                  color={sportColor}
                  style={styles.progressBar}
                />
              </View>

              {/* Ratings */}
              <View style={styles.ratingsSection}>
                <View style={styles.ratingItem}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Coach Rating
                  </Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name={star <= (item.coachRating || 0) ? 'star' : 'star-border'}
                        size={16}
                        color={star <= (item.coachRating || 0) ? '#FFD700' : COLORS.textSecondary}
                      />
                    ))}
                  </View>
                </View>
                
                <View style={styles.ratingItem}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Your Rating
                  </Text>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name={star <= (item.selfRating || 0) ? 'star' : 'star-border'}
                        size={16}
                        color={star <= (item.selfRating || 0) ? '#FFD700' : COLORS.textSecondary}
                      />
                    ))}
                  </View>
                </View>
              </View>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tagsSection}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {item.tags.map((tag, tagIndex) => (
                      <Chip
                        key={tagIndex}
                        mode="outlined"
                        compact
                        style={[styles.tagChip, { borderColor: sportColor + '50' }]}
                        textStyle={[styles.tagText, { color: sportColor }]}
                      >
                        #{tag}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Achievements */}
              {item.achievements && item.achievements.length > 0 && (
                <View style={styles.achievementsSection}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginBottom: SPACING.xs }]}>
                    Achievements Unlocked 🏆
                  </Text>
                  <View style={styles.achievementsList}>
                    {item.achievements.map((achievement, achIndex) => (
                      <View key={achIndex} style={styles.achievementBadge}>
                        <Icon name="military-tech" size={16} color="#FFD700" />
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.text, marginLeft: 4 }]}>
                          {achievement}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Expanded Content */}
            {isExpanded && (
              <Animated.View style={styles.expandedContent}>
                {/* Detailed Stats */}
                <View style={styles.detailedStats}>
                  <Text style={[TEXT_STYLES.h4, { color: COLORS.text, marginBottom: SPACING.md }]}>
                    📊 Detailed Performance
                  </Text>
                  
                  <View style={styles.statsGrid}>
                    {item.stats?.distance && (
                      <View style={styles.statCard}>
                        <Icon name="straighten" size={20} color={sportColor} />
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          Distance
                        </Text>
                        <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                          {item.stats.distance}km
                        </Text>
                      </View>
                    )}
                    
                    {item.stats?.topSpeed && (
                      <View style={styles.statCard}>
                        <Icon name="speed" size={20} color={sportColor} />
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          Top Speed
                        </Text>
                        <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                          {item.stats.topSpeed} km/h
                        </Text>
                      </View>
                    )}
                    
                    {item.stats?.vo2Max && (
                      <View style={styles.statCard}>
                        <Icon name="air" size={20} color={sportColor} />
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          VO2 Max
                        </Text>
                        <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                          {item.stats.vo2Max}
                        </Text>
                      </View>
                    )}
                    
                    {item.stats?.totalWeight && (
                      <View style={styles.statCard}>
                        <Icon name="fitness-center" size={20} color={sportColor} />
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          Total Weight
                        </Text>
                        <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                          {item.stats.totalWeight}kg
                        </Text>
                      </View>
                    )}
                    
                    {item.stats?.shotAccuracy && (
                      <View style={styles.statCard}>
                        <Icon name="gps-fixed" size={20} color={sportColor} />
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          Shot Accuracy
                        </Text>
                        <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                          {item.stats.shotAccuracy}%
                        </Text>
                      </View>
                    )}
                    
                    {item.stats?.recoveryTime && (
                      <View style={styles.statCard}>
                        <Icon name="restore" size={20} color={sportColor} />
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          Recovery
                        </Text>
                        <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                          {item.stats.recoveryTime}h
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Exercise Breakdown */}
                <View style={styles.exerciseBreakdown}>
                  <Text style={[TEXT_STYLES.h4, { color: COLORS.text, marginBottom: SPACING.md }]}>
                    💪 Exercise Breakdown
                  </Text>
                  
                  {item.exercises?.map((exercise, exerciseIndex) => (
                    <View key={exerciseIndex} style={styles.exerciseItem}>
                      <View style={styles.exerciseHeader}>
                        <Icon
                          name={exercise.completed ? 'check-circle' : 'radio-button-unchecked'}
                          size={24}
                          color={exercise.completed ? COLORS.success : COLORS.textSecondary}
                        />
                        <View style={styles.exerciseInfo}>
                          <Text style={[TEXT_STYLES.body, { color: COLORS.text, fontWeight: '600' }]}>
                            {exercise.name}
                          </Text>
                          <View style={styles.exerciseDetails}>
                            {exercise.sets && (
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                                {exercise.sets} sets
                              </Text>
                            )}
                            {exercise.reps && (
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                                {exercise.sets ? ' × ' : ''}{exercise.reps} reps
                              </Text>
                            )}
                            {exercise.weight && (
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                                @ {exercise.weight}
                              </Text>
                            )}
                            {exercise.duration && (
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                                {exercise.duration} min
                              </Text>
                            )}
                            {exercise.shots && (
                              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                                {exercise.goals || exercise.made}/{exercise.shots} shots
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>
                      
                      {exercise.notes && (
                        <View style={styles.exerciseNotes}>
                          <Icon name="note" size={16} color={COLORS.textSecondary} />
                          <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4, fontStyle: 'italic' }]}>
                            {exercise.notes}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>

                {/* Coach Feedback */}
                {item.feedback && (
                  <View style={styles.feedbackSection}>
                    <View style={styles.feedbackHeader}>
                      <Avatar.Image
                        source={{ uri: item.coachAvatar }}
                        size={32}
                        style={styles.coachAvatar}
                      />
                      <View style={styles.feedbackTitleContainer}>
                        <Text style={[TEXT_STYLES.h4, { color: COLORS.text }]}>
                          Coach Feedback 💬
                        </Text>
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                          from {item.coach}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.feedbackBubble}>
                      <Text style={[TEXT_STYLES.body, { color: COLORS.text, lineHeight: 20 }]}>
                        "{item.feedback}"
                      </Text>
                    </View>
                  </View>
                )}

                {/* Session Info */}
                <View style={styles.sessionInfo}>
                  <Text style={[TEXT_STYLES.h4, { color: COLORS.text, marginBottom: SPACING.sm }]}>
                    📍 Session Details
                  </Text>
                  
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Icon name="place" size={16} color={COLORS.textSecondary} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                        {item.location}
                      </Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Icon name="category" size={16} color={COLORS.textSecondary} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                        {item.type}
                      </Text>
                    </View>
                    
                    {item.weather && (
                      <View style={styles.infoItem}>
                        <Icon name="wb-sunny" size={16} color={COLORS.textSecondary} />
                        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                          {item.weather}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.infoItem}>
                      <Icon name="psychology" size={16} color={COLORS.textSecondary} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                        Difficulty: {item.difficulty}/10
                      </Text>
                    </View>
                    
                    <View style={styles.infoItem}>
                      <Icon name="sentiment-satisfied" size={16} color={COLORS.textSecondary} />
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, marginLeft: 4 }]}>
                        Enjoyment: {item.enjoyment}/10
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => navigation.navigate('WorkoutDetails', { workoutId: item.id })}
                    style={styles.actionButton}
                    contentStyle={styles.buttonContent}
                  >
                    <Icon name="visibility" size={16} />
                    View Full Details
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={() => {
                      Alert.alert(
                        '🔄 Repeat Workout',
                        `Would you like to schedule "${item.title}" for your next session?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Schedule', 
                            onPress: () => {
                              Vibration.vibrate([100, 50, 100]);
                              Alert.alert('✅ Success', 'Workout scheduled successfully!');
                            }
                          },
                        ]
                      );
                    }}
                    style={styles.actionButton}
                    buttonColor={sportColor}
                    contentStyle={styles.buttonContent}
                  >
                    <Icon name="repeat" size={16} />
                    Repeat Session
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
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h2, { color: '#ffffff', fontWeight: 'bold' }]}>
            Workout History 📈
          </Text>
          <Text style={[TEXT_STYLES.body, { color: '#ffffff90', textAlign: 'center' }]}>
            Track your fitness journey and celebrate progress
          </Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Pull to refresh your progress..."
            titleColor={COLORS.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search workouts, sports, coaches, or tags..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor={COLORS.primary}
            inputStyle={TEXT_STYLES.body}
            elevation={2}
          />
        </View>

        {/* Stats Overview */}
        {renderStatsOverview()}

        {/* Filters and Sort */}
        {renderFiltersAndSort()}

        {/* Workout History List */}
        <View style={styles.workoutList}>
          {filteredAndSortedWorkouts.length > 0 ? (
            <>
              <View style={styles.listHeader}>
                <Text style={[TEXT_STYLES.h3, { color: COLORS.text, fontWeight: 'bold' }]}>
                  Training Sessions ({filteredAndSortedWorkouts.length}) 🏃‍♂️
                </Text>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                  Tap to expand details
                </Text>
              </View>
              
              <FlatList
                data={filteredAndSortedWorkouts}
                renderItem={renderWorkoutCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
              />
            </>
          ) : (
            <View style={styles.emptyState}>
              <Animated.View style={[styles.emptyStateContent, { opacity: fadeAnim }]}>
                <LinearGradient
                  colors={['#667eea20', '#764ba220']}
                  style={styles.emptyIconContainer}
                >
                  <Icon name="fitness-center" size={60} color={COLORS.primary} />
                </LinearGradient>
                
                <Text style={[TEXT_STYLES.h3, { color: COLORS.text, marginTop: SPACING.lg, textAlign: 'center' }]}>
                  No workouts found
                </Text>
                <Text style={[TEXT_STYLES.body, { 
                  color: COLORS.textSecondary, 
                  textAlign: 'center', 
                  marginTop: SPACING.sm,
                  lineHeight: 22 
                }]}>
                  {searchQuery 
                    ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                    : 'Ready to start your fitness journey? Book your first training session!'
                  }
                </Text>
                
                {!searchQuery && (
                  <View style={styles.emptyStateActions}>
                    <Button
                      mode="contained"
                      onPress={() => navigation.navigate('BookSession')}
                      style={styles.primaryAction}
                      buttonColor={COLORS.primary}
                      contentStyle={styles.buttonContent}
                    >
                      <Icon name="add" size={18} />
                      Book First Session
                    </Button>
                    
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('FindCoach')}
                      style={styles.secondaryAction}
                      contentStyle={styles.buttonContent}
                    >
                      <Icon name="search" size={18} />
                      Find a Coach
                    </Button>
                  </View>
                )}
              </Animated.View>
            </View>
          )}
        </View>

        {/* Bottom spacing for FAB */}
        <View style={{ height: SPACING.xxl * 2 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {filteredAndSortedWorkouts.length > 0 && (
        <FAB
          icon="add"
          style={[styles.fab, { backgroundColor: COLORS.primary }]}
          color="#ffffff"
          onPress={() => {
            Alert.alert(
              '🎯 Quick Actions',
              'What would you like to do?',
              [
                { 
                  text: 'Book Session', 
                  onPress: () => navigation.navigate('BookSession') 
                },
                { 
                  text: 'Find Coach', 
                  onPress: () => navigation.navigate('FindCoach') 
                },
                { 
                  text: 'View Analytics', 
                  onPress: () => navigation.navigate('Analytics') 
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        />
      )}
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
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  searchbar: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  
  // Stats Overview Styles
  statsContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: SPACING.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  primaryStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ffffff30',
    marginHorizontal: SPACING.lg,
  },
  secondaryStats: {
    backgroundColor: '#ffffff',
    padding: SPACING.lg,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  achievementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70010',
    padding: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  
  // Filters Styles
  filtersContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    padding: SPACING.md,
    elevation: 2,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'transparent',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  chipText: {
    color: COLORS.text,
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.textSecondary + '30',
    marginHorizontal: SPACING.md,
    alignSelf: 'center',
  },
  sortContainer: {
    marginTop: SPACING.sm,
    alignItems: 'flex-end',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  
  // Workout List Styles
  workoutList: {
    paddingHorizontal: SPACING.md,
  },
  listHeader: {
    marginBottom: SPACING.md,
  },
  workoutCardContainer: {
    marginBottom: SPACING.sm,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  // Workout Card Header
  workoutCardHeader: {
    padding: SPACING.md,
  },
  workoutHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  workoutHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  sportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  workoutTitleContainer: {
    flex: 1,
  },
  workoutHeaderRight: {
    alignItems: 'flex-end',
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  workoutHeaderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    flex: 1,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  
  // Workout Card Body
  workoutCardBody: {
    padding: SPACING.md,
    backgroundColor: '#ffffff',
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  ratingsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  ratingItem: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  tagsSection: {
    marginBottom: SPACING.md,
  },
  tagChip: {
    marginRight: SPACING.xs,
    backgroundColor: 'transparent',
  },
  tagText: {
    fontSize: 12,
  },
  achievementsSection: {
    marginBottom: SPACING.sm,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  
  // Expanded Content
  expandedContent: {
    backgroundColor: '#f8f9fa',
    padding: SPACING.md,
  },
  detailedStats: {
    marginBottom: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  
  // Exercise Breakdown
  exerciseBreakdown: {
    marginBottom: SPACING.lg,
  },
  exerciseItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
  exerciseNotes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginLeft: 44,
    backgroundColor: '#f0f0f0',
    padding: SPACING.sm,
    borderRadius: 8,
  },
  
  // Feedback Section
  feedbackSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    elevation: 1,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  coachAvatar: {
    marginRight: SPACING.sm,
  },
  feedbackTitleContainer: {
    flex: 1,
  },
  feedbackBubble: {
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  
  // Session Info
  sessionInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    elevation: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: SPACING.sm,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
  },
  buttonContent: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateActions: {
    width: '100%',
    marginTop: SPACING.xl,
  },
  primaryAction: {
    marginBottom: SPACING.sm,
  },
  secondaryAction: {
    borderColor: COLORS.primary,
  },
  
  // FAB
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
};

export default WorkoutHistory;