workoutCardContent: {
    flexDirection: 'row',
    padding: SPACING.md,
  },
  workoutIconContainer: {
    marginRight: SPACING.md,
  },
  workoutIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutCardEmoji: {
    fontSize: 24,
  },
  workoutInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  workoutDescription: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  workoutDetails: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  modificationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  smallModificationChip: {
    backgroundColor: COLORS.primary + '20',
    height: 20,
  },
  smallModificationText: {
    fontSize: 9,
    color: COLORS.primary,
  },
  workoutActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listRatingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  playButton: {
    marginTop: SPACING.sm,
  },
  filterSection: {
    marginBottom: SPACING.md,
  },
  filterLabel: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  detailsCard: {
    maxHeight: height * 0.9,
    borderRadius: 20,
    overflow: 'hidden',
  },
  detailsHeader: {
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  detailsEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  detailsTitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  detailsSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  detailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statColumn: {
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  detailsContent: {
    padding: SPACING.lg,
  },
  detailSection: {
    marginBottom: SPACING.lg,
  },
  detailSectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  originalWorkout: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.xs,
  },
  modificationReason: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  modificationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  detailModificationChip: {
    backgroundColor: COLORS.primary + '20',
  },
  detailModificationText: {
    color: COLORS.primary,
    fontSize: 12,
  },
  equipmentList: {
    gap: SPACING.sm,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  equipmentText: {
    color: COLORS.text,
  },
  bodyPartsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  bodyPartChip: {
    backgroundColor: COLORS.success + '20',
  },
  bodyPartText: {
    color: COLORS.success,
    fontSize: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  benefitText: {
    color: COLORS.text,
    flex: 1,
  },
  detailActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  detailActionButton: {
    flex: 1,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  customizationCard: {
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: SPACING.lg,
  },
  customizeSubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  customizeSection: {
    marginBottom: SPACING.lg,
  },
  customizeSectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    backgroundColor: '#f5f5f5',
  },
  durationSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  durationLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  sliderContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    width: '60%',
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    left: '60%',
    width: 20,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    marginLeft: -10,
    elevation: 2,
  },
  modificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  modificationOptionText: {
    flex: 1,
    color: COLORS.text,
  },
  customizeActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  customizeActionButton: {
    flex: 1,
  },import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  Animated,
  RefreshControl,
  Platform,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  Avatar,
  IconButton,
  FAB,
  Portal,
  Modal,
  Searchbar,
  SegmentedButtons,
  Switch,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const WORKOUT_FILTER_TYPES = {
  RECOMMENDED: 'recommended',
  ALL: 'all',
};

const CATEGORIES = [
  { value: 'all', label: 'All Workouts', icon: 'fitness-center' },
  { value: 'injury', label: 'Injury Recovery', icon: 'healing' },
  { value: 'mobility', label: 'Mobility Limited', icon: 'accessible' },
  { value: 'pregnancy', label: 'Pregnancy Safe', icon: 'pregnant-woman' },
  { value: 'seniors', label: 'Senior Friendly', icon: 'elderly' },
  { value: 'lowimpact', label: 'Low Impact', icon: 'directions-walk' }
];

const FILTER_OPTIONS = {
  difficulty: ['All', 'Beginner', 'Intermediate', 'Advanced'],
  duration: ['All', '< 15 min', '15-30 min', '> 30 min'],
  equipment: ['All', 'No Equipment', 'Chair Only', 'Light Weights', 'Resistance Bands'],
  bodyPart: ['All', 'Full Body', 'Upper Body', 'Lower Body', 'Core', 'Arms', 'Legs'],
  modification: ['All', 'Low Impact', 'Chair-Based', 'No Jumping', 'Injury Recovery']
};

const SAMPLE_WORKOUTS = [
  {
    id: 1,
    title: 'Chair-Based Upper Body Strength',
    description: 'Complete upper body workout performed while seated',
    difficulty: 'Beginner',
    duration: '20 min',
    modifications: ['Chair-Based', 'Low Impact'],
    equipment: ['Chair', 'Light Weights'],
    bodyParts: ['Arms', 'Shoulders', 'Core'],
    exercises: 12,
    calories: 150,
    rating: 4.8,
    image: '🪑',
    color: COLORS.primary,
    originalWorkout: 'Upper Body Strength Training',
    modificationReason: 'Mobility limitations, seated alternative',
    benefits: ['Builds strength', 'Improves posture', 'Safe for all mobility levels']
  },
  {
    id: 2,
    title: 'Low-Impact Cardio Blast',
    description: 'Heart-pumping cardio without jumping or high impact',
    difficulty: 'Intermediate',
    duration: '25 min',
    modifications: ['Low Impact', 'No Jumping'],
    equipment: ['None'],
    bodyParts: ['Full Body'],
    exercises: 15,
    calories: 220,
    rating: 4.6,
    image: '🚶‍♀️',
    color: COLORS.success,
    originalWorkout: 'HIIT Cardio Training',
    modificationReason: 'Joint protection, injury prevention',
    benefits: ['Cardio fitness', 'Joint-friendly', 'Builds endurance']
  },
  {
    id: 3,
    title: 'Prenatal Core & Flexibility',
    description: 'Safe core strengthening and stretching for expecting mothers',
    difficulty: 'Beginner',
    duration: '18 min',
    modifications: ['Pregnancy Safe', 'Low Impact'],
    equipment: ['Yoga Mat', 'Pillow'],
    bodyParts: ['Core', 'Hips', 'Back'],
    exercises: 10,
    calories: 120,
    rating: 4.9,
    image: '🤱',
    color: '#ff6b9d',
    originalWorkout: 'Core Strength Training',
    modificationReason: 'Pregnancy safety modifications',
    benefits: ['Safe for pregnancy', 'Reduces back pain', 'Improves flexibility']
  },
  {
    id: 4,
    title: 'Senior-Friendly Balance Training',
    description: 'Improve balance and coordination with gentle movements',
    difficulty: 'Beginner',
    duration: '15 min',
    modifications: ['Seniors', 'Balance Focus', 'Low Impact'],
    equipment: ['Chair for Support'],
    bodyParts: ['Legs', 'Core', 'Balance'],
    exercises: 8,
    calories: 80,
    rating: 4.7,
    image: '👴',
    color: '#4ecdc4',
    originalWorkout: 'Balance & Stability Training',
    modificationReason: 'Age-appropriate, fall prevention',
    benefits: ['Prevents falls', 'Improves stability', 'Builds confidence']
  },
  {
    id: 5,
    title: 'Post-Injury Knee Recovery',
    description: 'Gentle exercises to rebuild knee strength and mobility',
    difficulty: 'Beginner',
    duration: '22 min',
    modifications: ['Injury Recovery', 'Low Impact', 'No Squats'],
    equipment: ['Resistance Band', 'Chair'],
    bodyParts: ['Legs', 'Glutes', 'Core'],
    exercises: 9,
    calories: 140,
    rating: 4.5,
    image: '🦵',
    color: '#ffa726',
    originalWorkout: 'Lower Body Strength',
    modificationReason: 'Knee injury rehabilitation',
    benefits: ['Rebuilds strength', 'Improves mobility', 'Safe progression']
  },
  {
    id: 6,
    title: 'Back-Friendly Core Workout',
    description: 'Strengthen your core without straining your back',
    difficulty: 'Intermediate',
    duration: '16 min',
    modifications: ['Back Issues', 'No Crunches', 'Supported'],
    equipment: ['Yoga Mat', 'Pillow'],
    bodyParts: ['Core', 'Hips'],
    exercises: 11,
    calories: 130,
    rating: 4.8,
    image: '🤸‍♀️',
    color: '#ab47bc',
    originalWorkout: 'Abs & Core Training',
    modificationReason: 'Back pain prevention and safety',
    benefits: ['Protects spine', 'Builds core strength', 'Reduces back pain']
  }
];

const DEFAULT_MODIFICATION_PREFS = {
  lowImpact: false,
  chairBased: false,
  noJumping: false,
  armInjury: false,
  legInjury: false,
  backIssues: false,
  pregnancy: false,
  seniors: false,
};

const DEFAULT_FILTERS = {
  difficulty: 'all',
  duration: 'all',
  equipment: 'all',
  bodyPart: 'all',
  modification: 'all'
};

const ModifiedWorkouts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, trainingData, preferences } = useSelector(state => state.user);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [workoutFilter, setWorkoutFilter] = useState(WORKOUT_FILTER_TYPES.RECOMMENDED);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [modificationPrefs, setModificationPrefs] = useState({
    ...DEFAULT_MODIFICATION_PREFS,
    ...user?.preferences
  });

  // Initialize animations
  useEffect(() => {
    const animations = [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ];

    Animated.parallel(animations).start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call for updated workouts
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Modified workouts updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh workouts');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const matchesCategory = useCallback((workout, category) => {
    if (category === 'all') return true;
    
    const categoryMap = {
      injury: 'Injury Recovery',
      mobility: 'Chair-Based',
      pregnancy: 'Pregnancy Safe',
      seniors: 'Seniors',
      lowimpact: 'Low Impact'
    };
    
    return workout.modifications.includes(categoryMap[category]);
  }, []);

  const matchesDurationFilter = useCallback((workout, durationFilter) => {
    if (durationFilter === 'all') return true;
    
    const duration = parseInt(workout.duration);
    switch (durationFilter) {
      case '< 15 min':
        return duration < 15;
      case '15-30 min':
        return duration >= 15 && duration <= 30;
      case '> 30 min':
        return duration > 30;
      default:
        return true;
    }
  }, []);

  const filteredWorkouts = useCallback(() => {
    return SAMPLE_WORKOUTS.filter(workout => {
      const matchesSearch = [
        workout.title,
        workout.description,
        ...workout.modifications
      ].some(text => text.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCat = matchesCategory(workout, selectedCategory);
      const matchesFilters = (
        (filters.difficulty === 'all' || workout.difficulty === filters.difficulty) &&
        matchesDurationFilter(workout, filters.duration)
      );

      return matchesSearch && matchesCat && matchesFilters;
    });
  }, [searchQuery, selectedCategory, filters, matchesCategory, matchesDurationFilter]);

  const getRecommendedWorkouts = useCallback(() => {
    return SAMPLE_WORKOUTS.filter(workout => {
      // Check user preferences
      const prefMatches = Object.entries(modificationPrefs).some(([key, value]) => {
        if (!value) return false;
        
        switch (key) {
          case 'lowImpact':
            <Text style={[TEXT_STYLES.h4, styles.filterSectionTitle]}>
              Additional Filters
            </Text>
            
            {Object.entries(FILTER_OPTIONS).map(([filterType, options]) => (
              <View key={filterType} style={styles.filterSection}>
                <Text style={[TEXT_STYLES.body, styles.filterLabel]}>
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterOptions}>
                    {options.map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setFilters(prev => ({
                          ...prev,
                          [filterType]: option.toLowerCase() === 'all' ? 'all' : option
                        }))}
                        style={[
                          styles.filterOption,
                          filters[filterType] === (option.toLowerCase() === 'all' ? 'all' : option) && 
                          styles.filterOptionActive
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterOptionText,
                            filters[filterType] === (option.toLowerCase() === 'all' ? 'all' : option) && 
                            styles.filterOptionTextActive
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ))}
            return workout.modifications.includes('Low Impact');
          case 'chairBased':
            return workout.modifications.includes('Chair-Based');
          case 'pregnancy':
            return workout.modifications.includes('Pregnancy Safe');
          case 'seniors':
            return workout.modifications.includes('Seniors');
          case 'armInjury':
            return !workout.bodyParts.some(part => ['Arms', 'Shoulders'].includes(part));
          case 'legInjury':
            return workout.modifications.includes('Injury Recovery');
          default:
            return false;
        }
      });
      
      return prefMatches || workout.rating >= 4.5;
    }).slice(0, 3);
  }, [modificationPrefs]);

  const startWorkout = useCallback((workout) => {
    Alert.alert(
      'Start Modified Workout',
      `Ready to begin "${workout.title}"?\n\nThis workout has been specially modified for: ${workout.modifications.join(', ')}`,
      [
        { text: 'Customize First', onPress: () => openCustomization(workout) },
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Now', 
          onPress: () => {
            dispatch({
              type: 'START_MODIFIED_WORKOUT',
              payload: { workout, startTime: new Date().toISOString() }
            });
            navigation.navigate('WorkoutSession', { workout });
          }
        }
      ]
    );
  }, [dispatch, navigation]);

  const openCustomization = useCallback((workout) => {
    setSelectedWorkout(workout);
    setShowCustomization(true);
  }, []);

  const saveModificationPreferences = useCallback(() => {
    dispatch({
      type: 'UPDATE_USER_PREFERENCES',
      payload: { modificationPrefs }
    });
    Alert.alert('Saved', 'Your modification preferences have been updated!');
  }, [dispatch, modificationPrefs]);

  const clearAllFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>
          Modified Workouts
        </Text>
        <TouchableOpacity 
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          <Icon name="tune" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={[TEXT_STYLES.body, styles.headerSubtitle]}>
        Adapted workouts for your needs
      </Text>
    </LinearGradient>
  );

  const renderSearchAndCategories = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search modified workouts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        iconColor={COLORS.primary}
        inputStyle={TEXT_STYLES.body}
      />
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
        style={styles.categoriesContainer}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.value}
            onPress={() => setSelectedCategory(category.value)}
            style={[
              styles.categoryChip,
              selectedCategory === category.value && styles.categoryChipActive
            ]}
          >
            <Icon
              name={category.icon}
              size={18}
              color={selectedCategory === category.value ? 'white' : COLORS.primary}
              style={styles.categoryIcon}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.value && styles.categoryTextActive
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderRecommendedWorkoutCard = (workout) => (
    <Card key={workout.id} style={styles.recommendedCard}>
      <LinearGradient
        colors={[workout.color, `${workout.color}CC`]}
        style={styles.recommendedGradient}
      >
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutEmoji}>{workout.image}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{workout.rating}</Text>
          </View>
        </View>
        
        <Text style={[TEXT_STYLES.h4, styles.workoutTitle]}>
          {workout.title}
        </Text>
        
        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>{workout.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="local-fire-department" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>{workout.calories} cal</Text>
          </View>
        </View>
        
        <View style={styles.modificationsContainer}>
          {workout.modifications.slice(0, 2).map((mod, index) => (
            <Chip
              key={index}
              style={styles.modificationChip}
              textStyle={styles.modificationChipText}
            >
              {mod}
            </Chip>
          ))}
        </View>
        
        <Button
          mode="contained"
          onPress={() => {
            setSelectedWorkout(workout);
            setShowWorkoutDetails(true);
          }}
          style={styles.viewButton}
          labelStyle={styles.viewButtonText}
          compact
        >
          View Details
        </Button>
      </LinearGradient>
    </Card>
  );

  const renderWorkoutListCard = (workout) => (
    <Card style={styles.workoutCard}>
      <View style={styles.workoutCardContent}>
        <View style={styles.workoutIconContainer}>
          <LinearGradient
            colors={[workout.color, `${workout.color}AA`]}
            style={styles.workoutIconGradient}
          >
            <Text style={styles.workoutCardEmoji}>{workout.image}</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.workoutInfo}>
          <Text style={[TEXT_STYLES.h4, styles.workoutTitle]}>
            {workout.title}
          </Text>
          <Text style={[TEXT_STYLES.body, styles.workoutDescription]}>
            {workout.description}
          </Text>
          
          <View style={styles.workoutDetails}>
            <View style={styles.detailItem}>
              <Icon name="signal-cellular-alt" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{workout.difficulty}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{workout.duration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailText}>{workout.exercises} exercises</Text>
            </View>
          </View>
          
          <View style={styles.modificationsRow}>
            {workout.modifications.slice(0, 3).map((mod, index) => (
              <Chip
                key={index}
                style={styles.smallModificationChip}
                textStyle={styles.smallModificationText}
                compact
              >
                {mod}
              </Chip>
            ))}
          </View>
        </View>
        
        <View style={styles.workoutActions}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={18} color="#FFD700" />
            <Text style={[TEXT_STYLES.caption, styles.listRatingText]}>
              {workout.rating}
            </Text>
          </View>
          <IconButton
            icon="play-arrow"
            size={24}
            iconColor="white"
            style={[styles.playButton, { backgroundColor: workout.color }]}
            onPress={() => startWorkout(workout)}
          />
        </View>
      </View>
    </Card>
  );

  const renderRecommendedSection = () => {
    const recommended = getRecommendedWorkouts();
    
    return (
      <View style={styles.recommendedSection}>
        <View style={styles.sectionHeader}>
          <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
            Recommended for You
          </Text>
          <TouchableOpacity
            onPress={() => setWorkoutFilter(
              workoutFilter === WORKOUT_FILTER_TYPES.RECOMMENDED 
                ? WORKOUT_FILTER_TYPES.ALL 
                : WORKOUT_FILTER_TYPES.RECOMMENDED
            )}
          >
            <Text style={[TEXT_STYLES.caption, styles.seeAllText]}>
              {workoutFilter === WORKOUT_FILTER_TYPES.RECOMMENDED ? 'See All' : 'Recommended'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recommendedScroll}
        >
          {recommended.map((workout) => renderRecommendedWorkoutCard(workout))}
        </ScrollView>
      </View>
    );
  };

  const renderWorkoutList = () => {
    const workouts = filteredWorkouts();
    
    return (
      <View style={styles.workoutListSection}>
        <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
          All Modified Workouts ({workouts.length})
        </Text>
        
        {workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            onPress={() => {
              setSelectedWorkout(workout);
              setShowWorkoutDetails(true);
            }}
            style={styles.workoutListItem}
          >
            {renderWorkoutListCard(workout)}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFiltersModal = () => (
    <Portal>
      <Modal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.filtersCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
              Filter Workouts
            </Text>
            
            <Text style={[TEXT_STYLES.h4, styles.filterSectionTitle]}>
              Your Modification Preferences
            </Text>
            
            {Object.entries(modificationPrefs).map(([key, value]) => (
              <View key={key} style={styles.preferenceRow}>
                <Text style={[TEXT_STYLES.body, styles.preferenceLabel]}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <Switch
                  value={value}
                  onValueChange={(newValue) => 
                    setModificationPrefs(prev => ({ ...prev, [key]: newValue }))
                  }
                  color={COLORS.primary}
                />
              </View>
            ))}
            
            <Button
              mode="outlined"
              onPress={saveModificationPreferences}
              style={styles.savePrefsButton}
            >
              Save Preferences
            </Button>
            
            <View style={styles.filterActions}>
              <Button
                mode="outlined"
                onPress={clearAllFilters}
                style={styles.filterActionButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFilters(false)}
                style={styles.filterActionButton}
              >
                Apply Filters
              </Button>
            </View>
          </ScrollView>
        </Card>
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
      
      {renderHeader()}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <Animated.View 
          style={[
            styles.mainContent, 
            { 
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {renderSearchAndCategories()}
          {renderRecommendedSection()}
          {renderWorkoutList()}
        </Animated.View>
      </ScrollView>

  const renderWorkoutDetailsModal = () => (
    <Portal>
      <Modal
        visible={showWorkoutDetails}
        onDismiss={() => setShowWorkoutDetails(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedWorkout && (
          <Card style={styles.detailsCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <LinearGradient
                colors={[selectedWorkout.color, `${selectedWorkout.color}AA`]}
                style={styles.detailsHeader}
              >
                <TouchableOpacity
                  onPress={() => setShowWorkoutDetails(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
                
                <Text style={styles.detailsEmoji}>{selectedWorkout.image}</Text>
                <Text style={[TEXT_STYLES.h2, styles.detailsTitle]}>
                  {selectedWorkout.title}
                </Text>
                <Text style={[TEXT_STYLES.body, styles.detailsSubtitle]}>
                  {selectedWorkout.description}
                </Text>
                
                <View style={styles.detailsStats}>
                  <View style={styles.statColumn}>
                    <Text style={styles.statValue}>{selectedWorkout.duration}</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statValue}>{selectedWorkout.exercises}</Text>
                    <Text style={styles.statLabel}>Exercises</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statValue}>{selectedWorkout.calories}</Text>
                    <Text style={styles.statLabel}>Calories</Text>
                  </View>
                  <View style={styles.statColumn}>
                    <Text style={styles.statValue}>{selectedWorkout.rating}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                </View>
              </LinearGradient>
              
              <View style={styles.detailsContent}>
                <View style={styles.detailSection}>
                  <Text style={[TEXT_STYLES.h4, styles.detailSectionTitle]}>
                    Modifications Applied
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.originalWorkout]}>
                    Modified from: {selectedWorkout.originalWorkout}
                  </Text>
                  <Text style={[TEXT_STYLES.body, styles.modificationReason]}>
                    Reason: {selectedWorkout.modificationReason}
                  </Text>
                  <View style={styles.modificationsList}>
                    {selectedWorkout.modifications.map((mod, index) => (
                      <Chip
                        key={index}
                        style={styles.detailModificationChip}
                        textStyle={styles.detailModificationText}
                      >
                        {mod}
                      </Chip>
                    ))}
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={[TEXT_STYLES.h4, styles.detailSectionTitle]}>
                    Equipment Needed
                  </Text>
                  <View style={styles.equipmentList}>
                    {selectedWorkout.equipment.map((item, index) => (
                      <View key={index} style={styles.equipmentItem}>
                        <Icon name="check-circle" size={16} color={COLORS.success} />
                        <Text style={[TEXT_STYLES.body, styles.equipmentText]}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={[TEXT_STYLES.h4, styles.detailSectionTitle]}>
                    Target Areas
                  </Text>
                  <View style={styles.bodyPartsList}>
                    {selectedWorkout.bodyParts.map((part, index) => (
                      <Chip
                        key={index}
                        style={styles.bodyPartChip}
                        textStyle={styles.bodyPartText}
                      >
                        {part}
                      </Chip>
                    ))}
                  </View>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={[TEXT_STYLES.h4, styles.detailSectionTitle]}>
                    Benefits
                  </Text>
                  {selectedWorkout.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Icon name="star" size={16} color="#FFD700" />
                      <Text style={[TEXT_STYLES.body, styles.benefitText]}>
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.detailActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowWorkoutDetails(false);
                      openCustomization(selectedWorkout);
                    }}
                    style={styles.detailActionButton}
                  >
                    Customize
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => {
                      setShowWorkoutDetails(false);
                      startWorkout(selectedWorkout);
                    }}
                    style={[styles.detailActionButton, { backgroundColor: selectedWorkout.color }]}
                    labelStyle={styles.startButtonText}
                  >
                    Start Workout
                  </Button>
                </View>
              </View>
            </ScrollView>
          </Card>
        )}
      </Modal>
    </Portal>
  );

  const renderCustomizationModal = () => (
    <Portal>
      <Modal
        visible={showCustomization}
        onDismiss={() => setShowCustomization(false)}
        contentContainerStyle={styles.modalContainer}
      >
        {selectedWorkout && (
          <Card style={styles.customizationCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>
                Customize Workout
              </Text>
              <Text style={[TEXT_STYLES.body, styles.customizeSubtitle]}>
                Adjust "{selectedWorkout.title}" to your needs
              </Text>
              
              <View style={styles.customizeSection}>
                <Text style={[TEXT_STYLES.h4, styles.customizeSectionTitle]}>
                  Workout Intensity
                </Text>
                <SegmentedButtons
                  value="moderate"
                  onValueChange={() => {}}
                  buttons={[
                    { value: 'light', label: 'Light' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'challenging', label: 'Challenging' }
                  ]}
                  style={styles.segmentedButtons}
                />
              </View>
              
              <View style={styles.customizeSection}>
                <Text style={[TEXT_STYLES.h4, styles.customizeSectionTitle]}>
                  Duration Adjustment
                </Text>
                <View style={styles.durationSlider}>
                  <Text style={styles.durationLabel}>15 min</Text>
                  <View style={styles.sliderContainer}>
                    <View style={styles.sliderTrack} />
                    <View style={styles.sliderThumb} />
                  </View>
                  <Text style={styles.durationLabel}>45 min</Text>
                </View>
              </View>
              
              <View style={styles.customizeSection}>
                <Text style={[TEXT_STYLES.h4, styles.customizeSectionTitle]}>
                  Additional Modifications
                </Text>
                {[
                  'Remove high-impact movements',
                  'Add extra rest between exercises',
                  'Include warm-up extensions',
                  'Add cool-down stretches',
                  'Provide exercise alternatives'
                ].map((option, index) => (
                  <View key={index} style={styles.modificationOption}>
                    <Switch
                      value={index < 2}
                      onValueChange={() => {}}
                      color={COLORS.primary}
                    />
                    <Text style={[TEXT_STYLES.body, styles.modificationOptionText]}>
                      {option}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.customizeActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowCustomization(false)}
                  style={styles.customizeActionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowCustomization(false);
                    Alert.alert('Customized!', 'Workout has been customized to your preferences!');
                  }}
                  style={styles.customizeActionButton}
                  buttonColor={selectedWorkout.color}
                >
                  Apply Changes
                </Button>
              </View>
            </ScrollView>
          </Card>
        )}
      </Modal>
    </Portal>
  );

      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => Alert.alert('Coming Soon', 'Create custom modified workout feature in development!')}
        label="Create"
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
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterButton: {
    padding: SPACING.xs,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mainContent: {
    flex: 1,
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: SPACING.md,
  },
  searchbar: {
    marginBottom: SPACING.md,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
  },
  categoriesContainer: {
    marginBottom: SPACING.sm,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    marginRight: SPACING.xs,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  recommendedSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  recommendedScroll: {
    paddingHorizontal: SPACING.xs,
  },
  recommendedCard: {
    width: width * 0.75,
    marginRight: SPACING.md,
    borderRadius: 15,
    elevation: 6,
    overflow: 'hidden',
  },
  recommendedGradient: {
    padding: SPACING.md,
    minHeight: 240,
  },
  workoutCard: {
    borderRadius: 15,
    elevation: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  workoutCardContent: {
    padding: SPACING.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  workoutEmoji: {
    fontSize: 28,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  workoutTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  modificationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  modificationChip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    height: 24,
  },
  modificationChipText: {
    color: 'white',
    fontSize: 10,
  },
  viewButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 'auto',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
  },
  workoutListSection: {
    paddingHorizontal: SPACING.md,
  },
  workoutListItem: {
    marginBottom: SPACING.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  filtersCard: {
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: SPACING.lg,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text,
  },
  filterSectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginTop: SPACING.md,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLabel: {
    flex: 1,
    color: COLORS.text,
  },
  savePrefsButton: {
    marginVertical: SPACING.md,
    borderColor: COLORS.primary,
  },
  filterActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  filterActionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ModifiedWorkouts;
