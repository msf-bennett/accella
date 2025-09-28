import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  TextInput,
  Vibration,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/LinearGradient';
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
  Searchbar
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Design System
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent: '#8B5CF6'
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

const TEXT_STYLES = {
  h1: { fontSize: 28, fontWeight: 'bold', color: COLORS.text },
  h2: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  h3: { fontSize: 20, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 16, color: COLORS.text },
  caption: { fontSize: 14, color: COLORS.textSecondary },
  small: { fontSize: 12, color: COLORS.textSecondary }
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AIWorkoutGeneratorScreen = ({ navigation, route }) => {
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Redux state
  const dispatch = useDispatch();
  const { user, workouts, isLoading } = useSelector(state => ({
  user: state.auth?.user || state.user?.user || null,
  workouts: state.workouts.items,
  isLoading: state.workouts.loading
  }));

  // Component state
  const [currentStep, setCurrentStep] = useState(1);
  const [generationMethod, setGenerationMethod] = useState('guided');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  // Workout parameters
  const [workoutParams, setWorkoutParams] = useState({
    sport: 'football',
    level: 'intermediate',
    duration: 60,
    focus: 'endurance',
    players: 15,
    equipment: ['cones', 'balls'],
    objective: 'match-preparation',
    ageGroup: 'youth',
    intensity: 'moderate',
    venue: 'outdoor-field'
  });

  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');

  // Data
  const sports = [
    { id: 'football', name: 'Football', icon: 'sports-soccer', emoji: '⚽' },
    { id: 'basketball', name: 'Basketball', icon: 'sports-basketball', emoji: '🏀' },
    { id: 'tennis', name: 'Tennis', icon: 'sports-tennis', emoji: '🎾' },
    { id: 'volleyball', name: 'Volleyball', icon: 'sports-volleyball', emoji: '🏐' },
    { id: 'swimming', name: 'Swimming', icon: 'pool', emoji: '🏊' },
    { id: 'athletics', name: 'Athletics', icon: 'directions-run', emoji: '🏃' }
  ];

  const focusAreas = [
    { id: 'endurance', name: 'Endurance', color: COLORS.success, icon: 'favorite' },
    { id: 'strength', name: 'Strength', color: COLORS.error, icon: 'fitness-center' },
    { id: 'speed', name: 'Speed', color: COLORS.warning, icon: 'speed' },
    { id: 'agility', name: 'Agility', color: COLORS.accent, icon: 'gesture' },
    { id: 'skill', name: 'Skill Development', color: COLORS.primary, icon: 'school' },
    { id: 'tactical', name: 'Tactical', color: COLORS.secondary, icon: 'psychology' }
  ];

  const workoutTemplates = [
    {
      id: 1,
      name: 'Pre-Season Conditioning',
      sport: 'football',
      duration: 90,
      intensity: 'high',
      rating: 4.8,
      uses: 245,
      color: COLORS.error
    },
    {
      id: 2,
      name: 'Youth Skill Development',
      sport: 'football',
      duration: 60,
      intensity: 'moderate',
      rating: 4.9,
      uses: 189,
      color: COLORS.primary
    },
    {
      id: 3,
      name: 'Match Day Preparation',
      sport: 'football',
      duration: 45,
      intensity: 'low',
      rating: 4.7,
      uses: 156,
      color: COLORS.success
    }
  ];

  const sampleWorkout = {
    title: "Football Endurance & Skill Development 🚀",
    duration: 60,
    intensity: "Moderate",
    equipment: ["Cones", "Balls", "Bibs"],
    phases: [
      {
        id: 1,
        name: "Warm-Up 🔥",
        duration: 10,
        exercises: [
          { name: "Light Jogging", duration: 5, description: "2 laps around the field at 60% pace" },
          { name: "Dynamic Stretching", duration: 5, description: "Leg swings, arm circles, hip rotations" }
        ]
      },
      {
        id: 2,
        name: "Technical Skills ⚽",
        duration: 25,
        exercises: [
          { name: "Ball Control Drill", duration: 10, description: "Individual ball juggling and touches" },
          { name: "Passing Accuracy", duration: 15, description: "Partner passing with increasing distance" }
        ]
      },
      {
        id: 3,
        name: "Conditioning 💪",
        duration: 20,
        exercises: [
          { name: "Sprint Intervals", duration: 12, description: "6 x 30m sprints with 30s rest" },
          { name: "Agility Ladder", duration: 8, description: "Various footwork patterns" }
        ]
      },
      {
        id: 4,
        name: "Cool Down 🧘",
        duration: 5,
        exercises: [
          { name: "Static Stretching", duration: 5, description: "Hold each stretch for 30 seconds" }
        ]
      }
    ]
  };

  // Effects
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
      })
    ]).start();
  }, []);

  // Handlers
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    Vibration.vibrate(50);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleGenerateWorkout = useCallback(async () => {
    try {
      setIsGenerating(true);
      Vibration.vibrate(100);
      
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setGeneratedWorkout(sampleWorkout);
      setIsGenerating(false);
      setCurrentStep(3);
      
      // Success feedback
      Vibration.vibrate([100, 200, 100]);
    } catch (error) {
      setIsGenerating(false);
      Alert.alert(
        'Generation Failed',
        'Unable to generate workout. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  }, []);

  const handleStepChange = useCallback((step) => {
    Vibration.vibrate(50);
    setCurrentStep(step);
  }, []);

  const handleSaveWorkout = useCallback(() => {
    Alert.alert(
      'Feature Coming Soon! 🚧',
      'Workout saving functionality is under development and will be available in the next update.',
      [{ text: 'Got it!', style: 'default' }]
    );
  }, []);

  // Render methods
  const renderStepIndicator = () => (
    <Surface style={styles.stepIndicator} elevation={2}>
      <View style={styles.stepContainer}>
        {[
          { step: 1, title: 'Setup', icon: 'settings' },
          { step: 2, title: 'Generate', icon: 'auto-awesome' },
          { step: 3, title: 'Review', icon: 'preview' }
        ].map(({ step, title, icon }, index) => (
          <React.Fragment key={step}>
            <TouchableOpacity
              style={styles.stepItem}
              onPress={() => handleStepChange(step)}
              disabled={step > currentStep && !generatedWorkout}
            >
              <View style={[
                styles.stepCircle,
                currentStep >= step ? styles.stepActiveCircle : styles.stepInactiveCircle
              ]}>
                <Icon 
                  name={icon} 
                  size={18} 
                  color={currentStep >= step ? COLORS.surface : COLORS.textSecondary} 
                />
              </View>
              <Text style={[
                styles.stepTitle,
                currentStep >= step ? styles.stepActiveTitle : styles.stepInactiveTitle
              ]}>
                {title}
              </Text>
            </TouchableOpacity>
            {index < 2 && (
              <View style={[
                styles.stepConnector,
                currentStep > step ? styles.stepActiveConnector : styles.stepInactiveConnector
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </Surface>
  );

  const renderGenerationMethodCard = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Choose Generation Method 🎯
        </Text>
        <View style={styles.methodGrid}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              generationMethod === 'guided' ? styles.methodCardActive : null
            ]}
            onPress={() => {
              setGenerationMethod('guided');
              Vibration.vibrate(50);
            }}
          >
            <Icon name="tune" size={32} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
            <Text style={TEXT_STYLES.h3}>Guided Setup</Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
              Step-by-step parameter selection
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.methodCard,
              generationMethod === 'prompt' ? styles.methodCardActive : null
            ]}
            onPress={() => {
              setGenerationMethod('prompt');
              Vibration.vibrate(50);
            }}
          >
            <Icon name="psychology" size={32} color={COLORS.accent} style={{ marginBottom: SPACING.sm }} />
            <Text style={TEXT_STYLES.h3}>AI Prompt</Text>
            <Text style={[TEXT_STYLES.caption, { textAlign: 'center', marginTop: SPACING.xs }]}>
              Describe your workout naturally
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  const renderGuidedSetup = () => (
    <>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Basic Parameters 📋
          </Text>
          
          {/* Sport Selection */}
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
            Sport
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
            {sports.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                style={[
                  styles.sportChip,
                  workoutParams.sport === sport.id ? styles.sportChipActive : null
                ]}
                onPress={() => {
                  setWorkoutParams(prev => ({ ...prev, sport: sport.id }));
                  Vibration.vibrate(50);
                }}
              >
                <Text style={{ fontSize: 20, marginBottom: SPACING.xs }}>{sport.emoji}</Text>
                <Text style={[
                  TEXT_STYLES.caption,
                  workoutParams.sport === sport.id ? { color: COLORS.surface } : null
                ]}>
                  {sport.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Duration Slider */}
          <Text style={[TEXT_STYLES.body, { marginBottom: SPACING.sm, fontWeight: '600' }]}>
            Duration: {workoutParams.duration} minutes ⏱️
          </Text>
          <View style={styles.sliderContainer}>
            <Text style={TEXT_STYLES.small}>30min</Text>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderProgress, { 
                width: `${((workoutParams.duration - 30) / 90) * 100}%` 
              }]} />
              <TouchableOpacity style={[styles.sliderThumb, {
                left: `${((workoutParams.duration - 30) / 90) * 100}%`
              }]} />
            </View>
            <Text style={TEXT_STYLES.small}>120min</Text>
          </View>

          {/* Players Count */}
          <Text style={[TEXT_STYLES.body, { marginTop: SPACING.md, marginBottom: SPACING.sm, fontWeight: '600' }]}>
            Players: {workoutParams.players} 👥
          </Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                if (workoutParams.players > 1) {
                  setWorkoutParams(prev => ({ ...prev, players: prev.players - 1 }));
                  Vibration.vibrate(50);
                }
              }}
            >
              <Icon name="remove" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={[TEXT_STYLES.h3, { marginHorizontal: SPACING.md }]}>
              {workoutParams.players}
            </Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                if (workoutParams.players < 30) {
                  setWorkoutParams(prev => ({ ...prev, players: prev.players + 1 }));
                  Vibration.vibrate(50);
                }
              }}
            >
              <Icon name="add" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Focus Areas */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
            Training Focus 🎯
          </Text>
          <View style={styles.focusGrid}>
            {focusAreas.map((focus) => (
              <TouchableOpacity
                key={focus.id}
                style={[
                  styles.focusChip,
                  workoutParams.focus === focus.id ? 
                    { backgroundColor: focus.color } : 
                    { backgroundColor: COLORS.background }
                ]}
                onPress={() => {
                  setWorkoutParams(prev => ({ ...prev, focus: focus.id }));
                  Vibration.vibrate(50);
                }}
              >
                <Icon 
                  name={focus.icon} 
                  size={20} 
                  color={workoutParams.focus === focus.id ? COLORS.surface : focus.color}
                  style={{ marginBottom: SPACING.xs }}
                />
                <Text style={[
                  TEXT_STYLES.caption,
                  { 
                    color: workoutParams.focus === focus.id ? COLORS.surface : COLORS.text,
                    textAlign: 'center',
                    fontWeight: '600'
                  }
                ]}>
                  {focus.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card.Content>
      </Card>
    </>
  );

  const renderPromptSetup = () => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.md }]}>
          Describe Your Workout 💬
        </Text>
        <TextInput
          style={styles.promptInput}
          value={customPrompt}
          onChangeText={setCustomPrompt}
          placeholder="Example: Create a 60-minute football training session for 15 intermediate youth players focusing on passing accuracy and endurance..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <View style={styles.promptFooter}>
          <Text style={TEXT_STYLES.small}>
            Be specific about duration, focus areas, equipment, and objectives
          </Text>
          <Text style={[
            TEXT_STYLES.small,
            { color: customPrompt.length > 100 ? COLORS.success : COLORS.textSecondary }
          ]}>
            {customPrompt.length}/500
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderTemplates = () => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.templateHeader}>
          <Text style={TEXT_STYLES.h3}>Popular Templates ⭐</Text>
          <TouchableOpacity onPress={() => setShowTemplates(true)}>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.primary, fontWeight: '600' }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {workoutTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate?.id === template.id ? styles.templateCardActive : null
              ]}
              onPress={() => {
                setSelectedTemplate(template);
                Vibration.vibrate(50);
              }}
            >
              <View style={[styles.templateIcon, { backgroundColor: template.color }]}>
                <Icon name="fitness-center" size={24} color={COLORS.surface} />
              </View>
              <Text style={[TEXT_STYLES.body, { fontWeight: '600', marginBottom: SPACING.xs }]}>
                {template.name}
              </Text>
              <View style={styles.templateMeta}>
                <Icon name="schedule" size={14} color={COLORS.textSecondary} />
                <Text style={[TEXT_STYLES.small, { marginLeft: SPACING.xs }]}>
                  {template.duration}min
                </Text>
              </View>
              <View style={[styles.templateMeta, { marginTop: SPACING.xs }]}>
                <Icon name="star" size={14} color={COLORS.warning} />
                <Text style={[TEXT_STYLES.small, { marginLeft: SPACING.xs }]}>
                  {template.rating} • {template.uses} uses
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card.Content>
    </Card>
  );

  const renderSetupStep = () => (
    <Animated.View 
      style={[
        styles.stepContent,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {renderGenerationMethodCard()}
      
      {generationMethod === 'guided' ? renderGuidedSetup() : renderPromptSetup()}
      
      {renderTemplates()}

      <View style={styles.stepActions}>
        <Button
          mode="contained"
          onPress={() => handleStepChange(2)}
          style={[styles.primaryButton, { flex: 1 }]}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="arrow-right"
        >
          Continue to Generate
        </Button>
      </View>
    </Animated.View>
  );

  const renderGenerateStep = () => (
    <Animated.View style={[styles.stepContent, styles.centerContent]}>
      <Surface style={[styles.generationCard, { elevation: 4 }]}>
        {!isGenerating && !generatedWorkout ? (
          <>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.generationIcon}
            >
              <Icon name="psychology" size={40} color={COLORS.surface} />
            </LinearGradient>
            <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.md }]}>
              Ready to Generate! 🚀
            </Text>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.textSecondary }]}>
              AI will create a personalized training session based on your parameters
            </Text>
            
            {/* Parameters Summary */}
            <Surface style={styles.paramsSummary} elevation={1}>
              <View style={styles.paramsGrid}>
                <View style={styles.paramItem}>
                  <Text style={TEXT_STYLES.small}>Sport</Text>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600', textTransform: 'capitalize' }]}>
                    {workoutParams.sport}
                  </Text>
                </View>
                <View style={styles.paramItem}>
                  <Text style={TEXT_STYLES.small}>Duration</Text>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                    {workoutParams.duration} min
                  </Text>
                </View>
                <View style={styles.paramItem}>
                  <Text style={TEXT_STYLES.small}>Players</Text>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                    {workoutParams.players}
                  </Text>
                </View>
                <View style={styles.paramItem}>
                  <Text style={TEXT_STYLES.small}>Focus</Text>
                  <Text style={[TEXT_STYLES.body, { fontWeight: '600', textTransform: 'capitalize' }]}>
                    {workoutParams.focus}
                  </Text>
                </View>
              </View>
            </Surface>

            <Button
              mode="contained"
              onPress={handleGenerateWorkout}
              style={styles.generateButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="auto-awesome"
            >
              Generate Workout
            </Button>
          </>
        ) : isGenerating ? (
          <>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={[styles.generationIcon, styles.pulseAnimation]}
            >
              <Icon name="psychology" size={40} color={COLORS.surface} />
            </LinearGradient>
            <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.md }]}>
              Generating Workout... 🧠
            </Text>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.textSecondary }]}>
              AI is analyzing your parameters and creating the perfect training session
            </Text>
            <ProgressBar 
              progress={0.7} 
              color={COLORS.primary}
              style={styles.progressBar}
            />
            <Text style={[TEXT_STYLES.small, { textAlign: 'center', marginTop: SPACING.sm }]}>
              This may take a few moments...
            </Text>
          </>
        ) : (
          <>
            <View style={[styles.generationIcon, { backgroundColor: COLORS.success }]}>
              <Icon name="check" size={40} color={COLORS.surface} />
            </View>
            <Text style={[TEXT_STYLES.h2, { textAlign: 'center', marginBottom: SPACING.md }]}>
              Workout Generated! 🎉
            </Text>
            <Text style={[TEXT_STYLES.body, { textAlign: 'center', marginBottom: SPACING.lg, color: COLORS.textSecondary }]}>
              Your personalized training session is ready for review
            </Text>
            <Button
              mode="contained"
              onPress={() => handleStepChange(3)}
              style={styles.successButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="visibility"
            >
              Review Workout
            </Button>
          </>
        )}
      </Surface>
    </Animated.View>
  );

  const renderWorkoutPhase = (phase, index) => (
    <Card key={phase.id} style={styles.phaseCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.phaseHeader}
      >
        <View style={styles.phaseHeaderContent}>
          <View style={styles.phaseNumber}>
            <Text style={[TEXT_STYLES.body, { color: COLORS.surface, fontWeight: 'bold' }]}>
              {index + 1}
            </Text>
          </View>
          <View style={styles.phaseInfo}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.surface }]}>
              {phase.name}
            </Text>
            <Text style={[TEXT_STYLES.caption, { color: COLORS.surface, opacity: 0.9 }]}>
              {phase.duration} minutes
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      <Card.Content style={styles.phaseContent}>
        {phase.exercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseItem}>
            <View style={styles.exerciseBadge}>
              <Text style={[TEXT_STYLES.small, { color: COLORS.primary, fontWeight: 'bold' }]}>
                {exerciseIndex + 1}
              </Text>
            </View>
            <View style={styles.exerciseContent}>
              <View style={styles.exerciseHeader}>
                <Text style={[TEXT_STYLES.body, { fontWeight: '600', flex: 1 }]}>
                  {exercise.name}
                </Text>
                <Chip compact>{exercise.duration} min</Chip>
              </View>
              <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.xs }]}>
                {exercise.description}
              </Text>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );

  const renderReviewStep = () => (
    <Animated.View style={styles.stepContent}>
      {/* Workout Header */}
      <Card style={styles.workoutHeader}>
        <Card.Content>
          <View style={styles.workoutTitleRow}>
            <View style={styles.workoutTitleContent}>
              <Text style={[TEXT_STYLES.h2, { marginBottom: SPACING.xs }]}>
                {generatedWorkout?.title}
              </Text>
              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Icon name="schedule" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {generatedWorkout?.duration} min
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="trending-up" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {generatedWorkout?.intensity}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="group" size={16} color={COLORS.textSecondary} />
                  <Text style={[TEXT_STYLES.caption, { marginLeft: SPACING.xs }]}>
                    {workoutParams.players} players
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.workoutActions}>
              <IconButton icon="edit" size={20} onPress={() => Alert.alert('Feature Coming Soon!')} />
              <IconButton icon="share" size={20} onPress={() => Alert.alert('Feature Coming Soon!')} />
            </View>
          </View>

          <View style={styles.equipmentRow}>
            <Text style={[TEXT_STYLES.caption, { marginRight: SPACING.sm }]}>
              Equipment needed:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {generatedWorkout?.equipment.map((item, index) => (
                <Chip
                  key={index}
                  compact
                  style={[styles.equipmentChip, { marginRight: SPACING.xs }]}
                >
                  {item}
                </Chip>
              ))}
            </ScrollView>
          </View>
        </Card.Content>
      </Card>

      {/* Workout Phases */}
      {generatedWorkout?.phases.map((phase, index) => renderWorkoutPhase(phase, index))}

      {/* Action Buttons */}
      <View style={styles.reviewActions}>
        <Button
          mode="outlined"
          onPress={() => handleStepChange(1)}
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.secondaryButtonLabel}
          icon="arrow-left"
        >
          Back to Edit
        </Button>
        <View style={styles.reviewActionsRight}>
          <Button
            mode="contained"
            onPress={handleSaveWorkout}
            style={[styles.saveButton, { marginRight: SPACING.sm }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="save"
          >
            Save Draft
          </Button>
          <Button
            mode="contained"
            onPress={() => {
              Alert.alert(
                'Schedule Workout 📅',
                'Would you like to schedule this workout for your team?',
                [
                  { text: 'Later', style: 'cancel' },
                  { text: 'Schedule Now', onPress: handleSaveWorkout }
                ]
              );
            }}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="event"
          >
            Schedule
          </Button>
        </View>
      </View>
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderSetupStep();
      case 2:
        return renderGenerateStep();
      case 3:
        return renderReviewStep();
      default:
        return renderSetupStep();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="transparent" 
        translucent 
        barStyle="light-content" 
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerSafe}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={24} color={COLORS.surface} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[TEXT_STYLES.h2, { color: COLORS.surface }]}>
                AI Workout Generator
              </Text>
              <Text style={[TEXT_STYLES.caption, { color: COLORS.surface, opacity: 0.9 }]}>
                Create personalized training sessions ✨
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Templates Library 📚',
                  'Browse our collection of pre-made workout templates.',
                  [{ text: 'Coming Soon!', style: 'default' }]
                );
              }}
              style={styles.headerAction}
            >
              <Icon name="library-books" size={24} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.surface}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStepIndicator()}
        {renderCurrentStep()}
      </ScrollView>

      {/* Templates Modal */}
      <Portal>
        <Modal
          visible={showTemplates}
          onDismiss={() => setShowTemplates(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={8}>
            <View style={styles.modalHeader}>
              <Text style={TEXT_STYLES.h3}>Workout Templates</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowTemplates(false)}
              />
            </View>
            <Searchbar
              placeholder="Search templates..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />
            <ScrollView style={styles.modalList}>
              {workoutTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateListItem}
                  onPress={() => {
                    setSelectedTemplate(template);
                    setShowTemplates(false);
                    Vibration.vibrate(50);
                  }}
                >
                  <View style={[styles.templateListIcon, { backgroundColor: template.color }]}>
                    <Icon name="fitness-center" size={20} color={COLORS.surface} />
                  </View>
                  <View style={styles.templateListContent}>
                    <Text style={[TEXT_STYLES.body, { fontWeight: '600' }]}>
                      {template.name}
                    </Text>
                    <View style={styles.templateListMeta}>
                      <Text style={TEXT_STYLES.small}>
                        {template.duration}min • {template.intensity} • ⭐ {template.rating}
                      </Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>

      {/* Floating Action Button */}
      {currentStep === 3 && (
        <FAB
          icon="play-arrow"
          style={[styles.fab, { backgroundColor: COLORS.success }]}
          onPress={() => {
            Alert.alert(
              'Start Workout! 🚀',
              'Ready to begin this training session with your team?',
              [
                { text: 'Not Yet', style: 'cancel' },
                { text: 'Start Now!', onPress: handleSaveWorkout }
              ]
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: SPACING.md,
  },
  headerSafe: {
    paddingTop: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerAction: {
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  // Step Indicator
  stepIndicator: {
    marginBottom: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  stepActiveCircle: {
    backgroundColor: COLORS.primary,
  },
  stepInactiveCircle: {
    backgroundColor: COLORS.border,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepActiveTitle: {
    color: COLORS.primary,
  },
  stepInactiveTitle: {
    color: COLORS.textSecondary,
  },
  stepConnector: {
    height: 2,
    width: 40,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  stepActiveConnector: {
    backgroundColor: COLORS.primary,
  },
  stepInactiveConnector: {
    backgroundColor: COLORS.border,
  },

  // Content
  stepContent: {
    gap: SPACING.md,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  card: {
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },

  // Method Selection
  methodGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  methodCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  methodCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },

  // Sport Selection
  sportChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
    alignItems: 'center',
    minWidth: 80,
  },
  sportChipActive: {
    backgroundColor: COLORS.primary,
  },

  // Slider
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginHorizontal: SPACING.md,
    position: 'relative',
  },
  sliderProgress: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginLeft: -8,
  },

  // Counter
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  // Focus Areas
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  focusChip: {
    width: '48%',
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },

  // Prompt Input
  promptInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: COLORS.surface,
  },
  promptFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },

  // Templates
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  templateCard: {
    width: 160,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Generation
  generationCard: {
    padding: SPACING.xl,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  generationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  pulseAnimation: {
    // Note: In actual implementation, you would use Animated.loop for pulsing
  },
  paramsSummary: {
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  paramsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  paramItem: {
    width: '48%',
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },

  // Workout Review
  workoutHeader: {
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 3,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  workoutTitleContent: {
    flex: 1,
  },
  workoutMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutActions: {
    flexDirection: 'row',
  },
  equipmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentChip: {
    height: 28,
  },

  // Phases
  phaseCard: {
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
    overflow: 'hidden',
  },
  phaseHeader: {
    padding: SPACING.md,
  },
  phaseHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  phaseInfo: {
    flex: 1,
  },
  phaseContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  exerciseBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Actions
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.lg,
  },
  reviewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reviewActionsRight: {
    flexDirection: 'row',
  },

  // Buttons
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  secondaryButton: {
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: COLORS.textSecondary,
    borderRadius: 8,
  },
  successButton: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.surface,
  },
  secondaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Modal
  modalContainer: {
    margin: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBar: {
    margin: SPACING.md,
    elevation: 0,
    backgroundColor: COLORS.background,
  },
  modalList: {
    maxHeight: 300,
  },
  templateListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  templateListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  templateListContent: {
    flex: 1,
  },
  templateListMeta: {
    marginTop: SPACING.xs,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.xl,
    elevation: 8,
  },
});

export default AIWorkoutGeneratorScreen;