import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
  Animated,
  VibrationIOS,
  Vibration,
  Platform
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
  Searchbar,
  Switch,
  RadioButton,
  Divider,
  TextInput
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '../../../components/shared/BlurView';
import { useSelector, useDispatch } from 'react-redux';

// Import your constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e1e5e9'
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
  caption: { fontSize: 14, color: COLORS.textSecondary }
};

const { width, height } = Dimensions.get('window');

const PersonalizedWorkout = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);
  const [filterIntensity, setFilterIntensity] = useState('all');
  const [filterDuration, setFilterDuration] = useState('all');
  const [activeTab, setActiveTab] = useState('templates');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Workout creation form state
  const [workoutForm, setWorkoutForm] = useState({
    playerName: '',
    sport: 'Basketball',
    goals: [],
    duration: 60,
    intensity: 'moderate',
    equipment: [],
    injuries: '',
    preferences: ''
  });

  // Mock data - replace with Redux selectors
  const [workoutTemplates] = useState([
    {
      id: 1,
      name: 'Basketball Shooting Focus',
      sport: 'Basketball',
      duration: 45,
      intensity: 'moderate',
      exercises: 8,
      difficulty: 'Intermediate',
      focus: ['shooting', 'accuracy', 'form'],
      description: 'Improve shooting accuracy and form with targeted drills',
      color: '#FF6B6B',
      completions: 127,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Tennis Agility Training',
      sport: 'Tennis',
      duration: 60,
      intensity: 'high',
      exercises: 12,
      difficulty: 'Advanced',
      focus: ['agility', 'speed', 'footwork'],
      description: 'High-intensity agility and footwork training',
      color: '#4ECDC4',
      completions: 89,
      rating: 4.6
    },
    {
      id: 3,
      name: 'Soccer Endurance Build',
      sport: 'Soccer',
      duration: 75,
      intensity: 'moderate',
      exercises: 10,
      difficulty: 'Intermediate',
      focus: ['endurance', 'cardio', 'stamina'],
      description: 'Build cardiovascular endurance for match performance',
      color: '#45B7D1',
      completions: 156,
      rating: 4.9
    }
  ]);

  const [recentWorkouts] = useState([
    {
      id: 1,
      playerName: 'Alex Johnson',
      workoutName: 'Custom Shooting Drill',
      date: '2024-08-17',
      duration: 45,
      completion: 85,
      intensity: 'moderate',
      exercises: [
        { name: 'Free Throws', sets: 3, reps: 10, completed: true },
        { name: 'Three Pointers', sets: 4, reps: 8, completed: true },
        { name: 'Layup Drill', sets: 2, reps: 15, completed: false }
      ],
      feedback: 'Good session, need to work on consistency',
      avatar: 'AJ'
    },
    {
      id: 2,
      playerName: 'Sarah Chen',
      workoutName: 'Tennis Serve Practice',
      date: '2024-08-16',
      duration: 60,
      completion: 100,
      intensity: 'high',
      exercises: [
        { name: 'Serve Power', sets: 5, reps: 12, completed: true },
        { name: 'Serve Accuracy', sets: 4, reps: 10, completed: true },
        { name: 'Return Practice', sets: 3, reps: 20, completed: true }
      ],
      feedback: 'Excellent progress on serve accuracy',
      avatar: 'SC'
    }
  ]);

  const [aiSuggestions] = useState([
    {
      id: 1,
      playerName: 'Alex Johnson',
      suggestion: 'Focus on core strength training',
      reason: 'Analysis shows improvement potential in stability',
      priority: 'high',
      duration: '20 min',
      type: 'strength'
    },
    {
      id: 2,
      playerName: 'Mike Torres',
      suggestion: 'Add flexibility exercises',
      reason: 'Recent form analysis indicates tight hip flexors',
      priority: 'medium',
      duration: '15 min',
      type: 'flexibility'
    },
    {
      id: 3,
      playerName: 'Sarah Chen',
      suggestion: 'Reduce training intensity',
      reason: 'Performance data suggests overtraining risk',
      priority: 'high',
      duration: 'Next 3 days',
      type: 'recovery'
    }
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const generatePersonalizedWorkout = (player = null, template = null) => {
    setSelectedPlayer(player);
    setIsGenerating(true);
    
    // Haptic feedback
    if (Platform.OS === 'ios') {
      VibrationIOS.impactFeedback('medium');
    } else {
      Vibration.vibrate(50);
    }
    
    // Simulate AI workout generation
    setTimeout(() => {
      const mockWorkout = {
        id: Date.now(),
        playerName: player?.name || workoutForm.playerName || 'Custom Player',
        title: template?.name || 'AI Generated Workout',
        sport: template?.sport || workoutForm.sport,
        duration: template?.duration || workoutForm.duration,
        intensity: template?.intensity || workoutForm.intensity,
        difficulty: template?.difficulty || 'Intermediate',
        warmup: [
          { exercise: 'Dynamic Stretching', duration: '5 min', description: 'Full body dynamic movements' },
          { exercise: 'Light Jogging', duration: '3 min', description: 'Increase heart rate gradually' },
          { exercise: 'Arm Circles', duration: '2 min', description: 'Prepare shoulder joints' }
        ],
        mainWorkout: [
          {
            exercise: 'Shooting Drills',
            sets: 4,
            reps: 12,
            rest: '60s',
            description: 'Focus on proper form and follow-through',
            videoUrl: 'https://example.com/video1',
            tips: ['Keep elbow under the ball', 'Follow through with wrist snap']
          },
          {
            exercise: 'Dribbling Circuit',
            sets: 3,
            reps: 15,
            rest: '45s',
            description: 'Multi-directional dribbling patterns',
            videoUrl: 'https://example.com/video2',
            tips: ['Keep head up', 'Use fingertips for control']
          },
          {
            exercise: 'Defensive Slides',
            sets: 3,
            reps: 20,
            rest: '30s',
            description: 'Lateral movement and stance work',
            videoUrl: 'https://example.com/video3',
            tips: ['Stay low', 'Quick feet movement']
          }
        ],
        cooldown: [
          { exercise: 'Static Stretching', duration: '8 min', description: 'Hold each stretch for 30 seconds' },
          { exercise: 'Breathing Exercise', duration: '2 min', description: 'Deep breathing for recovery' }
        ],
        aiInsights: {
          focusAreas: ['Shooting Accuracy', 'Ball Handling', 'Defensive Positioning'],
          adaptations: 'Workout intensity adjusted based on recent performance data',
          nextSession: 'Increase shooting volume by 10% if completion rate >90%',
          recoveryTips: 'Ensure 48 hours rest before next high-intensity session'
        },
        estimatedCalories: 320,
        targetHeartRate: '140-160 BPM'
      };
      
      setGeneratedWorkout(mockWorkout);
      setIsGenerating(false);
      setShowWorkoutModal(true);
      setShowCreateModal(false);
    }, 3000);
  };

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'low': return COLORS.success;
      case 'moderate': return COLORS.warning;
      case 'high': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return COLORS.error;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'strength': return 'fitness-center';
      case 'flexibility': return 'self-improvement';
      case 'recovery': return 'spa';
      case 'cardio': return 'directions-run';
      default: return 'sports';
    }
  };

  const filteredTemplates = workoutTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIntensity = filterIntensity === 'all' || template.intensity === filterIntensity;
    const matchesDuration = filterDuration === 'all' || 
      (filterDuration === 'short' && template.duration <= 30) ||
      (filterDuration === 'medium' && template.duration > 30 && template.duration <= 60) ||
      (filterDuration === 'long' && template.duration > 60);
    return matchesSearch && matchesIntensity && matchesDuration;
  });

  const renderTemplateCard = (template) => (
    <Card key={template.id} style={styles.templateCard}>
      <TouchableOpacity onPress={() => generatePersonalizedWorkout(null, template)}>
        <LinearGradient
          colors={[template.color, template.color + '80']}
          style={styles.templateGradient}
        >
          <View style={styles.templateHeader}>
            <View style={styles.templateInfo}>
              <Text style={styles.templateTitle}>{template.name}</Text>
              <Text style={styles.templateSport}>{template.sport}</Text>
            </View>
            <View style={styles.templateRating}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{template.rating}</Text>
            </View>
          </View>
          
          <View style={styles.templateMetrics}>
            <View style={styles.metricItem}>
              <Icon name="schedule" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metricText}>{template.duration} min</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="fitness-center" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metricText}>{template.exercises} exercises</Text>
            </View>
            <View style={styles.metricItem}>
              <Icon name="trending-up" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.metricText}>{template.difficulty}</Text>
            </View>
          </View>
          
          <Text style={styles.templateDescription}>{template.description}</Text>
          
          <View style={styles.focusChips}>
            {template.focus.slice(0, 3).map((focus, index) => (
              <View key={index} style={styles.focusChip}>
                <Text style={styles.focusText}>{focus}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.templateFooter}>
            <Text style={styles.completionText}>
              {template.completions} completions
            </Text>
            <Chip
              compact
              style={[styles.intensityChip, { backgroundColor: getIntensityColor(template.intensity) + '40' }]}
              textStyle={{ color: 'white', fontSize: 10 }}
            >
              {template.intensity}
            </Chip>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Card>
  );

  const renderRecentWorkout = (workout) => (
    <Card key={workout.id} style={styles.recentWorkoutCard}>
      <Card.Content>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutPlayerInfo}>
            <Avatar.Text 
              size={40} 
              label={workout.avatar} 
              style={{ backgroundColor: COLORS.primary }}
            />
            <View style={styles.workoutDetails}>
              <Text style={TEXT_STYLES.body}>{workout.playerName}</Text>
              <Text style={TEXT_STYLES.caption}>{workout.workoutName}</Text>
              <Text style={TEXT_STYLES.caption}>{workout.date}</Text>
            </View>
          </View>
          <View style={styles.workoutMetrics}>
            <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
              {workout.completion}%
            </Text>
            <Text style={TEXT_STYLES.caption}>Complete</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <ProgressBar 
            progress={workout.completion / 100} 
            color={COLORS.primary}
            style={styles.workoutProgress}
          />
          <Text style={styles.progressText}>
            {workout.duration} min • {workout.exercises.length} exercises
          </Text>
        </View>
        
        <View style={styles.exerciseList}>
          {workout.exercises.slice(0, 3).map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Icon 
                name={exercise.completed ? "check-circle" : "radio-button-unchecked"} 
                size={16} 
                color={exercise.completed ? COLORS.success : COLORS.textSecondary} 
              />
              <Text style={[styles.exerciseText, { 
                textDecorationLine: exercise.completed ? 'line-through' : 'none',
                color: exercise.completed ? COLORS.textSecondary : COLORS.text
              }]}>
                {exercise.name} - {exercise.sets}x{exercise.reps}
              </Text>
            </View>
          ))}
        </View>
        
        {workout.feedback && (
          <View style={styles.feedbackSection}>
            <Icon name="comment" size={14} color={COLORS.info} />
            <Text style={[TEXT_STYLES.caption, { marginLeft: 4, flex: 1, fontStyle: 'italic' }]}>
              "{workout.feedback}"
            </Text>
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('WorkoutDetails', { workout })}
          icon="visibility"
        >
          View Details
        </Button>
        <Button 
          mode="contained" 
          onPress={() => generatePersonalizedWorkout({ name: workout.playerName })}
          buttonColor={COLORS.primary}
        >
          Repeat
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderAISuggestion = (suggestion) => (
    <Card key={suggestion.id} style={styles.suggestionCard}>
      <Card.Content>
        <View style={styles.suggestionHeader}>
          <View style={styles.suggestionTitle}>
            <Icon 
              name={getTypeIcon(suggestion.type)} 
              size={20} 
              color={getPriorityColor(suggestion.priority)} 
            />
            <Text style={[TEXT_STYLES.body, { marginLeft: 8, flex: 1 }]}>
              {suggestion.suggestion}
            </Text>
            <Chip 
              compact 
              style={[styles.priorityChip, { backgroundColor: getPriorityColor(suggestion.priority) + '20' }]}
              textStyle={{ color: getPriorityColor(suggestion.priority) }}
            >
              {suggestion.priority}
            </Chip>
          </View>
          <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
            For: {suggestion.playerName}
          </Text>
        </View>
        
        <Text style={[TEXT_STYLES.caption, { marginTop: SPACING.sm }]}>
          {suggestion.reason}
        </Text>
        
        <View style={styles.suggestionFooter}>
          <Text style={[TEXT_STYLES.caption, { color: COLORS.info }]}>
            Duration: {suggestion.duration}
          </Text>
          <Button 
            mode="contained"
            compact
            onPress={() => Alert.alert('Apply Suggestion', `Generate workout with ${suggestion.suggestion}?`)}
            buttonColor={COLORS.primary}
          >
            Apply
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.modalHeader}
          >
            <IconButton
              icon="close"
              iconColor="white"
              onPress={() => setShowCreateModal(false)}
            />
            <Text style={styles.modalTitle}>Create Custom Workout</Text>
            <View style={{ width: 48 }} />
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            <Card style={styles.formCard}>
              <Card.Content>
                <Text style={[TEXT_STYLES.h3, { marginBottom: SPACING.lg }]}>
                  Player Information
                </Text>
                
                <TextInput
                  label="Player Name"
                  value={workoutForm.playerName}
                  onChangeText={(text) => setWorkoutForm({...workoutForm, playerName: text})}
                  style={styles.textInput}
                  mode="outlined"
                />
                
                <View style={styles.formSection}>
                  <Text style={TEXT_STYLES.body}>Sport</Text>
                  <RadioButton.Group
                    onValueChange={(value) => setWorkoutForm({...workoutForm, sport: value})}
                    value={workoutForm.sport}
                  >
                    <View style={styles.radioContainer}>
                      {['Basketball', 'Tennis', 'Soccer', 'Football'].map((sport) => (
                        <View key={sport} style={styles.radioRow}>
                          <RadioButton value={sport} />
                          <Text style={TEXT_STYLES.caption}>{sport}</Text>
                        </View>
                      ))}
                    </View>
                  </RadioButton.Group>
                </View>
                
                <View style={styles.formSection}>
                  <Text style={TEXT_STYLES.body}>Workout Duration (minutes)</Text>
                  <View style={styles.durationButtons}>
                    {[30, 45, 60, 75, 90].map((duration) => (
                      <TouchableOpacity
                        key={duration}
                        style={[
                          styles.durationButton,
                          workoutForm.duration === duration && styles.selectedDurationButton
                        ]}
                        onPress={() => setWorkoutForm({...workoutForm, duration})}
                      >
                        <Text style={[
                          styles.durationText,
                          workoutForm.duration === duration && styles.selectedDurationText
                        ]}>
                          {duration}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.formSection}>
                  <Text style={TEXT_STYLES.body}>Intensity Level</Text>
                  <RadioButton.Group
                    onValueChange={(value) => setWorkoutForm({...workoutForm, intensity: value})}
                    value={workoutForm.intensity}
                  >
                    <View style={styles.radioContainer}>
                      {['low', 'moderate', 'high'].map((intensity) => (
                        <View key={intensity} style={styles.radioRow}>
                          <RadioButton value={intensity} />
                          <Text style={[TEXT_STYLES.caption, { textTransform: 'capitalize' }]}>
                            {intensity}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </RadioButton.Group>
                </View>
                
                <TextInput
                  label="Training Goals (comma separated)"
                  value={workoutForm.goals.join(', ')}
                  onChangeText={(text) => setWorkoutForm({
                    ...workoutForm, 
                    goals: text.split(',').map(g => g.trim()).filter(g => g)
                  })}
                  style={styles.textInput}
                  mode="outlined"
                  placeholder="e.g., shooting accuracy, speed, endurance"
                />
                
                <TextInput
                  label="Injuries/Limitations (optional)"
                  value={workoutForm.injuries}
                  onChangeText={(text) => setWorkoutForm({...workoutForm, injuries: text})}
                  style={styles.textInput}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                />
                
                <TextInput
                  label="Special Preferences (optional)"
                  value={workoutForm.preferences}
                  onChangeText={(text) => setWorkoutForm({...workoutForm, preferences: text})}
                  style={styles.textInput}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                />
              </Card.Content>
            </Card>
            
            <Button
              mode="contained"
              onPress={() => generatePersonalizedWorkout()}
              style={styles.generateButton}
              buttonColor={COLORS.primary}
              disabled={!workoutForm.playerName}
            >
              Generate AI Workout
            </Button>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );

  const renderWorkoutModal = () => (
    <Portal>
      <Modal
        visible={showWorkoutModal}
        animationType="slide"
        onRequestClose={() => setShowWorkoutModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.modalHeader}
          >
            <IconButton
              icon="close"
              iconColor="white"
              onPress={() => setShowWorkoutModal(false)}
            />
            <Text style={styles.modalTitle}>Generated Workout</Text>
            <IconButton
              icon="share"
              iconColor="white"
              onPress={() => Alert.alert('Share Workout', 'Sharing functionality coming soon!')}
            />
          </LinearGradient>
          
          <ScrollView style={styles.modalContent}>
            {generatedWorkout && (
              <View>
                <Card style={styles.workoutSummaryCard}>
                  <Card.Content>
                    <View style={styles.workoutSummaryHeader}>
                      <View style={styles.workoutTitleSection}>
                        <Text style={TEXT_STYLES.h2}>{generatedWorkout.title}</Text>
                        <Text style={TEXT_STYLES.caption}>
                          For: {generatedWorkout.playerName} • {generatedWorkout.sport}
                        </Text>
                      </View>
                      <Chip 
                        style={[styles.difficultyChip, { backgroundColor: COLORS.info + '20' }]}
                        textStyle={{ color: COLORS.info }}
                      >
                        {generatedWorkout.difficulty}
                      </Chip>
                    </View>
                    
                    <View style={styles.workoutStats}>
                      <View style={styles.statItem}>
                        <Icon name="schedule" size={20} color={COLORS.primary} />
                        <Text style={styles.statText}>{generatedWorkout.duration} min</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="local-fire-department" size={20} color={COLORS.error} />
                        <Text style={styles.statText}>{generatedWorkout.estimatedCalories} cal</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Icon name="favorite" size={20} color={COLORS.info} />
                        <Text style={styles.statText}>{generatedWorkout.targetHeartRate}</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
                
                <Card style={styles.sectionCard}>
                  <Card.Content>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.success }]}>
                      🔥 Warm-up ({generatedWorkout.warmup.reduce((acc, w) => acc + parseInt(w.duration), 0)} min)
                    </Text>
                    {generatedWorkout.warmup.map((exercise, index) => (
                      <View key={index} style={styles.exerciseRow}>
                        <Text style={TEXT_STYLES.body}>{exercise.exercise}</Text>
                        <Text style={TEXT_STYLES.caption}>{exercise.duration}</Text>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
                
                <Card style={styles.sectionCard}>
                  <Card.Content>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.primary }]}>
                      💪 Main Workout
                    </Text>
                    {generatedWorkout.mainWorkout.map((exercise, index) => (
                      <View key={index} style={styles.mainExerciseRow}>
                        <View style={styles.exerciseHeader}>
                          <Text style={TEXT_STYLES.body}>{exercise.exercise}</Text>
                          <Text style={TEXT_STYLES.caption}>
                            {exercise.sets} × {exercise.reps} | Rest: {exercise.rest}
                          </Text>
                        </View>
                        <Text style={[TEXT_STYLES.caption, { marginTop: 4 }]}>
                          {exercise.description}
                        </Text>
                        {exercise.tips && (
                          <View style={styles.tipsContainer}>
                            {exercise.tips.map((tip, tipIndex) => (
                              <Text key={tipIndex} style={styles.tipText}>
                                💡 {tip}
                              </Text>
                            ))}
                          </View>
                        )}
                        <TouchableOpacity style={styles.videoButton}>
                          <Icon name="play-circle-filled" size={16} color={COLORS.info} />
                          <Text style={styles.videoButtonText}>Watch Demo</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
                
                <Card style={styles.sectionCard}>
                  <Card.Content>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.warning }]}>
                      🧘 Cool-down ({generatedWorkout.cooldown.reduce((acc, c) => acc + parseInt(c.duration), 0)} min)
                    </Text>
                    {generatedWorkout.cooldown.map((exercise, index) => (
                      <View key={index} style={styles.exerciseRow}>
                        <Text style={TEXT_STYLES.body}>{exercise.exercise}</Text>
                        <Text style={TEXT_STYLES.caption}>{exercise.duration}</Text>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
                
                <Card style={styles.aiInsightsCard}>
                  <Card.Content>
                    <Text style={[TEXT_STYLES.h3, { color: COLORS.secondary }]}>
                      🤖 AI Insights
                    </Text>
                    
                    <View style={styles.insightSection}>
                      <Text style={styles.insightLabel}>Focus Areas:</Text>
                      <View style={styles.focusAreaChips}>
                        {generatedWorkout.aiInsights.focusAreas.map((area, index) => (
                          <Chip key={index} compact style={styles.focusAreaChip}>
                            {area}
                          </Chip>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.insightSection}>
                      <Text style={styles.insightLabel}>Adaptations:</Text>
                      <Text style={styles.insightText}>
                        {generatedWorkout.aiInsights.adaptations}
                      </Text>
                    </View>
                    
                    <View style={styles.insightSection}>
                      <Text style={styles.insightLabel}>Next Session:</Text>
                      <Text style={styles.insightText}>
                        {generatedWorkout.aiInsights.nextSession}
                      </Text>
                    </View>
                    
                    <View style={styles.insightSection}>
                      <Text style={styles.insightLabel}>Recovery Tips:</Text>
                      <Text style={styles.insightText}>
                        {generatedWorkout.aiInsights.recoveryTips}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
                
                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => Alert.alert('Save Workout', 'Workout saved to library!')}
                    style={styles.actionButton}
                    icon="bookmark"
                  >
                    Save to Library
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => Alert.alert('Assign Workout', 'Assign to player and schedule?')}
                    style={styles.actionButton}
                    buttonColor={COLORS.primary}
                    icon="send"
                  >
                    Assign to Player
                  </Button>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Personalized Workouts</Text>
            <Text style={styles.headerSubtitle}>AI-Generated Training Plans 🏋️‍♂️</Text>
          </View>
          <IconButton
            icon="add"
            iconColor="white"
            size={24}
            onPress={() => setShowCreateModal(true)}
          />
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
            onPress={() => setActiveTab('templates')}
          >
            <Text style={[styles.tabText, activeTab === 'templates' && styles.activeTabText]}>
              Templates
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
            onPress={() => setActiveTab('recent')}
          >
            <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'suggestions' && styles.activeTab]}
            onPress={() => setActiveTab('suggestions')}
          >
            <Text style={[styles.tabText, activeTab === 'suggestions' && styles.activeTabText]}>
              AI Suggestions
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'templates' && (
            <>
              {/* Search and Filters */}
              <View style={styles.searchSection}>
                <Searchbar
                  placeholder="Search workout templates..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={styles.searchBar}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterChips}>
                    <Chip
                      selected={filterIntensity === 'all'}
                      onPress={() => setFilterIntensity('all')}
                      style={styles.filterChip}
                    >
                      All Intensity
                    </Chip>
                    <Chip
                      selected={filterIntensity === 'low'}
                      onPress={() => setFilterIntensity('low')}
                      style={styles.filterChip}
                    >
                      Low
                    </Chip>
                    <Chip
                      selected={filterIntensity === 'moderate'}
                      onPress={() => setFilterIntensity('moderate')}
                      style={styles.filterChip}
                    >
                      Moderate
                    </Chip>
                    <Chip
                      selected={filterIntensity === 'high'}
                      onPress={() => setFilterIntensity('high')}
                      style={styles.filterChip}
                    >
                      High
                    </Chip>
                  </View>
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterChips}>
                    <Chip
                      selected={filterDuration === 'all'}
                      onPress={() => setFilterDuration('all')}
                      style={styles.filterChip}
                    >
                      All Duration
                    </Chip>
                    <Chip
                      selected={filterDuration === 'short'}
                      onPress={() => setFilterDuration('short')}
                      style={styles.filterChip}
                    >
                      ≤30 min
                    </Chip>
                    <Chip
                      selected={filterDuration === 'medium'}
                      onPress={() => setFilterDuration('medium')}
                      style={styles.filterChip}
                    >
                      30-60 min
                    </Chip>
                    <Chip
                      selected={filterDuration === 'long'}
                      onPress={() => setFilterDuration('long')}
                      style={styles.filterChip}
                    >
                      60 min
                    </Chip>
                  </View>
                </ScrollView>
              </View>

              {/* Workout Templates */}
              <View style={styles.section}>
                <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                  Workout Templates ({filteredTemplates.length})
                </Text>
                
                {isGenerating && (
                  <Card style={styles.generatingCard}>
                    <Card.Content style={styles.generatingContent}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={styles.generatingText}>
                        Generating personalized workout...
                      </Text>
                      <Text style={TEXT_STYLES.caption}>
                        Analyzing player data and preferences
                      </Text>
                    </Card.Content>
                  </Card>
                )}
                
                {filteredTemplates.map(renderTemplateCard)}
                
                {filteredTemplates.length === 0 && !isGenerating && (
                  <Card style={styles.emptyStateCard}>
                    <Card.Content style={styles.emptyStateContent}>
                      <Icon name="fitness-center" size={48} color={COLORS.textSecondary} />
                      <Text style={styles.emptyStateText}>No templates found</Text>
                      <Text style={TEXT_STYLES.caption}>
                        Try adjusting your search or filters
                      </Text>
                    </Card.Content>
                  </Card>
                )}
              </View>
            </>
          )}

          {activeTab === 'recent' && (
            <View style={styles.section}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                Recent Workouts ({recentWorkouts.length})
              </Text>
              {recentWorkouts.map(renderRecentWorkout)}
            </View>
          )}

          {activeTab === 'suggestions' && (
            <View style={styles.section}>
              <Text style={[TEXT_STYLES.h3, styles.sectionTitle]}>
                AI Suggestions ({aiSuggestions.length})
              </Text>
              {aiSuggestions.map(renderAISuggestion)}
            </View>
          )}
        </ScrollView>
      </Animated.View>

      <FAB
        icon="auto-awesome"
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        customSize={56}
        label="Create"
      />

      {renderCreateModal()}
      {renderWorkoutModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.md,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: {
    flex: 1
  },
  headerTitle: {
    ...TEXT_STYLES.h2,
    color: 'white',
    fontWeight: 'bold'
  },
  headerSubtitle: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs
  },
  content: {
    flex: 1,
    marginTop: -SPACING.md,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
    borderRadius: 8,
    padding: SPACING.xs
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 6
  },
  activeTab: {
    backgroundColor: COLORS.primary
  },
  tabText: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  activeTabText: {
    color: 'white'
  },
  section: {
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md
  },
  searchSection: {
    padding: SPACING.md
  },
  searchBar: {
    marginBottom: SPACING.md
  },
  filterChips: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm
  },
  filterChip: {
    marginRight: SPACING.sm
  },
  templateCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden'
  },
  templateGradient: {
    padding: SPACING.lg
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  templateInfo: {
    flex: 1
  },
  templateTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold'
  },
  templateSport: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs
  },
  templateRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12
  },
  ratingText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    marginLeft: SPACING.xs,
    fontWeight: '600'
  },
  templateMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  metricText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: SPACING.xs
  },
  templateDescription: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
    lineHeight: 18
  },
  focusChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md
  },
  focusChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12
  },
  focusText: {
    ...TEXT_STYLES.caption,
    color: 'white',
    fontSize: 10
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  completionText: {
    ...TEXT_STYLES.caption,
    color: 'rgba(255,255,255,0.7)'
  },
  intensityChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  recentWorkoutCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  workoutPlayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  workoutDetails: {
    marginLeft: SPACING.md,
    flex: 1
  },
  workoutMetrics: {
    alignItems: 'center'
  },
  progressSection: {
    marginBottom: SPACING.md
  },
  workoutProgress: {
    height: 6,
    borderRadius: 3,
    marginBottom: SPACING.xs
  },
  progressText: {
    ...TEXT_STYLES.caption,
    color: COLORS.textSecondary
  },
  exerciseList: {
    marginBottom: SPACING.sm
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  exerciseText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.sm,
    flex: 1
  },
  feedbackSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  suggestionCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  suggestionHeader: {
    marginBottom: SPACING.sm
  },
  suggestionTitle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  priorityChip: {
    borderWidth: 1,
    borderColor: 'transparent'
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md
  },
  generatingCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  generatingContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg
  },
  generatingText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    fontWeight: '600'
  },
  emptyStateCard: {
    marginHorizontal: SPACING.md
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    marginTop: SPACING.md,
    fontWeight: '600'
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.primary
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight + SPACING.sm,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.sm
  },
  modalTitle: {
    ...TEXT_STYLES.h3,
    color: 'white',
    fontWeight: 'bold'
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md
  },
  formCard: {
    marginBottom: SPACING.md
  },
  formSection: {
    marginBottom: SPACING.lg
  },
  radioContainer: {
    marginTop: SPACING.sm
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  textInput: {
    marginBottom: SPACING.md
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm
  },
  durationButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  selectedDurationButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  durationText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text
  },
  selectedDurationText: {
    color: 'white'
  },
  generateButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl
  },
  workoutSummaryCard: {
    marginBottom: SPACING.md
  },
  workoutSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  workoutTitleSection: {
    flex: 1
  },
  difficultyChip: {
    marginLeft: SPACING.sm
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  statItem: {
    alignItems: 'center'
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: '600'
  },
  sectionCard: {
    marginBottom: SPACING.md
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs
  },
  mainExerciseRow: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  exerciseHeader: {
    marginBottom: SPACING.xs
  },
  tipsContainer: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8
  },
  tipText: {
    ...TEXT_STYLES.caption,
    color: COLORS.info,
    marginBottom: SPACING.xs
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    alignSelf: 'flex-start'
  },
  videoButtonText: {
    ...TEXT_STYLES.caption,
    color: COLORS.info,
    marginLeft: SPACING.xs
  },
  aiInsightsCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.secondary + '10'
  },
  insightSection: {
    marginTop: SPACING.md
  },
  insightLabel: {
    ...TEXT_STYLES.body,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs
  },
  insightText: {
    ...TEXT_STYLES.caption,
    lineHeight: 18
  },
  focusAreaChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs
  },
  focusAreaChip: {
    backgroundColor: COLORS.secondary + '20'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl
  },
  actionButton: {
    flex: 1
  }
});

export default PersonalizedWorkout;
