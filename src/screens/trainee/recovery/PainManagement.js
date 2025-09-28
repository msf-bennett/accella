import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Alert,
  Animated,
  Vibration,
  Dimensions,
  TouchableOpacity,
  Text as RNText,
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
  Text,
  Divider,
  Badge,
  TextInput,
  RadioButton,
  Slider,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { useSelector, useDispatch } from 'react-redux';

// Import design system constants
const COLORS = {
  primary: '#6200ea',
  secondary: '#03dac6',
  error: '#b00020',
  success: '#4caf50',
  warning: '#ff9800',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#000000',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};

const { width, height } = Dimensions.get('window');

const PainManagement = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth?.user);
  const painData = useSelector(state => state.pain?.data);
  
  // Component state
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [showPainLogModal, setShowPainLogModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [currentPainLevel, setCurrentPainLevel] = useState(0);
  const [painType, setPainType] = useState('');
  const [painDescription, setPainDescription] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [weeklyPainTrend, setWeeklyPainTrend] = useState(3.2);
  const [painFreeStreak, setPainFreeStreak] = useState(7);
  const [activeTreatments, setActiveTreatments] = useState(2);
  const [completedExercises, setCompletedExercises] = useState(12);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const bodyMapScale = useRef(new Animated.Value(1)).current;
  
  // Body parts for pain tracking
  const bodyParts = [
    { id: 'neck', name: 'Neck', x: 0.5, y: 0.15, color: '#FF6B6B', severity: 2 },
    { id: 'shoulders', name: 'Shoulders', x: 0.3, y: 0.25, color: '#4ECDC4', severity: 1 },
    { id: 'upper_back', name: 'Upper Back', x: 0.5, y: 0.3, color: '#45B7D1', severity: 0 },
    { id: 'lower_back', name: 'Lower Back', x: 0.5, y: 0.45, color: '#FFA07A', severity: 3 },
    { id: 'hips', name: 'Hips', x: 0.4, y: 0.55, color: '#98D8C8', severity: 1 },
    { id: 'knees', name: 'Knees', x: 0.35, y: 0.7, color: '#F7DC6F', severity: 2 },
    { id: 'ankles', name: 'Ankles', x: 0.4, y: 0.9, color: '#BB8FCE', severity: 0 },
  ];
  
  // Pain types
  const painTypes = [
    { id: 'acute', label: 'Acute Pain', icon: 'flash-on', color: COLORS.error },
    { id: 'chronic', label: 'Chronic Pain', icon: 'schedule', color: COLORS.warning },
    { id: 'muscle', label: 'Muscle Soreness', icon: 'fitness-center', color: COLORS.primary },
    { id: 'joint', label: 'Joint Pain', icon: 'settings', color: COLORS.secondary },
    { id: 'tension', label: 'Tension/Stress', icon: 'psychology', color: '#9C27B0' },
  ];
  
  // Treatment options
  const treatments = [
    {
      id: 1,
      name: 'Ice Therapy',
      type: 'cold',
      duration: 15,
      frequency: '3x daily',
      description: 'Apply ice pack to reduce inflammation and numb pain',
      icon: 'ac-unit',
      color: '#2196F3',
      effectiveness: 85,
      suitableFor: ['acute', 'muscle', 'joint'],
      instructions: [
        'Wrap ice pack in thin towel',
        'Apply for 15-20 minutes',
        'Remove for 1 hour between applications',
        'Repeat 3-4 times daily',
      ],
    },
    {
      id: 2,
      name: 'Heat Therapy',
      type: 'heat',
      duration: 20,
      frequency: '2x daily',
      description: 'Apply heat to relax muscles and improve circulation',
      icon: 'whatshot',
      color: '#FF5722',
      effectiveness: 78,
      suitableFor: ['chronic', 'muscle', 'tension'],
      instructions: [
        'Use heating pad on low-medium setting',
        'Apply for 20-30 minutes',
        'Ensure skin is not too hot',
        'Use 2-3 times daily',
      ],
    },
    {
      id: 3,
      name: 'Gentle Stretching',
      type: 'movement',
      duration: 10,
      frequency: 'As needed',
      description: 'Light stretches to maintain mobility and reduce stiffness',
      icon: 'accessibility',
      color: '#4CAF50',
      effectiveness: 92,
      suitableFor: ['chronic', 'muscle', 'tension', 'joint'],
      instructions: [
        'Start with gentle movements',
        'Hold stretches for 30 seconds',
        'Breathe deeply throughout',
        'Stop if pain increases',
      ],
    },
    {
      id: 4,
      name: 'Massage Therapy',
      type: 'manual',
      duration: 30,
      frequency: '2-3x weekly',
      description: 'Self-massage or professional therapy to release tension',
      icon: 'spa',
      color: '#9C27B0',
      effectiveness: 88,
      suitableFor: ['chronic', 'muscle', 'tension'],
      instructions: [
        'Use gentle, circular motions',
        'Apply light to moderate pressure',
        'Focus on tight or tender areas',
        'Use massage oil if available',
      ],
    },
    {
      id: 5,
      name: 'Mindfulness & Breathing',
      type: 'mental',
      duration: 15,
      frequency: 'Daily',
      description: 'Meditation and breathing exercises to manage pain perception',
      icon: 'self-improvement',
      color: '#607D8B',
      effectiveness: 75,
      suitableFor: ['chronic', 'tension'],
      instructions: [
        'Find comfortable seated position',
        'Focus on deep, slow breathing',
        'Practice body scan meditation',
        'Use guided meditation apps if helpful',
      ],
    },
  ];
  
  // Recovery exercises
  const recoveryExercises = [
    {
      id: 1,
      name: 'Cat-Cow Stretch',
      targetArea: 'lower_back',
      duration: 60,
      difficulty: 'Easy',
      description: 'Gentle spinal mobility exercise',
      instructions: [
        'Start on hands and knees',
        'Arch back (cow), then round spine (cat)',
        'Move slowly and controlled',
        'Repeat 10-15 times',
      ],
    },
    {
      id: 2,
      name: 'Neck Rolls',
      targetArea: 'neck',
      duration: 45,
      difficulty: 'Easy',
      description: 'Release neck tension and stiffness',
      instructions: [
        'Sit or stand with good posture',
        'Slowly roll head in circles',
        'Change direction halfway through',
        'Keep shoulders relaxed',
      ],
    },
    {
      id: 3,
      name: 'Hip Flexor Stretch',
      targetArea: 'hips',
      duration: 90,
      difficulty: 'Moderate',
      description: 'Open tight hip flexors',
      instructions: [
        'Step into lunge position',
        'Lower back knee to ground',
        'Push hips forward gently',
        'Hold and breathe deeply',
      ],
    },
    {
      id: 4,
      name: 'Shoulder Blade Squeezes',
      targetArea: 'shoulders',
      duration: 30,
      difficulty: 'Easy',
      description: 'Strengthen upper back muscles',
      instructions: [
        'Sit or stand with arms at sides',
        'Squeeze shoulder blades together',
        'Hold for 5 seconds',
        'Repeat 15-20 times',
      ],
    },
  ];
  
  // Recent pain logs
  const recentPainLogs = [
    {
      id: 1,
      bodyPart: 'lower_back',
      level: 6,
      type: 'muscle',
      timestamp: '2 hours ago',
      treatment: 'Heat Therapy',
      notes: 'Pain after morning workout',
    },
    {
      id: 2,
      bodyPart: 'neck',
      level: 3,
      type: 'tension',
      timestamp: '1 day ago',
      treatment: 'Stretching',
      notes: 'Tension from desk work',
    },
    {
      id: 3,
      bodyPart: 'knees',
      level: 4,
      type: 'joint',
      timestamp: '2 days ago',
      treatment: 'Ice Therapy',
      notes: 'Joint stiffness morning',
    },
  ];
  
  // Animation effects
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Pulse animation for pain indicators
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, [fadeAnim, pulseAnim]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Vibration.vibrate(50);
    } catch (error) {
      Alert.alert('Connection Error', 'Unable to refresh pain data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  const handleBodyPartPress = useCallback((bodyPart) => {
    setSelectedBodyPart(bodyPart);
    setShowPainLogModal(true);
    
    // Scale animation for selected body part
    Animated.sequence([
      Animated.timing(bodyMapScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bodyMapScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    
    Vibration.vibrate(30);
  }, [bodyMapScale]);
  
  const logPain = useCallback(() => {
    if (!selectedBodyPart || currentPainLevel === 0) {
      Alert.alert('Incomplete Information', 'Please select body part and pain level.');
      return;
    }
    
    const newLog = {
      id: Date.now(),
      bodyPart: selectedBodyPart.id,
      level: currentPainLevel,
      type: painType,
      timestamp: 'Just now',
      notes: painDescription,
    };
    
    // dispatch(addPainLog(newLog));
    
    setShowPainLogModal(false);
    setCurrentPainLevel(0);
    setPainType('');
    setPainDescription('');
    
    Alert.alert('Pain Logged', 'Your pain entry has been recorded. Would you like treatment recommendations?', [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Show Treatments', onPress: () => setShowTreatmentModal(true) },
    ]);
    
    Vibration.vibrate(50);
  }, [selectedBodyPart, currentPainLevel, painType, painDescription]);
  
  const startTreatment = useCallback((treatment) => {
    setSelectedTreatment(treatment);
    setShowTreatmentModal(false);
    Alert.alert(
      `Starting ${treatment.name}`,
      `Duration: ${treatment.duration} minutes\nFrequency: ${treatment.frequency}\n\nWould you like a timer?`,
      [
        { text: 'No Timer', style: 'cancel' },
        { text: 'Set Timer', onPress: () => Alert.alert('Feature Coming Soon', 'Treatment timers will be available soon!') },
      ]
    );
  }, []);
  
  const getPainColor = (level) => {
    if (level === 0) return '#E8F5E8';
    if (level <= 2) return '#C8E6C9';
    if (level <= 4) return '#FFF3E0';
    if (level <= 6) return '#FFE0B2';
    if (level <= 8) return '#FFCDD2';
    return '#F8BBD9';
  };
  
  const getPainSeverityText = (level) => {
    if (level === 0) return 'No Pain';
    if (level <= 2) return 'Mild';
    if (level <= 4) return 'Moderate';
    if (level <= 6) return 'Moderately Severe';
    if (level <= 8) return 'Severe';
    return 'Very Severe';
  };
  
  const renderHeader = () => (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.header}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Pain Management</Text>
              <Text style={styles.headerSubtitle}>Track • Treat • Recover</Text>
            </View>
            <Surface style={styles.streakContainer}>
              <Icon name="healing" size={20} color={COLORS.success} />
              <Text style={styles.streakText}>{painFreeStreak} days</Text>
              <Text style={styles.streakLabel}>Pain Free</Text>
            </Surface>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyPainTrend}</Text>
              <Text style={styles.statLabel}>Avg Pain Level</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeTreatments}</Text>
              <Text style={styles.statLabel}>Active Treatments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedExercises}</Text>
              <Text style={styles.statLabel}>Exercises Done</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
  
  const renderBodyMap = () => (
    <Surface style={styles.bodyMapContainer}>
      <Text style={styles.sectionTitle}>Body Pain Map</Text>
      <Text style={styles.sectionSubtitle}>Tap areas where you're experiencing pain</Text>
      
      <View style={styles.bodyMapWrapper}>
        <View style={styles.bodyMap}>
          {/* Simple body outline representation */}
          <View style={styles.bodyOutline}>
            {bodyParts.map((part) => (
              <Animated.View
                key={part.id}
                style={[
                  styles.bodyPartIndicator,
                  {
                    left: `${part.x * 100}%`,
                    top: `${part.y * 100}%`,
                    backgroundColor: part.severity > 0 ? getPainColor(part.severity * 2) : '#E0E0E0',
                    transform: [
                      { scale: part.severity > 0 ? pulseAnim : 1 },
                      { scale: bodyMapScale },
                    ],
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.bodyPartButton}
                  onPress={() => handleBodyPartPress(part)}
                >
                  <Text style={styles.bodyPartText}>{part.name}</Text>
                  {part.severity > 0 && (
                    <Badge
                      size={16}
                      style={[styles.painBadge, { backgroundColor: getPainColor(part.severity * 3) }]}
                    >
                      {part.severity}
                    </Badge>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
        
        <View style={styles.painScale}>
          <Text style={styles.painScaleTitle}>Pain Scale</Text>
          <View style={styles.painScaleItems}>
            {[0, 2, 4, 6, 8, 10].map((level) => (
              <View key={level} style={styles.painScaleItem}>
                <View style={[styles.painScaleColor, { backgroundColor: getPainColor(level) }]} />
                <Text style={styles.painScaleText}>{level}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Surface>
  );
  
  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Surface style={styles.quickActionsCard}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => setShowPainLogModal(true)}
          >
            <Icon name="add-circle" size={32} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Log Pain</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => setShowTreatmentModal(true)}
          >
            <Icon name="healing" size={32} color={COLORS.success} />
            <Text style={styles.quickActionText}>Treatments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => setShowExerciseModal(true)}
          >
            <Icon name="fitness-center" size={32} color={COLORS.warning} />
            <Text style={styles.quickActionText}>Exercises</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => Alert.alert('Feature Coming Soon', 'Professional consultations will be available soon!')}
          >
            <Icon name="medical-services" size={32} color={COLORS.error} />
            <Text style={styles.quickActionText}>Consult</Text>
          </TouchableOpacity>
        </View>
      </Surface>
    </View>
  );
  
  const renderRecentLogs = () => (
    <Surface style={styles.recentLogsContainer}>
      <Text style={styles.sectionTitle}>Recent Pain Logs</Text>
      {recentPainLogs.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="sentiment-very-satisfied" size={48} color={COLORS.success} />
          <Text style={styles.emptyStateTitle}>No Recent Pain!</Text>
          <Text style={styles.emptyStateText}>Keep up the great work with your recovery routine.</Text>
        </View>
      ) : (
        recentPainLogs.map((log) => (
          <Card key={log.id} style={styles.logCard}>
            <Card.Content style={styles.logContent}>
              <View style={styles.logHeader}>
                <View style={styles.logInfo}>
                  <View style={[styles.painIndicator, { backgroundColor: getPainColor(log.level) }]} />
                  <View>
                    <Text style={styles.logBodyPart}>
                      {bodyParts.find(bp => bp.id === log.bodyPart)?.name || log.bodyPart}
                    </Text>
                    <Text style={styles.logDetails}>
                      Level {log.level}/10 • {getPainSeverityText(log.level)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.logTimestamp}>{log.timestamp}</Text>
              </View>
              
              {log.notes && (
                <Text style={styles.logNotes}>{log.notes}</Text>
              )}
              
              {log.treatment && (
                <Chip
                  mode="outlined"
                  icon="healing"
                  style={styles.treatmentChip}
                  textStyle={styles.treatmentChipText}
                >
                  {log.treatment}
                </Chip>
              )}
            </Card.Content>
          </Card>
        ))
      )}
    </Surface>
  );
  
  const renderPainLogModal = () => (
    <Portal>
      <Modal
        visible={showPainLogModal}
        onDismiss={() => setShowPainLogModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.modalTitle}>Log Your Pain</Text>
          
          {selectedBodyPart && (
            <Text style={styles.modalSubtitle}>
              Recording pain for: {selectedBodyPart.name}
            </Text>
          )}
          
          <View style={styles.painLevelSection}>
            <Text style={styles.painLevelLabel}>Pain Level: {currentPainLevel}/10</Text>
            <Text style={styles.painLevelDescription}>
              {getPainSeverityText(currentPainLevel)}
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>0</Text>
              <Slider
                style={styles.painSlider}
                minimumValue={0}
                maximumValue={10}
                step={1}
                value={currentPainLevel}
                onValueChange={setCurrentPainLevel}
                minimumTrackTintColor={getPainColor(currentPainLevel)}
                maximumTrackTintColor="#E0E0E0"
                thumbStyle={{ backgroundColor: getPainColor(currentPainLevel) }}
              />
              <Text style={styles.sliderLabel}>10</Text>
            </View>
          </View>
          
          <View style={styles.painTypeSection}>
            <Text style={styles.sectionLabel}>Pain Type</Text>
            <View style={styles.painTypeOptions}>
              {painTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.painTypeOption,
                    painType === type.id && styles.selectedPainType,
                  ]}
                  onPress={() => setPainType(type.id)}
                >
                  <Icon name={type.icon} size={20} color={type.color} />
                  <Text style={styles.painTypeText}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.notesSection}>
            <Text style={styles.sectionLabel}>Notes (Optional)</Text>
            <TextInput
              mode="outlined"
              placeholder="Describe your pain, when it started, what triggered it..."
              value={painDescription}
              onChangeText={setPainDescription}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />
          </View>
          
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowPainLogModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={logPain}
              style={styles.modalButton}
            >
              Log Pain
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
  
  const renderTreatmentModal = () => (
    <Portal>
      <Modal
        visible={showTreatmentModal}
        onDismiss={() => setShowTreatmentModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.modalTitle}>Treatment Options</Text>
          <Text style={styles.modalSubtitle}>Choose a treatment method for your pain</Text>
          
          <ScrollView style={styles.treatmentList}>
            {treatments.map((treatment) => (
              <Card key={treatment.id} style={styles.treatmentCard}>
                <Card.Content style={styles.treatmentContent}>
                  <View style={styles.treatmentHeader}>
                    <Icon name={treatment.icon} size={24} color={treatment.color} />
                    <View style={styles.treatmentInfo}>
                      <Text style={styles.treatmentName}>{treatment.name}</Text>
                      <Text style={styles.treatmentDescription}>{treatment.description}</Text>
                    </View>
                    <View style={styles.effectivenessContainer}>
                      <Text style={styles.effectivenessLabel}>Effectiveness</Text>
                      <Text style={styles.effectivenessValue}>{treatment.effectiveness}%</Text>
                    </View>
                  </View>
                  
                  <View style={styles.treatmentDetails}>
                    <Text style={styles.treatmentDetailText}>
                      Duration: {treatment.duration} min • Frequency: {treatment.frequency}
                    </Text>
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={() => startTreatment(treatment)}
                    style={[styles.treatmentButton, { backgroundColor: treatment.color }]}
                  >
                    Start Treatment
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
          
          <Button
            mode="outlined"
            onPress={() => setShowTreatmentModal(false)}
            style={styles.modalCloseButton}
          >
            Close
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );
  
  const renderExerciseModal = () => (
    <Portal>
      <Modal
        visible={showExerciseModal}
        onDismiss={() => setShowExerciseModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent}>
          <Text style={styles.modalTitle}>Recovery Exercises</Text>
          <Text style={styles.modalSubtitle}>Gentle exercises to aid your recovery</Text>
          
          <ScrollView style={styles.exerciseList}>
            {recoveryExercises.map((exercise) => (
              <Card key={exercise.id} style={styles.exerciseCard}>
                <Card.Content style={styles.exerciseContent}>
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Chip
                      mode="flat"
                      style={styles.difficultyChip}
                      textStyle={styles.difficultyText}
                    >
                      {exercise.difficulty}
                    </Chip>
                  </View>
                  
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  
                  <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseTarget}>
                      Target: {bodyParts.find(bp => bp.id === exercise.targetArea)?.name}
                    </Text>
                    <Text style={styles.exerciseDuration}>Duration: {exercise.duration}s</Text>
                  </View>
                  
                  <View style={styles.exerciseInstructions}>
                    <Text style={styles.instructionsTitle}>Instructions:</Text>
                    {exercise.instructions.map((instruction, idx) => (
                      <Text key={idx} style={styles.instructionText}>
                        {idx + 1}. {instruction}
                      </Text>
                    ))}
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={() => {
                      setCompletedExercises(prev => prev + 1);
                      Alert.alert('Exercise Started', `Timer set for ${exercise.duration} seconds. Focus on proper form and breathing.`);
                    }}
                    style={styles.exerciseButton}
                  >
                    Start Exercise
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
          
          <Button
            mode="outlined"
            onPress={() => setShowExerciseModal(false)}
            style={styles.modalCloseButton}
          >
            Close
          </Button>
        </Surface>
      </Modal>
    </Portal>
  );
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor="#ffffff"
          />
        }
      >
        {renderBodyMap()}
        {renderQuickActions()}
        {renderRecentLogs()}
      </ScrollView>
      
      {renderPainLogModal()}
      {renderTreatmentModal()}
      {renderExerciseModal()}
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowPainLogModal(true)}
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
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    ...TEXT_STYLES.h1,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  streakContainer: {
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  streakText: {
    ...TEXT_STYLES.h2,
    color: COLORS.success,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  streakLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TEXT_STYLES.h2,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    color: '#ffffff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bodyMapContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: SPACING.lg,
  },
  bodyMapWrapper: {
    alignItems: 'center',
  },
  bodyMap: {
    width: 200,
    height: 400,
    marginBottom: SPACING.lg,
  },
  bodyOutline: {
    flex: 1,
    position: 'relative',
  },
  bodyPartIndicator: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -20,
    marginTop: -20,
    elevation: 2,
  },
  bodyPartButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyPartText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    fontSize: 8,
    textAlign: 'center',
  },
  painBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  painScale: {
    alignItems: 'center',
  },
  painScaleTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  painScaleItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  painScaleItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  painScaleColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },
  painScaleText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
  },
  quickActionsContainer: {
    margin: SPACING.md,
  },
  quickActionsCard: {
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  quickActionsTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  recentLogsContainer: {
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateTitle: {
    ...TEXT_STYLES.h2,
    color: COLORS.success,
    marginTop: SPACING.md,
  },
  emptyStateText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  logCard: {
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  logContent: {
    paddingVertical: SPACING.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  painIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  logBodyPart: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  logDetails: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: SPACING.xs,
  },
  logTimestamp: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    opacity: 0.5,
  },
  logNotes: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    opacity: 0.8,
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },
  treatmentChip: {
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  treatmentChipText: {
    ...TEXT_STYLES.caption,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  modalContent: {
    padding: SPACING.lg,
    borderRadius: 12,
    maxHeight: '90%',
  },
  modalTitle: {
    ...TEXT_STYLES.h1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  modalSubtitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  painLevelSection: {
    marginBottom: SPACING.lg,
  },
  painLevelLabel: {
    ...TEXT_STYLES.h2,
    color: COLORS.text,
    textAlign: 'center',
  },
  painLevelDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    width: 20,
    textAlign: 'center',
  },
  painSlider: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  painTypeSection: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  painTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  painTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedPainType: {
    backgroundColor: COLORS.primary,
  },
  painTypeText: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  notesSection: {
    marginBottom: SPACING.lg,
  },
  notesInput: {
    backgroundColor: '#f5f5f5',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  treatmentList: {
    maxHeight: 400,
    marginBottom: SPACING.md,
  },
  treatmentCard: {
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  treatmentContent: {
    paddingVertical: SPACING.sm,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  treatmentInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  treatmentName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  treatmentDescription: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    opacity: 0.7,
    marginTop: SPACING.xs,
  },
  effectivenessContainer: {
    alignItems: 'flex-end',
  },
  effectivenessLabel: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  effectivenessValue: {
    ...TEXT_STYLES.body,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  treatmentDetails: {
    marginBottom: SPACING.sm,
  },
  treatmentDetailText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    opacity: 0.8,
  },
  treatmentButton: {
    marginTop: SPACING.sm,
  },
  modalCloseButton: {
    marginTop: SPACING.sm,
  },
  exerciseList: {
    maxHeight: 400,
    marginBottom: SPACING.md,
  },
  exerciseCard: {
    marginBottom: SPACING.sm,
    elevation: 1,
  },
  exerciseContent: {
    paddingVertical: SPACING.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  exerciseName: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  difficultyChip: {
    backgroundColor: '#e8f5e8',
  },
  difficultyText: {
    ...TEXT_STYLES.caption,
    color: COLORS.success,
  },
  exerciseDescription: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SPACING.sm,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  exerciseTarget: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  exerciseDuration: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    opacity: 0.7,
  },
  exerciseInstructions: {
    marginBottom: SPACING.md,
  },
  instructionsTitle: {
    ...TEXT_STYLES.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  instructionText: {
    ...TEXT_STYLES.caption,
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  exerciseButton: {
    backgroundColor: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default PainManagement;