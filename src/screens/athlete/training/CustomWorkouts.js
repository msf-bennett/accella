import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  FlatList,
  Dimensions,
  Vibration,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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
  Dialog,
  Divider,
  Switch,
  RadioButton,
  Menu,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SPACING, TEXT_STYLES } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const CustomWorkouts = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const { customWorkouts } = useSelector(state => state.training);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Form state for creating/editing workouts
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    description: '',
    intensity: 'Medium',
    category: 'Custom',
    exercises: [],
    totalDuration: 0,
    estimatedCalories: 0,
    difficulty: 'Intermediate',
    equipment: 'None',
    isPublic: false,
    tags: [],
  });

  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    duration: 30,
    rest: 15,
    type: 'cardio',
    instructions: '',
  });

  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState(-1);

  // Mock custom workouts data
  const [customWorkoutsList, setCustomWorkoutsList] = useState([
    {
      id: '1',
      name: 'My Morning Energizer ⚡',
      description: 'Quick 15-minute routine to kickstart my day',
      intensity: 'Medium',
      category: 'Morning',
      duration: 15,
      calories: 150,
      exercises: [
        { name: 'Jumping Jacks', duration: 60, rest: 15, type: 'cardio' },
        { name: 'Bodyweight Squats', duration: 45, rest: 15, type: 'strength' },
        { name: 'Push-ups', duration: 30, rest: 20, type: 'strength' },
        { name: 'High Knees', duration: 45, rest: 15, type: 'cardio' },
      ],
      difficulty: 'Beginner',
      equipment: 'None',
      isPublic: false,
      tags: ['morning', 'quick', 'energy'],
      created: '2024-01-15',
      lastUsed: '2024-01-20',
      timesCompleted: 5,
      isFavorite: true,
      color: '#667eea',
    },
    {
      id: '2',
      name: 'Soccer Conditioning 🔥',
      description: 'Sport-specific training for soccer players',
      intensity: 'High',
      category: 'Sport-Specific',
      duration: 25,
      calories: 300,
      exercises: [
        { name: 'Cone Sprints', duration: 30, rest: 30, type: 'cardio' },
        { name: 'Ladder Drills', duration: 45, rest: 15, type: 'agility' },
        { name: 'Shuttle Runs', duration: 60, rest: 30, type: 'cardio' },
        { name: 'Ball Juggling', duration: 120, rest: 60, type: 'skill' },
      ],
      difficulty: 'Advanced',
      equipment: 'Cones, Ball',
      isPublic: true,
      tags: ['soccer', 'conditioning', 'agility'],
      created: '2024-01-10',
      lastUsed: '2024-01-18',
      timesCompleted: 12,
      isFavorite: false,
      color: '#2ed573',
    },
    {
      id: '3',
      name: 'Stress Relief Flow 🧘',
      description: 'Gentle movements to release tension and stress',
      intensity: 'Low',
      category: 'Wellness',
      duration: 20,
      calories: 100,
      exercises: [
        { name: 'Deep Breathing', duration: 180, rest: 0, type: 'breathing' },
        { name: 'Gentle Stretching', duration: 240, rest: 30, type: 'flexibility' },
        { name: 'Walking in Place', duration: 300, rest: 0, type: 'cardio' },
        { name: 'Meditation', duration: 180, rest: 0, type: 'mindfulness' },
      ],
      difficulty: 'Beginner',
      equipment: 'Yoga Mat',
      isPublic: false,
      tags: ['stress', 'relaxation', 'mindfulness'],
      created: '2024-01-12',
      lastUsed: '2024-01-19',
      timesCompleted: 8,
      isFavorite: true,
      color: '#ff6b9d',
    },
  ]);

  const exerciseTypes = ['cardio', 'strength', 'flexibility', 'agility', 'skill', 'breathing', 'mindfulness'];
  const intensityLevels = ['Low', 'Medium', 'High'];
  const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const categories = ['Custom', 'Morning', 'Evening', 'Sport-Specific', 'Wellness', 'HIIT', 'Recovery'];
  const sortOptions = ['recent', 'name', 'duration', 'favorite'];
  const filterOptions = ['all', 'favorite', 'public', 'private', 'recent'];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const resetWorkoutForm = () => {
    setWorkoutForm({
      name: '',
      description: '',
      intensity: 'Medium',
      category: 'Custom',
      exercises: [],
      totalDuration: 0,
      estimatedCalories: 0,
      difficulty: 'Intermediate',
      equipment: 'None',
      isPublic: false,
      tags: [],
    });
  };

  const resetExerciseForm = () => {
    setExerciseForm({
      name: '',
      duration: 30,
      rest: 15,
      type: 'cardio',
      instructions: '',
    });
  };

  const calculateWorkoutMetrics = (exercises) => {
    const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration + ex.rest, 0);
    const estimatedCalories = Math.round(totalDuration * 0.15); // Rough estimate
    return { totalDuration: Math.round(totalDuration / 60), estimatedCalories };
  };

  const handleAddExercise = () => {
    if (!exerciseForm.name) {
      Alert.alert('Error', 'Please enter exercise name');
      return;
    }

    const updatedExercises = [...workoutForm.exercises];
    
    if (editingExerciseIndex >= 0) {
      updatedExercises[editingExerciseIndex] = { ...exerciseForm };
    } else {
      updatedExercises.push({ ...exerciseForm });
    }

    const metrics = calculateWorkoutMetrics(updatedExercises);
    
    setWorkoutForm(prev => ({
      ...prev,
      exercises: updatedExercises,
      ...metrics,
    }));

    resetExerciseForm();
    setShowExerciseModal(false);
    setEditingExerciseIndex(-1);
    Vibration.vibrate(50);
  };

  const handleEditExercise = (index) => {
    const exercise = workoutForm.exercises[index];
    setExerciseForm({ ...exercise });
    setEditingExerciseIndex(index);
    setShowExerciseModal(true);
  };

  const handleDeleteExercise = (index) => {
    const updatedExercises = workoutForm.exercises.filter((_, i) => i !== index);
    const metrics = calculateWorkoutMetrics(updatedExercises);
    
    setWorkoutForm(prev => ({
      ...prev,
      exercises: updatedExercises,
      ...metrics,
    }));
    Vibration.vibrate(100);
  };

  const handleSaveWorkout = () => {
    if (!workoutForm.name) {
      Alert.alert('Error', 'Please enter workout name');
      return;
    }

    if (workoutForm.exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    const newWorkout = {
      ...workoutForm,
      id: selectedWorkout ? selectedWorkout.id : Date.now().toString(),
      created: selectedWorkout ? selectedWorkout.created : new Date().toISOString().split('T')[0],
      lastUsed: new Date().toISOString().split('T')[0],
      timesCompleted: selectedWorkout ? selectedWorkout.timesCompleted : 0,
      isFavorite: selectedWorkout ? selectedWorkout.isFavorite : false,
      color: selectedWorkout ? selectedWorkout.color : COLORS.primary,
    };

    if (selectedWorkout) {
      setCustomWorkoutsList(prev => 
        prev.map(w => w.id === selectedWorkout.id ? newWorkout : w)
      );
    } else {
      setCustomWorkoutsList(prev => [newWorkout, ...prev]);
    }

    resetWorkoutForm();
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedWorkout(null);
    
    Vibration.vibrate([100, 50, 100]);
    Alert.alert('Success! 🎉', `Workout ${selectedWorkout ? 'updated' : 'created'} successfully!`);
  };

  const handleDeleteWorkout = () => {
    setCustomWorkoutsList(prev => prev.filter(w => w.id !== workoutToDelete.id));
    setShowDeleteDialog(false);
    setWorkoutToDelete(null);
    Vibration.vibrate([100, 50, 100]);
  };

  const handleToggleFavorite = (workoutId) => {
    setCustomWorkoutsList(prev =>
      prev.map(w => 
        w.id === workoutId 
          ? { ...w, isFavorite: !w.isFavorite }
          : w
      )
    );
    Vibration.vibrate(50);
  };

  const handleStartWorkout = (workout) => {
    navigation.navigate('WorkoutSession', { workout });
    setCustomWorkoutsList(prev =>
      prev.map(w => 
        w.id === workout.id 
          ? { ...w, lastUsed: new Date().toISOString().split('T')[0], timesCompleted: w.timesCompleted + 1 }
          : w
      )
    );
  };

  const handleEditWorkout = (workout) => {
    setSelectedWorkout(workout);
    setWorkoutForm({ ...workout });
    setShowEditModal(true);
  };

  const filterAndSortWorkouts = useCallback(() => {
    let filtered = customWorkoutsList.filter(workout => {
      const matchesSearch = workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          workout.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          workout.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesFilter = true;
      if (filterBy === 'favorite') matchesFilter = workout.isFavorite;
      else if (filterBy === 'public') matchesFilter = workout.isPublic;
      else if (filterBy === 'private') matchesFilter = !workout.isPublic;
      else if (filterBy === 'recent') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesFilter = new Date(workout.lastUsed) >= weekAgo;
      }
      
      return matchesSearch && matchesFilter;
    });

    // Sort workouts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration':
          return b.duration - a.duration;
        case 'favorite':
          return b.isFavorite - a.isFavorite;
        case 'recent':
        default:
          return new Date(b.lastUsed) - new Date(a.lastUsed);
      }
    });

    return filtered;
  }, [customWorkoutsList, searchQuery, sortBy, filterBy]);

  const renderWorkoutCard = ({ item: workout }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: SPACING.medium,
      }}
    >
      <Card style={{ marginHorizontal: SPACING.medium, elevation: 4 }}>
        <LinearGradient
          colors={[workout.color, workout.color + '80']}
          style={{
            padding: SPACING.medium,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.small }}>
                <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
                  {workout.name}
                </Text>
                {workout.isFavorite && (
                  <Icon name="favorite" size={20} color="white" style={{ marginLeft: SPACING.small }} />
                )}
              </View>
              <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.9)' }]}>
                {workout.description}
              </Text>
            </View>
            <IconButton
              icon="favorite"
              iconColor={workout.isFavorite ? '#ffeb3b' : 'rgba(255,255,255,0.7)'}
              size={24}
              onPress={() => handleToggleFavorite(workout.id)}
            />
          </View>
        </LinearGradient>

        <Card.Content style={{ padding: SPACING.medium }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.medium }}>
            <View style={{ alignItems: 'center' }}>
              <Icon name="schedule" size={20} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {workout.duration} min
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="local-fire-department" size={20} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {workout.calories} cal
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="fitness-center" size={20} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {workout.exercises.length} exercises
              </Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Icon name="repeat" size={20} color={COLORS.text.secondary} />
              <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                {workout.timesCompleted}x done
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.medium }}>
            <Chip
              mode="outlined"
              style={{ 
                marginRight: SPACING.small,
                marginBottom: SPACING.small,
                backgroundColor: COLORS.primary + '20',
              }}
              textStyle={{ color: COLORS.primary, fontSize: 12 }}
            >
              {workout.intensity}
            </Chip>
            <Chip
              mode="outlined"
              style={{ 
                marginRight: SPACING.small,
                marginBottom: SPACING.small,
                backgroundColor: COLORS.secondary + '20',
              }}
              textStyle={{ color: COLORS.secondary, fontSize: 12 }}
            >
              {workout.category}
            </Chip>
            {workout.isPublic && (
              <Chip
                mode="outlined"
                icon="public"
                style={{ 
                  marginBottom: SPACING.small,
                  backgroundColor: COLORS.success + '20',
                }}
                textStyle={{ color: COLORS.success, fontSize: 12 }}
              >
                Public
              </Chip>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button
              mode="outlined"
              onPress={() => handleEditWorkout(workout)}
              style={{ flex: 1, marginRight: SPACING.small }}
              icon="edit"
            >
              Edit
            </Button>
            <Button
              mode="contained"
              onPress={() => handleStartWorkout(workout)}
              style={{ flex: 1, marginRight: SPACING.small }}
              icon="play-arrow"
            >
              Start
            </Button>
            <IconButton
              icon="delete"
              iconColor={COLORS.error}
              size={24}
              onPress={() => {
                setWorkoutToDelete(workout);
                setShowDeleteDialog(true);
              }}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderCreateWorkoutModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal || showEditModal}
        onDismiss={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          resetWorkoutForm();
          setSelectedWorkout(null);
        }}
        contentContainerStyle={{
          backgroundColor: COLORS.background.primary,
          margin: SPACING.medium,
          borderRadius: 12,
          maxHeight: '90%',
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={{ padding: SPACING.large, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            >
              <Text style={[TEXT_STYLES.h2, { color: 'white', textAlign: 'center' }]}>
                {selectedWorkout ? 'Edit Workout' : 'Create Workout'} 🏗️
              </Text>
            </LinearGradient>

            <View style={{ padding: SPACING.large }}>
              <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.small }]}>
                Basic Information
              </Text>
              
              <TextInput
                placeholder="Workout name *"
                value={workoutForm.name}
                onChangeText={(text) => setWorkoutForm(prev => ({ ...prev, name: text }))}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  padding: SPACING.medium,
                  marginBottom: SPACING.medium,
                  backgroundColor: COLORS.background.secondary,
                }}
              />

              <TextInput
                placeholder="Description"
                value={workoutForm.description}
                onChangeText={(text) => setWorkoutForm(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
                style={{
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderRadius: 8,
                  padding: SPACING.medium,
                  marginBottom: SPACING.medium,
                  backgroundColor: COLORS.background.secondary,
                  textAlignVertical: 'top',
                }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.medium }}>
                <View style={{ flex: 1, marginRight: SPACING.small }}>
                  <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>Intensity</Text>
                  <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8 }}>
                    {intensityLevels.map((intensity) => (
                      <TouchableOpacity
                        key={intensity}
                        onPress={() => setWorkoutForm(prev => ({ ...prev, intensity }))}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: SPACING.small,
                        }}
                      >
                        <RadioButton
                          value={intensity}
                          status={workoutForm.intensity === intensity ? 'checked' : 'unchecked'}
                          color={COLORS.primary}
                        />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.small }]}>
                          {intensity}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ flex: 1, marginLeft: SPACING.small }}>
                  <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>Difficulty</Text>
                  <View style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8 }}>
                    {difficultyLevels.map((difficulty) => (
                      <TouchableOpacity
                        key={difficulty}
                        onPress={() => setWorkoutForm(prev => ({ ...prev, difficulty }))}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: SPACING.small,
                        }}
                      >
                        <RadioButton
                          value={difficulty}
                          status={workoutForm.difficulty === difficulty ? 'checked' : 'unchecked'}
                          color={COLORS.primary}
                        />
                        <Text style={[TEXT_STYLES.body, { marginLeft: SPACING.small }]}>
                          {difficulty}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.large }}>
                <Text style={TEXT_STYLES.body}>Make workout public</Text>
                <Switch
                  value={workoutForm.isPublic}
                  onValueChange={(value) => setWorkoutForm(prev => ({ ...prev, isPublic: value }))}
                  color={COLORS.primary}
                />
              </View>

              <Divider style={{ marginBottom: SPACING.large }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.medium }}>
                <Text style={TEXT_STYLES.h4}>Exercises ({workoutForm.exercises.length})</Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    resetExerciseForm();
                    setShowExerciseModal(true);
                  }}
                  icon="add"
                  compact
                >
                  Add Exercise
                </Button>
              </View>

              {workoutForm.exercises.map((exercise, index) => (
                <Surface
                  key={index}
                  style={{
                    padding: SPACING.medium,
                    marginBottom: SPACING.small,
                    borderRadius: 8,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[TEXT_STYLES.body, { fontWeight: 'bold' }]}>
                        {exercise.name}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                        {exercise.duration}s work • {exercise.rest}s rest • {exercise.type}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <IconButton
                        icon="edit"
                        size={20}
                        onPress={() => handleEditExercise(index)}
                      />
                      <IconButton
                        icon="delete"
                        iconColor={COLORS.error}
                        size={20}
                        onPress={() => handleDeleteExercise(index)}
                      />
                    </View>
                  </View>
                </Surface>
              ))}

              {workoutForm.exercises.length > 0 && (
                <Surface
                  style={{
                    padding: SPACING.medium,
                    marginBottom: SPACING.large,
                    borderRadius: 8,
                    elevation: 2,
                    backgroundColor: COLORS.primary + '10',
                  }}
                >
                  <Text style={[TEXT_STYLES.h4, { textAlign: 'center', marginBottom: SPACING.small }]}>
                    Workout Summary
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                        {workoutForm.totalDuration}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                        Minutes
                      </Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>
                        ~{workoutForm.estimatedCalories}
                      </Text>
                      <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
                        Calories
                      </Text>
                    </View>
                  </View>
                </Surface>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetWorkoutForm();
                    setSelectedWorkout(null);
                  }}
                  style={{ flex: 1, marginRight: SPACING.small }}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSaveWorkout}
                  style={{ flex: 1 }}
                  disabled={!workoutForm.name || workoutForm.exercises.length === 0}
                >
                  {selectedWorkout ? 'Update' : 'Create'}
                </Button>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );

  const renderExerciseModal = () => (
    <Portal>
      <Modal
        visible={showExerciseModal}
        onDismiss={() => {
          setShowExerciseModal(false);
          resetExerciseForm();
          setEditingExerciseIndex(-1);
        }}
        contentContainerStyle={{
          backgroundColor: COLORS.background.primary,
          margin: SPACING.medium,
          borderRadius: 12,
          padding: SPACING.large,
        }}
      >
        <Text style={[TEXT_STYLES.h3, { textAlign: 'center', marginBottom: SPACING.large }]}>
          {editingExerciseIndex >= 0 ? 'Edit Exercise' : 'Add Exercise'} 💪
        </Text>

        <TextInput
          placeholder="Exercise name *"
          value={exerciseForm.name}
          onChangeText={(text) => setExerciseForm(prev => ({ ...prev, name: text }))}
          style={{
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 8,
            padding: SPACING.medium,
            marginBottom: SPACING.medium,
            backgroundColor: COLORS.background.secondary,
          }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.medium }}>
          <View style={{ flex: 1, marginRight: SPACING.small }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>Duration (seconds)</Text>
            <TextInput
              value={exerciseForm.duration.toString()}
              onChangeText={(text) => setExerciseForm(prev => ({ ...prev, duration: parseInt(text) || 0 }))}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: SPACING.medium,
                backgroundColor: COLORS.background.secondary,
              }}
            />
          </View>

          <View style={{ flex: 1, marginLeft: SPACING.small }}>
            <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>Rest (seconds)</Text>
            <TextInput
              value={exerciseForm.rest.toString()}
              onChangeText={(text) => setExerciseForm(prev => ({ ...prev, rest: parseInt(text) || 0 }))}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: SPACING.medium,
                backgroundColor: COLORS.background.secondary,
              }}
            />
          </View>
        </View>

        <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.small }]}>Exercise Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: SPACING.medium }}
        >
          {exerciseTypes.map((type) => (
            <Chip
              key={type}
              mode={exerciseForm.type === type ? 'flat' : 'outlined'}
              selected={exerciseForm.type === type}
              onPress={() => setExerciseForm(prev => ({ ...prev, type }))}
              style={{ 
                marginRight: SPACING.small,
                backgroundColor: exerciseForm.type === type ? COLORS.primary : 'transparent',
              }}
              textStyle={{ 
                color: exerciseForm.type === type ? 'white' : COLORS.text.primary 
              }}
            >
              {type}
            </Chip>
          ))}
        </ScrollView>

        <TextInput
          placeholder="Instructions (optional)"
          value={exerciseForm.instructions}
          onChangeText={(text) => setExerciseForm(prev => ({ ...prev, instructions: text }))}
          multiline
          numberOfLines={3}
          style={{
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 8,
            padding: SPACING.medium,
            marginBottom: SPACING.large,
            backgroundColor: COLORS.background.secondary,
            textAlignVertical: 'top',
          }}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button
            mode="outlined"
            onPress={() => {
              setShowExerciseModal(false);
              resetExerciseForm();
              setEditingExerciseIndex(-1);
            }}
            style={{ flex: 1, marginRight: SPACING.small }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleAddExercise}
            style={{ flex: 1 }}
            disabled={!exerciseForm.name}
          >
            {editingExerciseIndex >= 0 ? 'Update' : 'Add'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderDeleteDialog = () => (
    <Portal>
      <Dialog visible={showDeleteDialog} onDismiss={() => setShowDeleteDialog(false)}>
        <Dialog.Title>Delete Workout?</Dialog.Title>
        <Dialog.Content>
          <Text style={TEXT_STYLES.body}>
            Are you sure you want to delete "{workoutToDelete?.name}"? This action cannot be undone.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onPress={handleDeleteWorkout}
            textColor={COLORS.error}
            buttonColor={COLORS.error + '20'}
          >
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={{ paddingTop: StatusBar.currentHeight + SPACING.large, paddingBottom: SPACING.large }}
    >
      <View style={{ paddingHorizontal: SPACING.large }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[TEXT_STYLES.h1, { color: 'white' }]}>
              Custom Workouts 🛠️
            </Text>
            <Text style={[TEXT_STYLES.body, { color: 'rgba(255,255,255,0.8)' }]}>
              Create and manage your personalized training routines
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="sort"
              iconColor="white"
              size={28}
              onPress={() => Alert.alert('Sort Options', 'Advanced sorting coming soon!')}
            />
            <IconButton
              icon="filter-list"
              iconColor="white"
              size={28}
              onPress={() => Alert.alert('Filter Options', 'Advanced filtering coming soon!')}
            />
          </View>
        </View>

        <Searchbar
          placeholder="Search custom workouts..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={{ 
            marginTop: SPACING.medium,
            backgroundColor: 'rgba(255,255,255,0.9)',
            elevation: 0,
          }}
          iconColor={COLORS.primary}
          placeholderTextColor={COLORS.text.secondary}
        />
      </View>
    </LinearGradient>
  );

  const renderStats = () => {
    const totalWorkouts = customWorkoutsList.length;
    const favoriteWorkouts = customWorkoutsList.filter(w => w.isFavorite).length;
    const publicWorkouts = customWorkoutsList.filter(w => w.isPublic).length;
    const totalCompletions = customWorkoutsList.reduce((sum, w) => sum + w.timesCompleted, 0);

    return (
      <Surface style={{ 
        margin: SPACING.medium, 
        padding: SPACING.large, 
        borderRadius: 12, 
        elevation: 2 
      }}>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.medium, textAlign: 'center' }]}>
          Your Custom Workouts 📊
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.primary }]}>
              {totalWorkouts}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Created
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.secondary }]}>
              {favoriteWorkouts}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Favorites
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: COLORS.success }]}>
              {totalCompletions}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Completions
            </Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h2, { color: '#ff6b9d' }]}>
              {publicWorkouts}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.text.secondary }]}>
              Shared
            </Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderQuickActions = () => (
    <View style={{ paddingHorizontal: SPACING.medium, marginBottom: SPACING.medium }}>
      <Text style={[TEXT_STYLES.h4, { marginBottom: SPACING.small }]}>Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          style={{
            backgroundColor: COLORS.primary,
            padding: SPACING.medium,
            borderRadius: 12,
            marginRight: SPACING.medium,
            alignItems: 'center',
            minWidth: 120,
          }}
        >
          <Icon name="add-circle" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small }]}>
            Create New
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Templates', 'Workout templates coming soon! 📋')}
          style={{
            backgroundColor: COLORS.secondary,
            padding: SPACING.medium,
            borderRadius: 12,
            marginRight: SPACING.medium,
            alignItems: 'center',
            minWidth: 120,
          }}
        >
          <Icon name="library-books" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small }]}>
            Templates
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert('Import', 'Import workouts coming soon! 📥')}
          style={{
            backgroundColor: COLORS.success,
            padding: SPACING.medium,
            borderRadius: 12,
            marginRight: SPACING.medium,
            alignItems: 'center',
            minWidth: 120,
          }}
        >
          <Icon name="download" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small }]}>
            Import
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterBy('favorite')}
          style={{
            backgroundColor: '#ff6b9d',
            padding: SPACING.medium,
            borderRadius: 12,
            alignItems: 'center',
            minWidth: 120,
          }}
        >
          <Icon name="favorite" size={32} color="white" />
          <Text style={[TEXT_STYLES.body, { color: 'white', marginTop: SPACING.small }]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const filteredWorkouts = filterAndSortWorkouts();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkoutCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderStats()}
            {renderQuickActions()}
            {filteredWorkouts.length === 0 && (
              <View style={{ 
                alignItems: 'center', 
                padding: SPACING.xxLarge,
                marginTop: SPACING.large 
              }}>
                <Icon name="fitness-center" size={64} color={COLORS.text.secondary} />
                <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.medium, textAlign: 'center' }]}>
                  {customWorkoutsList.length === 0 ? 'No custom workouts yet' : 'No workouts found'}
                </Text>
                <Text style={[TEXT_STYLES.body, { 
                  color: COLORS.text.secondary, 
                  textAlign: 'center',
                  marginTop: SPACING.small,
                  marginBottom: SPACING.large,
                }]}>
                  {customWorkoutsList.length === 0 
                    ? 'Create your first personalized workout!'
                    : 'Try adjusting your search or filters'
                  }
                </Text>
                {customWorkoutsList.length === 0 && (
                  <Button
                    mode="contained"
                    onPress={() => setShowCreateModal(true)}
                    icon="add"
                  >
                    Create Your First Workout
                  </Button>
                )}
              </View>
            )}
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background.secondary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.large,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setShowCreateModal(true)}
      />

      {renderCreateWorkoutModal()}
      {renderExerciseModal()}
      {renderDeleteDialog()}
    </View>
  );
};

export default CustomWorkouts;