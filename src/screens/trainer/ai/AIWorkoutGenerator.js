import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
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
  Portal,
  Modal,
  TextInput,
  Divider,
  Badge,
  Switch,
  Slider,
  RadioButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';

// Design system imports
import { COLORS, SPACING, TEXT_STYLES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const AIFitnessTrainerGenerator = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const scrollViewRef = useRef(null);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0);

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Client workout generation parameters
  const [workoutParams, setWorkoutParams] = useState({
    clientName: '',
    fitnessGoal: 'weight_loss',
    duration: 45,
    intensity: 'moderate',
    equipment: [],
    targetAreas: [],
    healthConditions: '',
    fitnessLevel: 'beginner',
    age: 25,
    clientPreferences: {
      warmupIncluded: true,
      cooldownIncluded: true,
      cardioIncluded: true,
      nutritionTips: true,
    },
  });

  // Data arrays for fitness training
  const fitnessGoals = [
    { key: 'weight_loss', label: 'Weight Loss', icon: 'trending-down', color: COLORS.success },
    { key: 'muscle_gain', label: 'Muscle Building', icon: 'fitness-center', color: COLORS.primary },
    { key: 'strength', label: 'Strength Training', icon: 'strong', color: COLORS.error },
    { key: 'endurance', label: 'Cardio Endurance', icon: 'favorite', color: COLORS.info },
    { key: 'flexibility', label: 'Flexibility', icon: 'accessibility', color: COLORS.secondary },
    { key: 'general_fitness', label: 'General Fitness', icon: 'directions-run', color: COLORS.warning },
  ];

  const equipmentOptions = [
    'Dumbbells', 'Barbells', 'Kettlebells', 'Resistance Bands', 'Cable Machine',
    'Treadmill', 'Stationary Bike', 'Elliptical', 'Rowing Machine', 'Smith Machine',
    'Pull-up Bar', 'Medicine Ball', 'Bosu Ball', 'TRX Suspension', 'Foam Roller',
    'Yoga Mat', 'Battle Ropes', 'Stability Ball', 'Leg Press Machine', 'Lat Pulldown',
  ];

  const targetAreaOptions = [
    'Upper Body', 'Lower Body', 'Core', 'Arms', 'Chest', 'Back', 'Shoulders',
    'Glutes', 'Legs', 'Calves', 'Abs', 'Full Body', 'Functional Movement',
  ];

  const intensityLevels = [
    { key: 'light', label: 'Light', color: COLORS.success, description: 'Recovery/Active rest' },
    { key: 'moderate', label: 'Moderate', color: COLORS.warning, description: 'Steady effort' },
    { key: 'intense', label: 'High Intensity', color: COLORS.error, description: 'Maximum effort' },
  ];

  const fitnessLevels = [
    { key: 'beginner', label: 'Beginner', description: '0-6 months experience' },
    { key: 'intermediate', label: 'Intermediate', description: '6-24 months experience' },
    { key: 'advanced', label: 'Advanced', description: '2+ years experience' },
  ];

  // Sample generated fitness workout
  const sampleWorkout = {
    id: 1,
    title: 'Fat Burn & Tone Workout',
    clientName: 'Sarah Johnson',
    type: 'Weight Loss',
    duration: 45,
    difficulty: 'Beginner',
    aiConfidence: 94,
    estimatedCalories: 420,
    exercises: [
      {
        name: 'Dynamic Warm-up',
        duration: '5 min',
        sets: 1,
        reps: 'Various movements',
        category: 'warmup',
        instructions: 'Arm swings, leg kicks, torso twists, marching in place',
        caloriesBurn: 25,
      },
      {
        name: 'Bodyweight Squats',
        duration: '3 sets',
        sets: 3,
        reps: '12-15',
        category: 'strength',
        instructions: 'Feet shoulder-width apart, lower until thighs parallel to floor',
        restTime: '45-60s',
        caloriesBurn: 60,
        targetMuscles: 'Quadriceps, Glutes, Hamstrings',
      },
      {
        name: 'Modified Push-ups',
        duration: '3 sets',
        sets: 3,
        reps: '8-12',
        category: 'strength',
        instructions: 'Knee push-ups or wall push-ups if needed',
        restTime: '45-60s',
        caloriesBurn: 45,
        targetMuscles: 'Chest, Shoulders, Triceps',
      },
      {
        name: 'Mountain Climbers',
        duration: '3 sets',
        sets: 3,
        reps: '30 seconds',
        category: 'cardio',
        instructions: 'Plank position, alternate bringing knees to chest quickly',
        restTime: '30-45s',
        caloriesBurn: 80,
        targetMuscles: 'Core, Cardio System',
      },
      {
        name: 'Plank Hold',
        duration: '3 sets',
        sets: 3,
        reps: '20-45s',
        category: 'core',
        instructions: 'Maintain straight line from head to heels',
        restTime: '30-45s',
        caloriesBurn: 35,
        targetMuscles: 'Core, Shoulders',
      },
      {
        name: 'Walking Lunges',
        duration: '2 sets',
        sets: 2,
        reps: '10 each leg',
        category: 'strength',
        instructions: 'Step forward, lower back knee toward ground',
        restTime: '60s',
        caloriesBurn: 55,
        targetMuscles: 'Legs, Glutes, Core',
      },
      {
        name: 'Cool-down & Stretch',
        duration: '5 min',
        sets: 1,
        reps: 'Hold 30s each',
        category: 'cooldown',
        instructions: 'Focus on major muscle groups, deep breathing',
        caloriesBurn: 20,
      },
    ],
    nutritionTip: 'Post-workout: Have a protein-rich snack within 30 minutes. Try Greek yogurt with berries or a protein smoothie.',
    progressTracking: 'Track reps completed, rest times, and energy levels (1-10 scale)',
  };

  // Initialize animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // Generate AI fitness workout
  const generateWorkout = async () => {
    if (!workoutParams.clientName || workoutParams.equipment.length === 0) {
      Alert.alert('Missing Information', 'Please enter client name and select at least one equipment option.');
      return;
    }

    setGeneratingWorkout(true);
    
    // Simulate AI generation process
    setTimeout(() => {
      const customizedWorkout = {
        ...sampleWorkout,
        clientName: workoutParams.clientName,
        title: `${workoutParams.fitnessGoal.replace('_', ' ')} Workout for ${workoutParams.clientName}`,
        type: fitnessGoals.find(g => g.key === workoutParams.fitnessGoal)?.label || 'Custom',
        difficulty: workoutParams.fitnessLevel.charAt(0).toUpperCase() + workoutParams.fitnessLevel.slice(1),
      };
      setGeneratedWorkout(customizedWorkout);
      setGeneratingWorkout(false);
      setShowPreview(true);
    }, 3000);
  };

  // Handle parameter updates
  const updateWorkoutParam = (key, value) => {
    setWorkoutParams(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleArrayParam = (key, item) => {
    setWorkoutParams(prev => ({
      ...prev,
      [key]: prev[key].includes(item)
        ? prev[key].filter(i => i !== item)
        : [...prev[key], item],
    }));
  };

  // Render fitness goals selector
  const renderFitnessGoals = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>🎯 Primary Fitness Goal</Text>
      <FlatList
        data={fitnessGoals}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.typeCard,
              workoutParams.fitnessGoal === item.key && styles.selectedTypeCard,
            ]}
            onPress={() => updateWorkoutParam('fitnessGoal', item.key)}
          >
            <LinearGradient
              colors={workoutParams.fitnessGoal === item.key 
                ? [item.color, `${item.color}80`] 
                : [COLORS.lightGray, COLORS.white]
              }
              style={styles.typeGradient}
            >
              <Icon 
                name={item.icon} 
                size={24} 
                color={workoutParams.fitnessGoal === item.key ? COLORS.white : item.color} 
              />
              <Text style={[
                styles.typeText,
                workoutParams.fitnessGoal === item.key && styles.selectedTypeText,
              ]}>
                {item.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        numColumns={2}
        keyExtractor={item => item.key}
        scrollEnabled={false}
      />
    </View>
  );

  // Render duration and intensity controls
  const renderControls = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>⏱️ Session Parameters</Text>
      
      <Card style={styles.controlCard}>
        <Card.Content>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Session Duration: {workoutParams.duration} minutes</Text>
            <Slider
              style={styles.slider}
              minimumValue={15}
              maximumValue={90}
              value={workoutParams.duration}
              onValueChange={(value) => updateWorkoutParam('duration', Math.round(value))}
              thumbStyle={{ backgroundColor: COLORS.primary }}
              trackStyle={{ backgroundColor: COLORS.lightGray }}
              minimumTrackTintColor={COLORS.primary}
            />
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Client Age: {workoutParams.age} years</Text>
            <Slider
              style={styles.slider}
              minimumValue={16}
              maximumValue={80}
              value={workoutParams.age}
              onValueChange={(value) => updateWorkoutParam('age', Math.round(value))}
              thumbStyle={{ backgroundColor: COLORS.secondary }}
              trackStyle={{ backgroundColor: COLORS.lightGray }}
              minimumTrackTintColor={COLORS.secondary}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <Text style={styles.controlLabel}>Training Intensity</Text>
          <View style={styles.intensityContainer}>
            {intensityLevels.map(level => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.intensityButton,
                  { borderColor: level.color },
                  workoutParams.intensity === level.key && { backgroundColor: level.color },
                ]}
                onPress={() => updateWorkoutParam('intensity', level.key)}
              >
                <Text style={[
                  styles.intensityText,
                  workoutParams.intensity === level.key && { color: COLORS.white },
                ]}>
                  {level.label}
                </Text>
                <Text style={[
                  styles.intensityDescription,
                  workoutParams.intensity === level.key && { color: COLORS.white },
                ]}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.controlLabel}>Fitness Level</Text>
          <View style={styles.fitnessLevelContainer}>
            {fitnessLevels.map(level => (
              <TouchableOpacity
                key={level.key}
                style={[
                  styles.fitnessLevelButton,
                  workoutParams.fitnessLevel === level.key && styles.selectedFitnessLevel,
                ]}
                onPress={() => updateWorkoutParam('fitnessLevel', level.key)}
              >
                <Text style={[
                  styles.fitnessLevelText,
                  workoutParams.fitnessLevel === level.key && styles.selectedFitnessLevelText,
                ]}>
                  {level.label}
                </Text>
                <Text style={[
                  styles.fitnessLevelDescription,
                  workoutParams.fitnessLevel === level.key && styles.selectedFitnessLevelText,
                ]}>
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  // Render equipment selector
  const renderEquipment = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>🏋️ Available Equipment</Text>
      <Text style={styles.sectionSubtitle}>Select equipment available for this client session</Text>
      <View style={styles.chipContainer}>
        {equipmentOptions.map(equipment => (
          <Chip
            key={equipment}
            mode={workoutParams.equipment.includes(equipment) ? 'flat' : 'outlined'}
            selected={workoutParams.equipment.includes(equipment)}
            onPress={() => toggleArrayParam('equipment', equipment)}
            style={[
              styles.chip,
              workoutParams.equipment.includes(equipment) && styles.selectedChip,
            ]}
            textStyle={workoutParams.equipment.includes(equipment) && styles.selectedChipText}
          >
            {equipment}
          </Chip>
        ))}
      </View>
    </View>
  );

  // Render target areas selector
  const renderTargetAreas = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>🎯 Focus Areas</Text>
      <Text style={styles.sectionSubtitle}>Select muscle groups and areas to target</Text>
      <View style={styles.chipContainer}>
        {targetAreaOptions.map(area => (
          <Chip
            key={area}
            mode={workoutParams.targetAreas.includes(area) ? 'flat' : 'outlined'}
            selected={workoutParams.targetAreas.includes(area)}
            onPress={() => toggleArrayParam('targetAreas', area)}
            style={[
              styles.chip,
              workoutParams.targetAreas.includes(area) && styles.selectedChip,
            ]}
            textStyle={workoutParams.targetAreas.includes(area) && styles.selectedChipText}
          >
            {area}
          </Chip>
        ))}
      </View>
    </View>
  );

  // Render workout preview
  const renderWorkoutPreview = () => (
    <Portal>
      <Modal
        visible={showPreview}
        onDismiss={() => setShowPreview(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.modalBlur} blurType="light" blurAmount={10}>
          <Card style={styles.previewCard}>
            <Card.Title 
              title="✅ Workout Generated!" 
              titleStyle={styles.modalTitle}
              right={(props) => (
                <IconButton
                  {...props}
                  icon="close"
                  onPress={() => setShowPreview(false)}
                />
              )}
            />
            <Card.Content>
              {generatedWorkout && (
                <ScrollView style={styles.previewScroll}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutTitle}>{generatedWorkout.title}</Text>
                    <Text style={styles.clientName}>For: {generatedWorkout.clientName}</Text>
                    <View style={styles.workoutStats}>
                      <View style={styles.statItem}>
                        <Icon name="schedule" size={16} color={COLORS.primary} />
                        <Text style={styles.statText}>{generatedWorkout.duration} min</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="local-fire-department" size={16} color={COLORS.error} />
                        <Text style={styles.statText}>{generatedWorkout.estimatedCalories} cal</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="psychology" size={16} color={COLORS.success} />
                        <Text style={styles.statText}>AI {generatedWorkout.aiConfidence}%</Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.exerciseHeader}>Workout Plan:</Text>
                  {generatedWorkout.exercises.map((exercise, index) => (
                    <Surface key={index} style={styles.exerciseCard}>
                      <View style={styles.exerciseInfo}>
                        <View style={styles.exerciseNameRow}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          <Text style={styles.caloriesText}>{exercise.caloriesBurn} cal</Text>
                        </View>
                        <Text style={styles.exerciseDetails}>
                          {exercise.sets} sets × {exercise.reps}
                        </Text>
                        {exercise.targetMuscles && (
                          <Text style={styles.targetMuscles}>
                            Target: {exercise.targetMuscles}
                          </Text>
                        )}
                        <Text style={styles.exerciseInstructions}>
                          {exercise.instructions}
                        </Text>
                        {exercise.restTime && (
                          <Text style={styles.restTime}>Rest: {exercise.restTime}</Text>
                        )}
                      </View>
                      <Chip 
                        mode="flat" 
                        compact 
                        style={[styles.categoryChip, { backgroundColor: getCategoryColor(exercise.category) }]}
                      >
                        {exercise.category}
                      </Chip>
                    </Surface>
                  ))}

                  {generatedWorkout.nutritionTip && (
                    <Surface style={styles.nutritionCard}>
                      <View style={styles.nutritionHeader}>
                        <Icon name="restaurant-menu" size={20} color={COLORS.success} />
                        <Text style={styles.nutritionTitle}>Nutrition Tip</Text>
                      </View>
                      <Text style={styles.nutritionText}>{generatedWorkout.nutritionTip}</Text>
                    </Surface>
                  )}

                  <Surface style={styles.trackingCard}>
                    <View style={styles.trackingHeader}>
                      <Icon name="track-changes" size={20} color={COLORS.info} />
                      <Text style={styles.trackingTitle}>Progress Tracking</Text>
                    </View>
                    <Text style={styles.trackingText}>{generatedWorkout.progressTracking}</Text>
                  </Surface>
                </ScrollView>
              )}
            </Card.Content>
            <Card.Actions style={styles.previewActions}>
              <Button onPress={() => setShowPreview(false)}>Edit Workout</Button>
              <Button 
                mode="contained" 
                onPress={() => {
                  Alert.alert('Workout Saved', 'Workout has been saved to client\'s program!');
                  setShowPreview(false);
                }}
              >
                Save to Client
              </Button>
            </Card.Actions>
          </Card>
        </BlurView>
      </Modal>
    </Portal>
  );

  // Get category color helper
  const getCategoryColor = (category) => {
    const colors = {
      warmup: COLORS.info,
      strength: COLORS.primary,
      cardio: COLORS.success,
      core: COLORS.warning,
      cooldown: COLORS.secondary,
    };
    return colors[category] || COLORS.gray;
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#ff6b6b', '#ee5a24']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerTitle}>🤖 AI Fitness Trainer</Text>
          <Text style={styles.headerSubtitle}>Create personalized workouts for your clients</Text>
        </Animated.View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search exercises, client programs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Client Information */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>👤 Client Information</Text>
            <Card style={styles.infoCard}>
              <Card.Content>
                <TextInput
                  label="Client Name *"
                  value={workoutParams.clientName}
                  onChangeText={(text) => updateWorkoutParam('clientName', text)}
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="person" />}
                />
                <TextInput
                  label="Health Conditions/Injuries"
                  value={workoutParams.healthConditions}
                  onChangeText={(text) => updateWorkoutParam('healthConditions', text)}
                  style={styles.input}
                  mode="outlined"
                  multiline
                  left={<TextInput.Icon icon="healing" />}
                  placeholder="e.g., Lower back pain, knee injury, etc."
                />
              </Card.Content>
            </Card>
          </View>

          {renderFitnessGoals()}
          {renderControls()}
          {renderEquipment()}
          {renderTargetAreas()}

          {/* Client Preferences */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>⚙️ Session Preferences</Text>
            <Card style={styles.preferencesCard}>
              <Card.Content>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Include Warm-up</Text>
                  <Switch
                    value={workoutParams.clientPreferences.warmupIncluded}
                    onValueChange={(value) => 
                      setWorkoutParams(prev => ({
                        ...prev,
                        clientPreferences: { ...prev.clientPreferences, warmupIncluded: value }
                      }))
                    }
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Include Cool-down</Text>
                  <Switch
                    value={workoutParams.clientPreferences.cooldownIncluded}
                    onValueChange={(value) => 
                      setWorkoutParams(prev => ({
                        ...prev,
                        clientPreferences: { ...prev.clientPreferences, cooldownIncluded: value }
                      }))
                    }
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Add Cardio Elements</Text>
                  <Switch
                    value={workoutParams.clientPreferences.cardioIncluded}
                    onValueChange={(value) => 
                      setWorkoutParams(prev => ({
                        ...prev,
                        clientPreferences: { ...prev.clientPreferences, cardioIncluded: value }
                      }))
                    }
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Include Nutrition Tips</Text>
                  <Switch
                    value={workoutParams.clientPreferences.nutritionTips}
                    onValueChange={(value) => 
                      setWorkoutParams(prev => ({
                        ...prev,
                        clientPreferences: { ...prev.clientPreferences, nutritionTips: value }
                      }))
                    }
                  />
                </View>
              </Card.Content>
            </Card>
          </View>

          {/* Generate Button */}
          <View style={styles.generateContainer}>
            <Button
              mode="contained"
              onPress={generateWorkout}
              loading={generatingWorkout}
              disabled={generatingWorkout || !workoutParams.clientName}
              style={styles.generateButton}
              contentStyle={styles.generateButtonContent}
              labelStyle={styles.generateButtonLabel}
              icon="auto-awesome"
            >
              {generatingWorkout ? 'Creating Workout...' : 'Generate Client Workout'}
            </Button>
          </View>

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {renderWorkoutPreview()}

      {/* FAB for Client History */}
      <FAB
        style={styles.fab}
        icon="people"
        label="Clients"
        onPress={() => Alert.alert('Client History', 'View previous client workouts!')}
        color={COLORS.white}
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
    paddingTop: StatusBar.currentHeight + SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.lightGray,
  },
  searchInput: {
    ...TEXT_STYLES.body,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  sectionContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TEXT_STYLES.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    fontStyle: 'italic',
  },
  infoCard: {
    borderRadius: 12,
    elevation: 2,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  typeCard: {
    flex: 1,
    margin: SPACING.xs,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedTypeCard: {
    elevation: 4,
  },
  typeGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  typeText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedTypeText: {
    color: COLORS.white,
  },
  controlCard: {
    borderRadius: 12,
    elevation: 2,
  },
  controlRow: {
    marginBottom: SPACING.lg,
  },
  controlLabel: {
    ...TEXT_STYLES.subtitle,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  divider: {
    marginVertical: SPACING.lg,
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    marginHorizontal: SPACING.xs,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  intensityText: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  intensityDescription: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  fitnessLevelContainer: {
    marginTop: SPACING.md,
  },
  fitnessLevelButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  selectedFitnessLevel: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fitnessLevelText: {
    ...TEXT_STYLES.subtitle,
    fontWeight: '600',
  },
  selectedFitnessLevelText: {
    color: COLORS.white,
  },
  fitnessLevelDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: SPACING.xs,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  selectedChipText: {
    color: COLORS.white,
  },
  preferencesCard: {
    borderRadius: 12,
    elevation: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  switchLabel: {
    ...TEXT_STYLES.body,
    flex: 1,
  },
  generateContainer: {
    marginVertical: SPACING.xl,
  },
  generateButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  generateButtonContent: {
    paddingVertical: SPACING.md,
  },
  generateButtonLabel: {
    ...TEXT_STYLES.button,
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  previewCard: {
    width: width * 0.95,
    maxHeight: height * 0.85,
    borderRadius: 16,
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
  },
  previewScroll: {
    maxHeight: height * 0.6,
  },
  workoutHeader: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  workoutTitle: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  clientName: {
    ...TEXT_STYLES.subtitle,
    textAlign: 'center',
    marginBottom: SPACING.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.body,
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  exerciseHeader: {
    ...TEXT_STYLES.h4,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  exerciseCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 8,
    elevation: 1,
    position: 'relative',
  },
  exerciseInfo: {
    flex: 1,
    paddingRight: SPACING.lg,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  exerciseName: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    flex: 1,
  },
  caloriesText: {
    ...TEXT_STYLES.caption,
    color: COLORS.error,
    fontWeight: 'bold',
    backgroundColor: `${COLORS.error}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  exerciseDetails: {
    ...TEXT_STYLES.body,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  targetMuscles: {
    ...TEXT_STYLES.caption,
    color: COLORS.secondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  exerciseInstructions: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  restTime: {
    ...TEXT_STYLES.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
  categoryChip: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  nutritionCard: {
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: `${COLORS.success}10`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  nutritionTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    color: COLORS.success,
  },
  nutritionText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  trackingCard: {
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: `${COLORS.info}10`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trackingTitle: {
    ...TEXT_STYLES.subtitle,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    color: COLORS.info,
  },
  trackingText: {
    ...TEXT_STYLES.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  previewActions: {
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.secondary,
  },
});

export default AIFitnessTrainerGenerator;
