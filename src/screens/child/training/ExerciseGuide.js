import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  Animated,
  Vibration,
  ImageBackground,
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
  Portal,
  Modal,
  Searchbar,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f5f5f5',
  white: '#ffffff',
  text: '#333333',
  textLight: '#666666',
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
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 14, color: COLORS.textLight },
};

const { width, height } = Dimensions.get('window');

const ExerciseGuide = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, favoriteExercises, loading } = useSelector(state => ({
    user: state.auth.user,
    favoriteExercises: state.training.favoriteExercises || [],
    loading: state.training.loading,
  }));

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('all');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [completedExercises, setCompletedExercises] = useState(new Set());
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  // Mock exercises data
  const mockExercises = [
    {
      id: 1,
      name: 'Jumping Jacks',
      emoji: '🤸‍♂️',
      category: 'cardio',
      muscleGroup: 'full-body',
      difficulty: 'beginner',
      duration: 30,
      calories: 25,
      description: 'A fun full-body exercise that gets your heart pumping!',
      benefits: ['Improves coordination', 'Boosts heart health', 'Burns calories'],
      instructions: [
        'Stand straight with feet together and arms at your sides',
        'Jump up and spread your legs shoulder-width apart',
        'At the same time, raise your arms above your head',
        'Jump back to starting position',
        'Repeat at a steady pace'
      ],
      tips: [
        'Keep your core engaged',
        'Land softly on your toes',
        'Breathe steadily throughout',
        'Start slow and build up speed'
      ],
      equipment: ['None - Bodyweight only!'],
      videoThumbnail: null,
      safetyNotes: ['Make sure you have enough space around you', 'Wear proper shoes'],
      modifications: ['Step side to side instead of jumping if needed'],
    },
    {
      id: 2,
      name: 'Push-ups (Kid Version)',
      emoji: '💪',
      category: 'strength',
      muscleGroup: 'upper-body',
      difficulty: 'beginner',
      duration: 45,
      calories: 15,
      description: 'Build strong arms and chest with this classic exercise!',
      benefits: ['Strengthens arms', 'Builds chest muscles', 'Improves posture'],
      instructions: [
        'Start on your knees and hands',
        'Keep your back straight like a plank',
        'Lower your body by bending your arms',
        'Push back up to starting position',
        'Keep your head looking forward'
      ],
      tips: [
        'Start with knee push-ups',
        'Keep your body in a straight line',
        'Go slow and controlled',
        'Breathe out as you push up'
      ],
      equipment: ['Exercise mat (optional)'],
      videoThumbnail: null,
      safetyNotes: ['Don\'t let your back sag', 'Stop if you feel pain'],
      modifications: ['Wall push-ups for beginners', 'Incline push-ups on a bench'],
    },
    {
      id: 3,
      name: 'Bear Crawl',
      emoji: '🐻',
      category: 'movement',
      muscleGroup: 'full-body',
      difficulty: 'intermediate',
      duration: 60,
      calories: 35,
      description: 'Move like a bear to build strength and coordination!',
      benefits: ['Full body workout', 'Improves coordination', 'Builds core strength'],
      instructions: [
        'Start on hands and knees',
        'Lift your knees slightly off the ground',
        'Move forward by stepping with opposite hand and foot',
        'Keep your back flat and core tight',
        'Move slowly and controlled'
      ],
      tips: [
        'Keep your knees close to the ground',
        'Move opposite limbs together',
        'Keep your head up',
        'Take small steps'
      ],
      equipment: ['Exercise mat', 'Open space'],
      videoThumbnail: null,
      safetyNotes: ['Watch for obstacles on the floor', 'Keep movements controlled'],
      modifications: ['Regular crawling for beginners'],
    },
    {
      id: 4,
      name: 'Star Jumps',
      emoji: '⭐',
      category: 'cardio',
      muscleGroup: 'full-body',
      difficulty: 'beginner',
      duration: 30,
      calories: 30,
      description: 'Jump like a star and have fun while exercising!',
      benefits: ['Increases heart rate', 'Improves agility', 'Fun and energizing'],
      instructions: [
        'Stand with feet together and arms at sides',
        'Jump up spreading arms and legs wide like a star',
        'Land softly with feet apart and arms up',
        'Jump back to starting position',
        'Repeat with energy!'
      ],
      tips: [
        'Jump with enthusiasm',
        'Make your body into a star shape',
        'Land on your toes',
        'Keep smiling!'
      ],
      equipment: ['None needed!'],
      videoThumbnail: null,
      safetyNotes: ['Clear space around you', 'Land softly'],
      modifications: ['Step out into star position instead of jumping'],
    },
    {
      id: 5,
      name: 'Superhero Plank',
      emoji: '🦸‍♂️',
      category: 'strength',
      muscleGroup: 'core',
      difficulty: 'intermediate',
      duration: 30,
      calories: 20,
      description: 'Hold strong like your favorite superhero!',
      benefits: ['Builds core strength', 'Improves stability', 'Better posture'],
      instructions: [
        'Start in push-up position',
        'Keep your body straight like a plank',
        'Hold this position strong and steady',
        'Breathe normally while holding',
        'Imagine you\'re flying like a superhero!'
      ],
      tips: [
        'Don\'t let your hips sag',
        'Keep your head neutral',
        'Engage your core muscles',
        'Think of your favorite superhero'
      ],
      equipment: ['Exercise mat'],
      videoThumbnail: null,
      safetyNotes: ['Stop if you feel strain in your back', 'Start with shorter holds'],
      modifications: ['Knee plank for beginners', 'Wall plank standing up'],
    },
    {
      id: 6,
      name: 'Animal Yoga Flow',
      emoji: '🧘‍♂️',
      category: 'flexibility',
      muscleGroup: 'full-body',
      difficulty: 'beginner',
      duration: 120,
      calories: 40,
      description: 'Move like different animals in this fun yoga sequence!',
      benefits: ['Improves flexibility', 'Reduces stress', 'Better balance'],
      instructions: [
        'Start in cat pose (hands and knees)',
        'Arch your back up like a scared cat',
        'Then curve down like a happy cow',
        'Move to downward dog position',
        'Flow between poses smoothly'
      ],
      tips: [
        'Move slowly and breathe deeply',
        'Imagine you\'re the animals',
        'Hold each pose for a few breaths',
        'Have fun with it!'
      ],
      equipment: ['Yoga mat', 'Comfortable clothes'],
      videoThumbnail: null,
      safetyNotes: ['Move gently', 'Don\'t force any positions'],
      modifications: ['Use props like blocks if needed'],
    }
  ];

  const categories = [
    { key: 'all', label: 'All', icon: 'view-grid', color: COLORS.primary },
    { key: 'cardio', label: 'Cardio', icon: 'favorite', color: COLORS.error },
    { key: 'strength', label: 'Strength', icon: 'fitness-center', color: COLORS.info },
    { key: 'flexibility', label: 'Flexibility', icon: 'self-improvement', color: COLORS.success },
    { key: 'movement', label: 'Movement', icon: 'directions-run', color: COLORS.warning },
  ];

  const muscleGroups = [
    { key: 'all', label: 'All Muscles', icon: 'accessibility' },
    { key: 'full-body', label: 'Full Body', icon: 'person' },
    { key: 'upper-body', label: 'Upper Body', icon: 'trending-up' },
    { key: 'core', label: 'Core', icon: 'center-focus-strong' },
    { key: 'lower-body', label: 'Lower Body', icon: 'trending-down' },
  ];

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for featured exercises
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  // Timer effect for exercise duration
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            Vibration.vibrate([100, 50, 100]);
            Alert.alert('🎉 Great Job!', 'You completed the exercise!', [
              { text: '🌟 Awesome!', onPress: () => handleCompleteExercise(selectedExercise.id) }
            ]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timerActive, timeRemaining]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('Error refreshing exercises:', error);
    }
    setRefreshing(false);
  }, []);

  // Filter exercises
  const filteredExercises = mockExercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesMuscle = selectedMuscleGroup === 'all' || exercise.muscleGroup === selectedMuscleGroup;
    return matchesSearch && matchesCategory && matchesMuscle;
  });

  // Handle exercise selection
  const handleExercisePress = (exercise) => {
    setSelectedExercise(exercise);
    setCurrentStep(0);
    setShowExerciseModal(true);
    setTimeRemaining(exercise.duration);
  };

  // Handle start exercise timer
  const handleStartTimer = () => {
    setTimerActive(!timerActive);
    Vibration.vibrate(50);
  };

  // Handle favorite toggle
  const handleToggleFavorite = (exerciseId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(exerciseId)) {
        newFavorites.delete(exerciseId);
      } else {
        newFavorites.add(exerciseId);
        Vibration.vibrate(30);
      }
      return newFavorites;
    });
  };

  // Handle complete exercise
  const handleCompleteExercise = (exerciseId) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    setShowExerciseModal(false);
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return COLORS.warning;
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  // Render exercise card
  const renderExerciseCard = ({ item }) => (
    <Animated.View style={{ transform: [{ scale: item.id === 1 ? pulseAnim : 1 }] }}>
      <Card style={[styles.exerciseCard, completedExercises.has(item.id) && styles.completedCard]}>
        <TouchableOpacity onPress={() => handleExercisePress(item)} activeOpacity={0.8}>
          <Card.Content>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseTitle}>
                <Text style={styles.exerciseEmoji}>{item.emoji}</Text>
                <View style={styles.exerciseTitleText}>
                  <Text style={[TEXT_STYLES.h3, styles.exerciseName]}>{item.name}</Text>
                  <Text style={[TEXT_STYLES.caption]}>{item.description}</Text>
                </View>
              </View>
              <IconButton
                icon={favorites.has(item.id) ? 'favorite' : 'favorite-border'}
                iconColor={favorites.has(item.id) ? COLORS.error : COLORS.textLight}
                size={20}
                onPress={() => handleToggleFavorite(item.id)}
              />
            </View>

            <View style={styles.exerciseMeta}>
              <View style={styles.metaRow}>
                <Chip
                  mode="outlined"
                  compact
                  textStyle={{ fontSize: 10 }}
                  style={[styles.difficultyChip, { borderColor: getDifficultyColor(item.difficulty) }]}
                  icon="bar-chart"
                >
                  {item.difficulty}
                </Chip>
                <Chip
                  mode="outlined"
                  compact
                  textStyle={{ fontSize: 10, color: COLORS.primary }}
                  style={styles.categoryChip}
                  icon={categories.find(c => c.key === item.category)?.icon}
                >
                  {item.category}
                </Chip>
              </View>
            </View>

            <View style={styles.exerciseStats}>
              <View style={styles.statItem}>
                <Icon name="schedule" size={16} color={COLORS.textLight} />
                <Text style={styles.statText}>{formatTime(item.duration)}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="local-fire-department" size={16} color={COLORS.error} />
                <Text style={styles.statText}>{item.calories} cal</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="fitness-center" size={16} color={COLORS.primary} />
                <Text style={styles.statText}>{item.muscleGroup}</Text>
              </View>
            </View>

            {completedExercises.has(item.id) && (
              <View style={styles.completedBadge}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={[styles.completedText]}>Completed! 🎉</Text>
              </View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animated.View>
  );

  // Stats summary
  const getStats = () => {
    const totalCompleted = completedExercises.size;
    const totalCalories = Array.from(completedExercises).reduce((sum, id) => {
      const exercise = mockExercises.find(e => e.id === id);
      return sum + (exercise?.calories || 0);
    }, 0);
    const favoriteCount = favorites.size;

    return { totalCompleted, totalCalories, favoriteCount };
  };

  const stats = getStats();

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[TEXT_STYLES.h1, { color: COLORS.white }]}>
            Exercise Guide 💪
          </Text>
          <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
            Learn proper form and have fun exercising!
          </Text>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{stats.totalCompleted}</Text>
              <Text style={styles.quickStatLabel}>Completed</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{stats.totalCalories}</Text>
              <Text style={styles.quickStatLabel}>Calories</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{stats.favoriteCount}</Text>
              <Text style={styles.quickStatLabel}>Favorites</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
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
          {/* Search */}
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search exercises... 🔍"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={{ fontSize: 14 }}
            />
          </View>

          {/* Category Filters */}
          <View style={styles.filtersSection}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Categories</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((category) => (
                <Chip
                  key={category.key}
                  mode={selectedCategory === category.key ? 'contained' : 'outlined'}
                  onPress={() => setSelectedCategory(category.key)}
                  icon={category.icon}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.key && { backgroundColor: category.color }
                  ]}
                  textStyle={{
                    color: selectedCategory === category.key ? COLORS.white : category.color,
                    fontSize: 12,
                  }}
                >
                  {category.label}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Muscle Group Filters */}
          <View style={styles.filtersSection}>
            <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>Target Muscles</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryContainer}
            >
              {muscleGroups.map((group) => (
                <Chip
                  key={group.key}
                  mode={selectedMuscleGroup === group.key ? 'contained' : 'outlined'}
                  onPress={() => setSelectedMuscleGroup(group.key)}
                  icon={group.icon}
                  style={[
                    styles.categoryChip,
                    selectedMuscleGroup === group.key && { backgroundColor: COLORS.info }
                  ]}
                  textStyle={{
                    color: selectedMuscleGroup === group.key ? COLORS.white : COLORS.info,
                    fontSize: 12,
                  }}
                >
                  {group.label}
                </Chip>
              ))}
            </ScrollView>
          </div>

          {/* Exercise Grid */}
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseCard}
            keyExtractor={(item) => item.id.toString()}
            numColumns={1}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
            contentContainerStyle={{ paddingBottom: SPACING.xl }}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={64} color={COLORS.textLight} />
                <Text style={[TEXT_STYLES.h3, { color: COLORS.textLight, marginTop: SPACING.md }]}>
                  No exercises found
                </Text>
                <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.sm }]}>
                  Try adjusting your search or filters
                </Text>
              </View>
            )}
          />

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Exercise Detail Modal */}
      <Portal>
        <Modal
          visible={showExerciseModal}
          onDismiss={() => {
            setShowExerciseModal(false);
            setTimerActive(false);
            setCurrentStep(0);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <BlurView intensity={20} style={styles.modalBlur}>
            {selectedExercise && (
              <Card style={styles.modalCard}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Card.Content>
                    {/* Modal Header */}
                    <View style={styles.modalHeader}>
                      <View style={styles.modalTitleContainer}>
                        <Text style={styles.modalEmoji}>{selectedExercise.emoji}</Text>
                        <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
                          {selectedExercise.name}
                        </Text>
                      </View>
                      <IconButton
                        icon="close"
                        size={24}
                        onPress={() => setShowExerciseModal(false)}
                        iconColor={COLORS.textLight}
                      />
                    </View>

                    {/* Timer Display */}
                    <Surface style={styles.timerContainer}>
                      <Text style={[TEXT_STYLES.h1, { color: COLORS.primary }]}>
                        {formatTime(timeRemaining)}
                      </Text>
                      <Button
                        mode={timerActive ? 'outlined' : 'contained'}
                        onPress={handleStartTimer}
                        icon={timerActive ? 'pause' : 'play-arrow'}
                        buttonColor={timerActive ? 'transparent' : COLORS.success}
                        textColor={timerActive ? COLORS.success : COLORS.white}
                        style={styles.timerButton}
                      >
                        {timerActive ? 'Pause' : 'Start'}
                      </Button>
                    </Surface>

                    {/* Progress Indicator */}
                    <ProgressBar
                      progress={(selectedExercise.duration - timeRemaining) / selectedExercise.duration}
                      color={COLORS.success}
                      style={styles.progressBar}
                    />

                    {/* Instructions */}
                    <View style={styles.modalSection}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                        How to do it 📋
                      </Text>
                      {selectedExercise.instructions.map((instruction, index) => (
                        <View
                          key={index}
                          style={[
                            styles.instructionItem,
                            currentStep === index && styles.activeInstruction
                          ]}
                        >
                          <View style={[
                            styles.stepNumber,
                            currentStep === index && styles.activeStepNumber
                          ]}>
                            <Text style={[
                              styles.stepNumberText,
                              currentStep === index && styles.activeStepNumberText
                            ]}>
                              {index + 1}
                            </Text>
                          </View>
                          <Text style={[
                            TEXT_STYLES.body,
                            styles.instructionText,
                            currentStep === index && styles.activeInstructionText
                          ]}>
                            {instruction}
                          </Text>
                        </View>
                      ))}
                      
                      <View style={styles.stepControls}>
                        <Button
                          mode="outlined"
                          onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0}
                          icon="chevron-left"
                        >
                          Previous
                        </Button>
                        <Button
                          mode="outlined"
                          onPress={() => setCurrentStep(Math.min(selectedExercise.instructions.length - 1, currentStep + 1))}
                          disabled={currentStep === selectedExercise.instructions.length - 1}
                          icon="chevron-right"
                          contentStyle={{ flexDirection: 'row-reverse' }}
                        >
                          Next
                        </Button>
                      </View>
                    </View>

                    {/* Benefits */}
                    <View style={styles.modalSection}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                        Benefits 🌟
                      </Text>
                      {selectedExercise.benefits.map((benefit, index) => (
                        <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
                          ✓ {benefit}
                        </Text>
                      ))}
                    </View>

                    {/* Tips */}
                    <View style={styles.modalSection}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                        Pro Tips 💡
                      </Text>
                      {selectedExercise.tips.map((tip, index) => (
                        <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
                          💡 {tip}
                        </Text>
                      ))}
                    </View>

                    {/* Equipment */}
                    <View style={styles.modalSection}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                        Equipment Needed 🛠️
                      </Text>
                      {selectedExercise.equipment.map((item, index) => (
                        <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
                          • {item}
                        </Text>
                      ))}
                    </View>

                    {/* Safety Notes */}
                    <View style={styles.modalSection}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm, color: COLORS.warning }]}>
                        Safety First ⚠️
                      </Text>
                      {selectedExercise.safetyNotes.map((note, index) => (
                        <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.xs, color: COLORS.warning }]}>
                          ⚠️ {note}
                        </Text>
                      ))}
                    </View>

                    {/* Modifications */}
                    <View style={styles.modalSection}>
                      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.sm }]}>
                        Make it Easier 🔧
                      </Text>
                      {selectedExercise.modifications.map((modification, index) => (
                        <Text key={index} style={[TEXT_STYLES.body, { marginBottom: SPACING.xs }]}>
                          🔧 {modification}
                        </Text>
                      ))}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.modalActions}>
                      <Button
                        mode="contained"
                        onPress={() => handleCompleteExercise(selectedExercise.id)}
                        style={[styles.actionButton]}
                        buttonColor={COLORS.success}
                        disabled={completedExercises.has(selectedExercise.id)}
                        icon={completedExercises.has(selectedExercise.id) ? 'check-circle' : 'check'}
                      >
                        {completedExercises.has(selectedExercise.id) ? 'Completed! 🎉' : 'Mark Complete'}
                      </Button>
                      
                      <Button
                        mode="outlined"
                        onPress={() => handleToggleFavorite(selectedExercise.id)}
                        style={styles.actionButton}
                        icon={favorites.has(selectedExercise.id) ? 'favorite' : 'favorite-border'}
                        textColor={favorites.has(selectedExercise.id) ? COLORS.error : COLORS.primary}
                      >
                        {favorites.has(selectedExercise.id) ? 'Remove Favorite' : 'Add Favorite'}
                      </Button>
                    </View>
                  </Card.Content>
                </ScrollView>
              </Card>
            )}
          </BlurView>
        </Modal>
      </Portal>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <FAB
          icon="favorite"
          style={[styles.fab, { backgroundColor: COLORS.error }]}
          onPress={() => {
            setSelectedCategory('all');
            setSelectedMuscleGroup('all');
            setSearchQuery('');
            // Show only favorites - would filter in real implementation
            Alert.alert('❤️ Favorites', 'Showing your favorite exercises!');
          }}
          color={COLORS.white}
          size="small"
        />
        <FAB
          icon="video-library"
          style={[styles.fab, styles.mainFab]}
          onPress={() => Alert.alert('🎬 Exercise Videos', 'Video demonstrations coming soon!')}
          color={COLORS.white}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.lg,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  quickStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
  },
  searchContainer: {
    marginBottom: SPACING.lg,
  },
  searchBar: {
    elevation: 3,
    borderRadius: 12,
  },
  filtersSection: {
    marginBottom: SPACING.lg,
  },
  categoryContainer: {
    paddingBottom: SPACING.sm,
  },
  categoryChip: {
    marginRight: SPACING.sm,
  },
  exerciseCard: {
    elevation: 3,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.md,
  },
  completedCard: {
    backgroundColor: '#f0f8f0',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  exerciseTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  exerciseTitleText: {
    flex: 1,
  },
  exerciseName: {
    marginBottom: SPACING.xs,
  },
  exerciseMeta: {
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  difficultyChip: {
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    marginLeft: SPACING.xs,
    fontSize: 12,
    color: COLORS.textLight,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  completedText: {
    marginLeft: SPACING.xs,
    color: COLORS.success,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 20,
    maxHeight: '90%',
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalEmoji: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  timerContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 16,
    elevation: 2,
    marginBottom: SPACING.md,
  },
  timerButton: {
    marginTop: SPACING.md,
    borderRadius: 25,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.lg,
  },
  modalSection: {
    marginBottom: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  activeInstruction: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  activeStepNumber: {
    backgroundColor: COLORS.primary,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  activeStepNumberText: {
    color: COLORS.white,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
  },
  activeInstructionText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  stepControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalActions: {
    marginTop: SPACING.lg,
  },
  actionButton: {
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  fabContainer: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    alignItems: 'center',
  },
  fab: {
    marginBottom: SPACING.sm,
  },
  mainFab: {
    backgroundColor: COLORS.primary,
  },
});

export default ExerciseGuide;