import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  RefreshControl,
  Animated,
  Vibration,
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
  Text,
  TextInput,
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { BlurView } from 'expo-blur';

// Import your established constants
const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TEXT_STYLES = {
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subheading: {
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

const GOAL_CATEGORIES = [
  { id: 'strength', label: 'Strength 💪', icon: 'fitness-center', color: '#FF6B6B' },
  { id: 'cardio', label: 'Cardio ❤️', icon: 'directions-run', color: '#4ECDC4' },
  { id: 'flexibility', label: 'Flexibility 🧘', icon: 'self-improvement', color: '#45B7D1' },
  { id: 'weight', label: 'Weight Loss 📉', icon: 'trending-down', color: '#96CEB4' },
  { id: 'muscle', label: 'Muscle Gain 🏋️', icon: 'fitness-center', color: '#FECA57' },
  { id: 'endurance', label: 'Endurance 🏃', icon: 'timer', color: '#FF9FF3' },
  { id: 'sport', label: 'Sport Specific ⚽', icon: 'sports-soccer', color: '#54A0FF' },
];

const TIME_FRAMES = [
  { id: '1month', label: '1 Month', days: 30 },
  { id: '3months', label: '3 Months', days: 90 },
  { id: '6months', label: '6 Months', days: 180 },
  { id: '1year', label: '1 Year', days: 365 },
];

const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner 🌱', description: 'Just starting out', color: '#4CAF50' },
  { id: 'intermediate', label: 'Intermediate 💪', description: 'Some experience', color: '#FF9800' },
  { id: 'advanced', label: 'Advanced 🔥', description: 'Experienced athlete', color: '#F44336' },
];

const GoalSetting = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const goals = useSelector(state => state.goals || []);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // State management
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Goal creation state
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: '',
    targetValue: '',
    currentValue: 0,
    unit: '',
    timeFrame: '',
    difficulty: '',
    isPublic: false,
  });

  useEffect(() => {
    // Entrance animations
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
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // dispatch(fetchUserGoals());
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh goals');
    }
    setRefreshing(false);
  }, []);

  const handleCreateGoal = useCallback(() => {
    if (!newGoal.title || !newGoal.category || !newGoal.timeFrame) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    Vibration.vibrate(50);
    
    const goalData = {
      ...newGoal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      progress: 0,
      status: 'active',
      streak: 0,
      achievements: [],
    };

    // dispatch(addGoal(goalData));
    
    setShowGoalModal(false);
    setNewGoal({
      title: '',
      description: '',
      category: '',
      targetValue: '',
      currentValue: 0,
      unit: '',
      timeFrame: '',
      difficulty: '',
      isPublic: false,
    });

    Alert.alert(
      '🎉 Goal Created!',
      'Your new fitness goal has been set. Time to crush it!',
      [{ text: 'Let\'s Go!', style: 'default' }]
    );
  }, [newGoal]);

  const renderGoalCard = (goal, index) => (
    <Animated.View
      key={goal.id}
      style={[
        styles.goalCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Card style={styles.card} elevation={4}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.goalHeaderContent}>
            <Icon name={GOAL_CATEGORIES.find(cat => cat.id === goal.category)?.icon || 'star'} 
                  size={24} color="#fff" />
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <IconButton
              icon="dots-vertical"
              iconColor="#fff"
              size={20}
              onPress={() => {
                Alert.alert('Feature Coming Soon', 'Goal management features are under development');
              }}
            />
          </View>
        </LinearGradient>
        
        <Card.Content style={styles.cardContent}>
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              Progress: {goal.currentValue || 0} / {goal.targetValue} {goal.unit}
            </Text>
            <ProgressBar 
              progress={goal.progress / 100} 
              color={COLORS.success}
              style={styles.progressBar}
            />
            <Text style={styles.progressPercentage}>{Math.round(goal.progress || 0)}% Complete</Text>
          </View>
          
          <View style={styles.goalStats}>
            <View style={styles.statItem}>
              <Icon name="timer" size={16} color={COLORS.primary} />
              <Text style={styles.statText}>{goal.timeFrame}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="whatshot" size={16} color={COLORS.error} />
              <Text style={styles.statText}>{goal.streak || 0} day streak</Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('GoalProgress', { goalId: goal.id })}
              style={styles.actionButton}
              labelStyle={styles.buttonLabel}
            >
              Update Progress
            </Button>
            <IconButton
              icon="share"
              size={20}
              onPress={() => {
                Alert.alert('Feature Coming Soon', 'Goal sharing features are under development');
              }}
            />
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderCreateGoalModal = () => (
    <Portal>
      <Modal
        visible={showGoalModal}
        onDismiss={() => setShowGoalModal(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <Text style={styles.modalTitle}>🎯 Create New Goal</Text>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput
              label="Goal Title *"
              value={newGoal.title}
              onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
              style={styles.input}
              mode="outlined"
              placeholder="e.g., Run 5K in under 25 minutes"
            />
            
            <TextInput
              label="Description"
              value={newGoal.description}
              onChangeText={(text) => setNewGoal({ ...newGoal, description: text })}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Describe your goal in detail..."
            />
            
            <Text style={styles.sectionLabel}>Category *</Text>
            <View style={styles.chipContainer}>
              {GOAL_CATEGORIES.map((category) => (
                <Chip
                  key={category.id}
                  selected={newGoal.category === category.id}
                  onPress={() => setNewGoal({ ...newGoal, category: category.id })}
                  style={[
                    styles.chip,
                    newGoal.category === category.id && { backgroundColor: category.color }
                  ]}
                  textStyle={styles.chipText}
                >
                  {category.label}
                </Chip>
              ))}
            </View>
            
            <View style={styles.inputRow}>
              <TextInput
                label="Target Value *"
                value={newGoal.targetValue}
                onChangeText={(text) => setNewGoal({ ...newGoal, targetValue: text })}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                keyboardType="numeric"
                placeholder="100"
              />
              <TextInput
                label="Unit"
                value={newGoal.unit}
                onChangeText={(text) => setNewGoal({ ...newGoal, unit: text })}
                style={[styles.input, styles.halfInput]}
                mode="outlined"
                placeholder="kg, minutes, reps"
              />
            </View>
            
            <Text style={styles.sectionLabel}>Time Frame *</Text>
            <View style={styles.chipContainer}>
              {TIME_FRAMES.map((timeFrame) => (
                <Chip
                  key={timeFrame.id}
                  selected={newGoal.timeFrame === timeFrame.label}
                  onPress={() => setNewGoal({ ...newGoal, timeFrame: timeFrame.label })}
                  style={styles.chip}
                >
                  {timeFrame.label}
                </Chip>
              ))}
            </View>
            
            <Text style={styles.sectionLabel}>Difficulty Level</Text>
            <View style={styles.chipContainer}>
              {DIFFICULTY_LEVELS.map((level) => (
                <Chip
                  key={level.id}
                  selected={newGoal.difficulty === level.id}
                  onPress={() => setNewGoal({ ...newGoal, difficulty: level.id })}
                  style={[
                    styles.chip,
                    newGoal.difficulty === level.id && { backgroundColor: level.color }
                  ]}
                >
                  {level.label}
                </Chip>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowGoalModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleCreateGoal}
                style={styles.createButton}
                loading={loading}
              >
                Create Goal
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Goals 🎯</Text>
            <Text style={styles.headerSubtitle}>
              {goals.length === 0 ? "Let's set your first goal!" : `${goals.length} active goals`}
            </Text>
          </View>
          <Avatar.Text 
            size={40} 
            label={user?.name?.charAt(0) || 'U'} 
            style={styles.avatar}
          />
        </View>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.searchContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Searchbar
          placeholder="Search your goals..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={COLORS.primary}
        />
      </Animated.View>

      <ScrollView
        style={styles.content}
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
        {goals.length === 0 ? (
          <Animated.View 
            style={[
              styles.emptyState,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Icon name="flag" size={80} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Goals Set Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first fitness goal and start your journey to success! 🚀
            </Text>
            <Button
              mode="contained"
              onPress={() => setShowGoalModal(true)}
              style={styles.emptyButton}
              icon="add"
            >
              Set Your First Goal
            </Button>
          </Animated.View>
        ) : (
          <View style={styles.goalsContainer}>
            {goals.map((goal, index) => renderGoalCard(goal, index))}
          </View>
        )}

        {/* Quick Stats Section */}
        <Animated.View 
          style={[
            styles.statsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>📊 Your Progress</Text>
          <View style={styles.statsGrid}>
            <Surface style={styles.statCard} elevation={2}>
              <Icon name="jump-rope" size={24} color={COLORS.warning} />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Goals Completed</Text>
            </Surface>
            <Surface style={styles.statCard} elevation={2}>
              <Icon name="trending-up" size={24} color={COLORS.success} />
              <Text style={styles.statNumber}>0%</Text>
              <Text style={styles.statLabel}>Average Progress</Text>
            </Surface>
            <Surface style={styles.statCard} elevation={2}>
              <Icon name="whatshot" size={24} color={COLORS.error} />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </Surface>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => {
          Vibration.vibrate(50);
          setShowGoalModal(true);
        }}
        label="New Goal"
      />

      {renderCreateGoalModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...TEXT_STYLES.heading,
    color: '#fff',
    fontSize: 28,
  },
  headerSubtitle: {
    ...TEXT_STYLES.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: SPACING.xs,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: -SPACING.md,
    marginBottom: SPACING.md,
  },
  searchBar: {
    elevation: 4,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  goalCard: {
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: SPACING.md,
  },
  goalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalTitle: {
    ...TEXT_STYLES.subheading,
    color: '#fff',
    flex: 1,
    marginLeft: SPACING.sm,
  },
  cardContent: {
    padding: SPACING.md,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressLabel: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    ...TEXT_STYLES.caption,
    textAlign: 'right',
    fontWeight: '600',
    color: COLORS.success,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TEXT_STYLES.caption,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  buttonLabel: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    ...TEXT_STYLES.heading,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...TEXT_STYLES.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },
  emptyButton: {
    paddingHorizontal: SPACING.lg,
  },
  statsSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TEXT_STYLES.subheading,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    margin: SPACING.xs,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  statNumber: {
    ...TEXT_STYLES.heading,
    fontSize: 20,
    marginTop: SPACING.xs,
    color: COLORS.primary,
  },
  statLabel: {
    ...TEXT_STYLES.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  goalsContainer: {
    paddingBottom: SPACING.md,
  },
  fab: {
    position: 'absolute',
    margin: SPACING.md,
    right: 0,
    bottom: 20,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    ...TEXT_STYLES.heading,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  input: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  sectionLabel: {
    ...TEXT_STYLES.subheading,
    fontSize: 16,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  chip: {
    margin: SPACING.xs / 2,
  },
  chipText: {
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  cancelButton: {
    flex: 0.45,
  },
  createButton: {
    flex: 0.45,
  },
});

export default GoalSetting;