import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert,
  Vibration,
  Dimensions,
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
} from 'react-native-paper';
import { BlurView } from '../../../components/shared/BlurView';
import { LinearGradient } from '../../../components/shared/BlurView';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from '../../../components/shared/BlurView';

// Design System Constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f5f7fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 16,
    color: COLORS.text,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
};

const { width } = Dimensions.get('window');

const CircuitTraining = ({ navigation }) => {
  // Redux state
  const { user } = useSelector(state => state.auth);
  const { circuits, loading } = useSelector(state => state.workouts);
  const dispatch = useDispatch();

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerProgress, setTimerProgress] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Mock circuit data
  const [circuitWorkouts] = useState([
    {
      id: 1,
      name: 'HIIT Power Circuit',
      duration: '25 min',
      difficulty: 'Advanced',
      stations: 8,
      rounds: 3,
      exercises: [
        { name: 'Burpees', duration: '45s', rest: '15s' },
        { name: 'Mountain Climbers', duration: '45s', rest: '15s' },
        { name: 'Jump Squats', duration: '45s', rest: '15s' },
        { name: 'Push-ups', duration: '45s', rest: '15s' },
      ],
      calories: 350,
      completed: 87,
      rating: 4.8,
      category: 'Cardio',
      equipment: ['Bodyweight'],
    },
    {
      id: 2,
      name: 'Strength Circuit',
      duration: '35 min',
      difficulty: 'Intermediate',
      stations: 6,
      rounds: 4,
      exercises: [
        { name: 'Deadlifts', duration: '60s', rest: '30s' },
        { name: 'Bench Press', duration: '60s', rest: '30s' },
        { name: 'Squats', duration: '60s', rest: '30s' },
        { name: 'Rows', duration: '60s', rest: '30s' },
      ],
      calories: 280,
      completed: 65,
      rating: 4.6,
      category: 'Strength',
      equipment: ['Barbell', 'Dumbbells'],
    },
    {
      id: 3,
      name: 'Beginner Circuit',
      duration: '20 min',
      difficulty: 'Beginner',
      stations: 5,
      rounds: 2,
      exercises: [
        { name: 'Wall Push-ups', duration: '30s', rest: '30s' },
        { name: 'Chair Squats', duration: '30s', rest: '30s' },
        { name: 'Standing Marches', duration: '30s', rest: '30s' },
        { name: 'Arm Circles', duration: '30s', rest: '30s' },
      ],
      calories: 120,
      completed: 45,
      rating: 4.5,
      category: 'Conditioning',
      equipment: ['Bodyweight', 'Chair'],
    },
  ]);

  const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const durations = ['All', '15-20 min', '20-30 min', '30+ min'];

  useEffect(() => {
    // Entrance animation
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const filteredCircuits = circuitWorkouts.filter(circuit => {
    const matchesSearch = circuit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || circuit.difficulty === selectedDifficulty;
    const matchesDuration = selectedDuration === 'All' || 
      (selectedDuration === '15-20 min' && parseInt(circuit.duration) <= 20) ||
      (selectedDuration === '20-30 min' && parseInt(circuit.duration) > 20 && parseInt(circuit.duration) <= 30) ||
      (selectedDuration === '30+ min' && parseInt(circuit.duration) > 30);
    
    return matchesSearch && matchesDifficulty && matchesDuration;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return COLORS.success;
      case 'Intermediate': return COLORS.warning;
      case 'Advanced': return COLORS.error;
      default: return COLORS.primary;
    }
  };

  const startCircuit = (circuit) => {
    Vibration.vibrate(50);
    Alert.alert(
      '🚀 Start Circuit Training',
      `Ready to begin "${circuit.name}"?\n\n⏱️ Duration: ${circuit.duration}\n🔥 Estimated calories: ${circuit.calories}\n💪 ${circuit.stations} stations, ${circuit.rounds} rounds`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Workout 💪',
          onPress: () => navigation.navigate('WorkoutSession', { workout: circuit, type: 'circuit' }),
        },
      ]
    );
  };

  const previewCircuit = (circuit) => {
    navigation.navigate('WorkoutPreview', { workout: circuit, type: 'circuit' });
  };

  const createCustomCircuit = () => {
    Vibration.vibrate(50);
    setShowCreateModal(false);
    Alert.alert(
      '🛠️ Circuit Builder',
      'Create your custom circuit training workout with our AI-powered builder!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Build Circuit 🎯',
          onPress: () => navigation.navigate('CircuitBuilder'),
        },
      ]
    );
  };

  const renderStatsCard = () => (
    <Surface style={styles.statsCard}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.statsGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="timer" size={24} color="white" />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Circuits Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="local-fire-department" size={24} color="white" />
            <Text style={styles.statValue}>2.8K</Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Icon name="trending-up" size={24} color="white" />
            <Text style={styles.statValue}>85%</Text>
            <Text style={styles.statLabel}>Completion Rate</Text>
          </View>
        </View>
      </LinearGradient>
    </Surface>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={[TEXT_STYLES.subtitle, { marginBottom: SPACING.md }]}>
        ⚡ Quick Actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsScroll}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.quickActionGradient}
          >
            <Icon name="add-circle" size={32} color="white" />
            <Text style={styles.quickActionText}>Create Circuit</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => Alert.alert('🎯 AI Coach', 'AI will analyze your performance and suggest optimal circuit training plans!')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.quickActionGradient}
          >
            <Icon name="psychology" size={32} color="white" />
            <Text style={styles.quickActionText}>AI Recommendations</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('WorkoutHistory', { type: 'circuit' })}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.quickActionGradient}
          >
            <Icon name="history" size={32} color="white" />
            <Text style={styles.quickActionText}>History</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderFilterChips = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          <Text style={styles.filterLabel}>Difficulty:</Text>
          {difficultyLevels.map((level) => (
            <Chip
              key={level}
              selected={selectedDifficulty === level}
              onPress={() => setSelectedDifficulty(level)}
              style={[
                styles.filterChip,
                selectedDifficulty === level && { backgroundColor: COLORS.primary }
              ]}
              textStyle={selectedDifficulty === level && { color: 'white' }}
            >
              {level}
            </Chip>
          ))}
        </View>
        <View style={styles.chipRow}>
          <Text style={styles.filterLabel}>Duration:</Text>
          {durations.map((duration) => (
            <Chip
              key={duration}
              selected={selectedDuration === duration}
              onPress={() => setSelectedDuration(duration)}
              style={[
                styles.filterChip,
                selectedDuration === duration && { backgroundColor: COLORS.primary }
              ]}
              textStyle={selectedDuration === duration && { color: 'white' }}
            >
              {duration}
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderCircuitCard = (circuit) => (
    <Card key={circuit.id} style={styles.circuitCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Avatar.Icon
            size={50}
            icon="timer"
            style={[styles.circuitAvatar, { backgroundColor: getDifficultyColor(circuit.difficulty) }]}
          />
          <View style={styles.cardHeaderText}>
            <Text style={TEXT_STYLES.subtitle}>{circuit.name}</Text>
            <View style={styles.cardMetrics}>
              <Icon name="schedule" size={16} color={COLORS.textSecondary} />
              <Text style={styles.metricText}>{circuit.duration}</Text>
              <Icon name="fitness-center" size={16} color={COLORS.textSecondary} style={{ marginLeft: SPACING.sm }} />
              <Text style={styles.metricText}>{circuit.stations} stations</Text>
            </View>
          </View>
        </View>
        <Chip
          style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(circuit.difficulty) }]}
          textStyle={{ color: 'white', fontSize: 12 }}
        >
          {circuit.difficulty}
        </Chip>
      </View>

      <View style={styles.cardStats}>
        <View style={styles.statRow}>
          <View style={styles.statColumn}>
            <Icon name="local-fire-department" size={18} color={COLORS.error} />
            <Text style={styles.statText}>{circuit.calories} cal</Text>
          </View>
          <View style={styles.statColumn}>
            <Icon name="loop" size={18} color={COLORS.primary} />
            <Text style={styles.statText}>{circuit.rounds} rounds</Text>
          </View>
          <View style={styles.statColumn}>
            <Icon name="star" size={18} color={COLORS.warning} />
            <Text style={styles.statText}>{circuit.rating}</Text>
          </View>
          <View style={styles.statColumn}>
            <Icon name="people" size={18} color={COLORS.success} />
            <Text style={styles.statText}>{circuit.completed}</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Completion Rate</Text>
          <ProgressBar
            progress={circuit.completed / 100}
            color={COLORS.success}
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>{circuit.completed}%</Text>
        </View>
      </View>

      <View style={styles.exercisePreview}>
        <Text style={styles.exercisePreviewTitle}>🏃‍♂️ Sample Exercises:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {circuit.exercises.slice(0, 3).map((exercise, index) => (
            <Chip key={index} style={styles.exerciseChip}>
              {exercise.name}
            </Chip>
          ))}
          {circuit.exercises.length > 3 && (
            <Chip style={[styles.exerciseChip, { backgroundColor: COLORS.primary }]} textStyle={{ color: 'white' }}>
              +{circuit.exercises.length - 3} more
            </Chip>
          )}
        </ScrollView>
      </View>

      <View style={styles.cardActions}>
        <Button
          mode="outlined"
          onPress={() => previewCircuit(circuit)}
          style={styles.previewButton}
          icon="visibility"
        >
          Preview
        </Button>
        <Button
          mode="contained"
          onPress={() => startCircuit(circuit)}
          style={styles.startButton}
          icon="play-arrow"
          buttonColor={COLORS.primary}
        >
          Start Workout 💪
        </Button>
      </View>
    </Card>
  );

  const renderCreateModal = () => (
    <Portal>
      <Modal
        visible={showCreateModal}
        onDismiss={() => setShowCreateModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <BlurView style={styles.blurBackground} blurType="light" blurAmount={10} />
        <Surface style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={TEXT_STYLES.title}>🛠️ Create Circuit</Text>
            <IconButton
              icon="close"
              onPress={() => setShowCreateModal(false)}
            />
          </View>
          
          <View style={styles.modalOptions}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={createCustomCircuit}
              activeOpacity={0.7}
            >
              <Icon name="build" size={32} color={COLORS.primary} />
              <Text style={styles.modalOptionTitle}>Custom Builder</Text>
              <Text style={styles.modalOptionDescription}>
                Create from scratch with our drag & drop builder
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowCreateModal(false);
                Alert.alert('🤖 AI Circuit Generator', 'AI will create a personalized circuit based on your goals and preferences!');
              }}
              activeOpacity={0.7}
            >
              <Icon name="auto-awesome" size={32} color={COLORS.success} />
              <Text style={styles.modalOptionTitle}>AI Generated</Text>
              <Text style={styles.modalOptionDescription}>
                Let AI create the perfect circuit for you
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowCreateModal(false);
                navigation.navigate('CircuitTemplates');
              }}
              activeOpacity={0.7}
            >
              <Icon name="library-books" size={32} color={COLORS.warning} />
              <Text style={styles.modalOptionTitle}>Use Template</Text>
              <Text style={styles.modalOptionDescription}>
                Start with proven circuit templates
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>⚡ Circuit Training</Text>
        <Text style={styles.headerSubtitle}>High-intensity interval workouts</Text>
      </LinearGradient>

      <Animated.ScrollView
        style={[
          styles.scrollView,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
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
        {renderStatsCard()}
        {renderQuickActions()}

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search circuits..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            icon="search"
            clearIcon="close"
          />
        </View>

        {renderFilterChips()}

        <View style={styles.circuitsSection}>
          <View style={styles.sectionHeader}>
            <Text style={TEXT_STYLES.title}>🏃‍♂️ Available Circuits</Text>
            <Text style={styles.resultsCount}>
              {filteredCircuits.length} circuit{filteredCircuits.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {filteredCircuits.length > 0 ? (
            filteredCircuits.map(renderCircuitCard)
          ) : (
            <Card style={styles.emptyStateCard}>
              <View style={styles.emptyState}>
                <Icon name="search-off" size={64} color={COLORS.textSecondary} />
                <Text style={styles.emptyStateTitle}>No Circuits Found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search or filters
                </Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedDifficulty('All');
                    setSelectedDuration('All');
                  }}
                  style={styles.resetButton}
                >
                  Reset Filters
                </Button>
              </View>
            </Card>
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => setShowCreateModal(true)}
        color="white"
      />

      {renderCreateModal()}
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
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    ...TEXT_STYLES.title,
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 15,
    elevation: 4,
  },
  statsGradient: {
    padding: SPACING.lg,
    borderRadius: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: SPACING.xs,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: SPACING.sm,
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  quickActionsScroll: {
    flexDirection: 'row',
  },
  quickActionCard: {
    marginRight: SPACING.md,
    borderRadius: 15,
  },
  quickActionGradient: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 120,
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontSize: 12,
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  searchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
  },
  filtersContainer: {
    marginBottom: SPACING.lg,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginRight: SPACING.sm,
    minWidth: 60,
  },
  filterChip: {
    marginRight: SPACING.sm,
  },
  circuitsSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  resultsCount: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
  },
  circuitCard: {
    marginBottom: SPACING.lg,
    borderRadius: 15,
    elevation: 3,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circuitAvatar: {
    marginRight: SPACING.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  metricText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
  },
  difficultyChip: {
    marginLeft: SPACING.sm,
  },
  cardStats: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    ...TEXT_STYLES.caption,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    ...TEXT_STYLES.caption,
    marginTop: SPACING.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  exercisePreview: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  exercisePreviewTitle: {
    ...TEXT_STYLES.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  exerciseChip: {
    marginRight: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.lg,
    paddingTop: 0,
  },
  previewButton: {
    flex: 0.4,
    borderColor: COLORS.primary,
  },
  startButton: {
    flex: 0.55,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.lg,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyStateCard: {
    borderRadius: 15,
    backgroundColor: COLORS.surface,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyStateTitle: {
    ...TEXT_STYLES.subtitle,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resetButton: {
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptions: {
    padding: SPACING.lg,
  },
  modalOption: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalOptionTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  modalOptionDescription: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptions: {
    padding: SPACING.lg,
  },
  modalOption: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 15,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  modalOptionTitle: {
    ...TEXT_STYLES.subtitle,
    fontSize: 16,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOptionDescription: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    lineHeight: 18,
  },
});

export default CircuitTraining;