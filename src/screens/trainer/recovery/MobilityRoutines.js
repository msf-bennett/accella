import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Alert,
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
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from '@react-native-blur/blur';

const { width, height } = Dimensions.get('window');

// Design system constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e0e0e0',
  mobility: '#ff6b6b',
  flexibility: '#4ecdc4',
  dynamic: '#45b7d1',
  static: '#96ceb4',
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
  caption: { fontSize: 14, color: COLORS.textSecondary },
};

const MobilityRoutines = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exerciseTime, setExerciseTime] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const timerRef = useRef(null);

  // Sample data - replace with Redux state
  const [mobilityData, setMobilityData] = useState({
    dailyGoal: {
      target: 30,
      completed: 18,
      streak: 5
    },
    routines: [
      {
        id: 1,
        title: 'Morning Dynamic Flow',
        category: 'dynamic',
        duration: '15 min',
        difficulty: 'Beginner',
        exercises: 12,
        bodyParts: ['Full Body', 'Spine', 'Hips', 'Shoulders'],
        benefits: ['Energy Boost', 'Joint Preparation', 'Improved Circulation'],
        color: COLORS.dynamic,
        icon: 'wb-sunny',
        rating: 4.8,
        completions: 156,
        isCompleted: true,
        exerciseList: [
          { name: 'Arm Circles', duration: 60, type: 'dynamic' },
          { name: 'Leg Swings', duration: 90, type: 'dynamic' },
          { name: 'Hip Circles', duration: 60, type: 'dynamic' },
          { name: 'Torso Twists', duration: 75, type: 'dynamic' }
        ]
      },
      {
        id: 2,
        title: 'Hip Mobility Focus',
        category: 'targeted',
        duration: '20 min',
        difficulty: 'Intermediate',
        exercises: 8,
        bodyParts: ['Hips', 'Glutes', 'Lower Back'],
        benefits: ['Hip Flexor Release', 'Better Squat Depth', 'Pain Relief'],
        color: COLORS.mobility,
        icon: 'accessibility',
        rating: 4.7,
        completions: 89,
        isCompleted: false,
        exerciseList: [
          { name: 'Hip Flexor Stretch', duration: 120, type: 'static' },
          { name: '90/90 Stretch', duration: 150, type: 'static' },
          { name: 'Pigeon Pose', duration: 120, type: 'static' },
          { name: 'Hip Circles', duration: 60, type: 'dynamic' }
        ]
      },
      {
        id: 3,
        title: 'Evening Relaxation',
        category: 'relaxation',
        duration: '25 min',
        difficulty: 'Beginner',
        exercises: 10,
        bodyParts: ['Full Body', 'Neck', 'Shoulders'],
        benefits: ['Stress Relief', 'Better Sleep', 'Muscle Relaxation'],
        color: COLORS.flexibility,
        icon: 'bedtime',
        rating: 4.9,
        completions: 203,
        isCompleted: false,
        exerciseList: [
          { name: 'Child\'s Pose', duration: 120, type: 'static' },
          { name: 'Gentle Spinal Twist', duration: 90, type: 'static' },
          { name: 'Legs Up Wall', duration: 180, type: 'static' },
          { name: 'Neck Rolls', duration: 60, type: 'dynamic' }
        ]
      },
      {
        id: 4,
        title: 'Shoulder Mobility',
        category: 'targeted',
        duration: '12 min',
        difficulty: 'Intermediate',
        exercises: 6,
        bodyParts: ['Shoulders', 'Upper Back', 'Chest'],
        benefits: ['Improved Range', 'Posture Correction', 'Pain Prevention'],
        color: COLORS.warning,
        icon: 'airline-seat-legroom-reduced',
        rating: 4.6,
        completions: 134,
        isCompleted: true,
        exerciseList: [
          { name: 'Shoulder Rolls', duration: 60, type: 'dynamic' },
          { name: 'Wall Angels', duration: 90, type: 'dynamic' },
          { name: 'Doorway Chest Stretch', duration: 120, type: 'static' },
          { name: 'Cross Body Stretch', duration: 75, type: 'static' }
        ]
      },
      {
        id: 5,
        title: 'Athlete Performance Prep',
        category: 'performance',
        duration: '18 min',
        difficulty: 'Advanced',
        exercises: 14,
        bodyParts: ['Full Body', 'Core', 'Limbs'],
        benefits: ['Performance Ready', 'Injury Prevention', 'Power Enhancement'],
        color: COLORS.success,
        icon: 'sports',
        rating: 4.8,
        completions: 67,
        isCompleted: false,
        exerciseList: [
          { name: 'High Knees', duration: 45, type: 'dynamic' },
          { name: 'Butt Kicks', duration: 45, type: 'dynamic' },
          { name: 'Leg Swings Multi-plane', duration: 120, type: 'dynamic' },
          { name: 'Arm Swings', duration: 60, type: 'dynamic' }
        ]
      }
    ],
    exerciseTypes: [
      {
        id: 1,
        name: 'Dynamic Stretching',
        description: 'Active movements that take joints through full range of motion',
        duration: '30-60 seconds',
        bestFor: 'Warm-up, Pre-workout',
        color: COLORS.dynamic
      },
      {
        id: 2,
        name: 'Static Stretching',
        description: 'Holding stretches in fixed positions to improve flexibility',
        duration: '30-90 seconds',
        bestFor: 'Cool-down, Recovery',
        color: COLORS.static
      },
      {
        id: 3,
        name: 'PNF Stretching',
        description: 'Contract-relax method for maximum flexibility gains',
        duration: '15-30 seconds hold + contract',
        bestFor: 'Advanced flexibility',
        color: COLORS.flexibility
      },
      {
        id: 4,
        name: 'Flow Sequences',
        description: 'Continuous movement patterns combining multiple stretches',
        duration: '3-8 minutes',
        bestFor: 'Full-body mobility',
        color: COLORS.mobility
      }
    ]
  });

  const categories = [
    { id: 'all', label: 'All', icon: 'grid-view' },
    { id: 'dynamic', label: 'Dynamic', icon: 'directions-run' },
    { id: 'targeted', label: 'Targeted', icon: 'gps-fixed' },
    { id: 'relaxation', label: 'Relaxation', icon: 'spa' },
    { id: 'performance', label: 'Performance', icon: 'sports' }
  ];

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (activeRoutine && !isResting) {
      timerRef.current = setInterval(() => {
        setExerciseTime(prev => {
          const currentEx = activeRoutine.exerciseList[currentExercise];
          if (prev >= currentEx.duration) {
            handleNextExercise();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeRoutine, currentExercise, isResting]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchMobilityRoutines());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRoutine = (routine) => {
    setActiveRoutine(routine);
    setCurrentExercise(0);
    setExerciseTime(0);
    setIsResting(false);
    Alert.alert('Routine Started', `${routine.title} is now active! Let's improve your mobility! 🤸‍♂️`);
  };

  const handleNextExercise = () => {
    if (currentExercise < activeRoutine.exerciseList.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setExerciseTime(0);
      setIsResting(true);
      setTimeout(() => setIsResting(false), 10000); // 10 second rest
    } else {
      handleCompleteRoutine();
    }
  };

  const handleCompleteRoutine = () => {
    const completedRoutine = activeRoutine.title;
    setActiveRoutine(null);
    setCurrentExercise(0);
    setExerciseTime(0);
    setIsResting(false);
    
    // Update daily progress
    setMobilityData(prev => ({
      ...prev,
      dailyGoal: {
        ...prev.dailyGoal,
        completed: Math.min(prev.dailyGoal.completed + parseInt(activeRoutine.duration), prev.dailyGoal.target)
      }
    }));
    
    Alert.alert('Routine Complete!', `Great work! ${completedRoutine} completed successfully! 🎉`);
  };

  const handleStopRoutine = () => {
    Alert.alert(
      'Stop Routine',
      'Are you sure you want to stop the current routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Stop', 
          onPress: () => {
            setActiveRoutine(null);
            setCurrentExercise(0);
            setExerciseTime(0);
            setIsResting(false);
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[COLORS.mobility, COLORS.flexibility]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={[TEXT_STYLES.h2, styles.headerTitle]}>Mobility Routines</Text>
        <Text style={styles.headerSubtitle}>Move better, feel better 🤸‍♂️</Text>
        
        <Surface style={styles.dailyGoalCard}>
          <View style={styles.goalHeader}>
            <Icon name="track-changes" size={24} color={COLORS.mobility} />
            <Text style={[TEXT_STYLES.h3, styles.goalTitle]}>Daily Goal</Text>
            <View style={styles.streakBadge}>
              <Icon name="local-fire-department" size={16} color={COLORS.warning} />
              <Text style={styles.streakText}>{mobilityData.dailyGoal.streak}</Text>
            </View>
          </View>
          <View style={styles.goalProgress}>
            <Text style={styles.goalTime}>
              {mobilityData.dailyGoal.completed} / {mobilityData.dailyGoal.target} min
            </Text>
            <ProgressBar 
              progress={mobilityData.dailyGoal.completed / mobilityData.dailyGoal.target} 
              color={COLORS.success}
              style={styles.goalProgressBar}
            />
          </View>
        </Surface>

        {activeRoutine && (
          <Surface style={styles.activeRoutineCard}>
            <View style={styles.routineHeader}>
              <Text style={[TEXT_STYLES.body, styles.activeRoutineTitle]}>
                {activeRoutine.title}
              </Text>
              <TouchableOpacity onPress={handleStopRoutine}>
                <Icon name="stop" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            <Text style={styles.currentExercise}>
              {activeRoutine.exerciseList[currentExercise]?.name}
            </Text>
            <View style={styles.exerciseTimer}>
              <Text style={styles.timerText}>{formatTime(exerciseTime)}</Text>
              <Text style={styles.exerciseProgress}>
                {currentExercise + 1} / {activeRoutine.exerciseList.length}
              </Text>
            </View>
            {isResting && (
              <Text style={styles.restIndicator}>Rest Period - Get Ready! 😤</Text>
            )}
          </Surface>
        )}
      </View>
    </LinearGradient>
  );

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <Searchbar
        placeholder="Search mobility routines..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        iconColor={COLORS.mobility}
      />
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.filterChip,
              selectedCategory === category.id && styles.filterChipSelected
            ]}
            textStyle={selectedCategory === category.id ? styles.filterChipTextSelected : styles.filterChipText}
            icon={category.icon}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const renderRoutineCard = (routine) => (
    <Card key={routine.id} style={styles.routineCard}>
      <Card.Content>
        <View style={styles.routineHeader}>
          <View style={styles.routineInfo}>
            <View style={[styles.routineIcon, { backgroundColor: routine.color + '20' }]}>
              <Icon name={routine.icon} size={28} color={routine.color} />
            </View>
            <View style={styles.routineDetails}>
              <View style={styles.titleRow}>
                <Text style={[TEXT_STYLES.h3, styles.routineTitle]}>{routine.title}</Text>
                {routine.isCompleted && (
                  <Icon name="check-circle" size={20} color={COLORS.success} />
                )}
              </View>
              <Text style={styles.routineMeta}>
                {routine.duration} • {routine.exercises} exercises • {routine.difficulty}
              </Text>
              <View style={styles.ratingContainer}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.rating}>{routine.rating}</Text>
                <Text style={styles.completions}>({routine.completions} completed)</Text>
              </View>
            </View>
          </View>
          <IconButton
            icon="dots-vertical"
            onPress={() => {
              setSelectedRoutine(routine);
              Alert.alert('Routine Options', 'Detailed view coming soon!');
            }}
          />
        </View>
        
        <View style={styles.bodyPartsSection}>
          <Text style={styles.sectionLabel}>Target Areas:</Text>
          <View style={styles.chipContainer}>
            {routine.bodyParts.map((part, index) => (
              <Chip
                key={index}
                style={[styles.bodyPartChip, { backgroundColor: routine.color + '15' }]}
                textStyle={{ color: routine.color, fontSize: 12 }}
                compact
              >
                {part}
              </Chip>
            ))}
          </View>
        </View>
        
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionLabel}>Benefits:</Text>
          <View style={styles.benefitsList}>
            {routine.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.routineActions}>
          <Button
            mode="contained"
            onPress={() => handleStartRoutine(routine)}
            style={[styles.actionButton, { backgroundColor: routine.color }]}
            labelStyle={styles.actionButtonText}
            disabled={!!activeRoutine}
          >
            {activeRoutine ? 'Routine Active' : 'Start Routine'}
          </Button>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Preview', 'Exercise preview coming soon!')}
            style={styles.actionButton}
            textColor={routine.color}
          >
            Preview
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={[TEXT_STYLES.h3, styles.quickActionsTitle]}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setShowModal(true)}
        >
          <Icon name="info" size={32} color={COLORS.mobility} />
          <Text style={styles.quickActionText}>Learn Types</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Assessment', 'Mobility assessment coming soon!')}
        >
          <Icon name="assessment" size={32} color={COLORS.primary} />
          <Text style={styles.quickActionText}>Assessment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Custom Plan', 'Custom routine builder coming soon!')}
        >
          <Icon name="build" size={32} color={COLORS.success} />
          <Text style={styles.quickActionText}>Custom Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('Progress', 'Progress tracking coming soon!')}
        >
          <Icon name="trending-up" size={32} color={COLORS.warning} />
          <Text style={styles.quickActionText}>Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExerciseTypesModal = () => (
    <Portal>
      <Modal 
        visible={showModal} 
        onDismiss={() => setShowModal(false)}
        contentContainerStyle={styles.modalContent}
      >
        <View style={styles.modalHeader}>
          <Text style={[TEXT_STYLES.h3, styles.modalTitle]}>Exercise Types</Text>
          <IconButton
            icon="close"
            onPress={() => setShowModal(false)}
          />
        </View>
        <Divider />
        <ScrollView style={styles.modalBody}>
          {mobilityData.exerciseTypes.map((type) => (
            <Card key={type.id} style={styles.typeCard}>
              <Card.Content>
                <View style={styles.typeHeader}>
                  <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
                    <View style={[styles.colorDot, { backgroundColor: type.color }]} />
                  </View>
                  <Text style={[TEXT_STYLES.body, styles.typeName]}>{type.name}</Text>
                </View>
                <Text style={styles.typeDescription}>{type.description}</Text>
                <View style={styles.typeDetails}>
                  <View style={styles.typeDetail}>
                    <Icon name="timer" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.typeDetailText}>Duration: {type.duration}</Text>
                  </View>
                  <View style={styles.typeDetail}>
                    <Icon name="fitness-center" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.typeDetailText}>Best for: {type.bestFor}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );

  const filteredRoutines = mobilityData.routines.filter(routine => {
    const matchesCategory = selectedCategory === 'all' || routine.category === selectedCategory;
    const matchesSearch = routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routine.bodyParts.some(part => part.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.mobility]}
            tintColor={COLORS.mobility}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: animatedValue,
              transform: [
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {renderHeader()}
          {renderSearchAndFilters()}
          
          <View style={styles.mainContent}>
            <View style={styles.section}>
              <Text style={[TEXT_STYLES.h2, styles.sectionTitle]}>Mobility Routines</Text>
              {filteredRoutines.map(renderRoutineCard)}
            </View>
            
            {renderQuickActions()}
          </View>
        </Animated.View>
      </ScrollView>
      
      {renderExerciseTypesModal()}
      
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => Alert.alert('Create Routine', 'Custom routine builder coming soon!')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: StatusBar.currentHeight + SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 16,
    marginBottom: SPACING.lg,
  },
  dailyGoalCard: {
    width: width - SPACING.lg * 2,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    marginBottom: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  goalTitle: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  streakText: {
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  goalProgress: {
    alignItems: 'center',
  },
  goalTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  goalProgressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  activeRoutineCard: {
    width: width - SPACING.lg * 2,
    padding: SPACING.md,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: COLORS.success + '10',
    borderWidth: 2,
    borderColor: COLORS.success + '30',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  activeRoutineTitle: {
    flex: 1,
    fontWeight: '600',
    color: COLORS.text,
  },
  currentExercise: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  exerciseTimer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  exerciseProgress: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  restIndicator: {
    textAlign: 'center',
    color: COLORS.warning,
    fontWeight: '600',
    marginTop: SPACING.sm,
  },
  searchSection: {
    padding: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  filterContainer: {
    paddingHorizontal: SPACING.xs,
  },
  filterChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  filterChipSelected: {
    backgroundColor: COLORS.mobility,
  },
  filterChipText: {
    color: COLORS.textSecondary,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  mainContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  routineCard: {
    marginBottom: SPACING.md,
    elevation: 2,
    borderRadius: 16,
  },
  routineInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  routineIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  routineDetails: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  routineTitle: {
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  routineMeta: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: SPACING.xs,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  completions: {
    marginLeft: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  sectionLabel: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  bodyPartsSection: {
    marginBottom: SPACING.md,
  },
  benefitsSection: {
    marginBottom: SPACING.lg,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  bodyPartChip: {
    marginBottom: SPACING.xs,
  },
  benefitsList: {
    gap: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitText: {
    color: COLORS.text,
    fontSize: 14,
  },
  routineActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonText: {
    color: '#fff',
  },
  quickActions: {
    marginBottom: SPACING.xl,
  },
  quickActionsTitle: {
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: (width - SPACING.md * 3) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    height: 100,
  },
  quickActionText: {
    marginTop: SPACING.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.mobility,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: 16,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalTitle: {
    color: COLORS.text,
  },
  modalBody: {
    padding: SPACING.md,
  },
  typeCard: {
    marginBottom: SPACING.md,
    elevation: 1,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  typeName: {
    fontWeight: '600',
    color: COLORS.text,
  },
  typeDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  typeDetails: {
    gap: SPACING.sm,
  },
  typeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typeDetailText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});

export default MobilityRoutines;