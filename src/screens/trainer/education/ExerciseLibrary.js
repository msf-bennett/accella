import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Animated,
  RefreshControl,
  Alert,
  Vibration,
  TouchableOpacity,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Card,
  Searchbar,
  Chip,
  Button,
  Avatar,
  Surface,
  Portal,
  Modal,
  ProgressBar,
  FAB
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

// Import your design constants
import { COLORS, SPACING, TEXT_STYLES } from '../constants/styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ExerciseLibrary = ({ navigation, route }) => {
  // Redux state
  const dispatch = useDispatch();
  const { user, isOffline } = useSelector(state => state.auth);
  const { exercises, favorites, loading } = useSelector(state => state.exercises);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));

  // Static data (would be moved to Redux store in production)
  const exerciseData = [
    {
      id: 1,
      name: 'Push-ups',
      category: 'strength',
      difficulty: 'beginner',
      equipment: 'bodyweight',
      duration: '30-60 seconds',
      targetMuscles: ['chest', 'shoulders', 'triceps', 'core'],
      description: 'A fundamental upper body exercise that builds strength in the chest, shoulders, and arms while engaging the core.',
      instructions: [
        'Start in a plank position with hands slightly wider than shoulder-width',
        'Keep your body in a straight line from head to heels',
        'Lower your chest to within an inch of the floor',
        'Push back up to starting position',
        'Maintain controlled movement throughout'
      ],
      benefits: ['Builds upper body strength', 'Improves core stability', 'No equipment needed', 'Easily modifiable'],
      modifications: ['Knee push-ups for beginners', 'Incline push-ups', 'Diamond push-ups for advanced'],
      safetyTips: ['Keep core engaged', 'Avoid sagging hips', 'Control the descent'],
      rating: 4.8,
      videoUrl: null,
      points: 10
    },
    {
      id: 2,
      name: 'Deadlifts',
      category: 'strength',
      difficulty: 'intermediate',
      equipment: 'barbell',
      duration: '45-90 seconds',
      targetMuscles: ['hamstrings', 'glutes', 'lower back', 'core'],
      description: 'A compound movement that targets the posterior chain, building strength in the glutes, hamstrings, and lower back.',
      instructions: [
        'Stand with feet hip-width apart, bar over mid-foot',
        'Bend at hips and knees to grasp the bar',
        'Keep chest up and shoulders back',
        'Drive through heels and hips to lift the bar',
        'Stand tall, then lower with control'
      ],
      benefits: ['Builds posterior chain strength', 'Improves posture', 'Functional movement pattern', 'Increases bone density'],
      modifications: ['Romanian deadlifts', 'Sumo deadlifts', 'Trap bar deadlifts'],
      safetyTips: ['Maintain neutral spine', 'Keep bar close to body', 'Warm up thoroughly'],
      rating: 4.9,
      videoUrl: null,
      points: 15
    },
    {
      id: 3,
      name: 'Burpees',
      category: 'cardio',
      difficulty: 'intermediate',
      equipment: 'bodyweight',
      duration: '30-45 seconds',
      targetMuscles: ['full body', 'cardiovascular'],
      description: 'A high-intensity full-body exercise that combines strength and cardio training.',
      instructions: [
        'Start standing, then squat down and place hands on floor',
        'Jump feet back into plank position',
        'Perform a push-up (optional)',
        'Jump feet back to squat position',
        'Explode up with arms overhead'
      ],
      benefits: ['High calorie burn', 'Full body workout', 'Improves cardiovascular fitness', 'Time efficient'],
      modifications: ['Step-back burpees', 'Half burpees', 'Burpee box step-ups'],
      safetyTips: ['Land softly', 'Maintain form over speed', 'Modify if needed'],
      rating: 4.3,
      videoUrl: null,
      points: 12
    },
    {
      id: 4,
      name: 'Plank',
      category: 'strength',
      difficulty: 'beginner',
      equipment: 'bodyweight',
      duration: '30-120 seconds',
      targetMuscles: ['core', 'shoulders', 'glutes'],
      description: 'An isometric core exercise that builds stability and strength throughout the entire core.',
      instructions: [
        'Start in push-up position on forearms',
        'Keep body in straight line from head to heels',
        'Engage core and glutes',
        'Breathe normally while holding position',
        'Hold for specified time'
      ],
      benefits: ['Core strength', 'Improved posture', 'Shoulder stability', 'Mental toughness'],
      modifications: ['Knee plank', 'Side plank', 'Plank up-downs'],
      safetyTips: ['Avoid sagging hips', 'Keep neck neutral', 'Start with shorter holds'],
      rating: 4.6,
      videoUrl: null,
      points: 8
    },
    {
      id: 5,
      name: 'Yoga Flow',
      category: 'flexibility',
      difficulty: 'beginner',
      equipment: 'bodyweight',
      duration: '10-30 minutes',
      targetMuscles: ['full body', 'flexibility'],
      description: 'A flowing sequence of yoga poses that improves flexibility, balance, and mindfulness.',
      instructions: [
        'Begin in mountain pose',
        'Flow through sun salutations',
        'Hold warrior poses on each side',
        'Include seated forward folds',
        'End in savasana'
      ],
      benefits: ['Increased flexibility', 'Stress reduction', 'Better balance', 'Mindfulness'],
      modifications: ['Chair yoga', 'Gentle flow', 'Power yoga for advanced'],
      safetyTips: ['Listen to your body', 'Use props when needed', 'Breathe deeply'],
      rating: 4.7,
      videoUrl: null,
      points: 10
    },
    {
      id: 6,
      name: 'Kettlebell Swings',
      category: 'functional',
      difficulty: 'intermediate',
      equipment: 'kettlebell',
      duration: '45-60 seconds',
      targetMuscles: ['glutes', 'hamstrings', 'core', 'shoulders'],
      description: 'A dynamic hip-hinge movement that builds power, strength, and cardiovascular fitness.',
      instructions: [
        'Stand with feet shoulder-width apart, kettlebell on floor',
        'Hinge at hips to grab kettlebell with both hands',
        'Swing kettlebell between legs, then drive hips forward',
        'Let momentum carry kettlebell to chest height',
        'Control the descent and repeat'
      ],
      benefits: ['Hip power development', 'Cardiovascular fitness', 'Posterior chain strength', 'Fat burning'],
      modifications: ['Two-handed swings', 'Single-arm swings', 'Goblet squats'],
      safetyTips: ['Hip-driven movement', 'Keep core tight', 'Control the swing'],
      rating: 4.5,
      videoUrl: null,
      points: 14
    }
  ];

  const categories = [
    { key: 'all', label: 'All', icon: 'fitness-center' },
    { key: 'strength', label: 'Strength', icon: 'fitness-center' },
    { key: 'cardio', label: 'Cardio', icon: 'directions-run' },
    { key: 'flexibility', label: 'Flexibility', icon: 'accessibility' },
    { key: 'functional', label: 'Functional', icon: 'sports' },
    { key: 'balance', label: 'Balance', icon: 'balance' }
  ];

  const difficulties = [
    { key: 'all', label: 'All Levels', color: COLORS.primary },
    { key: 'beginner', label: 'Beginner', color: COLORS.success },
    { key: 'intermediate', label: 'Intermediate', color: '#FF9500' },
    { key: 'advanced', label: 'Advanced', color: COLORS.error }
  ];

  const equipment = [
    { key: 'all', label: 'All Equipment' },
    { key: 'bodyweight', label: 'Bodyweight' },
    { key: 'dumbbells', label: 'Dumbbells' },
    { key: 'barbell', label: 'Barbell' },
    { key: 'kettlebell', label: 'Kettlebell' },
    { key: 'resistance-bands', label: 'Resistance Bands' }
  ];

  // Filter exercises
  const filteredExercises = exerciseData.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.targetMuscles.some(muscle => muscle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty === selectedDifficulty;
    const matchesEquipment = selectedEquipment === 'all' || exercise.equipment === selectedEquipment;
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesEquipment;
  });

  // Animation effects
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
      Vibration.vibrate(50);
    }, 1500);
  }, []);

  // Handle favorite toggle
  const toggleFavorite = (exerciseId) => {
    Vibration.vibrate(30);
    // Dispatch Redux action to toggle favorite
    dispatch({ type: 'TOGGLE_FAVORITE', payload: exerciseId });
  };

  // Handle exercise selection
  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
    Vibration.vibrate(50);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const difficultyObj = difficulties.find(d => d.key === difficulty);
    return difficultyObj ? difficultyObj.color : COLORS.primary;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const categoryObj = categories.find(c => c.key === category);
    return categoryObj ? categoryObj.icon : 'fitness-center';
  };

  // Render exercise card
  const renderExerciseCard = ({ item, index }) => {
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [{
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50 * (index + 1), 0],
        }),
      }],
    };

    return (
      <Animated.View style={animatedStyle}>
        <Card 
          style={[styles.exerciseCard, { marginBottom: SPACING.md }]}
          elevation={3}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => selectExercise(item)}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.cardHeader}
            >
              <View style={styles.cardHeaderContent}>
                <View style={styles.titleSection}>
                  <Icon 
                    name={getCategoryIcon(item.category)} 
                    size={24} 
                    color="white" 
                  />
                  <Text style={[TEXT_STYLES.h3, { color: 'white', marginLeft: SPACING.sm }]}>
                    {item.name}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <Icon 
                    name={favorites.includes(item.id) ? 'favorite' : 'favorite-border'} 
                    size={24} 
                    color="white" 
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.badgeContainer}>
                <Chip 
                  style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(item.difficulty) }]}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {item.difficulty.toUpperCase()}
                </Chip>
                <Chip 
                  style={styles.equipmentChip}
                  textStyle={{ color: COLORS.primary, fontSize: 12 }}
                >
                  {item.equipment.replace('-', ' ').toUpperCase()}
                </Chip>
              </View>
            </LinearGradient>
            
            <View style={styles.cardContent}>
              <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary, marginBottom: SPACING.sm }]}>
                {item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description}
              </Text>
              
              <View style={styles.exerciseDetails}>
                <View style={styles.detailItem}>
                  <Icon name="schedule" size={16} color={COLORS.text.secondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {item.duration}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {item.rating}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="jump-rope" size={16} color={COLORS.primary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {item.points} pts
                  </Text>
                </View>
              </View>
              
              <View style={styles.muscleContainer}>
                <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary, marginBottom: SPACING.xs }]}>
                  Target Muscles:
                </Text>
                <View style={styles.muscleChips}>
                  {item.targetMuscles.slice(0, 3).map((muscle, index) => (
                    <Chip 
                      key={index}
                      style={styles.muscleChip}
                      textStyle={{ fontSize: 10 }}
                    >
                      {muscle}
                    </Chip>
                  ))}
                  {item.targetMuscles.length > 3 && (
                    <Chip 
                      style={styles.muscleChip}
                      textStyle={{ fontSize: 10 }}
                    >
                      +{item.targetMuscles.length - 3}
                    </Chip>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  };

  // Render filter chips
  const renderFilterSection = () => (
    <View style={styles.filterSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterChips}>
          {categories.map(category => (
            <Chip
              key={category.key}
              selected={selectedCategory === category.key}
              onPress={() => setSelectedCategory(category.key)}
              style={[
                styles.filterChip,
                selectedCategory === category.key && styles.selectedFilterChip
              ]}
              textStyle={{
                color: selectedCategory === category.key ? 'white' : COLORS.primary
              }}
            >
              {category.label}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Exercise detail modal
  const renderExerciseModal = () => (
    <Portal>
      <Modal
        visible={!!selectedExercise}
        onDismiss={() => setSelectedExercise(null)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView
          style={styles.blurContainer}
          blurType="light"
          blurAmount={10}
        >
          {selectedExercise && (
            <ScrollView style={styles.modalContent}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.modalHeader}
              >
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity
                    onPress={() => setSelectedExercise(null)}
                    style={styles.closeButton}
                  >
                    <Icon name="close" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center', flex: 1 }]}>
                    {selectedExercise.name}
                  </Text>
                  
                  <TouchableOpacity onPress={() => toggleFavorite(selectedExercise.id)}>
                    <Icon 
                      name={favorites.includes(selectedExercise.id) ? 'favorite' : 'favorite-border'} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalStats}>
                  <View style={styles.statItem}>
                    <Icon name="schedule" size={20} color="white" />
                    <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.xs }]}>
                      {selectedExercise.duration}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="star" size={20} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.xs }]}>
                      {selectedExercise.rating}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="jump-rope" size={20} color="#FFD700" />
                    <Text style={[TEXT_STYLES.caption, { color: 'white', marginTop: SPACING.xs }]}>
                      {selectedExercise.points} pts
                    </Text>
                  </View>
                </View>
              </LinearGradient>
              
              <View style={styles.modalBody}>
                <Surface style={styles.descriptionSection}>
                  <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
                    Description
                  </Text>
                  <Text style={TEXT_STYLES.body}>
                    {selectedExercise.description}
                  </Text>
                </Surface>
                
                <Surface style={styles.instructionsSection}>
                  <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
                    Instructions
                  </Text>
                  {selectedExercise.instructions.map((instruction, index) => (
                    <View key={index} style={styles.instructionItem}>
                      <View style={styles.stepNumber}>
                        <Text style={[TEXT_STYLES.caption, { color: 'white', fontWeight: 'bold' }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={[TEXT_STYLES.body, { flex: 1, marginLeft: SPACING.md }]}>
                        {instruction}
                      </Text>
                    </View>
                  ))}
                </Surface>
                
                <View style={styles.benefitsAndTips}>
                  <Surface style={styles.benefitsSection}>
                    <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
                      Benefits 💪
                    </Text>
                    {selectedExercise.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Icon name="check-circle" size={16} color={COLORS.success} />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </Surface>
                  
                  <Surface style={styles.tipsSection}>
                    <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
                      Safety Tips ⚠️
                    </Text>
                    {selectedExercise.safetyTips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <Icon name="warning" size={16} color="#FF9500" />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.sm, flex: 1 }]}>
                          {tip}
                        </Text>
                      </View>
                    ))}
                  </Surface>
                </View>
                
                <Surface style={styles.modificationsSection}>
                  <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.md }]}>
                    Modifications 🔄
                  </Text>
                  <View style={styles.modificationChips}>
                    {selectedExercise.modifications.map((modification, index) => (
                      <Chip 
                        key={index}
                        style={styles.modificationChip}
                        textStyle={{ fontSize: 12 }}
                      >
                        {modification}
                      </Chip>
                    ))}
                  </View>
                </Surface>
              </View>
            </ScrollView>
          )}
        </BlurView>
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Exercise Library 📚
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              {filteredExercises.length} exercises • {favorites.length} favorites
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Icon name="tune" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <Searchbar
          placeholder="Search exercises or muscles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ color: COLORS.text.primary }}
          iconColor={COLORS.primary}
        />
      </LinearGradient>
      
      {renderFilterSection()}
      
      {showFilters && (
        <Surface style={styles.advancedFilters}>
          <View style={styles.filterRow}>
            <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>
              Difficulty Level
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {difficulties.map(difficulty => (
                  <Chip
                    key={difficulty.key}
                    selected={selectedDifficulty === difficulty.key}
                    onPress={() => setSelectedDifficulty(difficulty.key)}
                    style={[
                      styles.filterChip,
                      selectedDifficulty === difficulty.key && 
                      { backgroundColor: difficulty.color }
                    ]}
                    textStyle={{
                      color: selectedDifficulty === difficulty.key ? 'white' : difficulty.color
                    }}
                  >
                    {difficulty.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
          
          <View style={styles.filterRow}>
            <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.sm }]}>
              Equipment Type
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {equipment.map(equip => (
                  <Chip
                    key={equip.key}
                    selected={selectedEquipment === equip.key}
                    onPress={() => setSelectedEquipment(equip.key)}
                    style={[
                      styles.filterChip,
                      selectedEquipment === equip.key && styles.selectedFilterChip
                    ]}
                    textStyle={{
                      color: selectedEquipment === equip.key ? 'white' : COLORS.primary
                    }}
                  >
                    {equip.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>
          </View>
        </Surface>
      )}
      
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExerciseCard}
        contentContainerStyle={styles.exerciseList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="search-off" size={64} color={COLORS.text.secondary} />
            <Text style={[TEXT_STYLES.h3, { color: COLORS.text.secondary, marginTop: SPACING.md }]}>
              No exercises found
            </Text>
            <Text style={[TEXT_STYLES.body, { color: COLORS.text.secondary, textAlign: 'center' }]}>
              Try adjusting your search or filter criteria
            </Text>
          </View>
        )}
      />
      
      {renderExerciseModal()}
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => {
          Alert.alert(
            'Add Exercise',
            'Feature coming soon! 🚧\nCoaches will be able to add custom exercises to their library.',
            [{ text: 'OK', onPress: () => {} }]
          );
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: SPACING.md,
    elevation: 2,
  },
  filterSection: {
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.sm,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
  },
  advancedFilters: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    elevation: 2,
  },
  filterRow: {
    marginBottom: SPACING.md,
  },
  exerciseList: {
    padding: SPACING.md,
  },
  exerciseCard: {
    borderRadius: SPACING.md,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  difficultyChip: {
    marginRight: SPACING.xs,
  },
  equipmentChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardContent: {
    padding: SPACING.md,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  muscleContainer: {
    marginTop: SPACING.sm,
  },
  muscleChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  muscleChip: {
    backgroundColor: COLORS.background.secondary,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  modalContainer: {
    flex: 1,
    margin: 0,
  },
  blurContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  closeButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  modalBody: {
    padding: SPACING.md,
  },
  descriptionSection: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: SPACING.sm,
    elevation: 1,
  },
  instructionsSection: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: SPACING.sm,
    elevation: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsAndTips: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  benefitsSection: {
    flex: 0.48,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    elevation: 1,
  },
  tipsSection: {
    flex: 0.48,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    elevation: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  modificationsSection: {
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    elevation: 1,
    marginBottom: SPACING.xl,
  },
  modificationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  modificationChip: {
    backgroundColor: COLORS.background.secondary,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
};

export default ExerciseLibrary;