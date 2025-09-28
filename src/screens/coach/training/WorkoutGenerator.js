import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
  Animated,
  TouchableOpacity,
  FlatList,
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
  Text,
  Portal,
  Modal,
  Divider,
  TextInput,
  Switch,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design system imports
import { COLORS } from '../../../styles/colors';
import { SPACING } from '../../../styles/spacing';
import { TEXT_STYLES } from '../../../styles/textStyles';
import { TYPOGRAPHY } from '../../../styles/typography';
import { LAYOUT } from '../../../styles/layout';
//import PlaceholderScreen from '../../../components/PlaceholderScreen';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WorkoutGenerator = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isOnline } = useSelector(state => state.auth);
  const { workouts, loading, error } = useSelector(state => state.training);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Workout generation form state
  const [workoutForm, setWorkoutForm] = useState({
    workoutName: '',
    sport: 'football',
    focusArea: 'strength',
    duration: 60,
    difficulty: 'intermediate',
    playerCount: 15,
    ageGroup: 'adult',
    equipment: [],
    objectives: [],
    customObjectives: '',
    weatherConditions: 'indoor',
    injuryPrevention: false,
    periodization: 'general',
  });

  const [recentWorkouts] = useState([
    {
      id: '1',
      name: 'Pre-Season Conditioning',
      sport: 'football',
      duration: '75 min',
      difficulty: 'advanced',
      created: '2024-03-15',
      exercises: 12,
      usageCount: 25,
      rating: 4.8,
      tags: ['conditioning', 'strength', 'endurance'],
      isAIGenerated: true,
    },
    {
      id: '2',
      name: 'Youth Speed & Agility',
      sport: 'basketball',
      duration: '45 min',
      difficulty: 'beginner',
      created: '2024-03-14',
      exercises: 8,
      usageCount: 18,
      rating: 4.6,
      tags: ['speed', 'agility', 'youth'],
      isAIGenerated: false,
    },
    {
      id: '3',
      name: 'Recovery & Mobility',
      sport: 'soccer',
      duration: '30 min',
      difficulty: 'beginner',
      created: '2024-03-13',
      exercises: 6,
      usageCount: 42,
      rating: 4.9,
      tags: ['recovery', 'mobility', 'flexibility'],
      isAIGenerated: true,
    },
  ]);

  const sports = [
    { key: 'football', label: 'Football', icon: 'sports-football' },
    { key: 'basketball', label: 'Basketball', icon: 'sports-basketball' },
    { key: 'soccer', label: 'Soccer', icon: 'sports-soccer' },
    { key: 'tennis', label: 'Tennis', icon: 'sports-tennis' },
    { key: 'general', label: 'General Fitness', icon: 'fitness-center' },
  ];

  const focusAreas = [
    { key: 'strength', label: 'Strength Training', icon: 'fitness-center', color: '#E91E63' },
    { key: 'cardio', label: 'Cardiovascular', icon: 'favorite', color: '#F44336' },
    { key: 'agility', label: 'Speed & Agility', icon: 'directions-run', color: '#FF9800' },
    { key: 'skills', label: 'Technical Skills', icon: 'sports', color: '#2196F3' },
    { key: 'tactical', label: 'Tactical Training', icon: 'strategy', color: '#9C27B0' },
    { key: 'recovery', label: 'Recovery & Mobility', icon: 'healing', color: '#4CAF50' },
  ];

  const equipmentOptions = [
    { key: 'cones', label: 'Cones', icon: 'traffic' },
    { key: 'balls', label: 'Balls', icon: 'sports-soccer' },
    { key: 'weights', label: 'Weights', icon: 'fitness-center' },
    { key: 'ladders', label: 'Agility Ladders', icon: 'straighten' },
    { key: 'hurdles', label: 'Hurdles', icon: 'horizontal-rule' },
    { key: 'resistance', label: 'Resistance Bands', icon: 'drag-handle' },
  ];

  const objectives = [
    { key: 'endurance', label: 'Build Endurance' },
    { key: 'strength', label: 'Increase Strength' },
    { key: 'speed', label: 'Improve Speed' },
    { key: 'coordination', label: 'Enhance Coordination' },
    { key: 'flexibility', label: 'Increase Flexibility' },
    { key: 'teamwork', label: 'Build Teamwork' },
  ];

  // Animation setup
  useEffect(() => {
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // dispatch(fetchWorkouts());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh workouts');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleGenerateWorkout = async () => {
    if (!workoutForm.workoutName.trim()) {
      Alert.alert('Required Field', 'Please enter a workout name');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation process
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockGeneratedWorkout = {
        id: Date.now().toString(),
        name: workoutForm.workoutName,
        sport: workoutForm.sport,
        duration: `${workoutForm.duration} min`,
        difficulty: workoutForm.difficulty,
        exercises: [
          {
            id: '1',
            name: 'Dynamic Warm-up',
            duration: '10 min',
            sets: 1,
            description: 'High knees, butt kicks, leg swings, arm circles',
            category: 'warmup',
          },
          {
            id: '2',
            name: 'Sprint Intervals',
            duration: '20 min',
            sets: 8,
            description: '30-second sprints with 90-second recovery',
            category: 'cardio',
          },
          {
            id: '3',
            name: 'Agility Ladder Drills',
            duration: '15 min',
            sets: 3,
            description: 'In-in-out-out, lateral shuffles, icky shuffle',
            category: 'agility',
          },
          {
            id: '4',
            name: 'Strength Circuit',
            duration: '20 min',
            sets: 3,
            description: 'Push-ups, squats, lunges, planks',
            category: 'strength',
          },
          {
            id: '5',
            name: 'Cool Down Stretch',
            duration: '10 min',
            sets: 1,
            description: 'Static stretching and relaxation',
            category: 'cooldown',
          },
        ],
        objectives: workoutForm.objectives,
        equipment: workoutForm.equipment,
        isAIGenerated: true,
        generatedAt: new Date().toISOString(),
      };

      setGeneratedWorkout(mockGeneratedWorkout);
      setCurrentStep(3);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate workout. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkout = () => {
    Alert.alert(
      'Workout Saved! 🎉',
      `"${generatedWorkout.name}" has been added to your workout library.`,
      [
        { text: 'View Library', onPress: () => navigation.navigate('WorkoutLibrary') },
        { text: 'Create Another', onPress: resetGenerator },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  const resetGenerator = () => {
    setCurrentStep(1);
    setGeneratedWorkout(null);
    setWorkoutForm({
      workoutName: '',
      sport: 'football',
      focusArea: 'strength',
      duration: 60,
      difficulty: 'intermediate',
      playerCount: 15,
      ageGroup: 'adult',
      equipment: [],
      objectives: [],
      customObjectives: '',
      weatherConditions: 'indoor',
      injuryPrevention: false,
      periodization: 'general',
    });
  };

  const updateFormField = (field, value) => {
    setWorkoutForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setWorkoutForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const renderWorkoutCard = ({ item: workout, index }) => {
    const difficultyColors = {
      beginner: COLORS.success,
      intermediate: '#FF9800',
      advanced: COLORS.error,
    };

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          marginBottom: SPACING.md,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('WorkoutDetails', { workoutId: workout.id })}
          activeOpacity={0.8}
        >
          <Card style={{
            marginHorizontal: SPACING.sm,
            elevation: 4,
            borderRadius: 12,
          }}>
            <LinearGradient
              colors={workout.isAIGenerated ? ['#667eea', '#764ba2'] : ['#4CAF50', '#45a049']}
              style={{
                height: 80,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                padding: SPACING.md,
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.h4, { color: 'white', marginBottom: 4 }]}>
                    {workout.name}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
                    {workout.duration} • {workout.exercises} exercises
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {workout.isAIGenerated && (
                    <Icon name="auto-awesome" size={20} color="white" />
                  )}
                </View>
              </View>
            </LinearGradient>

            <Card.Content style={{ padding: SPACING.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
                <Chip
                  mode="flat"
                  style={{
                    backgroundColor: difficultyColors[workout.difficulty],
                    height: 28,
                  }}
                  textStyle={{ color: 'white', fontSize: 12 }}
                >
                  {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                </Chip>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="star" size={16} color="#FFD700" />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4, marginRight: SPACING.md }]}>
                    {workout.rating}
                  </Text>
                  <Icon name="group" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: 4 }]}>
                    {workout.usageCount}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm }}>
                {workout.tags.map((tag, tagIndex) => (
                  <Chip
                    key={tagIndex}
                    mode="outlined"
                    compact
                    style={{
                      marginRight: SPACING.xs,
                      marginBottom: SPACING.xs,
                      height: 24,
                    }}
                    textStyle={{ fontSize: 10 }}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>

              <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                Created: {workout.created}
              </Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderGeneratorStep1 = () => (
    <ScrollView style={{ flex: 1 }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
        Basic Information
      </Text>

      <Card style={{ marginBottom: SPACING.md }}>
        <Card.Content>
          <TextInput
            label="Workout Name *"
            value={workoutForm.workoutName}
            onChangeText={(value) => updateFormField('workoutName', value)}
            mode="outlined"
            style={{ marginBottom: SPACING.md }}
            placeholder="e.g., Pre-Season Conditioning"
          />

          <Text style={[TEXT_STYLES.subtitle1, { marginBottom: SPACING.sm }]}>
            Sport
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
            {sports.map((sport) => (
              <Chip
                key={sport.key}
                mode={workoutForm.sport === sport.key ? 'flat' : 'outlined'}
                selected={workoutForm.sport === sport.key}
                onPress={() => updateFormField('sport', sport.key)}
                icon={sport.icon}
                style={{
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.sm,
                  backgroundColor: workoutForm.sport === sport.key ? COLORS.primary : 'transparent',
                }}
                textStyle={{
                  color: workoutForm.sport === sport.key ? 'white' : COLORS.textPrimary,
                }}
              >
                {sport.label}
              </Chip>
            ))}
          </View>

          <Text style={[TEXT_STYLES.subtitle1, { marginBottom: SPACING.sm }]}>
            Primary Focus
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
            {focusAreas.map((focus) => (
              <Chip
                key={focus.key}
                mode={workoutForm.focusArea === focus.key ? 'flat' : 'outlined'}
                selected={workoutForm.focusArea === focus.key}
                onPress={() => updateFormField('focusArea', focus.key)}
                icon={focus.icon}
                style={{
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.sm,
                  backgroundColor: workoutForm.focusArea === focus.key ? focus.color : 'transparent',
                }}
                textStyle={{
                  color: workoutForm.focusArea === focus.key ? 'white' : COLORS.textPrimary,
                }}
              >
                {focus.label}
              </Chip>
            ))}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md }}>
            <View style={{ flex: 0.48 }}>
              <TextInput
                label="Duration (minutes)"
                value={workoutForm.duration.toString()}
                onChangeText={(value) => updateFormField('duration', parseInt(value) || 0)}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 0.48 }}>
              <TextInput
                label="Player Count"
                value={workoutForm.playerCount.toString()}
                onChangeText={(value) => updateFormField('playerCount', parseInt(value) || 0)}
                mode="outlined"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={[TEXT_STYLES.subtitle1, { marginBottom: SPACING.sm }]}>
            Difficulty Level
          </Text>
          <RadioButton.Group
            onValueChange={(value) => updateFormField('difficulty', value)}
            value={workoutForm.difficulty}
          >
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <View key={level} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                <RadioButton value={level} />
                <Text style={TEXT_STYLES.body1}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </View>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderGeneratorStep2 = () => (
    <ScrollView style={{ flex: 1 }}>
      <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
        Advanced Options
      </Text>

      <Card style={{ marginBottom: SPACING.md }}>
        <Card.Content>
          <Text style={[TEXT_STYLES.subtitle1, { marginBottom: SPACING.sm }]}>
            Available Equipment
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.md }}>
            {equipmentOptions.map((equipment) => (
              <Chip
                key={equipment.key}
                mode={workoutForm.equipment.includes(equipment.key) ? 'flat' : 'outlined'}
                selected={workoutForm.equipment.includes(equipment.key)}
                onPress={() => toggleArrayField('equipment', equipment.key)}
                icon={equipment.icon}
                style={{
                  marginRight: SPACING.sm,
                  marginBottom: SPACING.sm,
                  backgroundColor: workoutForm.equipment.includes(equipment.key) ? COLORS.primary : 'transparent',
                }}
                textStyle={{
                  color: workoutForm.equipment.includes(equipment.key) ? 'white' : COLORS.textPrimary,
                }}
              >
                {equipment.label}
              </Chip>
            ))}
          </View>

          <Text style={[TEXT_STYLES.subtitle1, { marginBottom: SPACING.sm }]}>
            Training Objectives
          </Text>
          {objectives.map((objective) => (
            <View key={objective.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
              <Checkbox
                status={workoutForm.objectives.includes(objective.key) ? 'checked' : 'unchecked'}
                onPress={() => toggleArrayField('objectives', objective.key)}
              />
              <Text style={TEXT_STYLES.body1}>
                {objective.label}
              </Text>
            </View>
          ))}

          <TextInput
            label="Custom Objectives (Optional)"
            value={workoutForm.customObjectives}
            onChangeText={(value) => updateFormField('customObjectives', value)}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={{ marginTop: SPACING.md, marginBottom: SPACING.md }}
            placeholder="Any specific goals or requirements..."
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md }}>
            <Text style={TEXT_STYLES.body1}>
              Include Injury Prevention
            </Text>
            <Switch
              value={workoutForm.injuryPrevention}
              onValueChange={(value) => updateFormField('injuryPrevention', value)}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderGeneratorStep3 = () => {
    if (!generatedWorkout) return null;

    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
          <Icon name="auto-awesome" size={64} color={COLORS.primary} />
          <Text style={[TEXT_STYLES.h2, { marginTop: SPACING.md, textAlign: 'center' }]}>
            Workout Generated! 🎉
          </Text>
          <Text style={[TEXT_STYLES.body1, { textAlign: 'center', color: COLORS.textSecondary }]}>
            Here's your personalized training session
          </Text>
        </View>

        <Card style={{ marginBottom: SPACING.md }}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={{
              padding: SPACING.md,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <Text style={[TEXT_STYLES.h3, { color: 'white', marginBottom: SPACING.xs }]}>
              {generatedWorkout.name}
            </Text>
            <Text style={[TEXT_STYLES.body2, { color: 'rgba(255,255,255,0.8)' }]}>
              {generatedWorkout.duration} • {generatedWorkout.exercises.length} exercises
            </Text>
          </LinearGradient>
          <Card.Content>
            {generatedWorkout.exercises.map((exercise, index) => (
              <View key={exercise.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.sm,
                borderBottomWidth: index < generatedWorkout.exercises.length - 1 ? 1 : 0,
                borderBottomColor: '#f0f0f0',
              }}>
                <Surface style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: COLORS.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.md,
                }}>
                  <Text style={[TEXT_STYLES.body1, { color: 'white', fontWeight: 'bold' }]}>
                    {index + 1}
                  </Text>
                </Surface>
                <View style={{ flex: 1 }}>
                  <Text style={[TEXT_STYLES.subtitle1, { marginBottom: 2 }]}>
                    {exercise.name}
                  </Text>
                  <Text style={[TEXT_STYLES.body2, { color: COLORS.textSecondary, marginBottom: 2 }]}>
                    {exercise.duration} • {exercise.sets} sets
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    {exercise.description}
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl }}>
          <Button
            mode="outlined"
            onPress={resetGenerator}
            style={{ flex: 0.48 }}
            icon="refresh"
          >
            Generate New
          </Button>
          <Button
            mode="contained"
            onPress={handleSaveWorkout}
            style={{ flex: 0.48 }}
            icon="save"
          >
            Save Workout
          </Button>
        </View>
      </ScrollView>
    );
  };

  const renderGeneratorModal = () => (
    <Portal>
      <Modal
        visible={showGeneratorModal}
        onDismiss={() => setShowGeneratorModal(false)}
        contentContainerStyle={{
          backgroundColor: 'white',
          margin: SPACING.md,
          borderRadius: 16,
          height: screenHeight * 0.9,
        }}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={{
            padding: SPACING.md,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              AI Workout Generator
            </Text>
            <IconButton
              icon="close"
              iconColor="white"
              size={24}
              onPress={() => setShowGeneratorModal(false)}
            />
          </View>
          
          {/* Progress Indicator */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md }}>
            {[1, 2, 3].map((step) => (
              <View
                key={step}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: currentStep >= step ? 'white' : 'rgba(255,255,255,0.3)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginHorizontal: SPACING.xs,
                }}
              >
                <Text style={{
                  color: currentStep >= step ? COLORS.primary : 'white',
                  fontWeight: 'bold',
                }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={{ flex: 1, padding: SPACING.md }}>
            {currentStep === 1 && renderGeneratorStep1()}
            {currentStep === 2 && renderGeneratorStep2()}
            {currentStep === 3 && renderGeneratorStep3()}

            {/* Navigation Buttons */}
            {currentStep < 3 && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.md }}>
                <Button
                  mode="outlined"
                  onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setShowGeneratorModal(false)}
                  style={{ flex: 0.48 }}
                >
                  {currentStep > 1 ? 'Previous' : 'Cancel'}
                </Button>
                <Button
                  mode="contained"
                  onPress={() => currentStep === 2 ? handleGenerateWorkout() : setCurrentStep(currentStep + 1)}
                  style={{ flex: 0.48 }}
                  loading={isGenerating}
                  disabled={isGenerating}
                >
                  {currentStep === 2 ? 'Generate' : 'Next'}
                </Button>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={{
          paddingTop: StatusBar.currentHeight + SPACING.md,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.md,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md }}>
          <Text style={[TEXT_STYLES.h2, { color: 'white' }]}>
            Workout Generator ⚡
          </Text>
          <IconButton
            icon="help-outline"
            iconColor="white"
            size={24}
            onPress={() => Alert.alert('Feature Coming Soon', 'Tutorial and help guide will be available in the next update! 📚')}
          />
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {recentWorkouts.length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Recent Workouts
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              {recentWorkouts.filter(w => w.isAIGenerated).length}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              AI Generated
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={[TEXT_STYLES.h3, { color: 'white' }]}>
              4.8
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: 'rgba(255,255,255,0.8)' }]}>
              Avg Rating
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={{ padding: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
          <TouchableOpacity
            onPress={() => setShowGeneratorModal(true)}
            style={{ flex: 0.48 }}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={{
                height: 100,
                borderRadius: 12,
                padding: SPACING.md,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="auto-awesome" size={32} color="white" />
              <Text style={[TEXT_STYLES.body1, { color: 'white', fontWeight: 'bold', marginTop: SPACING.xs }]}>
                AI Generator
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowTemplateModal(true)}
            style={{ flex: 0.48 }}
          >
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={{
                height: 100,
                borderRadius: 12,
                padding: SPACING.md,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Icon name="library-books" size={32} color="white" />
              <Text style={[TEXT_STYLES.body1, { color: 'white', fontWeight: 'bold', marginTop: SPACING.xs }]}>
                Templates
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.md }}>
          <Text style={TEXT_STYLES.h3}>
            Recent Workouts
          </Text>
          <Button
            mode="text"
            onPress={() => navigation.navigate('WorkoutLibrary')}
            compact
          >
            View All
          </Button>
        </View>

        <FlatList
          data={recentWorkouts}
          renderItem={renderWorkoutCard}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
              <Icon name="fitness-center" size={64} color={COLORS.textSecondary} />
              <Text style={[TEXT_STYLES.h3, { marginTop: SPACING.md, color: COLORS.textSecondary }]}>
                No workouts yet
              </Text>
              <Text style={[TEXT_STYLES.body2, { marginTop: SPACING.sm, color: COLORS.textSecondary, textAlign: 'center' }]}>
                Generate your first AI-powered workout to get started
              </Text>
              <Button
                mode="contained"
                onPress={() => setShowGeneratorModal(true)}
                style={{ marginTop: SPACING.md }}
                icon="auto-awesome"
              >
                Generate Workout
              </Button>
            </View>
          }
        />
      </View>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={{
          position: 'absolute',
          margin: SPACING.md,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.primary,
        }}
        onPress={() => setShowGeneratorModal(true)}
        label="Create"
      />

      {/* Generator Modal */}
      {renderGeneratorModal()}

      {/* Template Modal */}
      <Portal>
        <Modal
          visible={showTemplateModal}
          onDismiss={() => setShowTemplateModal(false)}
          contentContainerStyle={{
            backgroundColor: 'white',
            margin: SPACING.lg,
            borderRadius: 12,
            padding: SPACING.lg,
            maxHeight: screenHeight * 0.7,
          }}
        >
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg, textAlign: 'center' }]}>
            Workout Templates
          </Text>
          
          <ScrollView>
            {focusAreas.map((template) => (
              <TouchableOpacity
                key={template.key}
                onPress={() => {
                  setShowTemplateModal(false);
                  Alert.alert('Feature Coming Soon', `${template.label} templates will be available in the next update! 📋`);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: SPACING.md,
                  backgroundColor: `${template.color}10`,
                  borderRadius: 8,
                  marginBottom: SPACING.sm,
                  borderLeftWidth: 4,
                  borderLeftColor: template.color,
                }}
              >
                <Icon name={template.icon} size={24} color={template.color} />
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text style={[TEXT_STYLES.body1, { fontWeight: 'bold' }]}>
                    {template.label}
                  </Text>
                  <Text style={[TEXT_STYLES.caption, { color: COLORS.textSecondary }]}>
                    Pre-built templates for {template.label.toLowerCase()}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Button
            mode="text"
            onPress={() => setShowTemplateModal(false)}
            style={{ marginTop: SPACING.md }}
          >
            Close
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

export default WorkoutGenerator;