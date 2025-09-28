import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  Alert,
  RefreshControl,
  StatusBar,
  Vibration,
  Animated,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Modal,
  TextInput,
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
  Badge,
  Divider,
  Switch,
  Slider,
  RadioButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from '../../../components/shared/BlurView';
import { BlurView } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const WorkoutBuilder = ({ navigation, route }) => {
  // State management
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [workoutType, setWorkoutType] = useState('strength');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState(45);
  const [exercises, setExercises] = useState([]);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [showWorkoutSettings, setShowWorkoutSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [workoutTemplates, setWorkoutTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  // Redux
  const { user, workouts, exerciseLibrary } = useSelector(state => state.trainer);
  const dispatch = useDispatch();

  // Route params
  const { workoutId, templateId, clientId } = route.params || {};

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const dragAnim = useRef(new Animated.Value(0)).current;

  // Mock exercise library
  const mockExercises = [
    {
      id: 1,
      name: 'Push-ups',
      category: 'chest',
      muscle: 'Chest, Triceps, Shoulders',
      equipment: 'Bodyweight',
      difficulty: 'beginner',
      instructions: 'Start in plank position, lower body to ground, push back up',
      videoUrl: 'https://example.com/pushups.mp4',
      image: 'https://via.placeholder.com/100x100?text=Push-ups',
      calories: 8,
      duration: 60,
    },
    {
      id: 2,
      name: 'Squats',
      category: 'legs',
      muscle: 'Quadriceps, Glutes, Hamstrings',
      equipment: 'Bodyweight',
      difficulty: 'beginner',
      instructions: 'Stand with feet shoulder-width apart, lower hips back and down, return to standing',
      videoUrl: 'https://example.com/squats.mp4',
      image: 'https://via.placeholder.com/100x100?text=Squats',
      calories: 10,
      duration: 60,
    },
    {
      id: 3,
      name: 'Deadlifts',
      category: 'back',
      muscle: 'Hamstrings, Glutes, Lower Back',
      equipment: 'Barbell',
      difficulty: 'advanced',
      instructions: 'Stand with feet hip-width apart, bend at hips and knees to grab bar, lift to standing',
      videoUrl: 'https://example.com/deadlifts.mp4',
      image: 'https://via.placeholder.com/100x100?text=Deadlifts',
      calories: 15,
      duration: 45,
    },
    {
      id: 4,
      name: 'Burpees',
      category: 'cardio',
      muscle: 'Full Body',
      equipment: 'Bodyweight',
      difficulty: 'advanced',
      instructions: 'Drop to squat, jump back to plank, do push-up, jump feet to squat, jump up',
      videoUrl: 'https://example.com/burpees.mp4',
      image: 'https://via.placeholder.com/100x100?text=Burpees',
      calories: 20,
      duration: 30,
    },
    {
      id: 5,
      name: 'Plank',
      category: 'core',
      muscle: 'Core, Shoulders, Glutes',
      equipment: 'Bodyweight',
      difficulty: 'intermediate',
      instructions: 'Hold push-up position with forearms on ground, keep body straight',
      videoUrl: 'https://example.com/plank.mp4',
      image: 'https://via.placeholder.com/100x100?text=Plank',
      calories: 5,
      duration: 60,
    },
    {
      id: 6,
      name: 'Bicep Curls',
      category: 'arms',
      muscle: 'Biceps',
      equipment: 'Dumbbells',
      difficulty: 'beginner',
      instructions: 'Hold weights at sides, curl up toward shoulders, lower with control',
      videoUrl: 'https://example.com/bicep-curls.mp4',
      image: 'https://via.placeholder.com/100x100?text=Bicep+Curls',
      calories: 6,
      duration: 45,
    }
  ];

  const workoutCategories = [
    { key: 'all', label: 'All Exercises', icon: 'fitness-center', color: COLORS.primary },
    { key: 'chest', label: 'Chest', icon: 'favorite', color: '#E91E63' },
    { key: 'back', label: 'Back', icon: 'straighten', color: '#3F51B5' },
    { key: 'legs', label: 'Legs', icon: 'directions-run', color: '#4CAF50' },
    { key: 'arms', label: 'Arms', icon: 'pan-tool', color: '#FF9800' },
    { key: 'core', label: 'Core', icon: 'center-focus-strong', color: '#9C27B0' },
    { key: 'cardio', label: 'Cardio', icon: 'favorite', color: '#F44336' },
  ];

  const workoutTypes = [
    { key: 'strength', label: 'Strength Training', icon: 'fitness-center' },
    { key: 'cardio', label: 'Cardio', icon: 'directions-run' },
    { key: 'hiit', label: 'HIIT', icon: 'flash-on' },
    { key: 'yoga', label: 'Yoga', icon: 'self-improvement' },
    { key: 'flexibility', label: 'Flexibility', icon: 'accessibility' },
    { key: 'sports', label: 'Sports Specific', icon: 'sports-soccer' },
  ];

  // Initialize component
  useEffect(() => {
    initializeData();
    animateEntrance();
  }, []);

  const initializeData = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAvailableExercises(mockExercises);
      
      // Load existing workout if editing
      if (workoutId) {
        loadExistingWorkout(workoutId);
      } else if (templateId) {
        loadTemplate(templateId);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadExistingWorkout = (id) => {
    // Mock loading existing workout
    setWorkoutName('Upper Body Strength');
    setWorkoutDescription('Focus on chest, shoulders, and arms');
    setWorkoutType('strength');
    setDifficulty('intermediate');
    setDuration(45);
    setExercises([
      {
        ...mockExercises[0],
        sets: 3,
        reps: 12,
        restTime: 60,
        weight: null,
        notes: 'Focus on form'
      },
      {
        ...mockExercises[5],
        sets: 3,
        reps: 10,
        restTime: 45,
        weight: 15,
        notes: 'Increase weight gradually'
      }
    ]);
  };

  const loadTemplate = (id) => {
    // Mock loading template
    Alert.alert('Template Loaded', 'Workout template has been loaded successfully! 📋');
  };

  const animateEntrance = () => {
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
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    await initializeData();
    setRefreshing(false);
  }, []);

  const addExerciseToWorkout = (exercise) => {
    const newExercise = {
      ...exercise,
      sets: 3,
      reps: exercise.category === 'cardio' ? null : 12,
      duration: exercise.category === 'cardio' ? exercise.duration : null,
      restTime: 60,
      weight: exercise.equipment === 'Bodyweight' ? null : 0,
      notes: '',
      id: `${exercise.id}_${Date.now()}` // Unique ID for workout exercise
    };
    
    setExercises([...exercises, newExercise]);
    setShowExerciseLibrary(false);
    Vibration.vibrate([50, 100, 50]);
    
    Alert.alert('Exercise Added', `${exercise.name} has been added to your workout! 💪`);
  };

  const removeExercise = (exerciseId) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setExercises(exercises.filter(ex => ex.id !== exerciseId));
            Vibration.vibrate(100);
          }
        }
      ]
    );
  };

  const updateExercise = (exerciseId, field, value) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, [field]: value } : ex
    ));
  };

  const moveExercise = (fromIndex, toIndex) => {
    const newExercises = [...exercises];
    const [movedExercise] = newExercises.splice(fromIndex, 1);
    newExercises.splice(toIndex, 0, movedExercise);
    setExercises(newExercises);
    Vibration.vibrate(50);
  };

  const saveWorkout = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Missing Information', 'Please enter a workout name');
      return;
    }
    
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Please add at least one exercise to your workout');
      return;
    }

    setSaving(true);
    Vibration.vibrate([50, 100, 50, 100]);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const workoutData = {
        name: workoutName,
        description: workoutDescription,
        type: workoutType,
        difficulty,
        duration,
        exercises,
        createdAt: new Date().toISOString(),
        clientId: clientId || null,
      };

      Alert.alert(
        'Workout Saved! 🎉',
        `"${workoutName}" has been saved successfully!`,
        [
          { text: 'Create Another', onPress: () => resetWorkout() },
          { text: 'Back to List', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetWorkout = () => {
    setWorkoutName('');
    setWorkoutDescription('');
    setWorkoutType('strength');
    setDifficulty('intermediate');
    setDuration(45);
    setExercises([]);
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner': return COLORS.success;
      case 'intermediate': return '#FF9500';
      case 'advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const getCategoryInfo = (category) => {
    return workoutCategories.find(cat => cat.key === category) || workoutCategories[0];
  };

  const getFilteredExercises = () => {
    let filtered = availableExercises;

    if (searchQuery) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    return filtered;
  };

  const renderExerciseCard = (exercise) => (
    <Card style={{ marginBottom: SPACING.medium }}>
      <Card.Content>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            backgroundColor: getCategoryInfo(exercise.category).color + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: SPACING.medium
          }}>
            <Icon
              name={getCategoryInfo(exercise.category).icon}
              size={28}
              color={getCategoryInfo(exercise.category).color}
            />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.subheading, { fontWeight: 'bold' }]}>
              {exercise.name}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {exercise.muscle}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Chip
                mode="outlined"
                textStyle={{ fontSize: 10 }}
                style={{
                  height: 24,
                  marginRight: SPACING.xsmall,
                  borderColor: getDifficultyColor(exercise.difficulty)
                }}
              >
                {exercise.difficulty.toUpperCase()}
              </Chip>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                {exercise.equipment}
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={() => addExerciseToWorkout(exercise)}
            icon="add"
            compact
            style={{ backgroundColor: COLORS.primary }}
          >
            Add
          </Button>
        </View>
        
        <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary, fontStyle: 'italic' }]}>
          {exercise.instructions}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderWorkoutExercise = ({ item: exercise, index }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Card style={{ marginBottom: SPACING.medium, marginHorizontal: SPACING.medium }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: SPACING.medium,
          paddingTop: SPACING.medium,
        }}>
          <Text style={[TEXT_STYLES.caption, {
            backgroundColor: COLORS.primary,
            color: 'white',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 'bold',
            marginRight: SPACING.small
          }]}>
            {index + 1}
          </Text>
          
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.subheading, { fontWeight: 'bold' }]}>
              {exercise.name}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {exercise.muscle}
            </Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="edit"
              size={20}
              onPress={() => setEditingExercise(exercise)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={COLORS.error}
              onPress={() => removeExercise(exercise.id)}
            />
          </View>
        </View>

        <Card.Content style={{ paddingTop: SPACING.small }}>
          {/* Exercise Parameters */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: SPACING.small
          }}>
            {exercise.category !== 'cardio' && (
              <>
                <Surface style={{
                  padding: SPACING.small,
                  borderRadius: 8,
                  marginRight: SPACING.small,
                  marginBottom: SPACING.small,
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  minWidth: 60,
                  alignItems: 'center'
                }}>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Sets</Text>
                  <Text style={[TEXT_STYLES.subheading, { color: COLORS.primary }]}>
                    {exercise.sets}
                  </Text>
                </Surface>

                <Surface style={{
                  padding: SPACING.small,
                  borderRadius: 8,
                  marginRight: SPACING.small,
                  marginBottom: SPACING.small,
                  backgroundColor: 'rgba(67, 160, 71, 0.1)',
                  minWidth: 60,
                  alignItems: 'center'
                }}>
                  <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Reps</Text>
                  <Text style={[TEXT_STYLES.subheading, { color: COLORS.success }]}>
                    {exercise.reps}
                  </Text>
                </Surface>
              </>
            )}

            {exercise.category === 'cardio' && (
              <Surface style={{
                padding: SPACING.small,
                borderRadius: 8,
                marginRight: SPACING.small,
                marginBottom: SPACING.small,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                minWidth: 60,
                alignItems: 'center'
              }}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Duration</Text>
                <Text style={[TEXT_STYLES.subheading, { color: COLORS.error }]}>
                  {exercise.duration}s
                </Text>
              </Surface>
            )}

            <Surface style={{
              padding: SPACING.small,
              borderRadius: 8,
              marginRight: SPACING.small,
              marginBottom: SPACING.small,
              backgroundColor: 'rgba(255, 149, 0, 0.1)',
              minWidth: 60,
              alignItems: 'center'
            }}>
              <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Rest</Text>
              <Text style={[TEXT_STYLES.subheading, { color: '#FF9500' }]}>
                {exercise.restTime}s
              </Text>
            </Surface>

            {exercise.weight !== null && (
              <Surface style={{
                padding: SPACING.small,
                borderRadius: 8,
                marginBottom: SPACING.small,
                backgroundColor: 'rgba(156, 39, 176, 0.1)',
                minWidth: 60,
                alignItems: 'center'
              }}>
                <Text style={[TEXT_STYLES.caption, { fontWeight: 'bold' }]}>Weight</Text>
                <Text style={[TEXT_STYLES.subheading, { color: '#9C27B0' }]}>
                  {exercise.weight || 0} kg
                </Text>
              </Surface>
            )}
          </View>

          {exercise.notes && (
            <View style={{
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              padding: SPACING.small,
              borderRadius: 8,
              marginTop: SPACING.small
            }}>
              <Text style={[TEXT_STYLES.caption, { fontStyle: 'italic' }]}>
                💭 {exercise.notes}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderExerciseLibrary = () => (
    <Portal>
      <BlurView intensity={80} style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          paddingTop: 60,
        }}>
          <Surface style={{
            flex: 1,
            margin: SPACING.medium,
            borderRadius: 16,
            padding: SPACING.medium,
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
              <Text style={[TEXT_STYLES.heading, { flex: 1 }]}>
                Exercise Library 💪
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowExerciseLibrary(false)}
              />
            </View>

            {/* Search */}
            <Searchbar
              placeholder="Search exercises..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{ marginBottom: SPACING.medium }}
            />

            {/* Category Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: SPACING.medium }}
              contentContainerStyle={{ paddingRight: SPACING.large }}
            >
              {workoutCategories.map(category => (
                <TouchableOpacity
                  key={category.key}
                  onPress={() => {
                    setSelectedCategory(category.key);
                    Vibration.vibrate(50);
                  }}
                  style={{
                    paddingHorizontal: SPACING.medium,
                    paddingVertical: SPACING.small,
                    borderRadius: 20,
                    backgroundColor: selectedCategory === category.key ? category.color : 'transparent',
                    borderWidth: 1,
                    borderColor: category.color,
                    marginRight: SPACING.small,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Icon
                    name={category.icon}
                    size={16}
                    color={selectedCategory === category.key ? 'white' : category.color}
                  />
                  <Text style={{
                    marginLeft: SPACING.xsmall,
                    color: selectedCategory === category.key ? 'white' : category.color,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Exercise List */}
            <FlatList
              data={getFilteredExercises()}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => renderExerciseCard(item)}
              showsVerticalScrollIndicator={false}
            />
          </Surface>
        </View>
      </BlurView>
    </Portal>
  );

  const renderExerciseEditor = () => (
    <Portal>
      <BlurView intensity={80} style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          paddingHorizontal: SPACING.medium,
        }}>
          <Surface style={{
            padding: SPACING.large,
            borderRadius: 16,
            maxHeight: height * 0.8,
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.large }}>
                <Text style={[TEXT_STYLES.heading]}>
                  Edit Exercise ⚙️
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setEditingExercise(null)}
                />
              </View>

              {editingExercise && (
                <>
                  <Text style={[TEXT_STYLES.subheading, { marginBottom: SPACING.small }]}>
                    {editingExercise.name}
                  </Text>

                  {editingExercise.category !== 'cardio' && (
                    <>
                      <View style={{ marginBottom: SPACING.medium }}>
                        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                          Sets: {editingExercise.sets}
                        </Text>
                        <Slider
                          style={{ height: 40 }}
                          minimumValue={1}
                          maximumValue={10}
                          value={editingExercise.sets}
                          onValueChange={(value) => updateExercise(editingExercise.id, 'sets', Math.round(value))}
                          thumbStyle={{ backgroundColor: COLORS.primary }}
                          trackStyle={{ backgroundColor: COLORS.primary + '30' }}
                        />
                      </View>

                      <View style={{ marginBottom: SPACING.medium }}>
                        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                          Reps: {editingExercise.reps}
                        </Text>
                        <Slider
                          style={{ height: 40 }}
                          minimumValue={1}
                          maximumValue={50}
                          value={editingExercise.reps}
                          onValueChange={(value) => updateExercise(editingExercise.id, 'reps', Math.round(value))}
                          thumbStyle={{ backgroundColor: COLORS.success }}
                          trackStyle={{ backgroundColor: COLORS.success + '30' }}
                        />
                      </View>
                    </>
                  )}

                  {editingExercise.category === 'cardio' && (
                    <View style={{ marginBottom: SPACING.medium }}>
                      <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                        Duration: {editingExercise.duration}s
                      </Text>
                      <Slider
                        style={{ height: 40 }}
                        minimumValue={10}
                        maximumValue={300}
                        value={editingExercise.duration}
                        onValueChange={(value) => updateExercise(editingExercise.id, 'duration', Math.round(value))}
                        thumbStyle={{ backgroundColor: COLORS.error }}
                        trackStyle={{ backgroundColor: COLORS.error + '30' }}
                      />
                    </View>
                  )}

                  <View style={{ marginBottom: SPACING.medium }}>
                    <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                      Rest Time: {editingExercise.restTime}s
                    </Text>
                    <Slider
                      style={{ height: 40 }}
                      minimumValue={15}
                      maximumValue={300}
                      value={editingExercise.restTime}
                      onValueChange={(value) => updateExercise(editingExercise.id, 'restTime', Math.round(value))}
                      thumbStyle={{ backgroundColor: '#FF9500' }}
                      trackStyle={{ backgroundColor: '#FF9500' + '30' }}
                    />
                  </View>

                  {editingExercise.weight !== null && (
                    <View style={{ marginBottom: SPACING.medium }}>
                      <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                        Weight: {editingExercise.weight} kg
                      </Text>
                      <Slider
                        style={{ height: 40 }}
                        minimumValue={0}
                        maximumValue={200}
                        value={editingExercise.weight}
                        onValueChange={(value) => updateExercise(editingExercise.id, 'weight', Math.round(value))}
                        thumbStyle={{ backgroundColor: '#9C27B0' }}
                        trackStyle={{ backgroundColor: '#9C27B0' + '30' }}
                      />
                    </View>
                  )}

                 <View style={{ marginBottom: SPACING.medium }}>
                    <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>
                      Notes
                    </Text>
                    <TextInput
                      placeholder="Add exercise notes..."
                      value={editingExercise.notes}
                      onChangeText={(text) => updateExercise(editingExercise.id, 'notes', text)}
                      multiline
                      numberOfLines={3}
                      style={{
                        borderWidth: 1,
                        borderColor: COLORS.primary + '30',
                        borderRadius: 8,
                        padding: SPACING.small,
                        textAlignVertical: 'top',
                        backgroundColor: '#F5F5F5',
                        fontSize: 14,
                      }}
                    />
                  </View>

                  <Button
                    mode="contained"
                    onPress={() => setEditingExercise(null)}
                    style={{ backgroundColor: COLORS.primary }}
                  >
                    Done
                  </Button>
                </>
              )}
            </ScrollView>
          </Surface>
        </View>
      </BlurView>
    </Portal>
  );

  const renderWorkoutSettings = () => (
    <Portal>
      <BlurView intensity={80} style={{ flex: 1 }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          paddingHorizontal: SPACING.medium,
        }}>
          <Surface style={{
            padding: SPACING.large,
            borderRadius: 16,
            maxHeight: height * 0.8,
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.large }}>
                <Text style={[TEXT_STYLES.heading]}>
                  Workout Settings ⚙️
                </Text>
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setShowWorkoutSettings(false)}
                />
              </View>

              <View style={{ marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small, fontWeight: 'bold' }]}>
                  Workout Name
                </Text>
                <TextInput
                  placeholder="Enter workout name..."
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.primary + '30',
                    borderRadius: 8,
                    padding: SPACING.small,
                    backgroundColor: '#F5F5F5',
                    fontSize: 16,
                  }}
                />
              </View>

              <View style={{ marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small, fontWeight: 'bold' }]}>
                  Description
                </Text>
                <TextInput
                  placeholder="Describe your workout..."
                  value={workoutDescription}
                  onChangeText={setWorkoutDescription}
                  multiline
                  numberOfLines={3}
                  style={{
                    borderWidth: 1,
                    borderColor: COLORS.primary + '30',
                    borderRadius: 8,
                    padding: SPACING.small,
                    textAlignVertical: 'top',
                    backgroundColor: '#F5F5F5',
                    fontSize: 14,
                  }}
                />
              </View>

              <View style={{ marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small, fontWeight: 'bold' }]}>
                  Workout Type
                </Text>
                <RadioButton.Group onValueChange={setWorkoutType} value={workoutType}>
                  {workoutTypes.map(type => (
                    <TouchableOpacity
                      key={type.key}
                      onPress={() => setWorkoutType(type.key)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: SPACING.small,
                        paddingHorizontal: SPACING.small,
                        marginBottom: SPACING.xsmall,
                        borderRadius: 8,
                        backgroundColor: workoutType === type.key ? COLORS.primary + '20' : 'transparent',
                      }}
                    >
                      <RadioButton value={type.key} />
                      <Icon
                        name={type.icon}
                        size={20}
                        color={workoutType === type.key ? COLORS.primary : COLORS.textSecondary}
                        style={{ marginLeft: SPACING.small, marginRight: SPACING.small }}
                      />
                      <Text style={[
                        TEXT_STYLES.body,
                        { color: workoutType === type.key ? COLORS.primary : COLORS.text }
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </RadioButton.Group>
              </View>

              <View style={{ marginBottom: SPACING.medium }}>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small, fontWeight: 'bold' }]}>
                  Difficulty Level
                </Text>
                <RadioButton.Group onValueChange={setDifficulty} value={difficulty}>
                  {['beginner', 'intermediate', 'advanced'].map(level => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setDifficulty(level)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: SPACING.small,
                        paddingHorizontal: SPACING.small,
                        marginBottom: SPACING.xsmall,
                        borderRadius: 8,
                        backgroundColor: difficulty === level ? getDifficultyColor(level) + '20' : 'transparent',
                      }}
                    >
                      <RadioButton value={level} />
                      <Text style={[
                        TEXT_STYLES.body,
                        { 
                          marginLeft: SPACING.small,
                          color: difficulty === level ? getDifficultyColor(level) : COLORS.text,
                          textTransform: 'capitalize',
                          fontWeight: difficulty === level ? 'bold' : 'normal'
                        }
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </RadioButton.Group>
              </View>

              <View style={{ marginBottom: SPACING.large }}>
                <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small, fontWeight: 'bold' }]}>
                  Estimated Duration: {duration} minutes
                </Text>
                <Slider
                  style={{ height: 40 }}
                  minimumValue={15}
                  maximumValue={120}
                  value={duration}
                  onValueChange={(value) => setDuration(Math.round(value))}
                  thumbStyle={{ backgroundColor: COLORS.primary }}
                  trackStyle={{ backgroundColor: COLORS.primary + '30' }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xsmall }}>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>15 min</Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>2 hours</Text>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={() => setShowWorkoutSettings(false)}
                style={{ backgroundColor: COLORS.primary }}
              >
                Save Settings
              </Button>
            </ScrollView>
          </Surface>
        </View>
      </BlurView>
    </Portal>
  );

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5'
      }}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={{
            padding: SPACING.large,
            borderRadius: 16,
            alignItems: 'center'
          }}
        >
          <Icon name="fitness-center" size={48} color="white" />
          <Text style={[TEXT_STYLES.subheading, { color: 'white', marginTop: SPACING.small }]}>
            Loading Workout Builder...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={{
          paddingTop: 50,
          paddingBottom: SPACING.medium,
          paddingHorizontal: SPACING.medium,
        }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <IconButton
              icon="arrow-left"
              size={24}
              iconColor="white"
              onPress={() => navigation.goBack()}
            />
            <View style={{ flex: 1 }}>
              <Text style={[TEXT_STYLES.heading, { color: 'white', fontSize: 20 }]}>
                {workoutId ? 'Edit Workout' : 'Create Workout'} 💪
              </Text>
              <Text style={[TEXT_STYLES.body, { color: 'white', opacity: 0.8 }]}>
                Build your perfect training session
              </Text>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="cog"
              size={24}
              iconColor="white"
              onPress={() => setShowWorkoutSettings(true)}
            />
            <IconButton
              icon="bookmark-outline"
              size={24}
              iconColor="white"
              onPress={() => setShowTemplates(true)}
            />
          </View>
        </View>

        {/* Workout Info Summary */}
        <Surface style={{
          marginTop: SPACING.medium,
          padding: SPACING.medium,
          borderRadius: 12,
          backgroundColor: 'rgba(255,255,255,0.95)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={[TEXT_STYLES.subheading, { fontWeight: 'bold' }]}>
              {workoutName || 'New Workout'}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              {workoutType.toUpperCase()} • {difficulty.toUpperCase()} • {duration} min
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
              Exercises
            </Text>
            <Text style={[TEXT_STYLES.subheading, { fontWeight: 'bold', color: COLORS.primary }]}>
              {exercises.length}
            </Text>
          </View>
        </Surface>
      </LinearGradient>

      {/* Content */}
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Exercises List */}
          {exercises.length > 0 ? (
            <FlatList
              data={exercises}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderWorkoutExercise}
              scrollEnabled={false}
              style={{ marginTop: SPACING.medium }}
            />
          ) : (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 60,
              paddingHorizontal: SPACING.large,
            }}>
              <Icon
                name="fitness-center"
                size={64}
                color={COLORS.textSecondary}
                style={{ opacity: 0.5 }}
              />
              <Text style={[TEXT_STYLES.subheading, {
                color: COLORS.textSecondary,
                textAlign: 'center',
                marginTop: SPACING.medium,
                marginBottom: SPACING.small
              }]}>
                No exercises added yet
              </Text>
              <Text style={[TEXT_STYLES.body, {
                color: COLORS.textSecondary,
                textAlign: 'center',
                opacity: 0.7
              }]}>
                Tap the + button to start building your workout
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* FAB Menu */}
      <View style={{
        position: 'absolute',
        bottom: SPACING.large,
        right: SPACING.medium,
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}>
        {exercises.length > 0 && (
          <FAB
            icon="content-save"
            style={{
              backgroundColor: COLORS.success,
              marginBottom: SPACING.small,
            }}
            onPress={saveWorkout}
            loading={saving}
            disabled={saving}
          />
        )}
        
        <FAB
          icon="plus"
          style={{ backgroundColor: COLORS.primary }}
          onPress={() => setShowExerciseLibrary(true)}
        />
      </View>

      {/* Modals */}
      {showExerciseLibrary && renderExerciseLibrary()}
      {editingExercise && renderExerciseEditor()}
      {showWorkoutSettings && renderWorkoutSettings()}
    </View>
  );
};

export default WorkoutBuilder;
